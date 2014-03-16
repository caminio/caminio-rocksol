( function(){

  'use strict';

  window.App.Router.map( function(){
    this.route('index', { path: '/' });
    this.resource('webpages', { path: '/webpages' }, function(){
      this.route('new', { path: '/new' });
      this.resource('webpages.edit', { path: '/:id/edit' });
    });
    this.resource('media.index');
    this.resource('blog');
  });

  window.App.IndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo( 'webpages' );
    }
  });

}).call();