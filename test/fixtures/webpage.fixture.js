/*
 * caminio-rocksol
 *
 * @author david <david.reinisch@tastenwerk.com>
 * @date 03/2014
 * @copyright TASTENWERK http://tastenwerk.com
 * @license MIT
 *
 */

var fixtures = require('caminio-fixtures');

fixtures.define('Webpage', {
  filename: 'testpage',
  requestReviewMsg: 'test message' 
});

fixtures.define('Translation', {
  locale: 'en',
  content: 'this is a test content with an <h1> title </h1>',
  title: 'a Translation title'
});