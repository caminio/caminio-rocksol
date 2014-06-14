/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-20 11:19:55
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-20 16:34:58
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var uploadManager = require('./../../lib/upload/upload_manager')();

var helper = require('../helper'),
    fs = require('fs'),
    expect = helper.chai.expect,
    normalize = require('path').normalize,
    join = require('path').join;

var caminio,
    user,
    domain;

describe('upload manager test', function() {

  before( function( done ){
    var test = this;
    helper.initApp( this, function(){ 
      caminio = helper.caminio;
      helper.cleanup( caminio, function(){
        helper.getDomainAndUser( caminio, function( err, u, d ){
          user = u;
          domain = d;
          test.agent.post( helper.url+'/login' )
          .send({ username: user.email, password: user.password })
          .end( function(err,res){

            var file = normalize( __dirname + '/../support/upload_files/file1' );
            var old = normalize( __dirname + '/../support/upload_destination/file1' );

            try{

              if( !fs.existsSync( file ) )
                fs.readFile( old, function(err, data) {
                  fs.writeFile(file, data, function(err) {
                    fs.unlink(old, function(){
                     if( err ) console.log('error while unlinking file: ' + err );
                      done();
                    });
                  }); 
                });
              else
                done();
            } catch( ex ){
              console.log(ex);
              done();
            }

          });
        });
      });
    });
  });


  it('throws exception if filepath is not valid', function( done ){

    var file = normalize( __dirname + '/../support/upload_files/file1' );
    var target = domain.remoteAddr;

    try{

      uploadManager.uploadFile( file, target, function( err ){
        console.log('done', err );
        done();
      })
    } catch( ex ){
      console.log(ex);
      expect( ex ).to.exist;
      done();
    }

  });

});
