/**
 *
 * @class Webpage
 *
 */
 
module.exports = function Webpage( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;
  var TranslationSchema = require('./_sub/translation')( caminio, mongoose );
  var ActivitySchema = require('./_sub/activity')( caminio, mongoose );

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
    translations: [ TranslationSchema ],

    /**
     * @property published
     * @type Boolean
     */
    status: { type: String, default: 'draft', public: true },
    
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
    updatedBy: { type: ObjectId, ref: 'User', public: true }

  });
  
  schema.virtual( 'curTranslation' )
      .get( function(){ return this._curTranslation; } )
      .set( function( value ){  this._curTranslation = value; } );

  schema.virtual( 'path' )
  .get( function(){ return this.path; } )
  .set( function( value ){ this.path = value; } );

  // TODO: getParent is missing to get parent path
  schema.methods.url = function url( selectedLang, fallbackLang ){
    var lang = getElementFromArray( translations, 'locale', selectedLang );
    if( translations.length === 1 )
        return this._path + '/' + this.name + '.htm';
    if( lang )
        return this._path + '/' + this.name + '.' + lang + '.htm';
    return this._path + '/' + this.name + '.' + fallbackLang + '.htm';

    function getElementFromArray( array, param, value ){
      var element;
      array.forEach( function( elem ){
        if( elem[param] === value ){
          element =  elem;
        }
      });
      return element;
    }
  };

  schema.publicAttributes = [ 'translations', 'activities', 'curTranslation' ];
  schema.trash = true;

  return schema;

};