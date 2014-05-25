/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-28 15:53:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-25 22:29:04
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

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
      processor,
      fileManager;

  var methods = require('./site_methods');
  var settings = {};

  /**
   *  // TODO: is Published
   *  @class PeRuCompiler
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
    var PeRuProcessor = require('../pe_ru_bble/pe_ru_bble_processor');
    var SiteFileManager = require('./site_file_manager');
    
    dependencies = require('./site_dependencies')(caminio);

    fileManager = new SiteFileManager( path, namespace );
    processor = new PeRuProcessor( caminio );

    settings = fileManager.getSettings();
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
      compileContent( input, options, callback );
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

  function compileTranslations( object, options, callback ){
    var gen = this;

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

        if( settings.upload ){
          var filePath = join( normalize(options.contentPath), 'upload');
          if( !fs.existsSync( filePath ) )
            mkdirp.sync( filePath );

          filePath = join( filePath, options.currentObject.filename );


          fileManager.createFiles( compiledContent, null, [ filePath ] );

          try{
            uploader.uploadFile(filePath + '.htm',options.locals.currentDomain.remoteAddr, function( err ){
              nextTranslation();
            })
          } catch( ex ){
            console.log(ex);
            nextTranslation();
          }

        } else {

          var paths = options.outputPaths ? options.outputPaths : [];

          paths.push( fileManager.getDraftPath( object._id ) );

          if( options.isPublished )
            paths.push( fileManager.getObjectPath( object, options.locals.ancestors ) );
      
          if( object.translations.length > 1 )
            fileManager.createFiles( compiledContent, options.locale, paths, options.locals.currentDomain );
          else
            fileManager.createFiles( compiledContent, null, paths, options.locals.currentDomain  );
          nextTranslation();

        }    

      });      
    }, callback );
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
  SiteGenerator.prototype.compileContent = gCompileContent;

  function gCompileContent( content, options, callback ){

    // if( options.locale ){
    //   options.locals.doc.curLang = options.locale;
    //   options.locals.webpage.curLang = options.locale;
    // }

    var operations = [ initRuns ];

    content = settings.contentCompiler.compile( content );
    if( options.currentObject )
      content = '<div id=markdown_' + options.currentObject._id + '>' + content + '</div>';

    options.jsFiles = getJsFiles( options.jsFiles, settings, options.layout ); 

    if( options.jsFiles && options.jsFiles.length > 0 )
      operations.push( runJsFiles );

    operations.push( runLayoutCompiler );
    operations.push( runPebbleRubbleProcessor );

    if( options.parsers && options.parsers.length > 0 )
      operations.push( runParsers );

    async.waterfall( operations, callback );

    function initRuns( start ){ 
      if( !options.layout )
        options.layout = {};
      start( null, content, options );
    }

  }

  /**
   *
   *
   */
  function getJsFiles( files, settings, layout ){

    layout = ( layout && layout.name ) ? layout.name : '';

    var layoutPath = settings.layoutPath;

    var jsFiles = {
      layoutFile: join( layoutPath, layout, layout + '.js' ),
      applicationFile: join( layoutPath, 'application.js' ),
      domainFile: join( settings.domainPath, 'domain.js' )
    };

    files = files || [];

    for( var key in jsFiles ){
      if( fs.existsSync( jsFiles[key] ) )
        files.unshift( jsFiles[key] );
    }

    return files;
  }

  /**
   *  @method runJsFiles
   *  @param content
   *  @param options.currentObject Is passed to the js file. In the most cases
   *         this will be a webpage object. If no currentObject is passed, an
   *         empty one is created by default.
   *  @param options.jsFiles An array of filepaths. All given files shoult be 
   *         runned if they exist.
   *  @param done
   */
  function runJsFiles( content, options, done ){  
    if( !options.currentObject )
      options.currentObject = {};
    var jsRunner = methods.jsRunner( caminio );

    async.eachSeries( options.jsFiles, function( jsFile, next){
      jsRunner.run( options.currentObject, jsFile, options.locals, next );
    }, function(){
      done( null, content, options );
    });
  }

  /**
   *  TODO: implement the different compilers
   *  @methdo runLayoutCompiler
   *  @param content
   *  @param options
   *  @param done
   */  
  function runLayoutCompiler( content, options, done ){
    var fs = require('fs');
    var layout =  '!=markdownContent';
    var attributes = options.locals ? options.locals : {};

    attributes.markdownContent = content;

    if( options.layout.content )
      layout = options.layout.content;

    var layoutFile;
    if( options.layout.name ){
      layoutFile = getLayoutPath( options.layout );
      if( fs.existsSync( layoutFile ) )
        layout = fs.readFileSync( layoutFile  );
    }
    var layoutSettings = { filename: layoutFile, pretty: true };

    attributes.t = addI18nSupport( attributes );
    attributes.linkHelper = addLinkHelper( attributes );

    content =  settings.layoutCompiler.compile( layout, layoutSettings )( attributes );
    
    done( null, content, options );  
  }

  function getLayoutPath( layout ){
    return join( 
      settings.layoutPath,
      layout.name,
      layout.name + '.jade' );
  }

  /**
   *  Replaces all pebble and rubble snippets.
   *  @method runPebbleRubbleProcessor
   *  @param content
   *  @param options
   *  @param done
   */
  function runPebbleRubbleProcessor( content, options, done ){
    options.contentPath = settings.domainPath;

    var runners = {
      runJS: methods.jsRunner( caminio ),
      contentCompiler: settings.contentCompiler,
      layoutCompiler: settings.layoutCompiler
    }

    options.methods = runners;

    processor.startSearch( content, options, function( err, content ){
      //console.log('after running the pe_ru_bble_processor: ',  content );  
      done( null, content, options );    
    });
  }

  /**
   *  TODO: implement the different parsers
   *  @method runParsers
   *  @param content
   *  @param options
   *  @param done
   */
  function runParsers( content, options, done ){
    // FOR FUTURE PARSERS
    done( null, content, options );    
  }

  function addLinkHelper( attrs ){
    if( !attrs.doc )
      return;

    var defaultLocale = attrs.doc.curTranslation.locale;
    var join = require('path').join;
    var normalizeFilename = require('caminio/util').normalizeFilename;

    return function( name, namespace, extension, locale ){

      locale = locale || defaultLocale;
      
      var path = '/';
      extension = extension || '.htm';

      if( namespace )
        path = join( path, namespace );

      var file = join( path, name );

      if( fs.existsSync( join( attrs.currentDomain.getContentPath(), 'public', file + extension + '.' + locale) ) ||
          fs.existsSync( join( attrs.currentDomain.getContentPath(), 'public', file + extension ) ) )
        return join('/', locale, file);

      return '/404.htm';
      
    };

  }

  function addI18nSupport( attrs ){
    if( !attrs.doc )
      return;

    var locale  = attrs.doc.curTranslation.locale;
    var translationFile = join( settings.domainPath, 'locales',locale);
    var translationStr;
    if( fs.existsSync( translationFile +'.js') ){
      if( caminio.env === 'development' )
        delete require.cache[ translationFile+'.js' ];
      translationStr = require( translationFile );
    }

    return function( str ){
      if( translationStr && translationStr[str] )
        return translationStr[str];
      return str;
    }

  }

  return SiteGenerator;

}