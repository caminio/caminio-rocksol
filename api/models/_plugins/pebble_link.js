/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-08 12:52:04
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-08 12:56:28
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

module.exports = exports = function PebbleLink(schema, options) {
  schema.add({ 

    /**
     * link is any link to the external internet
     * @property link
     * @type String
     */
    link: { type: String, public: true },

    /**
     * linkType is a hint for the html processor
     * what to do with the link. e.g.: youtube (embedded)
     * @property linkType
     * @type String
     */
    linkType: { type: String, public: true }

  });
  
};