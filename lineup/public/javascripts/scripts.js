const phases = ["Upkeep", "Leader - Place Actions", "Non-Leader - Place Actions",  "Leader - Flip Actions", "Non-Leader - Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn"];
var phaseIndex = -1;
var roundNum = 0;
// used for alternating colors per normal action log entry
var normalActionLogEntryNum = 0;

/* Used to track who is the leader of the round */
var player1IsLeader = false;

/* Toggle this true or false depending on if you want AI to be running Player 2 */
var enableAI = true;

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

var player1CharacterDefeatedThisRound = false;
var player2CharacterDefeatedThisRound = false;

var player1Energy = 0;
var player2Energy = 0;

/*** SETUP FUNCTIONS ***/

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
	nextPhase();
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
	// used for Eager, if the card from somewhere that wasn't the lineup
	if (originArray != "lineup") {
			card.firstRound = true;
	}
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
		if (card != null && card.dmg >= card.hp){
			moveCardToDefeated(card);
			if (isPlayer1) {
				player1CharacterDefeatedThisRound = true;
			} else {
				player2CharacterDefeatedThisRound = true;
			}
		}
	}
	displayLineup();
}

/*** END OF COMBAT EFFECTS ***/

function endOfCombatEffects() {
	if (player1IsLeader) promisesInSerial(applyPhaseEffects(true, "end-of-combat").concat(applyPhaseEffects(false, "end-of-combat")));
	else  promisesInSerial(applyPhaseEffects(false, "end-of-combat").concat(applyPhaseEffects(true, "end-of-combat")));
}

/*** END OF TURN EFFECTS ***/
function endOfTurnEffects() {
	var funcArr = [];
	if (player1IsLeader) {
		funcArr = funcArr.concat(applyPhaseEffects(true, "end-of-turn"));
		funcArr = funcArr.concat(applyPhaseEffects(false, "end-of-turn"));
	} else {
		funcArr = funcArr.concat(applyPhaseEffects(false, "end-of-turn"));
		funcArr = funcArr.concat(applyPhaseEffects(true, "end-of-turn"));
	}
	funcArr.push(promisify(slideLineups));
	promisesInSerial(funcArr);
}

// phaseType refers to "end-of-combat" or "end-of-turn" or "upkeep" or etc etc
// returns an array of promises to execute each custom ability of a card that should be called in the current phase
function applyCustomAbilitiesOfCard(card, category, phaseType) {
	var funcArr = [];
	var abilities;
	if (category == "factionBonus") {
		if (!validateFactionBonus(card.isPlayer1, card.faction)) {
			console.log([card.name,"faction bonus invalidated"]);
			return funcArr;
		}
		abilities = card.factionBonus;
	} else if (category == "abilities") {
		abilities = card.abilities;
	} else if (category == "combat") {
		abilities = card.combatActions;
	} else {
		console.log("applyCustomAbilitiesOfCard - ERROR: unsupported category");
		return funcArr;
	}

	if (typeof(abilities) !== "undefined" && abilities != null) {
		if (typeof(abilities.details) !== "undefined" && abilities.details.length > 0) {
			for (var i = 0; i < abilities.details.length; i++) {
				let ability = abilities.details[i];
				if (ability.type == phaseType) {
					// even if the phaseType is correct, need to check if extra conditions apply
					if (!checkAllConditions(card, ability.conditions)) {
						continue;
					}
					let params = [card, ability.functionName, ability.parameters, category];
					funcArr.push(
						promisifyWithDelay(
							wrapFunction(handleCustomAbility, this, params), 1000));
				}
			}
		}
	}

	return funcArr;
}

