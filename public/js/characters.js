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
        this.direction = [0, 0, 1]
        this.wpVector = new THREE.Vector3()
        this.rotateEuler = new THREE.Euler()

        this.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.mesh = new THREE.Mesh(this.geometry, mat_collider)
        this.mesh.castShadow = true

        let scope = this
        loader.load('models/snakeHeadAnim.fbx', function(object) {
            // mixer = new THREE.AnimationMixer(object);
            // var action = mixer.clipAction(object.animations[0]);
            // action.play();

            object.traverse(child => {
                let material = snakeMaterialsLookup[child.name]
                if (material) child.material = material
            })
            scope.mesh.add(object)
        })
    }

    makeTurn(euler) {
        this.speed = DEFAULT_SPEED
        let quat = new THREE.Quaternion
        this.mesh.rotation.setFromQuaternion(this.mesh.quaternion.multiply(quat.setFromEuler(euler)))
        console.log('ROTATED')
    }

    pitchDown() {
        this.addMove(this.rotateEuler.fromArray([(this.canPitchDown ? 1 : -1) * Math.PI / 2, 0, 0, "ZXY"]))
        this.canPitchDown = !this.canPitchDown || !this.canPitchUp
        this.canPitchUp = true
    }

    pitchUp() {
        this.addMove(this.rotateEuler.fromArray([(this.canPitchUp ? -1 : 1) * Math.PI / 2, 0, 0, "ZXY"]))
        this.canPitchUp = !this.canPitchUp || !this.canPitchDown
        this.canPitchDown = true
    }

    left() {
        if (this.canPitchDown && this.canPitchUp) this.addMove(this.rotateEuler.fromArray([0, Math.PI / 2, 0, "ZXY"]))
    }

    right() {
        if (this.canPitchDown && this.canPitchUp) this.addMove(this.rotateEuler.fromArray([0, -Math.PI / 2, 0, "ZXY"]))
    }

    rollLeft(force) {
        let euler = this.rotateEuler.fromArray([0, 0, -Math.PI / 2, "ZXY"])
        if (force) this.makeTurn(euler)
        else this.addMove(euler)
    }

    rollRight(force) {
        let euler = this.rotateEuler.fromArray([0, 0, Math.PI / 2, "ZXY"])
        if (force) this.makeTurn(euler)
        else this.addMove(euler)
    }

    addMove(euler) {
        if (this.moveQueue.length === 2) {
            this.moveQueue.shift()
        }
        this.moveQueue.push(euler)
    }

    makeMove() {
        this.mesh.getWorldDirection(this.wpVector)
        this.direction = this.wpVector.toArray()

        this.direction.map((dirNormal, i) => {
            if (dirNormal) {
                this.mesh.position[this.dirs[i]] = this.mesh.position[this.dirs[i]] + this.speed * dirNormal
                this.mesh.position.set(...this.mesh.position.toArray().map(pos => THREE.Math.clamp(pos, -BOARD_OFFSET, BOARD_OFFSET)))
                this.moveTicker += 1
            }
        })
    }

    validateRotateOnGrid() {
        return this.moveQueue.length && (this.moveTicker % (MOVE_TICKER_COMPARE * 2) === 0)
    }

    validateMoveOnGrid() {
        return this.moveQueue.length && (this.moveTicker % (MOVE_TICKER_COMPARE) === 0)
    }

    checkMoveQueue() {
        let euler = this.moveQueue.shift()
        this.makeTurn(euler)

    }

    addToTail() {
        let tailGeo = new THREE.BoxGeometry(1, 1, 1)
        let tailXform = new THREE.Mesh(tailGeo, mat_dark_orange)
        tailXform.position.set(...this.lastPosition)
        this.tail.push(tailXform)
        tailXform.name = `tail${this.tail.length}`
        tailXform.lifeSpan = this.tail.length
        scene.add(tailXform)
        this.hasEaten = false
    }

    update() {
        // TODO: This line is causing a bug where the position is actually offset from the real position.  Sometimes Y is 1 less and sometimes its equal.  Not sure when.
        this.position = (this.mesh.position.toArray().map(p => Math.floor(p + .1)))


        if (this.validateRotateOnGrid()) {
            this.checkMoveQueue()

            if (this.validateMoveOnGrid()) {
                if (!arrayCompare(this.position, this.lastPosition)) {
                    // Need to make sure the trail is as long as the length of items
                    this.lastPosition = [...this.position]
                    this.hasEaten && this.addToTail()

                    // Then need to add to beginning of trail list and pop off any ones that are greater than the list.
                    // Then iterate through positions and move tail list squares to that square.
                    this.tail.map(tail => {
                        tail.lifeSpan -= 1
                        tail.position.set(...this.lastPosition)
                    })
                }
            }

        }
        this.makeMove()
    }
}