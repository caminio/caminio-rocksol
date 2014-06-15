/**
 *
 * @class Pebble
 *
 */
 
module.exports = function Pebble( caminio, mongoose ){

  'use strict';

  var ObjectId            = mongoose.Schema.Types.ObjectId;
  var CaminioCarver       = require('caminio-carver')( caminio, mongoose );
  var Mixed = mongoose.Schema.Types.Mixed;


  var schema = new mongoose.Schema({

    name: { type: String },
    description: { type: String, public: true },
    type: { type: String, public: true },
    preferences: { type: Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, public: true },
    createdBy: { type: ObjectId, ref: 'User', public: true },
    updatedAt: { type: Date, default: Date.now, public: true },
    updatedBy: { type: ObjectId, ref: 'User', public: true },

  });

  schema.plugin( CaminioCarver.langSchemaExtension );
  schema.publicAttributes = ['name'];


  function PebbleNameValidator( curName ){
    var parent = this.parent();
    var id = this._id;
    parent.pebbles.forEach( function( pebble ){
      if( id !== pebble._id )
        if( replaceSpace(curName).match( replaceSpace(pebble.name) ) !== null ){
          console.log('returns false');
          return false;
        }
    });
    console.log('return true');
    return true;
  }

  function replaceSpace( string ){
    return string.replace(/\s/g, '');
  }


  return schema;

};
