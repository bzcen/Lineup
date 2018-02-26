(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
var characterStore = require('./characterStore.js');
var actionStore = require('./actionStore.js');
var factionBonusStore = require('./factionBonusStore');

/* used for local card ids to be assigned to each added character card */
var nextCardLocalIdToUse = 1; 
/* used for local action card ids to be assigned to each action card */
var nextActionCardLocalIdToUse = 1;

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

		this.localId = nextCardLocalIdToUse;
		// increment the next local id to use
		nextCardLocalIdToUse++;

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

function constructCharacter(cardName) {
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
}

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

function constructActionCard(cardName) {
	for (var i = 0; i < actionStore.length; i++) {
		if (actionStore[i].name == cardName) {
			var a = actionStore[i];
			return new ActionCard(a.name, a.cost, a.details, a.imagePath);
		}
	}
}

// TODO(bcen): these probably need an image path associated with it if we don't want plain text rep
class CharacterModifier {
	constructor(name, card, duration, startFunc, endFunc) {
		this.name = name;
		this.card = card;
		// how many rounds this modifier should last for
		this.duration = duration;
		// the function that should be called when the modifier starts
		this.startFunc = startFunc;
		// the function that should be called when the modifier ends
		this.endFunc = endFunc;
	}
}

module.exports = {
	constructCharacter: constructCharacter,
	constructActionCard: constructActionCard,
}
},{"./actionStore.js":1,"./characterStore.js":2,"./factionBonusStore":3}],5:[function(require,module,exports){
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
},{"./factory.js":4}],6:[function(require,module,exports){
var lineup = require('./lineup.js');

console.log("inside main.js");
lineup.loadDefaultPlayers();
lineup.loadCharacter("Zeus", true);
},{"./lineup.js":5}]},{},[6]);
