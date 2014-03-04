/**
 *
 * @class Pebble
 *
 */
 
module.exports = function Translation( caminio, mongoose ){

  var schema = new mongoose.Schema({

    /**
     * @property locale
     * @type String
     */  
    locale: { type: String, required: true },

    /**
     * @property title
     * @type String
     */  
    title: String,

    /**
     * @property subtitle
     * @type String
     */  
    subtitle: String,

    /**
     * @property content
     * @type String
     */  
    content: String,

    /**
     * @property metaDescription
     * @type String
     */
    metaDescription: String,

    /**
     * @property metaKeywords
     * @type String
     */
    metaKeywords: String

  });

  return schema;

};