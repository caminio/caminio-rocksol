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

describe( 'Webpage authentifikation API - '+URL, function(){

  function addWebpage( done ){    
    webpage = new Webpage( { 
      name: 'a page', camDomain: domain.id,
      translations: [
        { content: 'testcontent', locale: 'en', title: 'title' },
        { content: 'deutsch', locale: 'de', title: 'title' }
      ]  } );
    webpage.save( function( err ){
      done();
    });
  }

  before( function(done){
    var test = this;
    helper.initApp( this, function(){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      helper.cleanup( caminio, function(){
        helper.getDomainAndUser( caminio, function( err, u, d ){
          user = u;
          domain = d;
          test.agent.post( helper.url+'/login' )
          .send({ username: user.email, password: user.password })
          .end(function(err,res){
            addWebpage( done );
          });
        });
      });
    });
  });

  describe('GET '+URL+'/', function(){
  
    it('fails without LOGIN', function( done ){
      var test = this;
      request.agent()
      .get(URL+'/')
      .end(function(err, res){
        expect(res.status).to.eq(200);
        expect(res.text).to.match(/input type="password"/);
        done();
      });
    });

    it('returns a JSON with an array of the local domain', function( done ){
      var test = this;
      test.agent
      .get(URL+'/')
      .end(function(err, res){
        expect(res.status).to.eq(200);
        var jsonRes = JSON.parse(res.text);
        expect(jsonRes).to.have.length(1);
        done();
      });
    });
  });

  describe('GET '+URL+'/:id', function( done ){

    it('fails without LOGIN', function(done){
      var test = this;
      request.agent()
      .get(URL+'/'+webpage.id)
      .end(function(err, res){
        expect(res.status).to.eq(200);
        expect(res.text).to.match(/input type="password"/);
        done();
      });
    });

    it('returns a JSON with an complete contact object selected by :id', function(done){
      var test = this;
      test.agent
      .get(URL+'/'+webpage.id)
      .end(function(err, res){
        expect(res.status).to.eq(200);
        var jsonRes = JSON.parse(res.text);
        expect( jsonRes.filename ).to.eq( webpage.filename );
        done();
      });
    });

  });


  describe('POST '+URL+'/', function(){

    it('adds a valid webpage', function(done){
      var attr = new caminio.models.Webpage({ filename: 'testpage' });
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

    it('fails without LOGIN', function(done){
      request.agent()
      .post(URL+'/')
      .send( { 'webpage': { camDomain: domain.id } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        expect(res.text).to.match(/input type="password"/);
        done();
      });
    });

  });

  describe('PUT '+URL+'/:id', function(){

    // it('updates a webpage', function( done ){
    //   var test = this;
    //   test.agent
    //   .put(URL+'/'+webpage.id)
    //   .send( { 'webpage': { name: 'updated page' } } )
    //   .end(function(err, res){
    //     console.log(res.text);
    //     expect(res.status).to.eq(200);
    //     expect(res.text.name).to.eq( 'updated page' );
    //     done();
    //   });
    // });

    it('fails without LOGIN', function( done ){
      var test = this;
      request.agent()
      .put(URL+'/'+webpage.id)
      .send( { 'webpage': { name: 'updated page' } }  )
      .end(function(err, res){
        expect(res.status).to.eq(200);        
        expect(res.text).to.match(/input type="password"/);
        done();
      });
    });

  });

  describe('DELETE '+URL+'/:id', function(){
    
    it('deletes a webpage', function(done){
      var test = this;
      test.agent
      .del(URL+'/'+webpage.id)
      .end(function(err, res){
        console.log('err', res.text);
        expect(res.status).to.eq(200);
        done();
      });
    });


    it('fails without LOGIN', function(done){
      var test = this;
      request.agent()
      .del(URL+'/'+webpage.id)
      .end(function(err, res){
        expect(res.status).to.eq(200);        
        expect(res.text).to.match(/input type="password"/);
        done();
      });
    });

  });

});