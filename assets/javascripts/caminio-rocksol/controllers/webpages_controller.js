( function(){

  'use strict';

  var webpages;

  window.App.WebpagesIndexView = Ember.View.extend({
    didInsertElement: function(){
      this.$().find('.caminio-tree').nestedSortable({
        handle: '.move',
        items: 'li'
      });
    }
  })
  window.App.WebpagesIndexRoute = Ember.Route.extend({

    setupController: function( controller, model ){
      if( webpages )
        return;
      this.store.find('webpage').then( function( _webpages ){
        webpages = _webpages;
        controller.set('webpages',webpages);
        controller.set('rootWebpages', webpages);
      });
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

    publishStatuses: [
      { id: 'published', text: Em.I18n.t('published') },
      { id: 'draft', text: Em.I18n.t('draft') }
    ],

    isDraft: function(){
      return this.get('curWebpage.status') === 'draft';
    }.property('curWebpage.status'),

    isPublished: function(){
      return this.get('curWebpage.status') === 'published';
    }.property('curWebpage.status'),

    inReview: function(){
      return this.get('curWebpage.status') === 'review';
    }.property('curWebpage.status'),

    actions: {

      'promptNewWebpage': function(){
        var self = this;
        bootbox.prompt( Em.I18n.t('webpage.enter_name'), function(result) { 
          if( !result || result.length < 1 )
            return;
          var model = self.store.createRecord('webpage', { name: result });
          model.save().then( function(){
            notify('info', Ember.I18n.t('webpage.created', {name: model.get('name')}) );
          }).catch(function(err){
            notify.processError( err.responseJSON );
          });
        });

      },

      'webpageDetails': function( webpage ){
        this.set('curWebpage', webpage);
        $('.webpages-tree .active').removeClass('active');
        $('.webpages-tree [data-id='+this.get('curWebpage.id')+']').addClass('active');
      },

      'setState': function( state ){
        this.get('curWebpage').set('status', state );
      }

    }
  });

}).call();