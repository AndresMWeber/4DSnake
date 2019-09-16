var lat,
    lon,
    TOUCH_AREA_Y_BOTTOM_START = SCREEN_HEIGHT - SCREEN_HEIGHT * .3,
    TOUCH_AREA_Y_TOP_END = SCREEN_HEIGHT * .3

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

tjs_controls = new THREE.OrbitControls(tjs_camera, tjs_renderer.domElement)
tjs_controls.target.set(0, 0, 0)
tjs_controls.enableDamping = true
tjs_controls.dampingFactor = 1
tjs_controls.enableZoom = true
tjs_controls.enablePan = false

tjs_controls.touches = {
    TWO: THREE.TOUCH.ROTATE,
    THREE: THREE.TOUCH.DOLLY_PAN
}

tjs_renderer.domElement.addEventListener('touchstart', onDocumentTouchStart, false)
tjs_renderer.domElement.addEventListener('touchend', onTouchEnd, false);


function onDocumentTouchStart(event) {
    tjs_scene.remove(player.compass.group)
    if (event.touches.length == 1) {
        // event.preventDefault();
        lat = event.touches[0].pageX;
        lon = event.touches[0].pageY;
        if (lon > TOUCH_AREA_Y_BOTTOM_START || lon < TOUCH_AREA_Y_TOP_END) {
            lon < TOUCH_AREA_Y_TOP_END && player.addMove(player.pitchUp.bind(player))
            lon > TOUCH_AREA_Y_BOTTOM_START && player.addMove(player.pitchDown.bind(player))
        } else {
            lat < SCREEN_WIDTH / 2 && player.addMove(player.left.bind(player))
            lat > SCREEN_WIDTH / 2 && player.addMove(player.right.bind(player))
        }
    }
}