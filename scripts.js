const phases = ["Place Actions", "Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn", "Upkeep"];
var phaseIndex = -1;

/* used for local card ids to be assigned to each added card */
var nextCardLocalIdToUse = 1; 

/* used for card menu context menu */
var cardMenu;
var cardMenuState = 0;
var cardMenuActive = "card-menu--active";
var cardMenuPosition;
var cardMenuPositionX;
var cardMenuPositionY;

var cardInContext;

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

		this.localId = nextCardLocalIdToUse;
		// increment the next local id to use
		nextCardLocalIdToUse++;

		// represents the location of the card
		this.array = null;
		this.arrayIndex;
		this.isPlayer1;
	}
}

var player1Cards = [];
var player2Cards = [];
var player1Lineup = [];
var player2Lineup = [];
var player1Standby = [];
var player2Standby = [];
var player1Defeated = [];
var player2Defeated = [];

/*** SETUP FUNCTIONS ***/

// TODO(bcen): follow this guide for how to fix resize issues with context menus
// https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

// on load, render cards
window.onload = function() {
	pushCardToTotal("Renegade Rick", true);
	pushCardToTotal("Billy", true);
	pushCardToTotal("Sheriff S4M", true);
	pushCardToTotal("Dexter", true);

	// temporary
	for (var i = 0; i < player1Cards.length; i++) {
		pushCardToLineup(player1Cards[i], true);
	}

	pushCardToTotal("Remus", false);
	pushCardToTotal("Augustus", false);
	pushCardToTotal("Zeus", false);
	pushCardToTotal("Matilda", false);

	// temporary
	for (var i = 0; i < player2Cards.length; i++) {
		pushCardToLineup(player2Cards[i], false);
	}

	// render HTML of all lineup cards
	displayLineup();
	nextPhase();

	// setup listeners
	setUpContextListener();
	setUpClickListener();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	var standby_modal = document.getElementById("standby-modal");
	var defeated_modal = document.getElementById("defeated-modal");
    if (event.target == standby_modal) {
    	hideStandbyModal();
    }
    if (event.target == defeated_modal) {
    	hideDefeatedModal();
    }
}

function setUpContextListener() {
	// Setup context listener for card menu

	// grab the card menu by id
	// TODO(bcen): remove this from window.onload path and into a self-executing func
	cardMenu = document.querySelector("#card-menu");

	document.addEventListener("contextmenu", function(e) {
		cardInContext = clickInsideElement(e, "card-container");

		if (cardInContext) {
			e.preventDefault();
			toggleCardMenuOn();
			positionCardMenu(e);
		} else {
			cardInContext = null;
			toggleCardMenuOff();
		}
	});
}

// helper function for checking if an element is within a className
function clickInsideElement(e, className) {
	var el = e.srcElement || e.target;

	if (el.classList.contains(className)) {
		return el;
	} else {
		while (el = el.parentNode) {
			if (el.classList && el.classList.contains(className)) {
				return el;
			}
		}
	}
	return false;
}

// helper function for modifying the position of a card menu context menu
function positionCardMenu(e) {
	cardMenuPosition = getEventPosition(e);
	cardMenuPositionX = cardMenuPosition.x + "px";
	cardMenuPositionY = cardMenuPosition.y + "px";

	cardMenu.style.left = cardMenuPositionX;
	cardMenu.style.top = cardMenuPositionY;
}

// helper function for getting the position of an event
function getEventPosition(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;

	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return {
		x: posx,
		y: posy
	}
}

function toggleCardMenuOn() {
	if (cardMenuState !== 1) {
		cardMenuState = 1;
		// this could probably be redone to just change the display style
		cardMenu.classList.add(cardMenuActive);
	}
}

function toggleCardMenuOff() {
	if (cardMenuState !== 0) {
		cardMenuState = 0;
		cardMenu.classList.remove(cardMenuActive);
	}
}

function setUpClickListener() {
	document.addEventListener( "click", function(e) {
		var clickIsCardMenuLink = clickInsideElement(e, "card-menu-link");

		if (clickIsCardMenuLink) {
			e.preventDefault();
			cardMenuLinkListener(clickIsCardMenuLink);
		} else {
			var button = e.which || e.button;
			if ( button === 1 ) {
				toggleCardMenuOff();
			}
		}
	});
}

