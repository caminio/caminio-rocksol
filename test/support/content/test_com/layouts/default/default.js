/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 00:35:53
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-03-24 17:33:16
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

 module.exports = function( caminio ) {

  return {
    run: function( pebble, options, next ){
      caminio.models.Pebble.find()
      .exec( function( err, ps ){
        next();
      });
    },

    initialSetup: function( webpage, res, next ){
      console.log('run init');
      Pebble.create({ type: 'teaser',
        name: 'test',
        description: 'Ein Teaser ist jenes Bild, das in der Stückeübersicht, oder ganz oben der jeweiligen Stückseite angezeigt wird',
        createdBy: res.locals.currentUser,
        camDomain: res.locals.currentDomain
        }, next );
    }
  }

}
