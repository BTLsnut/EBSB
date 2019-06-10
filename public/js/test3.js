var main_player = dashjs.MediaPlayer().create();
var player_list = [];
var cur_node = 'v2';
var p_list = [];
var assets = null;
var roi = null;

AFRAME.registerComponent('cam', {
    tick: function () {

    }
});

AFRAME.registerComponent('main', {
    init: function () {
        getData().then(function (result) {
            createView(result);
            let node_link = [];
            result.forEach(function (item) {
                let name = item.filename.split('.')[0];
                node_link[name] = new node(item);
            });

            for (let i in node_link) {
                for(let j in node_link) {
                    node_link[i].weight_link(node_link[j])
                }
            }
           
            var video_dom = document.querySelector('#' + cur_node + '_v');
            var time = video_dom.currentTime;
            preload_seg(node_link, time);

            AFRAME.registerComponent('view', {
                init: function () {
                    let el = this.el;
                    addElEvent(el, node_link);
                    // addElEvent(el);
                }
            });
        });

    }
});

function getData() {
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

function createView(data) {

    data.forEach(function (item) {
        let parent = document.querySelector('#view_sphere');
        let view = document.createElement('a-entity');

        view.setAttribute('view', '');
        view.setAttribute("id", item.filename.split(".")[0]);
        view.setAttribute('material', {
           alphaTest:1,
           opacity:0
        });
        view.setAttribute('geometry', {
            primitive: 'box',
            width: 0.3,
            height: 0.3,
            depth: 0.3
        });
        view.setAttribute('position', item.metadata.pos);
        parent.appendChild(view);
    });
}

function addElEvent(element, node_link) {
    element.addEventListener('click', function (evt) {
        //cur_node = v1, v2, v3 ..
        var video_dom = document.querySelector('#' + cur_node + '_v');
        var time = video_dom.currentTime;
        cur_node = element.id;

        // mpd 변경
        let camera = document.querySelector('#camera');
        camera.setAttribute('position', node_link[cur_node].pos);
        if(cur_node === 'v8'){
            let videosphere = document.querySelector('#vr_view');
            videosphere.setAttribute('rotation',{
                x:0,
                y:90,
                z:0
            });
        }else{
            let videosphere = document.querySelector('#vr_view');
            videosphere.setAttribute('rotation',{
                x:0,
                y:-90,
                z:0
            });
        }
        camera.setAttribute('position', node_link[cur_node].pos);
       // main_player.reset();
        preload_seg(node_link, time);

        var vr_view = document.querySelector("#vr_view");
        vr_view.setAttribute('src', '#' + cur_node + '_v');
        vr_view.play();

    });

    element.addEventListener('mouseenter', function (evt) {
        drawArrow(element, node_link);
    });
}

function drawArrow(element, node_link) {

    let arrow = document.querySelector('#arrow');
    let current = node_link[cur_node].link;
    var x = current[element.id].x.val;
    var z = current[element.id].z.val;

    let yaw = Math.atan(x / -z) * 180 / Math.PI;
    let pitch = Math.atan(Math.sqrt(x * x + z * z)) * 180 / Math.PI;

    arrow.setAttribute('visible', true);
    arrow.setAttribute('rotation', {
        x: pitch,
        y: yaw,
        z: 30
    });
    let a = element.getAttribute('position');
    arrow.setAttribute('position', a);
}

function preload_seg(node_link, time) {
    
    for (let i in node_link[cur_node].link) {
        var video_dom = document.querySelector('#' + i + '_v');

        console.log(node_link[cur_node].link[i].distance);
        if (node_link[cur_node].link[i].distance < 4) {
     
            if(Object.keys(player_list).indexOf(i) === -1){
                player_list[i] = dashjs.MediaPlayer().create();
                player_list[i].initialize(video_dom, node_link[i].src, true)
            }
        
            video_dom.currentTime = time;
            video_dom.play();
            video_dom.setAttribute("preload", "auto");
            console.log('preload-o:'+i);    
        }
        else{
            video_dom.setAttribute("preload", "none");
            video_dom.pause();
            console.log('preload-x:'+i);
            // player_list[i].initialize();        
            //player_list[i].reset();
        };
    };
};

class node {
    constructor(data) {
        this.pos = data.metadata.pos;
        this.id = data.filename.split('.')[0];
        this.src = data["location"] + data["mpdname"];
        this.link = [];
    }

    weight_link(node) {
        let link_ref = {
            distance: 0,
            x: {x_ref: "", val: 0},
            y: {y_ref: "", val: 0},
            z: {z_ref: "", val: 0}
        };

        let x_val = Number(this.pos.x) - Number(node.pos.x);
        let y_val = Number(this.pos.y) - Number(node.pos.y);
        let z_val = Number(this.pos.z) - Number(node.pos.z);

        if (x_val < 0)
            link_ref.x.x_ref = "right";
        else if (x_val > 0)
            link_ref.x.x_ref = "left";


        if (y_val < 0)
            link_ref.y.y_ref = "top";
        else if (y_val > 0)
            link_ref.y.y_ref = "bottom";


        if (z_val < 0)
            link_ref.z.z_ref = "up";
        else if (z_val > 0)
            link_ref.z.z_ref = "down";

        link_ref.x.val = x_val >= 0 ? x_val : -1 * x_val;
        link_ref.y.val = y_val >= 0 ? y_val : -1 * y_val;
        link_ref.z.val = z_val >= 0 ? z_val : -1 * z_val;

        link_ref.distance = this.l2_norm(x_val, y_val, z_val);
        this.link[node.id] = link_ref;
    }

    l2_norm(x, y, z) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }
}
