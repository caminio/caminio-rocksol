/*
 * caminio-rocksol
 *
 * @author <thorsten.zerha@tastenwerk.com>
 * @date 02/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

/**
 *  @class WebpagesController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){

  'use strict';

  var fs                = require('fs');
  var join              = require('path').join;
  var util              = require('caminio/util');
  var normalizeFilename = util.normalizeFilename;
  var async             = require('async');

  var docUtils          = require('../../doc_utils')(caminio);
  var carver            = require('carver');
  var caminioCarver     = require('caminio-carver')(caminio, undefined, 'webpages');

  var Webpage           = caminio.models.Webpage;
  var Pebble            = caminio.models.Pebble;


  return {

    _before: {
      '*': policies.ensureLogin,
      'create': setupDefaultTranslation,
      'update': [ removeFiles, checkLocaleExistsAndDismiss],
      'destroy': [ getWebpage, getChildren, removeChildren, removeLocalPebbles, removeFiles ]
    },

    _beforeResponse: {
      'create': caminioCarver.after.create,
      'update': [ caminioCarver.after.save, compilePages ]
    },

    'compileAll': [
      policies.ensureLogin,
      compileAll,
      function( req, res ){
        res.send(200);
      }
    ],

  };

  function runOnSaveInLayoutFile( req, res, next ){
  
    if( !req.webpage )
      return next();

    var layoutJSFileName = join( res.locals.currentDomain.getContentPath(), 'layouts', req.webpage.layout, req.webpage.layout );

    if( !fs.existsSync( layoutJSFileName+'.js' ) )
      return next();

    var layoutJSFile = require( layoutJSFileName )( caminio, null );
   
    if( res.locals.actionName === 'create' ){
      if( layoutJSFile.onCreate )
        return layoutJSFile.onCreate( req, res, function(err){ 
          if( err ){ return next(err); } 
          if( layoutJSFile.onSave )
            return layoutJSFile.onSave( req, res, next ); 
          return next();
        });
    }

    if( layoutJSFile.onSave )
      return layoutJSFile.onSave( req, res, next );

    return next();
  }

  function compileAll( req, res, next ){
    var types = res.locals.domainSettings.compileAll || {'Webpage': {}};
    async.eachSeries( Object.keys(types), function( type, nextType ){

      var gen = new SiteGen( res.locals.currentDomain.getContentPath(), types[type].namespace );

      caminio.models[type].find()
      .exec( function( err, webpages ){
        async.eachSeries( webpages, function( webpage, compileNext ){

          req.doc = webpage;
          res.locals.doc = webpage;
          gen.compileObject( 
              req.doc,
              { locals: res.locals,
                layout: types[type].layout,
                isPublished: (req.doc.status === 'published') },
              compileNext );

        }, nextType );
      });
    }, next );
  }

  function compilePages( req, res, next ){
    carver()
      .set('cwd', join(res.locals.currentDomain.getContentPath(),'webpages'))
      .includeAll()
      .registerEngine('jade', require('jade'))
      .set('locals', caminioCarver.defaultLocals( res ) )
      .set('doc', req.webpage)
      .set('caminio', caminio)
      .set('debug', process.env.NODE_ENV === 'development' )
      .write()
      .then( function(){
        next();
      })
      .catch( function(err){
        console.log('carver caught', err.stack);
        next(err);
      });
  }

  function checkParent( req, res, next ){
    req.children.forEach( function( child ){
      if( child._id == req.body.webpage.parent )
        req.body.webpage.parent = null;
    });
    next();
  }

  function setupDefaultTranslation( req, res, next ){
    if( !req.body.webpage )
      return next();
    req.body.webpage.translations = [
      { locale: res.locals.currentDomain.lang,
        title: req.body.webpage.filename,
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

      if( req.body.webpage )
        if( req.webpage.filename !== req.body.webpage.filename )
          req.removeFiles = true;
        else
          req.removeFiles = false;

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
    req.removeFiles = true;
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
    docUtils.getChildrenOfWebpage( webpage._id, function( err, children ){
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
    if( req.removeFiles ){
      docUtils.getAncestorsOfWebpage( req.webpage, [], function( err, ancestors ){
        var path = join( res.locals.currentDomain.getContentPath(), 'public');
        ancestors.reverse().forEach( function( ancestor ){
            path =  join( path, normalizeFilename( ancestor.filename ) );
        }); 
        path = join( path, normalizeFilename( req.webpage.filename ) );
        deleteFolder( path+"/" );
        deleteFile( path+".htm" );
        return next();
      });
    } else
      next();
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
          deleteFolder(curPath);
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

  function cleanNewTranslationIds( req, res, next ){
    if( req.body.webpage.translations )
      req.body.webpage.translations.forEach(function(tr){
        if( tr._id === null )
          delete tr._id;
      });
    next();
  }

  function checkLocaleExistsAndDismiss( req, res, next ){

    var havingTranslations = [];
    if( req.body.webpage.translations ){
      req.body.webpage.translations.forEach(function(tr,index){
        if( havingTranslations.indexOf(tr.locale) >= 0 && !tr.id )
          req.body.webpage.translations.splice(index,1);
        else
          havingTranslations.push( tr.locale );
      });
    }

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

    if( docUtils.otherThanContentModified( req.webpage, req.body.webpage ) )
      req.compileAll = true;

    req.body.webpage.updatedBy = res.locals.currentUser;
    req.body.webpage.camDomain = res.locals.currentDomain;
    req.webpage.update( req.body.webpage, function( err ){
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
