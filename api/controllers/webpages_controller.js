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
module.exports = function( caminio, policies ){

  'use strict';

  var fs                = require('fs');
  var join              = require('path').join;
  var util              = require('caminio/util');
  var normalizeFilename = util.normalizeFilename;
  var async             = require('async');

  var docUtils          = require('../../doc_utils')(caminio);
  var carver            = require('carver');
  var snippetParser     = require('carver/plugins').snippetParser;
  var markdownCompiler  = require('carver/plugins').markdownCompiler;
  var caminioCarver     = require('caminio-carver')(caminio, undefined, 'webpages');

  var Webpage           = caminio.models.Webpage;
  var Pebble            = caminio.models.Pebble;


  return {

    _before: {
      '*': policies.ensureLogin,
      'update': [ removeFiles ],
      'destroy': [ getWebpage, getChildren, removeChildren, removeFiles ]
    },

    _beforeResponse: {
      'update': [ caminioCarver.after.save, compilePages ]
    },

    'compileAll': compileAll

  };

  function compileAll( req, res ){
    res.send(500,'not implemented yet');
  }

  function compilePages( req, res, next ){
    carver()
      .set('cwd', join(res.locals.currentDomain.getContentPath(),'webpages'))
      .set('snippetKeyword', 'pebble')
      .includeAll()
      .registerEngine('jade', require('jade'))
      .registerHook('before.render',caminioCarver.setupLocals(res))
      .registerHook('after.write', caminioCarver.docDependencies)
      .registerHook('before.render', markdownCompiler)
      .registerHook('after.render', snippetParser )
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
        res.send(500, { error: 'server error', details: err });
        nextChild();
      });   
    }
  }

  function removeFiles( req, res, next ){    
    if( req.removeFiles ){
      docUtils.getAncestorsOfWebpage( req.webpage, [], function( err, ancestors ){
        var path = join( res.locals.currentDomain.getContentPath(), 'public');
        ancestors.reverse().forEach( function( ancestor ){
            path =  join( path, normalizeFilename( ancestor.filename ) );
        }); 
        path = join( path, normalizeFilename( req.webpage.filename ) );
        deleteFolder( path+'/' );
        deleteFile( path+'.htm' );
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

    function checkForFiles( file ){
      var curPath = path + '/' + file;
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


};
