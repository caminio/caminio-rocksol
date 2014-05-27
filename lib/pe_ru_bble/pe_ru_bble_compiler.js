/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-13 18:59:51
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-27 12:26:43
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

'use strict';

var fs    = require('fs');    
var async = require('async');
var _     = require('lodash');
var join  = require('path').join;
var inflection = require('inflection');

var Type  = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };

var methods,
    attributes,
    locale,
    localContent;

/**
 *  Provides a compile method which compiles one snippet with the given local content.
 *  The content must be passed because snippets without layout dependencies have not 
 *  got any content in their body. 
 *  @class PeRuCompiler
 */
function PeRuCompiler( webpageAttributes, webpageMethods ){
  methods = webpageMethods;
  attributes = webpageAttributes;
  locale = attributes.locale ? attributes.locale : attributes.currentDomain.locale;
}

/**
 *
 *  @method compileSnippet
 *  @param snippet { Object } The snippet that has got the layout and js file. In case 
 *         of db Pebbles it can happen that they do not have a file in the datasystem
 *         although they have some markdown content. A rubble on the other hand MUST 
 *         have a file with the same name in the datasystem because it has no dynamic
 *         content in the database.
 *  @param done { Function( err, content ) }
 */
PeRuCompiler.prototype.compileSnippet = function( snippet, done ){
  try{

    if( snippet.params.array && attributes[ snippet.params.array ] ){
      localContent = '';
      var index = 0;

      var arrayFunction = getArrayFunction( index, snippet );

      async.eachSeries( 
        attributes[ snippet.params.array ],
        arrayFunction,
        function( err ){
          done( null, localContent );     
        } 
      );

    } else 
      runCompile( snippet, done );
  } catch( exception ){
   if( exception.name === "locale_error" )
     done( exception, localeError( snippet ) );
   else 
     throw exception;
  }
}; 

/**
 *
 *
 */
function getArrayFunction( index, snippet ){
  return compileArrayEntry;

  /**
   *
   *
   */
  function compileArrayEntry( entry, next ) {
    compileTranslations( entry );

    if( !entry.preferences )
      entry.preferences = {};
    entry.preferences.index = index;
    entry.index = index;
    index++;

    var attributeName =  snippet.params.name || inflection.singularize( snippet.params.array );
    attributes[ attributeName ] = entry;

    var filepath = snippet.path +  snippet.name +".js";
    getLayoutSettings( snippet, filepath, function( layout, layoutSettings ){
      localContent += methods.compileJade( layout, layoutSettings ) ( attributes );
      next();
    });
  }

}

/**
 *
 *  @method getSnippetContent
 *  @param snippet
 *  @return { String }
 */
function compileTranslations( snippet ){

  var translations = snippet.translations;

  if( translations && translations.length > 0 ){
    var actualTranslation = _.find( translations, { 'locale': locale }) ||
                            _.find( translations, { 'locale': attributes.currentDomain.locale });
    if( !actualTranslation )
      throw new LocaleError( 'no translation matches locale' );

    actualTranslation.content= methods.contentCompiler.compile( actualTranslation.content );
    actualTranslation.content = '<div id=markdown_' + snippet._id + '>' + actualTranslation.content + '</div>';


    snippet.curLang = actualTranslation.locale;
    return actualTranslation.content;
  }
  else if( translations && translations.length > 1)
    throw new LocaleError( 'no locale given' ); 
  else 
    throw new LocaleError( 'snippet has no translations' );
}

function LocaleError( message ){
  this.name = 'locale_error';
  this.message = message || 'an error with locales occured';
}

LocaleError.prototype = new Error();
LocaleError.prototype.constructor = LocaleError;
   
  
/**
 *  @method runCompile
 *  @param { Object } snippet
 *  @param { Function } done
 */ 
function runCompile( snippet, done ){
  try{
    var filepath = snippet.path + snippet.name;
    if( snippet.db )
      compileTranslations( snippet.db );
    getLayoutSettings( snippet, filepath, function( layout, layoutSettings ){
      done( null, methods.compileJade( layout, layoutSettings ) ( attributes ) );
    });
  } catch( exception ){
    if( exception.name === "no_rubble_file" )
      done( exception, noRubbleFile( snippet ) );
    else 
      throw exception;
  }
}

/**
 *  Runs the JS file from the snippet and passes the layout as well as the 
 *  layout settings to the next function.
 *  
 *  @method getLayoutSettings
 *  
 */
function getLayoutSettings( snippet, filepath, afterRun ){
   methods.runJS( snippet, filepath, attributes, function(){

    var layout = join( snippet.path, snippet.name +".jade" );

    if( snippet.params.layout )
      layout = replaceAll( snippet.name, snippet.params.layout, layout );
    if( hasLayoutFile( snippet ) )
      layout = fs.readFileSync( layout  );
    else
      layout = "!=snippet.curTranslation.content";

    var layoutSettings = { filename: layout, pretty: true };

    afterRun( layout, layoutSettings );
  });    
}



/**
 *  @method hasLayoutFile
 *  @param { Object } snippet
 *  @return { Boolean }
 */ 
function hasLayoutFile( snippet ){
  if( fs.existsSync( snippet.path + snippet.name +".jade" ) )
    return true;
  if( snippet.type !== Type.PEBBLE )
    throw { error: 'rubble has no file ', name: 'no_rubble_file' };
  else
    return false;
}

/**
 *  @method noRubbleFile
 *
 */ 
function noRubbleFile( snippet ){
  var message = "{{ Warning: could not find rubble in filesystem! "; 
  message += snippet.original.replace( "{{", "" );
  return message;
}

/**
 *  @method localeError
 *
 */
function localeError( snippet ){
  var message = "{{ Warning: error with translations and locale!";
  message += snippet.original.replace( "{{", "" );
  return message;
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

module.exports = PeRuCompiler;
