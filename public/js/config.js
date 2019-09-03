var AMOUNT = 6
var ASPECT_RATIO = window.innerWidth / window.innerHeight
var SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio
var SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio
var loader,
    renderer,
    scene,
    camera,
    player,
    board,
    mixer,
    boardSize = 10,
    floor,
    floorIndicators = [],
    foods = [],
    colliders = []
clock = new THREE.Clock();

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

var mat_collider = new THREE.MeshToonMaterial({
    opacity: 0,
    transparent: true,
    shading: THREE.FlatShading
})

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
    shading: THREE.SmoothShading
})

var mat_dark_orange = new THREE.MeshPhongMaterial({
    ambient: 0x000000,
    color: 0xCA4E2B,
    specular: 0x000000,
    shininess: 0,
    shading: THREE.SmoothShading
})

var mat_mid_blue = new THREE.MeshPhongMaterial({
    ambient: 0x000000,
    color: 0x365E81,
    specular: 0x000000,
    shininess: 0,
    shading: THREE.FlatShading
})

var board_material = new THREE.LineBasicMaterial({
    color: 0xFCEF9F,
    linewidth: 2
});

var dashline_material = new THREE.LineDashedMaterial({
    color: 0xffaa00,
    dashSize: 3,
    gapSize: 1
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