/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 11:03:15
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 14:20:48
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

  var names = [];
  var list = [];

  return {
    findPebbles: findPebbles,
    regex: /[Pp][Ee][Bb][Bb][Ll][Ee](:|( :))/,
    names: names,
    list: list
  };

 

  function findPebbles( pebbleNames, list, done ){
    Pebble.find({ name: { $in: pebbleNames }})
    .exec( function( err, pebbles ){
      async.forEach( pebbles, doing, ending );

      function doing( pebble, next ){
        pebble.meta = genMethods.getElementFromArray( list, 'name', pebble.name );//TODO
        genMethods.searchPebbleAndRubble( pebble, next );               
      }

      function ending(){
        done( null, content );
      }
      
    });
  }

  function setOptions( options ){
    return  "file head" + "\n";
  }
};