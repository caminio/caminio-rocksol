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
      parents = arr;
      console.log('parents: ', parents.length,webpage.name );
      getWebpages( parents[0], getChildren );
    }

    function getChildren( arr ){
      console.log( 'siblings', arr.length, webpage.name);
      siblings = arr;
      getWebpages( webpage, run );
    }

    function run( arr ){
      console.log('children', arr.length, webpage.name);
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
      //console.log(parents, siblings, children);
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
      console.log('we do it');
      if( parent === undefined )
        cb( [] );
      Webpage.find({ parent: parent })
      .exec( function( err, siblings ){
        error( 'error while getting webpages', err);
        cb( siblings );
      });
    }

    function error( err, details ){
      if( details )
        return res.json( 500, { error: err, details: details }); 
    }

  };

  return generator;


  //
  // PRIVATE METHODS
  //
  
};