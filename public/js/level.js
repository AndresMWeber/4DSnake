class Level {
    constructor(numFood) {
        this.boardSize = BOARD_SIZE
        this.boardHeight = BOARD_SIZE
        this.numFood = numFood
        this.makeGrid = false
        this.buildLevel()
        this.buildFoods()
        player = new Snake()
        tjs_scene.add(this.lineSegments)
        tjs_scene.add(floor)
        tjs_scene.add(player.mesh)
        tjs_scene.add(this.floorSpot)
    }

    buildLevel() {
        this.makeGrid && this.buildGrid()
        this.buildFloorIndicators()

        var floorShape = new THREE.PlaneBufferGeometry(BOARD_SIZE, BOARD_SIZE, 0)
        floor = new THREE.Mesh(floorShape, tjs_materials.dark_orange);
        floor.rotateX(-HALF_PI)
        floor.translateZ(-BOARD_SIZE / 2)

        let boardShape = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(BOARD_SIZE, BOARD_SIZE, BOARD_SIZE)); // or WireframeGeometry( geometry )
        this.lineSegments = new THREE.LineSegments(boardShape, tjs_materials.dashline)
        this.lineSegments.position.set(0, 0, 0)
        this.lineSegments.computeLineDistances()
    }

    buildFloorIndicators() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            var indicatorShape = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(BOARD_SIZE + .2, 1, BOARD_SIZE + .2))
            var indicatorXform = new THREE.LineSegments(indicatorShape, tjs_materials.indicator_inactive)
            indicatorXform.position.set(0, i - BOARD_OFFSET, 0)
            indicatorXform.computeLineDistances()
            floorIndicators.push(indicatorXform)
            tjs_scene.add(indicatorXform)
        }

        this.floorSpot = new THREE.Points(new THREE.PlaneBufferGeometry(1, 1, 0), tjs_materials.points);
        this.floorSpot.rotateX(-HALF_PI)
        this.floorSpot.position.y = -BOARD_SIZE / 2 + .01
    }

    buildGrid() {
        loader.load('models/dot.fbx', function(object) {
            object.traverse(child => { if (child.isMesh) child.material = mat_flat_blue });
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    for (let k = 0; k < BOARD_SIZE; k++) {
                        let clone = object.clone()
                        tjs_scene.add(clone)
                        clone.position.set(i - BOARD_OFFSET, j - BOARD_OFFSET, k - BOARD_OFFSET)
                    }
                }
            }
        })
    }

    buildFoods() {
        let foodPositions = []
        for (let i = 0; i < this.numFood; i++) {
            let posCandidate = generateRandomPosition()
            while (foodPositions.includes(posCandidate)) {
                posCandidate = generateRandomPosition()
            }
            foodPositions.push(posCandidate)
        }

        foodPositions.map(foodPosition => {
            let collider = new THREE.BoxBufferGeometry(1, 1, 1);
            var mesh = new THREE.Mesh(collider, tjs_materials.collider);
            loader.load('models/apple.fbx', function(object) {
                object.traverse(child => { if (child.isMesh) child.material = tjs_materials.dark_orange })
                mesh.add(object)
                mesh.fbx = object
            })
            mesh.position.x = foodPosition[0] - BOARD_OFFSET
            mesh.position.y = foodPosition[1] - BOARD_OFFSET
            mesh.position.z = foodPosition[2] - BOARD_OFFSET
            mesh.offset = Math.random()

            foods.push(mesh)
            tjs_scene.add(mesh)
        })
    }

    update(delta) {
        player.update(delta)
        this.updateFoods()
        this.highlightFloor()
        this.highlightFood()
    }

    highlightFloor() {
        floorIndicators.map(indicator => {
            if (Math.floor(indicator.position.y) === Math.floor(player.position[1])) indicator.material = tjs_materials.indicator
            else indicator.material = tjs_materials.indicator_inactive
        })

        this.floorSpot.position.x = player.mesh.position.x
        this.floorSpot.position.z = player.mesh.position.z
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

    updateFoods() {
        var originPoint = player.mesh.position.clone();

        for (var vertexIndex = 0; vertexIndex < player.mesh.geometry.vertices.length; vertexIndex++) {
            var localVertex = player.mesh.geometry.vertices[vertexIndex].clone()
            var globalVertex = localVertex.applyMatrix4(player.mesh.matrix)
            var directionVector = globalVertex.sub(player.mesh.position)
            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize())

            foods.map(food => {
                if (food.eaten === undefined) {
                    var collisionResults = ray.intersectObject(food)
                    if (collisionResults.length) {
                        if (collisionResults[0].distance < directionVector.length() - 0.2) {
                            tjs_scene.remove(food)
                            food.eaten = true
                            player.hasEaten = true
                        }
                    }
                }
            })

            foods = foods.filter(f => !f.eaten)
        }
    }
}