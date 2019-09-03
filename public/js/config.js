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
    boardSize = 10,
    food = []
const KEYCODES = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    w: 87,
    s: 83,
    a: 65,
    d: 68
}

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