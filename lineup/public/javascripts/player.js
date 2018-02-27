var character = require('./character.js');
var actionCard = require('./actionCard.js');

class Player {
    constructor(name) {
        this.name = name;

        // Character Cards
        this.characters = [];
        this.lineup = [null, null, null, null];
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

/**
 * Creates a new Player object
 * 
 * @param {String} name
 * @return {Player}
 */
function createPlayer(name) {
    return new Player(name);
}

/**
 * Push a Character object reference to the total characters array.
 * 
 * @param {Character} character 
 */
Player.prototype.addCharacter = function(character) {
    this.characters.push(character);
}

/**
 * Get the Character object by unique name, returning null if not found.
 * 
 * @param {String} name 
 * @return {Character}
 */
Player.prototype.getCharacterByName = function(name) {
    for (var i = 0; i < this.characters.length; i++) {
        if (this.characters[i].name == name) return this.characters[i];
    }
    return null;
}

/**
 * Push a ActionCard object reference to the total actionCards array
 * 
 * @param {ActionCard} actionCard 
 */
Player.prototype.addActionCard = function(actionCard) {
    this.actionCards.push(actionCard);
}

/**
 * Get the ActionCard object by local id, returning null if not found.
 * 
 * @param {Integer} localId 
 */
Player.prototype.getActionCardByLocalId = function(localId) {
    for (var i = 0; i < this.actionCards.length; i++) {
        if (this.actionCards[i].localId == localId) return this.actionCards[i];
    }
    return null;
}

/**
 * Moves a card from to another array, removing it from its previous spot (not used for moving to a lineup)
 * 
 * @param {Character || ActionCard} card
 * @param {String} arrayString
 */
Player.prototype.moveCardToArray = function(card, arrayString) {
    if (card == null) throw Error("tried to move null card");
    if (card.array == arrayString) throw Error("tried to move card to the same array");

    var arrayToAddTo;
    switch (arrayString) {
        case "defeated":
            arrayToAddTo = this.defeated;
            break;
        case "standby":
            arrayToAddTo = this.standby;
            break;
        case "hand":
            arrayToAddTo = this.hand;
            break;
        case "deck":
            arrayToAddTo = this.deck;
            break;
        case "flips":
            arrayToAddTo = this.flips;
            break;
        case "discards":
            arrayToAddTo = this.discards;
            break;
        default:
            throw Error("tried to move card to unrecognized array type");
            break;
    }

    if (card.array != null) {
        this.removeCardFromCurrentArray(card);
    }

    card.array = arrayString;
    card.arrayIndex = arrayToAddTo.length;
    arrayToAddTo.push(card);
}

/**
 * Moves a card to the correct position in a lineup
 * 
 * @param {Character} card
 * @param {Integer} posIndex
 */
Player.prototype.moveCardToLineup = function(card, posIndex) {
    if (card == null) throw Error("tried to move null card");
    if (card.array == "lineup" && card.arrayIndex == posIndex) throw Error("tried to move card to the same pos");
    if (posIndex >= 4) throw Error("invalid posIndex");

    if (this.lineup[posIndex] != null) throw Error("card is in the way");

    if (card.array != null) {
        // used for Eager, if the card is from somewhere that wasn't the lineup
        if (card.originArray != "lineup") {
            card.firstRound = true;
        }
        this.removeCardFromCurrentArray(card);
    }

    card.array = "lineup";
    card.arrayIndex = posIndex;
    this.lineup[posIndex] = card;
}

/**
 * Removes a card from its current array
 * 
 * @param {Character || ActionCard} card
 */
Player.prototype.removeCardFromCurrentArray = function(card) {
    if (card == null) throw Error("tried removing null card");
    if (card.array == null) throw Error("tried to remove card that was not in any array");

    // if card is in lineup, replace it with null
    if (card.array == "lineup") {
        this.lineup[card.arrayIndex] = null;
        card.array = null;
        return;
    }

    // in all other cases, we don't need to occupy the deleted spot
    var arrayToDeleteFrom;
    switch (card.array) {
        case "defeated":
            arrayToDeleteFrom = this.defeated;
            break;
        case "standby":
            arrayToDeleteFrom = this.standby;
            break;
        case "hand":
            arrayToDeleteFrom = this.hand;
            break;
        case "deck":
            arrayToDeleteFrom = this.deck;
            break;
        case "flips":
            arrayToDeleteFrom = this.flips;
            break;
        case "discards":
            arrayToDeleteFrom = this.discards;
            break;
        default:
            break;
    }

    arrayToDeleteFrom.splice(card.arrayIndex, 1);
    card.array = null;
}

module.exports = {
    createPlayer: createPlayer,
}
