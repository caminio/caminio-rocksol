/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 12:03:10
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 23:50:14
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */
 
var fs    = require('fs');
var jade  = require('jade');

module.exports = function( caminio ) {
  var Webpage = caminio.models.Webpage;

  return {
    runJS: runJS,
    compileJade: compileJade,
    getElementFromArray: getElementFromArray,
    getAncestorsOfWebpage: getAncestorsOfWebpage,
    getChildrenOfWebpage: getChildrenOfWebpage
  };

  function compileJade( layoutFile, attributes ){
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
    } else
      next();
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

  function getAncestorsOfWebpage( webpage, arr, cb ){
    if( !webpage.parent ){
      return cb( null, arr );
    }

    webpage.populate('parent', function( err, webpage ){
      if( err ) { return cb( err ); }
      if( webpage.parent )
        arr.push( webpage.parent );
      getAncestorsOfWebpage( webpage.parent, arr, cb );
    });
  }

  function getChildrenOfWebpage( parent, cb ){
    if( !parent )
      return cb( null, [] );
    Webpage.find({ parent: parent })
    .exec( function( err, children ){
      if( err ) { return cb( err ); }
      cb( null, children );
    });
  }

}

