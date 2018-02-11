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
        case "inPosition":
            return inPosition(card, parameters);
        case "characterInPositions":
            return characterInPositions(card, parameters);
        case "verifiedKeyword":
            return verifiedKeyword(card, parameters);
        default:
            console.log("handleConditions - ERROR: unrecognized functionName");
			return false;
    }
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

// expected params: encoded positions
function inPosition(card, parameters) {
	if (typeof(parameters) === "undefined" || parameters == null) {
		console.log("inPosition - ERROR: cannot find parameters");
		return false;
    }

    var validPositions = getValidPositions(parameters);
    return validPositions[card.arrayIndex];
}

// expected params: [self, opponent, encoded positions]
function characterInPositions(card, parameters) {
    if (typeof(parameters) === "undefined" || parameters == null) {
		console.log("characterInPositions - ERROR: cannot find parameters");
		return false;
    }

    var validPositions = getValidPositions(parameters[2]);
    if (parameters[0]) {
        var lineup = (card.isPlayer1 ? player1Lineup : player2Lineup);
        for (var i = 0; i < lineup.length; i++) {
            if (lineup[i] != null && validPositions[i]) return true;
        }
    }
    if (parameters[1]) {
        var lineup = (card.isPlayer1 ? player2Lineup : player1Lineup);
        for (var i = 0; i < lineup.length; i++) {
            if (lineup[i] != null && validPositions[i]) return true;
        }
    }
    return false;
}

// expected params: keyword
function verifiedKeyword(card, parameters) {
    if (typeof(parameters) === "undefined" || parameters == null) {
		console.log("verifiedKeyword - ERROR: cannot find parameters");
		return false;
    }

    switch (parameters) {
        case "Eager":
            return card.firstRound;
        default:
            return false;
    }
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
