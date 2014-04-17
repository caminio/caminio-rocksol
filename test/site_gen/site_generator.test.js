/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-16 00:14:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-17 18:23:30
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var helper = require('../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect;

var PeRuProcessor,
    caminio,
    Pebble;

var snippets1 = "PLAIN TEXT";
var rubbleSnippet = "{{ rubble: iAmRubble }}";
var pebbleSnippet = "{{ pebble: test }}";
var snippets2 = " {{ pebble: iAmPebble }} {{ rubble: iAmRubble }} {{ missmach: iAmMissmatch }}";
var path = __dirname + "/../support/content/test_com";

describe( 'Site Generator test', function(){

  before( function( done ){
    var test = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      Pebble = caminio.models.Pebble;
      done();
    });
  });

  describe( 'SiteGen', function(){

    it('can be required through the rocksol lib with /lib/pe_ru_bbles/pe_ru_bble_parser', function(){
      // testRequire = require('./../../../lib/pe_ru_bble/pe_ru_bble_processor')( caminio );
      // expect( testRequire ).to.exist;
    });

    describe( 'required params: ', function(){

      // it('pebbleDb', function(){  
      //   expect( caminio ).to.exist;
      // });

    });

    describe( 'methods: ', function(){
      var processor;
      var webpage;

      before( function( done ){
        webpage = new caminio.models.Webpage({ name: 'testpage' });

        SiteGen = require('./../../lib/site_generator');

        gen = new SiteGen( {}, caminio );

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

      describe('compileContent', function(){

        it('works with plain text', function( done ){
          gen.compileContent( snippets1, {  locale: 'en', contentPath: path }, function( err, content ){
            console.log( 'DONE', err, content );
            done();
          });
        });

        it('works with layout content', function( done ){
          gen.compileContent( snippets1, {  locale: 'en', contentPath: path, layout: { content: 'h1=markdownContent' } }, function( err, content ){
            console.log( 'DONE', err, content );
            done();
          });
        });

        it('works with layout file', function( done ){
          gen.compileContent( snippets1, {  locale: 'en', contentPath: path, layout: { name: 'no_content' } }, function( err, content ){
            console.log( 'DONE', err, content );
            done();
          });
        });

        


      });


    });

  });

});