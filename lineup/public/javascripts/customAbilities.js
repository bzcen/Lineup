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

	// TODO(bcen): change this to the conditions library
	if (card.dmgFromCombatThisTurn > 0) {
		// if we have more prevented dmg than combat damage, reduce prevented dmg
		parameters = (card.dmgFromCombatThisTurn > parameters ? parameters : card.dmgFromCombatThisTurn);
		addDmg(card, parameters * -1);
		card.dmgFromCombatThisTurn -= parameters;

		var action_log_text = "";
		if (type == "factionBonus") action_log_text = factionBonusTag;
		if (type == "ability") action_log_text = abilitiesBonusTag;

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

	var action_log_text = "";
	if (type == "factionBonus") action_log_text = factionBonusTag;
	if (type == "ability") action_log_text = abilitiesBonusTag;

	if (parameters >= 0) {
		modifier_name = "<greenText>[" + modifier_name + "]</greenText>";
	} else {
		modifier_name = "<firebrickText>[" + modifier_name + "]</firebrickText>";
	}
	action_log_text += card.name + " gained the temporary modifier " + modifier_name;
	addToActionLog(action_log_text, "normal-entry");
	return true;
}