var Lineup = require('./lineup.js');

console.log("inside main.js");
Lineup.loadDefaultPlayers(function(err) {
    if (err) console.log(err);
});
Lineup.loadCharacter("Zeus", true, function(err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
});

console.log(Lineup.getPlayer(true));
Lineup.moveCharacterToStandby("Zeus", true, function(err) {
    if (err) {
        console.log(err);
    }
});
console.log(Lineup.getCharacterByName("Zeus", true));