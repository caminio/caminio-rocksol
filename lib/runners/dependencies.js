/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-18 00:51:29
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-23 14:15:29
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require( 'async' );

var Webpage,
    Mediafile;

/**
 *
 *
 */
function Dependencies( caminio, options ){
  Webpage = caminio.models.Webpage;
  Mediafile = caminio.models.Mediafile;
}

Dependencies.prototype.getChildrenOfWebpage = getChildren;
Dependencies.prototype.getAncestorsOfWebpage = getAncestors;
Dependencies.prototype.getMediafilesOfWebpage = getMediafiles;

Dependencies.prototype.getDependenciesOfWebpage = function( webpage, done ){
  var dependencies = { webpage: webpage };
  var operations = [];

  operations.push( initSearch );

  if( 'parent' in webpage.schema.path ){
    operations.push( searchAncestors );
    operations.push( searchSiblings );
    operations.push( searchChildren );
  }

  operations.push( searchMediafiles );

  async.waterfall( operations, done );

  function initSearch( cb ){
    console.log( cb, '' );
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

/**
 *
 *
 */
function searchMediafiles( dependencies, cb ){
  getMediafiles( dependencies.webpage, function( err, files ){
    dependencies.mediafiles = files;
    cb( err, dependencies );
  });
}

/**
 *  Collects all media files linked to the local webpage
 *  @method getMediaFiles
 *  @param next calls the runJSFile function
 */
function getMediafiles( webpage, cb ){
  // TODO: optimize if not a mediafile depending document
  Mediafile.find({ parent: webpage._id}) // TODO: camDomain 
  .exec( function( err, files ){
    cb( err, files );
  });
}

/**
 *
 *
 */
function getAncestors( webpage, arr, cb ){
  if( !webpage.parent ){
    return cb( null, arr );
  }

  webpage.populate('parent', function( err, webpage ){
    if( err ) { return cb( err ); }
    if( webpage.parent ){
      
      if( webpage.parent._id === webpage._id )
        throw Error( webpage.name + ' has id of ' + 
          webpage.parent.name + ' is loop referring');

      arr.push( webpage.parent );
    }
    getAncestors( webpage.parent, arr, cb );
  });
}

/**
 *
 *
 */
function getChildren( parent, cb ){
  if( !parent )
    return cb( null, [] );
  Webpage.find({ parent: parent }) // TODO: camDomain
  .exec( function( err, children ){
    if( err ) { return cb( err ); }
    cb( null, children );
  });
}

module.exports = Dependencies;
