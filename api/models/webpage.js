/**
 *
 * @class Webpage
 *
 */
 
var _                 = require('lodash');
var join              = require('path').join;
var normalizeFilename = require('caminio/util').normalizeFilename;

module.exports = function Webpage( caminio, mongoose ){

  var ObjectId = mongoose.Schema.Types.ObjectId;
  var TranslationSchema = require('./_sub/translation')( caminio, mongoose );

  var schema = new mongoose.Schema({

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
        return this.translations[0];
      var guess = _.find( this.translations, { locale: this._curLang } );
      if( guess ){ return guess; }
      return this.translations[0];
    });

  schema.virtual('curLang')
    .set(function(lang){
      this._curLang = lang;
    });

  // backwards compatibility
  schema.virtual('name')
    .get(function(){
      return this.filename;
    });

  schema.virtual( 'teaser' )
    .get( function(){ return this._teaser; } )
    .set( function(teaser){ this._teaser = teaser; });

  schema.pre('save', function(next){
    if(this.filename)
      this.filename = normalizeFilename( this.filename );
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

  schema.virtual('relPath')
    .get(function(){
      return join( (this._path || ''), this.filename );
    });

  schema.virtual('absPath')
    .get(function(){
      return join( '/', this.curTranslation.locale, (this._path ? this._path : ''), this.filename );
    });

  schema.methods.underscoreName = function(){
    return this.constructor.underscoreName( this.name );
  };

  schema.static('underscoreName', function( str ){
    return normalizeFilename( str );
  });

  schema.publicAttributes = [ 'translations', 'activities', 'path', 'absoluteUrl' ];
  schema.trash = true;

  return schema;

};