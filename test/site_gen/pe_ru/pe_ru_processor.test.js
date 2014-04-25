/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:32:22
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-25 01:10:16
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

    describe( 'required params: ', function(){

      it('pebbleDb', function(){  
        expect( caminio ).to.exist;
      });

    });

    describe( 'methods: ', function(){
      var processor;
      var webpage;
      var pebble;


      var pebbleSnippet = "{{ pebble: test }}";
      var pebbleSnippet2 = "{{ pebble: another test }}";

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

        pebble2 = new Pebble( { 
          name: 'anothertest', 
          translations: [{content: this.pebbleContent, locale: 'en' }, {content: this.pebbleContent, locale: 'de' }],
          webpage: webpage._id 
        });

        pebble.save( function( err ){
          pebble2.save( function( err ){
            done();
          });
        });
      });

      describe('startSearch', function(){

        it('returns the plain content if no pebble or rubble is found', function( done ){
          processor.startSearch( snippets1,{ attr: {  locale: "en", webpage: webpage } }, function( err, content ){
            expect( content ).to.eq( snippets1 );
            expect( err ).to.have.length( 0 );
            done();
          });
        });

        it('returns the content with replaced pebbles if found', function( done ){
          processor.startSearch( pebbleSnippet, { attr: { locale: "en", webpage: webpage } }, function( err, content ){
            done();
          });
        });

        it('works without passed webpage', function( done ){
          processor.startSearch( pebbleSnippet,{ attr: {  locale: "en" } }, function( err, content ){
            //expect( content ).to.eq( "{{ pebble: test Warning: pebble has no db file or is global! }}" );
            expect( err ).to.have.length( 0 );
            done();
          });
        });

        it('works without passed locale', function( done ){
          processor.startSearch( pebbleSnippet,{ attr: { webpage: webpage } }, function( err, content ){
            //expect( content ).to.eq( "<p> a string as pebblecontent</p>" );
            expect( err ).to.have.length( 0 );
            done();
          });
        });

        it('it gives an error if there are two translations and no locale passed', function( done ){
          processor.startSearch( pebbleSnippet2,{ attr: { webpage: webpage } }, function( err, content ){
            expect( err ).to.have.length( 1 );
            done();
          });
        });

        it('it works with a rubble', function( done ){
          processor.startSearch( "{{ rubble: this }}", { attr: { webpage: webpage }, contentPath: path }, function( err, content ){
            expect( err ).to.have.length( 0 );
            done();
          });
        });

      });


    });

  });

});