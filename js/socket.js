var socket = {};

socket.namespace = '/test';
socket.port = ""; // ":5000";
socket.room = "";
socket.username = "";
socket.domain = "https://simple-mtg.herokuapp.com";

socket.init_socket = function () {
    if (socket.socket === undefined) {
        socket.socket = io.connect(socket.domain + socket.namespace);
    } else {
        console.error('Should not need to rebind socket!!!');
    }
};

socket.append_to_chat_log = function (message, from) {
    var $from_html = "";
    if (from !== undefined) {
        $from_html = '<b>' + from + '</b> ';
    }
    var to_append = $('<p class="message"/>').html($from_html + message).html() +
        '</br>';
    $('#chat_log').append(to_append);
    $("#chat_log").animate({scrollTop:$("#chat_log")[0].scrollHeight}, 500);
};

socket.handle_message = function (msg) {
    if (msg.from === socket.username) {
        console.log('suppressing own messages...');
        $("#tab_click_" + msg.from).click();
        return;
    }
    socket.append_to_chat_log(msg.data, msg.from);
};

socket.bind = function (skt, debug) {
    skt.on('connect', function() {
        socket.append_to_chat_log('You\'re connected!');
    });
    skt.on('reconnect', () => {
        skt.emit('join', {room: socket.room, name: socket.username});
    });
    skt.on('hand_update_event', function (msg) {
        var a_player = index.get_player(msg.from);
        if (a_player.obj == null) {
            index.add_player(msg.from);
            a_player = index.get_player(msg.from);
        }
        var got = a_player.obj;
        var idx = a_player.idx;
        index.players[idx][msg.obj.loc] = msg.obj.data;
        index.display_players(index.players);
        //$("#tab_click_" + msg.from).click();
    });
    skt.on('room_card_event', function (msg) {
        if (msg.from === socket.username) { return; }
        socket.append_to_chat_log(msg.data, msg.from);
    });
    skt.on('room_entered', function (msg) {
        var a_player = index.get_player(msg.from);
        if (msg.from === socket.username) { return; }
        if (a_player.obj == null) {
            index.add_player(msg.from);
            socket.append_to_chat_log('entered the room.', msg.from);
        }
    });
    skt.on('share_room', function (msg) {
        var url = location.protocol + '//' + document.domain + '?' + index.ROOM_ID + '=' + msg.data;
        socket.append_to_chat_log('<a target="_blank" href="' + url + '">Share this room with your friends.</a>');
    });

    skt.on('my_response', socket.handle_message);
    if (debug) {
        var ping_pong_times = [];
        var start_time;
        window.setInterval(function() {
            start_time = (new Date).getTime();
            skt.emit('my_ping');
        }, 1000);
        skt.on('my_pong', function() {
            var latency = (new Date).getTime() - start_time;
            ping_pong_times.push(latency);
            ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
            var sum = 0;
            for (var i = 0; i < ping_pong_times.length; i++)
                sum += ping_pong_times[i];
            $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
        });
    }

    $('#chat_send_btn').on('click tap', function(event) {
        var to_send = $('#chat_to_send').val();
        if ($.trim(to_send) !== "") {
            skt.emit('my_room_event', {room: socket.room, data: $('#chat_to_send').val()});
            $('#chat_to_send').val("");
        }
        return false;
    });
    

    //$('form#close').submit(function(event) {
        //skt.emit('close_room', {room: $('#close_room').val()});
        //return false;
    //});
    //$('form#disconnect').submit(function(event) {
        //skt.emit('disconnect_request');
        //return false;
    //});
};

socket.send_card = function (loc, card_obj) {
    if (socket.socket === undefined) {
        console.log('cant share with others in room socket undefined');
        console.log(loc, card_obj);
        return;
    }
    var a_player = index.get_player(socket.username);
    var a_hand = a_player.obj[loc];

    if (card_obj !== null) { // will be null if card was deleted
        socket.socket.emit('room_card_event', {
            room: socket.room,
            name: socket.username,
            loc: loc,
            data: card_obj
        });
    }

    socket.socket.emit('hand_update_event', {
        room: socket.room,
        name: socket.username,
        loc: loc,
        data: a_hand
    });
};

socket.bind_join = function ($html) {
    $html.on('click tap', function(event) {
        $('#join_user_err').hide();
        if ($("#join_user_name").val().length < 2) {
            $('#join_user_err').show();
            return false;
        }
        
        socket.init_socket();
        socket.bind(socket.socket, true);

        var name = $('#join_user_name').val();
        var rm = $('#join_room_id').val();
        if (rm === "") {
            rm = uuidv4();
        }
        socket.socket.emit('join', {room: rm, name: name});
        socket.room = rm;
        socket.username = name;

        if ($html.closest('#modal').length >= 1) {
            $("#modal").foundation('close');
        }
        index.display_players(index.players);
        index.add_player(name);
        return false;
    });
};

/* general fns */

function uuidv4() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
