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
   * read .settings.js if existent in content directory
   * @method setSiteConfig
   */
  function setSiteConfig( req, res, next ){
    if( !res.locals.currentDomain )
      return next();
    var filename = res.locals.currentDomain.getContentPath()+'/.settings';

    // delete cache file (so the server doesn't need a restart)
    delete require.cache[ filename+'.js' ];
    res.locals.domainSettings = fs.existsSync( filename +'.js' ) ? 
                                require( filename ) : 
                                {};
    next();
  }

};