/*
 * caminio-rocksol
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 03/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var helper = require('../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect,
    request = require('superagent'),
    test,
    user,
    webpage,
    domain,
    caminio,
    Webpage;

var URL='http://localhost:4004/caminio/webpages';

describe( 'Contact authentifikation API - '+URL, function(){

  function addWebpage( done ){    
    webpage = new Webpage( { name: 'a page', camDomain: domain.id } );
    webpage.save( function( err ){
      done();
    });
  }

  before( function(done){
    var akku = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      helper.cleanup( caminio, function(){
        helper.getDomainAndUser( caminio, function( err, u, d ){
          user = u;
          domain = d;
          akku.agent.post( helper.url+'/login' )
          .send({ username: user.email, password: user.password })
          .end(function(err,res){
            addWebpage( done );
          });
        });
      });
    });
  });

  describe('POST '+URL+'/', function(){

    it('adds a valid webpage', function(done){
      var attr = new caminio.models.Webpage({ name: 'testpage' });
      attr.camDomain = domain;
      var test = this;
      test.agent
      .post(URL+'/')
      .send( { 'webpage': attr } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

  });

  describe(' run SiteGen', function(){

  	before( function(){
	    var SiteGen = require('../../lib/site_gen')( caminio );
  	})

  	it('gets the parents', function( done ){



  	})

  });

  

});