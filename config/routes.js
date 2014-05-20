// caminio routes
// define your routes here
module.exports.routes = {
  '/caminio/web': 'WebsitesController#index',
  '/caminio/website/available_layouts': 'WebsitesController#available_layouts',
  '/caminio/websites/disk_quota': 'WebsitesController#disk_quota',
  '/caminio/websites/users_quota': 'WebsitesController#users_quota',
  'autorest /caminio/webpages': 'Webpage',
  'autorest /caminio/pebbles': 'Pebble',  
  '/caminio/websites/compile_all': 'WebpagesController#compileAll'
};
