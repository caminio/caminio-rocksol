/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-13 18:59:51
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-26 01:13:06
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs    = require('fs');
var async = require('async');
var _     = require('lodash');
var join  = require('path').join;

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
 *  @param done { Function( err, content ) }
 */
PeRuCompiler.prototype.compileSnippet = function( snippet, done ){
  try{
    localContent = getSnippetContent( snippet );

    attributes.markdownContent = methods.contentCompiler.compile( localContent );
    if( snippet.db )
      attributes.markdownContent = '<div id=markdown_' + snippet.db._id + '>' + attributes.markdownContent + '</div>';

    if( snippet.params.array && attributes[ snippet.params.array ] ){
      localContent = '';
      var index = 0;

      arrayFunction = getArrayFunction( index, snippet );

      async.eachSeries( 
        attributes[ snippet.params.array ],
        arrayFunction,
        function( err, x ){
          console.log('HERE: ', localContent );
          done( null, localContent )     
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
    compileContent( entry );
    attributes.snippet = entry;

    if( !attributes.snippet.preferences )
      attributes.snippet.preferences = {};
    attributes.snippet.preferences.index = index;
    attributes.snippet.index = index;
    index++;

    methods.runJS( snippet, snippet.path +  snippet.name +".js", attributes, function(){

      var layout = join( snippet.path, snippet.name +".jade" );
      if( fs.existsSync( layout ) )
        layout = fs.readFileSync( layout  );
      else
        layout = "!=snippet.curTranslation.content";
      var layoutSettings = { filename: layout, pretty: true };
      localContent += methods.compileJade( layout, layoutSettings ) ( attributes );
      next();
    });
  }

}

/**
 *  @method getSnippet
 *
 */
function compileContent( entry ){

  // attributes.markdownContent = methods.contentCompiler.compile( localContent );
  //   if( snippet.db )
  //     attributes.markdownContent = '<div id=markdown_' + snippet.db._id + '>' + attributes.markdownContent + '</div>';


  if( entry.translations ){
    translation = _.find( entry.translations, { 'locale': locale });
    if( !translation )
      translation = _.find( entry.translations, { 'locale': attributes.locals.currentDomain.locale });
    if( !translation )
      throw { 
        name: 'locale_error', 
        error: 'no translation is matching the given locale: ' + locale 
      }
    translation.content = methods.contentCompiler.compile( translation.content );

    entry.curLang = locale;
  }

}

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
      var translation = _.find( snippet.db.translations, { 'locale': locale });
      if( translation.content )
        return translation.content;
      else 
        throw { 
          error: 'no translation matches locale',
          name: 'locale_error'
        };
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
 *  @method runCompile
 *  @param { Object } snippet
 *  @param { Function } done
 */ 
function runCompile( snippet, done ){
  try{
    var filepath = snippet.path + snippet.name;
    methods.runJS( snippet, filepath +".js", attributes, function(){
      var layout = hasLayoutFile( snippet ) ? filepath +".jade" : "!=markdownContent";
      if( fs.existsSync( layout ) )
        layout = fs.readFileSync( layout  );
      var layoutSettings = { filename: layout, pretty: true };
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

// TODO: other error management

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

module.exports = PeRuCompiler;
