( function( App ){

  'use strict';

  App.WebpagesEditController = Ember.ObjectController.extend({

    domain: currentDomain,
    lastStatus: null,

    saveText: function(){
      switch(this.get('content.status') ){
        case 'published':
          return this.get('content.isNew') ? Em.I18n.t('webpage.create_and_publish') : 
            ( this.get('lastStatus') !== this.get('content.status') ? Em.I18n.t('webpage.save_and_publish') : Em.I18n.t('webpage.update_publication'));
        case 'draft':
          return this.get('content.isNew') ? Em.I18n.t('webpage.create_draft') : Em.I18n.t('webpage.save_draft');
      }
    }.property('content.status'),

    pebbleContent: function(){
      return this.get('content.id') !== this.get('content.curContent.id');
    }.property('content.curContent'),

    actions: {

      saveTranslation: function(){
        var webpage = this.get('content');
        var controller = this;
        if( Em.isEmpty( webpage.get('curTranslation.title') ) ){
          this.set('missingTitle', true);
          $('.level2 input[type=text]:first').focus();
          return notify('error', Em.I18n.t('webpage.enter_name'));
        }
        webpage.save().then(function(){
          notify('info', Em.I18n.t('webpage.saved', {name: webpage.get('filename')}));
          webpage.reload();
          controller.transitionToRoute('webpages.edit', webpage.get('id'));
        })
        .catch( function(err){
          notify.processError(err);
        });
      },

      'clearCurContent': function(){
        this.set('curContent', this.get('content'));
      },

      'showEditorReferenceModal': function(){
        $('#editor-reference').modal();
      },

      'togglePebbleList': function(){
        $('.editor-tools').toggleClass('show-list');
        this.set('pebbleListVisible', $('.editor-tools').hasClass('show-list'));
      },

      'addPebble': function(){
        var tr = this.store.createRecord('translation', { locale: App.get('_curLang') });
        var pebble = this.store.createRecord('pebble', { createdBy: App.emberUser, updatedBy: App.emberUser, createdAt: new Date(), updatedAt: new Date() });
        pebble.get('translations').pushObject(tr);
        pebble.set('isEditing',true);
        this.get('content.pebbles').pushObject(pebble);
        this.get('content').send('becomeDirty');
      },

      'toggleStatus': function( status ){
        this.get('content').set('status', status);
      },

      'cancelEdit': function( webpage ){
        webpage.rollback();
        this.transitionToRoute('webpages');
      },

      'deleteWebpage': function(){
        var controller = this;
        var webpage = this.get('content');
        bootbox.confirm(Em.I18n.t('webpage.really_delete', {name: this.get('content.curTranslation.title')}), function(result){
          if( !result )
            return;
          webpage.deleteRecord();
          webpage
            .save()
            .then(function(){
              notify('info', Em.I18n.t('webpage.deleted', {name: webpage.get('curTranslation.title')}));
              controller.transitionToRoute('webpages');
            })
            .catch(function(err){
              notify.processError(err);
            });
        });
      },

      'changeLayout': function( layout ){
        var webpage = this.get('content');
        webpage.set('layout', layout);
        webpage.save().then(function(){
          notify('info', Em.I18n.t('webpage.layout_changed', {name: webpage.get('filename'), layout: webpage.get('layout')}));
        });
      },

      'changeLang': function( lang ){
        var curTr = this.get('curContent.curTranslation');
        var tr = this.get('curContent.translations').findBy('locale', lang);
        console.log('found tr', tr);
        if( !tr ){
          tr = this.store.createRecord('translation', { locale: lang,
                                                        title: curTr.get('title'),
                                                        subtitle: curTr.get('subtitle'),
                                                        content: curTr.get('content') });
          this.get('curContent.translations').pushObject( tr );
        }
        App.set('_curLang',lang);
        Ember.View.views[ $('.md-editor.ember-view').attr('id') ].swapVal( this.get('curContent.curTranslation.content'));
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
      }



    }

  });

  App.WebpagesNewController = App.WebpagesEditController.extend();

})( App );
