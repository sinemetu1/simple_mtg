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

mtg.get_counter_class = function (counter) {
    switch (Math.abs(counter.val)) {
        case 1: return "fi-die-one";
        case 2: return "fi-die-two";
        case 3: return "fi-die-three";
        case 4: return "fi-die-four";
        case 5: return "fi-die-five";
        case 6: return "fi-die-six";
        default:
            console.error('Dont know which class for ', counter.val);
            break;
    }
};

mtg.get_counters = function (a_card) {
    var counters = [];
    if (a_card.counters) {
        for (var i = 0; i < a_card.counters.length; i++) {
            var curr = a_card.counters[i];
            var c_class = mtg.get_counter_class(curr);
            if (curr.is_pos) {
                counters.push("<li><i class='counter pos " + c_class + "'></i></li>");
            } else {
                counters.push("<li><i class='counter neg  " + c_class + "'></i></li>");
            }
        }
    }
    return counters.join("");
};

mtg.get_card = function (a_card) {
    var the_card = $("<a class='card'>"
        + "<ul class='counters'>" + mtg.get_counters(a_card) + "</ul>"
        + "<img src='" + a_card.imageUrl + "'/>"
        + "</a>");
    if (a_card.is_tapped) {
        the_card.addClass("card-tapped");
    }
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
