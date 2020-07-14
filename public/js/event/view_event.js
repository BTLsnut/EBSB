import {calibrate_camera, add_moveable, current_state_update} from "../tools.js"

function view_click_handler(target_node, current_node, player) {
    return function () {
        if (current_node.node.id !== target_node.id) {
            console.log(target_node);
            let time = player.player[target_node.id].getPosition();
            let moveable = target_node.get_moveable_node();
            player.player[target_node.id].loadVideo({
                url:target_node.src,
                transport:"dash",
                autoPlay: false,
            });
            // else
            //     player.attachSource(preload_player[target_node.id].getSource());
            player.player[target_node.id].seekTo(time);

            // let tan = (Math.atan2(target_node.pos.z - current_node.pos.z, target_node.pos.x - current_node.pos.x) * (180 / Math.PI));
            // console.log("tan: " + tan);

            // current_state_update(current_node, target_node);
            add_moveable(moveable).call();
            // update_player(moveable, preload_player).call();
            calibrate_camera(current_node.node);

            // minimap update
            let t =  $("#m_" + target_node.id);
            t.addClass('active');
            $("#m_" + current_node.node.id).removeClass('active');
            $('#m_camera').css({
                top: t.css('top'),
                left: t.css('left'),
            });

            // 영상이 돌아가서 강제로 돌려준 코드
            // if (global_pos === 'hangkong2') {
            //     let videosphere = document.querySelector('#vr_view');
            //     console.log(node.id);
            //     if (node.id === 'set4') {
            //         videosphere.setAttribute('rotation', {x:0, y: -20, z: 0});
            //     } else if (node.id === 'set5'){
            //         videosphere.setAttribute('rotation', {x:0, y: 30, z: 0});
            //     } else {
            //         videosphere.setAttribute('rotation', {x:0, y: 90, z: 0});
            //
            //     }
            // }

        }
    };
}

function view_mouseover_hanlder(target_node, current_node) {
    return function () {
        console.log(target_node);
        console.log(current_node);
        let view = document.getElementById(target_node.id);
        let pos = view.getAttribute('position');
        let moveable = view.classList.contains("moveable");
        let arrow = document.querySelector('#arrow');
        let xx = target_node.pos.x - current_node.node.pos.x;
        let zz = target_node.pos.z - current_node.node.pos.z;
        let rotation = {
            x: 70,
            y: Math.atan2(xx, zz) * (180 / Math.PI),
            z: 90
        };
        target_node.pos.y = 0.5;
        let to_pos = {
            x: target_node.pos.x + xx / 3,
            y: target_node.pos.y,
            z: target_node.pos.z + zz / 3
        };
        arrow.setAttribute('position', pos);
        arrow.setAttribute('rotation', rotation);
        arrow.setAttribute('visible', "true");
        arrow.setAttribute('animation', {
            property: 'position',
            from: target_node.pos.x + " " + target_node.pos.y + " " + target_node.pos.z,
            to: to_pos.x + " " + to_pos.y + " " + to_pos.z,
            dur: 1000,
            loop: true
        });
        console.log(target_node.id + "의 위치: ("
            + target_node.pos.x + ", " + target_node.pos.y + ", " + target_node.pos.z + ") "
            + " moveable: " + moveable);
    };
}

function view_mouseleave_handler() {
    return function () {
        let arrow = document.querySelector('#arrow');
        arrow.setAttribute('visible', "false");
    }
}

export {view_mouseleave_handler, view_click_handler, view_mouseover_hanlder}