/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 12:03:10
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-23 14:36:34
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
    lookForPebbles: lookForPebbles,
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


  function lookForPebbles( translation, path, options, done ){

    var pebbleGen = require('./pebble_gen')( caminio );
    //var rubbleGen = require('./rubble_gen')( caminio );
    //var rubbleRegex = /[Rr][Uu][Bb][Bb][Ll][Ee](:|( :))/;

    var first = true;
    var locale = translation.locale;
    var content = translation.content;

    searchPebbleAndRubble( content, done );

    function searchPebbleAndRubble( data, cb ){
      var localContent = first ? 
        data : 
        genMethods.getElementFromArray( data.translations, 'locale', locale ).content;

      var snippets = localContent.match(/{{[^{}]*}}/g);

      if( snippets && snippets.length ){
        
        snippets.forEach( function( snippet ){
          addToList( snippet );
        });

        first = false;
        pebbleGen.findPebbles( pebbleGen.names, pebbleGen.list, done );


      } else if( first ){
        done( null, content );
      } else {      
        finish( pebble.meta, localContent, cb );
      }

      function addToList( thePebble ){
        var currPebble = {};
        currPebble.old = thePebble;
        thePebble = thePebble.replace('{{','').replace('}}','');
        var options = thePebble.split(',');
        var name = options[0];
        if( name.match( pebbleGen.regex ) ){
          name = name.split(':')[1].replace(" ", "");
          pebbleGen.names.push( name );
          currPebble.name = name;
          options.shift();
          currPebble.options = options;
          pebbleGen.list.push( currPebble );
        }
      }
    }

    function finish( pebble, localContent, next ){
      options.markdownContent = markdown.toHTML( localContent );
      var there = path + pebble.name +".js";
      genMethods.runJS( there, null, function(){
        content = content.replace( pebble.old, 
          genMethods.compileJade( path + "/" + pebble.name +".jade", options )
        );
        next(); 
      });
    }

  }

}

