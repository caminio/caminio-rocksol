/**
 *
 * @class Webpage
 *
 */
 
module.exports = function Webpage( caminio, mongoose ){

  var normalizeFilename = require('caminio/util').normalizeFilename;

  var ObjectId = mongoose.Schema.Types.ObjectId;
  var TranslationSchema = require('./_sub/translation')( caminio, mongoose );

  var schema = new mongoose.Schema({

    // TODO: remove name! only filename anymore and titles
    /**
     * @property name
     * @type String
     */  
    name: { type: String, public: true },

    filename: { type: String, public: true },
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
  
  schema.virtual( 'curTranslation' )
      .get( function(){ return this._curTranslation; } )
      .set( function( value ){  this._curTranslation = value; } );

  schema.virtual( 'path' )
    .get( function(){ return this._path; } )
    .set( function( value ){ this._path = value; } );

  // // TODO: getParent is missing to get parent path
  schema.methods.url = function url( selectedLang, fallbackLang ){
    fallbackLang = fallbackLang || selectedLang;
    var lang = getElementFromArray( this.translations, 'locale', selectedLang );
    if( lang )
      lang = lang.locale;

    if( this.translations.length === 1 )
        return this._path + '/' + this.underscoreName() + '.htm';
    if( lang )
        return this._path + '/' + this.underscoreName() + '.' + lang + '.htm';
    return this._path + '/' + this.underscoreName() + '.' + fallbackLang + '.htm';

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

  schema.methods.underscoreName = function(){
    return this.constructor.underscoreName( this.name );
  };

  schema.static('underscoreName', function( str ){
    return normalizeFilename( str );
  });

  schema.publicAttributes = [ 'translations', 'activities', 'curTranslation', 'path' ];
  schema.trash = true;

  return schema;

};