/**
 * @module models/User
 * @desc User account with first/last name, login, and encrypted password.
 * @see module:controllers/UserController
 */

module.exports = {

  attributes: {
    firstName : { type: 'string', required: true },
    lastName :  { type: 'string', required: true },
    email :     { type: 'string', required: true, unique: true, email: true },
    password :  { type: 'string', required: true }
  }

}