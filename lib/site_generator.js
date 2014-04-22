/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-15 00:24:25
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-23 00:32:25
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require('async'); 
var caminio;
var WebpageMethods;
var PeRuProcessor = require('./pe_ru_bble/pe_ru_bble_processor');
var Deps = require('./runners/dependencies');
var Compiler = require('./runners/compiler');

var globalSettings;
var error = { 
  no_locale: "no_locale_given_and_none_or_multiple_translations",
  no_layout: "no_layout_name_given",
  no_content_path: "no_content_path_given",
  no_translations: "object_has_no_translation" 
};

/**
 *  Provides a compile method which compiles one snippet with the given local content.
 *  The content must be passed because snippets without layout dependencies have not 
 *  got any content in their body. 
 *  @class PeRuCompiler
 *  @param caminio_ { Object }
 *  @param settings
 */
function SiteGenerator( settings, caminio_ ){
  globalSettings = settings;
  caminio = caminio_;  
  WebpageMethods = require('./webpage_methods')( caminio );
  dependencies = new Deps( caminio );
}

SiteGenerator.prototype.compile = function( object, options, callback ){
  if( param3 ){
    options = param2;
    callback = param3;
  } else
    callback = param2;

  if( typeof param1 === 'string' )
    compileContent( param1, options, callback );

  else if( param1.isArray )
    async.each( compileObject );
  else
    compileObject( param1 );

  function compileObject( object, next ){
    var string;
    if( translations.length === 1 )
      options.locale = object.translations[0].locale;
    if( !options.locale ) 
      callback( error.no_locale );
    else
      string = "";//TODO


    // Get dependencies

    this.compile( string, options, next );
  }
};

SiteGenerator.prototype.compileArray = function( array, options, callback ){
  // FOREACH ELEMENT CALL compileContent
  // make a return array in case 
};

SiteGenerator.prototype.compileObject = function( object, options, callback ){
  
  if( !object.translations ) 
    return callback( error.no_translations, object );

};

function getDependencies( object, options, callback ){
    
  dependencies.getDependenciesOfWebpage( object, function( err, deps ){
    for( i in deps ){
      options[i] = deps[i];
    }
    
  });
}

function compileAll( object, options, callback ){

}

function compileTranslations( object, options, callback ){
  var gen = this;
  async.each( object.translations, function( translation, next ){
      options.locale = translation.locale;
      // SET CURRENT TRANSLATION & JS FILES
      console.log( translation );
      gen.compileContent( 'Hello {{ Pebble: nopall }}', options, next );      
    }, callback );
}

/**
 *  Compiles the given content with different options and returns the compiled
 *  content. If no other options specified it will be compiled with a jade 
 *  compiler.
 *  @method compileContent
 *  @param content { String } The content that should be compiled
 *  @param options.contentPath { String } The path to the content directory in 
 *         the file system. Layouts are located in the relative path /layouts. 
 *         Layouts and .js files are both in the same folder and MUST have the 
 *         same name as mentioned in the layout.
 *  @param options.locale The locale of the content.This MUST be set in case 
 *         there are subelements like pebbles with translations. 
 *  @param options.layout.name The name of the layout file, if this is unset or 
 *         there is no such layout file in the filesystem the compiler will get 
 *         the content stored in layoutContent.
 *  @param options.layout.content Can be set as default layout for the compiler
 *         in case that the layout file is not found. It can also be used to 
 *         format data without creating layout files. In case this variable is
 *         not set the default layout will be '!=markdownContent'.
 *  @param options.layout.type Default is JADE, if another type is set another
 *         layout compiler can be called.
 *  @param options.currentObject Holds the data about the content like name or
 *         translations.
 *  @param options.jsFiles
 *  @return { { Object }, { String } } The compiled content and an error object.
 *
 *  @example
 *
 *  In the following example the compiler will first look for a layout file in 
 *  the content path. In case there is no layoutfile he will take the format 
 *  specified in the content variable.
 *      layout = {
 *        name: 'aLayout',
 *        content: 'h1=markdownContent'
 *      }
 *    
 */
SiteGenerator.prototype.compileContent = function( content, options, callback ){

  async.waterfall([
    initRuns,
    runJsFiles,
    runLayoutCompiler,
    runPebbleRubbleProcessor,
    runParsers
  ], callback );

  function initRuns( start ){    
    if( !options.locale ) 
      return callback( error.no_locale, content );
    if( !options.contentPath )
      return callback( error.no_content_path, content );
    if( !options.layout )
      options.layout = { type: 'jade' };
    start( null, content, options );
  }

};

function runJsFiles( content, options, done ){
  if( !options.currentObject )
    options.currentObject = {};
  if( !options.jsFiles )
    options.jsFiles = [];

  async.each( options.jsFiles, function( jsFile, next){
    WebpageMethods.runJS( options.currentObject, jsFile, options, next );
  }, function(){
    done( null, content, options );
  });
}

function runLayoutCompiler( content, options, done ){
  compiler = new Compiler().getCompiler();
  content = compiler( content, options );
  done( null, content, options );  
}

function runPebbleRubbleProcessor( content, options, done ){
  processor = new PeRuProcessor( caminio, 'path' );
  processor.startSearch( content, options, function( err, content ){
    done( null, content, options );    
  });
}

function runParsers( content, options, done ){
  // FOR FUTURE PARSERS
  done( null, content, options );    
}

module.exports = SiteGenerator;
