/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-18 00:51:29
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-29 19:09:20
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require( 'async' );
var normalizeFilename = require('caminio/util').normalizeFilename;

var Webpage,
    Mediafile;

/**
 *  Gathers dependencies depending on the object type
 *  @class Dependencies
 *  @param caminio The caminio object, needed to search through mongoose
 *         objects in the database.
 */
function Dependencies( caminio ){
  Webpage = caminio.models.Webpage;
  Mediafile = caminio.models.Mediafile;
}

/**
 *
 *  @method getDependencies
 *  @param object { Object }
 *  @param done { Function( err, dependencies ) }
 */
Dependencies.prototype.getDependencies = function( object, done ){

  var dependencies = {};
  var operations = [];

  operations.push( initSearch );

  if( 'parent' in object.schema.paths ){
    dependencies.webpage = object;
    operations.push( searchAncestors );
    operations.push( searchSiblings );
    operations.push( searchChildren );
    operations.push( setPaths );
  }

  dependencies.object = object;
  operations.push( searchMediafiles );

  async.waterfall( operations, done );

  function initSearch( cb ){
    cb( null, dependencies );
  }

};

/**
 *  Gets all ancestors of the local webpage
 *  @method searchAncestors
 *  @param next calls the searchSiblings function
 */
function searchAncestors( dependencies, cb ){
  getAncestors( dependencies.webpage, [], function( err, ancestors){
    dependencies.ancestors = ancestors.reverse(); 
    cb( err, dependencies );
  });
}

/**
 *  Gets all siblings of the local webpage.
 *  @method searchSiblings
 *  @param ancestors array of the ancestors of the local webpage
 *  @param next calls the searchChildren function
 */
function searchSiblings( dependencies, cb ){
  getChildren( dependencies.ancestors[0], function( err, siblings ){
    dependencies.siblings = siblings;
    cb( err, dependencies );
  });
}

/**
 *  Gets all children of the local webpage
 *  @method searchChildren
 *  @param siblings array of the siblings of the local webpage
 *  @param next calls the generateSite function
 */
function searchChildren( dependencies, cb ){
  getChildren( dependencies.webpage, function( err, children ){
    dependencies.children = children;
    cb( err, dependencies );
  });
}

function setPaths( dependencies, cb ){
  setUrlPaths( dependencies );
  cb( null, dependencies );
}

/**
 *
 *
 */
function searchMediafiles( dependencies, cb ){
  getMediafiles( dependencies.object, function( err, files ){
    dependencies.mediafiles = files;
    cb( err, dependencies );
  });
}

/**
 *  Collects all media files linked to the local webpage
 *  @method getMediaFiles
 *  @param next calls the runJSFile function
 */
Dependencies.prototype.getMediafilesOfWebpage = getMediafiles;

function getMediafiles( object, cb ){
  // TODO: optimize if not a mediafile depending document
  Mediafile.find({ parent: object._id, camDomain: object.camDomain }) 
  .exec( function( err, files ){
    cb( err, files );
  });
}

/**
 *  @method getAncestorsOfWebpage
 *  @param webpage
 *  @param arr
 *  @param cb { Function( err, ancestors ) }
 *  @param cb.err
 *  @param cb.ancestors
 */
Dependencies.prototype.getAncestorsOfWebpage = getAncestors;

function getAncestors( webpage, arr, cb ){
  if( !webpage.parent ){
    return cb( null, arr );
  }

  webpage.populate('parent', function( err, webpage ){
    if( err ) { return cb( err ); }
    if( webpage.parent ){
      
      if( webpage.parent._id === webpage._id )
        throw Error( webpage.filename + ' has id of ' + 
          webpage.parent.filename + ' is loop referring');

      arr.push( webpage.parent );
    }
    getAncestors( webpage.parent, arr, cb );
  });
}

/**
 *  @method getAncestorsOfWebpage
 *  @param webpage
 *  @param arr
 *  @param cb { Function( err, ancestors ) }
 *  @param cb.err
 *  @param cb.ancestors
 */
Dependencies.prototype.getChildrenOfWebpage = getChildren;

function getChildren( parent, cb ){
  if( !parent )
    return cb( null, [] );
  Webpage.find({ parent: parent, camDomain: parent.camDomain })
  .exec( function( err, children ){
    if( err ) { return cb( err ); }
    cb( null, children );
  });
}

/**
 *  Sets the url path of a webpage and all its dependencies.
 *  @method setUrlPathsOfWebpage
 *  @param deps { Object }
 *  @param deps.webpage { Object }
 *  @param deps.ancestors { Array }
 *  @param deps.siblings { Array }
 *  @param deps.children { Array }
 */
Dependencies.prototype.setUrlPathsOfWebpage = setUrlPaths;

function setUrlPaths( deps ){
  setUrlPath( [ deps.webpage ].concat( deps.siblings ), deps.ancestors );
  setUrlPath( deps.children, [ deps.webpage ].concat( deps.ancestors ) );
  var ancs = [].concat( deps.ancestors );
  ancs.forEach( function( ancestor ){
    ancs.pop();
    setUrlPath( [ ancestor ], ancs );
  });      

}

/**
 *  @method
 *
 *
 */
function setUrlPath( webpages, ancestors ){
  webpages.forEach( function( webpage ){
    var path = '';
    ancestors.forEach( function( ancestor ){
      path +=  '/' + normalizeFilename( ancestor.filename );
    });
    webpage.path = path;
  });
}

module.exports = Dependencies;
