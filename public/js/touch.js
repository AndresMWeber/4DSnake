function onDocumentTouchStart(event) {

    if (event.touches.length == 1) {

        console.log('1');
        event.preventDefault();


        onPointerDownPointerX = event.touches[0].pageX;
        onPointerDownPointerY = event.touches[0].pageY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;

        detectHotspotClick();

    }

    if (event.touches.length == 2) {

        console.log('2');
        _state = STATE.TOUCH_ZOOM_PAN;
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);

    }

}

function onDocumentTouchMove(event) {

    if (event.touches.length == 1) {

        event.preventDefault();

        lon = (onPointerDownPointerX - event.touches[0].pageX) * 0.1 + onPointerDownLon;
        lat = (event.touches[0].pageY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

    }

    if (event.touches.length == 2) {

        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

        var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
        _touchZoomDistanceStart = _touchZoomDistanceEnd;
        setZoom(camera.fov * factor);

    }

}

function onDocumentTouchEnd(event) {

    _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

}

function setZoom(fov) {

    camera.fov = fov;

    if (camera.fov < 30) camera.fov = 30;
    if (camera.fov > 100) camera.fov = 100;

    camera.updateProjectionMatrix();

}