function cardMenuLinkListener(link) {
	var card_id = cardInContext.getAttribute("card-local-id");
	var menu_action = link.getAttribute("menu-action");

	if (menu_action == "move-to-standby") {
		moveToStandbyByCardMenu(card_id);
	} else if (menu_action == "move-to-defeated") {
		moveToDefeatedByCardMenu(card_id);
	}
	toggleCardMenuOff();
}

/*** DECK/LINEUP/HAND CONSTRUCTION FUNCTIONS ***/

// will actual create the new card instance
function pushCardToTotal(cardName, isPlayer1) {
	var arrayToAddTo = (isPlayer1 ? player1Cards : player2Cards);

	var character = constructCharacterFromDB(cardName);
	character.isPlayer1 = isPlayer1;
	arrayToAddTo.push(character);
}

// pushes a card by reference into a lineup
function pushCardToLineup(card, isPlayer1) {
	if (card == null) return;
	var arrayToAddTo = (isPlayer1 ? player1Lineup : player2Lineup);
	card.array = "lineup";
	card.arrayIndex = arrayToAddTo.length;
	arrayToAddTo.push(card);
}

// pushes a card by reference into a defeated pool
function pushCardToDefeated(card, isPlayer1) {
	if (card == null) return;
	var arrayToAddTo = (isPlayer1 ? player1Defeated : player2Defeated);
	card.array = "defeated";
	card.arrayIndex = arrayToAddTo.length;
	arrayToAddTo.push(card);
}

// pushes a card by reference into a standby pool
function pushCardToStandby(card, isPlayer1) {
	if (card == null) return;
	var arrayToAddTo = (isPlayer1 ? player1Standby : player2Standby);
	card.array = "standby";
	card.arrayIndex = arrayToAddTo.length;
	arrayToAddTo.push(card);
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
	if (fieldValue == "") {
		alert("Input a number");
		return;
	}

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
	if (lineupIndex >= cards.length) {
		alert("No card is here");
		document.getElementById("edit-dmg-field" + id).value = "";
		return;
	}
	var card = cards[lineupIndex];
	if (card == null) {
		alert("No card is here");
		document.getElementById("edit-dmg-field" + id).value = "";
		return;
	}

	card.dmg = card.dmg + num;

	// redisplay the card with the modified DMG value
	displayCard(id);
	document.getElementById("edit-dmg-field" + id).value = "";
}

/*** LINEUP MOVEMENT FUNCTIONS ***/

// moves a card located at id in lineup to corresponding player's defeated pool
function moveToDefeated(id) {
	// grab the array by reference of which player's cards we're dealing with
	var cards = (isPlayer1(id) ? player1Lineup : player2Lineup);
	var lineupIndex = getPlayerLineupIndex(id);
	if (lineupIndex >= cards.length) {
		alert("No card is here");
		return;
	}
	var card = cards[lineupIndex];
	if (card == null) {
		alert("No card is here");
		return;
	}
	var defeated = (isPlayer1(id) ? player1Defeated: player2Defeated);
	defeated.push(card);
	cards[lineupIndex] = null;

	// redisplay the spot
	displayCard(id);
}

// moves a card with localId to standby
function moveToStandbyByCardMenu(localId) {
	var card = getCardFromLocalId(localId);
	if (card.array == "standby") return;
	var isPlayer1 = card.isPlayer1;

	if (card.array == "lineup") {
		var lineup = (card.isPlayer1 ? player1Lineup : player2Lineup);
		lineup[card.arrayIndex] = null;
		pushCardToStandby(card, card.isPlayer1);
		displayLineup();
	}
	else if (card.array == "defeated") {
		var defeated = (card.isPlayer1 ? player1Defeated : player2Defeated);
		defeated[card.arrayIndex] = null;
		if (card.isPlayer1) {
			player1Defeated = cleanArray(defeated);
		} else {
			player2Defeated = cleanArray(defeated);
		}
		pushCardToStandby(card, card.isPlayer1);
		showDefeatedModal(card.isPlayer1);
	}
}

