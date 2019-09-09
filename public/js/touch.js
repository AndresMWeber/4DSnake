tjs_renderer.domElement.addEventListener('touchstart', onDocumentTouchStart, false)

var lat,
    lon,
    TOUCH_AREA_Y_BOTTOM_START = SCREEN_HEIGHT - SCREEN_HEIGHT * .3,
    TOUCH_AREA_Y_TOP_END = SCREEN_HEIGHT * .3

function onDocumentTouchStart(event) {
    tjs_scene.remove(player.compass.group)
    if (event.touches.length == 1) {
        event.preventDefault();
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