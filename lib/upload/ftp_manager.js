/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-07 19:53:10
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-08 14:55:08
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var Client = require('ftp');
var fs     = require('fs');

/**
 *
 *
 *
 *
 */
module.exports = function ( config ) {
  
  var client = new Client(); 

  return {
    push: pushToServer,
    pull: pullFromServer,
    list: listServerFiles
  };

  function pushToServer( dirOrFile ){


  }

  function pullFileFromServer( file, localDir ){
    runAction( function(){

      client.get( file, function( err, stream ) {
        if( err ) throw err; 
        stream.once( 'close', function() { client.end(); });
        stream.pipe( fs.createWriteStream( file ) ); // TODO
      });

    });
  }

  function listServerFiles(){

  }

  function runAction( action ){

    config = config || {};

    client.on('ready', action );

    client.connect( config );

  }

};