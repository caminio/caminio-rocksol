/**
 *
 * @class Activity
 *
 */
 
module.exports = function Activity( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;
  
  var schema = new mongoose.Schema({

    /**
     * @property startsAt
     * @type String
     */  
    startsAt: { type: Date, required: true },

    /**
     * @property location
     * @type String
     */  
    location: { type: ObjectId, ref: 'Pebble' },

    /**
     * @property seats
     * @type String
     */  
    seats: { type: Number },

    /**
     * @property note
     * @type String
     */  
    note: String,
    
    /**
     * @property type
     * @type String
     */  
    type: String,

    /**
     * @property ticketevent
     * @type ObjectId
     */
    ticketevent: { type: ObjectId, ref: 'Ticketevent' },

  });

  return schema;

};