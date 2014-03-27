/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-03-23 09:58:10
 *
 * @Last Modified by:   thorsten zerha
 * @Last Modified time: 2014-03-27 13:34:50
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

/**
 *  @class PebblesController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){
  var Pebble = caminio.models.Pebble;

  /**
   *  @method check Name
   *  @param req
   *  @param res
   *  @param next
   *  Checks if the name is already taken in the current domain
   */
  function checkName( req, res, next ){
    var id = req.param('id');
    var q = Pebble.findOne({ 
      name: req.body.pebble.name,
      camDomain: res.locals.currentDomain });
    q.or([
    {
      webpage: null
    },
    {
      webpage: req.body.pebble.webpage
    }
    ]);
    if( id )
      q.where('_id').ne(id);
    q.exec( function( err, pebble ){
      if( err ){ return res.json(500, { error: err }); }
      if( pebble ){ 
        return res.json(422, { error: 'name_already_taken_by: '+pebble._id, details: pebble } ); 
      }
      next();
    });
  }

  return {

    _before: {
      '*': policies.ensureLogin,
      'create, update': checkName
    }

  };

};