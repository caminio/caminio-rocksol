/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-08 12:23:38
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-08 13:02:25
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = exports = function PebbleLocation(schema, options) {
  schema.add({ 

    /**
     * @property street
     * @type String
     */  
    street: { type: String, public: true },
    
    /**
     * @property city
     * @type String
     */  
    city: { type: String, public: true },

    /**
     * @property zip
     * @type String
     */  
    zip: { type: String, public: true },

    /**
     * @property country
     * @type String
     */  
    country: { type: String, public: true },

    /**
     * @property state
     * @type String
     */  
    state: { type: String, public: true },

    /**
     * @property lng
     * @type Float
     */  
    lng: { type: Number, public: true },

    /**
     * @property lat
     * @type Float
     */  
    lat: { type: Number, public: true },

    x: { type: Number, public: true },
    y: { type: Number, public: true }
  });
  
};
