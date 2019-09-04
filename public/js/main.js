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
        this.moveQueue = [new THREE.Euler((this.canPitchDown ? 1 : 11) * Math.PI / 2, 0, 0, "ZXY")]
        this.canPitchDown = !this.canPitchDown || !this.canPitchUp
        this.canPitchUp = true
    }

    pitchUp() {
        this.moveQueue = [new THREE.Euler((this.canPitchUp ? -1 : 1) * Math.PI / 2, 0, 0, "ZXY")]
        this.canPitchUp = !this.canPitchUp || !this.canPitchDown
        this.canPitchDown = true
    }

    left() {
        if (this.canPitchDown && this.canPitchUp) this.moveQueue = [new THREE.Euler(0, Math.PI / 2, 0, "ZXY")]
    }

    right() {
        if (this.canPitchDown && this.canPitchUp) this.moveQueue = [new THREE.Euler(0, -Math.PI / 2, 0, "ZXY")]
    }

    rollLeft(force) {
        let euler = new THREE.Euler(0, 0, -Math.PI / 2, "ZXY")
        if (force) this.makeTurn(euler)
        else this.moveQueue = [euler]
    }

    rollRight(force) {
        let euler = new THREE.Euler(0, 0, Math.PI / 2, "ZXY")
        if (force) this.makeTurn(euler)
        else this.moveQueue = [euler]
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

    checkMoveQueue() {
        // console.log(quatToEulerDegrees(this.mesh.getWorldQuaternion()))
        // console.log(arrayCompareClose(this.mesh.position, this.position.map(n => n + 1), .2), this.mesh.position, this.position.map(n => n + 1), .2)
        if (this.moveQueue.length && (!arrayCompare(this.position, this.lastPosition))) {
            console.log('changed square and checking move queue.', this.position, this.lastPosition)
            let euler = this.moveQueue.shift()
            this.makeTurn(euler)
        }
        if (this.moveQueue.length) {
            let euler = this.moveQueue.shift()
            this.makeTurn(euler)
        }
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
        this.position = (this.mesh.position.toArray().map(p => Math.floor(p)))

        this.checkMoveQueue()

        if (!arrayCompare(this.position, this.lastPosition)) {
            this.lastPosition = [...this.position]
                // this.hasEaten && this.addToTail()

            this.tail.map(tail => {
                tail.lifeSpan -= 1
                tail.position.set(...this.lastPosition)
                    // if (!tail.lifeSpan) scene.remove(tail)
            })
        }

        this.makeMove()
    }
}

function initScene() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    loader = new THREE.FBXLoader();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf0fff0, 0.02);
    maincamera = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.1, 1000);

    stats = new Stats();

    maincamera.position.x = 6
    maincamera.position.y = 4
    maincamera.position.z = 4

    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    renderer.shadowMapEnabled = true

    controls = new THREE.OrbitControls(maincamera, renderer.domElement);
    controls.target.set(0, -0.2, -0.2);
    controls.update();

    container = document.getElementById('canvas')
    container.appendChild(renderer.domElement);
    container.appendChild(stats.dom);
}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    scene.add(light);

    var lights = [];
    // lights[0] = new THREE.DirectionalLight(0xe69705, 1);
    // lights[0].position.set(1, .3, 0);

    lights[1] = new THREE.DirectionalLight(0xffffff, .2);
    lights[1].position.set(0, 100, 0);

    lights.map(light => scene.add(light))
}

function createObjects() {
    player = new Snake(mat_flat_orange)

    // // Create grid
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
    floorXform = new THREE.Mesh(floorGeo, mat_flat_orange);
    floorXform.receiveShadow = true
    floorXform.rotateX(-Math.PI / 2)
    floorXform.translateZ(-BOARD_SIZE / 2)

    var board = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(BOARD_SIZE, BOARD_SIZE, BOARD_SIZE)); // or WireframeGeometry( geometry )
    var lineSegments = new THREE.LineSegments(board, dashline_material)
    lineSegments.position.set(0, 0, 0)
    lineSegments.computeLineDistances()

    scene.add(lineSegments)
    scene.add(floorXform)
    scene.add(player.mesh)

    document.getElementById('info').innerHTML = "4D_SNAKE"
}


function spawnFood(numFood) {
    let foodPositions = []
    for (let i = 0; i < numFood; i++) {
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
        mesh.castShadow = true

        mesh.position.x = foodPosition[0] - BOARD_OFFSET
        mesh.position.y = foodPosition[1] - BOARD_OFFSET
        mesh.position.z = foodPosition[2] - BOARD_OFFSET
        mesh.offset = Math.random()

        foods.push(mesh)
        scene.add(mesh)
    })
}

function updateScene() {
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
                    if (collisionResults[0].distance < directionVector.length() - 0.5) {
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

function animate() {
    requestAnimationFrame(animate);
    var delta = CLOCK.getDelta();
    if (mixer) mixer.update(delta);
    updateScene(delta)
    stats.update();
    renderer.clear();
    renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.render(scene, maincamera);
}

window.addEventListener('resize', () => {
    ASPECT_RATIO = window.innerWidth / window.innerHeight;
    SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio;
    SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio;

    maincamera.aspect = ASPECT_RATIO;
    maincamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false)

function main() {
    initScene()
    createObjects()
    createLights()
    spawnFood(Math.floor(BOARD_SIZE / 2))
    animate()
}

main()