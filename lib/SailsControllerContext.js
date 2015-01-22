/**
 * @module Local/SailsControllerContext.js
 * @desc Singleton for all controllers.  Has a wrapper (interceptor)
 *       function that can be easily hooked around all methods for
 *       a Sails controller.
 * @example
 *
 *     // get singleton ('new' optional)
 *     var ci = SailsControllerContext ();
 *
 *     // setup intercept on all methods of the object,
 *     // and return the object
 *     module.exports = ci.intercept ({
 *         create: function (req, res) {
 */

var MethodInterceptor = require ('Local/MethodInterceptor')
var SymbolicError = require ('Local/SymbolicError')

module.exports = _SailsControllerContext;

var interceptor = null

function SailsControllerContext () {
    interceptor = new MethodInterceptor (Class.controllerAction, this);
}

var Class = SailsControllerContext.prototype;

/**
 * Call this function to finish a controller method, e.g. from an error callback
 * @example
 * 
 *     .then (function (user) { res.json (user) })
 *     .catch (function (e) { ci.error (res, e) })  // <= call here with exception
 */
Class.error = function (res, e) {
    // SymbolicErrors are designed to serialize correctly

    if (e instanceof SymbolicError)
        res.json ({ error: e });  // Google JSON standard => { error: } or { data: }
    else
        throw e; // Unhandled/unexpected exception
}

/**
 * wrapper (interceptor) function
 */
Class.controllerAction = function (originalFn, originalThis, arguments) {
    try {
        var req = arguments [0];
        var res = arguments [1];

        // Call original intercepted (wrapped) function

        originalFn.apply (originalThis, arguments)
    } catch (e) {
        this.error (res, e);
    }
}

// Expose the interceptor function

Class.intercept = function (obj) { return interceptor.intercept (obj) }

// ** Singleton pattern

var _singleton = null

function _SailsControllerContext () {
    if (_singleton === null)
        _singleton = new SailsControllerContext ();

    return _singleton;
}

