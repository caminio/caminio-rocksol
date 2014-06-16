( function( App ){

  'use strict';
  /* global setupCaminio */

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

  /**
   * webpages/edit
   */
  App.WebpagesEditRoute = Ember.Route.extend({
    model: function( params ){
      var router = this;
      return router.store
              .find('webpage', params.id )
              .then( function( model ){
                router.store
                  .find('mediafile',{parent: params.id});
                return model;
              });
    },
    setupController: function( controller, model ){
      this._super( controller, model );
      controller.set('lastStatus', model.get('status'));
      controller.set('curSelectedItem', model);
      controller.set('curContent',model);
    }
  });

  /**
   * webpages/new
   */
  App.WebpagesNewRoute = Ember.Route.extend({
    model: function(){
      var tr = this.store.createRecord('translation', { locale: App.get('_curLang'), content: '', title: '' });
      var webpage = this.store.createRecord('webpage', { updatedAt: new Date() });
      if( $('.tree .selected:first')  )
        webpage.set( 'parent', this.store.getById('webpage', $('.tree .selected:first').attr('data-id') ) );
      webpage.get('translations').pushObject(tr);
      webpage.set('createdBy', App.emberUser);
      webpage.set('updatedBy', App.emberUser);
      return webpage;
    },
    setupController: function( controller, model ){
      this._super( controller, model );
      controller.set('curSelectedItem', model);
      controller.set('curContent',model)
    }
  });


  /**
   * APPLICATION GLOBAL STUFF
   */
  App.ApplicationRoute = Ember.Route.extend({
    beforeModel: function(){
      $.getJSON('/caminio/website/available_layouts', function(response){
        App._availableLayouts = response;
      });
      return this.store.find('user');
    }
  });

  App.ApplicationView = Em.View.extend({
    didInsertElement: function(){
      setupCaminio(this.$());
    }
  });

})( App );
