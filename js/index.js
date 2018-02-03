var index = {};

index.battlefield = [];
index.graveyard = [];
index.exile = [];

index.init = function () {
    index.bind_search();

    index.battlefield = [
        { "imageUrl": "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=429879&type=card" },
        { "imageUrl": "http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=430749&type=card" }
    ];
    var a_hand = mtg.make_hand(index.battlefield);
    $("#hand_battlefield").append(a_hand);
    index.bind_hand();
};

index.bind_hand = function () {
    $(".hand .card").on('click', function (event) {
        var url = $(this).data("imageUrl");
        var $html = index.get_card_html({"imageUrl": url});
        index.basic_modal($html);
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
        images.append($card_html);
        if ((i+1) % 3 == 0) {
            images.append("</br>");
        }
    }
    var html = images.append('<div><div class="fright">'
        + '<button id="to_battlefield" type="button" class="button">To Battlefield</button>'
        + '<button id="to_graveyard" type="button" class="button">To Graveyeard (aka instant)</button>'
        + '</div></div>'
    );
    index.basic_modal(html);
};

index.get_card_html = function (card) {
    var url = card.imageUrl;
    var img_html = '<div class="media-object-section">'
            //+ '<p class="name">' + name + '</p>'
            +  '<div>'
            +    '<a class="th" href="' + url + '">'
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
    var $modal = $("#modal");
    $html.append('<button class="close-button" data-close aria-label="Close reveal" type="button">'
        +    '<span aria-hidden="true">&times;</span>'
        +  '</button>'
    );
    $modal.html($html).foundation('open');
};
