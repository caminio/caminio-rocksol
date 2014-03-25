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
var util    = require('util');
var spawn   = require('child_process').spawn;

/**
 *  @class ContactsController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){

  var User = caminio.models.User;

  return {

    _before: {
      '*': policies.ensureLogin
    },

    'index': [
      ensureDefaultTemplates,
      insertSiteComponents,
      function( req, res ){
        res.caminio.render();
      }],

    'available_layouts': [
      ensureDefaultTemplates,
      function( req, res ){

        var domainTmplPath = join( res.locals.currentDomain.getContentPath(), 'layouts' );

        if( !res.locals.currentDomain )
          return res.json(403, { details: 'no_domain_found' });

        var tmpls = [];

        fs
          .readdirSync( domainTmplPath )
          .forEach( function( file ){
            tmpls.push( file.split('.')[0] );
          });

        res.json(tmpls);
      }],

    'disk_quota': [
      computeDiskQuota,
      function( req, res ){
        var avail = res.locals.currentDomain.preferences.diskQuota || 0;
        res.json({ quota: {used: parseInt(req.quota), available: avail * 1000 * 1000 }});
      }],

    'users_quota': [
      computeUsersQuota,
      function( req, res ){
        var avail = res.locals.currentDomain.preferences.usersQuota || 1;
        res.json({ quota: {used: parseInt(req.quota), available: avail }});
      }]

  };

  /**
   * computes the disk quota of the current domain's folder
   */
  function computeDiskQuota( req, res, next ){

    var size = spawn('du', ['-s', res.locals.currentDomain.getContentPath()]);

    size.stdout.setEncoding('utf-8');

    size.stdout.on('data', function (data) {
      req.quota = data.split(/\t/)[0];
      next();
    });

    size.stdout.on('close', function(){
      next();
    });

  }

  /**
   * compute max users and used users
   */
  function computeUsersQuota( req, res, next ){
    User.count({ camDomains: res.locals.currentDomain._id }, function( err, users ){
      console.log(arguments);
      if( err ){ return res.json(500, { error: 'server_error', details: err }); }
      req.quota = users;
      next();
    });
  }


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

  function ensureDefaultTemplates( req, res, next ){

    var domainTmplPath = join( res.locals.currentDomain.getContentPath(), 'layouts' );

    if( !fs.existsSync( domainTmplPath ) )
      mkdirp.sync( domainTmplPath );

    if( !fs.existsSync( join(domainTmplPath, 'index', 'index.jade') ) ){
      mkdirp.sync( join(domainTmplPath, 'index') );
      fs.writeFileSync( join(domainTmplPath, 'index', 'index.jade'), fs.readFileSync(__dirname+'/../../lib/templates/index.jade', 'utf8') );
    }
    if( !fs.existsSync( join(domainTmplPath, 'default', 'default.jade') ) ){
      mkdirp.sync( join(domainTmplPath, 'default') );
      fs.writeFileSync( join(domainTmplPath, 'default', 'default.jade'), fs.readFileSync(__dirname+'/../../lib/templates/index.jade', 'utf8') );
    }

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