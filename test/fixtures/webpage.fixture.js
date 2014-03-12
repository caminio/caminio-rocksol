/*
 * caminio-contacts
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 01/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license comercial
 *
 */

var fixtures = require('caminio-fixtures');

fixtures.define('Webpage', {
  name: 'testpage',
  requestReviewMsg: 'test message' 
});

fixtures.define('Translation', {
  locale: 'en',
  content: 'this is a test content with an <h1> title </h1>'
});