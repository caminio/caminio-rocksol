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

    if( translations.length > 1 )
      webpage.translations.forEach(function(translation){
        createFile( translation, translation.locale );
      });

    var translation = webpage.translations[0];

    createFile( translation );
    
    cb( null );

    function createFile( translation, locale ){

      var jadeCompiler = jade.compile( fs.readFileSync( layoutFile ), { filename: layoutFile, pretty: true } );
      
      var ending = locale ? '.' + locale + '.htm' : '.htm';
      var fileName = join(publicPath, inflection.underscore( webpage.name ) + ending );
      var content = translation.content;
      var domainFilePattern = new RegExp('/caminio/domains/'+res.locals.currentDomain._id+'/preview', 'g');
      content = content.replace(domainFilePattern, './files');

      if( webpage.layout === 'index' )
        fileName = join( publicPath, 'index' + ending );
      
      fs.writeFileSync( 
        fileName, 
        jadeCompiler({ 
          domain: domain, 
          user: res.locals.currentUser,
          webpage: webpage,
          siblings: null,
          parent: null,
          children: null,
          files: null,
          markdownContent: markdown.toHTML( content ),
          translation: translation
        }) 
      );
    }



  };

  return generator;


  //
  // PRIVATE METHODS
  //

  
};