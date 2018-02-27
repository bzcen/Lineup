(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var actionStore = require('./actionStore.js');

/* used for local action card ids to be assigned to each action card */
var nextActionCardLocalIdToUse = 1;

class ActionCard {
	constructor(name, cost, details, imagePath) {
		this.name = name;
		this.cost = cost;
		this.details = details;
		this.imagePath = imagePath;

		this.localId = nextActionCardLocalIdToUse;
		// increment the next local id to use
		nextActionCardLocalIdToUse++;
		this.isPlayer1;
		this.array = null;
		this.arrayIndex;
	}
}

function createActionCard(cardName) {
	for (var i = 0; i < actionStore.length; i++) {
		if (actionStore[i].name == cardName) {
			var a = actionStore[i];
			return new ActionCard(a.name, a.cost, a.details, a.imagePath);
		}
	}
	return null;
}

module.exports = {
    createActionCard: createActionCard,
}
},{"./actionStore.js":2}],2:[function(require,module,exports){
// next id to use = 9
actionStore = [
	{
		"id": 1,
		"name": "Swap Enemies",
		"cost": 2,
		"details": "Swap the positions of two adjacent character cards in the enemy lineup.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 2,
		"name": "Swap Allies",
		"cost": 2,
		"details": "Swap the positions of two adjacent character cards in your lineup.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 3,
		"name": "Retreat!",
		"cost": 2,
		"details": "Move a character card from your lineup to your standby pool.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 4,
		"name": "Red Potion",
		"cost": 2,
		"details": "Remove 2 DMG counters from a character card in your lineup or standby pool.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 5,
		"name": "Emergency Repairs",
		"cost": 2,
		"details": "(Requires a Whirly West character in your lineup) Remove 3 DMG counters from a Whirly West character card.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 6,
		"name": "Explosive Cask",
		"cost": 2,
		"details": "Add 2 DMG counters to a character card.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 7,
		"name": "Resupply",
		"cost": 2,
		"details": "(Requires a Utopia character in your lineup) Shuffle 4 ACTION cards of your choice in your discard pile into your deck.",
		"imagePath": "images/placeholder.jpg"
	},
	{
		"id": 8,
		"name": "Tactical Reformation",
		"cost": 2,
		"details": "(Requires a Legion character in your lineup) Rearrange your lineup.",
		"imagePath": "images/placeholder.jpg"
	},
];

module.exports = actionStore;
},{}],3:[function(require,module,exports){
var factionBonusStore = require('./factionBonusStore');
var characterStore = require('./characterStore');

/* used for local card ids to be assigned to each added character card */
var nextCharacterLocalIdToUse = 1; 

class Character {
	constructor(name, faction, level, imagePath, combatActions, abilities, factionBonus, hp) {
		this.name = name;
		this.faction = faction;
		this.level = level;
		this.imagePath = imagePath;
		this.combatActions = combatActions;
		this.abilities = abilities;
		this.factionBonus = factionBonus;
		this.hp = hp;
		this.dmg = 0;

		this.localId = nextCharacterLocalIdToUse;
		// increment the next local id to use
		nextCharacterLocalIdToUse++;

		// represents the location of the card
		this.array = null;
		this.arrayIndex;
		this.isPlayer1;

		// used for Eager keyword
		this.firstRound = false;

		// currently primarily used for "prevent dmg from combat" abilities
		// this gets reset to 0 at the end of turn
		this.dmgFromCombatThisTurn = 0;

		// for temporary buffs/debuffs
		// these should be reserved for ones that should be visually shown on lineup
		this.modifiers = [];
	}
}

function createCharacter(cardName) {
	var factions = characterStore["factions"];
	// iterate through properties of factions object (aka each faction)
	for (var faction in factions) {
		// characters is an array of objects
		var characters = factions[faction];
		for (var i = 0; i < characters.length; i++) {
			if (characters[i].name == cardName) {
				var c = characters[i];

				if (c.combatActions != null) {
					// some extra work to build the combat actions attribute to match abilities/FB
					// allows for code reuse with abilities and faction bonuses later on
					for (var j = 0; j < c.combatActions.details.length; j++) {
						var action = c.combatActions.details[j];
						action.type = "combat";
						action.functionName = "addDmgToPositions";
						action.parameters = [action.dmg, action.target];
						action.conditions = [
							{functionName: "inPosition", parameters: action.position},
							{functionName: "characterInPositions", parameters: [false, true, action.target]}
						];
						if (typeof(action.keyword) !== "undefined") {
							action.conditions.push({functionName: "verifiedKeyword", parameters: action.keyword});
							delete action.keyword;
						}

						delete action.dmg;
						delete action.target;
						delete action.position;
					}
				}

				// grab the faction bonus from a separate JSON
				var factionBonus = null;
				for (var j = 0; j < factionBonusStore.length; j++) {
					if (factionBonusStore[j].faction == c.faction) {
						factionBonus = factionBonusStore[j];
						break;
					}
				}
				return new Character(c.name, c.faction, c.level, c.imagePath, c.combatActions, c.abilities, factionBonus, c.hp);
			}
		}
	}
	return null;
}

module.exports = {
    createCharacter: createCharacter,
}
},{"./characterStore":4,"./factionBonusStore":5}],4:[function(require,module,exports){
// next id to use = 13
characterStore = {	
	"factions": {
		"Legion": [
			{
				"id": 7,
				"faction": "Legion",
				"name": "Augustus",
				"level": 4,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "1/2/3: 2 DMG to Position 1",
					"details": [
						{
							"position": 7,
							"target": 1,
							"dmg": 2
						}
					]
				},
				"abilities": "During combat, prevent 1 DMG counter from being added to the character behind this character",
				"hp": 12	
			},
			{
				"id": 8,
				"faction": "Legion",
				"name": "Matilda",
				"level": 2,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": null,
				"abilities": "At end of turn, remove 2 DMG counters from friendly characters in Position 1 and Position 2",
				"hp": 6	
			},
			{
				"id": 9,
				"faction": "Legion",
				"name": "Milo",
				"level": 3,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "3/4: 1 DMG to Position 1/2",
					"details": [
						{
							"position": 12,
							"target": 3,
							"dmg": 1
						}
					]
				},				
				"abilities": "",
				"hp": 13	
			},
			{
				"id": 10,
				"faction": "Legion",
				"name": "Remus",
				"level": 2,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "1/2: 2 DMG to Position 1",
					"details": [
						{
							"position": 3,
							"target": 1,
							"dmg": 2
						}
					]
				},
				"abilities": "",
				"hp": 9
			},
			{
				"id": 11,
				"faction": "Legion",
				"name": "Rufus",
				"level": 2,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "2 DMG to Position 2",
					"details": [
						{
							"position": 15,
							"target": 2,
							"dmg": 2
						}
					]
				},
				"abilities": "At end of turn, remove 1 DMG counter from each character in your lineup",
				"hp": 7
			},
			{
				"id": 12,
				"faction": "Legion",
				"name": "Zeus",
				"level": 5,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "2 DMG to Position 1<br/>1 DMG to Position 2",
					"details": [
						{
							"position": 15,
							"target": 1,
							"dmg": 2
						},
						{
							"position": 15,
							"target": 2,
							"dmg": 1
						}
					]
				},
				"abilities": "Whenever an opponent adds a character card to his/her lineup, add 3 DMG counters to it",
				"hp": 15
			},
		],
		"Whirly West": [
			{
				"id": 1,
				"faction": "Whirly West",
				"name": "Billy",
				"level": 4,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "Eager: 1 DMG to Position 1/2/3<br/>1 DMG to Position 1/2/3",
					"details": [
						{
							"position": 15,
							"target": 15,
							"dmg": 1,
							"keyword": "Eager"
						},
						{
							"position": 15,
							"target": 15,
							"dmg": 1
						}
					]
				},
				"abilities": "",
				"hp": 7
			},
			{
				"id": 2,
				"faction": "Whirly West",
				"name": "Carbine",
				"level": 3,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "2/3/4: 3 DMG to Position 3",
					"details": [
						{
							"position": 14,
							"target": 3,
							"dmg": 3
						}
					]
				},
				"abilities": "",
				"hp": 7
			},
			{
				"id": 3,
				"faction": "Whirly West",
				"name": "Dexter",
				"level": 1,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "3/4: 2 DMG to Position 4",
					"details": [
						{
							"position": 12,
							"target": 8,
							"dmg": 2
						}
					]
				},
				"abilities": "",
				"hp": 4
			},
			{
				"id": 4,
				"faction": "Whirly West",
				"name": "Remington",
				"level": 2,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "3 DMG to Position 2",
					"details": [
						{
							"position": 15,
							"target": 2,
							"dmg": 3
						}
					]
				},
				"abilities": "",
				"hp": 5
			},
			{
				"id": 5,
				"faction": "Whirly West",
				"name": "Renegade Rick",
				"level": 3,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "1: 1 DMG to Position 1<br/>2/3/4: 2 DMG to Position 2",
					"details": [
						{
							"position": 1,
							"target": 1,
							"dmg": 1
						},
						{
							"position": 14,
							"target": 2,
							"dmg": 2
						}
					]
				},
				"abilities": "During combat, if there is less than 4 character cards in your lineup, deal +1 DMG to all Combat Actions",
				"hp": 10
			},
			{
				"id": 6,
				"faction": "Whirly West",
				"name": "Sheriff S4M",
				"level": 5,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "3 DMG to Position 1/2",
					"details": [
						{
							"position": 15,
							"target": 3,
							"dmg": 3
						}
					]
				},
				"abilities": "At end of turn, draw an ACTION card for each opposing character card that died during this turn's resolve combat phase",
				"hp": 12
			},
		],
	}
};

module.exports = characterStore;
},{}],5:[function(require,module,exports){
factionBonusStore = [
    {
        "faction": "Legion",
        "description": "At end of turn, if a character left the enemy lineup, gain +1 DMG to all Combat Actions for the next round only",
		"details": [
		    {
			    "type": "end-of-turn",
				"functionName": "addDmgModifierToSelf",
				"parameters": 1,
				"conditions" : [
			        {
					    "functionName": "characterDefeatedThisRound",
						"parameters": [false, true]
					}
				]
			}
		]
    },
    {
        "faction": "Whirly West",
        "description": "During combat, prevent 1 DMG counter from being added to this character",
        "details": [
            {
                "type": "end-of-combat",
                "functionName": "preventDmgFromCombat",
                "parameters": 1,
                "conditions" : [
                    {
                        "functionName": "combatDmgThisRound",
                        "parameters": 1
                    }
                ]
            }
        ]
    }
];

module.exports = factionBonusStore;
},{}],6:[function(require,module,exports){
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
},{"./actionCard.js":1,"./character.js":3,"./player.js":8}],7:[function(require,module,exports){
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
},{"./lineup.js":6}],8:[function(require,module,exports){
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

},{"./actionCard.js":1,"./character.js":3}]},{},[7]);
