/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-13 18:59:51
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-13 20:02:39
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async;
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
  locale = attributes.translation.locale;
  async = require('async');
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
};

/**
 *
 *
 */
function getSnippetContent( snippet ){
  if( snippet.translations && snippet.translations.length > 0  )
    return methods.getElementFromArray( snippet.translations, 'locale', locale ).content;
  return '';
}
   
/**
 *
 *
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
    var filepath = snippet.path + snippet.name +".jade";
    methods.runJS( snippet, filepath +".js", attributes, function(){
      var layout = hasLayoutFile( snippet ) ? filepath +".jade" : "!=markdownContent";
      done( null, methods.compileJade( layout, attributes ) );
    });    
  } catch( exception ){
    if( exception.name === "no_rubble_file" )
      exceptionHandling( exception, done );
    else 
      throw exception;
  }
}

/**
 *
 *
 */ 
function hasLayoutFile( snippet ){
  if( fs.existsSync( snippet.path + "/" + snippet.name +".jade" ) )
    return true;
 if( snippet.type === Type.RUBBLE )
    throw { error: 'rubble has no file ', name: 'no_rubble_file' };
  else
    return false;
}

/**
 *
 *
 */ 
function exceptionHandling( exception, done ){
  done( null, "BIG TODO" );
}