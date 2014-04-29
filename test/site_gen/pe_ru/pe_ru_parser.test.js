/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 00:44:55
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-12 21:05:26
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */
var helper = require('../../helper'),
    expect = helper.chai.expect;

var PeRuParser,
    caminio,
    Pebble;

var snippets1 = " {{ pebble: iAmPebble }} {{ rubble: iAmRubble }} {{ missmach: iAmMissmatch }}";

describe( 'Pebble - Rubble - Parser test', function(){

  before( function( done ){
    var test = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Pebble = caminio.models.Pebble;
      done();
    });
  });

  describe( 'PeRuParser', function(){

    it('can be required through the rocksol lib with /lib/pe_ru_bbles/pe_ru_bble_parser', function(){
      var testRequire = require('./../../../lib/pe_ru_bble/pe_ru_bble_parser')();      
      expect( testRequire ).to.exist;
    });

    describe( 'methods: ', function(){
      PeRuParser = require('./../../../lib/pe_ru_bble/pe_ru_bble_parser')();
      var result;
      result = PeRuParser.getSnippets( snippets1 );

      describe('getSnippets', function(){

        it('gets a content string like: ' + snippets1, function(){
          expect( PeRuParser.getSnippets ).to.exist;
        });

        it('returns an object', function(){
          expect( result ).to.exist;
        });

        it('returns all pebbles in the content in the result object', function(){
          expect( result.pebbles ).to.have.length( 1 );
        });

        it('returns all rubbles in the content in the result object', function(){
          expect( result.rubbles ).to.have.length( 1 );
        });

        it('returns all missmatches in the content in the result object', function(){
          expect( result.missmatches ).to.have.length( 1 );
        });
      });

      describe('makeSnippetObjects', function(){
        var snippetObject = PeRuParser.makeSnippetObjects( result.pebbles );

        it('gets a snippet array', function(){ 
          expect( PeRuParser.makeSnippetObjects ).to.exist;
        });

        it('returns an object', function(){
          expect( snippetObject ).to.exist;
        });

        it('returns the same array length', function(){
          expect( snippetObject ).to.have.length( 1 );
        });
        
      });

    });

  });

});