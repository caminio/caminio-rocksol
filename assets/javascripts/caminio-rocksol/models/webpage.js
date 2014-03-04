( function(){

  'use strict';

  window.App.Translation = DS.Model.extend({
    locale: DS.attr(),
    title: DS.attr(),
    subtitle: DS.attr(),
    content: DS.attr(),
    metaDescription: DS.attr(),
    metaKeywords: DS.attr()
  });
  
  window.App.Pebble = DS.Model.extend({
    name: DS.attr(),
    translations: DS.hasMany( 'translation' )
  });
  
  window.App.Webpage = DS.Model.extend({
    name: DS.attr('string'),
    requestReviewBy: DS.attr('object'),
    status: DS.attr('string'),
    translations: DS.hasMany( 'translation' ),
    pebbles: DS.hasMany( 'pebble' ),
    usedLocales: function(){
      var locales = this.get('translations').map(function(trans){ return trans.locale }).join(',');
      if( locales.length < 1 )
        return Em.I18n.t('translation.no');
    }.property('translations'),
    usedPebbles: function(){
      return Em.I18n.t('pebbles.amount', { count: this.get('pebbles').content.length });;
    }.property('pebbles')
  });

}).call();