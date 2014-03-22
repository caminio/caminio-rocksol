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

      webpage.translations.forEach(function(translation){
        //work( translation.content, function(){
          options.markdownContent = markdown.toHTML( replaceFilePattern( translation.content ) );
          options.translation = translation;
          createFile( translation.content, translation );

        //});

      });
      
      cb( null );
    }

    function replaceFilePattern( content ){
      var domainFilePattern = new RegExp('/caminio/domains/'+res.locals.currentDomain._id+'/preview', 'g');
      return content.replace(domainFilePattern, './files');
    }

    function createFile(){  
      var ending = langs ? '.' + translation.locale + '.htm' : '.htm';
      var fileName = join(publicPath, inflection.underscore( webpage.name ) + ending );
      options.fiels = null; //TODO

      if( webpage.layout === 'index' )
        fileName = join( publicPath, 'index' + ending );

      fs.writeFileSync( fileName, compile( layoutFile, options ) );
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

  function lookForPebbles( content, path, locale, done ){
    var first = true;

    work( content, done );

    function work( pebble, done ){
      var pebbleNames = [];
      var pebbleList = [];
      var translation = getElement( pebble.translations, 'locale', locale );
      pebbles = translation.content.match(/{{[^{}]*}}/g);
      pebbles.forEach( function( pebble ){
        addToList();
      });

      if( pebbles.length ){
        first = false;
        findPebbles( pebbles, pebbleList, done );
      }

      if( first )
        done( content );

      finish( pebble.name );

      function addToList(){
        var currPebble = {};
        pebble = pebble.replace('{{','').replace('}}','');
        var options = pebble.split(',');
        var name = options[0].split(':')[1].replace(" ", "");
        if( name.match( pebbleRegex ) ){
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
          work( getElement( list, 'name', pebble.name ), next );               
        }

        function ending(){
          done( content );
        }
        
      });
    }

    function finish( name ){
      runJS( path + "/" + name +".js", function(){
        content = content.replace( "{{" + pebble + "}}", 
          compile( path + "/" + name +".jade", translation.content ) 
        );
        done(); 
      });
    }
  }

  function setOptions( options ){
    return  "file head" + "\n";
  }


  function getElement( array, param, value ){
    return array.find( function( elem ){
      return elem[param] === value;
    });
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