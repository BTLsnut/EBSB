var preload_player = [];
var main_player = dashjs.MediaPlayer().create();
var cur_node = null;
var video_dom = null;
var t = 0;
var can_play = true;
var start_state = false;

const AFRAME_WIDTH = 8;
const AFRAME_HEIGHT = 4;

document.onkeydown = function (evt) {
    if (window.event.keyCode === 32) {
        $("#play_pause").trigger('click');
    }
};

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

AFRAME.registerComponent('main', {
    init: function () {
        let cursor = $("#play_pause");
        cursor.click(cursor_click_handler);
        request_data().then(requested_data_handler);
    },
    tick: function (d, dt) {
        // if (can_play) {
        //     console.log("duration: " + main_player.duration());
        //     console.log("time:     " + main_player.time());
        // }
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

            main_player.play();
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
        main_player.pause();
        start_state = false;
    }
}

function requested_data_handler(result) {
    let node_link = [];
    result.forEach(function (item) {
        let name = item.filename.split('.')[0];
        node_link[name] = new node(item);
    });

    const MIN_DISTANCE = 3;
    for (let i in node_link) {
        for (let j in node_link) {
            if (i !== j)
                node_link[i].weight_link(node_link[j], MIN_DISTANCE);
        }
    }

    console.log(node_link);
    create_minimap(result);
    create_view(node_link);

    main_player.on('canPlay', function (evt) {
        can_play = true;
        if (start_state)
            main_player.play();
        console.log('can_play');
    });
    main_player.on('playbackPaused', function () {
        t = main_player.duration() * (main_player.time / 100);
    });
    main_player.on('playbackSeeking', function () {
        console.log('seeking');
    });
    main_player.on('playbackSeeked', function (evt) {
        console.log('seek end');
    });
    main_player.on('playbackSeekAsked', function (evt) {
        console.log('seek asked');
    });
    main_player.on('error', function (evt) {
        console.error(evt);
    });
    main_player.on('bufferEmpty', function () {
        console.log('buffer empty')
    });
    main_player.on('bufferLevelStateChange', function () {
        console.log('buffer level state change');
    });
    main_player.on('buffer loaded', function () {
        console.log('buffer loaded');
    });
    main_player.on('playbackEnded', function () {
        console.log('video end');
    });


    let camera = document.querySelector('#camera');
    camera.setAttribute('position', node_link[cur_node.id].pos);

    video_dom = document.querySelector('#main_view');

    main_player.initialize(video_dom, node_link[cur_node.id].src, false);

    // preload_seg(node_link);
}

function request_data() {
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
            }//function 끝
        });
    });
}

function create_view(data) {
    let initial_view_id = 'v2';
    let moveable = data[initial_view_id].get_moveable_node();

    cur_node = {id: initial_view_id, pos: data[initial_view_id].pos};

    for (let id in data) {

        let parent = document.querySelector('#view_sphere');
        let view = document.createElement('a-entity');
        parent.appendChild(view);

        view.setAttribute("id", id);
        view.setAttribute('material', {
            alphaTest: 1,
            opacity: 1,
            color: 'black'
        });
        view.setAttribute('geometry', {
            primitive: 'box',
            width: 0.5,
            height: 0.5,
            depth: 0.5
        });
        view.setAttribute('position', data[id].pos);
        view.setAttribute('scale', {
            x: 0.5,
            y: 0.5,
            z: 0.5
        });
        view.setAttribute('animation', {
            property: 'rotation',
            to: '0 360 0',
            loop: true,
            dur: 10000
        });

        view.addEventListener('click', view_click_handler(data[id]));
        view.addEventListener('mouseenter', view_mouseover_hanlder(id, data[cur_node.id].link[id]));
        view.addEventListener('mouseleave', view_mouseleave_handler(id));
    }

    add_moveable(moveable).call();
    preload_player = update_player(moveable, preload_player).call();
}

function update_player(moveable_list, preload_p_list) {
    return function () {
        preload_p_list = [];

        for (let idx in moveable_list) {
            let p = dashjs.MediaPlayer().create();
            p.initialize(null, moveable_list[idx].src, true);
            p.preload();
            preload_p_list[idx] = p;
        }
        return preload_p_list;
    }
}

function view_click_handler(node) {
    return function () {
        console.log(node);
        console.log("위치 이동: " + pos_to_string(node.pos));

        t = main_player.getVideoElement().currentTime;
        main_player.attachSource(preload_player[node.id].getSource());

        cur_node = {id: node.id, pos: node.pos};

        main_player.getVideoElement().currentTime = t;

        let moveable = node.get_moveable_node();

        add_moveable(moveable).call();
        preload_player = update_player(moveable, preload_player).call();
        console.log(preload_player);

        let camera = document.querySelector('#camera');
        camera.setAttribute('position', node.pos);
        camera.setAttribute('rotation', {
            x: 0,
            y: 180,
            z: 0
        });

        if (cur_node.id === 'v8') {
            let videosphere = document.querySelector('#vr_view');
            videosphere.setAttribute('rotation', {
                x: 0,
                y: 90,
                z: 0
            });
        } else {
            let videosphere = document.querySelector('#vr_view');
            videosphere.setAttribute('rotation', {
                x: 0,
                y: -90,
                z: 0
            });
        }
    };
}

function view_mouseover_hanlder(id) {
    return function () {
        let view = document.getElementById(id);
        let pos = view.getAttribute('position');
        let moveable = view.classList.contains("moveable");
        let arrow = document.querySelector('#arrow');
        arrow.setAttribute('position', pos);
        // arrow.setAttribute('animation', {
        //     property: "position",
        //     to: "0 0 3",
        //     loop: true,
        //     dur: 100
        // });
        arrow.setAttribute('visible', "true");
        console.log(id + "의 위치: ("
            + pos.x + ", " + pos.y + ", " + pos.z + ") "
            + " moveable: " + moveable);
    };
}

function view_mouseleave_handler(id) {
    return function () {
        let arrow = document.querySelector('#arrow');
        arrow.setAttribute('visible', "false");
    }
}

function pos_to_string(obj) {
    return "(" + obj.x + ", " + obj.y + ", " + obj.z + ")";
}

function node_click_handler(id) {
    return function() {
        console.log('현재 노드는 ' + id + " 입니다.");
    }
}

function create_minimap(data) {
    console.log(data);
    let map_canvas = document.querySelector('#minimap');
    data.forEach(function (item) {
        let m_node = document.createElement('a-entity');
        m_node.setAttribute('id', "m_" + item.fileId);


        m_node.addEventListener('mouseenter', node_click_handler(item.fileId));

        let a_width = item.metadata.pos.x / AFRAME_WIDTH;
        let a_height = item.metadata.pos.z / AFRAME_HEIGHT;
        let width = (a_width - 0.5) * -1;
        let height = (a_height - 1) * -1;
        let css_height = (height * 100) + "%";
        let css_width = (width * 100) + "%";

        console.log("node id = " + item.fileId);
        console.log("(AFRAME WIDTH, AFRAME HIEGHT) = (" + a_width + ", " + a_height + ")");
        console.log("(CSS WIDTH, CSS HIEGHT) = (" + width + ", " + height + ")");
        m_node.className = 'node';

        if (item.fileId === 'v2')
            m_node.classList.add('active');

        m_node.style.top = css_height;
        m_node.style.left = css_width;
        m_node.style.display = "inline-block";
        map_canvas.appendChild(m_node);
    });
}

class node {
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

