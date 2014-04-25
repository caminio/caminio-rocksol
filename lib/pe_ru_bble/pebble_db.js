/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 14:15:57
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-24 14:58:34
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async;
var Pebble;
var webpageMethods;

/**
 *  Provides 
 *  
 *  @class PebbleDb
 */
function PebbleDb( caminio ){
  Pebble = caminio.models.Pebble;
  async = require('async');  
  webpageMethods = require('./../webpage_methods')( caminio );
}

PebbleDb.prototype.getData = function GetData( pebbleList, webpageId, done ){
  async.auto({
    search_params: getSerachParams,
    global_search: [ 'search_params', this.globalSearch ],
    webpage_search: [ 'search_params', this.webpageSearch ]
  }, function( err, results) {
      var pebbles = results.webpage_search;
      pebbles.concat( results.global_search );
      done( err, pebbles );
  });

  /**
   *  @private
   *  @method getSearchParams
   *  @params callback
   */
  function getSerachParams( callback ){
    var globalSearch = [];
    var webpageSearch = [];
    pebbleList.forEach( function( pebble ){
      if( webpageId === null || ( pebble.options && pebble.options.global === 'true' ) )
        globalSearch.push( pebble.name );
      else
        webpageSearch.push( pebble.name );
    });
    callback( null, globalSearch, webpageSearch, webpageId );
  }

};

/**
 *  @method globalSearch
 *  @param callback { function }
 *  @param results.search_params
 *
 */
PebbleDb.prototype.globalSearch = function GlobalSearch( callback, results ){
  Pebble.find({ name: { $in: results.search_params[0] } })  
  .exec( function( err, pebbles ){
    if( err ){ callback( err ); }
    callback( null, pebbles );
  });
};
  
/**
 *  Starts a search with the given parameters for pebbles in the specified 
 *  webpage and returns the field of found pebbles or, in case of an error
 *  the error object.
 *  @method webpageSearch
 *  @param callback { function } Is called at the end, gets the found 
 *         pebbles as second parameter. If the first callback parameter is
 *         not null an error occured during searching.
 *  @param params.search_params { Array } Has got the search parameters.
 *  @param params.search_params[1] { Array } Contains potential pebble 
 *         names.
 *  @param params.search_params[1] { Array } Contains the id of an webpage.
 *  @return { Object } err The error Object if an DB error occurs.
 *  @return { Array } pebbles The found pebbles
 */
PebbleDb.prototype.webpageSearch = function WebpageSearch( callback, params ){
  Pebble.find({ 
    name: { $in: params.search_params[1] }, 
    webpage: params.search_params[2] })
  .exec( function( err, pebbles ){
    if( err ){ callback( err ); }
    callback( null, pebbles );
  });
};

module.exports = PebbleDb;
