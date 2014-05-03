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
    caminio,
    Webpage;

describe( 'Webpage', function(){

  before( function(done){
    helper.initApp( this, function(){ 
      caminio = helper.caminio;
      Webpage = caminio.models.Webpage;
      done();
    });
  });

  it('is valid', function( done ){
    this.webpage = new Webpage();
    this.webpage.validate( 
     function( err ){
       expect( err ).to.not.exist;
       done();
    });
  });

  describe( 'attributes', function(){

    describe( 'has', function(){

      before( function(){
        this.domain = new caminio.models.Domain( { name: 'test1234.com'} );
        this.user = new caminio.models.User( { name: 'dummy' } );
        this.webpage = new Webpage( fixtures.Webpage.attributes({
          camDomain: this.domain._id,
          requestReviewBy: this.user._id
        }) );
      });

      it('.filename', function(){
        expect( this.webpage.filename ).to.eq( fixtures.Webpage.attributes().filename );
      });

      it('.translations', function(){
        this.webpage.translations.push( fixtures.Translation.attributes() );
        expect( this.webpage.translations ).to.have.length(1);
      });

      it('.status', function(){
        expect( this.webpage.status ).to.eq( 'draft' );
      });

      it('.requestReviewBy', function(){
        expect( this.webpage.requestReviewBy ).to.eq( this.user._id );
      });

      it('.requestReviewMsg', function(){
        expect( this.webpage.requestReviewMsg ).to.eq( fixtures.Webpage.attributes().requestReviewMsg );
      });

      it('.camDomain', function(){
        expect( this.webpage.camDomain ).to.eq( this.domain._id );
      });

      it('.layout', function(){
        expect( this.webpage.layout ).to.eq( 'default' );
      });

    });

  });


  describe('methods', function(){

    before( function(){
      this.domain = new caminio.models.Domain( { name: 'test1234.com'} );
      this.user = new caminio.models.User( { name: 'dummy' } );
      this.webpage = new Webpage( fixtures.Webpage.attributes({
        camDomain: this.domain._id,
        translations: [
          { content: 'testcontent', locale: 'en', title: 'title' },
          { content: 'deutsch', locale: 'de', title: 'title' }
        ] ,
        requestReviewBy: this.user._id
      }) );
    });

    it('.save', function( done ){
      this.webpage.save( function( err ){
        expect( err ).to.be.null;
        done();
      });
    });    

    it('.update', function( done ){
      var test = this;
      test.webpage.update( { name: 'newname' }, function( err ){
        expect( err ).to.be.null;
        done();
      });
    });

    it('.remove', function( done ){
      var test = this;
      test.webpage.remove( function( err ){
        expect( err ).to.be.null;
        done();
      });
    });

  });

});
