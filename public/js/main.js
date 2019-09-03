document.onkeydown = function(e) {
    switch (e.keyCode) {
        case (KEYCODES.w):
            player.forward()
            break;
        case (KEYCODES.a):
            player.left()
            break;
        case (KEYCODES.s):
            player.backward()
            break;
        case (KEYCODES.d):
            player.right()
            break;
        case (KEYCODES.q):
            player.up()
            break;
        case (KEYCODES.e):
            player.down()
            break;
    }
}

class Snake {
    constructor(material) {
        this.dirs = ['x', 'y', 'z']
        this.moveQueue = []
        this.speed = .05
        this.moveTicker = 0
        this.direction = [0, 0, 1]
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, mat_collider);

        let scope = this
        loader.load('models/snakeHeadAnim.fbx', function(object) {
            // mixer = new THREE.AnimationMixer(object);
            // var action = mixer.clipAction(object.animations[0]);
            // action.play();

            object.traverse(child => {
                console.log(child)
                if (child.name === "head_GEO") child.material = mat_flat_orange
            })
            scope.mesh.add(object)
        })
    }

    forward() {
        let toRotation = new THREE.Quaternion();
        const axisNormalised = new THREE.Vector3(0, 1, 0).normalize();
        const angle = Math.PI;
        toRotation.setFromAxisAngle(axisNormalised, angle);
        this.moveQueue.push(() => this.mesh.rotation.setFromQuaternion(toRotation))
            // this.moveQueue.push(() => this.mesh.rotation.x += 1.5708)
    }

    backward() {
        let toRotation = new THREE.Quaternion();
        const axisNormalised = new THREE.Vector3(-1, -1, 0).normalize();
        const angle = Math.PI;
        toRotation.setFromAxisAngle(axisNormalised, 0);
        this.moveQueue.push(() => this.mesh.rotation.setFromQuaternion(toRotation))
            // this.moveQueue.push(() => this.mesh.rotation.x -= 1.5708)
    }
    up() {
        let toRotation = new THREE.Quaternion();
        const axisNormalised = new THREE.Vector3(0, -1, 1).normalize();
        const angle = Math.PI;
        toRotation.setFromAxisAngle(axisNormalised, angle);
        this.moveQueue.push(() => this.mesh.rotation.setFromQuaternion(toRotation))
    }

    down() {
        let toRotation = new THREE.Quaternion();
        const axisNormalised = new THREE.Vector3(0, 1, 1).normalize();
        const angle = Math.PI;
        toRotation.setFromAxisAngle(axisNormalised, angle);
        this.moveQueue.push(() => this.mesh.rotation.setFromQuaternion(toRotation))
    }

    left() {
        let toRotation = new THREE.Quaternion();
        const axisNormalised = new THREE.Vector3(0, -1, 0).normalize();
        const angle = Math.PI;
        toRotation.setFromAxisAngle(axisNormalised, angle / 2);
        this.moveQueue.push(() => this.mesh.rotation.setFromQuaternion(toRotation))
            // this.moveQueue.push(() => this.mesh.rotation.y -= 1.5708)
    }

    right() {
        let toRotation = new THREE.Quaternion();
        const axisNormalised = new THREE.Vector3(0, 1, 0).normalize();
        const angle = Math.PI;
        toRotation.setFromAxisAngle(axisNormalised, angle / 2);
        this.moveQueue.push(() => this.mesh.rotation.setFromQuaternion(toRotation))
            // this.moveQueue.push(() => this.mesh.rotation.y += 1.5708)

    }

    checkRotationQueue() {
        if (!(Object.values(this.mesh.position).every(pos => pos % 1 < .04 && pos % 1 > 0.96) && this.moveQueue.length)) {
            let func = this.moveQueue.shift()
            if (func) func()
            this.mesh.updateMatrixWorld()
        }
    }

    update() {
        this.checkRotationQueue()

        var wpVector = new THREE.Vector3()
        this.mesh.getWorldDirection(wpVector)

        this.direction = wpVector.toArray()
        this.direction.map((dirNormal, i) => {
            if (dirNormal) {
                let futurePosition = this.mesh.position[this.dirs[i]] + this.speed * dirNormal
                if (futurePosition <= 0 - boardSize / 2 || futurePosition >= boardSize / 2 - 1) {
                    futurePosition = this.mesh.position[this.dirs[i]] + -.05 * dirNormal
                        // console.log('Reversing direction, out of bounds!', this.speed)
                }

                if (dirNormal) {
                    this.mesh.position[this.dirs[i]] = futurePosition
                    this.moveTicker += 1
                }
            }
        })
    }
}

