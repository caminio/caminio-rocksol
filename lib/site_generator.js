/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-15 00:24:25
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-15 16:39:54
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require('async'); 
var caminio;
var WebpageMethods;

var options;
var error = { 
  no_locale: "no_locale_given_and_multiple_translations",
  no_layout: "no_layout_name_given",
  no_content_path: "no_content_path_given" 
};

/**
 *  Provides a compile method which compiles one snippet with the given local content.
 *  The content must be passed because snippets without layout dependencies have not 
 *  got any content in their body. 
 *  @class PeRuCompiler
 */
function SiteGenerator( options, caminio_ ){
  options = options;
  caminio = caminio_;  
  webpageMethods = require('./webpage_methods')( caminio );
}


SiteGenerator.prototype.compile = function( param1, param2, param3 ){
  var callback;

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

  function compileObject( object, next ){
    var string;
    if( translations.length === 1 )
      options.locale = object.translations[0].locale;
    if( !options.locale ) 
      callback( error.no_locale );
    else
      string = "";//TODO


    // Get dependencies

    this.compile( string, options, next );
  }

};

/**
 *
 *  @method compileContent
 *  @param content { String } The content that should be compiled
 *  @param options.contentPath The path to the content directory in the file 
 *         system. Layouts are located in the relative path /layouts. Layouts
 *         and .js files are both in the same folder and MUST have the same name
 *         as mentioned in the layout.
 *  @param options.layout.name The name of the layout file
 *  @param options.layout.type Default is JADE, if another type is set another
 *         layout compiler can be called.
 *  @return { { Object }, { String } } The compiled content and an error object.
 */
SiteGenerator.prototype.compileContent = function( content, options, callback ){
  optionsCheck();

  async.waterfall([
    initRuns,
    runJsFiles,
    runLayoutCompiler,
    runPebbleRubbleProcessor,
    runParsers
  ], callback );

  function initRuns( start ){
    start( null, content, options );
  }

  function optionsCheck(){
    if( !options.locale ) 
      callback( error.no_locale, content );
    if( !options.layout || !options.layout.name )
      callback( error.no_layout, content );
    if( !options.contentPath )
      callback( error.no_content_path, content );
  }

};

function runJsFiles( content, options, next ){

  next( null, content, options );
}

function runLayoutCompiler( content, options, next ){

  next( null, content, options );  
}


function isArray( object )
{
  if ( object.constructor === Array ) 
    return true;
  return false;
}

function jsFunction( jsFile, options ){
  WebpageMethods.runJS( webpage, siteFileManager.jsFile, options, function(){
    next();
  });
}

/**
 * 
 *  @method runJadeCompiler
 */
function runLayoutCompiler( content, options, next ){
  content = WebpageMethods.compileJade( options.layout.file, options );
  next( content, options );
}

      /**
       *  Runs the function to replace all pebbles, rubbles and
       *  cobbles with the defined content in the translations 
       *  as well as in the layout.
       *  @method runPeRuSearch
       *  @param next calls the finish function
       */
      function runPeRuSearch( next ){
        pebbleRubbleSearch.init( domain.getContentPath(), options, next );
        //next( null, options.translation.content);
      }


function compileSnippetArray( snippet, index ){
  return function( localContent, nextSnippet ){
    snippet.index = index;
    attributes.snippet = snippet;
    runCompile( snippet, function( err, compiledContent ){
      localContent += compiledContent;
      delete webpageAttributes.snippet;
      nextSnippet( err, localContent );
    });
  };
}