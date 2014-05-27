/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-20 10:48:40
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-27 18:03:33
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

'use strict';

var fs = require('fs'); 
var join = require('path').join;

module.exports = function ( config ) {

  return {
    uploadFile: upload
  };

  function upload( file, destination, callback ){
    if( !fs.existsSync( file ) )
      throw error( "file does not exist");

    var target = destination.split("//");

    if( target.size < 2 )
      throw error( "invalid destination format" );

    switch( target[0] ){

      case "ftp:": ftpUpload( file, target[1], callback ); break;

      case "file:": localUpload( file, target[1], callback ); break;

      default: throw error( "unknown target: " + target[0] );

    }

  }

  function localUpload( file, path, cb ){
    if( !fs.existsSync( path ) )
      throw error( "local path does not exist" );

    var newFile = join( path, file.split('/').pop() );

    fs.readFile(file , function(err, data) {
      fs.writeFile(newFile, data, function(err) {
        fs.unlink(file, function(){
          if( err ) throw error('error while unlinking file: ' + err );
          cb( null );
        });
      }); 
    });
  }

  function error( message ){
    return { name: "Upload Error", details: message };
  }

}