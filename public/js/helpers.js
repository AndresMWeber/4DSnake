const generateRandomPosition = (x, y, z) => [Math.floor(Math.random() * x), Math.floor(Math.random() * y), Math.floor(Math.random() * z)]

const radToDeg = (rad) => Math.floor(rad * 180 / Math.PI)

const quatToEulerDegrees = quaternion => new THREE.Euler().setFromQuaternion(quaternion).toArray().map(p => radToDeg(p))

const arrayCompare = (arr1, arr2) => arr1.length === arr2.length && arr1.every((p, i) => arr2[i] === p)

const arrayCompareClose = (arr1, arr2, tolerance) => arr1.length === arr2.length && arr1.every((p, i) => Math.abs(arr2[i] - p) < tolerance)

const printFloatArray = floatArray => `(${floatArray.map(f=>f.toFixed(2)).join(',')})`

const choice = array => array[Math.floor(Math.random() * array.length)]

const executeUntil = (conditionCallback, executionCallback, finalCallback, time) => {
    var intervalID = setInterval(function() {
        if (conditionCallback()) {
            finalCallback()
            clearInterval(intervalID);
        }
        executionCallback()
    }, time)
}

const fitCameraToObject = function(camera, object, offset, controls) {
    offset = offset || 1.25;
    const boundingBox = new THREE.Box3()
    boundingBox.setFromObject(object)
    var center = new THREE.Vector3()
    var size = new THREE.Vector3()
    boundingBox.getCenter(center)
    boundingBox.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2))
    cameraZ *= offset

    tjs_scene.updateMatrixWorld()
    var objectWorldPosition = new THREE.Vector3()
    objectWorldPosition.setFromMatrixPosition(object.matrixWorld)

    const directionVector = camera.position.sub(objectWorldPosition)
    const unitDirectionVector = directionVector.normalize()
    camera.position = unitDirectionVector.multiplyScalar(cameraZ)

    var startRotation = new THREE.Quaternion()
    startRotation.copy(camera.quaternion)
    camera.lookAt(objectWorldPosition)
    var endRotation = new THREE.Quaternion()
    endRotation.copy(camera.quaternion)
    camera.quaternion.copy(startRotation)

    const minZ = boundingBox.min.z
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ

    camera.far = cameraToFarEdge * 3
    camera.updateProjectionMatrix()

    if (controls) {
        controls.target = center
        controls.maxDistance = cameraToFarEdge * 2
        controls.saveState()
    } else {
        camera.lookAt(center)
    }
}