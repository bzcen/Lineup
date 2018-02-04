const phases = ["Upkeep", "Leader - Place Actions", "Non-Leader - Place Actions",  "Leader - Flip Actions", "Non-Leader - Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn"];
var phaseIndex = 0;
var roundNum = 0;
// used for alternating colors per normal action log entry
var normalActionLogEntryNum = 0;

/* used for local card ids to be assigned to each added character card */
var nextCardLocalIdToUse = 1; 
/* used for local action card ids to be assigned to each action card */
var nextActionCardLocalIdToUse = 1;

/* Used to track who is the leader of the round */
var player1IsLeader = false;

/* used for card menu context menu */
var cardMenu;
var cardMenuState = 0;
var cardMenuActive = "card-menu--active";
var cardMenuPosition;
var cardMenuPositionX;
var cardMenuPositionY;

var cardInContext;
var deckInContext;

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

var player1Cards = [];
var player2Cards = [];
var player1Lineup = [];
var player2Lineup = [];
var player1Standby = [];
var player2Standby = [];
var player1Defeated = [];
var player2Defeated = [];

var player1ActionCards = [];
var player2ActionCards = [];
var player1Deck = [];
var player2Deck = [];
var player1Discards = [];
var player2Discards = [];
var player1Flips = [];
var player2Flips = [];
var player1Hand = [];
var player2Hand = [];

/*** SETUP FUNCTIONS ***/

// TODO(bcen): follow this guide for how to fix resize issues with context menus
// https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/

// TODO(bcen): need some sort of protection of adding nulls to a <4 player lineup

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

	// temporary
	pushActionCardToTotal("Swap Enemies", true);
	pushActionCardToTotal("Swap Enemies", true);
	pushActionCardToTotal("Swap Enemies", true);
	pushActionCardToTotal("Swap Enemies", true);
	pushActionCardToTotal("Swap Enemies", true);

	for (var i = 0; i < 3; i++) {
		moveActionCardToHand(player1ActionCards[i]);
	}
	for (var i = 3; i < 5; i++) {
		moveActionCardToDeck(player1ActionCards[i]);
	}


	// render HTML of all lineup cards
	displayLineup();
	toggleLeader();
	nextPhase();

	// setup listeners
	setUpContextListener();
	setUpClickListener();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	var standby_modal = document.getElementById("standby-modal");
	var defeated_modal = document.getElementById("defeated-modal");
	var actions_modal = document.getElementById("actions-modal");
    if (event.target == standby_modal) {
    	hideStandbyModal();
    }
    if (event.target == defeated_modal) {
    	hideDefeatedModal();
    }
    if (event.target == actions_modal) {
    	hideActionsModal();
    }
}

