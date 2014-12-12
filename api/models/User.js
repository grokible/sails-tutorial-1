/**
* User.js
*
* @description :: User account (login, authentication)
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    firstName : { type: 'string', required: true },

    lastName : { type: 'string', required: true },

    email : { type: 'string', required: true, unique: true, email: true }

  }
};
