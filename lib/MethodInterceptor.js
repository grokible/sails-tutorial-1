/**
 * @module Local/MethodInterceptor.js
 * @desc Utility object for intercepting/wrapping methods
 * @example
 *
 *     // Here's an OOP way to do things:
 *
 *     function SomeConstructor () {
 *         this.interceptor = new MethodInterceptor
 *             (SomeConstructor.prototype.wrapper, this);
 *     }
 *
 *     // This function is the "interceptor" (wrapper) function.  It
 *     // doesn't automatically call the wrapped function (we must do it ourselves).
 *
 *     SomeConstructor.prototype.wrapper = function (originalFn, originalThis, arguments) {
 *         // N.B. 'this' will be set to the second arg of the MethodInterceptor
 *         // constructor.  We passed in "this" so this will behave like an OOP method.
 *         // But the second arg can be anything, including null (optional context).
 *       
 *         // You should call the original function like this:
 *
 *         originalFn.apply (originalThis, arguments)
 *     }
 */

module.exports = MethodInterceptor

/**
 * Constructor.
 * @arg {function} interceptorFn is the function that wraps the original function.
 * @arg {object} optContextObject is optional object passed into the wrapper function.
 */
function MethodInterceptor (interceptorFn, optContextObject) {
    this.interceptorFn = interceptorFn
    this.contextObject = optContextObject ? optContextObject : null
}

var Class = MethodInterceptor.prototype;

Class.intercept = function (obj) {
    for (var name in obj) {

        // Only wrap local functions

        if ( ! obj.hasOwnProperty (name) || typeof obj [name] !== 'function')
            continue;

        // fn is original function on the object, to wrap

        var originalFn = obj [name];
        var ifn = this.interceptorFn;

        // set method on object to be our function wrapper, which gets
        // the original function (fn), optContextObject as 'this', and arguments array

        obj [name] = function () {
            return ifn.call (this.optContextObject, originalFn, this, arguments)
        }
    }

    return obj;
}

