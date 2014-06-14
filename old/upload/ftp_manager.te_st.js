/** 
 * @Author: David Reinisch
 * @Company: TASTENWERK e.U.
 * @Copyright: 2014 by TASTENWERK
 * @License: Commercial
 *
 * @Date:   2014-05-08 15:49:28
 *
 * @Last Modified by:   David Reinisch
 * @Last Modified time: 2014-05-08 15:52:30
 *
 * This source code is not part of the public domain
 * If server side nodejs, it is intendet to be read by
 * authorized staff, collaborator or legal partner of
 * TASTENWERK only
 */

describe('ftp manager test', function() {
  it('has a server', function(){

    var ftpd = require('ftp-server');
    // Path to your FTP root
    ftpd.fsOptions.root = '/home/david/tastenwerk/caminio-rocksol/test/support/ftp';
    // Start listening on port 21 (you need to be root for ports < 1024)
    ftpd.listen(21);

  });
});