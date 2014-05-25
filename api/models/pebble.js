/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 00:30:53
 *

 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-25 12:03:33
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

var _ = require('lodash');
 
module.exports = function Pebble( caminio, mongoose ){

  var Translation = require('./_sub/translation')( caminio, mongoose );
  var ActivitySchema = require('./_sub/activity')( caminio, mongoose );

  var ObjectId = mongoose.Schema.Types.ObjectId;
  var Mixed = mongoose.Schema.Types.Mixed;

  var schema = new mongoose.Schema({

    /**
     * @property name
     * @type String
     */  
    name: { type: String, index: true, public: true },

    /**
     * @property description
     * @type String
     */  
    description: { type: String, public: true },

    /**
     * @property type
     * @type String
     */
    type: { type: String, public: true },

    /**
     * link is any link to the external internet
     * @property link
     * @type String
     */
    link: { type: String, public: true },

    /**
     * linkType is a hint for the html processor
     * what to do with the link. e.g.: youtube (embedded)
     * @property linkType
     * @type String
     */
    linkType: { type: String, public: true },


    /**
     * @property webpage
     * @type [ObjectId]
     */
    webpage: { type: [ ObjectId ], ref: 'Webpage', public: true },

    /**
     * @property mediafiles
     * @type [ObjectId]
     */
    mediafiles: { type: [ObjectId], ref: 'Mediafile', public: true },

    /**
     * @property teaser
     * @type [ObjectId]
     */
    teaser: { type: ObjectId, ref: 'Mediafile', public: true },

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

    preferences: { type: Mixed, default: {} },

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

    businfo: { type: String, public: true },
    traminfo: { type: String, public: true },
    contactinfo: { type: String, public: true },
    timeinfo: { type: String, public: true },

    /**
     * activities are dates with meta information
     * sticked to the webpage
     * @property activities
     * @type [ ActivitySchema ]
     *
     */
    activities: [ ActivitySchema ],

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
    updatedBy: { type: ObjectId, ref: 'User', public: true },

    position: { type: Number, public: true }

  });


  schema.virtual('curTranslation')
    .get(function(){
      if( !this._curLang )
        return this.translations[0];
      var guess = _.find( this.translations, { locale: this._curLang } );
      if( guess ){ return guess; }
      return this.translations[0];
    });

  schema.virtual('curLang')
    .set(function(lang){
      this._curLang = lang;
    });

  schema.publicAttributes = [ 'activities' ];

  return schema;

};
