/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 00:30:53
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 20:30:39
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

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
    name: { type: String, public: true },

    /**
     * @property type
     * @type String
     */
    type: { type: String, enum: [ 'table', 'gallery', 'page' ], public: true },

    /**
     * @property translations
     * @type Array an array of Translation Schema Objects
     */
    translations: { type: [ Translation ], public: true },
    
    /**
     *  @attribute camDomain
     *  @type ObjectId
     */
    camDomain: { type: ObjectId, ref: 'Domain', public: true },

    /**
     * @property createdAt
     * @type Date
     */

    /**
     * @property createdBy
     * @type ObjectId
     */
    createdAt: { type: Date, default: Date.now, public: true },
    createdBy: { type: ObjectId, ref: 'User', public: true },

    /**
     * @property updatedAt
     * @type Date
     */

    /**
     * @property updatedBy
     * @type ObjectId
     */
    updatedAt: { type: Date, default: Date.now, public: true },
    updatedBy: { type: ObjectId, ref: 'User', public: true }

  });

  return schema;

};