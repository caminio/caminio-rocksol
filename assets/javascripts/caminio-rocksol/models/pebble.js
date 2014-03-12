( function(){

  'use strict';
  
  window.App.Pebble = DS.Model.extend({
    name: DS.attr(),
    translations: DS.hasMany( 'translation' )
  });

}).call();