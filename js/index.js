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
    console.log('cards');
    console.log(cards);

    var images = $("<div>");
    for (var i = 0; i < cards.length; i++) {
        var curr = cards[i];
        if (i > 5) { // only display top 3
            break;
        }
        //var name = curr.name;
        var url = curr.imageUrl;
        var img_html = '<div class="fleft card">'
        //+ '<p class="name">' + name + '</p>'
        +  '<p class="lead">'
        +    '<a class="th" href="' + url + '">'
        +      '<img src="' + url + '">'
        +    '</a>'
        +  '</p>'
        + '</div>'
        ;
        images.append($(img_html));
    }
    var $modal = $("#modal");
    var html = images.append('<button class="close-button" data-close aria-label="Close reveal" type="button">'
    +    '<span aria-hidden="true">&times;</span>'
    +  '</button>'
    ).append('<div class="fright">'
        + '<button id="to_battlefield" type="button" class="button">To Battlefield</button>'
        + '<button id="to_graveyard" type="button" class="button">To Graveyeard (aka instant)</button>'
        + '</div>'
    );
    //$("body").append($modal);
    console.log('$modal.html(html):');
    console.log($modal.html(html));
    $modal.html(html).foundation('open');
    //$modal.foundation('open');
};
