function checkAllConditions(card, conditions) {
    if (typeof(conditions) === "undefined" || conditions.length <= 0) {
        return true;
    }

    for (var i = 0; i < conditions.length; i++) {
        if (!handleConditions(card, conditions[i].functionName, conditions[i].parameters)) return false;
    }
    return true;
}

/**
 * Used as the primary middleware for checking if a condition is met
 */
function handleConditions(card, functionName, parameters) {
    if (typeof(card) === "undefined" || card == null) {
		console.log("handleConditions - ERROR: cannot find card");
		return false;
	}
	if (typeof(functionName) === "undefined" || functionName == null) {
		console.log("handleConditions - ERROR: cannot find functionName");
		return false;
    }
    
    switch (functionName) {
		case "characterDefeatedThisRound":
			return characterDefeatedThisRound(card, parameters);
			break;
		default:
			break;
    }
    return false;
}

// expected params: [self, opponent]
function characterDefeatedThisRound(card, parameters) {
	if (typeof(parameters) === "undefined" || parameters == null) {
		console.log("characterDefeatedThisRound - ERROR: cannot find parameters");
		return false;
    }

    var ownCharacterDefeated = false;
    if (parameters[0]) {
        ownCharacterDefeated = (card.isPlayer1 ? player1CharacterDefeatedThisRound : player2CharacterDefeatedThisRound);
    }
    var opponentCharacterDefeated = false;
    if (parameters[1]) {
        opponentCharacterDefeated = (card.isPlayer1 ? player2CharacterDefeatedThisRound : player1CharacterDefeatedThisRound);
    }

    return ownCharacterDefeated || opponentCharacterDefeated;
}