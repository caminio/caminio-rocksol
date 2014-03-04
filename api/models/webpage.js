/**
 *
 * @class Webpage
 *
 */
 
module.exports = function Webpage( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;
  var Translation = require('./_sub/translation')( caminio, mongoose );

  var schema = new mongoose.Schema({

    /**
     * @property name
     * @type String
     */  
    name: { type: String, public: true },

    /**
     * @property translations
     * @type Array an array of Translation Schema Objects
     */
    translations: [ Translation ],

    /**
     * @property published
     * @type Boolean
     */
    status: { type: String, default: 'draft' },

    /**
     * @property requestReviewBy
     * @type ObjectId
     */
    requestReviewBy: { type: ObjectId, ref: 'User' },

    /**
     *  @attribute camDomain
     *  @type ObjectId
     */
    camDomain: { type: ObjectId, ref: 'Domain' },
    
    layout: { type: String, public: true },

    /**
     * pebbles are tiny bits with content
     * which are placed and dispatched all over
     * the webpage's layout
     */
    pebbles: [ { type: ObjectId, ref: 'Pebble' } ],

    /**
     * @property createdAt
     * @type Date
     */

    /**
     * @property createdBy
     * @type ObjectId
     */
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: ObjectId, ref: 'User' },

    /**
     * @property updatedAt
     * @type Date
     */

    /**
     * @property updatedBy
     * @type ObjectId
     */
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: ObjectId, ref: 'User' }

  });

  return schema;

};