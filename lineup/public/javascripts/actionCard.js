var actionStore = require('./actionStore.js');

/* used for local action card ids to be assigned to each action card */
var nextActionCardLocalIdToUse = 1;

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

function createActionCard(cardName) {
	for (var i = 0; i < actionStore.length; i++) {
		if (actionStore[i].name == cardName) {
			var a = actionStore[i];
			return new ActionCard(a.name, a.cost, a.details, a.imagePath);
		}
	}
	return null;
}

module.exports = {
    createActionCard: createActionCard,
}