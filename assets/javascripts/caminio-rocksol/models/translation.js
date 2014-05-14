( function(){

  'use strict';

  window.App.Translation = DS.Model.extend({
    locale: DS.attr(),
    title: DS.attr(),
    subtitle: DS.attr(),
    content: DS.attr(),
    metaDescription: DS.attr(),
    metaKeywords: DS.attr(),
    aside: DS.attr(),
    availableLangs: function(){
      return domainSettings.availableLangs;
    }.property('locale'),
    hasMultiLang: function(){
      return domainSettings.availableLangs && domainSettings.availableLangs.length > 1;
    }.property('locale')
  });

}).call();
