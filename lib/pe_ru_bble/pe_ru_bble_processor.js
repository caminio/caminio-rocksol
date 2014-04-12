/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:03:25
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-12 04:25:30
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require('async');
var PeRuParser = require('./pe_ru_bble_parser');
var PeRuBbleProcessor = {};

var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };

/**
 *  Provides methods for parsing snippets
 *  to pebbles and rubbles and to get 
 *  missmatches as well.
 *  
 *  @class PeRuBbleProcessor
 */
module.exports = function( caminio ) {
  var Pebble = caminio.models.Pebble;
  var contentPath;
  var webpageAttributes;
  var webpageId;
  var first;

  function initSearch(  path, attributes, done ){
    first = true;
    content = attributes.translation.content;
    contentPath = path;
    webpageAttributes = attributes;
    webpageId = attributes.webpage._id;
    runSearch( content, done );
  }
  
  function runSearch( data, done ){

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
      first = false;
      work( localContent, done );
    }
    
  }

  function snippetCompile( snippet, localContent, next ){
    webpageAttributes.markdownContent = markdown.toHTML( localContent );

    if( snippet.options.array && webpageAttributes[ snippet.options.array ] ){
      var pebbleArray = webpageAttributes[ snippet.options.array ].map( runArrayCompile );
      async.series(
        pebbleArray,
        replaceOriginal             
      );
    } else 
      compileSnippet( snippet, webpageAttributes, function( compiledContent ){
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
      content = content.replace( new RegExp( snippet.orig, 'g'), localContent );
      work( content, next );      
    }

  }

  function work( content, next ){
    var snippets = PeRuParser.getSnippets( content );
    if( snippets && snippets.length ){
      var pebbles = makeSnippetObjects( snippets.pebbles );        
      var rubbles = makeSnippetObjects( snippets.pebbles );
      run( pebbles, Type.PEBBLE, webpageId, function(){
        run( rubbles, Type.RUBBLE, webpageId, next );
      });
    } else 
      next();   
  }

  function compileSnippet( snippet, done ){
    var filepath = snippet.path + "/" + snippet.name +".jade";
    webpageMethods.runJS( data, filepath +".js", webpageAttributes, function(){
      var layout = checkLayoutFile ? "!=markdownContent" : filepath +".jade";
      var content = webpageMethods.compileJade( layout, webpageAttributes );
      done( content );
    });
  }

  function checkLayoutFile( pebble ){
    if( !fs.existsSync( pebble.path + "/" + pebble.name +".jade" ) )
      pebble.noLayout = false;
  }

  function run( snippets, snippetType, callback ){

    async.forEach( snippets, recursiv, callback );

    function recursiv( snippet, next ){

      if( snippetType === Type.PEBBLE )
        addDbData( snippets, webpageId, function( dbPebbles ){
          snippet.db = webpageMethods.getElementFromArray( dbPebbles, 'name', snippet.name );
          runSearch( snippet, next ); 
        });
      else
        runSearch( snippet, next );               
    }
  }

  PeRuBbleProcessor.addDbData = function( pebbles, next ){
    async.auto({
      get_search_params: function( callback ){
        var globalSearch = [];
        var webpageSearch = [];
        pebbleList.forEach( function( pebble ){
          if( pebble.options && pebble.options.global === 'true' )
            globalSearch.push( pebble.name );
          else
            webpageSearch.push( pebble.name );
        });
        callback( null, globalSearch, webpageSearch);
      },
      global_search: [ 'get_search_params', function( callback, results ){
        Pebble.find({ name: { $in: results.get_search_params[0] } })
        .exec( function( err, pebbles ){
          if( err ){ callback( err ); }
          callback( null, pebbles );
        });
      }],
      webpage_search: [ 'get_search_params', function( callback, results ){
        Pebble.find({ 
          name: { $in: results.get_search_params[1] }, 
          webpage: webpageId })
        .exec( function( err, pebbles ){
          if( err ){ callback( err ); }
          callback( null, pebbles );
        });
      }]
    }, function( err, results) {
        var pebbles = results.webpage_pebble_search;
        pebbles.concat( results.global_pebble_search );
        next( err, pebbles );
    });
  };

  return PeRuBbleProcessor;

};