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
    locale: { type: String, required: true, public: true },

    /**
     * @property title
     * @type String
     */  
    title: { type: String, public: true },

    /**
     * @property subtitle
     * @type String
     */  
    subtitle: { type: String, public: true },

    /**
     * @property content
     * @type String
     */  
    content: { type: String, public: true },

    /**
     * @property metaDescription
     * @type String
     */
    metaDescription: { type: String, public: true },

    /**
     * @property metaKeywords
     * @type String
     */
    metaKeywords: { type: String, public: true }

  });

  return schema;

};