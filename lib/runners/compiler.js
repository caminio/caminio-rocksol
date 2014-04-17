/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-16 16:26:18
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-17 18:22:54
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var defaultType = 'jade';
var fs = require('fs');
var jade = require('jade');
var join = require('path').join;

function Compiler( options ){
}

Compiler.prototype.getCompiler = function( compilerType ){
  var type = compilerType ? compilerType : defaultType;

  switch( type ){

    case 'jade': return jadeCompiler;

    default: return { 
      name: 'unknown_type', 
      message: type + ' is not a valid compiler type' 
    };

  }

};

function jadeCompiler( content, attributes ){
  var layout =  '!=markdownContent';
  attributes.markdownContent = content;

  if( attributes.layout.content )
    layout = attributes.layout.content;

  if( attributes.layout.name ){
    var layoutFile = getLayoutPath( attributes );
    if( fs.existsSync( layoutFile ) )
      layout = fs.readFileSync( layoutFile );
  }

  var jadeSettings = { filename: layout, pretty: true };
  return jade.compile( layout, jadeSettings )( attributes );
}

function getLayoutPath( attributes ){
  return join( 
    attributes.contentPath, 
    'layouts',
    attributes.layout.name,
    attributes.layout.name + '.jade' );
}

module.exports = Compiler;