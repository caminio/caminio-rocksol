/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-28 15:53:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-28 15:07:24
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

'use strict';

var async       = require('async'); 
var fs          = require('fs');
var join        = require('path').join;
var normalize   = require('path').normalize;
var mkdirp      = require('mkdirp');
var uploader    = require('./../upload/upload_manager')();

module.exports = function( caminio ){

  var error = { 
    no_locale: "no_locale_given_and_none_or_multiple_translations",
    no_layout: "no_layout_name_given",
    no_content_path: "no_content_path_given",
    no_translations: "object_has_no_translation" 
  };

  var dependencies,
      fileManager;

  var methods = require('./site_methods');
  var settings = {};
  var gCompileContent;

  /**
   *  
   *  @class SiteGenerator
   *  @constructor
   *  @param path { String } The path to the content directory in the file 
   *         system. Layouts are located in the relative path /layouts. 
   *         Layouts and .js files are both in the same folder and MUST have the 
   *         same name as mentioned in the layout.
   *  @param namespace { String } Defines a namespacing folder. If the folder 
   *         contains a layout directory the layout path is set to this directory,
   *         otherwise the standard path is choosen. If the folder contains a 
   *         .settings.js file the settings are read and written into the the local
   *         settings variable. The value 'public' can define an alternative public 
   *         path
   *          
   */
  function SiteGenerator( path, namespace ){
    var SiteFileManager = require('./site_file_manager');
    
    dependencies = require('./site_dependencies')( caminio );

    fileManager = new SiteFileManager( path, namespace );

    settings = fileManager.getSettings();

    gCompileContent = require('./site_content_compiler')( settings, methods, caminio );
  }

  /**
   *  @method compile
   *  @param input { undefined } Can be a string, an object or an array of 
   *         objects. The objects must be database objects to be compatible
   *         with the generator.
   *  @param options { undefined } Can be an options object or an callback 
   *         function.
   *  
   */
  SiteGenerator.prototype.compile = function( input, options, callback ){
    if( !callback ){
      options = {};
      callback = options;
    }

    if( typeof input === 'string' )
      gCompileContent( input, options, callback );
    else if( input.isArray )
      gCompileArray( input, options, callback );
    else
      gCompileObject( input, options, callback );

  };

  SiteGenerator.prototype.compileArray = gCompileArray;

  function gCompileArray( array, options, callback ){
    async.eachSeries( array, function( object, done ){
      gCompileObject( object, options, done );
    }, callback );
  }

  /**
   *  @method compileObject
   *  @param options.locals The local parameters that should be passed while
   *         compileing and running the JS files.
   *
   *
   */
  SiteGenerator.prototype.compileObject = gCompileObject; 

  function gCompileObject( object, options, callback ){
    options.locals.doc = object;

    if( !object.translations ) 
      return callback( error.no_translations, object );

    var operations = [ init, getDependencies ];

    if( options.compileDeps )
      operations.push( compileAll );

    operations.push( compileTranslations );

    async.waterfall( operations, callback );

    function init( cb ){
      cb( null, object, options );
    }

  }

  /**
   *  
   *  @method compileLayout
   *  @param layout
   *  @param options { Object }
   *  @param callback { Function }
   */
  SiteGenerator.prototype.compileLayout = gCompileLayout; 

  function gCompileLayout( layout, options, callback ){
    if( !options.layout )
      options.layout = { name: layout };
    options.currentObject = { filename: layout };
    gCompileContent( '', options, function( err, compiledContent ){
        var paths = options.outputPaths ? options.outputPaths : [];
        paths.push( fileManager.getDraftPath( layout ) );
        if( settings.public )
          paths.push( join( options.contentPath, 'public', settings.public, layout ) );
        //fileManager.createFiles( compiledContent, options.locale, paths, options.locals.currentDomain );

        output( options, compiledContent, paths, callback );

    });      
  }


  /**
   *  Compiles the given content with different options and returns the compiled
   *  content. If no other options specified it will be compiled with a jade 
   *  compiler.
   *  @method compileContent
   *  @param content { String } The content that should be compiled
   *  @param options.locals The attributes that schould be passed to the compilers
   *         like dependencies and current translations.
   *  @param options.locale The locale of the content.This MUST be set in case 
   *         there are subelements like pebbles with translations. 
   *  @param options.layout.name The name of the layout file, if this is unset or 
   *         there is no such layout file in the filesystem the compiler will get 
   *         the content stored in layoutContent.
   *  @param options.layout.content Can be set as default layout for the compiler
   *         in case that the layout file is not found. It can also be used to 
   *         format data without creating layout files. In case this variable is
   *         not set the default layout will be '!=markdownContent'.
   *  @param options.currentObject Holds the data about the content like name or
   *         translations.
   *  @param options.jsFiles
   *  @return { { Object }, { String } } The compiled content and an error object.
   *
   *  @example
   *
   *  In the following example the compiler will first look for a layout file in 
   *  the content path. In case there is no layoutfile he will take the format 
   *  specified in the content variable.
   *      layout = {
   *        name: 'aLayout',
   *        content: 'h1=markdownContent'
   *      }
   *    
   */
  SiteGenerator.prototype.compileContent = function( content, options, callback ){
    gCompileContent( content, options, callback );
  };

  function compileTranslations( object, options, callback ){

    fileManager.cleanDirectory( fileManager.getAncestorPath( options.locals.ancestors ), object.filename );

    async.eachSeries( object.translations, function( translation, nextTranslation ){

      options.locale = translation.locale;
      options.jsFiles = [];
      
      if( typeof(object.layout) === 'string' )
        options.layout = { name: object.layout };
      else
        options.layout = options.layout || {};

      options.currentObject = object;

      [ 'doc', 'ancestors', 'children', 'siblings' ].forEach( function( key ){
        methods.setCurTranslation( options.locals[ key ], options.locale, options.locals.currentDomain.lang );
      });
      
      gCompileContent( translation.content, options, function( err, compiledContent ){

        if( settings.upload )
          fileUpload( options, compiledContent, nextTranslation );
        else
          fileOutput( options, compiledContent, object, nextTranslation );

      });      
    }, callback );
  }

  function output( options, compiledContent, paths, next ){
    var currentDomain = options.locals.currentDomain;

    if( currentDomain.isCaminioHosted ){ 
      fileManager.createFiles( compiledContent, options.locale, paths, options.locals.currentDomain );
      next();
    } else
      fileUpload( options, compiledContent, next );

  }

  function getDependencies( object, options, callback ){
    dependencies.getDependencies( object, function( err, deps ){
      
      options.locals = options.locals || {};
      
      for( var i in deps )
        options.locals[i] = deps[i];

      callback( null, object, options );
    });
  }

  function compileAll( object, options, callback ){
    async.eachSeries( options.compileDeps, function( dep, next ){
      gCompileArray( dep, {}, next );
    }, function(){
      callback( null, object, options );
    });
  }

  function fileOutput( options, compiledContent, object, next ){
    var paths = options.outputPaths ? options.outputPaths : [];

    paths.push( fileManager.getDraftPath( object._id ) );

    if( options.isPublished )
      paths.push( fileManager.getObjectPath( object, options.locals.ancestors ) );
    fileManager.createFiles( compiledContent, options.locale, paths, options.locals.currentDomain );
    next();
  }

  function fileUpload( options, compiledContent, next ){
    var filePath = join( normalize(options.contentPath), 'upload');
    if( !fs.existsSync( filePath ) )
      mkdirp.sync( filePath );

    filePath = join( filePath, options.currentObject.filename );

    fileManager.createFiles( compiledContent, null, [ filePath ] );

    try{
      var domain = options.locals.currentDomain;
      var destination = settings.public ? domain.remoteAddr + settings.public + '/' : domain.remoteAddr;
      uploader.uploadFile(filePath + '.htm', destination, function( err ){
        next();
      });
    } catch( ex ){
      console.log(ex);
      next();
    }
  }

  return SiteGenerator;

};
