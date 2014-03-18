( function(){

  'use strict';

  window.App.Translation = DS.Model.extend({
    locale: DS.attr(),
    title: DS.attr(),
    subtitle: DS.attr(),
    content: DS.attr(),
    metaDescription: DS.attr(),
    metaKeywords: DS.attr(),
    availableLangs: function(){
      return currentDomain.preferences.availableLangs;
    }.property('locale')
  });

}).call();