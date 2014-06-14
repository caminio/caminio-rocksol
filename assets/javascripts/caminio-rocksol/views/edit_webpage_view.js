(function( App ){
  
  'use strict';

  App.WebpagesEditView = Em.View.extend({
    didInsertElement: function(){
      var model = this.get('controller.model');
      App.setupCtrlS( model, Em.I18n.t('webpage.saved', {name: model.get('curTranslation.title')}) );

      if( !model.get('isNew') )
        return;

      $('.level2 .tooltip-hint').tooltip().tooltip('show');
      $('.level2 input[type=text]:first').focus();
    },

    titleObserver: function(){
      if( this.get('controller.model.curTranslation.title') && this.get('controller.model.curTranslation.title').length > 0 ){
        this.get('controller').set('missingTitle', false);
        return $('.level2 .tooltip-hint').tooltip('hide');
      }
      $('.level2 .tooltip-hint').tooltip('show');
    }.observes('controller.model.curTranslation.title'),

    curContentObserver: function(){
      this.rerender();
    }.observes('controller.curContent')

  });

  App.WebpagesNewView = App.WebpagesEditView.extend({
    templateName: 'webpages/edit'
  });

})( App );
