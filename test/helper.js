/*
 * caminio-rocksol
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 03/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

 /**
 * caminio test helper
 */

var superagent = require('superagent'),
    async = require('async');

var helper = {};

process.env.NODE_ENV = 'test';

helper.fixtures = require('caminio-fixtures');
helper.fixtures.readFixtures();

helper.chai = require('chai');
helper.chai.Assertion.includeStack = true;

helper.initApp = function( test, done ){

  if( helper.caminio )
    return done();

  helper.caminio = require('caminio');
  var Gear = helper.Gear = require('caminio/gear');
  new Gear({ api: true, absolutePath: __dirname+'/support/app' });

  // require auth gear
  require('caminio-auth');
  // require this gear
  require('../');

  helper.caminio.init({ 
    config: { 
      root: __dirname+'/support/app',
      log: {
        filename: process.cwd()+'/test.log'
      }
    }
  });

  helper.url = 'http://localhost:'+helper.caminio.config.port+'/caminio';

  test.agent = helper.agent();

  helper.caminio.on('ready', done);

};

helper.agent = function(){
  return superagent.agent();
};


helper.cleanup = function( caminio, done ){
  async.each( Object.keys(caminio.models), function( modelId, next ){
    caminio.models[modelId].remove({}, next);
  }, done );
};

helper.getDomainAndUser = function( caminio, done ){
  caminio.models.User.create({ email: 'test@example.com', password: 'test' }, 
  function( err, u ){ 
    caminio.models.Domain.create( { name: 'test.com', owner: u, users: u }, 
    function( err, d ){
      u.camDomains = d;
      u.save( done( err, u, d ));
    });
  });
};

module.exports = helper;
