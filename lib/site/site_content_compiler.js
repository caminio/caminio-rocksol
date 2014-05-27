/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-27 15:27:17
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-27 15:43:23
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

 'use strict';

 var async = require('async');
 var join  = require('path').join;
 var fs    = require('fs');

 module.exports = function( settings, methods, caminio ){

  var PeRuProcessor = require('../pe_ru_bble/pe_ru_bble_processor');
  var processor = new PeRuProcessor( caminio );

  function compileContent( content, options, callback ){

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
    attributes.linkHelper = methods.addLinkHelper( attributes );

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
    };

    options.methods = runners;

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
  };   

}

  return compileContent;

};