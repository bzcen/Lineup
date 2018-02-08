function addAnimatedProjectiles(card, targetCard, dmg, callback) {
	// grab the element as well as its absolute top/left position
	let originQuery = "[card-local-id=\"" + card.localId + "\"]";
	let originEl = document.querySelectorAll(originQuery)[0];
	let originOffset = getOffset(originEl);

	let targetQuery = "[card-local-id=\"" + targetCard.localId + "\"]";
	let targetEl = document.querySelectorAll(targetQuery)[0];
	let targetOffset = getOffset(targetEl);

	for (var i = 0; i < dmg; i++) {
		// create projectile
		let projectile = document.createElement("img");
		projectile.src = "images/whirly_west_projectile.png"; // TODO(bcen): change this to check faction
		projectile.classList.add("projectile");
		document.body.appendChild(projectile);

		// set the origin of the projectile from the absolute position of the attacker
		let projectileTop = originOffset.top + (originEl.offsetHeight/3);
		let projectileLeft = originOffset.left + (originEl.offsetWidth/2)

		let targetTop = targetOffset.top + (targetEl.offsetHeight/2.5) + Math.floor(Math.random() * 70);
		let targetLeft = targetOffset.left + (targetEl.offsetWidth/2);

		// calculate the slope, then normalize
		let deltaTop = targetTop - projectileTop;
		let deltaLeft = targetLeft - projectileLeft;
		let magnitude = Math.sqrt(deltaTop*deltaTop + deltaLeft*deltaLeft);
		deltaTop /= magnitude;
		deltaLeft /= magnitude;

		console.log([deltaTop, deltaLeft, card.name]);
		
		// calculate the rotation of the projectile pointing to the target
		// note that the arguments for the y component is reversed since absolute coord treat +Y as down
		// Math.atan2 ranges between -PI to +PI
		let deg = 90 + Math.atan2(projectileTop - targetTop, targetLeft - projectileLeft) * 180 / Math.PI;
		let rotate = "rotate(" + deg + "deg)";
		projectile.style.webkitTransform = rotate;
		projectile.style.transform = rotate;
		let travelingRight = card.isPlayer1;

		let speedFactor = 12;
		let animationId = setInterval(projectileFrame, 16);
		function projectileFrame() {
			if ((travelingRight && projectileLeft >= targetLeft) 
			|| (!travelingRight && projectileLeft <= targetLeft)) {
				clearInterval(animationId);
				projectile.remove();
				// call any callbacks once the projectile reaches its destination
				callback();
			}
			frames++;
			projectileTop += deltaTop*speedFactor;
			projectileLeft += deltaLeft*speedFactor;
			projectile.style.top = projectileTop + "px";
			projectile.style.left = projectileLeft + "px";
		}
	}
	
}