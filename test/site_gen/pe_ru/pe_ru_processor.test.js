/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:32:22
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-18 01:30:40
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
    Pebble,
    Webpage;

var snippets1 = "PLAIN TEXT";
var rubbleSnippet = "{{ rubble: iAmRubble }}";
var pebbleSnippet = "{{ pebble: test }}";
var snippets2 = " {{ pebble: iAmPebble }} {{ rubble: iAmRubble }} {{ missmach: iAmMissmatch }}";
var path = __dirname + "/../../support/content/test_com";

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
      // testRequire = require('./../../../lib/pe_ru_bble/pe_ru_bble_processor')( caminio );
      // expect( testRequire ).to.exist;
    });

    describe( 'required params: ', function(){

      it('pebbleDb', function(){  
        expect( caminio ).to.exist;
      });

    });

    describe( 'methods: ', function(){
      var processor;
      var webpage;
      var pebble;

      before( function( done ){
        webpage = new caminio.models.Webpage({ name: 'testpage' });

        PeRuProcessor = require('./../../../lib/pe_ru_bble/pe_ru_bble_processor');
        processor = new PeRuProcessor( caminio, path );

        this.pebbleContent = ' a string as pebblecontent';
        pebble = new Pebble( { 
          name: 'test', 
          translations: [{content: this.pebbleContent, locale: 'en', layout: 'pebble' }],
          webpage: webpage._id 
        });
        pebble.save( function( err ){
          done();
        });
      });

      describe('startSearch', function(){

        it('returns the plain content if no pebble or rubble is found', function( done ){
          processor.startSearch( { translation: { content: snippets1, locale: "en" }, webpage: webpage }, function( err, content ){
            expect( content ).to.eq( snippets1 );
            expect( err ).to.be.null;
            done();
          });
        });

        it('returns the content with replaced pebbles if found', function( done ){
          processor.startSearch( { translation: { content: pebbleSnippet, locale: "en" }, webpage: webpage }, function( err, content ){
            console.log( "the return: ", content, err );
            done();
          });
        });

        // it('gets an error if a defined rubble does not exist', function( done ){
        //   var webpage = new caminio.models.Webpage({ name: 'testpage' });
        //   var MyModule = require('./../../../lib/pe_ru_bble/pebble_db');
        //   var myModule = new MyModule( caminio );

        //   PeRuProcessor = require('./../../../lib/pe_ru_bble/pe_ru_bble_processor')( myModule, "/a/path" );
        //   PeRuProcessor.startSearch( { translation: { content: rubbleSnippet }, webpage: webpage }, function( err, content ){
        //     console.log('he');
        //     done();
        //   });
        // });

      });


    });

  });

});