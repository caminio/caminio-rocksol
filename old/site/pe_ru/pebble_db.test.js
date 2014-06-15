/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 21:05:55
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-14 01:24:08
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */


var helper = require('../../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect;

var PeRuProcessor,
    caminio,
    Pebble;

var snippets1 = " {{ pebble: iAmPebble }} {{ rubble: iAmRubble }} {{ missmach: iAmMissmatch }}";

describe( 'Pebble - Db test', function(){

  before( function( done ){
    var test = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      Pebble = caminio.models.Pebble;
      done();
    });
  });

  describe( 'PebbleDb', function(){

    it('can be required through the rocksol lib with /lib/pe_ru_bbles/pebble_db', function(){
      var MyModule = require('./../../../lib/pe_ru_bble/pebble_db');
      expect( MyModule ).to.exist;
    });

    describe( 'required params: ', function(){

      it('caminio', function(){  
        expect( caminio ).to.exist;
      });

    });

    describe( 'methods: ', function(){

      describe('getData', function(){

        it( 'is called with ', function( done ){
          var webpage = new caminio.models.Webpage({ name: 'testpage' });
          var MyModule = require('./../../../lib/pe_ru_bble/pebble_db');
          var myModule = new MyModule( caminio );
          myModule.getData( [ { name: '1' }, { name: '2' } ], webpage._id, function( err, pebbles){
            expect( pebbles ).to.have.length( 0 );
            expect( err ).to.be.null;
            done();
          });
        });
      });

    });

  });

});