var index = {};

index.ROOM_ID = "roomId";

index.init = function () {
    if (/Mobi/.test(navigator.userAgent)) {
        index.is_mobile = true;
        document.addEventListener("touchstart", function(){}, true); // hover work for mobile
    }
    index.players = [];
    index.bind_search();
    index.join_or_create();
};

index.add_player = function (name) {
    index.players.push(index.make_player(name));
    index.display_players(index.players);
};

index.make_player = function (name) {
    return {
        name: name,
        battlefield: [],
        graveyard: [],
        exile: []
    };
};

index.get_player = function (name) {
    var got = null;
    var idx = -1;
    for (var i = 0; i < index.players.length; i++) {
        var curr = index.players[i];
        if (curr.name === name) {
            got = curr;
            idx = i;
            break;
        }
    }
    return {"obj": got, "idx": idx};
};

index.join_or_create = function () {
    var roomId = getParameterByName(index.ROOM_ID)
    var $html = $('<div>'
        + '<p class="lead">Join or create room.</p>'
        + '<div class="row">'
        + '  <div class="large-16 columns">'
        + '    <label>Name'
        + '      <input id="join_user_name" type="text" placeholder="type username" required pattern="alpha">'
        + '      <span id="join_user_err" class="form-error">'
        + '        A username with length 3 or greater is required. What about Bob?'
        + '      </span>'
        + '    </label>'
        + '  </div>'
        + '</div>'
        + '<div class="row">'
        + '  <div class="large-16 columns">'
        + '    <div class="row collapse">'
        + '      <div class="small-10 columns">'
        + '        <input type="text" placeholder="Room id, if your friend has already created one" id="join_room_id">'
        + '      </div>'
        + '      <div class="small-2 columns">'
        + '        <a id="join_room" href="#" class="button postfix">Join</a>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>'
        + '<div class="row">'
        + '  <div class="large-16 columns">'
        + '    <div class="row collapse">'
        + '      <div class="small-2 columns">'
        + '        <a id="create_room" href="#" class="button postfix">Create room</a>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>'
        + '</div>'
    );
    if (roomId) {
        $html.find('#join_room_id').val(roomId);
    }

    socket.bind_join($html.find('#join_room'));
    socket.bind_join($html.find('#create_room'));
    var $modal = index.basic_modal($html);
};

index.display_hands = function ($container, a_player) {
    var a_hand = mtg.make_hand(a_player.battlefield);
    $container.find(".hand_battlefield").html(a_hand);

    var a_hand = mtg.make_hand(a_player.graveyard);
    $container.find(".hand_graveyard").html(a_hand);

    var a_hand = mtg.make_hand(a_player.exile);
    $container.find(".hand_exile").html(a_hand);
    index.bind_hand($container, a_player);
};

index.bind_hand = function ($container, a_player) {
    $container.find(".hand .card").on('click tap', function (event) {
        var $playingCards = $(this).closest('.playingCards');
        var loc = $playingCards.attr('id').split('_')[2];
        var idx = $playingCards.find(".card").index($(this));

        var card = a_player[loc][idx];
        var $html = index.get_card_html(card);
        $html.find(".card-holder").addClass("fleft");

        $html.append('<div class="fleft mv-button-panel">'
            + '<button id="to_battlefield" type="button" class="button">Battlefield</button>'
            + '<button id="to_graveyard" type="button" class="button">Graveyard</button>'
            + '<button id="to_exile" type="button" class="button">Exile</button>'
            + '</br>'
            + '<label>'
            + '  Counter modifier (0 to clear counters)'
            + '  <input id="counter_modifier" type="number" value="0">'
            + '</label>'
            + '<button id="add_counter" type="button" class="button">Add/Clear Counter</button>'
            + '<button id="enchant_tap" type="button" class="button">Enchant/Tap</button>'
            + '</br>'
            + '<button id="delete" type="button" class="button">Delete</button>'
            + '</div>'
        );
        
        var $modal = index.basic_modal($html);
        index.bind_btn_mv_panel(a_player, loc, $html, card, idx);
    });
};

