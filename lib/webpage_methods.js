/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 12:03:10
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-04 11:54:57
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
    getChildrenOfWebpage: getChildrenOfWebpage,
    underscore: underscore,
    setCurrTranslation: setCurrTranslation,
    setUrlPath: setUrlPath,
    otherThanContentModified: otherThanContentModified
  };

  function compileJade( layoutFile, attributes ){
    var jadeCompiler = jade.compile( 
      fs.readFileSync( layoutFile ), 
      { filename: layoutFile, pretty: true } 
    );
    return jadeCompiler( attributes );
  }

  function runJS( obj, jsFile, options, next ){
   if( fs.existsSync( jsFile ) ){
      if( caminio.env === 'development' )
        delete require.cache[ jsFile ];
      var js = require( jsFile )(caminio);
      js.run( obj, options, next );
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
      if( webpage.parent ){
        
        if( webpage.parent._id === webpage._id )
          throw Error(webpage.name+' has id of ' + webpage.parent.name + ' is loop referring');

        arr.push( webpage.parent );
      }
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

  function underscore( str ){
    return Webpage.underscoreName( str );
  }

  function setCurrTranslation( webpages, locale ){
    webpages.forEach( function( webpage  ){
      webpage.curTranslation = getElementFromArray( webpage.translations, 'locale', locale );
    });  
    return webpages;    
  }

  function setUrlPath( webpages, ancestors ){
    webpages.forEach( function( webpage ){
      var path = '';
      ancestors.forEach( function( ancestor ){
        path +=  '/' + underscore( ancestor.name );
      });
      webpage.path = path;
    });
  }

  function otherThanContentModified( original, modified ){
    var paths = original.schema.paths; 
    for ( var path in paths ){
      if( path === 'updatedAt' || path === 'updatedBy' || path === 'translations' )
        break;
      if( modified[path] && original[path] && modified[path] !== original[path] )
        return true;
    }

    return false;
  }

};

