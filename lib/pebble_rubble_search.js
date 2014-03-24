/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 17:34:45
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-24 11:37:56
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

module.exports = function( caminio ) {
  var Webpage    = caminio.models.Webpage;
  var Pebble     = caminio.models.Pebble;
  var genMethods = require('./gen_methods')( caminio );

  var first;
  var path;
  var attributes;
  var content;

  return {
    init: initSearch,
    run: runSearch
  };

 function initSearch(  path_, attributes_, done ){
    first = true;
    content = attributes_.translation.content;
    path = path_;
    attributes = attributes_;
    runSearch( content, done );
  }

  function runSearch( data, done ){
    var list = [];
    var pebbles = [];
    var rubbles = [];

    var localContent = '';

    if( data.translations || first )
      localContent = first ? 
        data : 
        genMethods.getElementFromArray( data.translations, 'locale', attributes.translation.locale ).content;

    var snippets = localContent.match(/{{[^{}]*}}/g);

    if( snippets && snippets.length ){
      first = false;
      snippets.forEach( function( snippet ){
        addToList( snippet );
      });

      if( pebbles && pebbles.length ){
        processPebbles( list, end );
      }

      if( rubbles && rubbles.length ){
        processRubbles( list, end );
      }

    } else if( first ){
      end();
    } else {      
      finish( data.meta, localContent, done );
    }

    function end(){
      return done( null, content );
    }

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
      }

      if( name.match( rubbleRegexp ) ){
        addValues( rubbles );
      }

      function addValues( type ){        
        name = name.split(':')[1];
        type.push( name );
        snippet.name = name;
        options.shift();
        snippet.options = writeOptions( options );
        list.push( snippet );
      }

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

  function finish( snippet, localContent, next ){
    attributes.markdownContent = markdown.toHTML( localContent );
    var expr =  new RegExp( snippet.orig, 'g');
    genMethods.runJS( snippet.path + snippet.name +".js", attributes, function(){
      content = content.replace( expr, 
        genMethods.compileJade( snippet.path + "/" + snippet.name +".jade", attributes )
      );
      next(); 
    });
  }

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
        arr.concat( pebbles );
        next( null, arr );
      });      
    }
      
    function run( err, pebbles ){
      if( err ){ console.log('ohoh'); } // TODO
      async.forEach( pebbles, recursiv, cb );

      function recursiv( pebble, next ){
        pebble.meta = genMethods.getElementFromArray( list, 'name', pebble.name );
        pebble.meta.path = path + "/pebbles/" + pebble.name + "/";
        runSearch( pebble, next );               
      }
      
    }
  }

  function processRubbles( list, cb ){
    async.forEach( list, recursiv, cb );

    function recursiv( rubble, next ){
      rubble.meta = rubble;
      rubble.meta.path = path + "/rubbles/" + rubble.name + "/";
      runSearch( rubble, next );               
    }
  }

  function setOptions( options ){
    return  "TODO";
  }

  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

};
