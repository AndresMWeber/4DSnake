class Level {
    constructor() {
        this.initialize(...LEVELS[0])
    }

    initialize(numFood, sizeHeight, sizeDiameter) {
        this.loading = true
        this.size = {
            x: sizeDiameter,
            y: sizeHeight,
            z: sizeDiameter,
            horizCenter: (sizeDiameter - Number(sizeDiameter % 2)) / 2,
            vertCenter: (sizeHeight - Number(sizeDiameter % 2)) / 2,
        }

        this.difficulty = (this.difficulty) ? this.difficulty : 0
        this.numFood = numFood
        this.makeGrid = false
        this.beaten = false
        this.floorIndicators = []
        this.foods = []
        this.meshes = []

        this.buildLevel()
        this.buildFoods()
        this.loading = false
    }

    get center() {
        return [this.size.horizCenter, this.size.vertCenter, this.size.horizCenter]
    }

    buildLevel() {
        this.makeGrid && this.buildGrid()
        this.buildFloorIndicators()

        var floorShape = new THREE.PlaneBufferGeometry(this.size.x, this.size.z, 0)
        this.floor = new THREE.Mesh(floorShape, tjs_materials.dark_orange);
        this.floor.name = "FloorPlane"
        this.floor.rotateX(-HALF_PI)
        this.floor.translateZ(-this.size.vertCenter - .5)

        this.floorSpotZX = new THREE.Points(new THREE.BoxBufferGeometry(1, this.size.y, 0), tjs_materials.pointsY)
        this.floorSpotZX.name = 'FloorSpotZX'

        this.floorSpotYX = new THREE.Points(new THREE.BoxBufferGeometry(this.size.z, 1, 0), tjs_materials.pointsX)
        this.floorSpotYX.rotateY(-HALF_PI)
        this.floorSpotYX.name = 'FloorSpotYX'

        this.floorSpotYZ = new THREE.Points(new THREE.BoxBufferGeometry(this.size.x, 1, 0), tjs_materials.pointsZ)
        this.floorSpotYZ.rotateX(-HALF_PI)
        this.floorSpotYZ.name = 'FloorSpotYZ'

        this.lineSegments = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(this.size.x, this.size.y, this.size.z)), tjs_materials.dashline)
        this.lineSegments.name = "BoardOutline"
        this.lineSegments.computeLineDistances()

        this.meshes.push(this.floor)
        this.meshes.push(this.floorSpotZX)
        this.meshes.push(this.floorSpotYX)
        this.meshes.push(this.floorSpotYZ)
        this.meshes.push(this.lineSegments)

        this.meshes.map(mesh => tjs_scene.add(mesh))
    }

    buildFloorIndicators() {
        for (let i = 0; i < this.size.y; i++) {
            var indicatorShape = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(this.size.x + .2, 1, this.size.z + .2))
            var indicatorXform = new THREE.LineSegments(indicatorShape, tjs_materials.indicator_inactive)
            indicatorXform.position.set(0, i - this.offset, 0)
            indicatorXform.name = `FloorIndicator${String(i).padStart(2, '0')}`
            indicatorXform.computeLineDistances()
            this.floorIndicators.push(indicatorXform)
            tjs_scene.add(indicatorXform)
        }
    }

    buildGrid() {
        loader.load('models/dot.fbx', function(object) {
            object.traverse(child => { if (child.isMesh) child.material = mat_flat_blue })
            for (let i = 0; i < this.size.x; i++) {
                for (let j = 0; j < this.size.z; j++) {
                    for (let k = 0; k < this.size.y; k++) {
                        let clone = object.clone()
                        tjs_scene.add(clone)
                        clone.position.set(i - this.size.offset, j - this.size.offset, k - this.size.offset)
                    }
                }
            }
        })
    }

    buildFoods() {
        let foodPositions = []
        for (let i = 0; i < this.numFood; i++) {
            console.log(this.size)
            let posCandidate = generateRandomPosition(this.size.x, this.size.y, this.size.z)
            while (foodPositions.includes(posCandidate)) {
                posCandidate = generateRandomPosition(this.size.x, this.size.y, this.size.z)
            }
            foodPositions.push(posCandidate.map((p, i) => p - ((i === 1) ? this.size.vertCenter : this.size.horizCenter)))
        }

        foodPositions.map((foodPosition, i) => {
            let collider = new THREE.BoxBufferGeometry(1, 1, 1)
            var food = new THREE.Mesh(collider, tjs_materials.collider)
            food.name = `Food${String(i).padStart(2, '0')}`

            loader.load('models/apple.fbx', function(object) {
                object.traverse(child => { if (child.isMesh) child.material = tjs_materials.dark_orange })
                object.name = `FoodFBX${String(i).padStart(2, '0')}`
                food.add(object)
                food.fbx = object
            })

            food.position.set(...foodPosition)
            food.offset = Math.random()
            food.points = (this.difficulty + 1) * 15

            this.foods.push(food)
            tjs_scene.add(food)
        })
    }

    update() {
        player.update()
        this.highlightFloor()
        this.highlightFood()
        this.checkCollision()
        this.checkWin()
    }

    checkWin() {
        if (!this.foods.length && !game.paused && !this.beaten) {
            this.beaten = true
            this.difficulty++;
            game.setBeatLevel()
        }
    }

    checkCollision() {
        var originPoint = player.mesh.position.clone();

        for (var vertexIndex = 0; vertexIndex < player.mesh.geometry.vertices.length; vertexIndex++) {
            var localVertex = player.mesh.geometry.vertices[vertexIndex].clone()
            var globalVertex = localVertex.applyMatrix4(player.mesh.matrix)
            var directionVector = globalVertex.sub(player.mesh.position)
            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize())

            this.foods.map(food => {
                if (food.eaten === undefined) {
                    var collisionResults = ray.intersectObject(food)
                    if (collisionResults.length && collisionResults[0].distance < directionVector.length() - 0.2) {
                        food.eaten = true
                        player.hasEaten = true
                        game.score += food.points
                        executeUntil(
                            () => food.scale.x < .2,
                            () => {
                                food.scale.x *= .85
                                food.scale.y *= .85
                                food.scale.z *= .85
                            },
                            () => tjs_scene.remove(food),
                            100
                        )
                    }
                }
            })
        }
        if (player.tail.trailRounded.slice(1, player.tail.trailRounded.length - 1).some(trailPosition => arrayCompare(trailPosition, player.position))) game.setGameOver()
        this.foods = this.foods.filter(f => !f.eaten)
    }

    highlightFloor() {
        this.floorIndicators.map(indicator => {
            if (Math.floor(indicator.position.y) === Math.floor(player.position[1])) indicator.material = tjs_materials.indicator
            else indicator.material = tjs_materials.indicator_inactive
        })

        this.floorSpotZX.position.z = player.mesh.position.z
        this.floorSpotZX.position.x = player.mesh.position.x

        this.floorSpotYX.position.y = player.mesh.position.y
        this.floorSpotYX.position.x = player.mesh.position.x

        this.floorSpotYZ.position.y = player.mesh.position.y
        this.floorSpotYZ.position.z = player.mesh.position.z
    }

    highlightFood() {
        this.foods.map(food => {
            if (food.fbx) {
                let foodFBX = food.fbx.children[0]
                foodFBX.position.y += Math.sin(CLOCK.elapsedTime * 2 + food.offset) / 400

                if (player.position[1] === food.position.y) {
                    if (player.position[0] === food.position.x || player.position[2] === food.position.z) {
                        foodFBX.material = tjs_materials.mid_highlight
                    } else {
                        foodFBX.material = tjs_materials.mid_blue
                    }
                } else if (player.position[0] === food.position.x && player.position[2] === food.position.z) {
                    foodFBX.material = tjs_materials.mid_highlight
                } else {
                    foodFBX.material = tjs_materials.dark_orange
                }
            }
        })
    }

    reset() {
        this.foods.concat(this.meshes).concat(this.floorIndicators).map(e => tjs_scene.remove(e))
        this.foods = []
        this.floorIndicators = []
        player.reset()
    }
}