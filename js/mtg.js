var mtg = {};

mtg.search = function (name, cb, fail) {
  $.ajax({
      "url": "https://api.magicthegathering.io/v1/cards",
      "data": {
          name: name
      }
  }).done(function (data) {
      console.log(data.cards);
      cb(data.cards);
  }).fail(function (err) {
      fail(err);
  });
};

mtg.get_card = function (a_card) {
    var the_card = $("<a class='card'> <img src='" + a_card.imageUrl + "'/></a>")
        .data("imageUrl", a_card.imageUrl);
    return $("<li></li>").append(the_card);
};

mtg.make_hand = function (cards) {
    var hand = $("<ul class='hand'>");
    for (var i = 0; i < cards.length; i++) {
        var curr = cards[i];
        hand.append(mtg.get_card(curr));
    }
    return hand.wrap("<div class='playingCards'>");
};
