/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-14 01:23:59
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-14 15:25:19
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var helper = require('../../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect;

var PeRuCompiler,
    caminio,
    Pebble,
    Methods;

var snippets1 = " {{ pebble: iAmPebble }} {{ rubble: iAmRubble }} {{ missmach: iAmMissmatch }}";
var rubbleSnippet = " {{ rubble: this }} ";

describe( 'Pebble - Rubble - Compiler test', function(){

  before( function( done ){
    var test = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      Pebble = caminio.models.Pebble;
      Methods = require('./../../../lib/webpage_methods')( caminio );
      done();
    });
  });

  describe( 'PeRuCompiler', function(){

    it('can be required through the rocksol lib with /lib/pe_ru_bbles/pebble_db', function(){
      var PeRuCompiler = require('./../../../lib/pe_ru_bble/pe_ru_bble_compiler');
      expect( PeRuCompiler ).to.exist;
    });

    describe( 'required params: ', function(){

      it('methods', function(){  
        expect( Methods ).to.exist;
      });

    });

    describe( 'methods: ', function(){

      describe('compileSnippet', function(){
        var compiler;
        var pebble;

        before( function( done ){
          var PeRuCompiler = require('./../../../lib/pe_ru_bble/pe_ru_bble_compiler');
          compiler = new PeRuCompiler( { 
            translation: { locale: 'en' } }, Methods );
          this.pebbleContent = ' a string as pebblecontent';
          pebble = new Pebble( { 
            name: 'test', 
            translations: [{content: this.pebbleContent, locale: 'en', layout: 'pebble' }] 
          });

          pebble2 = new Pebble( { 
            name: 'another', 
            translations: [{content: this.pebbleContent, locale: 'en', layout: 'pebble' }] 
          });
          pebble.save( function( err ){
            pebble2.save( function( err ){
              done();
            });
          });
        });

        it( 'works with a rubble', function( done ){
          compiler.compileSnippet( { 
            original: '{{ rubble: this }}', 
            params: {},
            path:  __dirname + '/../../support/content/test_com/rubbles/this/',
            name: "this"
          }, function( err, content){
            expect( content ).to.eq( " h1 i am a rubble");
            expect( err ).to.be.null;
            done();
          });
        });

        it( 'gives a warning if the rubble has no jade file', function( done ){
          compiler.compileSnippet( { 
            original: '{{ rubble: this }}', 
            params: {},
            path:  __dirname + '/../../support/content/test_com/rubbles/that/',
            name: "this"
          }, function( err, content){
            expect( content ).to.eq( "{{ rubble: this  Warning: could not find rubble in filesystem }}");
            expect( err ).to.not.be.null;
            done();
          });
        });

        it( 'works with a pebble with jade file', function( done ){
          compiler.compileSnippet( { 
            original: '{{ pebble: test }}', 
            params: {},
            path:  __dirname + '/../../support/content/test_com/pebbles/test/',
            db: pebble,
            type: "pebble",
            name: "test"
          }, function( err, content){   
            expect( content ).to.eq( "\n<h1>we are pebble</h1><p> a string as pebblecontent</p>");
            expect( err ).to.be.null;
            done();
          });
        });

        it( 'works with a pebble without jade file', function( done ){
          compiler.compileSnippet( { 
            original: '{{ pebble: another }}', 
            params: {},
            path:  __dirname + '/../../support/content/test_com/pebbles/another/',
            db: pebble2,
            type: "pebble",
            name: "another"
          }, function( err, content){   
            expect( content ).to.eq( "<p> a string as pebblecontent</p>" );
            expect( err ).to.be.null;
            done();
          });
        });

      });

    });

  });

});