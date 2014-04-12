/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:32:22
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-12 03:02:54
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

describe( 'Pebble - Rubble - Processor test', function(){

  before( function( done ){
    var test = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      Pebble = caminio.models.Pebble;
      done();
    });
  });

  describe( 'PeRuProcessor', function(){

    it('can be required through the rocksol lib with /lib/pe_ru_bbles/pe_ru_bble_parser', function(){
      testRequire = require('./../../../lib/pe_ru_bble/pe_ru_bble_processor')( caminio );
      expect( testRequire ).to.exist;
    });

    describe( 'required params: ', function(){

      it('caminio', function(){  
        expect( caminio ).to.exist;
      });

    });

    describe( 'methods: ', function(){

      it('getDbPebbles', function(){
        var webpage = new caminio.models.Webpage({ name: 'testpage' });

        PeRuProcessor = require('./../../../lib/pe_ru_bble/pe_ru_bble_processor')( caminio );
        PeRuProcessor.getDbPebbles( [ { name: '1' }, { name: '2' } ], webpage._id, function(){
          console.log("works");
        });

      });


    });

  });

});