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
   */
  generator.compilePage = function compilePage( res, webpage, cb ){

    var domain = res.locals.currentDomain;

    var domainTmplPath = join( domain.getContentPath(), 'layouts' );
    if( !fs.existsSync( domainTmplPath ) )
      mkdirp.sync( domainTmplPath );
    
    var layoutFile = join( domainTmplPath, webpage.layout+'.jade' );
    var publicPath = join( domainTmplPath, '..', 'public' );

    if( !fs.existsSync( layoutFile ) )
      return cb('layout '+layoutFile+' was not found');

    if( !fs.existsSync( publicPath ) )
      mkdirp.sync( publicPath );

    var fileName = join(publicPath, inflection.underscore( webpage.name )+'.htm');
    if( webpage.layout === 'index' )
      fileName = join( publicPath, 'index.htm' );

    var translation = webpage.translations[0];

    var jadeCompiler = jade.compile( fs.readFileSync( layoutFile ), { filename: layoutFile, pretty: true } );
    
    fs.writeFileSync( 
      fileName, 
      jadeCompiler({ 
        domain: domain, 
        user: res.locals.currentUser,
        webpage: webpage,
        markdownContent: markdown.toHTML( translation.content ),
        translation: translation
      }) 
    );

    cb( null );

  };

  return generator;


  //
  // PRIVATE METHODS
  //

  
};