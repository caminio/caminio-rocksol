/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-16 00:14:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-23 13:32:40
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var helper = require('../helper'),
    async = require('async'),
    fixtures = helper.fixtures,
    names = [ 'parent', 'sibling1', 'sibling2', 'child', 'grandchild' ],
    expect = helper.chai.expect,
    pages = {};

var PeRuProcessor,
    caminio,
    Pebble,
    Webpage,
    user,
    domain;

var snippets1 = "#Heading\n Paragraph text *bold* text.";
var rubbleSnippet = "{{ rubble: iAmRubble }}";
var pebbleSnippet = "{{ pebble: test }}";
var pebble2Snippet = "{{ pebble: test2 }}";
var snippets2 = " {{ pebble: iAmPebble }} {{ rubble: iAmRubble }} {{ missmach: iAmMissmatch }}";
var path = __dirname + "/../support/content/test_com";

describe( 'Site Generator test', function(){

  function addWebpage( name, next ){    
    var webpage = new Webpage( { 
      name: name, 
      camDomain: domain.id, 
      status: 'published',
      layout: 'testing',
      translations: [{content: 'testcontent', locale: 'en'},
                     { content: 'deutsch', locale: 'de'}
      ] 
    } );
    webpage.save( function( err ){
      pages[name] = webpage;
      next();
    });
  }

  before( function( done ){
    var akku = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      Pebble = caminio.models.Pebble;
      helper.cleanup( caminio, function(){
        helper.getDomainAndUser( caminio, function( err, u, d ){
          user = u;
          domain = d;
          akku.agent.post( helper.url+'/login' )
          .send({ username: user.email, password: user.password })
          .end(function(err,res){
            akku.agent.get( helper.url+'/website/available_layouts')
            .end( function( err, res ){
              async.forEach( names, addWebpage, done );
            });
          });
        });
      });
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
      var gen;

      before( function( done ){
        webpage = new Webpage({ name: 'testpage' });

        var SiteGen = require('./../../lib/site_generator');
        gen = new SiteGen( {}, caminio );

        this.pebbleContent = ' a string as pebblecontent';
        var pebble = new Pebble( { 
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
            expect( err ).to.be.null;
            expect( content ).to.eq( snippets1 );
            done();
          });
        });

        it('works with layout content', function( done ){
          gen.compileContent( snippets1, {  locale: 'en', contentPath: path, layout: { content: 'h1 heading\n !=markdownContent' } }, function( err, content ){
            expect( err ).to.be.null;
            console.log(' herer', content  );
            expect( content ).to.eq( "\n<p>"+snippets1+"</p>" );
            done();
          });
        });

        it('works with layout file', function( done ){
          gen.compileContent( snippets1, {  locale: 'en', contentPath: path, layout: { name: 'no_content' } }, function( err, content ){
            expect( err ).to.be.null;
            expect( content ).to.eq( "\n<h2>"+snippets1+"</h2>" );
            done();
          });
        });

        it('works with pebble in content', function( done ){
          gen.compileContent( pebbleSnippet, {  
            locale: 'en', 
            contentPath: path, 
            layout: { name: 'no_content' },
            webpage: webpage }, function( err, content ){
            expect( err ).to.be.null;
            done();
          });
        });

      });

      describe('compileObject', function(){

        it('works with a webpage', function( done ){
          gen.compileObject( pages[names[0]], {  locale: 'en', contentPath: path }, function( err, content ){
            console.log( err, content, 'DONE');
            done();
          });
        });


      });


    });

  });

});