const phases = ["Place Actions", "Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn", "Upkeep"];
var phaseIndex = 0;

// on load, render cards
window.onload = function() {
	for (var i = 0; i < 5; i++) {
		displayCard(i);
	}
};

function nextPhase() {
	phaseIndex++;
	if (phaseIndex >= phases.length) phaseIndex = 0;
	displayPhase();
}

function displayPhase() {
	var tag = "Current Phase: ";
	document.getElementById("phase-label").innerHTML = tag + phases[phaseIndex];
}

function displayCard(i) {
	var div = document.getElementById("combat-field");
	// this is really ugly, but I'm a bad programmer
	console.log("stuff" + i + " " + div.innerHTML);
}