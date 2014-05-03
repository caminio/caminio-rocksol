( function(){

  'use strict';

  var webpages;

  window.App.WebpagesIndexRoute = Ember.Route.extend({

    setupController: function( controller, model ){

      if( webpages )
        return;
      
      controller.set('webpages', this.store.find('webpage', { parent: 'null' }));

      if( typeof(availableWebpageLayouts) === 'undefined' )
        $.getJSON('/caminio/website/available_layouts', function(response){
          window.availableWebpageLayouts = response;
          controller.set('availableLayouts', availableWebpageLayouts);
        });
      else
        controller.set('availableLayouts', availableWebpageLayouts);

    }
  });

  window.App._curLang = currentDomain.lang;

  window.App.WebpagesIndexController = Ember.Controller.extend({

    multiLangs: function(){
      return domainSettings.availableLangs.length > 1;
    }.property(),

    availableLangs: function(){
      return domainSettings.availableLangs;
    }.property(),

    domain: currentDomain,

    errors: [],

    siteComponents: window.siteComponents,

    filenameError: function(){
      return ('filename' in this.get('errors'));
    }.property('errors'),

    langError: function(){
      return ('lang' in this.get('errors'));
    }.property('errors'),

    isDraft: function(){
      return this.get('curSelectedItem.status') === 'draft';
    }.property('curSelectedItem.status'),

    isPublished: function(){
      return this.get('curSelectedItem.status') === 'published';
    }.property('curSelectedItem.status'),

    inReview: function(){
      return this.get('curSelectedItem.status') === 'review';
    }.property('curSelectedItem.status'),

    noWebpage: function(){
      return !(this.get('webpages.content') && this.get('webpages.content').content && this.get('webpages.content').content.length > 1);
    }.property('webpages.content'),

    curTranslation: null,

    updateCurTranslation: function(){
      var self = this;
      var oldTr = this.get('curTranslation');
      this.set('curTranslation',null);
      if( !this.get('curSelectedItem') )
        return;
      this.set('curTranslation', this.get('curSelectedItem').get('translations').content.find(function(tr){
        if( tr.get('locale') === App.get('_curLang') )
          return true;
      }));
      if( this.get('curTranslation') )
        return;

      var tr = this.store.createRecord('translation', { locale: App.get('_curLang'),
                                                    title: oldTr ? oldTr.get('title') : 'Title',
                                                    subtitle: oldTr ? oldTr.get('subtitle') : 'Subtitle',
                                                    metaDescription: oldTr ? oldTr.get('metaDescription') : '',
                                                    metaKeywords: oldTr ? oldTr.get('metaKeywords') : '',
                                                    content: oldTr ? oldTr.get('content') : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a neque vel felis iaculis pulvinar ut sed erat. Aliquam accumsan diam diam, ac facilisis massa blandit vel. Morbi sollicitudin est non bibendum consequat. Maecenas pretium lobortis neque, eu luctus lectus pharetra id. Phasellus sem libero, viverra ut purus id, accumsan interdum orci. Donec sed mauris ullamcorper, luctus ligula ac, euismod erat. Maecenas faucibus eros justo. Aliquam tempor ipsum augue, tempus tempus lorem porttitor at. Nullam nulla tortor, facilisis nec consectetur eu, interdum sed elit. Praesent at iaculis odio.' });
      this.get('curSelectedItem.translations').pushObject( tr );
      this.set('curTranslation', tr);
    }.observes('curSelectedItem', 'App._curLang'),

    updateWebpageDirty: function(){
      if( this.get('curTranslation.isDirty') && this.get('curSelectedItem') )
        this.get('curSelectedItem').send('becomeDirty');
    }.observes('curTranslation.isDirty'),

    actions: {

      'editWebpage': function( webpage ){
        this.transitionToRoute( 'webpages.edit', webpage.id );
      },

      'toggleContainer': function( prop ){
        this.toggleProperty( prop );
      },

      'changeLang': function( lang ){
        App.set('_curLang',lang);
      },

      'compileAll': function(){
        $.getJSON('/caminio/websites/compile_all').done(function(){
          notify('info', Em.I18n.t('webpage.done_compile_all'));
        });
      },

      'promptNewWebpage': function(){
        var self = this;
        var title = Em.I18n.t('webpage.new_name');
        if( this.get('curSelectedItem') )
          title = Em.I18n.t('webpage.new_subpage_of', {name: this.get('curSelectedItem.name')});
        bootbox.prompt( title, function(result) { 
          if( !result || result.length < 1 )
            return;
          var model = self.store.createRecord('webpage', { filename: result });
          model.set('parent', self.get('curSelectedItem') );
          model.save().then( function(){
            notify('info', Ember.I18n.t('webpage.created', {name: model.get('filename')}) );
            self.set('curSelectedItem', model);
            self.set('addedItem', model);

            // fixes a strange bug where parent receives child id as parent id
            // casuing a circular loop
            if( model.get('parent') )
              model.get('parent').reload();
            
            // if parent try to initialize pebbles
            if( model.get('parent') && model.get('parent.childrenLayout')){
              notify('info', Ember.I18n.t('webpage.init_pebbles', {name: model.get('filename')}) );
              model.set('layout', model.get('parent.childrenLayout') );
              model.save().then(function(){
                notify('info', Ember.I18n.t('webpage.init_pebbles_done', {name: model.get('filename')}) );
              });
            }

          }).catch(function(err){
            console.error( err );
            notify.processError( err.responseJSON );
          });
        });

      },

      'treeItemSelected': function( webpage, select ){
        if( this.get('curSelectedItem.id') === webpage.get('id') && !select )
          return this.set('curSelectedItem',null);
        this.set('curSelectedItem', webpage);
      },

      'setState': function( state ){
        this.get('curSelectedItem').set('status', state );
        if( this.get('curSelectedItem.status') !== 'review' ){
          this.get('curSelectedItem').set('requestReviewMsg','');
          this.get('curSelectedItem').set('requestReviewBy',null);
        }
      },

      'saveWebpage': function( webpage ){
        var controller = this;
        webpage
          .save()
          .then( function(){
            notify('info', Em.I18n.t('webpage.saved', {name: webpage.get('filename')}));
            //controller.set('curSelectedItem',null);
          })
          .catch( function(err){
            notify('error',err);
          });
      },

      'previewWebpage': function( webpage ){

        var url = 'http://'+currentDomain.fqdn+'/drafts/'+webpage.get('id');
        if( webpage.get('translations').content.length > 1 )
          url += '.htm' + (App.get('_curLang') ? '.'+App.get('_curLang') : '');
        window.open( url );

      },

      'cancelClose': function(){
        var self = this;
        var webpage = this.get('curSelectedItem');

        if( this.get('curSelectedItem.isDirty') )
          bootbox.confirm( Em.I18n.t('unsaved_data_continue'), function(result){
            if( result )
              restoreWebpage( webpage, self );
          });
        else
          restoreWebpage( webpage, this );
      },

      'removeSelectedItem': function(){
        var self = this;
        var webpage = this.get('curSelectedItem');
        bootbox.confirm( Em.I18n.t('webpage.really_delete', {name: webpage.get('filename') }), function(result){
          if( result ){
            webpage.deleteRecord();
            webpage.save().then( function(){
              self.set('removedItem', webpage);
              notify('info', Em.I18n.t('webpage.deleted', {name: webpage.get('filename') }) );
              self.set('curSelectedItem',null);

            });
          }
        });
      }

    }
  });

  function restoreWebpage( webpage, controller ){

    $('.webpages-tree .active').removeClass('active');
    webpage.rollback();
    controller.set('curSelectedItem',null);

  }

}).call();