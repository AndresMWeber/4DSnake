loader = new THREE.FBXLoader()

function test() {
    console.log('test')
}

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case (KEYCODES.w):
            player.addMove(player.pitchUp.bind(player))
            break;
        case (KEYCODES.a):
            player.addMove(player.left.bind(player))
            break;
        case (KEYCODES.s):
            player.addMove(player.pitchDown.bind(player))
            break;
        case (KEYCODES.d):
            player.addMove(player.right.bind(player))
            break;
        case (KEYCODES.q):
            // player.rollLeft()
            break;
        case (KEYCODES.e):
            // player.rollRight()
            break;
        case (KEYCODES.left):
            camera.rotation.y -= .1
            camera.updateProjectionMatrix()
            break;
        case (KEYCODES.right):
            camera.rotation.y += .1
            camera.updateProjectionMatrix()
            break;
        case (KEYCODES.up):
            camera.zoom += .05
            camera.updateProjectionMatrix()
            break;
        case (KEYCODES.down):
            camera.zoom -= .05
            camera.updateProjectionMatrix()
            break;
    }
}

const fitCameraToObject = function(camera, object, offset, controls) {
    offset = offset || 1.25;
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);
    const center = boundingBox.getCenter();
    const size = boundingBox.getSize();
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2))
    cameraZ *= offset;

    scene.updateMatrixWorld();
    var objectWorldPosition = new THREE.Vector3();
    objectWorldPosition.setFromMatrixPosition(object.matrixWorld);

    const directionVector = camera.position.sub(objectWorldPosition);
    const unitDirectionVector = directionVector.normalize();
    camera.position = unitDirectionVector.multiplyScalar(cameraZ);
    camera.lookAt(objectWorldPosition);

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if (controls) {
        controls.target = center;
        controls.maxDistance = cameraToFarEdge * 2;
        controls.saveState();
    } else {
        camera.lookAt(center)
    }
}
class Game {
    constructor() {
        this.createRenderer()
        this.createCamera()
        this.createLights()

        this.score = 0
        this.debugMode = false
        this.gameOver = false
        this.stats = new Stats()
        this.level = new Level(Math.floor(BOARD_SIZE / 2))

        tjs_container = $id('canvas')
        tjs_container.append(tjs_renderer.domElement)
        tjs_container.append(this.stats.dom)
        $id('title').innerHTML = "\"4D\" SNAKE"

        window.addEventListener('resize', () => {
            ASPECT_RATIO = window.innerWidth / window.innerHeight
            SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio
            SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio

            tjs_camera.aspect = ASPECT_RATIO
            tjs_camera.updateProjectionMatrix()
            tjs_renderer.setSize(window.innerWidth, window.innerHeight)
        }, false)
        fitCameraToObject(camera, this.level.lineSegments, 0, controls)
    }

    createRenderer() {
        tjs_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        tjs_renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1)
        tjs_renderer.setSize(window.innerWidth, window.innerHeight)
        tjs_renderer.autoClear = false
        tjs_renderer.setClearColor(0x000000, 0.0)
        tjs_scene = new THREE.Scene()
    }

    createCamera() {
        tjs_camera = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.1, 1000)
        tjs_camera.position.x = BOARD_SIZE
        tjs_camera.position.y = BOARD_SIZE / 2
        tjs_camera.position.z = BOARD_SIZE

        tjs_controls = new THREE.OrbitControls(tjs_camera, tjs_renderer.domElement)
        tjs_controls.target.set(0, -0.2, -0.2)
        tjs_controls.enableDamping = true
        tjs_controls.dampingFactor = 0.5
        tjs_controls.enableZoom = true
        tjs_controls.enablePan = false
        tjs_controls.touches = {
            ONE: test,
            TWO: THREE.TOUCH.ROTATE
        }
    }

    createLights() {
        let light = new THREE.HemisphereLight(0xffffff, 0x444444)
        light.position.set(0, 200, 0)
        tjs_scene.add(light)
    }

    debugLeft(message) {
        if (this.debugMode) $id('debugInfoL').innerHTML = message
    }

    debugRight(message) {
        if (this.debugMode) $id('debugInfoR').innerHTML = message
    }

    levelStatus(message) {
        $id('status').innerHTML = message
    }

    setGameOver() {
        this.gameOver = true
        this.levelStatus('GAME OVER')
    }

    animate() {
        tjs_controls.update();
        requestAnimationFrame(this.animate.bind(this))
        if (!this.gameOver) {
            var delta = CLOCK.getDelta()
            if (tjs_animMixer) mixer.update(delta)
            this.level.update(delta)
            this.stats.update(delta)
        }
        tjs_renderer.clear()
        tjs_renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
        tjs_renderer.render(tjs_scene, tjs_camera)
    }
}

game = new Game()
game.animate()