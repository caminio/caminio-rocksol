var helper = require('../helper'),
    fixtures = helper.fixtures,
    expect = helper.chai.expect;

var caminio,
    domain,
    user,
    template;
    
var Field,
    Template;

var URL='http://localhost:4004/caminio/';

describe( 'Testing the compiling of jade files', function(){

  before( function(done){
    var akku = this;
    helper.initApp( this, function( test ){ 
      caminio = helper.caminio;
      Field = caminio.models.ContactField;
      Template = caminio.models.ContactTemplate;
      helper.cleanup( caminio, function(){
        caminio.models.User.create({ email: 'test@example.com', password: 'test' }, 
          function( err, u ){ 
            user = u;
            caminio.models.Domain.create( { name: 'test.com', owner: user, users: user}, function( err, d ){
              domain = d;
              user.camDomains = d;
              user.save(function( err ){
                akku.agent.post( helper.url+'/login' )
                .send({ username: user.email, password: user.password })
                .end(function(err,res){
                  done();
                });
              });
            });
          });
      });
    });
  });

  // describe('exporting a contact into a vCard', function(){

  //   before( function( done ){
  //     template = new Template( fixtures.ContactTemplate.attributes( {  camDomain: domain.id } ));
  //     done();
  //        });


  // it('adding a new template wich creates a standard contact', function(done){
  //   var test = this;
  //   test.agent
  //   .get(URL+'contact_templates?isDefault=true')
  //   .end(function(err, res){
  //     expect(res.status).to.eq(200);
  //     Template.find().exec( function( err, template){
  //       test.template = template[0];
  //       done();
  //     });
  //   });
  // });

  //   it('exporting the contact into a ', function(done){
  //     var output;
  //     caminio.models.Contact.find().exec( function( err, contacts ){
  //       var options = { contacts: contacts, domain: domain };
  //       vcard.export( caminio, options, function( output ){
  //         done();
  //       });
  //     });
  //   });

  // });
});