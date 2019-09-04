document.onkeydown = function(e) {
    switch (e.keyCode) {
        case (KEYCODES.w):
            player.pitchUp()
            break;
        case (KEYCODES.a):
            player.left()
            break;
        case (KEYCODES.s):
            player.pitchDown()
            break;
        case (KEYCODES.d):
            player.right()
            break;
        case (KEYCODES.q):
            player.rollLeft()
            break;
        case (KEYCODES.e):
            player.rollRight()
            break;
    }
}

class Game {
    constructor() {
        loader = new THREE.FBXLoader();
        this.createRenderer()
        this.createCamera()
        this.createScene()
        this.createLights()
        console.log('creating.')
        this.level = new Level(Math.floor(BOARD_SIZE / 2))
        this.stats = new Stats();

        container = document.getElementById('canvas')
        container.appendChild(renderer.domElement);
        container.appendChild(this.stats.dom);
        $id('info').innerHTML = "4D_SNAKE"

        window.addEventListener('resize', () => {
            ASPECT_RATIO = window.innerWidth / window.innerHeight;
            SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio;
            SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio;

            camera.aspect = ASPECT_RATIO;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false)

        this.animate()
    }

    createRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);
    }

    createCamera() {
        camera = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.1, 1000);
        camera.position.x = 6
        camera.position.y = 4
        camera.position.z = 4

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, -0.2, -0.2);
        controls.update();
    }

    createScene() {
        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2(0xf0fff0, 0.02);
    }

    createLights() {
        let light = new THREE.HemisphereLight(0xffffff, 0x444444);
        light.position.set(0, 200, 0);
        scene.add(light);

        var lights = [];
        lights.push(new THREE.DirectionalLight(0xe69705, 1))
        lights[lights.length - 1].position.set(1, .3, 0);

        lights.push(new THREE.DirectionalLight(0xffffff, .2))
        lights[lights.length - 1].position.set(0, 100, 0);

        lights.map(light => scene.add(light))
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        var delta = CLOCK.getDelta();
        if (mixer) mixer.update(delta);
        this.level.update(delta)
        this.stats.update();
        renderer.clear();
        renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        renderer.render(scene, camera);
    }
}

class Level {
    constructor(numFood) {
        this.numFood = numFood
        this.buildLevel()
        player = new Snake(mat_flat_orange)

        scene.add(this.lineSegments)
        scene.add(floorXform)
        scene.add(player.mesh)

        this.spawnFood()
    }

    buildLevel() {
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

        foods.map(food => {
            food.position.y += Math.sin(CLOCK.elapsedTime * 2 + food.offset) / 400
            if (food.fbx) {
                if (player.position[1] === Math.floor(food.position.y)) {
                    food.fbx.children[0].material = mat_mid_blue
                } else {
                    food.fbx.children[0].material = mat_dark_orange
                }
            }
        })

        floorIndicators.map(floorIndicator => {
            if (Math.floor(floorIndicator.position.y) === Math.floor(player.position[1])) floorIndicator.material = dashline_indicator_material
            else floorIndicator.material = dashline_indicator_inactive_material
        })

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
                            console.log('EAT!')
                            player.hasEaten = true
                        }
                    }
                }
            })
        }
    }
}

gameInstance = new Game()