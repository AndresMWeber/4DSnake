var ASPECT_RATIO = window.innerWidth / window.innerHeight
var SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio
var SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio

// TODO:  HAVE THESE BE MODIFIABLE AND AUTO UPDATING ON THE GAME INSTANCE.
var DEFAULT_SPEED = .05
var MOVE_TICKER_COMPARE = 1 / DEFAULT_SPEED

var BOARD_SIZE = 11
var BOARD_OFFSET = (BOARD_SIZE - 1) / 2
const HALF_PI = Math.PI / 2
var CLOCK = new THREE.Clock()
var $id = document.getElementById.bind(document)
var $class = document.getElementsByClassName.bind(document)

var gameInstance,
    loader,
    renderer,
    container,
    controls,
    scene,
    camera,
    player,
    board,
    mixer,
    floorXform,
    floorIndicators = [],
    foods = [],
    colliders = []

const KEYCODES = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    w: 87,
    s: 83,
    a: 65,
    d: 68,
    q: 69,
    e: 81
}

var rotationLookup = {
    'right': {
        "0": [0, -HALF_PI, 0, "ZXY"],
        "1": [HALF_PI, -HALF_PI, 0, 'ZXY'],
        "-1": [-HALF_PI, -HALF_PI, 0, 'ZXY']
    },
    'left': {
        "0": [0, HALF_PI, 0, "ZXY"],
        "1": [HALF_PI, HALF_PI, 0, 'ZXY'],
        "-1": [-HALF_PI, HALF_PI, 0, 'ZXY']
    },
    'down': {
        "1": [HALF_PI, 0, 0, "ZXY"],
        "0": [-HALF_PI, 0, 0, "ZXY"]
    },
    'up': {
        "1": [-HALF_PI, 0, 0, "ZXY"],
        "0": [HALF_PI, 0, 0, "ZXY"]
    },
    'rollL': [0, 0, -HALF_PI, "ZXY"],
    'rollR': [0, 0, HALF_PI, "ZXY"],
}

var mat_collider = new THREE.MeshBasicMaterial({
    opacity: 0,
    transparent: true
})

var mat_flat_blue = new THREE.MeshBasicMaterial({
    color: 0x48C4DA,
    opacity: .1,
    transparent: true
})

var mat_flat_orange = new THREE.MeshLambertMaterial({
    color: 0xFBB059
})

var mat_dark_orange = new THREE.MeshPhongMaterial({
    color: 0xCA4E2B
})

var mat_cornea = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 1,
    transparent: true,
    opacity: .3
})

var mat_sclera = new THREE.MeshPhongMaterial({
    color: 0xffffff
})

var mat_mid_blue = new THREE.MeshBasicMaterial({
    color: 0x365E81
})

var mat_mid_highlight = new THREE.MeshBasicMaterial({
    color: 0x36FFFF
})

var board_material = new THREE.LineBasicMaterial({
    color: 0xFCEF9F,
    linewidth: 5
});

var dashline_material = new THREE.LineBasicMaterial({
    color: 0xffaa00,
    linewidth: 5
})

var dashline_indicator_material = new THREE.LineDashedMaterial({
    color: 0x5ad6ca,
    dashSize: 1,
    gapSize: 2
})

var dashline_indicator_inactive_material = new THREE.LineDashedMaterial({
    color: 0x5ad6ca,
    dashSize: 1,
    gapSize: 2,
    opacity: .1,
    transparent: true
})

var snakeMaterialsLookup = {
    'head_GEO': mat_flat_orange,
    'l_sclera_GEO': mat_sclera,
    'r_sclera_GEO': mat_sclera,
    'l_cornea_GEO': mat_cornea,
    'r_cornea_GEO': mat_cornea,
}