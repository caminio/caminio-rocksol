( function(){

  'use strict';

  window.App.WebpagesEditController = Ember.Controller.extend({

    actions: {

      saveTranslation: function(){
        this.get('model').save();
      },

      'cancelEdit': function( webpage ){
        webpage.rollback();
        this.transitionToRoute('webpages');
      },

      // ---------------------------------------- EDITOR COMMANDS
      'replaceText': function( cmd ){
        $('#editor').ghostDown('replaceText', cmd);
      },


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