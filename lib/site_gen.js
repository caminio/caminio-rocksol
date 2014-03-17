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

var join        = require('path').join;
var fs          = require('fs');
var mkdirp      = require('mkdirp');
var inflection  = require('inflection');

module.exports = function SiteGen( caminio ){

  'use strict';

  var generator = {};

  /**
   * compile a webpage
   * TODO: get files
   */
  generator.compilePage = function compilePage( res, webpage, cb ){
    var Webpage = caminio.models.Webpage;
    var domain = res.locals.currentDomain;
    var domainTmplPath = join( domain.getContentPath(), 'layouts' );    
    var layoutFile = join( domainTmplPath, webpage.layout+'.jade' );
    var publicPath = join( domainTmplPath, '..', 'public' );
    var parents,
        children,
        siblings;

    init();
    getParents( webpage, [], [], getSiblings );

    function init(){
      if( !fs.existsSync( domainTmplPath ) )
        mkdirp.sync( domainTmplPath );

      if( !fs.existsSync( layoutFile ) )
        return cb('layout '+layoutFile+' was not found');

      if( !fs.existsSync( publicPath ) )
        mkdirp.sync( publicPath );
    }

    function getSiblings( err, arr ){
      if( err ){ return res.json( 500, { error: 'error', details: err.join(';') }); }
      parents = arr;
      getWebpages( parents[0], getChildren );
    }

    function getChildren( err, arr ){
      if( err ){ return res.json( 500, { error: 'error', details: err }); }
      siblings = arr;
      getWebpages( webpage, run );
    }

    function run( err, arr ){
      if( err ){ return res.json( 500, { error: 'error', details: err }); }
      children = arr;

      if( webpage.translations.length > 1 )
        webpage.translations.forEach(function(translation){
          createFile( translation, translation.locale );
        });

      var translation = webpage.translations[0];

      createFile( translation );
      
      cb( null );
    }

    function createFile( translation, locale ){

      var jadeCompiler = jade.compile( fs.readFileSync( layoutFile ), { filename: layoutFile, pretty: true } );  
      var ending = locale ? '.' + locale + '.htm' : '.htm';
      var fileName = join(publicPath, inflection.underscore( webpage.name ) + ending );
      var content = translation.content;
      var domainFilePattern = new RegExp('/caminio/domains/'+res.locals.currentDomain._id+'/preview', 'g');

      content = content.replace(domainFilePattern, './files');

      if( webpage.layout === 'index' )
        fileName = join( publicPath, 'index' + ending );
      console.log(parents, siblings, children);
      fs.writeFileSync( 
        fileName, 
        jadeCompiler({ 
          domain: domain, 
          user: res.locals.currentUser,
          webpage: webpage,
          siblings: siblings,
          parents: parents,
          children: children,
          files: null,
          markdownContent: markdown.toHTML( content ),
          translation: translation
        }) 
      );
    }

    function getParents( webpage, arr, err, cb ){
      if( !webpage.parent )
        return cb( err, arr );
      webpage.populate('parent', function( err, webpage ){
        if( err ){ err.push( err ); }
        if( webpage.parent )
          arr.push( webpage );
        getParents( webpage.parent, arr, err, cb );
      });
    }

    function getWebpages( parent, cb ){
      Webpage.find({ parent: parent })
      .exec( function( err, siblings ){
        if( err ){ next( err ); }
        cb( null, siblings );
      });

    }

  };

  return generator;


  //
  // PRIVATE METHODS
  //
  
};