// generalized function that returns an array of promises of a player's lineup effects given a phase type
// phase type can be "end-of-turn", "end-of-combat", "upkeep"
function applyPhaseEffects(isPlayer1, phaseType) {
	var funcArr = [];
	funcArr.push(promisify(disableControlPanel));

	funcArr.push(
		promisifyWithDelay(() => {
			let phase_text;
			switch(phaseType) {
				case "end-of-turn":
					phase_text = "End-of-Turn Effects";
					break;
				case "end-of-combat":
					phase_text = "End-of-Combat Effects";
					break;
				case "upkeep":
					phase_text = "Upkeep Effects";
					break;
				case "combat":
					phase_text = "Combat Actions";
					break;
				default:
					break;
			}
			let player_text = (isPlayer1 ? "Player 1" : "Player 2");
			addToActionLog("Applying " + player_text + "'s " + phase_text + "...", "important-entry");
		}, 700)
	);

	var lineup = (isPlayer1 ? player1Lineup : player2Lineup);
	for (var i = 0; i < lineup.length; i++) {
		var card = lineup[i];
		if (card != null) {
			funcArr = funcArr.concat(applyPhaseEffectsOfCard(card, phaseType));
		}
	}
	
	funcArr.push(promisify(hidePositionArrow));
	funcArr.push(promisify(enableControlPanel));
	return funcArr;
}

// generalized function that returns an array of promises a card's effects given a phase type
// phase type can be "end-of-turn", "end-of-combat", "upkeep"
function applyPhaseEffectsOfCard(card, phaseType) {
	let funcArr = [];
	if (card == null) {
		console.log("applyPhaseEffectsOfCard - ERROR: card is null");
		return funcArr;
	}
	if (card.array != "lineup") {
		console.log("applyPhaseEffectsOfCard - ERROR: card is not in lineup");
		return funcArr;
	}

	if (phaseType == "combat") {
		funcArr = funcArr.concat(applyCustomAbilitiesOfCard(card, "combat", phaseType));
	} else {
		// check abilities and faction bonus
		funcArr = funcArr.concat(applyCustomAbilitiesOfCard(card, "abilities", phaseType));
		funcArr = funcArr.concat(applyCustomAbilitiesOfCard(card, "factionBonus", phaseType));
	}
	return funcArr;
}

/*** DMG FUNCTIONS ***/

function addDmg(card, dmg) {
	addAnimatedDmgTicker(card, dmg);
	card.dmg = card.dmg + dmg;
	if (card.dmg < 0) card.dmg = 0;
}

// applies the combat actions of all cards in both lineups
// TODO(bcen): make this follow the leader
function combatActions() {
	promisesInSerial(applyPhaseEffects(true, "combat").concat(applyPhaseEffects(false, "combat")));
}

// adds an animated dmg ticker tag over a character card
function addAnimatedDmgTicker(card, dmg) {
	// grab the element as well as its absolute top/left position
	let query = "[card-local-id=\"" + card.localId + "\"]";
	let el = document.querySelectorAll(query)[0];
	let offset = getOffset(el);

	// build a new dmg ticker span
	let div = document.createElement("span");
	let text;
	if (dmg > 0) {
		div.classList.toggle("red-dmg-ticker");
		text = "+" + dmg;
	} else {
		div.classList.toggle("green-dmg-ticker");
		text = dmg;
	}
	// position the ticker in the horizontal middle of the card
	div.style.left = offset.left + (el.offsetWidth/2) - 10 + 'px';
	div.style.position = "absolute";
	let content = document.createTextNode(text);
	div.appendChild(content);
	document.body.appendChild(div);
	
	// animation code, clears itself after 30 frames
	let start = null;
	function step(timestamp) {

		if (!start) start = timestamp;
		var progress = timestamp - start;
		div.style.top = offset.top + (el.offsetHeight/3) - (progress/40) + 'px';

		if (progress < 1600) {
			window.requestAnimationFrame(step);
		} else {
			div.remove();
		}
	}
	window.requestAnimationFrame(step);
}

/*** CHARACTER CARD MODIFIERS ***/

