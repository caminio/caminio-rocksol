/*
 * caminio-contacts
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 02/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

/**
 *  @class ContactsController
 *  @constructor
 */
module.exports = function( caminio, policies, middleware ){

  var Contact = caminio.models.Contact;

  return {

    _before: {
      '*': policies.ensureLogin
    },

    'index': function( req, res ){
      res.caminio.render();
    }

  };

};