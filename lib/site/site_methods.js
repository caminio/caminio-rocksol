/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-29 13:42:01
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-29 14:12:41
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var fs = require('fs');

var Methods = {
  jsRunner: jsRunner,
  getElementFromArray: getElementFromArray,
  setCurTranslation: setCurTranslation,
  setUrlPath: setUrlPath
};

  function jsRunner ( caminio ) {

    return{
      run: runJs
    };

    function runJS( obj, jsFile, options, next ){
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

  function setCurTranslation( input, locale ){

    if( input instanceof Array )
      input.forEach( set );   
    else 
      set( input );

    function set ( obj ) {
      if( obj )
        object.curTranslation = getElementFromArray( obj.translations, 'locale', locale );
    }

  }

  function setUrlPath( objects, ancestors ){
    objects.forEach( function( object ){
      var path = '';
      ancestors.forEach( function( ancestor ){
        path +=  '/' + underscore( ancestor.name );
      });
      object.path = path;
    });
  }

module.exports = Methods;