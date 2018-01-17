const phases = ["Place Actions", "Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn", "Upkeep"];
var phaseIndex = 0;

class Character {
	constructor(name, level, imagePath, combatActions, abilities, factionBonus, hp) {
		this.name = name;
		this.level = level;
		this.imagePath = imagePath;
		this.combatActions = combatActions;
		this.abilities = abilities;
		this.factionBonus = factionBonus;
		this.hp = hp;
		this.dmg = 0;
	}
}

var player1Cards = [];
var player2Cards = [];
var player1Lineup = [];
var player2Lineup = [];

/*** SETUP FUNCTIONS ***/

// on load, render cards
window.onload = function() {
	pushCardToLineup("Renegade Rick", true);
	pushCardToLineup("Billy", true);
	pushCardToLineup("Sheriff S4M", true);
	pushCardToLineup("Dexter", true);

	pushCardToLineup("Remus", false);
	pushCardToLineup("Augustus", false);
	pushCardToLineup("Zeus", false);
	pushCardToLineup("Matilda", false);

	// render HTML of all cards
	
	for (var i = 1; i <= 8; i++) {
		displayCard(i);
	}
};

/*** DECK/LINEUP/HAND CONSTRUCTION FUNCTIONS ***/

function pushCardToTotal(cardName, isPlayer1) {
	var arrayToAddTo = (isPlayer1 ? player1Cards : player2Cards);

	var character = constructCharacterFromDB(cardName);
	arrayToAddTo.push(character);
}

function pushCardToLineup(cardName, isPlayer1) {
	var arrayToAddTo = (isPlayer1 ? player1Lineup : player2Lineup);

	var character = constructCharacterFromDB(cardName);
	arrayToAddTo.push(character);
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
				return new Character(c.name, c.level, c.imagePath, c.combatActions, c.abilities, c.factionBonus, c.hp);
			}
		}
	}
}

/*** DMG FUNCTIONS ***/

function addDmg(id) {
	var fieldValue = document.getElementById("edit-dmg-field" + id).value;

	var num = Number(fieldValue);
	if (num == NaN) {
		alert("Input a number");
		document.getElementById("edit-dmg-field" + id).value = "";
		return;
	}
	if (num%1!=0) {
		alert("Input a whole number");
		document.getElementById("edit-dmg-field" + id).value = "";
		return;
	}

	// grab the array by reference of which player's cards we're dealing with
	var cards = (isPlayer1(id) ? player1Lineup : player2Lineup);
	var lineupIndex = getPlayerLineupIndex(id);
	var card = cards[lineupIndex];

	card.dmg = card.dmg + num;
	console.log(card.dmg);

	// redisplay the card with the modified DMG value
	displayCard(id);
	document.getElementById("edit-dmg-field" + id).value = "";
}

/*** PHASE FUNCTIONS ***/

function nextPhase() {
	phaseIndex++;
	if (phaseIndex >= phases.length) phaseIndex = 0;
	displayPhase();
}

/*** DISPLAY FUNCTIONS ***/

function displayPhase() {
	var tag = "Current Phase: ";
	document.getElementById("phase-label").innerHTML = tag + phases[phaseIndex];
}

// i=id# (card1,card2,card3,...)
function displayCard(i) {
	var div = document.getElementById("card" + i);

	// grab the array by reference of which player's cards we're dealing with
	var cards = (isPlayer1(i) ? player1Lineup : player2Lineup);
	var lineupIndex = getPlayerLineupIndex(i);
	var card = cards[lineupIndex];
	// this is really ugly, but my excuse is that I am a bad programmer

	// this catches for lack of combat actions
	var combatActionsText = (card.combatActions != null ? card.combatActions.description : "");
	var abilitiesText = (card.hasOwnProperty("abilities") ? card.abilities : "");

	htmlString = 
		"<div class=\"header\">" +
		"<h3>" + card.name + "</h3>" + "<div class=\"filler\"></div>" + "<h3>Lvl." + card.level + "</h3>" +
		"</div>" +
		"<img src=\"" + card.imagePath + "\" alt=\"placeholder image\">" +
		"<bodyHeaderCombat>Combat Actions</bodyHeaderCombat>" + "<p>" + combatActionsText + "</p>" +
		"<bodyHeaderAbilities>Abilities</bodyHeaderAbilities>" + "<p>" + abilitiesText + "</p>" +
		"<bodyHeaderFaction>Faction Bonus</bodyHeaderFaction>" + "<p>" + card.factionBonus + "</p>" +
		"<hpHeader>MAX HP: " + card.hp + "</hpHeader>" +
		"<dmgHeader>DMG: " + card.dmg + "</dmgHeader>"
	;

	div.innerHTML = htmlString;
}

/*** OTHER HELPER FUNCTIONS ***/

// returns whether an id refers to Player 1's stuff
function isPlayer1(id) {
	return id <= 4;
}

// returns the appropriate index of player's lineup given an id
function getPlayerLineupIndex(id) {
	// if Player1, pos1 is actually id=card4, pos2 card is id=card3, pos3 is id=card2, pos4 is id=card1
	// keep in mind things are 0-based indexes in the arrays themselves though
	var fixedIds = [3, 2, 1, 0];
	return (isPlayer1(id) ? fixedIds[id-1] : id-5);
}