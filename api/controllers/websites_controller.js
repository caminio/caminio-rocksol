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

    'index': [
      insertSiteComponents,
      function( req, res ){
        res.caminio.render();
      }],

    'available_layouts': function( req, res ){

      if( !res.locals.currentDomain )
        return res.json(403, { details: 'no_domain_found' });

      var domainTmplPath = join( res.locals.currentDomain.getContentPath(), 'layouts' );

      if( !fs.existsSync( domainTmplPath ) )
        mkdirp.sync( domainTmplPath );

      if( !fs.existsSync( join(domainTmplPath, 'index', 'index.jade') ) )
        fs.writeFileSync( join(domainTmplPath, 'index', 'index.jade'), fs.readFileSync(__dirname+'/../../lib/templates/index.jade', 'utf8') );
      if( !fs.existsSync( join(domainTmplPath, 'default', 'default.jade') ) )
        fs.writeFileSync( join(domainTmplPath, 'default', 'default.jade'), fs.readFileSync(__dirname+'/../../lib/templates/index.jade', 'utf8') );

      var tmpls = [];

      fs
        .readdirSync( domainTmplPath )
        .forEach( function( file ){
          tmpls.push( file.split('.')[0] );
        });

      res.json(tmpls);
    }

  };


  /**
   * inserts site components
   * for this very domain located in
   * content/domain_fqdn/layouts/<layout_name>/<layout_name>_component.hbs
   */
  function insertSiteComponents( req, res, next ){

    var domainTmplPath = join( res.locals.currentDomain.getContentPath(), 'layouts' );

    res.locals.siteComponents = [];

    fs
      .readdirSync( domainTmplPath )
      .forEach( function( dirname ){
        
        if( !fs.existsSync( join( domainTmplPath, dirname, 'javascripts' ) ) )
          return;

        var componentFilename = join( domainTmplPath, dirname, 'javascripts', 'component', dirname+'_component.hbs' );
        var comp = { name: dirname, 
          content: fs.readFileSync( componentFilename, 'utf8' ),
          javascripts: []
           };
        
        
        readCompDirectory( domainTmplPath, comp, dirname, 'models' );
        readCompDirectory( domainTmplPath, comp, dirname, 'views' );
        readCompDirectory( domainTmplPath, comp, dirname, 'component' );

        if( fs.existsSync( componentFilename ) )
          res.locals.siteComponents.push( comp );
      });

    next();

  }

  function readCompDirectory( domainTmplPath, comp, dirname, type ){

    fs
      .readdirSync( join( domainTmplPath, dirname, 'javascripts', type ) )
      .filter( function( name ){
        return( extname(name) === '.js' );
      })
      .forEach( function( script ){
        comp.javascripts.push( join( type, script ) );
      });

  }

};