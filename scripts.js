var phases = ["Place Actions", "Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn", "Upkeep"];
var phaseIndex = 0;

function nextPhase() {
	phaseIndex++;
	if (phaseIndex >= phases.length) phaseIndex = 0;
	displayPhase();
}

function displayPhase() {
	var tag = "Current Phase: ";
	document.getElementById("phase-label").innerHTML = tag + phases[phaseIndex];
}
