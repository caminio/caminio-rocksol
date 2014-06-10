var join    = require('path').join;
var fs      = require('fs');
var mkdirp  = require('mkdirp');

// global middleware actions to be run
// in every request
module.exports = function( caminio ){

  return [
    setSiteConfig
  ];

  /**
   * read config/site.js if existent in content directory
   * @method setSiteConfig
   */
  function setSiteConfig( req, res, next ){
    if( !res.locals.currentDomain )
      return next();
    var filename = res.locals.currentDomain.getContentPath()+'/config/site.js';

    // delete cache file (so the server doesn't need a restart)
    delete require.cache[ filename ];

    res.locals.domainSettings = fs.existsSync( filename  ) ? 
                                require( filename ) : 
                                {};
    next();
  }

};
