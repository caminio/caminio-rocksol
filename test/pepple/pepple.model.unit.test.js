/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 00:31:23
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-21 10:23:02
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

/*
 * caminio-rocksol
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 03/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var helper = require('../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect,
    caminio,
    Pebble;

var pebble;

var attributes = [];

describe( 'Pebble', function(){

  before( function(done){
    helper.initApp( this, function(){ 
      caminio = helper.caminio;
      Pebble = caminio.models.Pebble;
      pebble = new Pebble({ name: 'test' });
      done();
    });
  });

  describe( 'attributes', function(){

    before( function(){
      Pebble.schema.eachPath(function(value){
        attributes.push(value);
        console.log(value);
        cb()
      });
    });

    function cb(){
      for( i in attributes ){
       console.log(i); 
      it('has', function(){
        console.log('inside');
    });
      }

    }

  })



  // it('is valid', function( done ){
  //   var pebble = new Pebble({ name: 'test'});
  //   console.log( pebble );
  //   pebble.validate( 
  //    function( err ){
  //      expect( err ).to.not.exist;
  //      done();
  //   });
  // });

  // // Pebble.schema.eachPath(function(value){
  // //   it('has .' + value, function(){
  // //     console.log('there');
  // //   });
  // // });

  // describe( 'attributes', function(){

  // });
});