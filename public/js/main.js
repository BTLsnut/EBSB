import {windowOnloadEvent} from "./event/window_event.js"
import {cursor_click_handler} from "./event/cursor_event.js";
import {initialize} from "./event/request_event.js";

let preload_player = [];
let main_player = dashjs.MediaPlayer().create();
let cur_node = {};
let video_dom = null;
let t = 0;
let can_play = true;
let start_state = false;
let viewpoint_compensation = {viewpoint: 0, t: 0};
let global_pos;
const deg = 45;
let AFRAME_WIDTH;
let AFRAME_HEIGHT;
let current_node;
let player
;
// addWindowEvent()
window.onload = function () {
    windowOnloadEvent();
    AFRAME.registerSystem('main', {
        schema: {
            position: {type: 'string', default: ''}
        },
        init: function () {
            console.log("init");
            global_pos = this.data.position;
            $("#play_pause").click(cursor_click_handler);

            let videosphere = document.querySelector('#vr_view');

            if (global_pos === 'seoultech') {
                videosphere.setAttribute('rotation', {x:0, y: 270, z: 0});
                AFRAME_WIDTH = 8;
                AFRAME_HEIGHT = 4;
            } else if (global_pos === 'hangkong') {
                videosphere.setAttribute('rotation', {x:0, y: 135, z: 0});
                AFRAME_WIDTH = 8;
                AFRAME_HEIGHT = 4;
            } else if (global_pos === 'hangkong2') {
                videosphere.setAttribute('rotation', {x:0, y: -20, z: 0});
                AFRAME_WIDTH = 4;
                AFRAME_HEIGHT = 8;
            } else {
                throw Error('Not Implement Error')
            }
            let cam = document.querySelector('#camera');
            cam.setAttribute('rotation', {
                x: 0,
                y: -180,
                z: 0
            });

            initialize(global_pos).then(function (result) {
                current_node = result[0];
                player = result[1];
                console.log(current_node);
                console.log(player);
            });
        },
        tick: function (d, dt) {
            // console.log($("#camera").attr('rotation'));
            let yaw = $("#camera").attr('rotation').y;

            if (yaw >= 360)
                yaw -= 360;

            if (yaw < -360)
                yaw += 360;

            let minimap_yaw = deg - yaw;

            let diff = viewpoint_compensation.viewpoint - yaw > 0 ?
                viewpoint_compensation.viewpoint - yaw : yaw - viewpoint_compensation.viewpoint;
            viewpoint_compensation.t += dt;
            if (viewpoint_compensation.t >= 2000) {
                if (diff >= 30) {
                    console.log("diff is " + diff);
                    viewpoint_compensation.viewpoint = yaw;
                }
                viewpoint_compensation.t = 0;
                console.log("update viewpoint com: " + viewpoint_compensation.viewpoint);
            }
            let pos = this.data.position;
            if (pos === 'seoultech') {
                document.querySelector('#m_camera').style.transform = "rotate(" + minimap_yaw + "deg)";
            } else if (pos === 'hangkong') {
                document.querySelector('#m_camera').style.transform = "rotate(" + (minimap_yaw) + "deg)";
            } else if (pos === 'hangkong2') {
                document.querySelector('#m_camera').style.transform = "rotate(" + minimap_yaw + "deg)";
            } else {
                throw Error('Not Implement error')
            }
            // console.log(viewpoint_compensation.viewpoint);
        }
    });
};

