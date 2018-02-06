// Script file for handling card context menu (on right click)

// TODO(bcen): follow this guide for how to fix resize issues with context menus
// https://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
var cardMenu;
var cardMenuState = 0;
var cardMenuActive = "card-menu--active";
var cardMenuPosition;
var cardMenuPositionX;
var cardMenuPositionY;

var cardInContext;
var deckInContext;

// self-invoking function
(function() {
	// grab the card menu by id
    cardMenu = document.querySelector("#card-menu");

	// setup listeners
	setUpContextListener();
	setUpClickListener();
}());

function setUpContextListener() {
	// Setup context listener for card menu

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
