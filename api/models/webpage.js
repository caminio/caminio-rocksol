/**
 *
 * @class Webpage
 *
 */
 
var _                 = require('lodash');
var normalizeFilename = require('caminio/util').normalizeFilename;

module.exports = function Webpage( caminio, mongoose ){

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
  

  schema.virtual('curTranslation')
    .get(function(){
      if( !this._curLang )
        return null;
      return _.first( this.translations, { locale: this._curLang } )[0]; 
    });

  schema.virtual('curLang')
    .set(function(lang){
      this._curLang = lang;
    });

  //TODO: make teaser
  schema.virtual( 'teaser' )
    .get( function(){ return; } )

  schema.pre('save', function(next){
    if( !this.isNew )
      return next();
    if( !this.filename )
      this.filename = normalizeFilename( this.translations[0].title );
    next();
  });

  schema.virtual('absoluteUrl')
    .get(function(){
      return this.url();
    });

  schema.methods.url = function url(){
    
    if( this.translations.length === 1 )
        return this._path + '/' + this.filename + '.htm';
    // if( lang )
    //     return this._path + '/' + this.filename + '.' + lang + '.htm';
    return this._path + '/' + this.filename + '.' + this._curLang + '.htm';

  };

  schema.methods.underscoreName = function(){
    return this.constructor.underscoreName( this.name );
  };

  schema.static('underscoreName', function( str ){
    return normalizeFilename( str );
  });

  schema.publicAttributes = [ 'translations', 'activities', 'curTranslation', 'path', 'absoluteUrl' ];
  schema.trash = true;

  return schema;

};