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
		moveCardToLineup(player1Cards[i], i);
	}

	pushCardToTotal("Remus", false);
	pushCardToTotal("Augustus", false);
	pushCardToTotal("Zeus", false);
	pushCardToTotal("Matilda", false);

	// temporary
	for (var i = 0; i < player2Cards.length; i++) {
		moveCardToLineup(player2Cards[i], i);
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

	switch (menu_action) {
		case "move-to-pos-1":
			moveToLineupByCardMenu(card_id, 0);
			break;
		case "move-to-pos-2":
			moveToLineupByCardMenu(card_id, 1);
			break;
		case "move-to-pos-3":
			moveToLineupByCardMenu(card_id, 2);
			break;
		case "move-to-pos-4":
			moveToLineupByCardMenu(card_id, 3);
			break;
		case "move-to-standby":
			moveToStandbyByCardMenu(card_id);
			break;
		case "move-to-defeated":
			moveToDefeatedByCardMenu(card_id);
			break;
		case "add-1-dmg":
			add1DmgByCardMenu(card_id);
			break;
		case "remove-1-dmg":
			remove1DmgByCardMenu(card_id);
			break;
		default:
			break;
	}

	toggleCardMenuOff();
}

/*** DECK/LINEUP/HAND CONSTRUCTION FUNCTIONS ***/

// will actual create the new card instance, stores it in total cards (which doesn't get modified)
function pushCardToTotal(cardName, isPlayer1) {
	var arrayToAddTo = (isPlayer1 ? player1Cards : player2Cards);

	var character = constructCharacterFromDB(cardName);
	character.isPlayer1 = isPlayer1;
	arrayToAddTo.push(character);
}

// general purpose function that removes a card from the current array it resides in, editing the index and arrayString attributes
function removeCardFromCurrentArray(card) {
	if (card == null) {
		console.log("removeCardFromCurrentArray - ERROR: tried to remove null card");
		return;
	}
	if (card.array == null) {
		console.log("removeCardFromCurrentArray - ERROR: tried to remove card that was not in any zone");
		return;
	}

	if (card.array == "lineup") {
		var lineup = (card.isPlayer1 ? player1Lineup : player2Lineup);
		lineup[card.arrayIndex] = null;
	}
	else if (card.array == "defeated") {
		var defeated = (card.isPlayer1 ? player1Defeated : player2Defeated);
		defeated[card.arrayIndex] = null;
		if (card.isPlayer1) {
			player1Defeated = cleanArray(defeated);
		} else {
			player2Defeated = cleanArray(defeated);
		}
	}
	else if (card.array == "standby") {
		var standby = (card.isPlayer1 ? player1Standby : player2Standby);
		standby[card.arrayIndex] = null;
		if (card.isPlayer1) {
			player1Standby = cleanArray(standby);
		} else {
			player2Standby = cleanArray(standby);
		}
	}
	card.array = null;
}

// general purpose function that moves a card to another array, editing the index and arrayString attributes
// should NOT be used for moving to the lineup
// NOTE: this removes the card from its previous spot
function moveCardToArray(card, arrayString) {
	if (card == null) {
		console.log("moveCardToArray - ERROR: tried to push null card to an array");
		return;
	}

	var arrayToAddTo;
	switch (arrayString) {
		case "defeated":
			arrayToAddTo = (card.isPlayer1 ? player1Defeated : player2Defeated);
			break;
		case "standby":
			arrayToAddTo = (card.isPlayer1 ? player1Standby : player2Standby);
			break;
		default:
			console.log("moveCardToArray - ERROR: unrecognized or banned arrayString");
			return;
	}

	// remove the card from its original home
	if (card.array != null) {
		removeCardFromCurrentArray(card);
	}

	card.array = arrayString;
	card.arrayIndex = arrayToAddTo.length;
	arrayToAddTo.push(card);
}

// need to be a little more special about this cause its needs a posIndex
function moveCardToLineup(card, posIndex) {
	if (card == null) {
		console.log("moveCardToLineup - ERROR: tried to move null card");
		return;
	}
	if (posIndex >= 4) {
		console.log("moveCardToLineup - ERROR: invalid posIndex");
		return;
	}

	var lineupToAddTo = (card.isPlayer1 ? player1Lineup : player2Lineup);
	if (lineupToAddTo[posIndex] != null) {
		console.log("moveCardToLineup - ERROR: card is in the way");
		return;
	}

	if (card.array != null) {
		removeCardFromCurrentArray(card);
	}
	card.array = "lineup";
	card.arrayIndex = posIndex;
	lineupToAddTo[posIndex] = card;
}

// pushes a card by reference into a defeated pool
function moveCardToDefeated(card) {
	moveCardToArray(card, "defeated");
}

