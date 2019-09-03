var loader, renderer, scene, camera, player, board
boardSize = 10

var AMOUNT = 6;
var ASPECT_RATIO = window.innerWidth / window.innerHeight;
var WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
var HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;
const KEYCODES = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    w: 87,
    s: 65,
    a: 83,
    d: 68
}

const ANGULAR_SPEED = 0.05
const MOVEMENTS = {
    ArrowUp: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(ANGULAR_SPEED)),
    ArrowDown: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(-ANGULAR_SPEED * 6)),
    ArrowLeft: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(-ANGULAR_SPEED * 6)),
    ArrowRight: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(ANGULAR_SPEED * 6)),
}

document.onkeydown = function(e) {
    switch (e.keyCode) {

        case (KEYCODES.w):
            player.rotateZ(90)
            break;
        case (KEYCODES.a):
            player.rotateY(90)
            break;
        case (KEYCODES.s):
            player.rotateY(270)
            break;
        case (KEYCODES.d):
            player.rotateZ(270)
            break;
    }
    if (MOVEMENTS[e.key]) {
        const cur = player.mesh.quaternion
        const rot = MOVEMENTS[e.key]
        cur.multiplyQuaternions(rot, cur)
    }
}

class Snake {
    constructor(material) {
        this.dirs = ['x', 'y', 'z']
        this.speed = .05
        this.moveTicker = 0
        this.direction = [0, 0, 1]
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.moveQueue = []
    }

    rotateZ(degrees) {
        this.moveQueue.push(() => player.mesh.rotateZ(THREE.Math.degToRad(degrees)))
    }

    rotateX(degrees) {
        this.moveQueue.push(() => player.mesh.rotateX(THREE.Math.degToRad(degrees)))
    }

    rotateY(degrees) {
        this.moveQueue.push(() => player.mesh.rotateY(THREE.Math.degToRad(degrees)))

    }
    checkRotationQueue() {
        console.log(this.moveTicker)
        if (!(this.moveTicker % 20) && this.moveQueue.length) {
            console.log('MOVING')
            this.moveQueue.shift()()
        }
    }

    eat() {

    }

    update() {
        this.checkRotationQueue()

        var wpVector = new THREE.Vector3()
        this.mesh.getWorldDirection(wpVector)

        this.direction = wpVector.toArray()

        this.direction.map((dirNormal, i) => {
            if (dirNormal) {
                let futurePosition = this.mesh.position[this.dirs[i]] + this.speed * dirNormal
                if (futurePosition <= 0 - boardSize / 2 + 1 || futurePosition >= boardSize / 2 - 1) {
                    // console.log('flegh.')
                } else if (dirNormal) {
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
    scene.fog = new THREE.FogExp2(0xf0fff0, 0.05);
    maincamera = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.1, 1000);
    subcamera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10);
    subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH), Math.ceil(HEIGHT));

    var cameras = []
    cameras.push(maincamera)
    cameras.push(subcamera)
    camera = new THREE.ArrayCamera(cameras);
    stats = new Stats();

    maincamera.position.x = 10
    maincamera.position.y = 7
    maincamera.position.z = 7
    subcamera.position.y = 10
    subcamera.position.z = -5
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
    var mat_flat_blue = new THREE.MeshToonMaterial({
        ambient: 0x000000,
        color: 0x48C4DA,
        specular: 0x000000,
        opacity: 0.05,
        transparent: true,
        shininess: 0,
        shading: THREE.FlatShading
    })

    var mat_flat_orange = new THREE.MeshPhongMaterial({
        ambient: 0x000000,
        color: 0xFBB059,
        specular: 0x000000,
        shininess: 0,
        shading: THREE.FlatShading
    })

    var mat_wireframe = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: true,
        side: THREE.DoubleSide
    });


    player = new Snake(mat_flat_orange)

    var geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(10, 10, 10)); // or WireframeGeometry( geometry )

    var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    var wireframe = new THREE.LineSegments(geo, mat);
    wireframe.position.x -= .5
    wireframe.position.y -= .5
    wireframe.position.z -= .5
    scene.add(wireframe);

    loader.load('models/tile.fbx', function(object) {
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

    // var lineSegments = new THREE.LineSegments(board, new THREE.LineDashedMaterial({ color: 0xffaa00, dashSize: 3, gapSize: 1 }))
    // lineSegments.computeLineDistances()

    // scene.add(lineSegments)
    scene.add(player.mesh)
        // scene.add(board)
}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 200, 0);
    scene.add(light);

    var lights = [];
    lights[0] = new THREE.DirectionalLight(0xffffff, 1);
    lights[0].position.set(1, 0, 0);

    lights.map(light => scene.add(light))
}

function updateScene() {
    // cube.rotation.x += .01;
    // board.rotation.x += .01;
    player.update()
}

function animate() {
    requestAnimationFrame(animate);
    updateScene()
    renderer.clear();
    renderer.render(scene, maincamera);
    renderer.render(scene, subcamera);
}

window.addEventListener('resize', () => {
    var ASPECT_RATIO = window.innerWidth / window.innerHeight;
    var WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
    var HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

    maincamera.aspect = ASPECT_RATIO;
    maincamera.updateProjectionMatrix();
    camera.aspect = ASPECT_RATIO;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false)

function main() {
    initScene()
    createObjects()
    createLights()
        // animate()
    setInterval(animate(), 1000)
}

main();