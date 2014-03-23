/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 00:36:26
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 00:36:29
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

 module.exports = function( caminio ) {

  return {
    run: function( options, next ){
      console.log('in the run function');
      next();
    }
  }

}
