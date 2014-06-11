/**
 *
 * @class Pebble
 *
 */
 
module.exports = function Translation( caminio, mongoose ){

  'use strict';

  var ObjectId            = mongoose.Schema.Types.ObjectId;
  var CaminioCarver       = require('caminio-carver')( caminio, mongoose );
  var Mixed = mongoose.Schema.Types.Mixed;

  var schema = new mongoose.Schema({

    name: { type: String, public: true },
    description: { type: String, public: true },
    type: { type: String, public: true },
    preferences: { type: Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, public: true },
    createdBy: { type: ObjectId, ref: 'User', public: true },
    updatedAt: { type: Date, default: Date.now, public: true },
    updatedBy: { type: ObjectId, ref: 'User', public: true },

  });

  schema.plugin( CaminioCarver.langSchemaExtension );

  return schema;

};
