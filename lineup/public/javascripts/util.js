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