/**
 * User controller logic for REST service.
 * @module controllers/UserController
 * @see module:models/User
 */

var Promise = require ('bluebird');
var BCrypt = Promise.promisifyAll (require ('bcrypt'));
var Joi = require ('joi');

var StringUtil = require ('Local/stringutil.js');
var Params = require ('Local/Params');

var SailsControllerInterceptorSingleton = require ('Local/SailsControllerInterceptorSingleton');

var createSchema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})

var ci = SailsControllerInterceptorSingleton ();

module.exports = ci.intercept ({
    /**
     * Create User.  Must have unique email.  Password is hashed prior to storage.
     * @function create
     * @arg {string} firstName will have lead/trail ws trimmed and upcase first
     * @arg {string} lastName will have lead/trail ws trimmed and upcase first
     * @arg {string} password Plaintext password for user account.
     * @arg {string} email Email must be unique (is used as login for account).
     * @returns {string} json User or Standard Error
     * @see createSchema for parameter validation
     *   // req - http.IncomingMessage, res - http.ServerResponse
     */
    create: function (req, res) {
        var pm = new Params (req, createSchema)
        pm.apply (['firstName', 'lastName'], StringUtil.cleanProperName)

        var p = pm.validate ().getAll ()

        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (p.password, salt) })
        .then (function (hash) { p ['password'] = hash; return { data: p } /*User.create (p)*/ })
        .then (function (user) { res.json (user) })
        .catch (function (e) { ci.error (res, e) })
    }
});

