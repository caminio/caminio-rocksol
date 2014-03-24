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

      'changeLayout': function( layout ){
        this.get('model').set('layout', layout);
        this.get('translation').send('becomeDirty');
      },

      'changeLang': function( lang ){
        var webpage = this.get('model');
        var curTr = this.get('translation');
        var tr = webpage.get('translations').find( function( tr ){
          return tr.get('locale') === lang;
        });
        if( !tr ){
          tr = this.store.createRecord('translation', { locale: lang,
                                                        title: curTr.get('title'),
                                                        subtitle: curTr.get('subtitle'),
                                                        content: curTr.get('content') });
          webpage.get('translations').pushObject( tr );
        }
        this.set('translation', tr );
        $('#editor').ghostDown('setValue', this.get('translation.content') );
      },

      // ---------------------------------------- EDITOR COMMANDS
      'replaceText': function( cmd ){
        $('#editor').ghostDown('replaceText', cmd);
      },

      'openMediaLibrary': function( webpage ){
        $('#media-library').modal('show');
      },

      'openPebblesLibrary': function( webpage ){
        $('#pebbles-library').modal('show');
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
      controller.set('associatedPebbles', controller.store.find('pebble', { webpage: model.id}));
      controller.set('pebbles', controller.store.find('pebble'));
      controller.store.find('mediafile',{parent: model.id});
      this.store.find('user');

      if( typeof(availableWebpageLayouts) === 'undefined' )
        $.getJSON('/caminio/website/available_layouts', function(response){
          window.availableWebpageLayouts = response;
          controller.set('availableLayouts', availableWebpageLayouts);
        });
      else
        controller.set('availableLayouts', availableWebpageLayouts);

    }
  });

}).call();