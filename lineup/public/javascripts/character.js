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