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

        this.floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.size.x, this.size.z, 0), tjs_materials.flat_blue);
        this.floor.name = "FloorPlane"
        this.floor.rotateX(-HALF_PI)
        this.floor.translateZ(-this.size.vertCenter - .5)

        this.floorZ = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.size.x, this.size.y, 0), tjs_materials.flat_blue);
        this.floorZ.name = "FloorPlaneZ"
        this.floorZ.translateZ(-this.size.horizCenter + -.5)

        this.floorZP = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.size.x, this.size.y, 0), tjs_materials.flat_blue);
        this.floorZP.name = "FloorPlaneZP"
        this.floorZP.translateZ(this.size.horizCenter + .5)
        this.floorZP.rotateY(Math.PI)

        this.floorX = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.size.x, this.size.y, 0), tjs_materials.flat_blue);
        this.floorX.name = "FloorPlaneX"
        this.floorX.translateX(this.size.horizCenter + .5)
        this.floorX.rotateY((3 * Math.PI) / 2)

        this.floorXP = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.size.x, this.size.y, 0), tjs_materials.flat_blue);
        this.floorXP.name = "FloorPlaneXP"
        this.floorXP.translateX(-this.size.horizCenter + -.5)
        this.floorXP.rotateY(HALF_PI)

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
        this.meshes.push(this.floorZ)
        this.meshes.push(this.floorZP)
        this.meshes.push(this.floorX)
        this.meshes.push(this.floorXP)

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
            let posCandidate = generateRandomPosition(this.size.x, this.size.y, this.size.z)
            while (foodPositions.includes(posCandidate) && !arrayCompare([0, 0, 0], posCandidate)) {
                posCandidate = generateRandomPosition(this.size.x, this.size.y, this.size.z)
            }
            foodPositions.push(posCandidate.map((p, i) => p - ((i === 1) ? this.size.vertCenter : this.size.horizCenter)))
        }

        foodPositions.map((foodPosition, i) => {
            let collider = new THREE.BoxBufferGeometry(1, 1, 1)
            var food = new THREE.Mesh(collider, tjs_materials.collider)
            food.name = `Food${String(i).padStart(2, '0')}`
            var foodGroup = new THREE.Group()
            foodGroup.rotateY(choice([RAD90, RAD180, RAD270]))


            loader.load('models/fruit.fbx', function(object) {
                object.name = `FoodFBX${String(i).padStart(2, '0')}`
                foodGroup.add(object)
            })
            food.fbx = foodGroup
            food.add(foodGroup)
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
                            () => food.scale.x < .25,
                            () => {
                                food.scale.x *= .9
                                food.scale.y *= .9
                                food.scale.z *= .9
                                food.rotation.x += 5;
                                food.rotation.y += 5;
                            },
                            () => tjs_scene.remove(food),
                            100
                        )
                        if (game.arcadeMode) this.buildFoods()
                    }
                }
            })
        }

        // Maybe turn this back to ray collisions
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
            if (food.fbx && food.fbx.children[0]) {
                let foodMesh = food.fbx.children[0].children[2]
                food.fbx.children[0].position.y += Math.sin(CLOCK.elapsedTime * 2 + food.offset) / 400

                if (player.position[1] === food.position.y) {
                    if (player.position[0] === food.position.x || player.position[2] === food.position.z) {
                        foodMesh.material = tjs_materials.food_highlight
                    } else {
                        foodMesh.material = tjs_materials.food
                    }
                } else if (player.position[0] === food.position.x && player.position[2] === food.position.z) {
                    foodMesh.material = tjs_materials.food_highlight
                } else {
                    foodMesh.material = tjs_materials.food
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