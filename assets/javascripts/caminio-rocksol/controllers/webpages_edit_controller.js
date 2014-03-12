( function(){

  'use strict';

  window.App.WebpagesEditController = Ember.Controller.extend({

    actions: {

      saveTranslation: function(){
        var tr = this.get('model.translations').findBy('id', this.get('translation').id);
        tr.set('content', $('.editor').ghostDown('getMarkdown') );
        this.get('model').save();
      }

    }

  });

  window.App.WebpagesEditRoute = Ember.Route.extend({
    model: function( params ){
      return this.store.find('webpage', params.id );
    },
    setupController: function( controller, model ){
      controller.set('model', model);
      controller.set('translation', model.get('translations').content[0] );
    }
  });

}).call();