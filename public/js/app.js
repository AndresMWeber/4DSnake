loader = new THREE.FBXLoader();

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
            player.rollLeft()
            break;
        case (KEYCODES.e):
            player.rollRight()
            break;
        case (KEYCODES.left):
            camera.rotation.y -= .1;
            camera.updateProjectionMatrix();
            break;
        case (KEYCODES.right):
            console.log(camera.rotation)
            camera.rotation.y += .1;
            camera.updateProjectionMatrix();
            break;
        case (KEYCODES.up):
            camera.zoom += .05;
            camera.updateProjectionMatrix();
            break;
        case (KEYCODES.down):
            camera.zoom -= .05;
            camera.updateProjectionMatrix();
            break;
    }
}

class Game {
    constructor() {
        this.createRenderer()
        this.createCamera()
        this.createScene()
        this.createLights()

        this.level = new Level(Math.floor(BOARD_SIZE / 2))
        this.gameOver = false
        this.stats = new Stats()
        this.debugMode = false

        container = document.getElementById('canvas')
        container.appendChild(renderer.domElement)
        container.appendChild(this.stats.dom)
        $id('title').innerHTML = "\"4D\" SNAKE"

        window.addEventListener('resize', () => {
            ASPECT_RATIO = window.innerWidth / window.innerHeight;
            SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio;
            SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio;

            camera.aspect = ASPECT_RATIO;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false)
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
        camera.position.x = BOARD_SIZE
        camera.position.y = BOARD_SIZE / 2
        camera.position.z = BOARD_SIZE

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
        requestAnimationFrame(this.animate.bind(this))
        if (!this.gameOver) {
            var delta = CLOCK.getDelta()
            if (mixer) mixer.update(delta)
            this.level.update(delta)
            this.stats.update(delta)
        }
        renderer.clear()
        renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
        renderer.render(scene, camera)
    }
}

gameInstance = new Game()
gameInstance.animate()