//TODO(bcen): this should be moved somewhere else
function modifyCombatActionDmgOfCard(card, modifier) {
	if (card.combatActions == null) {
		return;
	}
	for (var i = 0; i < card.combatActions.details.length; i++)  {
		// this is highly specific to how we construct combatActions in class.js
		card.combatActions.details[i].parameters[0] = card.combatActions.details[i].parameters[0] + modifier;
	}
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
	lineup[indexA].arrayIndex = indexA;
	lineup[indexB].arrayIndex = indexB;

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

function enableControlPanel() {
	var bottom = document.getElementById("control-panel");
	var buttons = bottom.getElementsByClassName("button");

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].disabled = false;
		buttons[i].classList.remove("button--disabled");
	}
}

function disableControlPanel() {
	var bottom = document.getElementById("control-panel");
	var buttons = bottom.getElementsByClassName("button");

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].disabled = true;
		buttons[i].classList.add("button--disabled");
	}
}

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
			// need to dump away the flipped cards to discard
			moveFlipsToDiscards(true);
			moveFlipsToDiscards(false);
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

function endOfCombat() {
	endOfCombatEffects();
}

function endOfTurn() {
	// this needs to be separate from upkeepUpdateCard
	for (var i = 0; i < player1Lineup.length; i++) {
		if (player1Lineup[i] != null) player1Lineup[i].firstRound = false;
	}
	for (var i = 0; i < player2Lineup.length; i++) {
		if (player2Lineup[i] != null) player2Lineup[i].firstRound = false;
	}
	endOfTurnEffects();
}

// Used for updating some of the properties of a card
function upkeepUpdateCard(card) {
	card.dmgFromCombatThisTurn = 0;

	var index = 0;
	while (index < card.modifiers.length) {
		var modifier = card.modifiers[index];
		modifier.duration--;
		if (modifier.duration <= 0) {
			modifier.endFunc();
			card.modifiers.splice(index, 1);
		}
		else {
			index++;
		}
	}
}

function upkeep() {
	player1CharacterDefeatedThisRound = false;
	player2CharacterDefeatedThisRound = false;

	// TODO(bcen): this should be happening to the standby pool as well
	// otherwise a card moved to standby will never lose its modifiers
	for (var i = 0; i < player1Lineup.length; i++) {
		if (player1Lineup[i] != null) upkeepUpdateCard(player1Lineup[i]);
	}
	for (var i = 0; i < player2Lineup.length; i++) {
		if (player2Lineup[i] != null) upkeepUpdateCard(player2Lineup[i]);
	}

	displayLineup();

	// both players draw a card
	draw(true);
	draw(false);

	// both players gain 1 ENERGY
	addEnergy(true, 1);
	addEnergy(false, 1);

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
	var player_text = (isPlayer1 ? "Player 1" : "Player 2");
	var action_log_text = player_text + " flipped ";

	if (flips.length == 0) {
		addToActionLog(action_log_text + "zero cards!", "normal-entry");
		return;
	}

	for (var i = 0; i < flips.length; i++) {
		if (i>0) action_log_text += ", ";
		action_log_text += "<orchidText>" + flips[i].name + " (Cost " + flips[i].cost + ")</orchidText>";
	}

	addToActionLog(action_log_text, "normal-entry");
}

