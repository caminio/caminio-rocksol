( function(){

  'use strict';
  
  window.App.Webpage = DS.Model.extend({
    name: DS.attr('string'),
    requestReviewBy: DS.belongsTo('user'),
    requestReviewMsg: DS.attr(),
    status: DS.attr('string', { defaultValue: 'draft'}),
    translations: DS.hasMany( 'translation' ),
    layout: DS.attr(),
    parent: DS.belongsTo('webpage'),
    pebbles: DS.hasMany( 'pebble' ),
    usedLocales: function(){
      var locales = this.get('translations').map(function(trans){ return trans.locale; }).join(',');
      if( locales.length < 1 )
        return Em.I18n.t('translation.no');
    }.property('translations'),
    usedPebbles: function(){
      return Em.I18n.t('pebbles.amount', { count: this.get('pebbles').content.length });
    }.property('pebbles'),
    isPublished: function(){
      return this.get('status') === 'published';
    }.property('status'),
    inReview: function(){
      return this.get('status') === 'review';
    }.property('status'),
    isDraft: function(){
      return this.get('status') === 'draft';
    }.property('status'),
    url: function(){
      var url = 'http://'+currentDomain.fqdn;
      if( this.get('parent') )
        url += this.get('parent').urlPart().replace('.htm','');
      return url+this.urlPart();
    },
    urlPart: function(){
      return '/'+this.get('name').replace(/[^\w]/g,'_').toLowerCase()+'.htm';
    }
  });

}).call();