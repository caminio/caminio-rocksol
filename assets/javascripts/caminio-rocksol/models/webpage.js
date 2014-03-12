( function(){

  'use strict';

  window.App.User = DS.Model.extend({
    firstname: DS.attr('string'),
    lastname: DS.attr('string'),
    email: DS.attr('string'),
    fullname: function(){
      var name = '';
      if( this.get('firstname') && this.get('firstname').length > 0 )
        name += this.get('firstname');
      if( name.length > 0 && this.get('lastname') && this.get('lastname').length > 0 )
        name += ' ';
      if( this.get('lastname') && this.get('lastname').length > 0 )
        name += this.get('lastname');
      return name;
    }.property('firstname', 'lastname')
  });
  
  window.App.Webpage = DS.Model.extend({
    name: DS.attr('string'),
    requestReviewBy: DS.belongsTo('user'),
    requestReviewMsg: DS.attr(),
    status: DS.attr('string', { defaultValue: 'draft'}),
    translations: DS.hasMany( 'translation' ),
    layout: DS.attr(),
    pebbles: DS.hasMany( 'pebble' ),
    usedLocales: function(){
      var locales = this.get('translations').map(function(trans){ return trans.locale }).join(',');
      if( locales.length < 1 )
        return Em.I18n.t('translation.no');
    }.property('translations'),
    usedPebbles: function(){
      return Em.I18n.t('pebbles.amount', { count: this.get('pebbles').content.length });;
    }.property('pebbles'),
    isPublished: function(){
      return this.get('status') === 'published';
    }.property('status'),
    inReview: function(){
      return this.get('status') === 'review';
    }.property('status'),
    isDraft: function(){
      return this.get('status') === 'draft';
    }.property('status')
  });

}).call();