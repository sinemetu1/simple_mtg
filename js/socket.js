var socket = {};

socket.namespace = '/test';
socket.port = 5000;
socket.room = "";
socket.username = "";

socket.init_socket = function () {
    if (socket.socket === undefined) {
        socket.socket = io.connect(location.protocol + '//' + document.domain + ':' + socket.port + socket.namespace);
    } else {
        console.error('Should not need to rebind socket!!!');
    }
};

socket.bind = function (skt, debug) {
    skt.on('connect', function() {
        skt.emit('my_event', {data: 'I\'m connected!'});
    });

    skt.on('my_response', function(msg) {
        var to_append = '<br>' +
            $('<p class="message"/>').text('Received #' + msg.count + ': ' + msg.data)
            .html();
        $('#chat_log').append(to_append);
    });
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

socket.send_card = function (loc, card_name) {
    if (socket.socket === undefined) {
        console.log('cant share with others in room socket undefined');
        console.log(loc, card_name);
        return;
    }
    socket.socket.emit('room_card_event', {
        room: socket.room,
        name: socket.name,
        loc: loc,
        data: card_name
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