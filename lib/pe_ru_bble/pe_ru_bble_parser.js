/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 00:17:26
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-12 01:41:05
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var rubbleRegexp = /[Rr][Uu][Bb][Bb][Ll][Ee](:|( :))/;
var pebbleRegexp = /[Pp][Ee][Bb][Bb][Ll][Ee](:|( :))/;
var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };

var PeRuBbleParser = {};

/**
 *  Provides methods for parsing snippets
 *  to pebbles and rubbles and to get 
 *  missmatches as well.
 *  
 *  @class PeRuBbleParser
 */
module.exports = function() {

  /**
   *  @method getSnippets
   *  @params content { String }
   *  @return result { Object } Object with pebbles, rubbles
   *          and missmatches
   */
  PeRuBbleParser.getSnippets = function( content ){  
    var result = {};
    var snippets = content.match(/{{[^{}]*}}/g);
    result.pebbles = getTypeArray( snippets, Type.PEBBLE );
    result.rubbles = getTypeArray( snippets, Type.RUBBLE );
    result.missmatches = getTypeArray( snippets, Type.MISSMATCH );
    return result;
  };

  /**
   *  @method makeSnippetsObject
   *  @param snippets  [ { String } ]
   *  @param snippetPath { String }
   *  @return snippetObjects [ { Object } ]
   */
  PeRuBbleParser.makeSnippetObjects = function( snippets, snippetPath ){
    var snippetObjects = [];
    snippets.forEach( function( snippet ){
      object = toSnippetObject( snippet );
      object.path = snippetPath;
      snippetObjects.push( object );
    });
    return snippetObjects;
  };

  /**
   *  @private
   *  @method getSnippetType
   *  @param snippetName { String }
   *  @return { String }
   */
  function getSnippetType( snippetName ){
    if( snippetName.match( pebbleRegexp ) )
      return Type.PEBBLE;
    if( snippetName.match( rubbleRegexp ) )
      return Type.RUBBLE;
    return Type.MISSMATCH;
  }

  /**
   *  @private
   *  @method getTypeArray
   *  @param snippetArray [ { Object }]
   *  @param snippetType { String }
   *  @return typeArray [ { Object }]
   */
  function getTypeArray( snippetArray, snippetType ){
    var typeArray = [];
    snippetArray.forEach( function( snippet ){
      if( getSnippetType( snippet ) === snippetType )
        typeArray.push( snippet );
    });
    return typeArray;
  }

  /** 
   *  @private
   *  @method toSnippetObject
   *  @param originalSnippet { String }
   *  @return { Object }
   */
  function toSnippetObject( originalSnippet ){
    var snippetObject = {
      original: originalSnippet
    };

    var params = originalSnippet.replace( '{{', '' ).replace( '}}', '' );
    params = params.split( ',' );
    snippetObject.name = replaceAll(" ", "", params[0].split(':')[1] );
    params.shift();
    snippetObject.params = splitKeyValueArray( params );

    return snippetObject;
  }

  /**
   *  Writes the params into a hash object
   *  @private
   *  @method splitKeyValueArray
   *  @param arr [ { String }]
   *  @return hash { Object } The hash object with the params
   */
  function splitKeyValueArray( arr ){
    var hash = {};

    arr.forEach( function( element ){
      var split = element.split( "=" );
      hash[ split[0] ] = split[1];
    });

    return hash;
  }

  /**
   *  Replaces all strings in another string
   *  @private
   *  @method replace All
   *  @param find
   *  @param replace
   *  @param str
   */
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp( find, 'g'), replace );
  }

  return PeRuBbleParser;

};