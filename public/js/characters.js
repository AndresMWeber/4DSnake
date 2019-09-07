class Snake {
    constructor() {
        this.dirs = ['x', 'y', 'z']
        this.moveQueue = []

        this.speed = DEFAULT_SPEED
        this.moveTicker = 0
        this.lastPosition = [0, 0, 0]
        this.position = [0, 0, 0]

        this.canPitchUp = true
        this.canPitchDown = true
        this.hasEaten = false

        this.direction = [0, 0, 1]
        this.facingCamera = false
        this.rotateEuler = new THREE.Euler()
        this.rotateQuaternion = new THREE.Quaternion
        this.wpVector = new THREE.Vector3()
        this.facingVector = new THREE.Vector3(0, 0, 1)
        this.cameraVector = new THREE.Vector3(0, 0, -1)

        this.tail = new Tail()
        this.compass = new Compass()
        this.buildModel()
    }

    buildModel() {
        this.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.mesh = new THREE.Mesh(this.geometry, tjs_materials.collider)

        let scope = this
        loader.load('models/snakeHeadAnim.fbx', function(object) {
            // mixer = new THREE.AnimationMixer(object);
            // var action = mixer.clipAction(object.animations[0]);
            // action.play();
            object.traverse(child => {
                let material = snakeMaterialsLookup[child.name]
                if (material) child.material = material
                child.scale.set(1.2, 1.2, 1.2)
            })
            scope.mesh.add(object)
        })
    }

    addMove(moveFunction) {
        this.moveQueue.length === 2 && this.moveQueue.shift()
        this.moveQueue.push(moveFunction)
    }

    makeMove() {
        this.direction.map((dirNormal, i) => {
            if (dirNormal) {
                this.mesh.position[this.dirs[i]] = THREE.Math.clamp(this.mesh.position[this.dirs[i]] + this.speed * dirNormal, -BOARD_OFFSET, BOARD_OFFSET)
            }
        })
        this.moveTicker += 1
    }

    executeMoveFromQueue() {
        this.moveQueue.shift()()
    }

    makeTurn(euler) {
        this.speed = DEFAULT_SPEED
        this.mesh.rotation.setFromQuaternion(this.mesh.quaternion.multiply(this.rotateQuaternion.setFromEuler(euler)))
        game.debugRight(`Made turn on position ${printFloatArray(this.mesh.position.toArray())}<br>canMove?:${this.moveTicker%MOVE_TICKER_COMPARE ? false : true}`)
    }

    pitchUp() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.up[Number(Math.round(this.direction[1]) !== 1)]))
        this.compass.highlight('arrowU')
    }

    pitchDown() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.down[Number(Math.round(this.direction[1]) !== -1)]))
        this.compass.highlight('arrowD')
    }

    left() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.left[Math.round(this.direction[1])]))
        this.compass.highlight('arrowL')
    }

    right() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.right[Math.round(this.direction[1])]))
        this.compass.highlight('arrowR')
    }

    rollLeft() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.rollL))
    }

    rollRight() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.rollR))
    }

    reset() {
        this.mesh.position.set(0, 0, 0)
    }

    update(delta) {
        this.updatePositionInfo()
        this.onValidGridMove()
        this.makeMove()
        this.compass.move(this.mesh)
        this.tail.update()
    }

    updatePositionInfo() {
        this.mesh.getWorldDirection(this.wpVector)
        let position = this.mesh.position.toArray()
        this.tail.trailInterpolated.push(position)
        this.position = (position.map(p => Math.floor(p + .1)))
        this.direction = this.wpVector.toArray()
    }

    onValidGridMove() {
        if (this.moveTicker % MOVE_TICKER_COMPARE === 0) {
            this.moveQueue.length && this.executeMoveFromQueue()
            game.debugLeft(`Snake Direction: (${printFloatArray(this.direction)}<br>(Snake Position:(${printFloatArray(this.position)})<br>moveQueue:${this.moveQueue.length}<br>trail:${JSON.stringify(this.tail.trail)}<br>canMove?:${Math.floor(this.moveTicker%MOVE_TICKER_COMPARE/10)}<br>canPitchUp:${this.canPitchUp} canPitchDown:${this.canPitchDown}`)
            if (!arrayCompare(this.position, this.lastPosition)) {
                this.lastPosition = [...this.position]
                this.tail.update() && this.hasEaten && this.tail.add()
            }
        }
    }
}

class Compass {
    constructor() {
        this.group = new THREE.Group();
        this.arrowU = this.buildCurveFromCoordinates(letters['w'])
        this.arrowL = this.buildCurveFromCoordinates(letters['a'])
        this.arrowD = this.buildCurveFromCoordinates(letters['s'])
        this.arrowR = this.buildCurveFromCoordinates(letters['d'])
        this.vector = new THREE.Vector3()
        this.orient()
        tjs_scene.add(this.group)
    }

    buildCurveFromCoordinates(coordinates) {
        var geometry = new THREE.Geometry()
        coordinates.map(pos => geometry.vertices.push(new THREE.Vector3(...pos)))
        var line = new THREE.Line(geometry, tjs_materials.arrow)
        line.scale.set(.2, .2, .2)
        this.group.add(line)
        return line
    }

    highlight(arrowName) {
        let arrow = this[arrowName]
        arrow.material = tjs_materials.arrow_highlight
        setTimeout(arrow => {
            arrow.material = tjs_materials.arrow
        }, 200, arrow)
    }

    orient() {
        this.arrowD.position.y = -1
        this.arrowU.position.y = 1
        this.arrowL.position.x = 1
        this.arrowR.position.x = -1
        this.arrowD.rotation.z = Math.PI
    }

    move(referenceXform) {
        referenceXform.getWorldPosition(this.vector)
        this.group.position.copy(this.vector)
        this.group.lookAt(tjs_camera.position)

        let planeVector = (new THREE.Vector3(0, 0, 1)).applyQuaternion(referenceXform.quaternion);
        let cameraVector = (new THREE.Vector3(0, 0, -1)).applyQuaternion(tjs_camera.quaternion);
        this.facingCamera = (planeVector.angleTo(cameraVector) > (3 * Math.PI) / 4)

        if (CLOCK.elapsedTime > 15 && tjs_materials.arrow.opacity) tjs_materials.arrow.opacity -= .01
        if (this.facingCamera) {
            this.arrowL.position.x = 1
            this.arrowR.position.x = -1
        } else {
            this.arrowL.position.x = -1
            this.arrowR.position.x = 1
        }
    }
}

class Tail {
    constructor() {
        this.tail = []
        this.trail = []
        this.trailInterpolated = []
    }

    reset() {
        this.tail.map(tailSection => tjs_scene.remove(tailSection))
        this.tail = []
        this.trail = []
        this.trailInterpolated = []
    }

    add() {
        let tailShape = new THREE.BoxBufferGeometry(.95, .95, .95)
        let tailXform = new THREE.Mesh(tailShape, tjs_materials.dark_orange)
        tailXform.position.set(...this.lastPosition)
        tjs_scene.add(tailXform)
        this.tail.push(tailXform)
        this.hasEaten = false
    }

    update() {
        this.tail.map((tail, i) => {
            tail.position.set(...this.trail[i])
            arrayCompare(this.position, this.trail[i]) && i != this.trail.length - 1 && game.setGameOver()
        })
    }

    updateTrail() {
        if (this.trail.every(trail => !arrayCompare(trail, this.position))) {
            this.trail.push(this.position)
            if (this.trail.length > this.tail.length + 1) this.trail.shift()
        }
        return this.trail
    }
}