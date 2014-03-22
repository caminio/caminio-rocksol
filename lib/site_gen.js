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
var pebbleGen   = require('./pebble_gen');

module.exports = function SiteGen( caminio ){

  'use strict';

  var generator = {};
  var Webpage = caminio.models.Webpage;
  var Pebble = caminio.models.Pebble;

  /**
   * compile a webpage
   * TODO: get files
   */
  generator.compilePage = function compilePage( res, webpage, cb ){
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
    getParents( webpage, [], getSiblings );

    function init(){
      if( !fs.existsSync( domainTmplPath ) )
        mkdirp.sync( domainTmplPath );

      if( !fs.existsSync( layoutFile ) )
        return cb('layout '+layoutFile+' was not found');

      if( !fs.existsSync( publicPath ) )
        mkdirp.sync( publicPath );
    }

    function getSiblings( arr ){
      options.ancestors = arr;
      getWebpages( options.ancestors[0], getChildren );
    }

    function getChildren( arr ){
      options.siblings = arr;
      getWebpages( webpage, run );
    }

    function run( arr ){
      options.children = arr;

      if( webpage.translations.length > 1 )
        langs = true;

      webpage.translations.forEach( function( translation) {
        options.files = null; //TODO
        options.markdownContent = markdown.toHTML( translation.content );
        options.translation = translation;
        translation.content = compile( layoutFile, options );
        lookForPebbles( translation, pebblePath, options, function( content ){
          console.log('the content from the pebbles: ', content);
          createFile( content );
        });

      });
      
      cb( null );
    }

    function replaceFilePattern( content ){
      var domainFilePattern = new RegExp('/caminio/domains/'+res.locals.currentDomain._id+'/preview', 'g');
      return content.replace(domainFilePattern, './files');
    }

    function createFile( content ){  
      var ending = langs ? '.' + translation.locale + '.htm' : '.htm';
      var fileName = join(publicPath, inflection.underscore( webpage.name ) + ending );
      replaceFilePattern( content );

      if( webpage.layout === 'index' )
        fileName = join( publicPath, 'index' + ending );

      fs.writeFileSync( fileName, content );
    }

    // GETTERS 

    function getParents( webpage, arr, cb ){
      if( !webpage.parent ){
        return cb( arr );
      }

      webpage.populate('parent', function( err, webpage ){
        error('error while getting parent', err);
        if( webpage.parent )
          arr.push( webpage.parent );
        getParents( webpage.parent, arr, cb );
      });
    }

    function getWebpages( parent, cb ){
      if( parent === undefined )
        cb( [] );
      Webpage.find({ parent: parent })
      .exec( function( err, siblings ){
        error( 'error while getting webpages', err);
        cb( siblings );
      });
    }

    // ERROR MANAGEMENT

    function error( err, details ){
      if( details )
        return res.json( 500, { error: err, details: details }); 
    }

  };

  return generator;


  //
  // PRIVATE METHODS
  //

  function lookForPebbles( translation, path, options, done ){

    var pebbleRegex = /[Pp][Ee][Bb][Bb][Ll][Ee](:|( :))/;
    var first = true;
    var locale = translation.locale;
    var content = translation.content;
    work( content, done );

    function work( pebble, cb ){
      var pebbleNames = [];
      var pebbleList = [];
      if( !first )
        translation = getElement( pebble.translations, 'locale', locale );
      var localContent = translation.content;
      var pebbles = localContent.match(/{{[^{}]*}}/g);

      if( pebbles && pebbles.length ){
        pebbles.forEach( function( pebble ){
          addToList( pebble );
        });

        first = false;
        findPebbles( pebbleNames, pebbleList, done );
      } else if( first ){
        done( content );
      } else {      
        finish( pebble.meta, localContent, cb );
      }

      function addToList( thePebble ){
        var currPebble = {};
        currPebble.old = thePebble;
        thePebble = thePebble.replace('{{','').replace('}}','');
        var options = thePebble.split(',');
        var name = options[0];
        if( name.match( pebbleRegex ) ){
          name = name.split(':')[1].replace(" ", "");
          pebbleNames.push( name );
          currPebble.name = name;
          options.shift();
          currPebble.options = options;
          pebbleList.push( currPebble );
        }
      }
    }

    function findPebbles( pebbleNames, list, done ){
      Pebble.find({ name: { $in: pebbleNames }})
      .exec( function( err, pebbles ){
        async.forEach( pebbles, doing, ending );

        function doing( pebble, next ){
          pebble.meta = getElement( list, 'name', pebble.name );//TODO
          work( pebble, next );               
        }

        function ending(){
          done( content );
        }
        
      });
    }

    function finish( pebble, localContent, next ){
      options.markdownContent = markdown.toHTML( localContent );
      var there = path + pebble.name +".js";
      runJS( there, null, function(){
        content = content.replace( pebble.old, 
          compile( path + "/" + pebble.name +".jade", options )
        );
        next(); 
      });
    }
  }

  function setOptions( options ){
    return  "file head" + "\n";
  }

  function getElement( array, param, value ){
    var element;
    array.forEach( function( elem ){
      if( elem[param] === value ){
        element =  elem;
      }
    });
    return element;
  }

  function compile( layoutFile, attributes ){
    var jadeCompiler = jade.compile( 
      fs.readFileSync( layoutFile ), 
      { filename: layoutFile, pretty: true } 
    );
    return jadeCompiler( attributes );
  }

  function runJS( jsFile, options, next ){
    if( fs.existsSync( jsFile ) ){
      var js = require( jsFile )(caminio);
      js.run( options, next );
    }
  }
  
};