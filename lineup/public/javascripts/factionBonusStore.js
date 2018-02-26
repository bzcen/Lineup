factionBonusStore = [
    {
        "faction": "Legion",
        "description": "At end of turn, if a character left the enemy lineup, gain +1 DMG to all Combat Actions for the next round only",
		"details": [
		    {
			    "type": "end-of-turn",
				"functionName": "addDmgModifierToSelf",
				"parameters": 1,
				"conditions" : [
			        {
					    "functionName": "characterDefeatedThisRound",
						"parameters": [false, true]
					}
				]
			}
		]
    },
    {
        "faction": "Whirly West",
        "description": "During combat, prevent 1 DMG counter from being added to this character",
        "details": [
            {
                "type": "end-of-combat",
                "functionName": "preventDmgFromCombat",
                "parameters": 1,
                "conditions" : [
                    {
                        "functionName": "combatDmgThisRound",
                        "parameters": 1
                    }
                ]
            }
        ]
    }
];

module.exports = factionBonusStore;