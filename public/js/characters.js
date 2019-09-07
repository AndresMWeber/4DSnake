class Snake {
    constructor(material) {
        this.dirs = ['x', 'y', 'z']
        this.moveQueue = []
        this.lastPosition = [0, 0, 0]
        this.position = [0, 0, 0]
        this.speed = DEFAULT_SPEED
        this.moveTicker = 0

        this.canPitchUp = true
        this.canPitchDown = true
        this.hasEaten = false
        this.tail = []
        this.trail = []
        this.trailInterpolated = []
        this.direction = [0, 0, 1]
        this.facingCamera = false
        this.wpVector = new THREE.Vector3()
        this.arrowGroupVector = new THREE.Vector3()
        this.rotateEuler = new THREE.Euler()
        this.rotateQuaternion = new THREE.Quaternion
        this.facingVector = new THREE.Vector3(0, 0, 1)
        this.cameraVector = new THREE.Vector3(0, 0, -1)
        this.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.mesh = new THREE.Mesh(this.geometry, mat_collider)

        this.arrowGroup = new THREE.Group();
        this.arrowU = this.buildLetter('w')
        this.arrowL = this.buildLetter('a')
        this.arrowD = this.buildLetter('s')
        this.arrowR = this.buildLetter('d')
        this.orientArrows()
        scene.add(this.arrowGroup)

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

    orientArrows() {
        this.arrowD.position.y = -1
        this.arrowU.position.y = 1
        this.arrowL.position.x = 1
        this.arrowR.position.x = -1
        this.arrowD.rotation.z = Math.PI
    }

    addMove(moveFunction) {
        this.moveQueue.length === 2 && this.moveQueue.shift()
        this.moveQueue.push(moveFunction)
    }

    buildLetter(key) {
        var geometry = new THREE.Geometry()
        letters[key].map(pos => geometry.vertices.push(new THREE.Vector3(...pos)))
        var line = new THREE.Line(geometry, mat_arrow)
        line.scale.set(.2, .2, .2)
        scene.add(line)
        this.arrowGroup.add(line)
        return line
    }

    buildArrow() {
        var geometry = new THREE.Geometry()
        geometry.vertices.push(new THREE.Vector3(-7, 0, 0))
        geometry.vertices.push(new THREE.Vector3(0, 10, 0))
        geometry.vertices.push(new THREE.Vector3(7, 0, 0))
        geometry.vertices.push(new THREE.Vector3(3, 0, 0))
        geometry.vertices.push(new THREE.Vector3(3, -10, 0))
        geometry.vertices.push(new THREE.Vector3(-3, -10, 0))
        geometry.vertices.push(new THREE.Vector3(-3, 0, 0))
        geometry.vertices.push(new THREE.Vector3(-7, 0, 0))
        var line = new THREE.Line(geometry, mat_arrow)
        line.scale.set(.02, .02, .02)
        scene.add(line)
        this.arrowGroup.add(line)
        return line
    }

    highlightArrow(arrow) {
        arrow.material = mat_arrow_highlight
        setTimeout(arrow => {
            arrow.material = mat_arrow
        }, 200, arrow)
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
        gameInstance.debugRight(`Made turn on position ${printFloatArray(this.mesh.position.toArray())}<br>canMove?:${this.moveTicker%MOVE_TICKER_COMPARE ? false : true}`)
    }

    pitchUp() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.up[Number(Math.round(this.direction[1]) !== 1)]))
        this.highlightArrow(this.arrowU)
    }

    pitchDown() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.down[Number(Math.round(this.direction[1]) !== -1)]))
        this.highlightArrow(this.arrowD)
    }

    left() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.left[Math.round(this.direction[1])]))
        this.highlightArrow(this.arrowL)
    }

    right() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.right[Math.round(this.direction[1])]))
        this.highlightArrow(this.arrowR)
    }

    rollLeft() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.rollL))
    }

    rollRight() {
        this.makeTurn(this.rotateEuler.fromArray(rotationLookup.rollR))
    }

    addToTail() {
        let tailGeo = new THREE.BoxBufferGeometry(.95, .95, .95)
        let tailXform = new THREE.Mesh(tailGeo, mat_dark_orange)
        tailXform.position.set(...this.lastPosition)
        scene.add(tailXform)
        this.hasEaten = false
        this.tail.push(tailXform)
    }

    updateTail() {
        this.tail.map((tail, i) => {
            tail.position.set(...this.trail[i])
            arrayCompare(this.position, this.trail[i]) && i != this.trail.length - 1 && gameInstance.setGameOver()
        })
    }

    updateTrail() {
        if (this.trail.every(trail => !arrayCompare(trail, this.position))) {
            this.trail.push(this.position)
            if (this.trail.length > this.tail.length + 1) this.trail.shift()
        }
        return this.trail
    }

    reset() {
        this.mesh.position.set(0, 0, 0)
        this.tail.map(tailSection => scene.remove(tailSection))
        this.tail = []
        this.trail = []
        this.trailInterpolated = []
    }

    moveArrowGroup() {
        this.mesh.getWorldPosition(this.arrowGroupVector)
        this.arrowGroup.position.copy(this.arrowGroupVector)
        this.arrowGroup.lookAt(camera.position)
        let planeVector = (new THREE.Vector3(0, 0, 1)).applyQuaternion(this.mesh.quaternion);
        let cameraVector = (new THREE.Vector3(0, 0, -1)).applyQuaternion(camera.quaternion);
        this.facingCamera = (planeVector.angleTo(cameraVector) > (3 * Math.PI) / 4)
        if (CLOCK.elapsedTime > 15 && mat_arrow.opacity) mat_arrow.opacity -= .01
        if (this.facingCamera) {
            this.arrowL.position.x = 1
            this.arrowR.position.x = -1
        } else {
            this.arrowL.position.x = -1
            this.arrowR.position.x = 1
        }
    }

    update(delta) {
        this.updatePositionInfo()
        this.onValidGridMove()
        this.makeMove()
        this.moveArrowGroup()
        this.updateTail()
    }

    updatePositionInfo() {
        this.mesh.getWorldDirection(this.wpVector)
        let position = this.mesh.position.toArray()
        this.trailInterpolated.push(position)

        // TODO: This line is causing a bug where the position is actually offset from the real position.  Sometimes Y is 1 less and sometimes its equal.  Not sure when.
        this.position = (position.map(p => Math.floor(p + .1)))
        this.direction = this.wpVector.toArray()
    }

    onValidGridMove() {
        if (this.moveTicker % MOVE_TICKER_COMPARE === 0) {
            this.moveQueue.length && this.executeMoveFromQueue()
            gameInstance.debugLeft(`Snake Direction: (${printFloatArray(this.direction)}<br>(Snake Position:(${printFloatArray(this.position)})<br>moveQueue:${this.moveQueue.length}<br>trail:${JSON.stringify(this.trail)}<br>canMove?:${Math.floor(this.moveTicker%MOVE_TICKER_COMPARE/10)}<br>canPitchUp:${this.canPitchUp} canPitchDown:${this.canPitchDown}`)
            if (!arrayCompare(this.position, this.lastPosition)) {
                this.lastPosition = [...this.position]
                this.updateTrail() && this.hasEaten && this.addToTail()
            }
        }
    }
}