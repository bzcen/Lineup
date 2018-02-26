var factory = require('./factory.js');

class Player {
    constructor(name) {
        this.name = name;

        // Character Cards
        this.characters = [];
        this.lineup = [];
        this.standby = [];
        this.defeated = [];

        // ACTION Cards
        this.actionCards = [];
        this.deck = [];
        this.discards = [];
        this.flips = [];
        this.hand = [];

        // ENERGY
        this.energy = 0;
    }
}

// Variables related to handling phases per round
var GameState = {
    PHASE_LABELS: ["Upkeep", "Leader - Place Actions", "Non-Leader - Place Actions",  "Leader - Flip Actions", "Non-Leader - Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn"],
    phaseIndex: -1,
    // track who is the leader of the round
    player1IsLeader: false,

    player1: null,
    player2: null,
    
    player1CharacterDefeatedThisRound: false,
    player2CharacterDefeatedThisRound: false,
};

// Load default empty players with placeholder names into the game state.
function loadDefaultPlayers() {
    GameState.player1 = new Player("Player 1");
    GameState.player2 = new Player("Player 2");
}

/**
 * Create a new Action Card object based off the name.
 * 
 * @param {String} actionCardName 
 * @param {Boolean} isPlayer1 
 */
function loadActionCard(actionCardName, isPlayer1) {
    var actionCards = getPlayer(isPlayer1).actionCards;

    var action = factory.constructActionCard(actionCardName);
    action.isPlayer1 = isPlayer1;
    actionCards.push(action);
}

/**
 * Create a new Character object based off the name.
 * 
 * @param {String} characterName 
 * @param {Boolean} isPlayer1 
 */
function loadCharacter(characterName, isPlayer1) {
    var characters = getPlayer(isPlayer1).characters;

    var character = factory.constructCharacter(characterName);
    character.isPlayer1 = isPlayer1;
    characters.push(character);
}

/** "Private" Helper Functions */

/**
 * Moves a card from to another array, removing it from its previous spot
 * 
 * @param {Character || ActionCard} card
 * @param {String} arrayString
 */
function moveCardToArray(card, arrayString) {
    if (card == null) throw Error("tried to move null card");
    if (card.array == arrayString) throw Error("tried to move card to the same array");

    var player = getPlayer(card.isPlayer1);
    var arrayToAddTo;
    switch (arrayString) {
        case "defeated":
            arrayToAddTo = player.defeated;
            break;
        case "standby":
            arrayToAddTo = player.standby;
            break;
        case "hand":
            arrayToAddTo = player.hand;
            break;
        case "deck":
            arrayToAddTo = player.deck;
            break;
        case "flips":
            arrayToAddTo = player.flips;
            break;
        case "discards":
            arrayToAddTo = player.discards;
            break;
        default:
            throw Error("tried to move card to unrecognized array type");
            break;
    }

    if (card.array != null) {
        removeCardFromCurrentArray(card);
    }

    card.array = arrayString;
    card.arrayIndex = arrayToAddTo.length;
    arrayToAddTo.push(card);
}

/**
 * Removes a card from its current array
 * 
 * @param {Character || ActionCard} card
 */
function removeCardFromCurrentArray(card) {
    if (card == null) throw Error("tried removing null card");
    if (card.array == null) throw Error("tried to remove card that was not in any array");

    // if card is in lineup, replace it with null
    if (card.array == "lineup") {
        var lineup = getPlayer(card.isPlayer1).lineup;
        lineup[card.arrayIndex] = null;
        card.array = null;
        return;
    }

    // in all other cases, we don't need to occupy the deleted spot
    var player = getPlayer(card.isPlayer1);
    var arrayToDeleteFrom;
    switch (card.array) {
        case "defeated":
            arrayToDeleteFrom = player.defeated;
            break;
        case "standby":
            arrayToDeleteFrom = player.standby;
            break;
        case "hand":
            arrayToDeleteFrom = player.hand;
            break;
        case "deck":
            arrayToDeleteFrom = player.deck;
            break;
        case "flips":
            arrayToDeleteFrom = player.flips;
            break;
        case "discards":
            arrayToDeleteFrom = player.discards;
            break;
        default:
            break;
    }

    arrayToDeleteFrom.splice(card.arrayIndex, 1);
    card.array = null;
}

/**
 * Get the player object from GameState based of boolean.
 * 
 * @param {Boolean} isPlayer1 
 */
function getPlayer(isPlayer1) {
    return (isPlayer1 ? GameState.player1 : GameState.player2);
}

module.exports = {
    loadDefaultPlayers: loadDefaultPlayers,
    loadActionCard: loadActionCard,
    loadCharacter: loadCharacter,
};