index.bind_btn_mv_panel = function (a_player, loc, pnl, card, idx) {
    pnl.find("#add_counter").on('click tap', function (e) {
        var mod = parseInt($("#counter_modifier").val(), 10);
        var got = a_player[loc][idx];
        if (mod !== 0) {
            var is_pos = mod > 0;
            got.counters.push({"val": mod, "is_pos": is_pos});
        } else {
            got.counters = [];
        }

        a_player[loc][idx] = got;
        index.display_players(index.players);

        socket.send_card(loc, got);
        $("#modal").foundation('close');
    });
    pnl.find("#enchant_tap").on('click tap', function (e) {
        var got = a_player[loc][idx];
        if (got.is_tapped) {
            got.is_tapped = false;
        } else {
            got.is_tapped = true;
        }
        a_player[loc][idx] = got;

        index.display_players(index.players);
        socket.send_card(loc, got);
        $("#modal").foundation('close');
    });
    pnl.find("#to_battlefield").on('click tap', function (e) {
        a_player[loc].splice(idx, 1);
        a_player.battlefield.push(card);

        index.display_players(index.players);
        socket.send_card(loc, null);
        socket.send_card("battlefield", card);
        $("#modal").foundation('close');
    });
    pnl.find("#to_graveyard").on('click tap', function (e) {
        a_player[loc].splice(idx, 1);
        a_player.graveyard.push(card);

        index.display_players(index.players);
        socket.send_card(loc, null);
        socket.send_card("graveyard", card);
        $("#modal").foundation('close');
    });
    pnl.find("#to_exile").on('click tap', function (e) {
        a_player[loc].splice(idx, 1);
        a_player.exile.push(card);

        index.display_players(index.players);
        socket.send_card(loc, null);
        socket.send_card("exile", card);
        $("#modal").foundation('close');
    });
    pnl.find("#delete").on('click tap', function (e) {
        a_player[loc].splice(idx, 1);

        index.display_players(index.players);
        socket.send_card(loc, null);
        $("#modal").foundation('close');
    });
};

index.bind_search = function () {
    $("#search_cards").on('click tap', index.do_search);
    $("#search_in").on('keypress',
        function (e) {
            if (e.which == 13) { index.do_search(e);
            }
        }
    );
};

index.do_search = function (event) {
    var s = $("#search_in").val();
    if (s.trim() === "") {
        alert('need to search with some text...');
        return;
    }

    mtg.search(s, function (cards) {
        index.build_search_modal(cards);
    }, function (err) {
        console.log('error');
        console.log(err);
    });
};

index.build_search_modal = function (cards) {
    var images = $("<div class='media-object'>");

    // cards:
    var filtered_cards = $.grep(cards, function (obj) {
        if (obj.imageUrl) {
            return obj;
        }
    });
    for (var i = 0; i < filtered_cards.length; i++) {
        var curr = filtered_cards[i];
        if (i > 5) {
            break;
        }
        var $card_html = index.get_card_html(curr);
        $card_html.find('img').addClass('list-card');
        $card_html.find('a').on('click tap', function (e) {
            $(".selected").removeClass("selected");
            $(this).addClass('selected');
            return false;
        });
        images.append($card_html);
        if (index.is_mobile) {
            //images.append("</br>");
        } else if ((i+1) % 3 == 0) {
            images.append("</br>");
        }
    }

    // buttons:
    var btn_panel = $("<div class='button-panel'>");
    if (index.is_mobile) {
        var $close = $('<button class="button fleft" data-close type="button">Close</button>').on('click tap',
            function () {
                $("#search_in").val("")
                $("#modal").foundation('close');
            });
        btn_panel.append($close);
    }
    btn_panel.append(
        '<button id="to_exile" type="button" class="button add fright">Exile</button>'
        + '<button id="to_graveyard" type="button" class="button add fright">Graveyard</button>'
        + '<button id="to_battlefield" type="button" class="button add fright">Battlefield</button>'
    );
    btn_panel.find('.add').on('click tap', function (e) {
        var $sel = $('.selected');
        if ($sel.length !== 1) {
            return;
        }
        var loc = $(this).attr('id').split('_')[1];
        var url = $sel.attr("href");
        var name = $sel.attr("name");

        if (socket.username === "") {
            var the_player = index.players[0];
        } else {
            var the_player = index.get_player(socket.username).obj;
        }
        var id = the_player[loc].length+1;
        var card_obj = {
            'card_name': name,
            'imageUrl': url,
            'tokens': [],
            'counters': []
        };
        the_player[loc].push(card_obj);

        socket.send_card(loc, card_obj);

        index.display_players(index.players);
        $("#search_in").val("")
        $("#modal").foundation('close');
    });
    
    images.append(btn_panel);
    index.basic_modal(images);
};

