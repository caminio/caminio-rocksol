/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 17:34:45
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 19:05:38
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs    = require('fs');
var jade  = require('jade');
var async = require('async');
var markdown    = require( "markdown" ).markdown;

module.exports = function( caminio ) {
  var Webpage = caminio.models.Webpage;
  var Pebble = caminio.models.Pebble;
  var genMethods = require('./gen_methods')( caminio );

  var first;
  var path;
  var attributes;
  var locale;
  var content;

  var rubbleRegexp = /[Rr][Uu][Bb][Bb][Ll][Ee](:|( :))/;
  var pebbleRegexp = /[Pp][Ee][Bb][Bb][Ll][Ee](:|( :))/;

  return {
    init: initSearch,
    run: runSearch
  };

 function initSearch( translation, path_, attributes_, done ){
    first = true;
    locale = translation.locale;
    content = translation.content;
    path = path_;
    attributes = attributes_;
    runSearch( content, done );
  }

  function runSearch( data, done ){
    var list = [];
    var pebbles = [];
    var rubbles = [];
    var localContent = first ? 
      data : 
      genMethods.getElementFromArray( data.translations, 'locale', locale ).content;

    var snippets = localContent.match(/{{[^{}]*}}/g);

    if( snippets && snippets.length ){
      first = false;

      snippets.forEach( function( snippet ){
        addToList( snippet );
      });

      if( pebbles && pebbles.length ){
        processPebbles( pebbles, list, end );
      }

      if( rubbles && rubbles.length ){
        findPebbles( list, end );
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
      var options = original.replace('{{','').replace('}}','').split(',');
      var name = options[0];

      if( name.match( pebbleRegexp ) ){
        addValues( pebbles );
      }

      if( name.match( rubbleRegexp ) ){
        addValues( rubbles );
      }

      function addValues( type ){        
        name = name.split(':')[1];
        name = replaceAll(" ", "", name );
        type.push( name );
        snippet.name = name;
        options.shift();
        snippet.options = options;
        list.push( snippet );
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

  function processPebbles( pebbleNames, list, cb ){
    Pebble.find({ name: { $in: pebbleNames } })
    .exec( function( err, pebbles ){
      async.forEach( pebbles, recursiv, cb );

      function recursiv( pebble, next ){
        pebble.meta = genMethods.getElementFromArray( list, 'name', pebble.name );
        pebble.meta.path = path + "/pebbles/" + pebble.name + "/";
        runSearch( pebble, next );               
      }
      
    });
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
