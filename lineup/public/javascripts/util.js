// https://stackoverflow.com/questions/899102/how-do-i-store-javascript-functions-in-a-queue-for-them-to-be-executed-eventuall
// wraps a function
// @params
//   fn - reference to the function
//   context - what 'this' is
//   params
function wrapFunction(fn, context, params) {
    return function() {
        fn.apply(context, params);
    };
}

// execute an array of functions (returning promises) in order
function promisesInSerial(arr) {
    arr.reduce(function(curr, next) {
        return curr.then(next)
    }, Promise.resolve());
}

// promisify a function with a resolve delay
function promisifyWithDelay(func, ms) {
    return () => {
        return new Promise((resolve, reject) => {
            func();
            setTimeout(resolve, ms);
        });
    };
}

// promisify a function
function promisify(func) {
    return () => {
        return new Promise((resolve, reject) => {
            func();
            resolve();
        });
    }
}

// return an object {left, top} of the absolute position of an element
function getOffset(el) {
    el = el.getBoundingClientRect();
    return {
        left: el.left + window.scrollX,
        top: el.top + window.scrollY
    };
}

// helper function for getting the position of an event
function getEventPosition(e) {

	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;

	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return {
		x: posx,
		y: posy
	}
}

// helper function for checking if an element is within a className
function clickInsideElement(e, className) {
	var el = e.srcElement || e.target;

	if (el.classList.contains(className)) {
		return el;
	} else {
		while (el = el.parentNode) {
			if (el.classList && el.classList.contains(className)) {
				return el;
			}
		}
	}
	return false;
}

// helper to remove null spots in the card array index
// returns a newly allocated array, so it needs to be assigned outside
function cleanArray(array) {
	array = array.filter(n=>n);
	// fix indexes
	for (var i = 0; i < array.length; i++) {
		array[i].arrayIndex = i;
	}
	return array;
}

// apply Fisher-Yates Shuffle to an array
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/12646864
function shuffleArray(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
