/*
 * caminio-contacts
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 02/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

var fs      = require('fs');
var join    = require('path').join;
var extname = require('path').extname;
var mkdirp  = require('mkdirp');

/**
 *  @class ContactsController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){

  var Contact = caminio.models.Contact;

  return {

    _before: {
      '*': policies.ensureLogin
    },

    'index': function( req, res ){
      res.caminio.render();
    },

    'available_layouts': function( req, res ){

      if( !res.locals.currentDomain )
        return res.json(403, { details: 'no_domain_found' });

      var domainTmplPath = join( res.locals.currentDomain.getContentPath(), 'layouts' );

      if( !fs.existsSync( domainTmplPath ) )
        mkdirp.sync( domainTmplPath );

      if( !fs.existsSync( join(domainTmplPath,'index.jade') ) )
        fs.writeFileSync( join(domainTmplPath,'index.jade'), fs.readFileSync(__dirname+'/../../lib/templates/index.jade', 'utf8') );
      if( !fs.existsSync( join(domainTmplPath,'default.jade') ) )
        fs.writeFileSync( join(domainTmplPath,'default.jade'), fs.readFileSync(__dirname+'/../../lib/templates/index.jade', 'utf8') );

      var tmpls = [];

      fs
        .readdirSync( domainTmplPath )
        .filter( function( filename ){
          return extname(filename).indexOf('.jade') === 0;
        })
        .forEach( function( file ){
          tmpls.push( file.split('.')[0] );
        });

      res.json(tmpls);
    }

  };

};