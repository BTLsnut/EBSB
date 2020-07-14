import * as viewEvent from "./view_event.js";
import {add_moveable} from "../tools.js";
import Node from "../node.js";

function request_data(position) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: '/transfer',                //주소
            dataType: 'json',                  //데이터 형식
            type: 'POST',                      //전송 타입
            data: {position: position},
            // data: {'msg': $('#msg').val()},      //데이터를 json 형식, 객체형식으로 전송
            success: function (result) {          //성공했을 때 함수 인자 값으로 결과 값 나옴
                resolve(result)
            },
            error: function (err) {
                reject(err)
            }//function 끝
        });
    });
}


function requested_data_handler(current_node) {
    return async function (result) {
        const MIN_DISTANCE = 10;
        let node_link = [];
        let initial_index = Math.round(result.length / 2);
        for (let item of result) {
            let name = item.filename.split('.')[0];
            node_link[name] = new Node(item);
        }
        for (let i in node_link) {
            for (let j in node_link) {
                if (i !== j)
                    node_link[i].weight_link(node_link[j], MIN_DISTANCE);
            }
        }
        current_node.node = node_link["v" + initial_index];
        console.log(node_link);
        console.log(current_node);
        return node_link;
    };
    // main_player.updateSettings({
    //     debug: {
    //         logLevel: dashjs.Debug.LOG_LEVEL_INFO
    //     },
    //     abr: {
    //         maxBitrate: {video: 1000}
    //     },
    //     streaming: {
    //         bufferToKeep : 0,
    //         bufferPruningInterval: 5,
    //         cacheLoadThresholds: {video:5, audio:5},
    //         lastMediaSettingsCachingInfo: {enabled: false}
    //     },
    //     // streaming: {
    //     //     lastBitrateCachingInfo: {enabled: false},
    //     //     cacheLoadThresholds: {audio: 50},
    //     //     retryIntervals: {
    //     //         MPD: 500,
    //     //         XLinkExpansion: 500,
    //     //         InitializationSegment: 3000,
    //     //         IndexSegment: 3000,
    //     //         MediaSegment: 3000,
    //     //         BitstreamSwitchingSegment: 3000,
    //     //         other: 3000
    //     //     },
    //     // }
    // });
    // main_player.on('canPlay', function (evt) {
    //     can_play = true;
    //     if (start_state)
    //         main_player.play();
    //
    //     console.log('can_play');
    // });
    // main_player.on('streamInitialized', function () {
    //     console.log('stream init');
    //     // main_player.getVideoElement().currentTime = t;
    // });
    // main_player.on('streamTeardownComplete', function () {
    //     console.log('stream teardown complete')
    // });
    // main_player.on('playbackPaused', function () {
    //     // t = main_player.duration() * (main_player.time / 100);
    // });
    // main_player.on('playbackSeeking', function () {
    //     console.log('seeking');
    // });
    // main_player.on('playbackSeeked', function (evt) {
    //     console.log('seek end');
    // });
    // main_player.on('playbackSeekAsked', function (evt) {
    //     console.log('seek asked');
    // });
    // main_player.on('error', function (evt) {
    //     console.error(evt);
    // });
    // main_player.on('bufferEmpty', function () {
    //     console.log('buffer empty');
    // });
    // main_player.on('bufferLevelStateChange', function () {
    //     console.log('buffer level state change');
    // });
    // main_player.on('buffer loaded', function () {
    //     console.log('buffer loaded');
    // });
    // main_player.on('playbackEnded', function () {
    //     console.log('video end');
    // });
    // main_player.on('manifestLoaded', function () {
    //     console.log('manifest loaded');
    // });
    // main_player.on('periodSwitchComplete', function () {
    //     console.log('preriod switch complete');
    // });
    // main_player.on('periodSwitchStarted', function () {
    //     console.log('period switch started')
    // });

    let camera = document.querySelector('#camera');
    camera.setAttribute('position', current_node.node.pos);

    // video_dom = document.querySelector('#main_view');
    // main_player.initialize(video_dom, node_link[cur_node.cur].src, false);
    // preload_seg(node_link);
}

