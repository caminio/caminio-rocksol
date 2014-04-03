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

  var WebpageMethods     = require('./webpage_methods')( caminio );
  var pebbleRubbleSearch = require('./pebble_rubble_search')( caminio );

  /**
   *  runs the generating process
   *  @method compilePage
   *  @param res
   *  @param webpage
   *  @param params.getContent  If true the content is returned as JSON,
   *                            does not effect any changes in the file system   
   *  @param params.isPublished If true File is written into the public path + 
   *                            previews/:id.htm         
   *  @param params.compileChildren
   *  @param params.compileAncestors
   *  @param params.compileSiblings
   *  @param done
   */
  generator.compilePage = function compilePage( res, webpage, params, done ){

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
      WebpageMethods.getAncestorsOfWebpage( webpage, [], next );
    }

    /**
     *  Gets all siblings of the local webpage.
     *  The ancestors are reversed in this function.
     *  @method searchSiblings
     *  @param ancestors array of the ancestors of the local webpage
     *  @param next calls the searchChildren function
     */
    function searchSiblings( ancestors, next ){
      info.ancestors = ancestors.reverse();
      WebpageMethods.getChildrenOfWebpage( info.ancestors[0], next );
    }

    /**
     *  Gets all children of the local webpage
     *  @method searchChildren
     *  @param siblings array of the siblings of the local webpage
     *  @param next calls the generateSite function
     */
    function searchChildren( siblings, next ){
      info.siblings = siblings;
      WebpageMethods.getChildrenOfWebpage( webpage, next );
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
      setUrlPaths( webpage, info );
      compileAll( info.ancestors, info.children, info.siblings, params );

      var water = webpage.translations.map(function(tr){
        return function( nextWater ){
          generateLocaleContent( tr, function(){
            nextWater(null);
          });
        };
      })

      async.waterfall( water, done );

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
    function generateLocaleContent( translation, cbAfterCompile ){
      var locale  = translation.locale;
      var translationFile = join(domain.getContentPath(),'locales',locale);
      var translationStr;
      if( fs.existsSync( translationFile +'.js') ){
        delete require.cache[ translationFile+'.js' ];
        translationStr = require( translationFile );
      }

      var setTrans =  WebpageMethods.setCurrTranslation;
      var options = {
        currentUser: res.locals.currentUser,
        currentDomain: res.locals.currentDomain,

        moment: require('moment'),

        t: function( str ){
          if( translationStr && translationStr[str] )
            return translationStr[str];
          return str;
        },

        ancestors: setTrans( [].concat( info.ancestors ), locale ),
        siblings: setTrans( [].concat( info.siblings ), locale ),
        children: setTrans( [].concat( info.children ), locale ),
        webpage: setTrans( [].concat( webpage ), locale )[0],

        domainSettings: require( res.locals.currentDomain.getContentPath()+'/.settings' ),

        markdownContent: markdown.toHTML( translation.content ),
        translation: {
          locale: locale
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
         WebpageMethods.runJS( webpage, jsFile, options, next );
      }

      /**
       * 
       *  @method runJadeCompiler
       */
      function runJadeCompiler( next ){
        options.translation.content = WebpageMethods.compileJade( layoutFile, options );
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

        if( params.getContent )
          return cbAfterCompile( content );        

        if( noIndexFile( translation ) )
          createFile( content, null );

        if( webpage.translations.length > 1 )
          createFile( content, translation.locale );
        else
          createFile( content, null );

        return cbAfterCompile();          
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
      replaceFilePattern( content );
      output( draftPath() );
      if( params.isPublished ){
        output( publishedPath() );
      }

      function output( fileName ){
        removeZombie( fileName + '.htm', locale );
        fileName += ending;
        fs.writeFileSync( fileName, content );        
      }
    }

    function draftPath(){
      var path = publicPath;
      path = join( path, 'drafts' );
      if( !fs.existsSync( path ) )
        mkdirp.sync( path );
      return join( path, webpage._id.toString() );
    }

    function removeZombie( fileName, locale ){
      if( webpage.layout !== 'index' && locale && fs.existsSync( fileName ))
          fs.unlinkSync( fileName );   
    }

    function publishedPath(){
      var path = publicPath;
      info.ancestors.forEach( function( ancestor ){
        path =  join( path, WebpageMethods.underscore( ancestor.name ) );    
        if( !fs.existsSync( path ) )
          mkdirp.sync( path );
      });
      return join( path, WebpageMethods.underscore( webpage.name )); 
    }

    function setUrlPaths( webpage, info ){
      WebpageMethods.setUrlPath( [ webpage ].concat( info.siblings ), info.ancestors );
      WebpageMethods.setUrlPath( info.children, [ webpage ].concat( info.ancestors ) );
      var ancs = [].concat( info.ancestors );
      ancs.forEach( function( ancestor ){
        ancs.pop();
        WebpageMethods.setUrlPath( [ ancestor ], ancs );
      });      
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


    function compileAll( ancestors, children, siblings, params ){
      var compileParams = {};

      if( params.compileChildren ){
        async.each( children, function( child, next ){
          var options = {
            compileChildren: true
          };
          compilePage( res, child, options, next );
        });
      }      
      if( params.compileAncestors ){
        async.each( ancestors, function( ancestor, next ){
          var options = {};
          compilePage( res, ancestor, options, next );
        });
      }
      if( params.compileSiblings ){
        async.each( siblings, function( sibling, next ){
          var options = {};
          if( sibling.name !== webpage.name )
            compilePage( res, sibling, options, next );
        });
      }
    }

  };

  return generator;
  
};