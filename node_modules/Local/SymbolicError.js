/**
 * @module Local/SymbolicError
 * @desc Error object with symbolic code (symbol) and error chaining
 * @example
 *
 *     if (someError)
 *         throw new SymbolicError ('auth.badCredentials', "Login/Password pair not valid.")
 *
 *     // example 2: chaining exceptions ...
 *
 *     } catch (e) {
 *         throw new SymbolicError ('auth.badCredentials', 'bad credentials', e)
 *     }
 *
 *     // Turn on verbose debugging (stack dump) in stringify output
 *
 *     SymbolicError.setDebug (true)
 */

module.exports = SymbolicError

var inherits = require ('util').inherits

var _debug = false

function SymbolicError (code, message, chainedException) {
    Error.call (this, message)
    this.code = code ? code : 'unknown'
    this.message = message ? message : ""

    if (_debug)
        this.chained = chainedException ? chainedException : null
}

inherits (SymbolicError, Error)

var Class = SymbolicError.prototype

/**
 * Turns on debugging, which prints stack trace of e on trace.
 */
Class.setDebug = SymbolicError.setDebug = function (val) { _debug = val ? true : false }
Class.getDebug = SymbolicError.getDebug = function () { return _debug }

Class.toString = function () {
    var s = "SymbolicError(" + this.code + "): " + this.message

    if ( ! _debug)
        return s

    if (this.stack) 
        return s + "\n: " + this.stack

    if ( ! this.chained)
        return s

    if (this.chained.stack) 
        return s + "\n: " + this.chained.stack

    s += "\nChained: " + this.chained
    return s
}





