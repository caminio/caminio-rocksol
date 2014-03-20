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

  window.App.WebpagesIndexController = Ember.Controller.extend({

    domain: currentDomain,

    errors: [],

    nameError: function(){
      return ('name' in this.get('errors'));
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

    actions: {

      'editWebpage': function( webpage ){
        this.transitionToRoute( 'webpages.edit', webpage.id );
      },

      'toggleContainer': function( prop ){
        this.toggleProperty( prop );
      },

      'promptNewWebpage': function(){
        var self = this;
        var title = Em.I18n.t('webpage.new_name');
        if( this.get('curSelectedItem') )
          title = Em.I18n.t('webpage.new_subpage_of', {name: this.get('curSelectedItem.name')});
        bootbox.prompt( title, function(result) { 
          if( !result || result.length < 1 )
            return;
          var model = self.store.createRecord('webpage', { name: result });
          model.set('parent', self.get('curSelectedItem') );
          model.save().then( function(){
            notify('info', Ember.I18n.t('webpage.created', {name: model.get('name')}) );
            self.set('curSelectedItem', model);
            self.set('addedItem', model);

          }).catch(function(err){
            console.error( err );
            notify.processError( err.responseJSON );
          });
        });

      },

      'treeItemSelected': function( webpage, select ){
        $('.webpages-tree .active').removeClass('active');
        if( this.get('curSelectedItem.id') === webpage.get('id') && !select )
          return this.set('curSelectedItem',null);
        this.set('curSelectedItem', webpage);
        $('.webpages-tree [data-id='+this.get('curSelectedItem.id')+']').addClass('active');
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
            notify('info', Em.I18n.t('webpage.saved', {name: webpage.get('name')}));
            controller.set('curSelectedItem',null);
          })
          .catch( function(err){
            notify('error',err);
          });
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

      'removeWebpage': function(){
        var self = this;
        var webpage = this.get('curSelectedItem');
        bootbox.confirm( Em.I18n.t('webpage.really_delete', {name: webpage.get('name') }), function(result){
          if( result ){
            webpage.deleteRecord();
            webpage.save().then( function(){
              notify('info', Em.I18n.t('webpage.deleted', {name: webpage.get('name') }) );
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