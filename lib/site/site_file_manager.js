/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-03 15:24:24
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-29 14:42:16
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs = require('fs');
var join = require('path').join;
var mkdirp = require('mkdirp');
var normalizeFilename = require('caminio/util').normalizeFilename;
var publicPath = 'uninitalized_public_path';

var extension;

var layoutSettings;
var domainSettings;

/**
 *  Provides methods which are interacting with the
 *  file system for webpages and the side generator.
 *  @class FileManager
 */
function FileManager( contentPath, type, ext ){
  extension = ext ? ext : '.htm';
  publicPath = join( contentPath, 'public' );  
  domainSettings = getDomainSettings();
  layoutSettings = getLayoutSettings( contentPath, type );
}

FileManager.prototype.getSettings = function() {
  var settings = layoutSettings;
  for( var i in domainSettings ){
    settings[i] = domainSettings[i];
  }
  return settings;
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
  var settingsfile = join( typePath, '.settings.js' );
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
  var path = join( publicPath, 'drafts' );
  if( !fs.existsSync( path ) )
    mkdirp.sync( path );
  return join( path, objectId.toString() );
};

/**
 *
 *  @method createFile
 *  @params content
 *  @params locale
 *  @params paths
 */
FileManager.prototype.createFiles = function( content, locale, paths ){  
  var ending = locale ? '.' + locale : '';

  ending += extension;

  paths.forEach( function( path ){
    fs.writeFileSync( path + ending, content );   
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
FileManager.prototype.buildAndCleanObjectPath = function( ancestors ){
  var path = publicPath;
  ancestors = ancestors ? ancestors : [];
  ancestors.forEach( function( ancestor ){
    path =  join( path, normalizeFilename( ancestor.name ) );    
    if( !fs.existsSync( path ) )
      mkdirp.sync( path );
  });

  cleanDir( path );

  return join( path, normalizeFilename( object.name )); 
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
        var marked = require( "marked" );
        return marked( content );
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
  var file = path + "/.settings.js"; 
  var settings;

  if( fs.existsSync( file ) )
    settings =  require( file );
  else
    settings = {};

  return settings;

}

FileManager.prototype.cleanDirectory = cleanDir;

function cleanDir( path ) {
  var files = fs.readdirSync( path );
  
  files.forEach( function ( file ) {
    file = join( path, file );
    if( fs.lstatSync( file ).isFile() )
      fs.unlinkSync( file );
  });
}

module.exports = FileManager;

