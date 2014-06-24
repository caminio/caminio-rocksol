( function(){

  'use strict';
  
  window.App.Webpage = DS.Model.extend({
    filename: DS.attr('string'),
    requestReviewBy: DS.belongsTo('user'),
    requestReviewMsg: DS.attr(),
    status: DS.attr('string', { defaultValue: 'draft'}),
    translations: DS.hasMany( 'translation', { embedded: 'always' } ),
    layout: DS.attr(),
    childrenLayout: DS.attr(),
    parent: DS.belongsTo('webpage'),
    pebbles: DS.hasMany( 'pebble', { embedded: 'always' } ),
    updatedBy: DS.belongsTo('user'),
    createdBy: DS.belongsTo('user'),
    updatedAt: DS.attr('date'),
    createdAt: DS.attr('date'),
    name: function(){
      return this.get('curTranslation.title');
    }.property('curTranslation.title'),
    usedLocales: function(){
      var locales = this.get('translations').map(function(trans){ return trans.get('locale'); });
      if( locales.length < 1 )
        return Em.I18n.t('translation.no');
      return locales.join(',');
    }.property('translations'),
    isPublished: function(){
      return this.get('status') === 'published';
    }.property('status'),
    inReview: function(){
      return this.get('status') === 'review';
    }.property('status'),
    isDraft: function(){
      return this.get('status') === 'draft';
    }.property('status'),
    curTranslation: function(){
      return this.get('translations').findBy('locale', App._curLang);
    }.property('translations.@each', 'App._curLang'),
    previewUrl: function(){
      if( this.get('isNew') )
        return '';
      var url = 'https://'+currentDomain.fqdn+'/drafts/'+this.get('id');
      if( this.get('translations').content.length > 1 )
        url += '.htm' + (App.get('_curLang') ? '.'+App.get('_curLang') : '');
      return url;
    }.property('translations.@each', 'id'),
    ancestors: function(){
      return getAncestors(Em.A(), this.get('parent'));
    }.property('parent')

  });

  function getAncestors( ancs, webpage ){
    if( webpage && webpage.get('id') ){
      ancs.pushObject( webpage );
      return getAncestors( ancs, webpage.get('parent') );
    }
    return ancs;
  }

}).call();
