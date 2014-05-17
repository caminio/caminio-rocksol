( function( App ){

  'use strict';

  App.Router.map( function(){
    this.route('index', { path: '/' });
    this.resource('webpages', { path: '/webpages' }, function(){
      this.route('new', { path: '/new' });
      this.resource('webpages.edit', { path: '/:id/edit' });
    });
    this.resource('media.index');
    this.resource('blog');
    this.resource('locations');
  });

  App.IndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo( 'webpages' );
    }
  });

  App.ApplicationController = Ember.Controller.extend({
    blogEnabled: domainSettings.blog,
    locationsEnabled: domainSettings.locations
  });

  App.ApplicationRoute = Ember.Route.extend({
    setupController: function( controller, model ){
      this.store.find('user');
    }
  });

  App.ApplicationView = Em.View.extend({
    didInsertElement: function(){
      setupCaminio(this.$());
    }
  });

})( App );
