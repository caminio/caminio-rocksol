/**
 *
 * @class Pebble
 *
 */
 
module.exports = function Pebble( caminio, mongoose ){

  var Translation = require('./_sub/translation')( caminio, mongoose );

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var schema = new mongoose.Schema({

    /**
     * @property name
     * @type String
     */  
    name: String,

    /**
     * @property translations
     * @type Array an array of Translation Schema Objects
     */
    translations: [ Translation ],

    /**
     * @property created.at
     * @type Date
     */

    /**
     * @property created.by
     * @type ObjectId
     */
    created: { 
      at: { type: Date, default: Date.now },
      by: { type: ObjectId, ref: 'User' }
    },

    /**
     * @property updated.at
     * @type Date
     */

    /**
     * @property updated.by
     * @type ObjectId
     */
    updated: { 
      at: { type: Date, default: Date.now },
      by: { type: ObjectId, ref: 'User' }
    }

  });

  // these attributes will be
  // visible in toJSON and toObject calls
  schema.publicAttributes = ['name','updated','created'];

  return schema;

}