function create_view(current_node, player) {

    return async function (node_link) {
        // let initial_view_id = initial.fileId;
        console.log(node_link);
        console.log(current_node);
        let moveable = current_node.node.get_moveable_node();

        for (let id in node_link) {

            let parent = document.querySelector('#view_sphere');
            let view = document.createElement('a-entity');
            parent.appendChild(view);

            view.setAttribute("id", id);
            view.setAttribute('material', {
                alphaTest: 1,
                opacity: 0
            });
            view.setAttribute('geometry', {
                primitive: 'box',
                width: 0.5,
                height: 0.5,
                depth: 0.5
            });
            view.setAttribute('position', node_link[id].pos);
            view.setAttribute('scale', {
                x: 1.5,
                y: 1.5,
                z: 1.5
            });

            view.addEventListener('click', viewEvent.view_click_handler(node_link[id], current_node, player));
            view.addEventListener('mouseenter', viewEvent.view_mouseover_hanlder(node_link[id], current_node));
            view.addEventListener('mouseleave', viewEvent.view_mouseleave_handler());
            let tmp_video_element = document.createElement('video');
            tmp_video_element.setAttribute('id', id);
            console.log(tmp_video_element);
            let tmp_player = new RxPlayer({
                videoElement: tmp_video_element
            });
            tmp_player.loadVideo({
                url:node_link[id].src,
                transport:"dash",
                autoPlay: false,
            });
            player.player[id] = tmp_player
        }
        add_moveable(moveable).call();
        let video_sphere = document.querySelector("#vr_view");
        video_sphere.setAttribute("src", "#" + current_node.node.id);
        let map_canvas = document.querySelector('#minimap');
        Object.values(node_link).forEach(function (target_node) {
            let m_node = document.createElement('a-entity');
            m_node.setAttribute('id', "m_" + target_node.id);
            m_node.addEventListener('click', viewEvent.view_click_handler(target_node, current_node, player));
            const AFRAME_WIDTH = 8;
            const AFRAME_HEIGHT = 8;
            let a_width = Number(target_node.pos.x) / AFRAME_WIDTH;
            let a_height = Number(target_node.pos.z) / AFRAME_HEIGHT;
            let width = (a_width - 0.5) * -1;
            let height = (a_height - 1) * -1;
            let css_height = (height * 100) + "%";
            let css_width = (width * 100) + "%";

            m_node.className = 'node';

            if (target_node.id === current_node.node.id) {
                m_node.classList.add('active');
                $('#m_camera').css({
                    top: css_height,
                    left: css_width,
                    display: 'inline-block'
                });
            }

            m_node.style.top = css_height;
            m_node.style.left = css_width;
            m_node.style.display = "inline-block";
            map_canvas.appendChild(m_node);
        });

    }

    // update_player(moveable, preload_player).call();
}

// function create_minimap(node_link, cur_node, initial, player) {
//     return function(node_link) {
//
//     }
//     let map_canvas = document.querySelector('#minimap');
//     Object.values(node_link).forEach(function (node) {
//         let m_node = document.createElement('a-entity');
//         m_node.setAttribute('id', "m_" + node.id);
//         m_node.addEventListener('click', viewEvent.view_click_handler(node, cur_node, player));
//         let a_width = Number(node.pos.x) / AFRAME_WIDTH;
//         let a_height = Number(node.pos.z) / AFRAME_HEIGHT;
//         let width = (a_width - 0.5) * -1;
//         let height = (a_height - 1) * -1;
//         let css_height = (height * 100) + "%";
//         let css_width = (width * 100) + "%";
//
//         m_node.className = 'node';
//
//         if (node.id === initial.fileId) {
//             m_node.classList.add('active');
//             $('#m_camera').css({
//                 top: css_height,
//                 left: css_width,
//                 display: 'inline-block'
//             });
//         }
//
//         m_node.style.top = css_height;
//         m_node.style.left = css_width;
//         m_node.style.display = "inline-block";
//         map_canvas.appendChild(m_node);
//     });
// }

async function initialize(position) {
    let current_node = {node: undefined};
    let player = {player: {}};
    console.log(current_node);
    await request_data(position)
        .then(requested_data_handler(current_node))
        .then(create_view(current_node, player));
    // console.log(player);    // console.log(current_node);
    return [current_node, player]
}

export {initialize}