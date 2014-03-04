( function(){

  'use strict';

  window.App.Router.map( function(){
    this.resource('webpages', { path: '/webpages' }, function(){
      this.route('new', { path: '/new' });
    });
  });

  window.App.IndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo( 'webpages' );
    }
  });

}).call();