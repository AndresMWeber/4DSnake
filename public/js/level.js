class Level {
    constructor(numFood) {
        this.numFood = numFood
        this.buildLevel()
        this.buildGrid = false
        player = new Snake(mat_flat_orange)

        scene.add(this.lineSegments)
        scene.add(floorXform)
        scene.add(player.mesh)

        this.spawnFood()
    }

    buildLevel() {
        this.buildGrid && this.buildGrid()


        for (let i = 0; i < BOARD_SIZE; i++) {
            var geometry = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(BOARD_SIZE + .2, 1, BOARD_SIZE + .2))
            var indicatorMesh = new THREE.LineSegments(geometry, dashline_indicator_inactive_material)
            indicatorMesh.position.set(0, i - BOARD_OFFSET, 0)
            indicatorMesh.computeLineDistances()
            floorIndicators.push(indicatorMesh)
            scene.add(indicatorMesh)
        }

        var floorGeo = new THREE.PlaneBufferGeometry(BOARD_SIZE, BOARD_SIZE, 0)
        floorXform = new THREE.Mesh(floorGeo, mat_dark_orange);
        floorXform.rotateX(-Math.PI / 2)
        floorXform.translateZ(-BOARD_SIZE / 2)

        let boardOutline = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(BOARD_SIZE, BOARD_SIZE, BOARD_SIZE)); // or WireframeGeometry( geometry )
        this.lineSegments = new THREE.LineSegments(boardOutline, dashline_material)
        this.lineSegments.position.set(0, 0, 0)
        this.lineSegments.computeLineDistances()
    }

    buildGrid() {
        loader.load('models/dot.fbx', function(object) {
            object.traverse(child => { if (child.isMesh) child.material = mat_flat_blue });
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    for (let k = 0; k < BOARD_SIZE; k++) {
                        let clone = object.clone()
                        scene.add(clone)
                        clone.position.set(i - BOARD_OFFSET, j - BOARD_OFFSET, k - BOARD_OFFSET)
                    }
                }
            }
        })
    }

    spawnFood() {
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
            var mesh = new THREE.Mesh(collider, mat_collider);
            loader.load('models/apple.fbx', function(object) {
                object.traverse(child => { if (child.isMesh) child.material = mat_dark_orange })
                mesh.add(object)
                mesh.fbx = object
            })
            mesh.position.x = foodPosition[0] - BOARD_OFFSET
            mesh.position.y = foodPosition[1] - BOARD_OFFSET
            mesh.position.z = foodPosition[2] - BOARD_OFFSET
            mesh.offset = Math.random()

            foods.push(mesh)
            scene.add(mesh)
        })
    }

    update() {
        player.update()
        this.highlightFloor()
        this.highlightFood()
        this.foodsUpdate()

    }

    highlightFloor() {
        floorIndicators.map(floorIndicator => {
            if (Math.floor(floorIndicator.position.y) === Math.floor(player.position[1])) floorIndicator.material = dashline_indicator_material
            else floorIndicator.material = dashline_indicator_inactive_material
        })
    }

    highlightFood() {
        foods.map(food => {
            if (food.fbx) {
                food.children[0].position.y += Math.sin(CLOCK.elapsedTime * 2 + food.offset) / 400
                if (player.position[1] === Math.floor(food.position.y)) {
                    if (player.position[0] === Math.floor(food.position.x) || player.position[2] === Math.floor(food.position.z)) {
                        food.fbx.children[0].material = mat_mid_highlight
                    } else {
                        food.fbx.children[0].material = mat_mid_blue
                    }
                } else if (player.position[0] === Math.floor(food.position.x) && player.position[2] === Math.floor(food.position.z)) {
                    food.fbx.children[0].material = mat_mid_highlight
                } else {
                    food.fbx.children[0].material = mat_dark_orange
                }
            }
        })
    }
    foodsUpdate() {
        var originPoint = player.mesh.position.clone();
        for (var vertexIndex = 0; vertexIndex < player.mesh.geometry.vertices.length; vertexIndex++) {
            var localVertex = player.mesh.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(player.mesh.matrix);
            var directionVector = globalVertex.sub(player.mesh.position);

            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

            foods.map(food => {
                if (food.eaten === undefined) {
                    var collisionResults = ray.intersectObject(food)
                    if (collisionResults.length) {
                        if (collisionResults[0].distance < directionVector.length() - 0.2) {
                            scene.remove(food)
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