( function(){

  'use strict';

  /* global domainSettings */

  window.App.Translation = DS.Model.extend({
    locale: DS.attr(),
    title: DS.attr(),
    subtitle: DS.attr(),
    content: DS.attr(),
    categories: DS.attr('array'),
    metaDescription: DS.attr(),
    metaKeywords: DS.attr(),
    aside: DS.attr(),
    aside2: DS.attr(),
    aside3: DS.attr(),
    availableLangs: function(){
      return domainSettings.availableLangs;
    }.property('locale'),
    hasMultiLang: function(){
      return domainSettings.availableLangs && domainSettings.availableLangs.length > 1;
    }.property('locale')
  });

}).call();
