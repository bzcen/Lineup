// next id to use = 13
characterStore = {	
	"factions": {
		"Legion": [
			{
				"id": 7,
				"faction": "Legion",
				"name": "Augustus",
				"level": 4,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "1/2/3: 2 DMG to Position 1",
					"details": [
						{
							"position": 7,
							"target": 1,
							"dmg": 2
						}
					]
				},
				"abilities": "During combat, prevent 1 DMG counter from being added to the character behind this character",
				"hp": 12	
			},
			{
				"id": 8,
				"faction": "Legion",
				"name": "Matilda",
				"level": 2,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": null,
				"abilities": "At end of turn, remove 2 DMG counters from friendly characters in Position 1 and Position 2",
				"hp": 6	
			},
			{
				"id": 9,
				"faction": "Legion",
				"name": "Milo",
				"level": 3,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "3/4: 1 DMG to Position 1/2",
					"details": [
						{
							"position": 12,
							"target": 3,
							"dmg": 1
						}
					]
				},				
				"abilities": "",
				"hp": 13	
			},
			{
				"id": 10,
				"faction": "Legion",
				"name": "Remus",
				"level": 2,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "1/2: 2 DMG to Position 1",
					"details": [
						{
							"position": 3,
							"target": 1,
							"dmg": 2
						}
					]
				},
				"abilities": "",
				"hp": 9
			},
			{
				"id": 11,
				"faction": "Legion",
				"name": "Rufus",
				"level": 2,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "2 DMG to Position 2",
					"details": [
						{
							"position": 15,
							"target": 2,
							"dmg": 2
						}
					]
				},
				"abilities": "At end of turn, remove 1 DMG counter from each character in your lineup",
				"hp": 7
			},
			{
				"id": 12,
				"faction": "Legion",
				"name": "Zeus",
				"level": 5,
				"imagePath": "images/legion_placeholder.jpg",
				"combatActions": {
					"description": "2 DMG to Position 1<br/>1 DMG to Position 2",
					"details": [
						{
							"position": 15,
							"target": 1,
							"dmg": 2
						},
						{
							"position": 15,
							"target": 2,
							"dmg": 1
						}
					]
				},
				"abilities": "Whenever an opponent adds a character card to his/her lineup, add 3 DMG counters to it",
				"hp": 15
			},
		],
		"Whirly West": [
			{
				"id": 1,
				"faction": "Whirly West",
				"name": "Billy",
				"level": 4,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "Eager: 1 DMG to Position 1/2/3<br/>1 DMG to Position 1/2/3",
					"details": [
						{
							"position": 15,
							"target": 15,
							"dmg": 1,
							"keyword": "Eager"
						},
						{
							"position": 15,
							"target": 15,
							"dmg": 1
						}
					]
				},
				"abilities": "",
				"hp": 7
			},
			{
				"id": 2,
				"faction": "Whirly West",
				"name": "Carbine",
				"level": 3,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "2/3/4: 3 DMG to Position 3",
					"details": [
						{
							"position": 14,
							"target": 3,
							"dmg": 3
						}
					]
				},
				"abilities": "",
				"hp": 7
			},
			{
				"id": 3,
				"faction": "Whirly West",
				"name": "Dexter",
				"level": 1,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "3/4: 2 DMG to Position 4",
					"details": [
						{
							"position": 12,
							"target": 8,
							"dmg": 2
						}
					]
				},
				"abilities": "",
				"hp": 4
			},
			{
				"id": 4,
				"faction": "Whirly West",
				"name": "Remington",
				"level": 2,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "3 DMG to Position 2",
					"details": [
						{
							"position": 15,
							"target": 2,
							"dmg": 3
						}
					]
				},
				"abilities": "",
				"hp": 5
			},
			{
				"id": 5,
				"faction": "Whirly West",
				"name": "Renegade Rick",
				"level": 3,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "1: 1 DMG to Position 1<br/>2/3/4: 2 DMG to Position 2",
					"details": [
						{
							"position": 1,
							"target": 1,
							"dmg": 1
						},
						{
							"position": 14,
							"target": 2,
							"dmg": 2
						}
					]
				},
				"abilities": "During combat, if there is less than 4 character cards in your lineup, deal +1 DMG to all Combat Actions",
				"hp": 10
			},
			{
				"id": 6,
				"faction": "Whirly West",
				"name": "Sheriff S4M",
				"level": 5,
				"imagePath": "images/whirly_west_placeholder.png",
				"combatActions": {
					"description": "3 DMG to Position 1/2",
					"details": [
						{
							"position": 15,
							"target": 3,
							"dmg": 3
						}
					]
				},
				"abilities": "At end of turn, draw an ACTION card for each opposing character card that died during this turn's resolve combat phase",
				"hp": 12
			},
		],
	}
};

module.exports = characterStore;