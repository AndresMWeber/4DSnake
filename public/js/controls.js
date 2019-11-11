var lat,
    lon,
    TOUCH_AREA_Y_BOTTOM_START = SCREEN_HEIGHT - SCREEN_HEIGHT * .3,
    TOUCH_AREA_Y_TOP_END = SCREEN_HEIGHT * .3

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case (KEY_CODES.w):
            player.addMove(player.pitchUp.bind(player))
            break;
        case (KEY_CODES.a):
            player.addMove(player.left.bind(player))
            break;
        case (KEY_CODES.s):
            player.addMove(player.pitchDown.bind(player))
            break;
        case (KEY_CODES.d):
            player.addMove(player.right.bind(player))
            break;
        case (KEY_CODES.left):
            camera.rotation.y -= .1
            camera.updateProjectionMatrix()
            break;
        case (KEY_CODES.right):
            camera.rotation.y += .1
            camera.updateProjectionMatrix()
            break;
        case (KEY_CODES.up):
            camera.zoom += .05
            camera.updateProjectionMatrix()
            break;
        case (KEY_CODES.down):
            camera.zoom -= .05
            camera.updateProjectionMatrix()
            break;
    }
}


window.onload = () => {
    isMobileDevice() && tjs_scene.remove(player.compass.group)

    tjs_controls = new THREE.OrbitControls(tjs_camera, tjs_renderer.domElement)
    tjs_controls.target.set(0, 0, 0)
    tjs_controls.enableDamping = true
    tjs_controls.dampingFactor = 1
    tjs_controls.enableZoom = true
    tjs_controls.enablePan = false
    tjs_controls.touches = {
        ONE: null,
        TWO: THREE.TOUCH.ROTATE,
        THREE: THREE.TOUCH.PAN
    }
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};
