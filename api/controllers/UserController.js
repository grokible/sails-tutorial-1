/**
 * User controller logic for REST service.
 * @module controllers/UserController
 * @see module:models/User
 */

var Promise = require ('bluebird');
var BCrypt = Promise.promisifyAll (require ('bcrypt'));
var Joi = require ('joi');

var ControllerOut = require ('Local/ControllerOut');
var StringUtil = require ('Local/stringutil.js');

var createSchema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})

module.exports = {

    /**
     * Create User.  Must have unique email.  Password is hashed prior to storage.
     * @function create
     * @arg {string} firstName will have lead/trail ws trimmed and upcase first
     * @arg {string} lastName will have lead/trail ws trimmed and upcase first
     * @arg {string} password Plaintext password for user account.
     * @arg {string} email Email must be unique (is used as login for account).
     * @returns {string} json User or Standard Error
     * @see createSchema for parameter validation
     */
    create: function (req, res) {
        try {
            var co = new ControllerOut (res)
            var pm = req.params.all ()
            pm ['firstName'] = StringUtil.cleanProperName (pm ['firstName'])
            pm ['lastName'] = StringUtil.cleanProperName (pm ['lastName'])

            // Delete added "id" field from params
            delete pm ['id']

            createSchema.validate (pm, function (e, value) { if (e) { e._code = "api.paramInvalid"; throw e } })
        }
        catch (e) {
            return co.error (e)
        }

        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (pm.password, salt) })
        .then (function (hash) { pm ['password'] = hash; return User.create (pm) })
        .then (function (user) { return res.json (user) })
        .catch (function (e) { return co.error (e) })
    }
};

