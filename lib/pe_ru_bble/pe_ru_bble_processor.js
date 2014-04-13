/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:03:25
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-13 18:59:31
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require('async');
var PeRuParser = require('./pe_ru_bble_parser')();
var PeRuBbleProcessor = {};
var markdown = require( "markdown" ).markdown;
var fs = require('fs');

var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };


/**
 *  Provides methods for parsing snippets
 *  to pebbles and rubbles and to get 
 *  missmatches as well.
 *  
 *  @class PeRuBbleProcessor
 */
module.exports = function( pebbleDb, contentPath ) {

  var webpageAttributes;
  var webpageId;
  var content;
  var webpageMethods = pebbleDb.wM();

  PeRuBbleProcessor.startSearch = function( attributes, done ){
    content = attributes.translation.content;
    webpageAttributes = attributes;
    webpageId = attributes.webpage._id;
    runSearch( content, done, true );
  };
  
  function runSearch( data, done, first ){
    try {

      var localContent = '';
      if( ( data.translations && data.translations.length > 0 ) || first ){
        localContent = first ? 
          data : 
          webpageMethods.getElementFromArray( 
            data.translations, 
            'locale', 
            webpageAttributes.translation.locale ).content;
      }

      if( !first )
        snippetCompile( data, localContent, done );
      else{
        work( localContent, done );
      }

    } catch( ex ){
      console.log('Exception: ', ex );
      done( { todo: "TODO" }, content );
    }
    
  }

  function snippetCompile( snippet, localContent, next ){
    webpageAttributes.markdownContent = markdown.toHTML( localContent );
    if( snippet.params.array && webpageAttributes[ snippet.params.array ] ){
      var pebbleArray = webpageAttributes[ snippet.params.array ].map( runArrayCompile );
      async.series(
        pebbleArray,
        replaceOriginal             
      );
    } else 
      compileSnippet( snippet, function( compiledContent ){
        localContent = compiledContent;
        replaceOriginal( localContent );
      });
    
    function runArrayCompile( snippet, index ){
      return function( nextSnippet ){
        snippet.index = index;
        webpageAttributes.snippet = snippet;
        compileSnippet( snippet, function( compiledContent ){
          localContent += compiledContent;
          delete webpageAttributes.snippet;
          nextSnippet();
        });
      };
    }

    function replaceOriginal( localContent ){
      content = content.replace( new RegExp( snippet.original, 'g'), localContent );
      work( content, next );      
    }

  }

  

  function compileSnippet( snippet, done ){
    var filepath = snippet.path + snippet.name +".jade";
    webpageMethods.runJS( snippet, filepath +".js", webpageAttributes, function(){
      var layout = hasLayoutFile( snippet ) ? filepath +".jade" : "!=markdownContent";
      var content = webpageMethods.compileJade( layout, webpageAttributes );
      done( content );
    });
  }

  function hasLayoutFile( snippet ){
    if( fs.existsSync( snippet.path + "/" + snippet.name +".jade" ) )
      return true;
   if( snippet.type === Type.RUBBLE )
      throw { error: 'rubble has no file ' };
    else
      return false;
  }

  function work( content, next ){
    var snippets = PeRuParser.getSnippets( content );
    if( snippets.pebbles.length > 0 || snippets.rubbles.length > 0 ){
      var pebbles = PeRuParser.makeSnippetObjects( 
        snippets.pebbles, 
        contentPath + "/pebbles/",
        Type.PEBBLE 
      );        
      var rubbles = PeRuParser.makeSnippetObjects( 
        snippets.rubbles, 
        contentPath + "/rubbles/",
        Type.RUBBLE
      );
      run( pebbles, Type.PEBBLE, function(){
        run( rubbles, Type.RUBBLE, function(){
          next( null, content ); 
        });
      });
    } else {
      next( null, content );   
    }
  }

  function run( snippets, snippetType, callback ){
    async.each( snippets, recursiv, callback );

    function recursiv( snippet, next ){
      if( snippetType === Type.PEBBLE ){
        pebbleDb.getData( snippets, webpageId, function( err, dbPebbles ){
          snippet.db = webpageMethods.getElementFromArray( dbPebbles, 'name', snippet.name );
          runSearch( snippet, next ); 
        });

      }
      else
        runSearch( snippet, next );               
    }
  }

  return PeRuBbleProcessor;

};