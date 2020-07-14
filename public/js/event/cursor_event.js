function cursor_click_handler(start_state, can_play, player) {
    return function () {
        console.log("click");
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

                player.play();
                return true;
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
            player.pause();
            return false;
        }
    }

}

export {cursor_click_handler}