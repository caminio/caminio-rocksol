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
    fs = require('fs'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect,
    request = require('superagent'),
    async = require('async'),
    names = [ 'parent', 'sibling1', 'sibling2', 'child', 'grandchild' ],
    ids = {};
  
var user,
    domain,
    caminio,
    test;

var Webpage;

var URL='http://localhost:4004/caminio/webpages';

describe( 'Site Generator variables test', function(){

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
      ids[name] = webpage._id;
      next();
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

    it('can be set at the param "parent"', function( done ){
      this.agent
      .put(URL+'/'+ids[names[1]])
      .send( { 'webpage': { parent: ids[names[0]], layout: 'testing' } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('are available in the jade file as "ancestors"', function(){
      var content = JSON.parse( 
        fs.readFileSync( __dirname + '/../support/content/' + 
          domain.name.replace('.', '_') +
         '/public/' + names[0] + '/' + names[1] + '.en.htm', 
        { encoding: 'utf8' }));
      expect(content.ancestors).to.have.length(1);
      expect(content.ancestors[0].name).to.eq(names[0]);
    });


    it('the array holds all known ancestors', function( done ){
      this.agent
      .put(URL+'/'+ids[names[3]])
      .send( { 'webpage': { parent: ids[names[1]], layout: 'testing' } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('the array starts  with the closest one', function(){     
        var content = JSON.parse( 
          fs.readFileSync( __dirname + '/../support/content/' + 
            domain.name.replace('.', '_') +
           '/public/' + names[0] + '/' + names[1] + '/' + names[3] + '.en.htm', 
          { encoding: 'utf8' }));
        expect(content.ancestors).to.have.length(2);
        expect(content.ancestors[0].name).to.eq(names[0]);
        expect(content.ancestors[1].name).to.eq(names[1]);
    });

  });

  describe('Siblings', function(){

    it('have the same anchastor, means the same "parent" param', function( done ){
      this.agent
      .put(URL+'/'+ids[names[2]])
      .send( { 'webpage': { parent: ids[names[0]], layout: 'testing' } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('are available in the jade file as "siblings"', function(){
      this.content = JSON.parse( 
        fs.readFileSync( __dirname + '/../support/content/' + 
          domain.name.replace('.', '_') +
         '/public/' + names[0] + '/' + names[2] + '.en.htm', 
        { encoding: 'utf8' }));      
      expect(this.content.siblings).to.have.length(2);
    });

    it('has also the current page listed as a sibling', function(){
      var isInside = false;
      this.content.siblings.forEach( function( sibling ){
        if( sibling.name === names[2] )
          isInside = true;
      });
      expect( isInside ).to.be.true;
    });

  });
  
  describe('Children', function(){

    it('have the current webpage as "parent" param', function( done ){
      this.agent
      .put(URL+'/'+ids[names[0]])
      .send( { 'webpage': { createdAt: Date.now, layout: 'testing' } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('are available in the jade file as "children"', function(){
      var content = JSON.parse( 
        fs.readFileSync( __dirname + '/../support/content/' + 
          domain.name.replace('.', '_') +
         '/public/' + names[0] + '.en.htm', 
        { encoding: 'utf8' }));      
      expect(content.children).to.have.length(2);
    });

  });

  describe('Path', function(){


    it('is the relativ path to the webpage', function( done ){
      this.agent
      .put(URL+'/'+ids[names[4]])
      .send( { 'webpage': { parent: ids[names[3]], layout: 'testing' } } )
      .end(function(err, res){
        expect(res.status).to.eq(200);
        done();
      });
    });

    it('are available in the webpage object and jadefile as "path"', function(){
      var content = JSON.parse( 
        fs.readFileSync( __dirname + '/../support/content/' + 
          domain.name.replace('.', '_') +
         '/public/' + names[0] + '/' + names[1] + '/' + names[3] + '/' + names[4] + '.en.htm', 
        { encoding: 'utf8' }));  
      expect( content.webpage.path ).to.eq('/' + names[0] + '/' + names[1] + '/' + names[3]);
    });

  });

});