/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 17:34:45
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-25 10:42:17
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs       = require('fs');
var jade     = require('jade');
var async    = require('async');
var markdown = require( "markdown" ).markdown;

var rubbleRegexp = /[Rr][Uu][Bb][Bb][Ll][Ee](:|( :))/;
var pebbleRegexp = /[Pp][Ee][Bb][Bb][Ll][Ee](:|( :))/;

/**
 *  Searches and replaces all rubbles and pebbles
 *  occuring in the content and in the layout
 *  @class PebbleRubbleSearch
 *  @param caminio
 */
module.exports = function( caminio ) {
  var Webpage    = caminio.models.Webpage;
  var Pebble     = caminio.models.Pebble;
  var webpageMethods = require('./webpage_methods')( caminio );

  var first;
  var path;
  var attributes;
  var content;

  return {
    init: initSearch
  };

  /**
   *  Initializes and starts the search 
   *  @method initSearch
   *  @param path_ the path to the layout and js files
   *  @param attributes_ the attributes of the current webpage
   *  @param attributes_.webpage the current webpage
   */
  function initSearch(  path_, attributes_, done ){
    first = true;
    content = attributes_.translation.content;
    path = path_;
    attributes = attributes_;
    runSearch( content, done );
  }

  /**
   *
   *  @method runSearch
   *  @param data
   *  @param done the callback function where the content
   *              is passed to
   */
  function runSearch( data, done ){
    var list = [];
    var pebbles = [];
    var rubbles = [];
    var noSyntaxMatch = [];

    var localContent = '';
    if(( data.translations && data.translations.length > 0 ) || first ){
      localContent = first ? 
        data : 
        webpageMethods.getElementFromArray( 
          data.translations, 
          'locale', 
          attributes.translation.locale ).content;
    }

    var snippets = localContent.match(/{{[^{}]*}}/g);
    if( snippets && snippets.length ){
      first = false;
      snippets.forEach( function( snippet ){
        addToList( snippet );
      });

      async.waterfall(
        [
          checkForPebbles,
          checkForRubbles
        ],
        checkForSyntaxError
      );

    } else if( first ){
      end();
    } else {  
      finish( data, localContent, done );
    }
    
    /** 
     *  @method checkForPebbles
     *
     */
    function checkForPebbles( next ){
      if( pebbles && pebbles.length )
        processPebbles( list, next ); 
      else 
        next();       
    }
    
    /** 
     *  @method checkForRubbles
     *
     */
    function checkForRubbles( next ){

      if( rubbles && rubbles.length )
        processRubbles( list, next );
      else
        next();
    }
    
    /** 
     *  @method checkForSyntaxError
     *
     */
    function checkForSyntaxError( err, param ){
      end();
      // TODO 
      //   if( noSyntaxMatch && noSyntaxMatch.length )
      //     end();
      // console.log(done);
    }

    /**
     *  Is called when the search and replace
     *  is complete and everything took place
     *  without an error
     *  @method end
     *  @ return done( null, content ) 
     */
    function end(){
      return done( null, content );
    }

    /**
     *  Checks the snippets for rubbles and pebbles
     *  @method addToList
     *  @param original the original snippet without 
     *                  any transformation, its saved
     *                  to replace it afterwards
     */
    function addToList( original ){
      var snippet = {
        orig: original
      };
      var options = original.replace('{{','').replace('}}','');
      options = replaceAll(" ", "", options);
      options = options.split(',');
      var name = options[0];

      if( name.match( pebbleRegexp ) ){
        addValues( pebbles );
      } else if( name.match( rubbleRegexp ) ){
        addValues( rubbles );
      } else {
        noSyntaxMatch.push( original );
      }

      /**
       *  @method addValues
       *  @param type either pebble or rubble
       */
      function addValues( type ){        
        name = name.split(':')[1];
        type.push( name );
        snippet.name = name;
        options.shift();
        snippet.options = writeOptions( options );
        list.push( snippet );
      }

      /**
       *  Writes the options into a hash object
       *  @method writeOptions
       *  @param arr
       *  @return hash the hash object with the options
       */
      function writeOptions( arr ){
        var hash = {};
        arr.forEach( function( element ){
          var split = element.split("=");
          hash[split[0]] = split[1];
        });
        return hash;
      }

    }
  }

  /** 
   *
   *  @method finish
   *  @param data
   *  @param localContent
   *  @param next
   */
  function finish( data, localContent, next ){
    var snippet = data.meta;
    attributes.markdownContent = markdown.toHTML( localContent );
    var expr =  new RegExp( snippet.orig, 'g');
    webpageMethods.runJS( data, snippet.path + '/' + snippet.name +".js", attributes, function(){
      content = content.replace( expr, 
        webpageMethods.compileJade( snippet.path + "/" + snippet.name +".jade", attributes )
      );
      next(); 
    });
  }

  /**
   *  @method processPebbles
   *  @param list
   *  @param cb
   */
  function processPebbles( list, cb ){
    var webpageSearch = [];
    var globalSearch = [];

    async.waterfall(
      [
        getSearchParams,
        findGlobalPebbles,
        findWebpagePebbles,
      ],
      run
    );

    function getSearchParams( next ){
      list.forEach( function( element ){
        if( element.options && !element.options.global )
          webpageSearch.push( element.name );
        else if( element.options.global === 'true' )
          globalSearch.push( element.name );
        else
          webpageSearch.push( element.name );
      });
      next();
    }

    function findGlobalPebbles( next ){
      Pebble.find({ name: { $in: globalSearch } })
      .exec( function( err, pebbles ){
        if( err ){ next( err ); }
        next( null, pebbles );
      });
    }

    function findWebpagePebbles( arr, next ){
      Pebble.find({ name: { $in: webpageSearch }, webpage: attributes.webpage._id })
      .exec( function( err, pebbles ){
        if( err ){ next( err ); }
        var result = arr.concat( pebbles );
        next( null, result );
      });      
    }
      
    function run( err, pebbles ){
      if( err ){ console.log('ohoh'); } // TODO
      async.forEach( pebbles, recursiv, cb );

      function recursiv( pebble, next ){
        pebble.meta = webpageMethods.getElementFromArray( list, 'name', pebble.name );
        pebble.meta.path = path + "/pebbles/" + pebble.name;
        runSearch( pebble, next );               
      }
      
    }
  }

  function processRubbles( list, cb ){
    async.forEach( list, recursiv, cb );

    function recursiv( rubble, next ){
      rubble.meta = rubble;
      rubble.meta.path = path + "/rubbles/" + rubble.name;
      runSearch( rubble, next );               
    }
  }

  /**
   * BIG TODO
   */
  function setOptions( options ){
    return  "TODO";
  }

  /**
   *  Replaces all strings in another string
   *  @method replace All
   *  @param find
   *  @param replace
   *  @param str
   */
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

};
