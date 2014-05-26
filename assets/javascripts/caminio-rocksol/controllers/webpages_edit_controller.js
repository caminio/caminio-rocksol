( function(){

  'use strict';

  window.App.WebpagesEditController = Ember.Controller.extend({

    actions: {

      saveTranslation: function(){
        var webpage = this.get('webpage');
        webpage.save().then(function(){
          notify('info', Em.I18n.t('webpage.saved', {name: webpage.get('filename')}));
        })
        .catch( function(err){
          notify('error',err);
        });
        this.get('pebbles').forEach(function(pebble){
          pebble.save();
        });
      },

      'cancelEdit': function( webpage ){
        webpage.rollback();
        this.transitionToRoute('webpages');
      },

      'changeLayout': function( layout ){
        this.get('webpage').set('layout', layout);
        var webpage = this.get('webpage');
        webpage.save().then(function(){
          notify('info', Em.I18n.t('webpage.layout_changed', {name: webpage.get('filename'), layout: webpage.get('layout')}));
        });
      },

      'changeLang': function( lang ){
        var webpage = this.get('webpage');
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
      },

      'editContent': function( content ){
        App.set('_curEditorContent', content);
        $('#editor').ghostDown('setValue', content.get('curTranslation.content') );
        $('#editor').off('keyup').on('keyup', function(){
          content.get('curTranslation').set('content', $('#editor').ghostDown('getMarkdown') );
        });
      }



    }

  });

  window.App._updatePreview = function( html ){
    $('#rocksol-preview').contents().find('#markdown_'+App.get('_curEditorContent.id')).html(html);
  };

  window.App.WebpagesEditRoute = Ember.Route.extend({
    model: function( params ){
      return this.store.find('webpage', params.id );
    },
    setupController: function( controller, model ){
      App.set('_curEditorContent', model);
      controller.set('webpage', model);
      controller.set('translation', model.get('translations').content[0] );
      controller.set('webpages', controller.store.find('webpage', {parent: 'null'}));
      controller.set('labels', controller.store.find('label'));
      controller.set('pebbles', controller.store.find('pebble', { webpage: model.id}));
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
