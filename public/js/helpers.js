function generateRandomPosition() {
    return [Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE)]
}

function radToDeg(rad) {
    return Math.floor(rad * 180 / Math.PI)
}

function quatToEulerDegrees(quaternion) {
    return new THREE.Euler().setFromQuaternion(quaternion).toArray().map(p => radToDeg(p))

}

function arrayCompare(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((p, i) => arr2[i] === p)
}

function arrayCompareClose(arr1, arr2, tolerance) {
    return arr1.length === arr2.length && arr1.every((p, i) => Math.abs(arr2[i] - p) < tolerance)
}

function printFloatArray(floatArray) {
    return `(${floatArray.map(f=>f.toFixed(2)).join(',')})`
}