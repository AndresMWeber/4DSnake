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

const VERSION = "0.3.3"
var ASPECT_RATIO = window.innerWidth / window.innerHeight
var SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio
var SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio

const $id = document.getElementById.bind(document)
const $class = document.getElementsByClassName.bind(document)
const DEFAULT_ROTATION_ORDER = 'ZXY'
const HALF_PI = Math.PI / 2
const CLOCK = new THREE.Clock()

// DYNAMIC GAME VARS
var DEFAULT_SPEED = .05
var MOVE_TICKER_COMPARE = 1 / DEFAULT_SPEED

const LEVELS = [
    [2, 1, 5],
    [4, 1, 7],
    [8, 1, 11],
    [6, 3, 9],
    [9, 5, 7],
    [11, 11, 11],
    [4, 9, 9],
    [6, 9, 9],
    [8, 9, 9],
    [7, 7, 7],
    [9, 7, 7],
    [11, 7, 7]
]

var tjs_FBXLoader,
    tjs_renderer,
    tjs_container,
    tjs_controls,
    tjs_scene,
    tjs_camera,
    tjs_animMixer,
    tjs_stats

var game,
    level,
    player,
    board

const rotationLookup = {
    'right': {
        "0": [0, -HALF_PI, 0, DEFAULT_ROTATION_ORDER],
        "1": [HALF_PI, -HALF_PI, 0, DEFAULT_ROTATION_ORDER],
        "-1": [-HALF_PI, -HALF_PI, 0, DEFAULT_ROTATION_ORDER]
    },
    'left': {
        "0": [0, HALF_PI, 0, DEFAULT_ROTATION_ORDER],
        "1": [HALF_PI, HALF_PI, 0, DEFAULT_ROTATION_ORDER],
        "-1": [-HALF_PI, HALF_PI, 0, DEFAULT_ROTATION_ORDER]
    },
    'down': {
        "1": [HALF_PI, 0, 0, DEFAULT_ROTATION_ORDER],
        "0": [-HALF_PI, 0, 0, DEFAULT_ROTATION_ORDER]
    },
    'up': {
        "1": [-HALF_PI, 0, 0, DEFAULT_ROTATION_ORDER],
        "0": [HALF_PI, 0, 0, DEFAULT_ROTATION_ORDER]
    },
    'rollL': [0, 0, -HALF_PI, DEFAULT_ROTATION_ORDER],
    'rollR': [0, 0, HALF_PI, DEFAULT_ROTATION_ORDER],
}

const tjs_materials = {
    collider: new THREE.MeshBasicMaterial({
        opacity: 0,
        transparent: true
    }),

    flat_blue: new THREE.MeshBasicMaterial({
        color: 0x48C4DA,
        opacity: .1,
        transparent: true
    }),

    flat_orange: new THREE.MeshLambertMaterial({
        color: 0xFBB059
    }),

    dark_orange: new THREE.MeshPhongMaterial({
        color: 0xCA4E2B
    }),

    cornea: new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 1,
        transparent: true,
        opacity: .3
    }),

    sclera: new THREE.MeshPhongMaterial({
        color: 0xffffff
    }),

    mid_blue: new THREE.MeshBasicMaterial({
        color: 0x365E81
    }),

    arrow: new THREE.MeshBasicMaterial({
        color: 0x0063AA,
        transparent: true
    }),

    arrow_highlight: new THREE.MeshBasicMaterial({
        color: 0xFFAFFF
    }),

    mid_highlight: new THREE.MeshBasicMaterial({
        color: 0x36FFFF
    }),

    board: new THREE.LineBasicMaterial({
        color: 0xFCEF9F,
        linewidth: 5
    }),

    dashline: new THREE.LineBasicMaterial({
        color: 0xffaa00,
        linewidth: 5
    }),

    indicator: new THREE.LineDashedMaterial({
        color: 0x5ad6ca,
        dashSize: 1,
        gapSize: 2
    }),

    indicator_inactive: new THREE.LineDashedMaterial({
        color: 0x5ad6ca,
        dashSize: 1,
        gapSize: 2,
        opacity: .1,
        transparent: true
    }),

    pointsX: new THREE.PointsMaterial({
        size: .1,
        sizeAttenuation: true,
        color: 0xf56942,
    }),

    pointsY: new THREE.PointsMaterial({
        size: .1,
        sizeAttenuation: true,
        color: 0x90f542,
    }),

    pointsZ: new THREE.PointsMaterial({
        size: .1,
        sizeAttenuation: true,
        color: 0x4287f5,
    })
}

const snakeMaterialsLookup = {
    'head_GEO': tjs_materials.flat_orange,
    'l_sclera_GEO': tjs_materials.sclera,
    'r_sclera_GEO': tjs_materials.sclera,
    'l_cornea_GEO': tjs_materials.cornea,
    'r_cornea_GEO': tjs_materials.cornea,
}

const letters = {
    w: [
        [1.17928706909, 2.58843040466, 0.0],
        [1.17928706909, 0.900517598957, 0.0],
        [1.03366321941, 1.32385314489e-07, 0.0],
        [0.768892583615, 1.32385314489e-07, 0.0],
        [0.18639718487, 1.19176503356, 0.0],
        [-0.18639718487, 1.19176503356, 0.0],
        [-0.768892583615, 0.0, 0.0],
        [-1.03366314675, 1.32385309826e-07, 0.0],
        [-1.17928706909, 0.900517582893, 0.0],
        [-1.17928706909, 2.58843040466, 0.0],
    ],
    a: [
        [1.0, 0.0, 0.0],
        [1.0, 1.30674637476, 0.0],
        [0.36824465974, 2.58843013116, 0.0],
        [-0.410463792704, 2.58843013116, 0.0],
        [-1.00000001532, 1.30674856926, 0.0],
        [-0.999999984683, 0.0, 0.0],
        [-0.999999984683, 1.0, 0.0],
        [1.0, 1.0, 0.0],
    ],
    s: [
        [-0.996973808569, 0.0, 0.0],
        [0.520386664141, 0.0, 0.0],
        [0.718964640986, 0.112824891279, 0.0],
        [0.824872762918, 0.271687272755, 0.0],
        [0.824873027688, 0.973329457608, 0.0],
        [0.745441704565, 1.1057147755, 0.0],
        [0.54686372772, 1.21162302982, 0.0],
        [-0.525457347243, 1.43667807025, 0.0],
        [-0.697558260509, 1.51610926098, 0.0],
        [-0.750512387667, 1.64849457888, 0.0],
        [-0.750512387667, 2.32365970015, 0.0],
        [-0.65784266514, 2.49576061342, 0.0],
        [-0.485741751874, 2.58843053705, 0.0],
        [0.996973808569, 2.58843053705, 0.0],
    ],
    d: [
        [-1.0, 9.78021308384e-08, 0.0],
        [-1.0, 2.58843040466, 0.0],
        [0.440955473403, 2.58843040466, 0.0],
        [0.666010381442, 2.522237677, 0.0],
        [0.877826890076, 2.36337529552, 0.0],
        [1.0, 2.15155878689, 0.0],
        [1.0, 0.404072590652, 0.0],
        [0.877827154847, 0.205494613807, 0.0],
        [0.666010646212, 0.0466322323311, 0.0],
        [0.440955473403, -9.78021306164e-08, 0.0],
        [-1.0, 9.78021308384e-08, 0.0],
    ],
    arrow: [
        [-7, 0, 0],
        [0, 10, 0],
        [7, 0, 0],
        [3, 0, 0],
        [3, -10, 0],
        [3, -10, 0],
        [-3, 0, 0],
        [-7, 0, 0],
    ]
}