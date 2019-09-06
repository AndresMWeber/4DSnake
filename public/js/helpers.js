var generateRandomPosition = () => [Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE)]

var radToDeg = (rad) => Math.floor(rad * 180 / Math.PI)

var quatToEulerDegrees = quaternion => new THREE.Euler().setFromQuaternion(quaternion).toArray().map(p => radToDeg(p))

var arrayCompare = (arr1, arr2) => arr1.length === arr2.length && arr1.every((p, i) => arr2[i] === p)

var arrayCompareClose = (arr1, arr2, tolerance) => arr1.length === arr2.length && arr1.every((p, i) => Math.abs(arr2[i] - p) < tolerance)

var printFloatArray = floatArray => `(${floatArray.map(f=>f.toFixed(2)).join(',')})`