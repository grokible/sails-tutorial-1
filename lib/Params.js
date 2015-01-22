/**
 * @module Local/Params.js
 * @desc Utility object for handling Sails query parameters
 */

var _ = require ('lodash')
var SymbolicError = require ('Local/SymbolicError')
var JoiParamError = require ('Local/JoiParamError')

module.exports = Params

var _copyMap = function (map) {
    var obj = {};
    Object.getOwnPropertyNames (map).forEach (function (key) { obj [key] = map [key] })
    return obj;
}

function Params (httpRequest, optSchema) {
    var map = httpRequest.params.all ();
    this.items = _copyMap (map)
    this.schema = optSchema ? optSchema : null

    // Not sure where this comes from, but it's not a query param so delete it
    this.delete ("id")
}

var Class = Params.prototype;

Class.delete = function (name) {
    delete this.items [name];
    return this
}

Class.has = function (name) { return this.items [name] !== undefined }
Class.get = function (name) { return this.items [name] }

/**
 * criteria is a scalar or an array
 */
Class.apply = function (collection, fnEach) {
    var that = this;
    _.each (collection, function (v) {
        if (that.items.hasOwnProperty (v))
            that.items [v] = fnEach (that.items [v]);
    })

    return this
}

Class.toString = function () { return JSON.stringify (this.items) }

Class.validate = function () {
    if (this.schema === null)
        throw new SymbolicError ('bug.schemaIsNull', 'call to validate() with null schema in ctor');

    this.schema.validate (this.items, function (e, value) {
      if (e)
          throw new JoiParamError(e)
    });

    return this
}

Class.getAll = function () { return _copyMap (this.items) }



