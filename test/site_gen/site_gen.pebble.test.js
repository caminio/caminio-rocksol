/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-21 11:21:07
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 14:46:45
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var helper = require('../helper'),
    fs = require('fs'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect,
    request = require('superagent'),
    async = require('async'),
    names = [ 'parent', 'sibling1', 'sibling2', 'child', 'grandchild' ]
    ids = {};
  
var user,
    domain,
    caminio,
    test;

var Webpage,
    Pebble;

var URL='http://localhost:4004/caminio/webpages';

describe( 'Site Generator variables test', function(){

  function addWebpage( name, next ){    
    var webpage = new Webpage( { 
      name: name, 
      camDomain: domain.id, 
      status: 'published',
      //layout: 'nopebble',
      translations: [{content: 'testcontent with pebble {{ pebble: test }}', locale: 'en'}] 
    } );
    webpage.save( function( err ){
      ids[name] = webpage._id;
      next();
    });
  }

  before( function(done){
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

  it('has got anchestors, siblings and children' , function( done ){
    var test = this;
    test.agent
    .get(URL+'/')
    .end(function(err, res){
      expect(res.status).to.eq(200);
      expect(res.body).to.have.length(names.length);
      done();
    });
  });

  describe('Ancestors', function(){

    before( function( done ){
      this.pebble = new Pebble( { 
        name: 'test', 
        camDomain: domain.id,
        translations: [{content: 'pebblecontent', locale: 'en'}] 
      } );
      this.pebble.save( function( err ){
        done();
      });
    });

    it('can be set at the param "parent"', function( done ){
      this.agent
      .put(URL+'/'+ids[names[1]])
      .send( { 'webpage': { parent: ids[names[0]] } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('have the same anchastor, means the same "parent" param', function( done ){
      this.agent
      .put(URL+'/'+ids[names[2]])
      .send( { 'webpage': { parent: ids[names[0]] } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

  });


});