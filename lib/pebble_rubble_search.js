/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 17:34:45
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 18:32:39
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
    var names = [];
    var localContent = first ? 
      data : 
      genMethods.getElementFromArray( data.translations, 'locale', locale ).content;

    var snippets = localContent.match(/{{[^{}]*}}/g);

    if( snippets && snippets.length ){
      first = false;

      snippets.forEach( function( snippet ){
        addToList( snippet );
      });

      if( names && names.length ){
        findPebbles( names, list, end );
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
        name = name.split(':')[1];
        name = replaceAll(" ", "", name );
        names.push( name );
        snippet.name = name;
        options.shift();
        snippet.options = options;
        list.push( snippet );
      }

    }
  }

  function finish( snippet, localContent, next ){
    attributes.markdownContent = markdown.toHTML( localContent );
    var expr =  new RegExp(snippet.orig,'g');
    var there = path + snippet.name +".js";
    genMethods.runJS( there, null, function(){
      content = content.replace( expr, 
        genMethods.compileJade( path + "/" + snippet.name +".jade", attributes )
      );
      next(); 
    });
  }

  function findPebbles( pebbleNames, list, cb ){
    Pebble.find({ name: { $in: pebbleNames } })
    .exec( function( err, pebbles ){
      async.forEach( pebbles, doing, cb );

      function doing( pebble, next ){
        pebble.meta = genMethods.getElementFromArray( list, 'name', pebble.name );

        runSearch( pebble, next );               
      }
      
    });
  }

  function setOptions( options ){
    return  "file head" + "\n";
  }

  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

};
