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

      'openMediaLibrary': function( webpage ){
        $('#media-library').modal('show');
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

      // media library
      controller.set('labels', []);
      controller.set('currentLabel', null);
      controller.set('unlabeledFiles', this.store.find('mediafile'));
      controller.set('curFile', null);
      this.store.find('user');

    }
  });

}).call();