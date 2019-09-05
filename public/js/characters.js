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
        this.direction = [0, 0, 1]
        this.wpVector = new THREE.Vector3()
        this.rotateEuler = new THREE.Euler()
        this.rotateQuaternion = new THREE.Quaternion

        this.geometry = new THREE.BoxGeometry(1, 1, 1)
        this.mesh = new THREE.Mesh(this.geometry, mat_collider)

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

    addMove(euler) {
        this.moveQueue.length === 2 && this.moveQueue.shift()
        this.moveQueue.push(euler)
    }

    makeMove() {
        this.direction.map((dirNormal, i) => {
            if (dirNormal) {
                this.mesh.position[this.dirs[i]] = THREE.Math.clamp(this.mesh.position[this.dirs[i]] + this.speed * dirNormal, -BOARD_OFFSET, BOARD_OFFSET)
                    // this.mesh.position.set(...this.mesh.position.toArray().map(pos => ))
            }
        })
        this.moveTicker += 1
    }

    validateMoveOnGrid() {
        return this.moveTicker % MOVE_TICKER_COMPARE === 0
    }

    checkMoveQueue() {
        let euler = this.moveQueue.shift()
        this.makeTurn(euler)
    }

    makeTurn(euler) {
        this.speed = DEFAULT_SPEED
        this.mesh.rotation.setFromQuaternion(this.mesh.quaternion.multiply(this.rotateQuaternion.setFromEuler(euler)))
        $id('debugInfoR').innerHTML = `Made turn on position ${printFloatArray(this.mesh.position.toArray())}<br>canMove?:${this.moveTicker%MOVE_TICKER_COMPARE ? false : true}`
    }

    pitchUp() {
        //TODO: If the move is queued before the character moves up, it will ignore the current direction.  Bug.
        this.addMove(this.rotateEuler.fromArray([(Math.round(this.direction[1]) !== 1 ? -1 : 1) * Math.PI / 2, 0, 0, "ZXY"]))
    }

    pitchDown() {
        //TODO: If the move is queued before the character moves up, it will ignore the current direction.  Bug.
        this.addMove(this.rotateEuler.fromArray([(Math.round(this.direction[1]) !== -1 ? 1 : -1) * Math.PI / 2, 0, 0, "ZXY"]))
    }

    left() {
        if (Math.round(this.direction[1]) == 0) this.addMove(this.rotateEuler.fromArray([0, Math.PI / 2, 0, "ZXY"]))
    }

    right() {
        if (Math.round(this.direction[1]) == 0) this.addMove(this.rotateEuler.fromArray([0, -Math.PI / 2, 0, "ZXY"]))
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

    addToTail() {
        let tailGeo = new THREE.BoxGeometry(.9, .9, .9)
        let tailXform = new THREE.Mesh(tailGeo, mat_dark_orange)
        tailXform.position.set(...this.lastPosition)
        scene.add(tailXform)
        this.hasEaten = false
        this.tail.push(tailXform)
    }

    updateTrail() {
        if (this.trail.every(trail => !arrayCompare(trail, this.position))) {
            this.trail.push(this.position)
            if (this.trail.length > this.tail.length + 1) this.trail.shift()
        }
        return this.trail
    }

    update() {
        // TODO: This line is causing a bug where the position is actually offset from the real position.  Sometimes Y is 1 less and sometimes its equal.  Not sure when.
        this.position = (this.mesh.position.toArray().map(p => Math.floor(p + .1)))
        this.mesh.getWorldDirection(this.wpVector)
        this.direction = this.wpVector.toArray()

        if (this.validateMoveOnGrid()) {
            this.moveQueue.length && this.checkMoveQueue()
            gameInstance.debugLeft(`Snake Direction: (${printFloatArray(this.direction)}<br>(Snake Position:(${printFloatArray(this.position)})<br>moveQueue:${this.moveQueue.length}<br>trail:${JSON.stringify(this.trail)}<br>canMove?:${Math.floor(this.moveTicker%MOVE_TICKER_COMPARE/10)}<br>canPitchUp:${this.canPitchUp} canPitchDown:${this.canPitchDown}`)

            if (!arrayCompare(this.position, this.lastPosition)) {
                this.lastPosition = [...this.position]

                // Need to make sure the trail is as long as the length of items
                this.updateTrail()
                this.hasEaten && this.addToTail()

                // Then need to add to beginning of trail list and pop off any ones that are greater than the list.
                // Then iterate through positions and move tail list squares to that square.
                this.tail.map((tail, i) => {
                    tail.position.set(...this.trail[i + 1])
                })
            }
        }

        this.makeMove()
    }
}