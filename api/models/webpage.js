/**
 *
 * @class Webpage
 *
 */
 
module.exports = function Webpage( caminio, mongoose ){

  'use strict';

  var _                   = require('lodash');
  var join                = require('path').join;
  var normalizeFilename   = require('caminio/util').normalizeFilename;

  var ObjectId            = mongoose.Schema.Types.ObjectId;
  var CaminioCarver       = require('caminio-carver')( caminio, mongoose );
  var PebbleSchema        = require('./_sub/pebble')( caminio, mongoose );
  var Pebble              = function(){ return PebbleSchema; };

  var schema = new mongoose.Schema({
    
    /**
     * @property parent
     * @type ObjectId
     */
    parent: { type: ObjectId, default: null, public: true },

    /**
     * @property requestReviewBy
     * @type ObjectId
     */
    requestReviewBy: { type: ObjectId, ref: 'User', public: true },

    /*
     * @property requestReviewMsg
     * @type String
     */
    requestReviewMsg: { type: String, public: true },

    /**
     * @property pebbles
     * @type Array
     */
    pebbles: [ PebbleSchema ],

    /**
     * @property initialSetupCompleted
     * @type Boolean
     */
    initialSetupCompleted: { type: Boolean, default: false },

    /**
     *  @attribute camDomain
     *  @type ObjectId
     */
    camDomain: { type: ObjectId, ref: 'Domain' },
    
    layout: { type: String, public: true, default: 'default' },

    childrenLayout: { type: String, public: true },

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

  schema.methods.findPebble = function(opts){
    opts = typeof(opts) === 'string' ? { name: opts } : opts;
    return _.find( this.pebbles, opts); 
  };

  schema.publicAttributes = [ 'translations', 'activities', 'path', 'absoluteUrl', 'pebbles' ];
  schema.trash = true;
  schema.plugin( CaminioCarver.langSchemaExtension, { fileSupport: true } );

  return schema;

};
