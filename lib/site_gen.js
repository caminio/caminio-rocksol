/*
 * caminio-rocksol
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 02/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

var siteGen = {};

var jade        = require('jade');
var markdown    = require( "markdown" ).markdown;
var async       = require('async');

var join        = require('path').join;
var fs          = require('fs');
var mkdirp      = require('mkdirp');
var inflection  = require('inflection');

/**
 *  compiles a webpage with all PEPPLES, RUBBLES, COBBLES
 *  @class SiteGen
 */
module.exports = function SiteGen( caminio ){

  'use strict';

  var generator = {};
  var Webpage   = caminio.models.Webpage;
  var Pebble    = caminio.models.Pebble;
  var Mediafile = caminio.models.Mediafile;

  var webpageMethods     = require('./webpage_methods')( caminio );
  var pebbleRubbleSearch = require('./pebble_rubble_search')( caminio );

  /**
   *  runs the generating process
   *  @method compilePage
   *  @param res
   *  @param webpage
   *  @param done
   */
  generator.compilePage = function compilePage( res, webpage, done ){

    var domain = res.locals.currentDomain;
    var domainTmplPath = join( domain.getContentPath(), 'layouts' );  

    var layoutFile = join( domainTmplPath, webpage.layout, webpage.layout+'.jade' );
    var jsFile = join( domainTmplPath, webpage.layout, webpage.layout+'.js');
    var publicPath = join( domainTmplPath, '..', 'public' );

    var info = {};

    init();

    async.waterfall(
      [
        searchAncestors,
        searchSiblings,
        searchChildren
      ],
      generateSite
    );

    /**
     *  checks if the following files and folders
     *  exist: layout folder, layout file, public folder
     *  @method init
     */
    function init(){
      if( !fs.existsSync( domainTmplPath ) )
        mkdirp.sync( domainTmplPath );

      if( !fs.existsSync( layoutFile ) )
        return done('layout '+layoutFile+' was not found');

      if( !fs.existsSync( publicPath ) )
        mkdirp.sync( publicPath );
    }

    /**
     *  Gets all ancestors of the local webpage
     *  @method searchAncestors
     *  @param next calls the searchSiblings function
     */
    function searchAncestors( next ){
      webpageMethods.getAncestorsOfWebpage( webpage, [], next );
    }

    /**
     *  Gets all siblings of the local webpage
     *  @method searchSiblings
     *  @param ancestors array of the ancestors of the local webpage
     *  @param next calls the searchChildren function
     */
    function searchSiblings( ancestors, next ){
      info.ancestors = ancestors;
      webpageMethods.getChildrenOfWebpage( info.ancestors[0], next );
    }

    /**
     *  Gets all children of the local webpage
     *  @method searchChildren
     *  @param siblings array of the siblings of the local webpage
     *  @param next calls the generateSite function
     */
    function searchChildren( siblings, next ){
      info.siblings = siblings;
      webpageMethods.getChildrenOfWebpage( webpage, next );
    }

    /**
     *
     *  @method generateSite
     *  @param err error that occured through waterfall
     *  @param children array of children of the local webpage
     */
    function generateSite( err, children ){
      if( err ){ error( 'error_while_getting_webpage', err );}
      info.children = children;
      async.each( webpage.translations, generateLocaleContent, done );
    }

    /**
     *  Generates a htm file with the locale language
     *  If the layout index is choosen this method will also 
     *  create a non language specific htm file.
     *  The language of the pebbles and cobbles translations 
     *  will be the same.
     *  @method generateLocaleContent
     *  @param translation the current translation
     *  @param translation.locale the language of the current translation
     *  @param translation.content content of the current translation
     */
    function generateLocaleContent( translation, next ){
      var options = {
        currentUser: res.locals.currentUser,
        currentDomain: res.locals.currentDomain,

        ancestors: info.ancestors,
        siblings: info.siblings,
        children: info.children,

        webpage: webpage,
        markdownContent: markdown.toHTML( translation.content ),
        translation: {
          locale: translation.locale
        }
      };

      async.waterfall(
        [
          getMediaFiles,
          runJSFile,
          runJadeCompiler,
          runPeRuSearch,
        ],
        finish
      );

      /**
       *  Collects all media files linked to the local webpage
       *  @method getMediaFiles
       *  @param next calls the runJSFile function
       */
      function getMediaFiles( next ){
        Mediafile.find({ parent: webpage._id})
        .exec( function( err, files ){
          options.files = files;
          next();
        });
      }

      /**
       *
       *  @method runJSFile
       *
       */
      function runJSFile( next ){
         webpageMethods.runJS( webpage, jsFile, options, next );
      }

      /**
       * 
       *  @method runJadeCompiler
       */
      function runJadeCompiler( next ){
        options.translation.content = webpageMethods.compileJade( layoutFile, options );
        next();
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

      /** 
       *  Calls the createFile function if no error occured
       *  @method finish
       *  @param err error that occured through waterfall
       *  @param content content that shoult be written to the file
       */
      function finish( err, content ){
          error( 'error while building site', err );

          if( noIndexFile( translation ) )
            createFile( content, null );

          if( webpage.translations.length > 1 )
            createFile( content, translation.locale );
          else
            createFile( content, null );

          next();
      }

    }      

    /**
     *  Checks if a index htm file without language ending has
     *  already been created.
     *  @method noIndexFile
     *  @return Boolean false if it exists, otherwise true
     */
    function noIndexFile( translation ){
      if( webpage.layout === 'index' && ( translation.locale  === res.locals.currentDomain.lang ) )
          return true;
      return false;
    }    

    /**
     *  TODO docu
     *  @method replaceFilePattern
     *  @param content
     */
    function replaceFilePattern( content ){
      var domainFilePattern = new RegExp('/caminio/domains/'+res.locals.currentDomain._id+'/preview', 'g');
      return content.replace(domainFilePattern, './files');
    }

    /**
     *
     *  @method createFile
     *  @param content
     *  @param translation
     *  @param langs true if webpage has got more than one language
     */
    function createFile( content, locale ){  
      var ending = locale ? '.' + locale + '.htm' : '.htm';
      var fileName = join(  
        getFolder( publicPath, info.ancestors ), 
        inflection.underscore( webpage.name ) + ending 
      );
      replaceFilePattern( content );
      fs.writeFileSync( fileName, content );
    }

    function getFolder( path, ancestors ){
      ancestors.reverse().forEach( function( ancestor ){
        path +=  '/' + ancestor.name;
      });
      if( !fs.existsSync( path ) )
        mkdirp.sync( path );
      return path;
    }

    /**
     *  Error handling  TODO: number as param
     *  @method error
     *  @param err the error message
     *  @param details the error details
     */
    function error( err, details ){
      if( details )
        return res.json( 500, { error: err, details: details }); 
    }

  };

  return generator;
  
};