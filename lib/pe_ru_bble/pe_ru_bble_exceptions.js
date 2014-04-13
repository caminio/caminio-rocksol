/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-04-13 01:58:37
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-04-13 02:05:13
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

modules.export = function(){

  return {
    noRubbleFile: noRubbleFile
  };

};



function Exception( message, details ){
    this.name = "Exception";
    this.message = (message || "");
    this.details = (details || "");
}
