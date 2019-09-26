var preload_player = [];
var main_player = dashjs.MediaPlayer().create();
var cur_node = {};
var video_dom = null;
var t = 0;
var can_play = true;
var start_state = false;
var viewpoint_compensation = {viewpoint: 0, t: 0};

const deg = 45;
const AFRAME_WIDTH = 8;
const AFRAME_HEIGHT = 4;

const REQUEST_AJAX = 1;
const REQUEST_JSON = 2;

window.addEventListener('keydown', function (evt) {
    if (window.event.keyCode === 32) {
        $("#play_pause").trigger('click');
    }
});

window.addEventListener('mousewheel', function (e) {
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

function current_state_update(state, node) {
    console.log(state, node);
    state.prev = state.cur;
    state.cur = node.id;
    state.pos = node.pos
}

AFRAME.registerComponent('main', {
    init: function () {
        let cursor = $("#play_pause");
        cursor.click(cursor_click_handler);
        request_data(REQUEST_JSON).then(requested_data_handler);
        let cam = document.querySelector('#camera');
        cam.setAttribute('rotation', {
            x: 0,
            y: -180,
            z: 0
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

        document.querySelector('#m_camera').style.transform = "rotate(" + minimap_yaw + "deg)";
    }
});

function cursor_click_handler() {
    let play_btn = $("#play_pause");
    if (!start_state) {
        if (can_play) {

            $('#camera').attr('look-controls', "enabled: true");
            play_btn.addClass("paused");

            play_btn.css({
                position: "absolute",
                top: "0",
                left: "0"
            });

            $("#stop").css({
                display: "block"
            });

            // TODO PLAY ACTION
            start_state = true;
        }
    } else {
        $('#camera').attr('look-controls', "enabled: false");
        play_btn.removeClass("paused");
        play_btn.css({
            position: "fixed",
            top: "50%",
            left: "50%"
        });

        $("#stop").css({
            display: "none"
        });
        // TODO PAUSE ACTION
        start_state = false;
    }
}

function requested_data_handler(result) {
    let node_link = [];
    console.log(result);
    result.forEach(function (item) {
        let name = item.filename.split('.')[0];
        node_link[name] = new Node(item);
    });

    const MIN_DISTANCE = 10;
    for (let i in node_link) {
        for (let j in node_link) {
            if (i !== j)
                node_link[i].weight_link(node_link[j], MIN_DISTANCE);
        }
    }

    console.log(node_link);
    create_minimap(node_link);
    create_view(node_link);


    let camera = document.querySelector('#camera');
    camera.setAttribute('position', node_link[cur_node.cur].pos);
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
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

function request_data(REQUEST_CODE) {
    if (REQUEST_CODE === REQUEST_JSON)
        return new Promise(function(resolve, reject) {
            readTextFile("json/multiview.json", function(text){
                let data = JSON.parse(text);
                resolve(data);
            });
        });
    else if (REQUEST_CODE === REQUEST_AJAX)
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: '/transfer',                //주소
                dataType: 'json',                  //데이터 형식
                type: 'POST',                      //전송 타입
                // data: {'msg': $('#msg').val()},      //데이터를 json 형식, 객체형식으로 전송
                success: function (result) {          //성공했을 때 함수 인자 값으로 결과 값 나옴
                    resolve(result)
                },
                error: function (err) {
                    reject(err)
                }
            });
        });
    else
        return new Promise(function (resolve, reject) {
            reject(Error("invalid request code"))
        })
}

function create_view(data) {
    let initial_view_id = 'v2';
    let moveable = data[initial_view_id].get_moveable_node();

    cur_node.cur = initial_view_id;
    cur_node.prev = null;
    cur_node.pos = data[initial_view_id].pos;

    for (let id in data) {

        let parent = document.querySelector('#view_sphere');
        let view = document.createElement('a-entity');
        parent.appendChild(view);

        view.setAttribute("id", id);
        // view.setAttribute('material', {
        //     alphaTest: 1,
        //     opacity: 0
        // });
        view.setAttribute('geometry', {
            primitive: 'box',
            width: 0.5,
            height: 0.5,
            depth: 0.5
        });
        view.setAttribute('position', data[id].pos);
        view.setAttribute('scale', {
            x: 1.5,
            y: 1.5,
            z: 1.5
        });

        view.addEventListener('click', view_click_handler(data[id]));
        view.addEventListener('mouseenter', view_mouseover_hanlder(id, data[cur_node.cur].link[id]));
        view.addEventListener('mouseleave', view_mouseleave_handler(id));
    }

    add_moveable(moveable).call();
}

// 다른 view를 클릭했을 때 action
function view_click_handler(node) {
    return function () {
        if (cur_node.cur !== node.id) {
            console.log(node);
            console.log("위치 이동: " + pos_to_string(node.pos));
            let moveable = node.get_moveable_node();

            // TODO SYNC

            current_state_update(cur_node, node);
            add_moveable(moveable).call();
            calibrate_camera(cur_node);

            if (cur_node.cur !== cur_node.prev) {
                let current = $("#m_" + cur_node.cur);
                current.addClass('active');
                $("#m_" + cur_node.prev).removeClass('active');
                $('#m_camera').css({
                    top: current.css('top'),
                    left: current.css('left'),
                });
            }

        }
    };
}

// 다른 view에 마우스를 올렸을 때 action
function view_mouseover_hanlder(id) {
    return function () {
        let view = document.getElementById(id);
        let pos = view.getAttribute('position');
        pos.y = 0.5;
        let moveable = view.classList.contains("moveable");
        // let arrow = document.querySelector('#arrow');
        // let x = pos.x - cur_node.pos.x;
        // let z = pos.z - cur_node.pos.z;
        // let position = {
        //     x: 70,
        //     y: Math.atan2(x, z) * (180 / Math.PI),
        //     z: 90
        // };
        // let to_pos = {
        //     x: pos.x + x / 3,
        //     y: pos.y,
        //     z: pos.z + z / 3
        // };
        // arrow animation 및 attribute
        // arrow.setAttribute('position', pos);
        // arrow.setAttribute('rotation', position);
        // arrow.setAttribute('visible', "true");
        // arrow.setAttribute('animation', {
        //     property: 'position',
        //     from: pos.x + " " + pos.y + " " + pos.z,
        //     to: pos_to_string(to_pos),
        //     dur: 1000,
        //     loop: true
        // });
        console.log(id + "의 위치: ("
            + pos.x + ", " + pos.y + ", " + pos.z + ") "
            + " moveable: " + moveable);
    };
}

function view_mouseleave_handler(id) {
    return function () {
        let view = document.getElementById(id);
        let pos = view.getAttribute('position');
        pos.y = 1;

        let arrow = document.querySelector('#arrow');
        arrow.setAttribute('visible', "false");
    }
}

function node_click_handler(node) {
    return view_click_handler(node)
}

// 미니맵 만드는 function -- 현재 위치를 기반으로 만듦
function create_minimap(node_link) {
    let map_canvas = document.querySelector('#minimap');
    Object.values(node_link).forEach(function (node) {
        let m_node = document.createElement('a-entity');
        m_node.setAttribute('id', "m_" + node.id);
        m_node.addEventListener('click', node_click_handler(node));
        let a_width = Number(node.pos.x) / AFRAME_WIDTH;
        let a_height = Number(node.pos.z) / AFRAME_HEIGHT;
        let width = (a_width - 0.5) * -1;
        let height = (a_height - 1) * -1;
        let css_height = (height * 100) + "%";
        let css_width = (width * 100) + "%";

        m_node.className = 'node';

        if (node.id === 'v2') {
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
    console.log('minimap created');
}

// view 간의 관계를 설정하기 위한 class
export default class Node {
    constructor(data) {
        this.pos = data.metadata.pos;
        this.id = data.filename.split('.')[0];
        this.src = data["location"] + data["mpdname"];
        this.link = [];
    }

    weight_link(node, MIN_DISTANCE) {
        let link_ref = {
            distance: 0,
            x: {x_ref: "", val: 0},
            y: {y_ref: "", val: 0},
            z: {z_ref: "", val: 0},
            pos: node.pos,
            src: node.src
        };

        let x_val = Number(this.pos.x) - Number(node.pos.x);
        let y_val = Number(this.pos.y) - Number(node.pos.y);
        let z_val = Number(this.pos.z) - Number(node.pos.z);

        if (x_val < 0)
            link_ref.x.x_ref = "right";
        else if (x_val > 0)
            link_ref.x.x_ref = "left";


        if (y_val < 0)
            link_ref.y.y_ref = "bottom";
        else if (y_val > 0)
            link_ref.y.y_ref = "top";


        if (z_val < 0)
            link_ref.z.z_ref = "up";
        else if (z_val > 0)
            link_ref.z.z_ref = "down";

        link_ref.x.val = x_val >= 0 ? x_val : -1 * x_val;
        link_ref.y.val = y_val >= 0 ? y_val : -1 * y_val;
        link_ref.z.val = z_val >= 0 ? z_val : -1 * z_val;

        link_ref.distance = this.l2_norm(x_val, y_val, z_val);
        link_ref.moveable = link_ref.distance < MIN_DISTANCE;
        this.link[node.id] = link_ref;
    }

    l2_norm(x, y, z) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }

    get_moveable_node() {
        let tmp = [];
        for (let idx in this.link) {
            if (this.link[idx].moveable)
                tmp[idx] = this.link[idx];
        }
        return tmp;
    }
}

function pos_to_string(pos) {
    return pos.x + " " + pos.y + " " + pos.z;
}