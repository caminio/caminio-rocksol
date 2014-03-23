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


// TODO: insert pebbleGen again
// var pebbleGen   = require('./pebble_gen');

module.exports = function SiteGen( caminio ){

  'use strict';

  var generator = {};
  var Webpage   = caminio.models.Webpage;
  var Pebble    = caminio.models.Pebble;

  var genMethods  = require('./gen_methods')( caminio );
  var pebbleGen   = require('./pebble_gen')( caminio );

  /**
   * compile a webpage
   * TODO: get files
   */
  generator.compilePage = function compilePage( res, webpage, done ){

    var domain = res.locals.currentDomain;
    var domainTmplPath = join( domain.getContentPath(), 'layouts' );  

    var layoutFile = join( domainTmplPath, webpage.layout+'.jade' );
    var pebblePath = join( domain.getContentPath(), '/pebbles/');
    var jsFile = join( domainTmplPath, webpage.layout+'.js');
    var publicPath = join( domainTmplPath, '..', 'public' );
    var options = { 
      currentDomain: domain,
      currentUser: res.locals.currentUser,
      webpage: webpage 
    };

    var langs = false;

    init();

    async.waterfall(
      [
        searchAncestors,
        searchSiblings,
        searchChildren
      ],
      generateSite
    );

    function init(){
      if( !fs.existsSync( domainTmplPath ) )
        mkdirp.sync( domainTmplPath );

      if( !fs.existsSync( layoutFile ) )
        return cb('layout '+layoutFile+' was not found');

      if( !fs.existsSync( publicPath ) )
        mkdirp.sync( publicPath );
    }

    function searchAncestors( next ){
      genMethods.getAncestorsOfWebpage( webpage, [], next );
    }

    function searchSiblings( arr, next ){
      options.ancestors = arr;
      genMethods.getChildrenOfWebpage( options.ancestors[0], next);
    }

    function searchChildren( arr, next ){
      options.siblings = arr;
      genMethods.getChildrenOfWebpage( webpage, next );
    }

    function generateSite( err, arr ){
      if( err ){ error( 'error_while_getting_webpage', err );}
      options.children = arr;

      if( webpage.translations.length > 1 )
        langs = true;

      async.each( webpage.translations, generateLocaleContent, done );

      function generateLocaleContent( translation, next ){ 
        options.files = null; //TODO
        options.markdownContent = markdown.toHTML( translation.content );
        options.translation = translation;
        genMethods.runJS( jsFile, options, function(){
          translation.content = genMethods.compileJade( layoutFile, options );
          pebbleGen.lookForPebbles( translation, pebblePath, options, function( content ){
            if( noIndexFile )
              createFile( content, translation, false );
            createFile( content, translation );
            next();
          });
        });

      }      

      function noIndexFile(){
        var indexFile = join(publicPath, inflection.underscore( webpage.name ) + '.htm' );
        if( webpage.layout === 'index' && !(fs.existsSync( indexFile )) ) 
          if( translation.locale  === res.locals.currentDomain.lang )
            return true;
        return false;
      }

    }

    function replaceFilePattern( content ){
      var domainFilePattern = new RegExp('/caminio/domains/'+res.locals.currentDomain._id+'/preview', 'g');
      return content.replace(domainFilePattern, './files');
    }

    function createFile( content, translation, langs ){  
      var ending = langs ? '.' + translation.locale + '.htm' : '.htm';
      var fileName = join(publicPath, inflection.underscore( webpage.name ) + ending );
      replaceFilePattern( content );
      fs.writeFileSync( fileName, content );
    }

    // ERROR MANAGEMENT

    function error( err, details ){
      if( details )
        return res.json( 500, { error: err, details: details }); 
    }

  };

  return generator;
  
};