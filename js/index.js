var index = {};

index.battlefield = [];
index.graveyard = [];
index.exile = [];

index.init = function () {
    if (/Mobi/.test(navigator.userAgent)) {
        index.is_mobile = true;
        document.addEventListener("touchstart", function(){}, true); // hover work for mobile
    }
    index.bind_search();
    index.display_hands();
    index.join_or_create();
};

index.join_or_create = function () {
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

    socket.bind_join($html.find('#join_room'));
    socket.bind_join($html.find('#create_room'));
    var $modal = index.basic_modal($html);
};

index.display_hands = function () {
    var a_hand = mtg.make_hand(index.battlefield);
    $("#hand_battlefield").html(a_hand);

    var a_hand = mtg.make_hand(index.graveyard);
    $("#hand_graveyard").html(a_hand);

    var a_hand = mtg.make_hand(index.exile);
    $("#hand_exile").html(a_hand);
    index.bind_hand();
};

index.bind_hand = function () {
    $(".hand .card").on('click', function (event) {
        var url = $(this).data("imageUrl");
        var card = {"imageUrl": url};
        var $html = index.get_card_html(card);
        $html.append('<div class="button-panel">'
            + '<button id="to_battlefield" type="button" class="button">Battlefield</button>'
            + '<button id="to_graveyard" type="button" class="button">Graveyeard</button>'
            + '<button id="to_exile" type="button" class="button">Exile</button>'
            + '<button id="delete" type="button" class="button">Delete</button>'
            + '</div>'
        );
        
        var loc = $(this).closest('.playingCards').attr('id').split('_')[1];
        var $modal = index.basic_modal($html);
        index.bind_btn_mv_panel(index[loc], $html, card);
    });
};

index.bind_btn_mv_panel = function (src, pnl, card) {
    var idx = src.findIndex(function (obj) {
        if (obj.imageUrl == card.imageUrl) {
            return true;
        }
    });
    pnl.find("#to_battlefield").on('click tap', function (e) {
        src.splice(idx, 1);
        index.battlefield.push(card);
        index.display_hands();
        $("#modal").foundation('close');
    });
    pnl.find("#to_graveyard").on('click tap', function (e) {
        src.splice(idx, 1);
        index.graveyard.push(card);
        index.display_hands();
        $("#modal").foundation('close');
    });
    pnl.find("#to_exile").on('click tap', function (e) {
        src.splice(idx, 1);
        index.exile.push(card);
        index.display_hands();
        $("#modal").foundation('close');
    });
    pnl.find("#delete").on('click tap', function (e) {
        src.splice(idx, 1);
        index.display_hands();
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
                $("#modal").foundation('close');
            });
        btn_panel.append($close);
    }
    btn_panel.append(
        '<button id="to_exile" type="button" class="button add fright">Exile</button>'
        + '<button id="to_graveyard" type="button" class="button add fright">Graveyeard</button>'
        + '<button id="to_battlefield" type="button" class="button add fright">Battlefield</button>'
    );
    btn_panel.find('.add').on('click tap', function (e) {
        var $sel = $('.selected');
        var loc = $(this).attr('id').split('_')[1];
        var url = $sel.attr("href");
        var name = $sel.attr("name");

        index[loc].push({"imageUrl": url});

        socket.send_card(loc, {
            'card_name': name,
            'imageUrl': url,
            'tokens': {},
            'energy_counters': {}
        });

        index.display_hands();
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
            +  '<div>'
            +    '<a class="th" href="' + url + '" name="' + name + '">'
            +      '<img src="' + url + '">'
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
    $modal.append($html).foundation('open');
    return $modal;
};
