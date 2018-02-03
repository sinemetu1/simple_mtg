var mtg = {};

mtg.search = function (name, cb, fail) {
  $.ajax({
      "url": "https://api.magicthegathering.io/v1/cards",
      "data": {
          name: name
      }
  }).done(function (data) {
      cb(data.cards);
  }).fail(function (err) {
      fail(err);
  });
};

mtg.get_card = function (a_card) {
    return $("<li><a class='card'> <img src='" + a_card.imageUrl + "'/></a>");
};

mtg.make_hand = function (cards) {
    var hand = $("<ul class='hand'>");
    for (var i = 0; i < cards.length; i++) {
        var curr = cards[i];
        hand.append(mtg.get_card(curr));
    }
    return hand.wrap("<div class='playingCards'>");
};
