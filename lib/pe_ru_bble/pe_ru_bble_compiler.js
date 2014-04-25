/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-13 18:59:51
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-25 01:09:51
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs = require('fs');
var async = require('async');
var markdown = require( "markdown" ).markdown;
var methods;
var attributes;
var locale;
var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };

/**
 *  Provides a compile method which compiles one snippet with the given local content.
 *  The content must be passed because snippets without layout dependencies have not 
 *  got any content in their body. 
 *  @class PeRuCompiler
 */
function PeRuCompiler( webpageAttributes, webpageMethods  ){
  methods = webpageMethods;
  attributes = webpageAttributes;
  locale = attributes.locale ? attributes.locale : false;
}

/**
 *
 *  @method compileSnippet
 *  @param snippet { Object } The snippet that has got the layout and js file. In case 
 *         of db Pebbles it can happen that they do not have a file in the datasystem
 *         although they have some markdown content. A rubble on the other hand MUST 
 *         have a file with the same name in the datasystem because it has no dynamic
 *         content in the database.
 *
 */
PeRuCompiler.prototype.compileSnippet = function( snippet, done ){
  try{
    var localContent =  getSnippetContent( snippet );
    attributes.markdownContent = markdown.toHTML( localContent );
    if( snippet.params.array && attributes[ snippet.params.array ] ){
      var pebbleArray = attributes[ snippet.params.array ].map( compileSnippetArray );
      pebbleArray.unshift( function( callback ){
        callback( localContent );
      });
      async.waterfall( pebbleArray, done );
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
 *  @method getSnippetContent
 *  @param snippet
 *  @return { String }
 */
function getSnippetContent( snippet ){
  if( !snippet.db )
    return '';

  if( snippet.db.translations )
    if( snippet.db.translations.length > 1  && locale ){
      var translation = methods.getElementFromArray( snippet.db.translations, 'locale', locale );
      if( translation.content )
        return translation.content;
      else 
        throw { 
          error: 'no translation matches locale',
          name: 'locale_error'
        }
    }
    else if( snippet.db.translations.length === 1 )
      return snippet.db.translations[0].content;

  if( snippet.db && snippet.db.translations.length > 1)
    throw { 
      name: 'locale_error', 
      error: 'no locale given' 
    };
  else    
    throw { 
      name: 'locale_error', 
      error: 'snippet has no translations' 
    };
}
   
/**
 *
 *  @method compileSnippetArray
 *  @param snippet
 *  @param index
 */ 
function compileSnippetArray( snippet, index ){
  return function( localContent, nextSnippet ){
    snippet.index = index;
    attributes.snippet = snippet;
    runCompile( snippet, function( err, compiledContent ){
      localContent += compiledContent;
      delete webpageAttributes.snippet;
      nextSnippet( err, localContent );
    });
  };
}
  
/**
 *
 *
 */ 
function runCompile( snippet, done ){
  try{
    var filepath = snippet.path + snippet.name;
    methods.runJS( snippet, filepath +".js", attributes, function(){
      var layout = hasLayoutFile( snippet ) ? filepath +".jade" : "!=markdownContent";
      done( null, methods.compileJade( layout, attributes ) );
    });    
  } catch( exception ){
    if( exception.name === "no_rubble_file" )
      done( exception, noRubbleFile( snippet ) );
    else 
      throw exception;
  }
}

/**
 *
 *
 */ 
function hasLayoutFile( snippet ){
  //console.log( 'search: ', snippet.path + snippet.name +".jade", fs.existsSync( snippet.path + snippet.name +".jade" ) );
  if( fs.existsSync( snippet.path + snippet.name +".jade" ) )
    return true;
  if( snippet.type !== Type.PEBBLE )
    throw { error: 'rubble has no file ', name: 'no_rubble_file' };
  else
    return false;
}

/**
 *
 *
 */ 
function noRubbleFile( snippet ){
  var message = "{{ Warning: could not find rubble in filesystem! "; 
  message += snippet.original.replace( "{{", "" );
  return message;
}

function localeError( snippet ){
  var message = "{{ Warning: error with translations and locale!";
  message += snippet.original.replace( "{{", "" );
  return message;
}

module.exports = PeRuCompiler;