var map;
var data = [
    {position: {lat: 37.631923, lng: 127.077481}, name: "seoultech"},
    {position: {lat: 37.597667, lng:126.866351}, name: "hangkong"},
    {position: {lat: 37.599643, lng:126.865175}, name: "hangkong2"}
];

function initMap() {
    let lat = 0, lng = 0;
    for (let item of data) {
        lat += item.position.lat;
        lng += item.position.lng;
    }
    lat /= data.length;
    lng /= data.length;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lng},
        zoom: 12
    });

    for (let item of data)
        make_marker(item, map, marker_click_handler);
}

function make_marker(data, map, click_handler) {
    let marker = new google.maps.Marker({
        position: data.position,
        map: map,
        title: data.name
    });
    marker.addListener('click', click_handler(data));
    marker.setMap(map);
}

function marker_click_handler(data) {
    return function () {
        location.href="/main?place=" + data.name;
        // $.ajax({
        //     url: "/main" + "?place=" + data.name,
        //     type: "get", //send it through get method
        //     data: {
        //         position: data.position,
        //         name: data.name
        //     },
        //     success: function(response) {
        //
        //         //Do Something
        //     },
        //     error: function(xhr) {
        //         //Do Something to handle error
        //     }
        // });
    }
}
