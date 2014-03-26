/*
 * caminio-rocksol
 *
 * @author <thorsten.zerha@tastenwerk.com>
 * @date 02/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

var fs      = require('fs');
var join    = require('path').join;
var mkdirp  = require('mkdirp');
var util    = require('caminio/util');
var async   = require('async');
var join    = require('path').join;

/**
 *  @class WebpagesController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){

  var SiteGen        = require('../../lib/site_gen')( caminio );
  var WebpageMethods = require('../../lib/webpage_methods')( caminio );

  var Webpage = caminio.models.Webpage;
  var Pebble  = caminio.models.Pebble;

  return {

    _before: {
      '*': policies.ensureLogin,
      'create': setupDefaultTranslation,
      'update': [ cleanNewActivities, cleanNewTranslations, getWebpage, autoCreatePebbles, saveWebpage ],
      'destroy': [ getWebpage, getChildren, removeChildren, removeLocalPebbles, removeFiles ]
    },

    'update': function updateWebpage(req, res ){
      var options = {};
      if( req.webpage.name !== req.body.webpage.name )
        options.compileAll = true;

      if( req.webpage.status === 'published' )
        SiteGen.compilePage( res, req.webpage, options, finalResponse );
      else
        finalResponse();
      
      function finalResponse( err ){
        if( err )
          return res.json( 500, { error: 'compile_error', details: err });
        if( req.webpage.parent && typeof( req.webpage.parent) === 'object' )
          req.webpage.parent = req.webpage.parent._id;
        Webpage.findOne({ '_id': req.webpage._id })
        .exec( function( err, webpage ){
          res.json( util.transformJSON( { webpage: JSON.parse(JSON.stringify(webpage)) }, req.header('namespaced') ) );
        });
      }
    }

  };

  function setupDefaultTranslation( req, res, next ){
    if( !req.body.webpage )
      return next();
    req.body.webpage.translations = [
      { locale: res.locals.currentDomain.lang,
        title: req.body.webpage.name,
        content: '### '+req.i18n.t('no_content_here_yet') }
    ];
    next();
  }

  function getWebpage( req, res, next ){
    Webpage.findOne({ _id: req.param('id') }, function( err, webpage ){
      if( err )
        return res.json( 500, { error: 'server_error', details: err });
      if( !webpage )
        return res.json(404, { error: 'not_found' });
      req.webpage = webpage;
      next();
    });
  }

  function updateWebpage( req, res, next ){
    for( var i in req.body.webpage )
      req.webpage[i] = req.body.webpage[i];
    req.webpage.updatedBy = res.locals.currentUser;
    req.webpage.updatedAt = new Date();
    req.webpage.save( function( err ){
      if( err )
        return res.json( 500, { error: 'server_error', details: err });
      next();
    });
  }

  /**
   *  writes all children into req.children
   */ 
  function getChildren( req, res, next ){
    getChildrenDeep( req.webpage, [], function( err, children ){
      if( err )
        return res.json( 500, { error: 'server_error', details: err });
      req.children = children;
      next();
    });
  }

  /**
   *  Removes the pebbles of the current webpage
   *  @method removeLocalPebbles
   */
  function removeLocalPebbles( req, res, next ){
    removePebbles( req.webpage._id, next );
  }

  /**
   *  Gets all children of one webpage, not only one
   *  depth
   *  @method getChildrenDeep
   *  @param webpage
   *  @param arr an array of webpages
   *  @param done callback which is called after all
   *              children are found
   */ 
  function getChildrenDeep( webpage, arr, done){
    WebpageMethods.getChildrenOfWebpage( webpage._id, function( err, children ){
      if( !( children && children.length ) ){
        return done( null, arr );
      }

      arr = arr.concat( children );

      async.each( children, findChildren, end );

      function findChildren( child, nextChild ){
        getChildrenDeep( child, arr, function( err, children ){
          arr = children;
          nextChild();
        });
      }

      function end(){
        done( null, arr );        
      }

    });
  }

  /**
   *  Removes all children and their bounded pebbles
   *  from the database
   *  @method removeChildren
   *
   */
  function removeChildren( req, res, next ){
    async.each( req.children, removeChild, next );

    function removeChild( child, nextChild ){
      child.remove( function( err ){
        error( 'server_error', err );
        removePebbles( child._id, nextChild );   
      });   
    }
  }

  function removePebbles( webpage, next ){
    Pebble.find({ webpage: webpage })
    .exec( function( err, pebbles ){
      async.each( pebbles, removePebble, next );

      function removePebble( pebble, nextPebble ){
        pebble.remove( function( err ){
          error( 'server_error', err );
          nextPebble();
        });
      }
    });
  }

  function removeFiles( req, res, next ){    
    WebpageMethods.getAncestorsOfWebpage( req.webpage, [], function( err, ancestors ){
      var path = join( res.locals.currentDomain.getContentPath(), 'public');
      ancestors.reverse().forEach( function( ancestor ){
          path =  join( path, WebpageMethods.underscore( ancestor.name ) );
      }); 
      path = join( path, WebpageMethods.underscore( req.webpage.name ) );
      deleteFolder( path+"/" );
      deleteFile( path+".htm" );
      next();
    });
  } 

  function deleteFolder( path ) {
    var files = [];
    if( fs.existsSync( path ) ) {
        files = fs.readdirSync( path );
        files.forEach( checkForFiles );
        fs.rmdirSync( path );
    }

    function checkForFiles( file, index ){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { 
          deleteFolderRecursive(curPath);
      } else { 
          fs.unlinkSync(curPath);
      }
    }
  }

  function deleteFile( file ){
    if( fs.existsSync( file )){
      fs.unlinkSync( file );    
    }
  }

  function cleanNewTranslations( req, res, next ){
    if( req.body.webpage.translations )
      req.body.webpage.translations.forEach(function(tr){
        if( tr._id === null )
          delete tr._id;
      });
    next();
  }

  function cleanNewActivities( req, res, next ){
    if( !( 'activities' in req.body.webpage ) )
      return next();
    req.body.webpage.activities.forEach(function(act){
      if( act._id === null )
        delete act._id;
    });
    next();
  }

  function autoCreatePebbles( req, res, next ){

    if( req.webpage.initialSetupCompleted )
      return next();


    var layoutFile = join( res.locals.currentDomain.getContentPath(), 'layouts', req.body.webpage.layout, req.body.webpage.layout );

    if( fs.existsSync( layoutFile+'.js' ) ){
      var setup = require( layoutFile )( caminio );
      if( typeof(setup.initialSetup) === 'function' )
        setup.initialSetup( req.webpage, res, markCompleted );
      else
        next();
    }
    else
      next();

    function markCompleted( err ){
      req.body.webpage.initialSetupCompleted = true;
      next();
    }

  }

  function saveWebpage( req, res, next ){

    req.body.webpage.updatedBy = res.locals.currentUser;
    req.body.webpage.camDomain = res.locals.currentDomain;

    req.webpage.update( req.body.webpage, function(err){
      error( 'server_error', err );
      Webpage.findOne({_id: req.param('id')}, function( err, webpage ){
        error( 'server_error', err );
        req.webpage = webpage;
        return next();
      });
    });
  }

  function error( err, details, code ){
    if( !code )
      code = 500;
    if( details )
      return res.json( code, { error: err, details: details });
  }

};