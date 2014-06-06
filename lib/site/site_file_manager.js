/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-03 15:24:24
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-06-03 10:49:36
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

'use strict';

var fs        = require('fs');
var join      = require('path').join;
var mkdirp    = require('mkdirp');
var normalize = require('path').normalize;

var publicPath = 'uninitalized_public_path';
var domainPath = 'uninitalized_domain_path';

var uploader          = require('./../upload/upload_manager');
var normalizeFilename = require('caminio/util').normalizeFilename;

var extension;

var globalSettings;
var layoutSettings;
var domainSettings;

/**
 *  Provides methods which are interacting with the
 *  file system for webpages and the side generator.
 *  @class FileManager
 */
function FileManager( contentPath, type, ext ){
  extension = ext ? ext : '.htm';
  domainPath = contentPath;
  publicPath = join( contentPath, 'public' );  
  domainSettings = getDomainSettings();
  layoutSettings = getLayoutSettings( contentPath, type );
}

FileManager.prototype.getSettings = function() {
  globalSettings = layoutSettings;
  for( var i in domainSettings ){
    globalSettings[i] = domainSettings[i];
  }
  return globalSettings;
};

/**
 *  @private 
 *  @method initSettings
 *  @param contentPath
 *  @param type
 */
function getLayoutSettings( contentPath, type ){
  type = type ? type : '_no_type_given_';

  var typePath = join( contentPath, type );
  var settingsfile = join( typePath, 'config/site.js' );
  var layoutPath = join( typePath, 'layouts' );
  var settings = readSettings( typePath );

  if( !fs.existsSync( layoutPath ) )
    layoutPath = join( contentPath, 'layouts' );

  if( settings.public && settings.public !== 'website' ) 
    publicPath = join( publicPath, settings.public );

  settings.layoutPath = layoutPath;
  settings.publicPath = publicPath; 
  settings.domainPath = contentPath;

  return settings;

}

/**
 *
 *  @method getDrafPath
 *  @param objectId
 *  @return { String } The draft path
 */
FileManager.prototype.getDraftPath = function( objectId ){
  var path = join( domainPath, 'public', 'drafts' );
  if( !fs.existsSync( path ) )
    mkdirp.sync( path );
  return join( path, objectId.toString() );
};

// FileManager.prototype.upload = function( content, contentPath, uploadPath, type ) {
  
// };



FileManager.prototype.fileUpload = function( options, compiledContent, next ){
    var filePath = join( normalize(options.contentPath), 'upload');
    if( !fs.existsSync( filePath ) )
      mkdirp.sync( filePath );

    filePath = join( filePath, options.currentObject.filename );

    this.createFiles( compiledContent, null, [ filePath ] );

    try{
      var domain = options.locals.currentDomain;
      var destination = globalSettings.public ? domain.remoteAddr + globalSettings.public + '/' : domain.remoteAddr;
      uploader.uploadFile(filePath + '.htm', destination, function( err ){
        if( err ) throw { name: 'upload_error', message: err };
        next();
      });
    } catch( ex ){
      console.log(ex);
      next();
    }
  }




/**
 *
 *  @method createFile
 *  @params content
 *  @params locale
 *  @params paths
 */
FileManager.prototype.createFiles = function( content, locale, paths, domain ){  

  var suffix = extension + (locale ? '.' + locale : '');

  paths.forEach( function( path ){
    if( path.match(new RegExp('/drafts/')) ){
      fs.writeFileSync( path + suffix, content.replace( /\/assets\//g, 'http://'+ domain.fqdn + '/assets/').replace( /\/files\//g, 'http://'+ domain.fqdn + '/files/') );
    } else
      fs.writeFileSync( path + suffix, content );   
  });
};

/**
 *  @methdo getObjectPath
 *  @param object
 *  @param ancestors
 *  @return { String } The hirachal path to the object
 *  @example
 *  If the object has ancestors....
 */
FileManager.prototype.getAncestorPath = function( ancestors ){
  var path = publicPath;
  ancestors = ancestors ? ancestors : [];
  ancestors.forEach( function( ancestor ){
    path =  join( path, normalizeFilename( ancestor.filename ) );    
    if( !fs.existsSync( path ) )
      mkdirp.sync( path );
  });

  return path; 
};

FileManager.prototype.getObjectPath = function( object, ancestors ){
  var path = this.getAncestorPath( ancestors );

  return join( path, normalizeFilename( object.filename )); 
};


FileManager.prototype.getIndexPath = function( object, ancestors ){
  var path = this.getAncestorPath( ancestors );
  path = join( path, normalizeFilename( object.filename ));

  if( !fs.existsSync( path ) )
      mkdirp.sync( path );

  return join( path, 'index' ); 
};


/**
 *
 *
 */
function getDomainSettings() {
  var settings = readSettings( publicPath );

  if( !settings.layoutCompiler )
    settings.layoutCompiler= require('jade');
  if( !settings.contentCompiler )
    settings.contentCompiler = { 
      compile: function( content ){
        var marked = require('marked');
        var hljs = require('highlight.js');
        marked.setOptions({
          breaks: true,
          tables: true,
          pedantic: false,
          smartLists: true,
          gfm: true,
          smartypants: true,
          highlight: function (code) {
            return hljs.highlightAuto(code).value;
          }
        });
        if( content )
          return marked( content );
        return '';
      }
    };

  return settings;
}

/** 
 *  @method readSettingsFile
 *
 *
 */
FileManager.prototype.readSettingsFile = readSettings;

function readSettings( path ){
  var file = path + "/config/site.js"; 
  var settings;

  if( fs.existsSync( file ) )
    settings =  require( file );
  else
    settings = {};

  return settings;

}

FileManager.prototype.cleanDirectory = cleanDir;

function cleanDir( path, name ) {

  if( !fs.existsSync( path ) )
    mkdirp.sync( path );

  var files = fs.readdirSync( path );

  files.forEach( function ( file ) {
    file = join( path, file );
    if( name && fs.lstatSync( file ).isFile() && file.match( new RegExp( name ) ) ){
      fs.unlinkSync( file );
    }
  });
}

FileManager.prototype.getBackfillPaths = function( contentPath, ancestors, newStatus ) {
  var backfillPath = join( contentPath, 'backfill' );

  if( !fs.existsSync( backfillPath ) )
    mkdirp.sync( backfillPath );

  backfillPath = join( backfillPath, this.getAncestorPath( ancestors ) );

  var backupPath = join( backfillPath, 'backup' );
  var statusPath = join( backfillPath, 'status' ); 
  
  //var paths = [ join()]
};

function getBackupAndStatusFiles( backfillPath ){
  var files = fs.readdirSync( backfillPath );

  var backupFiles = [];
  var statusFiles = [];

  files.forEach( function( file ){
    if( name && fs.lstatSync( file ).isFile() && file.match( new RegExp( name ) ) ){
      fs.unlinkSync( file );
    }
  });
}

module.exports = FileManager;