function setUpContextListener() {
	// Setup context listener for card menu

	// grab the card menu by id
	// TODO(bcen): remove this from window.onload path and into a self-executing func
	cardMenu = document.querySelector("#card-menu");

	document.addEventListener("contextmenu", function(e) {
		var type;
		if (clickInsideElement(e, "card-container")) {
			cardInContext = clickInsideElement(e, "card-container");
			type = "character";
		} else if (clickInsideElement(e, "action-card-container")) {
			cardInContext = clickInsideElement(e, "action-card-container");
			type = "action-card";
		} else if (clickInsideElement(e, "actions-deck-container")) {
			deckInContext = clickInsideElement(e, "actions-deck-container");
			type = "deck";
		} else {
			cardInContext = null;
			deckInContext = null;
		}

		if (cardInContext) {
			deckInContext = null;
			e.preventDefault();
			toggleCardMenuOn(type);
			positionCardMenu(e);
		} else if (deckInContext) {
			cardInContext = null;
			e.preventDefault();
			toggleCardMenuOn(type);
			positionCardMenu(e);
		} else {
			cardInContext = null;
			deckInContext = null;
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

function toggleCardMenuOn(type) {
	if (cardMenuState !== 1) {
		cardMenuState = 1;
		// this could probably be redone to just change the display style
		cardMenu.classList.add(cardMenuActive);
		// need to adjust which menu items to actually show
		var menu_items = document.getElementsByClassName("card-menu-item");
		for (var i = 0; i < menu_items.length; i++) {
			var t = menu_items[i].getAttribute("type");
			if (t != type) {
				menu_items[i].style.display = "none";
			} else {
				menu_items[i].style.display = "block";
			}
		}
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
	var card_id = -1;
	var deck_id = -1;
	if (cardInContext != null) {
		card_id = cardInContext.getAttribute("card-local-id");
	}
	if (deckInContext != null) {
		deck_id = deckInContext.getAttribute("deck-local-id");
	}
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
		case "move-to-hand":
			moveToHandByCardMenu(card_id);
			break;
		case "move-to-flips":
			moveToFlipsByCardMenu(card_id);
			break;
		case "move-to-deck":
			moveToDeckByCardMenu(card_id);
			break;
		case "move-to-discards":
			moveToDiscardsByCardMenu(card_id);
			break;
		case "draw":
			drawByCardMenu(deck_id);
			break;
		case "shuffle":
			shuffleByCardMenu(deck_id);
			break;
		default:
			break;
	}

	toggleCardMenuOff();
}

/*** DECK/LINEUP/HAND CONSTRUCTION FUNCTIONS ***/

// will actually create a new action card instance, stores it in total cards (which doesn't get modified)
function pushActionCardToTotal(actionCardName, isPlayer1) {
	var arrayToAddTo = (isPlayer1 ? player1ActionCards : player2ActionCards);

	var action = constructActionCardFromDB(actionCardName);
	action.isPlayer1 = isPlayer1;
	arrayToAddTo.push(action);
} 

// will actually create the new card instance, stores it in total cards (which doesn't get modified)
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
		card.array = null;
		return;
	}
	// in all other cases, we don't need to occupy the deleted spot with a null
	var originArray = card.array;
	var arrayToDeleteFrom;
	switch (card.array) {
		case "defeated":
			arrayToDeleteFrom = (card.isPlayer1 ? player1Defeated : player2Defeated);
			break;
		case "standby":
			arrayToDeleteFrom = (card.isPlayer1 ? player1Standby : player2Standby);
			break;
		case "hand":
			arrayToDeleteFrom = (card.isPlayer1 ? player1Hand : player2Hand);
			break;
		case "deck":
			arrayToDeleteFrom = (card.isPlayer1 ? player1Deck : player2Deck);
			break;
		case "flips":
			arrayToDeleteFrom = (card.isPlayer1 ? player1Flips : player2Flips);
			break;
		case "discards":
			arrayToDeleteFrom = (card.isPlayer1 ? player1Discards : player2Discards);
			break;
		default:
			break;
	}

	arrayToDeleteFrom[card.arrayIndex] = null;
	card.array = null;

	// I wish I knew a better way to do this rip, but we need to clean arrays
	switch (originArray) {
		case "defeated":
			if (card.isPlayer1) {
				player1Defeated = cleanArray(arrayToDeleteFrom);
			} else {
				player2Defeated = cleanArray(arrayToDeleteFrom);
			}
			break;
		case "standby":
			if (card.isPlayer1) {
				player1Standby = cleanArray(arrayToDeleteFrom);
			} else {
				player2Standby = cleanArray(arrayToDeleteFrom);
			}
			break;
		case "hand":
			if (card.isPlayer1) {
				player1Hand = cleanArray(arrayToDeleteFrom);
			} else {
				player2Hand = cleanArray(arrayToDeleteFrom);
			}
			break;
		case "deck":
			if (card.isPlayer1) {
				player1Deck = cleanArray(arrayToDeleteFrom);
			} else {
				player2Deck = cleanArray(arrayToDeleteFrom);
			}
			break;
		case "flips":
			if (card.isPlayer1) {
				player1Flips = cleanArray(arrayToDeleteFrom);
			} else {
				player2Flips = cleanArray(arrayToDeleteFrom);
			}
			break;
		case "discards":
			if (card.isPlayer1) {
				player1Discards = cleanArray(arrayToDeleteFrom);
			} else {
				player2Discards = cleanArray(arrayToDeleteFrom);
			}
			break;
		default:
			break;
	}
}

// general purpose function that moves a card to another array, editing the index and arrayString attributes
// should NOT be used for moving to the lineup
// NOTE: this removes the card from its previous spot
function moveCardToArray(card, arrayString) {
	if (card == null) {
		console.log("moveCardToArray - ERROR: tried to push null card to an array");
		return;
	}
	if (card.array == arrayString) {
		console.log("moveCardToArray - ERROR: trying to move card to the same array");
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
		case "hand":
			arrayToAddTo = (card.isPlayer1 ? player1Hand : player2Hand);
			break;
		case "flips":
			arrayToAddTo = (card.isPlayer1 ? player1Flips : player2Flips);
			break;
		case "deck":
			arrayToAddTo = (card.isPlayer1 ? player1Deck : player2Deck);
			break;
		case "discards":
			arrayToAddTo = (card.isPlayer1 ? player1Discards : player2Discards);
			break;
		default:
			console.log("moveCardToArray - ERROR: unrecognized or banned arrayString");
			return;
	}
	var originArray = card.array;
	var originArrayIndex = card.arrayIndex;
	var shouldLog = false;
	if (card.array != null) {
		// we don't want to log movement out of the deck because that's the same as drawing
		// which already has its own log functionality
		if (originArray != "deck") {
			shouldLog = true;
		}
		// remove the card from its original home
		removeCardFromCurrentArray(card);
	}

	card.array = arrayString;
	card.arrayIndex = arrayToAddTo.length;
	arrayToAddTo.push(card);

	if (shouldLog) addToActionLog(buildMovedToText(card, originArray, originArrayIndex), "normal-entry");
}

// need to be a little more special about this cause its needs a posIndex
function moveCardToLineup(card, posIndex) {
	if (card == null) {
		console.log("moveCardToLineup - ERROR: tried to move null card");
		return;
	}
	if (card.arrayIndex == posIndex) {
		console.log("moveCardToLineup - ERROR: tried to move card to the same pos");
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
	var originArray = card.array;
	var originArrayIndex = card.arrayIndex;
	var shouldLog = false;
	if (card.array != null) {
		shouldLog = true;
		removeCardFromCurrentArray(card);
	}
	card.array = "lineup";
	card.arrayIndex = posIndex;
	lineupToAddTo[posIndex] = card;

	if (shouldLog) addToActionLog(buildMovedToText(card, originArray, originArrayIndex), "normal-entry");
}

// pushes a card by reference into a defeated pool
function moveCardToDefeated(card) {
	moveCardToArray(card, "defeated");
}

// pushes a card by reference into a standby pool
function moveCardToStandby(card) {
	moveCardToArray(card, "standby");
}

function moveActionCardToHand(actionCard) {
	moveCardToArray(actionCard, "hand");
}

function moveActionCardToFlips(actionCard) {
	moveCardToArray(actionCard, "flips");
}

function moveActionCardToDeck(actionCard) {
	moveCardToArray(actionCard, "deck");
}

function moveActionCardToDiscards(actionCard) {
	moveCardToArray(actionCard, "discards");
}

// slides both lineups towards Pos 0
// TODO(bcen): make this follow the leader
function slideLineups() {
	addToActionLog("Sliding Player 1's Lineup...", "important-entry");
	slideLineup(true);
	addToActionLog("Sliding Player 2's Lineup...", "important-entry");
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

// TODO(bcen): make this follow the leader
function removeDefeatedFromLineups() {
	addToActionLog("Removing defeated characters from Player 1's Lineup...", "important-entry");
	removeDefeatedFromLineup(true);
	addToActionLog("Removing defeated characters from Player 2's Lineup...", "important-entry");
	removeDefeatedFromLineup(false);
}

function removeDefeatedFromLineup(isPlayer1) {
	var lineup = (isPlayer1 ? player1Lineup : player2Lineup);
	for (var i = 0; i < lineup.length; i++) {
		var card = lineup[i];
		if (card != null && card.dmg >= card.hp) moveCardToDefeated(card);
	}
	displayLineup();
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

function constructActionCardFromDB(cardName) {
	for (var i = 0; i < actionsDB.length; i++) {
		if (actionsDB[i].name == cardName) {
			var a = actionsDB[i];
			return new ActionCard(a.name, a.cost, a.details, a.imagePath);
		}
	}
}

/*** DMG FUNCTIONS ***/

function addDmg(card, dmg) {
	card.dmg = card.dmg + dmg;
	if (card.dmg < 0) card.dmg = 0;
}

// applies the combat actions of all cards in both lineups
// TODO(bcen): make this follow the leader
function combatActions() {
	addToActionLog("Applying Player 1's Combat...", "important-entry");
	applyCombatActions(true);

	addToActionLog("Applying Player 2's Combat...", "important-entry");
	applyCombatActions(false);
}

function applyCombatActions(isPlayer1) {
	var lineup = (isPlayer1 ? player1Lineup : player2Lineup);
	for (var i = 0; i < lineup.length; i++) {
		var card = lineup[i];
		if (card != null) applyCombatAction(card);
	}
	displayLineup();
}

// apply the combat damage of an individual card
function applyCombatAction(card) {
	if (card == null) {
		console.log("applyCombatAction - ERROR: card is null");
		return;
	}
	if (card.array != "lineup") {
		console.log("applyCombatAction - ERROR: card is not in lineup");
		return;
	}
	// do nothing in the case where a card has no combat actions
	if (card.combatActions == null) {
		return;
	}

	var lineupToAttack = (card.isPlayer1 ? player2Lineup : player1Lineup);
	var actions = card.combatActions.details;
	for (var i = 0; i < actions.length; i++) {
		var action_log_text = card.name + " dealt ";
		var hitSomething = false;

		var action = actions[i];
		var attackingPositions = getValidPositions(action.position);
		// don't do anything if the card isn't in the right position
		if (!attackingPositions[card.arrayIndex]) continue;

		// apply damage to every targetted position
		var attackedPositions = getValidPositions(action.target);
		for (var j = 0; j < attackedPositions.length; j++) {
			if (attackedPositions[j] && lineupToAttack[j] != null) {
				addDmg(lineupToAttack[j], action.dmg);
				// adding a comma if something was added before
				if (hitSomething) action_log_text += ", ";
				action_log_text += "<firebrickText>" + action.dmg + " DMG</firebrickText> to " +
					lineupToAttack[j].name + " <blueText>(Pos " + (j+1) + ")</blueText>";
				hitSomething = true;
			}
		}
		// if something hit, print to action log!
		if (hitSomething) {
			addToActionLog(action_log_text, "normal-entry");
		}
	}
	displayLineup();
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

	var player_text = (isPlayer1 ? "Player 1" : "Player 2");
	var action_log_text = player_text + "'s <blueText>Pos " + posA +
		"</blueText> and <blueText>Pos " + posB + "</blueText> were swapped";
	addToActionLog(action_log_text, "normal-entry");

	fieldA.value = "";
	fieldB.value = "";
	return;
}

/*** PHASE FUNCTIONS ***/

function toggleLeader() {
	player1IsLeader = !player1IsLeader;
	var player_text = (player1IsLeader ? "Player 1" : "Player 2");
	addToActionLog(player_text + " is now the leader!", "normal-entry");
}

function nextPhase() {
	phaseIndex++;
	if (phaseIndex >= phases.length) phaseIndex = 0;

	var action_log_text = "";
	if (phaseIndex == 0 || (phaseIndex == 1 && roundNum == 0)) {
		roundNum++;
		addToActionLog("Beginning of Round " + roundNum, "round-entry");
	}
	var tag = "Current Phase: ";
	addToActionLog(tag + phases[phaseIndex], "phase-entry");

	// Automated way of running some of the phases...
	switch (phaseIndex) {
		// upkeep
		case 0:
			upkeep();
			break;
		// leader - place actions
		case 1:
			break;
		// non-leader - place actions
		case 2:
			break;
		// leader - flip actions
		case 3:
			if (player1IsLeader) flipActionCards(true);
			else flipActionCards(false);
			break;
		// non-leader - flip actions
		case 4:
			if (player1IsLeader) flipActionCards(false);
			else flipActionCards(true);
			break;
		// combat
		case 5:
			combatActions();
			break;
		// end of combat
		case 6:
			endOfCombat();
			break;
		// resolve combat
		case 7:
			removeDefeatedFromLineups();
			break;
		// end of turn
		case 8:
			endOfTurn();
			break;
		default:
			break;
	}
}

// TODO(bcen): make this follow the leader
// TODO(bcen): refactor json DB to somehow include EoC effects
function endOfCombat() {
	addToActionLog("Applying Player 1's End-of-Combat Effects...", "important-entry");
	addToActionLog("Applying Player 2's End-of-Combat Effects...", "important-entry");
}

// TODO(bcen): make this follow the leader
// TODO(bcen): refactor json DB to somehow include EoT effects
function endOfTurn() {
	addToActionLog("Applying Player 1's End-of-Turn Effects...", "important-entry");
	addToActionLog("Applying Player 2's End-of-Turn Effects...", "important-entry");
}

// TODO(bcen): handle other upkeep stuff
function upkeep() {
	slideLineups();
	// both players draw a card
	draw(true);
	draw(false);

	toggleLeader();
}

function draw(isPlayer1) {
	var deck = (isPlayer1 ? player1Deck : player2Deck);

	if (deck.length == 0) {
		console.log("drawByCardMenu - ERROR: deck is empty");
		return;
	}
	moveCardToArray(deck[0], "hand");

	var player_text = (isPlayer1 ? "Player 1" : "Player 2");
	addToActionLog(player_text + " drew a card", "normal-entry");
}

function flipActionCards(isPlayer1) {
	var flips = (isPlayer1 ? player1Flips : player2Flips);

	if (flips.length == 0) {
		console.log("flipActionCards - ERROR: flips is empty");
		return;
	}

	var player_text = (isPlayer1 ? "Player 1" : "Player 2");
	var action_log_text = player_text + " flipped ";
	var firstFlipAdded = false;

	for (var i = 0; i < flips.length; i++) {
		if (firstFlipAdded) action_log_text += ", ";
		action_log_text += "<orchidText>" + flips[i].name + "</orchidText>";
		firstFlipAdded = true;
	}

	addToActionLog(action_log_text, "normal-entry");

	// TODO(bcen): maybe refactor this into a "clear array" method
	// clear out all of flips, send to discard
	var numToDiscard = flips.length;
	for (var i = 0; i < numToDiscard; i++) {
		// needs to be this way since the flips array shrinks with each move
		if (isPlayer1) moveCardToArray(player1Flips[0], "discards");
		else moveCardToArray(player1Flips[0], "discards");
	}
}

/*** DISPLAY FUNCTIONS ***/

function displayPhase() {
	var tag = "Current Phase: ";
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

	var htmlString = 
		"<div class=\"card-container\" card-local-id=\"" + card.localId + "\">" +
		"<div class=\"header\">" +
		"<h3>" + card.name + "</h3>" + "<div class=\"filler\"></div>" + "<h3>Lvl." + card.level + "</h3>" +
		"</div>" +
		"<img src=\"" + card.imagePath + "\" alt=\"placeholder image\">" +
		"<bodyHeaderCombat>Combat Actions</bodyHeaderCombat>" + "<p>" + combatActionsText + "</p>" +
		"<bodyHeaderAbilities>Abilities</bodyHeaderAbilities>" + "<p>" + abilitiesText + "</p>" +
		"<bodyHeaderFaction>Faction Bonus</bodyHeaderFaction>" + "<p>" + card.factionBonus + "</p>" +
		"<div class=\"hp-dmg-container\">" +
		"<hpHeader>HP: " + card.hp + "</hpHeader>" +
		"<dmgHeader>DMG: " + card.dmg + "</dmgHeader>" +
		"</div>" +
		"</div>"
	;

	return htmlString;
}

// Get action card HTML string
function getActionCardDisplayHTML(actionCard) {
	var htmlString =
		"<div class=\"action-card-container\" card-local-id=\"" + actionCard.localId + "\">" +
		"<div class=\"header\">" +
		"<h3>" + actionCard.name + "</h3>" + "<div class=\"filler\"></div>" + "<h3>Cost: " + actionCard.cost + "</h3>" +
		"</div>" +
		"<img src=\"" + actionCard.imagePath + "\" alt=\"placeholder image\">" +
		"<p>" + actionCard.details + "</p>" +
		"</div>"
	;

	return htmlString;
}

// adds a message to the action log
// available classes: "normal-entry", "phase-entry", "round-entry"
function addToActionLog(text, entry_class) {
	var action_log = document.getElementById("action-log-content");

	if (entry_class == "normal-entry") {
		if (normalActionLogEntryNum%2 == 0){
			entry_class += "-1";
		} else {
			entry_class += "-2";
		}
		normalActionLogEntryNum++;
	} else {
		normalActionLogEntryNum = 0;
	}
	action_log.innerHTML += "<div class=\"" + entry_class + "\">" + text + "</div>";

	// scroll to the bottom of the overflowing div
	action_log.scrollTop = action_log.scrollHeight;
}

// NOTE: depends on the card having been moved already
function buildMovedToText(card, originArray, originArrayIndex) {
	var player_text = (card.isPlayer1 ? "Player 1" : "Player 2");
	var origin_array_text = getColorfiedArrayText(originArray, originArrayIndex);
	var destination_array_text = getColorfiedArrayText(card.array, card.arrayIndex);

	var card_text = card.name;

	if (card.array == "deck" || card.array == "flips" || card.array == "hand" || card.array == "discards") {
		card_text = "<orchidText>" + card_text + "</orchidText>";
	}

	return player_text + "'s " + card_text + " moved from " + origin_array_text + " to " + destination_array_text;
}

function getColorfiedArrayText(arrayString, arrayIndex) {

	array_text = "";
	switch (arrayString) {
		case "lineup":
			array_text = "<blueText>Lineup (Pos " + (arrayIndex+1) + ")</blueText>";
			break;
		case "defeated":
			array_text = "<firebrickText>Defeated</firebrickText>";
			break;
		case "standby":
			array_text = "<reenText>Standby</reenText>";
			break;
		case "hand":
			array_text = "Hand";
			break;
		case "deck":
			array_text = "Deck";
			break;
		case "flips":
			array_text = "Flips";
			break;
		case "discards":
			array_text = "Discards";
			break;
		default:
			break;
	}

	return array_text;
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
		card_container.innerHTML += "<div class=\"card-outer-container\">" + getCardDisplayHTML(standby[i]) + "</div>";
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
		card_container.innerHTML += "<div class=\"card-outer-container\">" + getCardDisplayHTML(defeated[i]) + "</div>";
	}
}

// hide Defeated Modal
function hideDefeatedModal() {
	var modal = document.getElementById("defeated-modal");
	modal.style.display= "none";
	var card_container = document.getElementById("defeated-modal-card-container");
	card_container.innerHTML = "";
}

function showActionsModal(isPlayer1) {
	var modal = document.getElementById("actions-modal");
	modal.style.display = "block";

	var hand = (isPlayer1 ? player1Hand : player2Hand);
	var hand_container = document.getElementById("actions-modal-hand-container");
	
	var deckSize = (isPlayer1 ? player1Deck.length : player2Deck.length);
	// also render the deck inside the hand container
	hand_container.innerHTML = "<div class=\"actions-deck-container\" id=\"actions-deck-container\">" +
		"<h2> Deck (" + deckSize + ") </h2>" +
		"</div>"
	;

	for (var i = 0; i < hand.length; i++) {
		hand_container.innerHTML += getActionCardDisplayHTML(hand[i]);
	}

	var flips = (isPlayer1 ? player1Flips : player2Flips);
	var flips_container = document.getElementById("actions-modal-flips-container");

	flips_container.innerHTML = "";
	for (var i = 0; i < flips.length; i++) {
		flips_container.innerHTML += getActionCardDisplayHTML(flips[i]);
	}

	var discards = (isPlayer1 ? player1Discards : player2Discards);
	var discards_container = document.getElementById("actions-modal-discards-container");

	discards_container.innerHTML = "";
	for (var i = 0; i < discards.length; i++) {
		discards_container.innerHTML += getActionCardDisplayHTML(discards[i]);
	}

	// also need to set the attribute 'deck-id' of the deck container to handle context menus
	// 1 = player 1, 2 = player 2
	var deck = document.getElementById("actions-deck-container");
	deck.setAttribute("deck-local-id", (isPlayer1 ? 1 : 2));
}

function hideActionsModal() {
	var modal = document.getElementById("actions-modal");
	modal.style.display= "none";
	var hand_container = document.getElementById("actions-modal-hand-container");
	hand_container.innerHTML = "";
}

/*** CARD MENU FUNCTIONS ***/

// moves a card with localId to a position on the lineup
function moveToLineupByCardMenu(localId, posIndex) {
	var card = getCardFromLocalId(localId, false /* isActionCard */);
	if (card == null) {
		console.log("moveToLineupByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	var originArrayIndex = card.arrayIndex;

	if (originArray == "lineup" && originArrayIndex == posIndex) {
		console.log("moveToLineupByCardMenu - ERROR: card is already at this pos");
		return;
	}

	moveCardToLineup(card, posIndex);
	displayLineup();

	if (originArray == "standby") showStandbyModal(card.isPlayer1);
	else if (originArray == "defeated") showDefeatedModal(card.isPlayer1);
}

// moves a card with localId to standby
function moveToStandbyByCardMenu(localId) {
	var card = getCardFromLocalId(localId, false /* isActionCard */);
	if (card == null) {
		console.log("moveToStandbyByCardMenu - ERROR: cannot find card by local id");
		return;
	}

	var originArray = card.array;
	var originArrayIndex = card.arrayIndex;
	if (originArray == "standby") return;

	moveCardToStandby(card);

	if (originArray == "lineup") {
		displayLineup();
	}
	else if (originArray == "defeated") {
		showDefeatedModal(card.isPlayer1);
	}

	addToActionLog(buildMovedToText(card, originArray, originArrayIndex), "normal-entry");
}

// moves a card with localId to defeated
function moveToDefeatedByCardMenu(localId) {
	var card = getCardFromLocalId(localId, false /* isActionCard */);
	if (card == null) {
		console.log("moveToDefeatedByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	var originArrayIndex = card.arrayIndex;
	if (originArray == "defeated") return;

	moveCardToDefeated(card);

	if (originArray == "lineup") {
		displayLineup();
	}
	else if (originArray == "standby") {
		showStandbyModal(card.isPlayer1);
	}

	addToActionLog(buildMovedToText(card, originArray, originArrayIndex), "normal-entry");
}

// moves an action card with localId to hand
function moveToHandByCardMenu(localId) {
	var card = getCardFromLocalId(localId, true /* isActionCard */);
	if (card == null) {
		console.log("moveToHandByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	if (originArray == "hand") return;

	moveActionCardToHand(card);
	showActionsModal(card.isPlayer1);
}

// moves an action card with localId to flips
function moveToFlipsByCardMenu(localId) {
	var card = getCardFromLocalId(localId, true /* isActionCard */);
	if (card == null) {
		console.log("moveToFlipsByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	if (originArray == "flips") return;

	moveActionCardToFlips(card);
	showActionsModal(card.isPlayer1);
}

// moves an action card with localId to discards
function moveToDiscardsByCardMenu(localId) {
	var card = getCardFromLocalId(localId, true /* isActionCard */);
	if (card == null) {
		console.log("moveToDiscardsByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	if (originArray == "discards") return;

	moveActionCardToDiscards(card);
	showActionsModal(card.isPlayer1);
}

// moves an action card with localId to deck
function moveToDeckByCardMenu(localId) {
	var card = getCardFromLocalId(localId, true /* isActionCard */);
	if (card == null) {
		console.log("moveToDeckByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	var originArray = card.array;
	if (originArray == "deck") return;

	moveActionCardToDeck(card);
	showActionsModal(card.isPlayer1);
}

function add1DmgByCardMenu(localId) {
	var card = getCardFromLocalId(localId, false /* isActionCard */);
	if (card == null) {
		console.log("add1DmgByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	addDmg(card, 1);
	displayLineup();

	var action_log_text = "<firebrickText>1 DMG</firebrickText> was added to " + card.name;
	addToActionLog(action_log_text, "normal-entry");
}

function remove1DmgByCardMenu(localId) {
	var card = getCardFromLocalId(localId, false /* isActionCard */);
	if (card == null) {
		console.log("remove1DmgByCardMenu - ERROR: cannot find card by local id");
		return;
	}
	addDmg(card, -1);
	displayLineup();

	var action_log_text = "<firebrickText>1 DMG</firebrickText> was removed from " + card.name;
	addToActionLog(action_log_text, "normal-entry");
}

function drawByCardMenu(deck_id) {
	var isPlayer1 = (deck_id == 1);
	draw(isPlayer1);
	showActionsModal(isPlayer1);
}

function shuffleByCardMenu(deck_id) {
	var isPlayer1 = (deck_id == 1);
	if (isPlayer1) {
		player1Deck = shuffleArray(player1Deck);
	} else {
		player2Deck = shuflfeArray(player2Deck);
	}

	var player_text = (isPlayer1 ? "Player 1" : "Player 2");
	addToActionLog(player_text + "'s deck was shuffled", "normal-entry");
}

/*** OTHER HELPER FUNCTIONS ***/

// works for both action cards and character cards
function getCardFromLocalId(localId, isActionCard) {
	var p1Array = (isActionCard ? player1ActionCards : player1Cards);
	var p2Array = (isActionCard ? player2ActionCards : player2Cards);

	for (var i = 0; i < p1Array.length; i++) {
		var card = p1Array[i];
		if (card.localId == localId) return card;
	}
	for (var i = 0; i < p2Array.length; i++) {
		var card = p2Array[i];
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

// apply Fisher-Yates Shuffle to an array
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/12646864
function shuffleArray(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

// helper that returns a new boolean array representing which positions are valid
// we store these valid positions as a number in JSON
function getValidPositions(num) {
	var array = [];
	for (var i = 0; i < 4; i++) {
		if (num%2 == 1) array.push(true);
		else array.push(false);

		num = Math.floor(num/2);
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
	return (isPlayer1 ? fixedIds[index] : index+5);
}