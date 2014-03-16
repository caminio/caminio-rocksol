( function(){

  'use strict';

  window.App.WebpagesEditController = Ember.Controller.extend({

    actions: {

      saveTranslation: function(){
        var webpage = this.get('model');
        webpage.save().then(function(){
          notify('info', Em.I18n.t('webpage.saved', {name: webpage.get('name')}));
        })
        .catch( function(err){
          notify('error',err);
        });
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
      },

      'insertImage': function( mediafile ){
        $('#editor').ghostDown('insertImage', mediafile);
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
      controller.set('webpages', controller.store.find('webpage', {parent: 'null'}));
      controller.set('labels', controller.store.find('label'));
      this.store.find('user');
    }
  });

}).call();