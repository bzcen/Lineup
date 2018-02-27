var Player = require('./player.js');
var Character = require('./character.js');
var ActionCard = require('./actionCard.js');

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

/**
 * Load default empty players with placeholder names into the game state.
 * 
 * @param {Function} callback 
 */
function loadDefaultPlayers(callback) {
    GameState.player1 = Player.createPlayer("Player 1");
    GameState.player2 = Player.createPlayer("Player 2");
    callback(null);
}

/**
 * Create a new Action Card object based off the name.
 * 
 * @param {String} actionCardName 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback
 */
function loadActionCard(actionCardName, isPlayer1, callback) {
    var action = ActionCard.createActionCard(actionCardName);
    if (!action) {
        callback(new Error("could not construct action card"));
    } else {
        action.isPlayer1 = isPlayer1;
        getPlayer(isPlayer1).addActionCard(action);
        callback(null, action);
    }
}

/**
 * Get the ActionCard object with localId.
 * 
 * @param {Integer} localId 
 * @param {Boolean} isPLayer1 
 * @param {Function} callback 
 */
function getActionCardByLocalId(localId, isPLayer1, callback) {
    var actionCard = getPlayer(isPlayer1).getActionCardByLocalId(localId);
    if (!actionCard) {
        typeof callback === 'function' && callback(new Error("could not find actionCard"));
        return null;
    }
    typeof callback === 'function' && callback(null, actionCard);
    return actionCard;
}

/**
 * Create a new Character object based off the name.
 * 
 * @param {String} characterName 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback
 */
function loadCharacter(characterName, isPlayer1, callback) {
    var character = Character.createCharacter(characterName);
    if (!character == null) {
        typeof callback === 'function' && callback(new Error("could not construct character"));
    } else {
        character.isPlayer1 = isPlayer1;
        getPlayer(isPlayer1).addCharacter(character);
        typeof callback === 'function' && callback(null, character);
    }
}

/**
 * Get the Character object from a Player by unique name. Returns null if not found.
 * 
 * @param {String} name 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback
 * @return {Character}
 */
function getCharacterByName(name, isPlayer1, callback) {
    var character = getPlayer(isPlayer1).getCharacterByName(name);
    if (!character) {
        typeof callback === 'function' && callback(new Error("could not find character"));
        return null;
    }
    typeof callback === 'function' && callback(null, character);
    return character;
}

/**
 * Get the player object from GameState based of boolean.
 * 
 * @param {Boolean} isPlayer1 
 * @return {Player}
 */
function getPlayer(isPlayer1) {
    return (isPlayer1 ? GameState.player1 : GameState.player2);
}

/**
 * Move a character to the player's defeated zone.
 * 
 * @param {String} name 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback
 */
function moveCharacterToDefeated(name, isPlayer1, callback) {
    var character = getPlayer(isPlayer1).getCharacterByName(name);
    moveCardToArray(character, isPlayer1, "defeated", callback);
}

/**
 * Move a character to the player's standby zone.
 * 
 * @param {String} name 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback 
 */
function moveCharacterToStandby(name, isPlayer1, callback) {
    var character = getPlayer(isPlayer1).getCharacterByName(name);
    moveCardToArray(character, isPlayer1, "standby", callback);
}

/**
 * Move a character to the player's lineup at a certain position.
 * 
 * @param {String} name 
 * @param {Boolean} isPlayer1 
 * @param {Integer} posIndex
 * @param {Function} callback 
 */
function moveCharacterToLineup(name, isPlayer1, posIndex, callback) {
    var character = getPlayer(isPlayer1).getCharacterByName(name);
    moveCardToArray(character, isPlayer1, "lineup", callback, posIndex);
}

/**
 * Move an Action Card to the player's hand.
 * 
 * @param {Integer} localId 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback 
 */
function moveActionCardToHand(localId, isPlayer1, callback) {
    var actionCard = getPlayer(isPlayer1).getActionCardByLocalId(localId);
    moveCardToArray(actionCard, isPlayer1, "hand", callback);
}

/**
 * Move an Action Card to the player's flips zone.
 * 
 * @param {Integer} localId 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback 
 */
function moveActionCardToFlips(localId, isPlayer1, callback) {
    var actionCard = getPlayer(isPlayer1).getActionCardByLocalId(localId);
    moveCardToArray(actionCard, isPlayer1, "flips", callback);
}

/**
 * Move an Action Card to the player's discards zone.
 * 
 * @param {Integer} localId 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback 
 */
function moveActionCardToDiscards(localId, isPlayer1, callback) {
    var actionCard = getPlayer(isPlayer1).getActionCardByLocalId(localId);
    moveCardToArray(actionCard, isPlayer1, "discards", callback);
}

/**
 * Move an Action Card to the player's deck zone.
 * 
 * @param {Integer} localId 
 * @param {Boolean} isPlayer1 
 * @param {Function} callback 
 */
function moveActionCardToDeck(localId, isPlayer1, callback) {
    var actionCard = getPlayer(isPlayer1).getActionCardByLocalId(localId);
    moveCardToArray(actionCard, isPlayer1, "deck", callback);
}

/**
 * General function for moving a card from one player array to another.
 * 
 * @param {Character || ActionCard} card 
 * @param {Boolean} isPlayer1 
 * @param {String} arrayString 
 * @param {Function} callback 
 * @param {Integer} posIndex
 */
function moveCardToArray(card, isPlayer1, arrayString, callback, posIndex) {
    if (!card) {
        typeof callback === 'function' && callback(new Error("could not find card"));
        return;
    }

    var player = getPlayer(isPlayer1);
    try {
        if (typeof posIndex === 'number') {
            player.moveCardToLineup(card, posIndex)
        } else {
            player.moveCardToArray(card, arrayString);
        }
        typeof callback === 'function' && callback(null);
    } catch (e) {
        typeof callback === 'function' && callback(e);
    }
}

module.exports = {
    loadDefaultPlayers: loadDefaultPlayers,
    loadActionCard: loadActionCard,
    loadCharacter: loadCharacter,
    getCharacterByName: getCharacterByName,
    getActionCardByLocalId: getActionCardByLocalId,
    getPlayer: getPlayer,
    moveCharacterToDefeated: moveCharacterToDefeated,
    moveCharacterToLineup: moveCharacterToLineup,
    moveCharacterToStandby: moveCharacterToStandby,
    moveActionCardToDeck: moveActionCardToDeck,
    moveActionCardToDiscards: moveActionCardToDiscards,
    moveActionCardToFlips: moveActionCardToFlips,
    moveActionCardToHand: moveActionCardToHand,
};