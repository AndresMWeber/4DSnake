class Level {
    constructor(numFood, sizeHeight, sizeDiameter) {
        this.size = { x: sizeDiameter, y: sizeDiameter, z: sizeHeight, offset: (sizeDiameter - 1) / 2 }
        this.numFood = numFood
        this.makeGrid = false

        this.buildLevel()
        this.buildFoods()
        player = new Snake()
        tjs_scene.add(this.lineSegments)
        tjs_scene.add(floor)
        tjs_scene.add(player.mesh)
        tjs_scene.add(this.floorSpotZX)
        tjs_scene.add(this.floorSpotYX)
        tjs_scene.add(this.floorSpotYZ)
    }


    buildLevel() {
        this.makeGrid && this.buildGrid()
        this.buildFloorIndicators()

        var floorShape = new THREE.PlaneBufferGeometry(this.size.x, this.size.y, 0)
        floor = new THREE.Mesh(floorShape, tjs_materials.dark_orange);
        floor.rotateX(-HALF_PI)
        floor.translateZ(-this.size.x / 2)

        let boardShape = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(this.size.x, this.size.y, this.size.z)); // or WireframeGeometry( geometry )
        this.lineSegments = new THREE.LineSegments(boardShape, tjs_materials.dashline)
        this.lineSegments.position.set(0, 0, 0)
        this.lineSegments.computeLineDistances()
    }

    buildFloorIndicators() {
        for (let i = 0; i < this.size.y; i++) {
            var indicatorShape = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(this.size.x + .2, 1, this.size.z + .2))
            var indicatorXform = new THREE.LineSegments(indicatorShape, tjs_materials.indicator_inactive)
            indicatorXform.position.set(0, i - this.offset, 0)
            indicatorXform.computeLineDistances()
            floorIndicators.push(indicatorXform)
            tjs_scene.add(indicatorXform)
        }

        this.floorSpotZX = new THREE.Points(new THREE.BoxBufferGeometry(1, this.boardSize, 0), tjs_materials.points)

        this.floorSpotYX = new THREE.Points(new THREE.BoxBufferGeometry(1, this.boardSize, 0), tjs_materials.points)
        this.floorSpotYX.rotateX(-HALF_PI)

        this.floorSpotYZ = new THREE.Points(new THREE.BoxBufferGeometry(this.boardSize, 1, 0), tjs_materials.points)
        this.floorSpotYZ.rotateX(-HALF_PI)
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
            while (foodPositions.includes(posCandidate)) {
                posCandidate = generateRandomPosition(this.size.x, this.size.y, this.size.z)
            }
            foodPositions.push(posCandidate)
        }

        foodPositions.map(foodPosition => {
            let collider = new THREE.BoxBufferGeometry(1, 1, 1)
            var mesh = new THREE.Mesh(collider, tjs_materials.collider)
            loader.load('models/apple.fbx', function(object) {
                object.traverse(child => { if (child.isMesh) child.material = tjs_materials.dark_orange })
                mesh.add(object)
                mesh.fbx = object
            })
            mesh.position.x = foodPosition[0] - this.size.offset
            mesh.position.y = foodPosition[1] - this.size.offset
            mesh.position.z = foodPosition[2] - this.size.offset
            mesh.offset = Math.random()

            foods.push(mesh)
            tjs_scene.add(mesh)
        })
    }

    update() {
        player.update(level)
        this.highlightFloor()
        this.highlightFood()
        this.checkCollision()
    }

    checkCollision() {
        var originPoint = player.mesh.position.clone();

        for (var vertexIndex = 0; vertexIndex < player.mesh.geometry.vertices.length; vertexIndex++) {
            var localVertex = player.mesh.geometry.vertices[vertexIndex].clone()
            var globalVertex = localVertex.applyMatrix4(player.mesh.matrix)
            var directionVector = globalVertex.sub(player.mesh.position)
            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize())

            foods.map(food => {
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
        foods = foods.filter(f => !f.eaten)
    }

    highlightFloor() {
        floorIndicators.map(indicator => {
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
        foods.map(food => {
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
}