// pushes a card by reference into a standby pool
function moveCardToStandby(card) {
	moveCardToArray(card, "standby");
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

function addDmg(card, dmg) {
	card.dmg = card.dmg + dmg;
	if (card.dmg < 0) card.dmg = 0;
}

/*** FUNCTIONS CALLED FROM MAIN HTML COMPONENT aka Combat Field ***/

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

function addDmgFromCombatField(id) {
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
	var cards = (isPlayer1FromConstantId(id) ? player1Lineup : player2Lineup);
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

	addDmg(card, num);

	// redisplay the card with the modified DMG value
	displayCard(id);
	document.getElementById("edit-dmg-field" + id).value = "";
}

/*** CHARACTER CARD MOVEMENT FUNCTIONS ***/

// general function for moving 
function moveToStandby(startArray, startIndex, isPlayer1) {
	// can't be out of bounds
	if (startIndex >= startArray.length) {
		console.log("moveToStandby - ERROR: tried to access bad index in array");
		return;
	}
	// can't be empty
	var card = startArray[startIndex];
	console.log("moveToStandby - ERROR: tried to access bad index in array");
	if (card == null) { 
		return;
	}
}

// slides both lineups towards Pos 0
function slideLineups() {
	slideLineup(true);
	slideLineup(false);
}

function slideLineup(isPlayer1) {
	var lineup = (isPlayer1 ? player1Lineup : player2Lineup);
	// essentially bubble everything down (can skip the first)
	for (var i = 1; i < 4; i++) {
		// skip if there's no card at this spot
		if (lineup[i] == null) continue;

		// keep on moving the card down the lineup
		var j = i;
		while (j > 0 && lineup[j-1] == null) {
			moveCardToLineup(lineup[j], j-1);
			j--;
		}
	}
	if (isPlayer1) displayPlayer1Lineup();
	else displayPlayer2Lineup();
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
	var cards = (isPlayer1FromConstantId(i) ? player1Lineup : player2Lineup);
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

/*** CARD MENU FUNCTIONS ***/

// moves a card with localId to a position on the lineup
function moveToLineupByCardMenu(localId, posIndex) {
	var card = getCardFromLocalId(localId);
	if (card == null) {
		console.log("moveToLineupByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;

	moveCardToLineup(card, posIndex);
	displayLineup();

	if (originArray == "standby") showStandbyModal(card.isPlayer1);
	else if (originArray == "defeated") showDefeatedModal(card.isPlayer1);
}

// moves a card with localId to standby
function moveToStandbyByCardMenu(localId) {
	var card = getCardFromLocalId(localId);
	if (card == null) {
		console.log("moveToStandbyByCardMenu - ERROR: cannot find card by local id");
		return;
	}

	var originArray = card.array;
	if (originArray == "standby") return;

	moveCardToStandby(card);
	if (originArray == "lineup") {
		displayLineup();
	}
	else if (originArray == "defeated") {
		showDefeatedModal(card.isPlayer1);
	}
}

// moves a card with localId to defeated
function moveToDefeatedByCardMenu(localId) {
	var card = getCardFromLocalId(localId);
	if (card == null) {
		console.log("moveToDefeatedByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	if (originArray == "defeated") return;

	moveCardToDefeated(card);
	if (originArray == "lineup") {
		displayLineup();
	}
	else if (originArray == "standby") {
		showStandbyModal(card.isPlayer1);
	}
}

function add1DmgByCardMenu(localId) {
	var card = getCardFromLocalId(localId);
	if (card == null) {
		console.log("add1DmgByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	addDmg(card, 1);
	displayLineup();
}

function remove1DmgByCardMenu(localId) {
	var card = getCardFromLocalId(localId);
	if (card == null) {
		console.log("remove1DmgByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	addDmg(card, -1);
	displayLineup();
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
// returns a newly allocated array, so it needs to be assigned outside
function cleanArray(array) {
	array = array.filter(n=>n);
	// fix indexes
	for (var i = 0; i < array.length; i++) {
		array[i].arrayIndex = i;
	}
	return array;
}


/** I would consider the below functions to be legacy code because they depend on the card container id as opposed to the local id.
	The plan would be to slowly phase these out from use and then delete.
	**/

// returns whether a html constant id refers to Player 1's cards
function isPlayer1FromConstantId(id) {
	return id <= 4;
}

// returns the appropriate index of player's lineup given an id
function getPlayerLineupIndex(id) {
	// if Player1, pos1 is actually id=card4, pos2 card is id=card3, pos3 is id=card2, pos4 is id=card1
	// keep in mind things are 0-based indexes in the arrays themselves though
	var fixedIds = [3, 2, 1, 0];
	return (isPlayer1FromConstantId(id) ? fixedIds[id-1] : id-5);
}

// returns the id given a player lineup index
function getCardId(isPlayer1, index) {
	var fixedIds = [4, 3, 2, 1];
	return (isPlayer1FromConstantId ? fixedIds[index] : index+5);
}