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

function constructCharacterFromDB(cardName) {
	var factions = characterDB["factions"];
	// iterate through properties of factions object (aka each faction)
	for (var faction in factions) {
		// characters is an array of objects
		var characters = factions[faction];
		for (var i = 0; i < characters.length; i++) {
			if (characters[i].name == cardName) {
				var c = characters[i];

				var factionBonus = null;
				for (var j = 0; j < factionBonusDB.length; j++) {
					if (factionBonusDB[j].faction == c.faction) {
						factionBonus = factionBonusDB[j];
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

function constructActionCardFromDB(cardName) {
	for (var i = 0; i < actionsDB.length; i++) {
		if (actionsDB[i].name == cardName) {
			var a = actionsDB[i];
			return new ActionCard(a.name, a.cost, a.details, a.imagePath);
		}
	}
}

// TODO(bcen): these probably need an image path associated with it if we don't want plain text rep
class CharacterModifier {
	constructor(name, card, startFunc, endFunc) {
		this.name = name;
		this.card = card;
		// the function that should be called when the modifier starts
		this.startFunc = startFunc;
		// the function that should be called when the modifier ends
		this.endFunc = endFunc;

		// TODO(bcen): allow start/end function params to be passed into the modifier to improve flexibility
	}
}