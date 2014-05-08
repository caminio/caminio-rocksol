/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-07 19:53:10
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-08 14:39:20
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */


/**
 *
 *
 *
 *
 */
module.exports = function ( config ) {

  return {
    push: pushToServer,
    pull: pullFromServer,
    list: listServerFiles
  };

  function pushToServer( dirOrFile ){

  }

  function pullFromServer( directory ){

  }

  function listServerFiles(){
    
  }

};