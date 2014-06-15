/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-28 11:20:47
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-30 13:52:19
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var helper = require('../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect,
    normalize = require('path').normalize,
    join = require('path').join;

var caminio,
    Pebble;

var path = __dirname + "/../support/content/test_com";

describe( 'Site - File - Manager test', function(){

  before( function( done ){
    var test = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      Pebble = caminio.models.Pebble;
      done();
    });
  });

  describe( 'SiteFileManager', function(){

    it('can be required through the rocksol lib with /lib/site/site_file_manager', function(){
      var MyModule = require('./../../lib/site/site_file_manager');
      expect( MyModule ).to.exist;
    });

    describe( 'required params: ', function(){

      it('caminio', function(){  
        expect( caminio ).to.exist;
      });

    });

    describe( 'methods: ', function(){
      var MyModule,
          myModule;

      before( function(){
        MyModule = require('./../../lib/site/site_file_manager');
      });

      describe('getSettings', function(){

        it( 'works without any given type', function(){
          myModule = new MyModule( path );
          var set = myModule.getSettings();
          expect( set.layoutPath ).to.eq( join( normalize( path ), 'layouts' ) );
          expect( set.publicPath ).to.eq( join( normalize( path ), 'public' ) );
        });

        it( 'detects wrong type directorys and jumps it', function(){
          var type = 'type';
          myModule = new MyModule( path, type );
          var set = myModule.getSettings( path, type );
          expect( set.layoutPath ).to.eq( join( normalize( path ), 'layouts' ) );
          expect( set.publicPath ).to.eq( join( normalize( path ), 'public' ) );
        });

        it( 'works with different layout directory without .settings file', function(){
          var type = 'blog1';
          myModule = new MyModule( path, type );
          var set = myModule.getSettings( path, type );
          expect( set.layoutPath ).to.eq( join( normalize( path ), type, 'layouts' ) );
          expect( set.publicPath ).to.eq( join( normalize( path ), 'public' ) );
        });

        it( 'works with different layout directory and .settings file', function(){
          var type = 'blog';
          myModule = new MyModule( path, type );
          var set = myModule.getSettings( path, type );          
          expect( set.layoutPath ).to.eq( join( normalize( path ), 'layouts' ) );
          expect( set.publicPath ).to.eq( join( normalize( path ), 'public', type ) );
        });

      });

      describe('getDraftPath', function(){

        before( function(){          
          myModule = new MyModule( path );
        });

        it( 'gets an object id', function(){
          var id = '123213123123';
          var draftPath = myModule.getDraftPath( id );
        });

        it( 'returns a paht without extension', function(){
          var id = '123213123123';
          var draftPath = myModule.getDraftPath( id );
        });

      });

      describe('getObjectPath', function(){
        var pages = {};
        var names = ['parent', 'child'];
        var webpage;
        var async = require('async');

        function addWebpage( name, next ){   
          var webpage = new Webpage( { 
            filename: name, 
            status: 'published',
            layout: 'testing',
            translations: [
              { content: 'testcontent', locale: 'en', title: 'title' },
              { content: 'deutsch', locale: 'de', title: 'title' }
            ] 
          } );
          webpage.save( function( err ){
            pages[name] = webpage;
            next();
          });
        }

        before( function( done ){          
          myModule = new MyModule( path );
          async.each( names, addWebpage, function(){
            pages.child.parent = pages.parent._id;
            done();
          });
        });

        it( 'gets an object and its ancestors', function(){
          var objectPath = myModule.getObjectPath( pages.child, [ pages.parent ] );

          console.log( objectPath );
        });

      });


    });

  });

});