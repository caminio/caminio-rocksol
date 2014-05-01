/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-13 18:59:51
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-01 02:52:40
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
var caminio;
var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };

/**
 *  Provides a compile method which compiles one snippet with the given local content.
 *  The content must be passed because snippets without layout dependencies have not 
 *  got any content in their body. 
 *  @class PeRuCompiler
 */
function PeRuCompiler( webpageAttributes, webpageMethods, c ){
  methods = webpageMethods;
  caminio = c;
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
    //console.log('process: ', snippet );
    var localContent =  getSnippetContent( snippet );
    attributes.markdownContent = markdown.toHTML( localContent );
    if( snippet.params.array && attributes[ snippet.params.array ] ){
      var pebbleFnArray  = attributes[ snippet.params.array ].map( function( pebble, index ){
        return function( nextSerie ){
          console.log('WE ARE HER WITH: ', 'glob: ', snippet );
          attributes.snippet = pebble;
          attributes.snippet.index = index;
          attributes.t = addI18nSupport( attributes );
          console.log('GOING to run: ', snippet.path + snippet.name +".js" );
          methods.runJS( snippet, snippet.path +  snippet.name +".js", attributes, function(){
            localContent += methods.compileJade( snippet.path + "/" + snippet.name +".jade", attributes );
            console.log('AFTER RUN', localContent );
            nextSerie();
          });
        }; 
      });
      async.series(
        pebbleFnArray,
        function(){
          console.log('END!!!!!', localContent );
          console.log('callback? ', done );
          done( null, localContent );              
      });
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
      var translation = _.first( snippet.db.translations, { 'locale': locale })[0];
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
 *
 *  @method compileSnippetArray
 *  @param snippet
 *  @param index
 */ 
function compileSnippetArray( pebble, index ){
  return function( localContent, nextSnippet ){
    pebble.index = index;
    attributes.pebble = pebble;
    attributes.t = addI18nSupport( attributes );
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
    console.log('GOING TO RUN: ', filepath );
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



  function addI18nSupport( attrs ){
    var join = require('path').join;
    if( !attrs.doc )
      return;

    var locale  = attrs.doc.curTranslation.locale;
    var translationFile = join( attributes.currentDomain.getContentPath(), 'locales',locale);
    var translationStr;
    if( fs.existsSync( translationFile +'.js') ){
      if( caminio.env === 'development' )
        delete require.cache[ translationFile+'.js' ];
      translationStr = require( translationFile );
    }

    return function( str ){
      if( translationStr && translationStr[str] )
        return translationStr[str];
      return str;
    };

  }

module.exports = PeRuCompiler;