function initScene() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    loader = new THREE.FBXLoader();
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0xf0fff0, 0.05);
    maincamera = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.1, 1000);
    subcamera = new THREE.PerspectiveCamera(20, ASPECT_RATIO, 0.1, 100);

    stats = new Stats();

    maincamera.position.x = 10
    maincamera.position.y = 7
    maincamera.position.z = 7
    subcamera.position.y = 3
    subcamera.position.z = -8
    subcamera.rotation.y -= 1.5708 * 2
    subcamera.rotation.x -= -.2
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    controls = new THREE.OrbitControls(maincamera, renderer.domElement);
    controls.target.set(0, -0.2, -0.2);
    controls.update();

    container = document.getElementById('canvas')
    container.appendChild(renderer.domElement);
    container.appendChild(stats.dom);
}

function createObjects() {

    player = new Snake(mat_flat_orange)
    player.mesh.add(subcamera)

    // Create grid
    loader.load('models/dot.fbx', function(object) {
        object.traverse(child => { if (child.isMesh) child.material = mat_flat_blue });
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                for (let k = 0; k < boardSize; k++) {
                    let clone = object.clone()
                    scene.add(clone)
                    clone.position.x = i - boardSize / 2
                    clone.position.y = j - boardSize / 2
                    clone.position.z = k - boardSize / 2
                }
            }
        }
    })

    var board = new THREE.EdgesGeometry(new THREE.BoxGeometry(10, 10, 10)); // or WireframeGeometry( geometry )

    var lineSegments = new THREE.LineSegments(board, dashline_material)
    lineSegments.position.x -= .5
    lineSegments.position.y -= .5
    lineSegments.position.z -= .5
    lineSegments.computeLineDistances()

    // scene.add(wireframe);
    scene.add(lineSegments)
    scene.add(player.mesh)
}

function generateRandomPosition() {
    return [Math.floor(Math.random() * boardSize), Math.floor(Math.random() * boardSize), Math.floor(Math.random() * boardSize)]
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
        let collider = new THREE.BoxGeometry(1, 1, 1);
        var mesh = new THREE.Mesh(collider, mat_collider);
        loader.load('models/apple.fbx', function(object) {
            object.traverse(child => { if (child.isMesh) child.material = mat_dark_orange })
            mesh.add(object)
        })

        mesh.position.x = foodPosition[0] - boardSize / 2
        mesh.position.y = foodPosition[1] - boardSize / 2
        mesh.position.z = foodPosition[2] - boardSize / 2
        mesh.offset = Math.random()

        foods.push(mesh)
        scene.add(mesh)
    })
}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    scene.add(light);

    var lights = [];
    lights[0] = new THREE.DirectionalLight(0xe69705, 1);
    lights[0].position.set(1, .3, 0);

    lights.map(light => scene.add(light))
}

function updateScene(delta) {
    player.update()
    foods.map(food => food.position.y += Math.sin(clock.elapsedTime * 2 + food.offset) / 300)

    var originPoint = player.mesh.position.clone();
    for (var vertexIndex = 0; vertexIndex < player.mesh.geometry.vertices.length; vertexIndex++) {
        var localVertex = player.mesh.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(player.mesh.matrix);
        var directionVector = globalVertex.sub(player.mesh.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        foods.map((food) => {
            var collisionResults = ray.intersectObject(food)
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) scene.remove(food)
        })

    }
}

function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    updateScene(delta)
    stats.update();
    renderer.clear();
    renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.render(scene, maincamera);

    renderer.setViewport(0, 0, SCREEN_WIDTH / 3, SCREEN_HEIGHT / 3);
    renderer.render(scene, subcamera);
}

window.addEventListener('resize', () => {
    ASPECT_RATIO = window.innerWidth / window.innerHeight;
    SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio;
    SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio;

    maincamera.aspect = ASPECT_RATIO;
    maincamera.updateProjectionMatrix();
    subcamera.aspect = ASPECT_RATIO;
    subcamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false)

function main() {
    initScene()
    createObjects()
    createLights()
    spawnFood(5)
    animate()
}

main()