function current_state_update(state, node) {
    console.log(state, node);
    state.prev = state.cur;
    state.cur = node.id;
    state.pos = node.pos
}

function update_player(moveable_list, preload_p_list) {
    return function () {
        for (let idx in preload_p_list) {
            if (!moveable_list.includes(idx)) {
                delete preload_p_list[idx];
            }
        }

        for (let idx in moveable_list) {
            let p = dashjs.MediaPlayer().create();
            p.initialize(null, moveable_list[idx].src, true);
            // p.preload();
            preload_p_list[idx] = p;
        }
        console.log('preload player update!');
        console.log(preload_p_list);

    }
}

function calibrate_camera(state) {
    let camera = document.querySelector('#camera');
    camera.setAttribute('position', state.pos);
    camera.setAttribute('rotation', {
        x: 0,
        y: 180,
        z: 0
    });

    // if (cur_node.cur === 'v8') {
    //     let videosphere = document.querySelector('#vr_view');
    //     videosphere.setAttribute('rotation', {
    //         x: 0,
    //         y: 90,
    //         z: 0
    //     });
    // } else {
    //     let videosphere = document.querySelector('#vr_view');
    //     videosphere.setAttribute('rotation', {
    //         x: 0,
    //         y: -90,
    //         z: 0
    //     });
    // }
}

function add_moveable(id_list) {
    return function () {
        let view_parent = document.querySelector("#view_sphere");
        for (let child of view_parent.childNodes) {
            if (Object.keys(id_list).includes(child.id))
                child.classList.add('moveable');
            else
                child.classList.remove('moveable');
        }
    }
}

export {calibrate_camera, add_moveable, current_state_update}