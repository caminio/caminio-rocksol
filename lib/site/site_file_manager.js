/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-03 15:24:24
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-25 16:45:56
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs = require('fs');
var join = require('path').join;
var mkdirp = require('mkdirp');

var FileManager = {};

/**
 *  Provides methods which are interacting with the
 *  file system for webpages and the side generator.
 *  Note that the caminio object is included for the 
 *  webpage methods ONLY.
 *  
 *  @class FileManager
 */
module.exports = function( caminio, contentPath, layoutDir ) {

  var Webpage = caminio.models.Webpage;
  var publicPath = join( contentPath, 'public' );  
  var layoutPath = join( contentPath, layoutDir );

  // var jsFilePath = join( contentPath, 'layouts', layout, layout+'.js');
  // var layoutFilePath = join( contentPath, 'layouts', layout, layout+'.jade' );

  // FileManager.jsFile = jsFilePath;
  // FileManager.layoutFile = layoutFilePath;
  // FileManager.publicPath = publicPath;

  /**
   *  @method createFile
   *  @params content
   *  @params locale
   *  @params paths
   */
  FileManager.createFile = function( content, locale, paths ){  
    var ending = locale ? '.' + locale + '.htm' : '.htm';

    paths.forEach( function( path ){
      fs.writeFileSync( path + ending, content );   
    });

  };

  FileManager.getDraftPath = function( webpageId ){
    var path = join( publicPath, 'drafts' );
    if( !fs.existsSync( path ) )
      mkdirp.sync( path );
    return join( path, webpageId.toString() );
  };

  FileManager.getWebpagePath = function( ancestors, webpageName ){
    var path = publicPath;
    ancestors.forEach( function( ancestor ){
      path =  join( path, WebpageMethods.underscore( ancestor.name ) );    
      if( !fs.existsSync( path ) )
        mkdirp.sync( path );
    });

    return join( path, underscore( webpageName )); 
  };

  function underscore( str ){
    return Webpage.underscoreName( str );
  }

  return FileManager;

};