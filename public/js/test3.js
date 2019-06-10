var vr_view = null;
var video_dom_c = null;
var player_list = [];
var cur_node = 'v2';
var p_list = [];
var assets = null;
var video_dom = null;
var a = null;
var b = null;

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
            console.log(node_link);



            preload_seg(node_link);

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
// document.onkeydown = function(evt){
//     if(evt.keyCode == 13){
//         video_dom_c = document.querySelector('#' + cur_node + '_v');
//         video_dom_c.pause();
//         }
//     }
// document.onkeyup = function(evt){
//     if(evt.keyCode == 13){
//         video_dom_c = document.querySelector('#' + cur_node + '_v');
//         video_dom_c.play();
//         }
//     }

function addElEvent(element, node_link) {
    element.addEventListener('click', function (evt) {
        //cur_node = v1, v2, v3 ..
        var clickTime = new Date();
        var video_dom_t = document.querySelector('#' + cur_node + '_v');
        var time = video_dom_t.currentTime;

        cur_node = element.id;

        var video_dom_c = document.querySelector('#' + cur_node + '_v');
        if(video_dom_c.currentTime !== video_dom_t.currentTime){
            video_dom_c.currentTime = time;
            //console.log('current video Time:'+video_dom_c.currentTime);
        }
        console.log(cur_node);

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

        preload_seg(node_link);//

        vr_view = document.querySelector("#vr_view");
        vr_view.setAttribute('src', '#' + cur_node + '_v');

        // console.log(video_dom_c.networkState);
        // console.log(video_dom_c.networkState);

        video_dom_c.onloadeddata = function () {
            const endTime = new Date();
            console.log((endTime.getTime() - clickTime.getTime()) / 1000);
        };
        //onpause-onplay(애매함, progress안에 넣어보기) onwaiting-onplaying(이거임)

        video_dom_c.onwaiting = function (evt) {
            const jitterStart = new Date();
            a = jitterStart.getTime();
            //console.log('viewcomplete : '+(a-clickTime.getTime())/1000);

            //console.log('비디오 끊김');
        };
        // video_dom_c.onpause = function(evt){
        //     var jitterStart = new Date();
        //     a = jitterStart.getTime();
        //     console.log('a:'+a)
        // }
        video_dom_c.onplaying = function(evt){
            var jitterEnd = new Date();
            b = jitterEnd.getTime();
            // console.log('b : '+b);
            // console.log('playingstart : '+(b-clickTime.getTime())/1000);
            console.log('JITTERtime : '+(b-a)/1000)
        }
        // video_dom_c.onseeked = function(){
        //     var seekTime = new Date();
        //     console.log('seekTime : '+(seekTime.getTime() - clickTime.getTime())/1000);
        //  }
        //};


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

function preload_seg(node_link) {

    for (let i in node_link[cur_node].link) {
        video_dom = document.querySelector('#' + i + '_v');
        if (node_link[cur_node].link[i].distance <5) {

            if(Object.keys(player_list).indexOf(i) === -1){
                player_list[i] = dashjs.MediaPlayer().create();

                player_list[i].initialize(video_dom, node_link[i].src, true);
                player_list[i].setABRStrategy('abrThroughput');
                console.log(player_list[i].getABRStrategy());
            }
            video_dom.play();
            video_dom.setAttribute("preload", "auto");
        }else{
            video_dom.pause();
            video_dom.setAttribute("preload", "none");
        }
    }
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
        this.link[node.id] = link_ref;
    }

    l2_norm(x, y, z) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }
}