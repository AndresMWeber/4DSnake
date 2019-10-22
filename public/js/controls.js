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

// tjs_renderer.domElement.addEventListener('touchstart', onDocumentTouchStart, { passive: true })
// tjs_renderer.domElement.addEventListener('touchmove', onDocumentTouchMove, false);
// tjs_renderer.domElement.addEventListener('touchend', onDocumentTouchEnd, false);
// document.createElement('button')

tjs_renderer.domElement.addEventListener("touchstart", startTouch, false);
tjs_renderer.domElement.addEventListener("touchmove", moveTouch, false);

var initialX = null;
var initialY = null;

function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
};

document.onload(
    isMobileDevice() && tjs_scene.remove(player.compass.group)
)

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

function moveTouch(e) {
    if (initialX === null || initialY === null) return

    var currentX = e.touches[0].clientX;
    var currentY = e.touches[0].clientY;

    var diffX = initialX - currentX;
    var diffY = initialY - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            player.addMove(player.left.bind(player))
        } else {
            player.addMove(player.right.bind(player))
        }
    } else {
        if (diffY > 0) {
            player.addMove(player.pitchUp.bind(player))
        } else {
            player.addMove(player.pitchDown.bind(player))
        }
    }

    initialX = null;
    initialY = null;

    e.preventDefault();
};


function onDocumentTouchMove(event) {
    if (event.touches.length == 2) {
        event.preventDefault();
        touch_info = event.touches
        tjs_camera.rotation.x += 2
    }
}

function onDocumentTouchEnd(event) {
    touch_info = []
}