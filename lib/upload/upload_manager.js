/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-20 10:48:40
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-20 11:15:57
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = function ( config ) {

  return {
    uploadFile: upload
  };

  function upload( file, destination, callback ){

    target = destination.split("//");

    switch( target[0] ){

      case "ftp": ftpUpload( file, target[1], callback );

      case "file": localUpload( file, target[1], callback );

      default: throw { name: "Upload Error", message: "unknown target: ", target[0] };

    }

  }

  function localUpload( file, path, cb ){
    
  }

}