function moveFlipsToDiscards(isPlayer1) {
	var flips = (isPlayer1 ? player1Flips : player2Flips);

	// TODO(bcen): maybe refactor this into a "clear array" method
	// clear out all of flips, send to discard
	var numToDiscard = flips.length;
	for (var i = 0; i < numToDiscard; i++) {
		// needs to be this way since the flips array shrinks with each move
		if (isPlayer1) moveCardToArray(player1Flips[0], "discards");
		else moveCardToArray(player2Flips[0], "discards");
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
	var combatActionsText = (card.combatActions != null ? card.combatActions.description : "");
	var factionBonusText = (card.factionBonus != null ? card.factionBonus.description : "");
	var abilitiesText = (card.hasOwnProperty("abilities") ? card.abilities : "");

	var htmlString = 
		"<div class=\"card-container\" card-local-id=\"" + card.localId + "\">" +
		"<div class=\"header\">" +
		"<h3>" + card.name + "</h3>" + "<div class=\"filler\"></div>" + "<h3>Lvl." + card.level + "</h3>" +
		"</div>" +
		"<img src=\"" + card.imagePath + "\" alt=\"placeholder image\">" +
		"<bodyHeaderCombat>Combat Actions</bodyHeaderCombat>" + "<p>" + combatActionsText + "</p>" +
		"<bodyHeaderAbilities>Abilities</bodyHeaderAbilities>" + "<p>" + abilitiesText + "</p>" +
		"<bodyHeaderFaction>Faction Bonus</bodyHeaderFaction>" + "<p>" + factionBonusText + "</p>" +
		"<div class=\"hp-dmg-container\">" +
		"<hpHeader>HP: " + card.hp + "</hpHeader>" +
		"<dmgHeader>DMG: " + card.dmg + "</dmgHeader>" +
		"</div>" +
		"</div>"
	;

	for (var i = 0; i < card.modifiers.length; i++) {
		htmlString += "<span class=\"modifier-text\">" + card.modifiers[i].name + "</span>";
	}

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

function getColorfiedDmgText(dmg) {
	return "<firebrickText>" + dmg + " DMG</firebrickText>";
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
			array_text = "<greenText>Standby</greenText>";
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
		if (enableAI && !isPlayer1) {
			card_container.innerHTML += "<div class=\"card-outer-container\"><div class=\"card-container--hidden\"><h2>???</h2></div></div>";
		} else {
			card_container.innerHTML += "<div class=\"card-outer-container\">" + getCardDisplayHTML(standby[i]) + "</div>";
		}
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

	var energy_label = document.getElementById("energy-label");
	energy_label.innerHTML = "Energy: " + (isPlayer1 ? player1Energy : player2Energy);
	// need to do this so that buttons know which energy to modify
	energy_label.isPlayer1 = isPlayer1;

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

/*** Position Arrow ***/

// note that posIndex is 0-based
function showPositionArrow(isPlayer1, posIndex) {
	let arrow = document.getElementById("position-arrow");
	var position_elements = document.getElementsByClassName("position-container");
	let el;
	if (isPlayer1) {
		var fixed_ids = [3, 2, 1, 0];
		el = position_elements[fixed_ids[posIndex]];
	} else {
		el = position_elements[posIndex + 4];
	}
	let offset = getOffset(el);
	
	arrow.style.top = offset.top + el.offsetHeight - 30 + "px";
	arrow.style.left = offset.left + (el.offsetWidth/2) - 20 + "px";
	arrow.style.display = "block";
}

function hidePositionArrow() {
	let arrow = document.getElementById("position-arrow");
	arrow.style.display = "none";
}

/*** ENERGY FUNCTIONS ***/

function addEnergy(isPlayer1, num) {
	if (isPlayer1) {
		player1Energy += num;
		if (player1Energy < 0) player1Energy = 0;
	}
	else {
		player2Energy += num;
		if (player2Energy < 0) player2Energy = 0;
	}

	var player_text = (isPlayer1 ? "Player 1" : "Player 2");
	var verb_text = (num >= 0 ? " increased by " : " decreased by ");
	if (num < 0) num *= -1;
	addToActionLog(player_text + "'s ENERGY" + verb_text + num, "normal-entry");
}

function add1EnergyFromModal() {
	var energy_label = document.getElementById("energy-label");
	addEnergy(energy_label.isPlayer1, 1);
	showActionsModal(energy_label.isPlayer1);
}

function remove1EnergyFromModal() {
	var energy_label = document.getElementById("energy-label");
	addEnergy(energy_label.isPlayer1, -1);
	showActionsModal(energy_label.isPlayer1);
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

// helper that returns whether a faction is present in a player's lineup to allow faction bonus
function validateFactionBonus(isPlayer1, faction) {
	if (faction != "Legion" && faction != "Whirly West") {
		console.log("validateFactionBonus - ERROR: invalid faction read");
		return false;
	}

	var count = 0;
	var lineup = (isPlayer1 ? player1Lineup : player2Lineup);
	for (var i = 0; i < lineup.length; i++) {
		if (lineup[i] != null && lineup[i].faction == faction) count++;
	}
	return (count >= 2);
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