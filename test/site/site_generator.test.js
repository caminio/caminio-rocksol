/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-16 00:14:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-27 15:51:01
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

'use strict';

var helper = require('../helper'),
    async = require('async'),
    names = [ 'parent', 'sibling1', 'sibling2', 'child', 'grandchild' ],
    expect = helper.chai.expect,
    pages = {};

var caminio,
    Pebble,
    Webpage,
    user,
    domain;

var pebbleSnippet = "{{ pebble: test }}";
var path = __dirname + "/../support/content/test_com";

describe( 'Site Generator test', function(){

  function addWebpage( name, next ){    
    var webpage = new Webpage( { 
      filename: name, 
      camDomain: domain.id, 
      status: 'published',
      layout: 'testing',
      translations: [
        { content: 'testcontent', locale: 'en', title: 'hello' },
        { content: 'deutsch', locale: 'de', title: 'hello' }
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

    describe('can upload files to another directory on the same server', function(){

      var processor;
      var webpage;
      var gen;

      before( function( done ){
        webpage = new Webpage(
          { filename: 'testpage',
            translations: [
              { content: 'testcontent', locale: 'en', title: 'hello' },
              { content: 'deutsch', locale: 'de', title: 'hello' }
            ]  });

        var SiteGen = require('./../../lib/site/site_generator')( caminio );
        gen = new SiteGen( path, 'shop' );
        done();
      });

      it('works with a webpage', function( done ){
          gen.compileObject( 
            pages[names[0]], 
            { locals: {  currentUser: user, currentDomain: domain }, isPublished: true },
            function( err, content ){
              done();
          });
        });

    })



    describe( 'options: ', function(){
      var processor;
      var webpage;
      var gen;

      before( function( done ){
        webpage = new Webpage(
          { filename: 'testpage',
            translations: [
              { content: 'testcontent', locale: 'en', title: 'hello' },
              { content: 'deutsch', locale: 'de', title: 'hello' }
            ]  });

        var SiteGen = require('./../../lib/site/site_generator')( caminio );
        gen = new SiteGen( path );

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

      describe('compileDeps', function( done ){

        // it('works with a single webpage', function( done ){
        //   gen.compileObject( 
        //     pages[names[0]], 
        //     { locals: {  currentUser: user, currentDomain: domain, compileDeps: ['ancestors'] }, isPublished: true },
        //     function( err, content ){
        //       done();
        //   });
        // });

      });

    });

    describe( 'methods: ', function(){
      var processor;
      var webpage;
      var gen;

      before( function( done ){
        webpage = new Webpage(
          { filename: 'testpage',
            translations: [
              { content: 'testcontent', locale: 'en', title: 'hello' },
              { content: 'deutsch', locale: 'de', title: 'hello' }
            ]  });

        var SiteGen = require('./../../lib/site/site_generator')( caminio );
        gen = new SiteGen( path );

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
        var test1 = "#Heading\n Paragraph text *bold* text.";
        var result1 = "<h1 id=\"heading\">Heading</h1>\n<p> Paragraph text <em>bold</em> text.</p>\n";
        var layout1 = "h1 heading\n !=markdownContent";
        var result2 = "\n<h1>heading<h1 id=\"heading\">Heading</h1>\n<p> Paragraph text <em>bold</em> text.</p>\n\n</h1>";
        var layout2 = "no_content";
        var result3 = "\n<h2>&lt;h1 id=&quot;heading&quot;&gt;Heading&lt;/h1&gt;\n&lt;p&gt; Paragraph text &lt;em&gt;bold&lt;/em&gt; text.&lt;/p&gt;\n</h2>";

        it('works with html formatted text', function( done ){
          gen.compileContent( test1, {  locale: 'en' }, function( err, content ){
            expect( err ).to.be.null;
            expect( content ).to.eq( result1 );
            done();
          });
        });

        it('works with layout content', function( done ){
          gen.compileContent( test1, {  locale: 'en', contentPath: path, layout: { content: layout1 } }, function( err, content ){
            expect( err ).to.be.null;
            expect( content ).to.eq( result2 );
            done();
          });
        });

        it('works with layout file', function( done ){
          gen.compileContent( test1, {  locale: 'en', contentPath: path, layout: { name: 'no_content' } }, function( err, content ){
            expect( err ).to.be.null;
            expect( content ).to.eq( result3 );
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

        it('works with rubble in content', function( done ){
          gen.compileContent( "{{ rubble: this }}", {  
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
          gen.compileObject( 
            pages[names[0]], 
            { locals: {  currentUser: user, currentDomain: domain }, isPublished: true },
            function( err, content ){
              done();
          });
        });


      });

      describe('compileArray', function(){

        it('works with an array of webpages', function( done ){
          gen.compileArray( 
            [ pages[names[0]], pages[names[1]] ],
            { locals: {  currentUser: user, currentDomain: domain }, isPublished: true },
            function( err, content ){
              done();
          });
        });


      });

      describe('compile', function(){

        it('works with an array of webpages', function( done ){
          gen.compile( 
            [ pages[names[0]], pages[names[1]] ],
            { locals: {  currentUser: user, currentDomain: domain }, isPublished: true },
            function( err, content ){
              done();
          });
        });
      });

      describe('compileLayout', function(){
        var gen2;

        before( function( done ){
          webpage = new Webpage(
            { filename: 'testpage',
              translations: [
                { content: 'testcontent', locale: 'en', title: 'hello' },
                { content: 'deutsch', locale: 'de', title: 'hello' }
              ]  });

          var SiteGen = require('./../../lib/site/site_generator')( caminio );
          gen2 = new SiteGen( path, 'lineup' );
          done();
        });

        it('works with a given layout name', function( done ){
          gen.compileLayout(
            'test_layout',
            { locals: {  currentUser: user, currentDomain: domain }, isPublished: true },
            function( err, content ){
              console.log( err, content );
              done();
            });
        });

        it('works with a given layout name and changed layout path', function( done ){
          gen2.compileLayout(
            'test_layout',
            { locals: {  currentUser: user, currentDomain: domain }, isPublished: true },
            function( err, content ){
              console.log( err, content );
              done();
            });
        });

      });


    });

  });

});