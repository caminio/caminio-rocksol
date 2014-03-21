// caminio routes
// define your routes here
module.exports.routes = {
  '/caminio/websites': 'WebsitesController#index',
  '/caminio/website/available_layouts': 'WebsitesController#available_layouts',
  'autorest /caminio/webpages': 'Webpage',
  //'autorest /caminio/pepples': 'Pepple'
};
