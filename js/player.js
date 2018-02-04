var player = {};

player.make_player = function (name, id) {
    return {
        id
        , name
        , battlefield: []
        , graveyard: []
        , exile: []
    };
};

player.display = function (a_player) {
    var a_hand = mtg.make_hand(index.battlefield);
    $("#hand_battlefield").html(a_hand);

    var a_hand = mtg.make_hand(index.graveyard);
    $("#hand_graveyard").html(a_hand);

    var a_hand = mtg.make_hand(index.exile);
    $("#hand_exile").html(a_hand);
};
