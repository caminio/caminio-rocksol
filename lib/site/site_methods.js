/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-29 13:42:01
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-27 15:37:46
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

'use strict';

var fs = require('fs');

var Methods = {
  jsRunner: jsRunner,
  getElementFromArray: getElementFromArray,
  setCurTranslation: setCurTranslation,
  addLinkHelper: addLinkHelper
};

function jsRunner ( caminio ) {

  return{
    run: runJs
  };

  function runJs( obj, jsFile, options, next ){
    if( fs.existsSync( jsFile ) ){
      if( caminio.env === 'development' )
        delete require.cache[ jsFile ];
      var js = require( jsFile )(caminio);
      caminio.logger.debug('Entering js file: ', jsFile );
      if( js.locals )
        js.locals( options );
      js.run( obj, options, next );
    } else
      next();
  }
}

function getElementFromArray( array, param, value ){
  var element;

  array.forEach( function( elem ){
    if( elem[param] === value ){
      element =  elem;
    }
  });

  return element;
}

function setCurTranslation( input, locale, fallbackLocale ){
  
  locale = locale || fallbackLocale;

  if( input instanceof Array )
    input.forEach( set );   
  else 
    set( input );

  function set ( obj ) {
    if( obj )
      obj.curLang = locale;
  }

}

function addLinkHelper( attrs ){
  if( !attrs.doc )
    return;

  var defaultLocale = attrs.doc.curTranslation.locale;
  var join = require('path').join;

  return function( name, namespace, extension, locale ){

    locale = locale || defaultLocale;
    
    var path = '/';
    extension = extension || '.htm';

    if( namespace )
      path = join( path, namespace );

    var file = join( path, name );

    if( fs.existsSync( join( attrs.currentDomain.getContentPath(), 'public', file + extension + '.' + locale) ) ||
        fs.existsSync( join( attrs.currentDomain.getContentPath(), 'public', file + extension ) ) )
      return join('/', locale, file);

    return '/404.htm';
    
  };

}

module.exports = Methods;