// moves a card with localId to defeated
function moveToDefeatedByCardMenu(localId) {
	var card = getCardFromLocalId(localId);
	if (card.array == "defeated") return;
	var isPlayer1 = card.isPlayer1;

	if (card.array == "lineup") {
		var lineup = (card.isPlayer1 ? player1Lineup : player2Lineup);
		lineup[card.arrayIndex] = null;
		pushCardToDefeated(card, card.isPlayer1);
		displayLineup();
	}
	else if (card.array == "standby") {
		var standby = (card.isPlayer1 ? player1Standby : player2Standby);
		standby[card.arrayIndex] = null;
		if (card.isPlayer1) {
			player1Standby = cleanArray(standby);
		} else {
			player2Standby = cleanArray(standby);
		}
		pushCardToDefeated(card, card.isPlayer1);
		showStandbyModal(card.isPlayer1);
	}
}

// moves a card located at id in lineup to corresponding player's standby pool
function moveToStandby(id) {
	// grab the array by reference of which player's cards we're dealing with
	var cards = (isPlayer1(id) ? player1Lineup : player2Lineup);
	var lineupIndex = getPlayerLineupIndex(id);
	if (lineupIndex >= cards.length) {
		alert("No card is here");
		return;
	}
	var card = cards[lineupIndex];
	if (card == null) {
		alert("No card is here");
		return;
	}
	var standby = (isPlayer1(id) ? player1Standby: player2Standby);
	standby.push(card);
	cards[lineupIndex] = null;

	// redisplay the spot
	displayCard(id);
}

function swapPositions(isPlayer1) {
	var fieldA, fieldB;
	if (isPlayer1) {
		fieldA = document.getElementById("swap-position-field1-1");
		fieldB = document.getElementById("swap-position-field1-2");
	} else {
		fieldA = document.getElementById("swap-position-field2-1");
		fieldB = document.getElementById("swap-position-field2-2");
	}
	if (fieldA.value == "" || fieldB.value == "") {
		alert("Missing number(s)");
		return;
	}

	var posA = Number(fieldA.value);
	var posB = Number(fieldB.value);
	if (posA == NaN || posB == NaN) {
		alert("Missing number(s)");
		return;
	}
	if (posA%1!=0 || posB%1!=0) {
		alert("Input whole number(s)");
		fieldA.value = "";
		fieldB.value = "";
		return;
	}
	if (posA < 1 || posA >=5 || posB < 1 || posB >=5) {
		alert("Input number(s) between 1 and 5");
		fieldA.value = "";
		fieldB.value = "";
		return;
	}
	var indexA = posA-1;
	var indexB = posB-1;

	var lineup = (isPlayer1 ? player1Lineup : player2Lineup);
	// perform the swap
	var temp = lineup[indexA];
	lineup[indexA] = lineup[indexB];
	lineup[indexB] = temp;

	displayCard(getCardId(isPlayer1, indexA));
	displayCard(getCardId(isPlayer1, indexB));

	fieldA.value = "";
	fieldB.value = "";
	return;
}

/*** PHASE FUNCTIONS ***/

function nextPhase() {
	phaseIndex++;
	if (phaseIndex >= phases.length) phaseIndex = 0;
	displayPhase();
}

/*** DISPLAY FUNCTIONS ***/

function displayPhase() {
	var tag = "Phase: ";
	document.getElementById("phase-label").innerHTML = tag + phases[phaseIndex];
}

function displayLineup() {
	displayPlayer1Lineup();
	displayPlayer2Lineup();
}

function displayPlayer1Lineup() {
	for (var i = 1; i <= 4; i++) {
		displayCard(i);
	}
}

function displayPlayer2Lineup() {
	for (var i = 5; i <= 8; i++) {
		displayCard(i);
	}
}

// i=id# (card1,card2,card3,...)
// assumes id is input correctly
function displayCard(i) {
	var div = document.getElementById("position-card-container" + i);

	// grab the array by reference of which player's cards we're dealing with
	var cards = (isPlayer1(i) ? player1Lineup : player2Lineup);
	var lineupIndex = getPlayerLineupIndex(i);
	if (lineupIndex >= cards.length) {
		div.innerHTML = "";
		return;
	}
	var card = cards[lineupIndex];
	if (card == null) {
		div.innerHTML = "";
		return;
	}
	div.innerHTML = getCardDisplayHTML(card);
}

