loader = new THREE.FBXLoader()

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

class Game {
    constructor() {
        $id('title').innerHTML = "\"4D\" SNAKE"
        $id('version').innerHTML = VERSION
        this.createRenderer()
        this.createCamera()
        this.createLights()

        this.score = 0
        this.currentLevel = 0
        this.debugMode = false
        this.gameOver = false
        this.paused = true
        this.hardcoreMode = true


        level = new Level()
        player = new Snake()
        this.startCountdown()

        window.addEventListener('resize', () => {
            ASPECT_RATIO = window.innerWidth / window.innerHeight
            SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio
            SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio

            tjs_camera.aspect = ASPECT_RATIO
            tjs_camera.updateProjectionMatrix()
            tjs_renderer.setSize(window.innerWidth, window.innerHeight)
        }, false)

        tjs_camera.position.set(...[level.size.x, level.size.y / 2, level.size.z])
        fitCameraToObject(tjs_camera, level.lineSegments, 0, tjs_controls)
    }

    createRenderer() {
        tjs_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        tjs_renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1)
        tjs_renderer.setSize(window.innerWidth, window.innerHeight)
        tjs_renderer.autoClear = false
        tjs_renderer.setClearColor(0x000000, 0.0)
        tjs_scene = new THREE.Scene()
        tjs_stats = new Stats()
        tjs_container = $id('canvas')
        tjs_container.append(tjs_renderer.domElement)
        tjs_container.append(tjs_stats.dom)
    }

    createCamera() {
        tjs_camera = new THREE.PerspectiveCamera(50, ASPECT_RATIO, 0.1, 1000)
        tjs_controls = new THREE.OrbitControls(tjs_camera, tjs_renderer.domElement)
        tjs_controls.target.set(0, -0.2, -0.2)
        tjs_controls.enableDamping = true
        tjs_controls.dampingFactor = 0.5
        tjs_controls.enableZoom = true
        tjs_controls.enablePan = false
        tjs_controls.touches = {
            ONE: () => console.log('test'),
            TWO: THREE.TOUCH.ROTATE
        }
    }

    createLights() {
        let light = new THREE.HemisphereLight(0xffffff, 0x444444)
        light.position.set(0, 200, 0)
        tjs_scene.add(light)
    }

    setGameOver() {
        this.gameOver = true
        this.levelStatus('GAME OVER')
    }

    setBeatLevel() {
        setTimeout(() => {
            this.levelStatus('NEXT LEVEL!!!')
            this.paused = true
            setTimeout(() => {
                console.log('changing level')
                this.levelStatus('')
                level.reset()
                level.initialize(...LEVELS[level.difficulty])
                while (level.loading) {
                    this.levelStatus('loading...')
                }
                this.startCountdown()
            }, 1500)
        }, 250)

    }

    updateScore() {
        $id('score').innerHTML = `Level ${level.difficulty+1}: ${this.score}`
    }

    startCountdown() {
        var count = 3
        var timer = setInterval(() => {
            if (count === 0) {
                this.paused = false
                clearInterval(timer)
                this.levelStatus('')
            } else {
                this.levelStatus(`Starting in...${count}`)
                count--
            }
        }, 1000)

    }
    animate() {
        requestAnimationFrame(this.animate.bind(this))
        if (!this.gameOver && !this.paused) {
            var delta = CLOCK.getDelta()
            if (tjs_animMixer) mixer.update(delta)

            level.update(delta)
            tjs_stats.update(delta)
            this.debug()
            this.updateScore()
        }
        tjs_controls.update()
        tjs_renderer.clear()
        tjs_renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
        tjs_renderer.render(tjs_scene, tjs_camera)
    }

    levelStatus(message) {
        $id('status').innerHTML = message
    }

    debug() {
        if (this.debugMode) {
            this.debugPlayer()
            this.debugPlayerMove()
            this.debugScene()
        } else {
            this.clearDebug()
        }
    }

    clearDebug() {
        $id('debugSceneInfo').innerHTML = ''
        $id('debugInfoL').innerHTML = ''
        $id('debugInfoR').innerHTML = ''
    }

    debugScene() {
            $id('debugSceneInfo').innerHTML = `${tjs_scene.children.map(c => `${c.name} : ${c.type}`).join('<br>')}`
    }
    
    debugPlayer() {
        $id('debugInfoL').innerHTML = `Snake Direction: (${printFloatArray(player.direction)}<br>(Snake Position:(${printFloatArray(player.position)})<br>moveQueue:${player.moveQueue.length}<br>trail:${JSON.stringify(player.tail.trailRounded)}`
    }

    debugPlayerMove() {
        $id('debugInfoR').innerHTML = `Made turn on position ${printFloatArray(player.mesh.position.toArray())}<br>canMove?:${Boolean(Math.floor(player.moveTicker%MOVE_TICKER_COMPARE))}<br>trailLength (increments of ${MOVE_TICKER_COMPARE}):${player.tail.trailInterpolated.length}`
    }
}

game = new Game()
game.animate()