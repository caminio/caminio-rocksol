/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-28 15:53:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-29 19:54:20
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async       = require('async'); 
var fs          = require('fs');
var join        = require('path').join;

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
   *  Provides a compile method which compiles one snippet with the given local content.
   *  The content must be passed because snippets without layout dependencies have not 
   *  got any content in their body. 
   *  @class PeRuCompiler
   *  @param path { String } The path to the content directory in 
   *         the file system. Layouts are located in the relative path /layouts. 
   *         Layouts and .js files are both in the same folder and MUST have the 
   *         same name as mentioned in the layout.
   */
  function SiteGenerator( path, type ){
    var PeRuProcessor = require('../pe_ru_bble/pe_ru_bble_processor');
    var Deps = require('./site_dependencies');
    var SiteFileManager = require('./site_file_manager');
    
    fileManager = new SiteFileManager( path, type );
    dependencies = new Deps( caminio );
    processor = new PeRuProcessor( caminio );

    settings = fileManager.getSettings();
  }

  /**
   *  TODO: should automaticly detect which operation should be called
   *
   */
  SiteGenerator.prototype.compile = function( object, options, callback ){
    if( param3 ){
      options = param2;
      callback = param3;
    } else
      callback = param2;

    if( typeof param1 === 'string' )
      compileContent( param1, options, callback );

    else if( param1.isArray )
      async.each( compileObject );
    else
      compileObject( param1 );

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

      [ 'doc', 'webpage', 'ancestors', 'children', 'webpage' ].forEach( function( key ){
        methods.setCurTranslation( options.locals[ key ], options.locale );
      });

      gCompileContent( translation.content, options, function( err, compiledContent ){
        var paths = options.outputPaths ? options.outputPaths : [];

        paths.push( fileManager.getDraftPath( object._id ) );
        if( options.isPublished )
          paths.push( fileManager.getObjectPath( object, options.locals.ancestors ) );
        
        if( object.layout && object.layout.name === 'index' && object.filename === 'index' )
            fileManager.createFiles( compiledContent, null, paths );
        if( object.translations.length > 1 )
          fileManager.createFiles( compiledContent, options.locale, paths );
        else
          fileManager.createFiles( compiledContent, null, paths );    

        nextTranslation();
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
    var operations = [ initRuns ];

    content = settings.contentCompiler.compile( content );

    options.jsFiles = getJsFiles( options.jsFiles, settings, options.layout ); 

    if( options.jsFiles && options.jsFiles.length > 0 )
      operations.push( runJsFiles );

    operations.push( runLayoutCompiler );

    if( content.match(/{{[^{}]*}}/g) !== null )
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

  function getJsFiles( files, settings, layout ){

    // One time layout is an object
    // suddenly it gets transformed into a string ????
    //
    // Why is layoutPath not in layout?
    //
    // eventhough, I'd prefer having layout not an object at all
    // but one key: layoutFile, layoutPath, layoutName, whatever...
    // better readable. { no: { spagetthi: { code: { saying: { easyThings: complicated } } } } };
    //
    // WHY ??? - TH.
    //
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

    if( options.layout.name ){
      var layoutFile = getLayoutPath( options.layout );
      if( fs.existsSync( layoutFile ) )
        layout = fs.readFileSync( layoutFile  );
    }
    var layoutSettings = { filename: layoutFile, pretty: true };

    attributes.t = addI18nSupport( attributes );

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
    processor.startSearch( content, options, function( err, content ){
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

  function addI18nSupport( attrs ){
    if( !attrs.doc )
      return;

    var locale  = attrs.doc.curTranslation.locale;
    console.log('settings', attrs.doc.curTranslation, locale);
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