index.get_card_html = function (card) {
    var url = card.imageUrl;
    var name = card.name;
    var img_html = '<div class="media-object-section">'
            //+ '<p class="name">' + name + '</p>'
            +  '<div class="card-holder">'
            +    '<a class="th" target="_blank" href="' + url + '" name="' + name + '">'
            +      '<img class="card-img" src="' + url + '">'
            //+      '<span class="image-hover-wrapper-reveal">'
            //+        '<p>Check it<br><i class="fa fa-link" aria-hidden="true"></i></p>'
            //+      '</span>'
            +    '</a>'
            +  '</div>'
            + '</div>'
        ;
    return $(img_html);
};

index.basic_modal = function ($html) {
    $("#modal").empty();
    var $modal = $("#modal").append('<button class="close-button" data-close aria-label="Close reveal" type="button">'
        +    '<span aria-hidden="true">&times;</span>'
        +  '</button>'
    );
    $modal.append($html);
    $(document).foundation();
    $modal.foundation('open');
    return $modal;
};

index.display_players = function (players) {
    var $tabs = $('<div class="tabs-content" data-tabs-content="player_tabs"></div>');
    var $tab_nav = $('<ul class="tabs" data-tabs id="player_tabs"></ul>');
    for (var i = 0; i < players.length; i++) {
        var curr = players[i];
        var $a_nav = $('<li class="tabs-title"><a id="tab_click_' + curr.name + '" href="#tab_'
            + curr.name + '" >' + curr.name + '</a></li>');
        if (i == 0) {
            $a_nav.addClass('is-active');
            $a_nav.find('a').attr('aria-selected', true);
        }
        $tab_nav.append($a_nav);
    }
    $tabs.append($tab_nav);
    for (var i = 0; i < players.length; i++) {
        var curr = players[i];
        var $player = $('<div class="tabs-panel" id="tab_' + curr.name + '"></div>');
        if (i == 0) {
            $player.addClass('is-active');
        }
        $player.append(index.get_player_html(curr, curr.name == socket.username));
        index.display_hands($player, curr);
        $tabs.append($player);
    }
    $("#player_tabs_container").html($tabs);
    $(document).foundation();
};

index.get_player_html = function(a_player, has_chat) {
    var $chat = '';
    var name = a_player.name;
    if (has_chat) {
        var $log = $("#chat_log");
        var $chat = '<div class="large-4 columns">'
        + '    <div class="row collapse">'
        + '        <div id="chat_log">'
        + ($log.length > 0 ? $log.html() : "")
        + '        </div>'
        + '        <div class="large-10 columns">'
        + '            <input id="chat_to_send" type="text" placeholder="message" />'
        + '        </div>'
        + '        <div class="large-2 columns">'
        + '            <button id="chat_send_btn" type="button" class="button">Send</button>'
        + '        </div>'
        + '    </div>'
        + '</div>'
        ;
    }
    var bf_class = has_chat ? 'large-8' : 'large-12';
    var $player = $('<div class="row">'
        + '    <p>Battlefield</p>'
        + '    <div id="player_' + name + '_battlefield" class="hand_battlefield playingCards ' + bf_class + ' columns">'
        + '    </div>'
        +   $chat
        + '</div>'
        + '<div class="row">'
        + '    <p>Graveyard</p>'
        + '    <div id="player_' + name + '_graveyard" class="hand_graveyard playingCards large-12 columns">'
        + '    </div>'
        + '</div>'
        + '<div class="row">'
        + '    <p>Exile</p>'
        + '    <div id="player_' + name + '_exile" class="hand_exile playingCards large-12 columns">'
        + '    </div>'
        + '</div>'
    );
    //$player.on('show', function () {
        //var $chat_log = $player.find("#chat_log");
        //if ($chat_log) {
            //$chat_log.animate({scrollTop:$chat_log[0].scrollHeight}, 500);
        //}
    //});

    $player.find('#chat_send_btn').on('click tap', function(event) {
        var to_send = $('#chat_to_send').val();
        if ($.trim(to_send) !== "") {
            socket.socket.emit('my_room_event', {room: socket.room, data: $('#chat_to_send').val()});
            $('#chat_to_send').val("");
        }
        return false;
    });
    return $player;
};

/* general fns */

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
