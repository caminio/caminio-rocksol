/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 11:03:15
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-21 12:56:13
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var pebbleGen = {};

pebbleGen.run = function ( caminio, content, done ){
  pebble = content.match()
  console.log(content, 'we are inside');
  done( content );

}

module.exports = pebbleGen;