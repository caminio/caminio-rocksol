/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 11:03:15
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 12:28:37
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs = require('fs');

var pebbleGen = {};
var pebbleRegex = /[Pp][Ee][Bb][Bb][Ll][Ee](:|( :))/;

/**
 *  @class pebbleGen
 *  Generates the code for pebble bindings in the content.
 *  Calls also ( if existing ) the defined scripts of the
 *  pebble.
 *
 *  @param caminio Instance of caminio
 *  @param content
 */

module.exports = function ( caminio ){
 
  var genMethods  = require('./gen_methods')( caminio );

  return {
    lookForPebbles: lookForPebbles,
  };

 function lookForPebbles( translation, path, options, done ){

    var rubbleRegex = /[Rr][Uu][Bb][Bb][Ll][Ee](:|( :))/;
    var first = true;
    var locale = translation.locale;
    var content = translation.content;
    work( content, done );

    function work( pebble, cb ){
      var pebbleNames = [];
      var pebbleList = [];
      if( !first )
        translation = genMethods.getElementFromArray( pebble.translations, 'locale', locale );
      var localContent = translation.content;
      var pebbles = localContent.match(/{{[^{}]*}}/g);

      if( pebbles && pebbles.length ){
        pebbles.forEach( function( pebble ){
          addToList( pebble );
        });

        first = false;
        findPebbles( pebbleNames, pebbleList, done );
      } else if( first ){
        done( content );
      } else {      
        finish( pebble.meta, localContent, cb );
      }

      function addToList( thePebble ){
        var currPebble = {};
        currPebble.old = thePebble;
        thePebble = thePebble.replace('{{','').replace('}}','');
        var options = thePebble.split(',');
        var name = options[0];
        if( name.match( pebbleRegex ) ){
          name = name.split(':')[1].replace(" ", "");
          pebbleNames.push( name );
          currPebble.name = name;
          options.shift();
          currPebble.options = options;
          pebbleList.push( currPebble );
        }
      }
    }

    function findPebbles( pebbleNames, list, done ){
      Pebble.find({ name: { $in: pebbleNames }})
      .exec( function( err, pebbles ){
        async.forEach( pebbles, doing, ending );

        function doing( pebble, next ){
          pebble.meta = genMethods.getElementFromArray( list, 'name', pebble.name );//TODO
          work( pebble, next );               
        }

        function ending(){
          done( content );
        }
        
      });
    }

    function finish( pebble, localContent, next ){
      options.markdownContent = markdown.toHTML( localContent );
      var there = path + pebble.name +".js";
      genMethods.runJS( there, null, function(){
        content = content.replace( pebble.old, 
          genMethods.compileJade( path + "/" + pebble.name +".jade", options )
        );
        next(); 
      });
    }
  }

  function setOptions( options ){
    return  "file head" + "\n";
  }
};