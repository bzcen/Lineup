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

	var result;
	switch (functionName) {
		case "preventDmgFromCombat":
			result = preventDmgFromCombat(card, parameters, type);
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

	if (card.dmgFromCombatThisTurn > 0) {
		// if we have more prevented dmg than combat damage, reduce prevented dmg
		parameters = (card.dmgFromCombatThisTurn > parameters ? parameters : card.dmgFromCombatThisTurn);
		addDmg(card, parameters * -1);
		card.dmgFromCombatThisTurn -= parameters;

		var action_log_text = "";
		if (type == "factionBonus") action_log_text = factionBonusTag;
		if (type == "ability") action_log_text = factionBonusTag;

		action_log_text += card.name + " prevented <firebrickText>" + parameters + " DMG</firebrickText> from combat!"; 
		addToActionLog(action_log_text, "normal-entry");
		return true;
	}
	return false;
}