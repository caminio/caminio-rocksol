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


    $.getJSON('/caminio/website/available_layouts', function(response){
      controller.set('availableLayouts', response);
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

    isDraft: function(){
      return this.get('curWebpage.status') === 'draft';
    }.property('curWebpage.status'),

    isPublished: function(){
      return this.get('curWebpage.status') === 'published';
    }.property('curWebpage.status'),

    inReview: function(){
      return this.get('curWebpage.status') === 'review';
    }.property('curWebpage.status'),

    noWebpage: function(){
      if( this.get('rootWebpages') )
        return this.get('rootWebpages').content.length < 1;
      return true;
    }.property('rootWebpages'),

    actions: {

      'editWebpage': function( webpage ){
        this.transitionToRoute( 'webpages.edit', webpage.id );
      },

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
        if( this.get('curWebpage.status') !== 'review' ){
          this.get('curWebpage').set('requestReviewMsg','');
          this.get('curWebpage').set('requestReviewBy',null);
        }
      },

      'cancelClose': function(){
        var self = this;
        var webpage = this.get('curWebpage');

        if( this.get('curWebpage.isDirty') )
          bootbox.confirm( Em.I18n.t('unsaved_data_continue'), function(result){
            if( result )
              restoreWebpage( webpage, self );
          });
        else
          restoreWebpage( webpage, this );
      },

      'removeWebpage': function(){
        var self = this;
        var webpage = this.get('curWebpage');
        bootbox.confirm( Em.I18n.t('webpage.really_delete', {name: webpage.get('name') }), function(result){
          if( result ){
            webpage.deleteRecord();
            webpage.save().then( function(){
              notify('info', Em.I18n.t('webpage.deleted', {name: webpage.get('name') }) );
              self.set('curWebpage',null);
            });
          }
        });
      }

    }
  });

  function restoreWebpage( webpage, controller ){

    $('.webpages-tree .active').removeClass('active');
    webpage.rollback();
    controller.set('curWebpage',null);

  }

}).call();