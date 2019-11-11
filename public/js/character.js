class Snake {
    constructor() {
        this.dirs = ['x', 'y', 'z']
        this.fbxScale = 1
        this.colliderScale = .4

        this.rotateEuler = new THREE.Euler()
        this.rotateQuaternion = new THREE.Quaternion()
        this.wpVector = new THREE.Vector3()
        this.facingVector = new THREE.Vector3(0, 0, 1)
        this.cameraVector = new THREE.Vector3(0, 0, -1)

        this.buildModel()
        this.initialize()
        this.tail = new Tail()
        this.compass = new Compass()
    }

    initialize() {
        this.speed = DEFAULT_SPEED
        this.moveTicker = 0
        this.moveQueue = []
        this.mesh.position.set(...[0, 0, 0])
        this.lastPosition = [0, 0, 0]
        this.position = [0, 0, 0]
        this.direction = [0, 0, 1]

        this.autoRedirect = false
        this.hasEaten = false

        this.facingCamera = false
    }

    buildModel() {
        this.geometry = new THREE.BoxGeometry(this.colliderScale, this.colliderScale, this.colliderScale)
        this.mesh = new THREE.Mesh(this.geometry, tjs_materials.collider)
        this.mesh.name = "Player"

        let scope = this
        loader.load('../models/snakeHeadBlock.fbx', object => {
                object.traverse(child => {
                    let material = snakeMaterialsLookup[child.name]
                    if (material) child.material = material
                    child.scale.set(this.fbxScale, this.fbxScale, this.fbxScale)
                })
                scope.mesh.add(object)
            },
            progress => console.log(progress),
            error => console.error('Error loading snake:', error))
        tjs_scene.add(this.mesh)
    }

    makeTurn(euler) {
        this.speed = DEFAULT_SPEED
        this.mesh.rotation.setFromQuaternion(this.mesh.quaternion.multiply(this.rotateQuaternion.setFromEuler(euler)))
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

    addMove(moveFunction) {
        this.moveQueue.length === 2 && this.moveQueue.shift()
        this.moveQueue.push(moveFunction)
    }

    move() {
        this.direction.map((dirNormal, i) => {
            if (dirNormal) {
                let newPosition = this.mesh.position[this.dirs[i]] + this.speed * dirNormal
                let offset = (i === 1) ? level.size.vertCenter : level.size.horizCenter
                this.mesh.position[this.dirs[i]] = THREE.Math.clamp(newPosition, -offset, offset)

                // TODO: Implement this...right
                if (this.autoRedirect &&
                    ((i !== 1 && newPosition >= level.size.horizCenter || newPosition <= -level.horizCenter) ||
                        (i === 1 && newPosition >= level.size.vertCenter || newPosition <= -level.vertCenter))) {
                    [this.right, this.left, this.pitchDown, this.pitchUp][Math.floor(Math.random() * ((level.size.y === 1) ? 2 : 4))].bind(this)()
                }
            }
        })
        this.moveTicker += 1
    }

    executeMoveFromQueue() {
        this.moveQueue.shift()()
    }

    update() {
        this.updatePositionInfo()
        this.moveOnValidGridSpace()
        this.move()
        this.tail.update()
        this.tail.move()
    }

    updatePositionInfo() {
        let position = this.mesh.position.toArray()
        this.position = (position.map(p => Math.floor(p + .1)))
        this.mesh.getWorldDirection(this.wpVector)
        this.direction = this.wpVector.toArray()
    }

    moveOnValidGridSpace() {
        if (this.moveTicker % MOVE_TICKER_COMPARE === 0) {
            this.moveQueue.length && this.executeMoveFromQueue()
            if (!arrayCompare(this.position, this.lastPosition)) {
                this.lastPosition = [...this.position]
                this.tail.updateTrailRounded()
                this.hasEaten && this.tail.add(this.lastPosition)
            }
        }
    }

    reset() {
        this.initialize()
        this.tail.reset()
        this.compass.reset()
    }
}


class Tail {
    constructor() {
        this.vertebra = new THREE.Mesh(new THREE.BoxBufferGeometry(.95, .95, .95), tjs_materials.snake_body)
        let scope = this
        loader.load('./models/snakeSection.fbx', object => {
            scope.vertebra.add(object)
        })
        this.vertebrae = []
        this.trailRounded = []
        this.trailInterpolated = []
        this.tolerance = 0.001
        this.transparent = true
    }

    reset() {
        this.trailRounded = []
        this.trailInterpolated = []
        this.vertebrae.map((vertebra, i) => {
            vertebra.material = tjs_materials.snake_body
            setTimeout(() => vertebra.position.set(i - Math.floor((this.vertebrae.length || 1) / 2), 0, -level.size.horizCenter - 1), 100)
        })
        if (!game.hardcoreMode) this.resetTrail()
    }

    resetTrail() {
        this.vertebrae.map(vertebra => tjs_scene.remove(vertebra))
        this.vertebrae = []
    }

    add() {
        let vertebra = this.vertebra.clone()
        this.vertebrae.push(vertebra)
        player.hasEaten = false
        tjs_scene.add(vertebra)
        this.vertebra.name = `tail${String(this.vertebrae.length).padStart(2, '0')}`

        this.update()
        this.move()
    }

    move() {
        if (!arrayCompareClose(player.mesh.position.toArray(), player.lastPosition, this.tolerance) && this.vertebrae.length) {
            this.vertebrae.map((tail, i) => {
                if (this.trailInterpolated[(i + 1) * MOVE_TICKER_COMPARE]) {
                    let trailValue = this.trailInterpolated[(i + 1) * MOVE_TICKER_COMPARE]
                    tail.position.set(...trailValue[0])
                    tail.quaternion.copy(trailValue[1])
                }
                if (tail.transparent) tail.material = tjs_materials.snake_body
            })
        }
    }

    updateTrailRounded() {
        if (this.vertebrae.length) {
            this.trailRounded.push(player.position)
            this.trailRounded.length > this.vertebrae.length + 1 && this.trailRounded.shift()
            this.trailRounded.length = this.vertebrae.length + 1
        }
    }

    update() {
        if (!arrayCompareClose(player.mesh.position.toArray(), player.lastPosition, this.tolerance)) {
            this.trailInterpolated.push([player.mesh.position.toArray(), player.mesh.quaternion.clone()])
            this.trailInterpolated.length > (this.vertebrae.length + 1) * MOVE_TICKER_COMPARE && this.trailInterpolated.shift()
            this.trailInterpolated.length = (this.vertebrae.length + 1) * MOVE_TICKER_COMPARE
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
        tjs_materials.arrow.depthTest = false
        tjs_materials.arrow_highlight.depthTest = false
        tjs_scene.add(this.group)
        this.group.name = 'compass_GRP'
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
        this.arrowL.position.x = 1.5
        this.arrowR.position.x = -1.5
        this.arrowL.position.y = -.2
        this.arrowR.position.y = -.2
        this.arrowD.rotation.z = Math.PI
    }

    reset() {
        this.group.position.set(0, 0, 0)
    }

    move() {
        player.mesh.getWorldPosition(this.vector)
        this.group.position.copy(this.vector)
        this.group.lookAt(tjs_camera.position)

        let planeVector = (new THREE.Vector3(0, 0, 1)).applyQuaternion(player.mesh.quaternion);
        let cameraVector = (new THREE.Vector3(0, 0, -1)).applyQuaternion(tjs_camera.quaternion);
        this.facingCamera = (planeVector.angleTo(cameraVector) > (3 * Math.PI) / 4)

        if (CLOCK.elapsedTime > 15 && tjs_materials.arrow.opacity) tjs_materials.arrow.opacity -= .01
        this.arrowL.position.x = this.facingCamera ? 1.2 : -1.2
        this.arrowR.position.x = this.facingCamera ? -1.2 : 1.2
    }
}