// Get card HTML string
function getCardDisplayHTML(card) {
	// this catches for lack of combat actions
	var combatActionsText = (card.combatActions != null ? card.combatActions.description : "");
	var abilitiesText = (card.hasOwnProperty("abilities") ? card.abilities : "");

	htmlString = 
		"<div class=\"card-container\" card-local-id=\"" + card.localId + "\">" +
		"<div class=\"header\">" +
		"<h3>" + card.name + "</h3>" + "<div class=\"filler\"></div>" + "<h3>Lvl." + card.level + "</h3>" +
		"</div>" +
		"<img src=\"" + card.imagePath + "\" alt=\"placeholder image\">" +
		"<bodyHeaderCombat>Combat Actions</bodyHeaderCombat>" + "<p>" + combatActionsText + "</p>" +
		"<bodyHeaderAbilities>Abilities</bodyHeaderAbilities>" + "<p>" + abilitiesText + "</p>" +
		"<bodyHeaderFaction>Faction Bonus</bodyHeaderFaction>" + "<p>" + card.factionBonus + "</p>" +
		"<hpHeader>MAX HP: " + card.hp + "</hpHeader>" +
		"<dmgHeader>DMG: " + card.dmg + "</dmgHeader>" +
		"</div"
	;

	return htmlString;
}

/*** MODAL FUNCTIONS ***/

// display Standby Modal
function showStandbyModal(isPlayer1) {
	var modal = document.getElementById("standby-modal");
	modal.style.display = "block";

	var standby = (isPlayer1 ? player1Standby : player2Standby);
	var card_container = document.getElementById("standby-modal-card-container");

	card_container.innerHTML = "";
	for (var i = 0; i < standby.length; i++) {
		card_container.innerHTML += getCardDisplayHTML(standby[i]);
	}
}

// hide Standby Modal
function hideStandbyModal() {
	var modal = document.getElementById("standby-modal");
	modal.style.display= "none";
	var card_container = document.getElementById("standby-modal-card-container");
	card_container.innerHTML = "";

}

// display Defeated Modal
function showDefeatedModal(isPlayer1) {
	var modal = document.getElementById("defeated-modal");
	modal.style.display = "block";

	var defeated = (isPlayer1 ? player1Defeated : player2Defeated);
	var card_container = document.getElementById("defeated-modal-card-container");

	card_container.innerHTML = "";
	for (var i = 0; i < defeated.length; i++) {
		card_container.innerHTML += getCardDisplayHTML(defeated[i]);
	}
}

// hide Defeated Modal
function hideDefeatedModal() {
	var modal = document.getElementById("defeated-modal");
	modal.style.display= "none";
	var card_container = document.getElementById("defeated-modal-card-container");
	card_container.innerHTML = "";

}

/*** OTHER HELPER FUNCTIONS ***/

function getCardFromLocalId(localId) {
	for (var i = 0; i < player1Cards.length; i++) {
		var card = player1Cards[i];
		if (card.localId == localId) return card;
	}
	for (var i = 0; i < player2Cards.length; i++) {
		var card = player2Cards[i];
		if (card.localId == localId) return card;
	} 
	return null;
}

// helper to remove null spots in the card array index
function cleanArray(array) {
	array = array.filter(n=>n);
	// fix indexes
	for (var i = 0; i < array.length; i++) {
		array[i].arrayIndex = i;
	}
	return array;
}

// returns whether a id refers to Player 1's cards
function isPlayer1(id) {
	return id <= 4;
	/*
	for (var i = 0; i < player1Cards.length; i++) {
		if (player1Cards[i].localId == localId) return true;
	}

	for (var i = 0; i < player2Cards.length; i++) {
		if (player2Cards[i].localId == localId) return false;
	} */
}

// returns the appropriate index of player's lineup given an id
function getPlayerLineupIndex(id) {
	// if Player1, pos1 is actually id=card4, pos2 card is id=card3, pos3 is id=card2, pos4 is id=card1
	// keep in mind things are 0-based indexes in the arrays themselves though
	var fixedIds = [3, 2, 1, 0];
	return (isPlayer1(id) ? fixedIds[id-1] : id-5);

	/*
	for (var i = 0; i < player1Lineup.length; i++) {
		if (player1Lineup[i].localId == localId) return i;
	}

	for (var i = 0; i < player2Lineup.length; i++) {
		if (player2Lineup[i].localId == localId) return i;
	} */
}

// returns the id given a player lineup index
function getCardId(isPlayer1, index) {
	var fixedIds = [4, 3, 2, 1];
	return (isPlayer1 ? fixedIds[index] : index+5);
}