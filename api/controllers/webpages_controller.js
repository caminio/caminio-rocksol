/*
 * caminio-rocksol
 *
 * @author <thorsten.zerha@tastenwerk.com>
 * @date 02/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

var fs      = require('fs');
var join    = require('path').join;
var mkdirp  = require('mkdirp');
var util    = require('caminio/util');

/**
 *  @class WebpagesController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){

  var SiteGen = require('../../lib/site_gen')( caminio );
  var Webpage = caminio.models.Webpage;

  return {

    _before: {
      '*': policies.ensureLogin,
      'create': setupDefaultTranslation,
      'update': [ getWebpage, updateWebpage ]
    },

    'update': function updateWebpage(req, res ){

      // SITE COMPILER
      SiteGen.compilePage( res, req.webpage, finalResponse );
      
      function finalResponse( err ){
        if( err )
          return res.json( 500, { error: 'compile_error', details: err });
        res.json( util.transformJSON( { webpage: JSON.parse(JSON.stringify(req.webpage)) }, req.header('namespaced') ) );
      }
    }

  };

  function setupDefaultTranslation( req, res, next ){
    if( !req.body.webpage )
      return next();
    req.body.webpage.translations = [
      { locale: res.locals.currentDomain.lang,
        content: '### No content here yet' }
    ];
    next();
  }

  function getWebpage( req, res, next ){
    Webpage.findOne({ _id: req.param('id') }, function( err, webpage ){
      if( err )
        return res.json( 500, { error: 'server_error', details: err });
      if( !webpage )
        return res.json(404, { error: 'not_found' });
      req.webpage = webpage;
      next();
    });
  }

  function updateWebpage( req, res, next ){
    for( var i in req.body.webpage )
      req.webpage[i] = req.body.webpage[i];
    req.webpage.updatedBy = res.locals.currentUser;
    req.webpage.updatedAt = new Date();
    req.webpage.save( function( err ){
      if( err )
        return res.json( 500, { error: 'server_error', details: err });
      next();
    });
  }


};