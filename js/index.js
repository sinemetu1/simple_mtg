var index = {};

index.init = function () {
    index.bind_search();
};

index.bind_search = function () {
    $("#search_cards").on('click', function (event) {
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
        var url = curr.imageUrl;
        if (i > 5) {
            break;
        }
        //var name = curr.name;
        var img_html = '<div class="media-object-section">'
            //+ '<p class="name">' + name + '</p>'
            +  '<div>'
            +    '<a class="th" href="' + url + '">'
            +      '<img src="' + url + '">'
            +      '<span class="image-hover-wrapper-reveal">'
            +        '<p>Check it<br><i class="fa fa-link" aria-hidden="true"></i></p>'
            +      '</span>'
            +    '</a>'
            +  '</div>'
            + '</div>'
        ;
        images.append($(img_html));
        if ((i+1) % 3 == 0) {
            images.append("</br>");
        }
    }
    var $modal = $("#modal");
    var html = images.append('<button class="close-button" data-close aria-label="Close reveal" type="button">'
        +    '<span aria-hidden="true">&times;</span>'
        +  '</button>'
    ).append('<div><div class="fright">'
        + '<button id="to_battlefield" type="button" class="button">To Battlefield</button>'
        + '<button id="to_graveyard" type="button" class="button">To Graveyeard (aka instant)</button>'
        + '</div></div>'
    );
    //$("body").append($modal);
    console.log('$modal.html(html):');
    console.log($modal.html(html));
    $modal.html(html).foundation('open');
    //$modal.foundation('open');
};
