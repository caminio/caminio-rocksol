/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-12 02:03:25
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-01 03:48:48
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

var async = require('async');
var PeRuParser = require('./pe_ru_bble_parser')();
var _ = require('lodash');
var PeRuCompiler = require('./pe_ru_bble_compiler');
var PebbleDb = require('./pebble_db');
var webpageMethods;

var webpageId;
var globalContent;
var compiler;
var db;
var contentPath;
var errors;

var Type = { PEBBLE: 'pebble', RUBBLE: 'rubble', MISSMATCH: 'missmatch' };
var cam;

/**
 *  Provides a compile method which compiles one snippet with the given local content.
 *  The content must be passed because snippets without layout dependencies have not 
 *  got any content in their body. 
 *  @class PeRuCompiler
 */
function PeRuProcessor( caminio ){
  cam = caminio;
  db = new PebbleDb( caminio );
  webpageMethods = require('./../webpage_methods')( caminio );
}

PeRuProcessor.prototype.startSearch = function( content, options, done ){
  errors = [];
  contentPath = options.contentPath;
  globalContent = content;
  var attributes = options.locals ? options.locals : {};
  attributes.locale = options.locale;
  compiler = new PeRuCompiler( attributes, webpageMethods, cam );
  webpageId = attributes.webpage ? attributes.webpage._id : null;
  getSnippets( globalContent, done );
};

function compileSnippet( snippet, next ){  
  if( ( snippet.type === Type.PEBBLE && snippet.db ) || snippet.type === Type.RUBBLE )
    compiler.compileSnippet( snippet, function( err, localContent ){
      if( err ){ errors.push( err ); }
      console.log('WE ARE REPLACING: ', snippet.original, ' <----------------------------------');
      globalContent = globalContent.replace( new RegExp( snippet.original, 'g'), localContent );
      getSnippets( localContent, next );     
    });
  else{
    var warning =  "{{ Warning: pebble has no db file or is global! ";
    warning += snippet.original.replace("{{", "");
    globalContent = globalContent.replace( new RegExp( snippet.original, 'g'), warning );
    getSnippets( "", next );     
  }
}
  
function getSnippets( content, next ){
  var snippets = PeRuParser.getSnippets( content );
  if( snippets.pebbles.length > 0 || snippets.rubbles.length > 0 ){
    var pebbles = getSnippetObjects( snippets.pebbles, Type.PEBBLE );        
    var rubbles = getSnippetObjects( snippets.rubbles, Type.RUBBLE );
    console.log('FOUND: ', snippets );
    runSnippets( pebbles, Type.PEBBLE, function(){
      runSnippets( rubbles, Type.RUBBLE, function(){
        next( errors, globalContent ); 
      });
    });
  } else {
    console.log('NO SNIPPETS ANYMORE, calling: ', next );
    var err = errors.length > 0 ? errors : null;
    next( err, globalContent );   
  }
}

function getSnippetObjects( snippets, type ){
  return PeRuParser.makeSnippetObjects( 
    snippets, 
    contentPath + "/" + type + "s/",
    type 
  );        
}

function runSnippets( snippets, snippetType, callback ){
  console.log('MULTIPLE snippets: ', snippets, '>>>><<<<', callback );
  async.eachSeries( snippets, runSnippet, function( err, glob ){
    //console.log('----------------------------- REA ----------------------', err, globalContent );
    console.log('FINISHED: ', snippets, err, glob );
    callback();
  });

  function runSnippet( snippet, next ){
    console.log('RUNNING SNIPPET: ', next, 'YYYYYYYYYYYYYYYYYYYYYYY')
    if( snippetType === Type.PEBBLE ){
      db.getData( snippets, webpageId, function( err, dbPebbles ){
        snippet.db = _.first( dbPebbles, { 'name': snippet.name })[0];
        compileSnippet( snippet, next ); 
      });
    }
    else
      compileSnippet( snippet, next );               
  }
}

module.exports = PeRuProcessor;