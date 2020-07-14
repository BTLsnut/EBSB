function windowOnloadEvent() {
    window.addEventListener('keydown', function (evt) {
        console.log("loaded1")
        if (window.event.keyCode === 32) {
            $("#play_pause").trigger('click');
        }
    });

    window.addEventListener('mousewheel', function (e) {
        console.log("loaded2")
        let wheel = e.wheelDelta < 0;
        let cam = document.querySelector('#camera');
        let dd = cam.getAttribute('camera').zoom;
        if (wheel) {
            // wheel down
            if (dd > 1)
                cam.setAttribute('camera', {
                    zoom: --dd
                });
        } else {
            // wheel up
            if (dd < 5)
                cam.setAttribute('camera', {
                    zoom: ++dd
                });
        }
    });
}

export {windowOnloadEvent}