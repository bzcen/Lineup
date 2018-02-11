// Script file for handling card abilities and faction bonuses

var factionBonusTag = "<mediumorchidText>[FACTION]</mediumorchidText> ";
var abilitiesBonusTag = "<salmonText>[ABILITY]</salmonText> ";

/** 
  Used as the primary middleware branching out to all other custom abilities
  @params
  	type: whether it's faction bonus or ability or neither
**/
function handleCustomAbility(card, functionName, parameters, type) {
	if (typeof(card) === "undefined" || card == null) {
		console.log("handleCustomAbility - ERROR: cannot find card");
		return;
	}
	if (typeof(functionName) === "undefined" || functionName == null) {
		console.log("handleCustomAbility - ERROR: cannot find functionName");
		return;
	}

	var result = false;;
	switch (functionName) {
		case "preventDmgFromCombat":
			result = preventDmgFromCombat(card, parameters, type);
			break;
		case "addDmgModifierToSelf":
			result = addDmgModifierToSelf(card, parameters, type);
			break;
		case "addDmgToPositions":
			result = addDmgToPositions(card, parameters, type);
			break;
		default:
			break;
	}

	if (result) {
		showPositionArrow(card.isPlayer1, card.arrayIndex);
		// redisplay the lineup after doing something
		displayLineup();
	}
}

function preventDmgFromCombat(card, parameters, type) {
	if (typeof(parameters) === "undefined" || parameters == null) {
		console.log("preventDmgFromCombat - ERROR: cannot find parameters");
		return false;
	}

	// this is a failsafe, but use the condition instead to prevent slowdown
	if (card.dmgFromCombatThisTurn > 0) {
		// if we have more prevented dmg than combat damage, reduce prevented dmg
		parameters = (card.dmgFromCombatThisTurn > parameters ? parameters : card.dmgFromCombatThisTurn);
		addDmg(card, parameters * -1);
		card.dmgFromCombatThisTurn -= parameters;

		var action_log_text = actionLogTextTag(type);

		action_log_text += card.name + " prevented " + getColorfiedDmgText(parameters) + " from combat!"; 
		addToActionLog(action_log_text, "normal-entry");
		return true;
	}
	return false;
}

// modularize this further to a "give modifier"
function addDmgModifierToSelf(card, parameters, type) {
	if (typeof(parameters) === "undefined" || parameters == null) {
		console.log("addDmgModifierToSelf - ERROR: cannot find parameters");
		return false;
	}

	var modifier_name;
	if (parameters >= 0) modifier_name = "+";
	modifier_name += parameters + " DMG";
	// TODO(bcen): change params so it's not always 2 rounds
	card.modifiers.push(new CharacterModifier(modifier_name, card, 2,
		() => {
			modifyCombatActionDmgOfCard(card, parameters);
		},
		() => {
			modifyCombatActionDmgOfCard(card, parameters * (-1));
		})
	);
	// activate the modifier immediately
	card.modifiers[card.modifiers.length-1].startFunc();

	var action_log_text = actionLogTextTag(type);

	if (parameters >= 0) {
		modifier_name = "<greenText>[" + modifier_name + "]</greenText>";
	} else {
		modifier_name = "<firebrickText>[" + modifier_name + "]</firebrickText>";
	}
	action_log_text += card.name + " gained the temporary modifier " + modifier_name;
	addToActionLog(action_log_text, "normal-entry");
	return true;
}

// params expected: [dmg, encoded attacked positions]
function addDmgToPositions(card, parameters, type) {
	var action_log_text = actionLogTextTag(type) + card.name + " dealt ";
	var hitSomething = false;

	// apply damage to every targetted position
	var attackedPositions = getValidPositions(parameters[1]);
	var lineupToAttack = (card.isPlayer1 ? player2Lineup : player1Lineup);
	for (var j = 0; j < attackedPositions.length; j++) {
		if (attackedPositions[j] && lineupToAttack[j] != null) {			
			let attacked = lineupToAttack[j];
			let dmg = parameters[0];

			addDmg(attacked, dmg);

			// for the purposes of combat specific dmg
			attacked.dmgFromCombatThisTurn += dmg;

			// adding a comma if something was added before
			if (hitSomething) action_log_text += ", ";
			action_log_text += getColorfiedDmgText(dmg) + " to " +
				attacked.name + " <blueText>(Pos " + (j+1) + ")</blueText>";
			hitSomething = true;
		}
	}
	// if something hit, print to action log!
	if (hitSomething) {
		addToActionLog(action_log_text, "normal-entry");
		return true;
	}
	return false;
}

// helper for building out the action log text
function actionLogTextTag(type) {
	switch(type) {
		case "factionBonus":
			return factionBonusTag;
		case "ability":
			return abilitiesBonusTag;
		default:
			return "";
	}
}