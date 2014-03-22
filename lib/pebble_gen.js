/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 11:03:15
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-22 15:25:11
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
pebbleGen.run = function ( caminio, content, path, done ){
  
  work( content, path, content, done );

  function work( content, path, newContent, next ){
    console.log('there', content);
    pebbles = newContent.match(/{{[^{}]*}}/g);
    if( pebbles ){
      pebbles.forEach( function( pebble ){
        pebble = pebble.replace('{{','').replace('}}','');
        var options = pebble.split(',');
        var name = options[0];
        options.shift();

        if( name.match( pebbleRegex ) ){
          var newContent = setOptions( options );

          if( fs.existsSync(jsFile) ){
            var js = require(jsFile)(caminio);
            js.run( options );
          }

          name = name.split(':')[1].replace(" ", "");
          newContent += fs.readFileSync( path + "/" + name +".jade", { encoding: 'utf8' });
          content = content.replace( "{{" + pebble + "}}", newContent );
          work( content, path, newContent, next );
        }
      });
    }

    next( content ); 
  }

  function setOptions( options ){
    return  "file head" + "\n";
  }
}

module.exports = pebbleGen;