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
