/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-03 15:24:24
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-03 16:26:41
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs = require('fs');
var join = require('path').join;
var mkdirp = require('mkdirp');


var SiteFileManager = {};


/**
 *  Provides methods which are interacting with the
 *  file system for webpages and the side generator.
 *  Note that the caminio object is included for the 
 *  webpage methods ONLY.
 *  
 *  @class SiteFileManager
 */
module.exports = function( caminio, contentPath ) {

  var WebpageMethods = require('./webpage_methods')( caminio );
  var publicPath = join( contentPath, 'public' );

  /**
   *  @method createFile
   *  @params content
   *  @params locale
   *  @params params.webpageId
   *  @params params.ancestors
   *  @params params.layout
   */
  SiteFileManager.createFile = function( content, locale, params ){  
    var ending = locale ? '.' + locale + '.htm' : '.htm';

    output( draftPath() );

    if( isPublished )
      output( publishedPath( params.ancestors ) );

    function output( fileName ){
      removeZombie( fileName + '.htm', locale, params.layout );
      fileName += ending;
      fs.writeFileSync( fileName, content );        
    }

  };

  function draftPath( webpageId ){
    var path = publicPath;
    path = join( path, 'drafts' );
    if( !fs.existsSync( path ) )
      mkdirp.sync( path );
    return join( path, webpageId.toString() );
  }


  function publishedPath( ancestors ){
    var path = publicPath;
    ancestors.forEach( function( ancestor ){
      path =  join( path, WebpageMethods.underscore( ancestor.name ) );    
      if( !fs.existsSync( path ) )
        mkdirp.sync( path );
    });

    return join( path, WebpageMethods.underscore( webpage.name )); 
  }

  SiteFileManager.checkFolders = function( layout ){

    var domainTmplPath = join( contentPath, 'layouts' ); 
    var layoutFile = join( domainTmplPath, layout, layout+'.jade' );

    if( !fs.existsSync( domainTmplPath ) )
      mkdirp.sync( domainTmplPath );

    if( !fs.existsSync( layoutFile ) )
      return 'layout '+layoutFile+' was not found';

    if( !fs.existsSync( publicPath ) )
      mkdirp.sync( publicPath );

    return null;

  };

  function removeZombie( fileName, locale, layout ){
    if( layout !== 'index' && locale && fs.existsSync( fileName ))
      fs.unlinkSync( fileName );   
  }

  return SiteFileManager;

};