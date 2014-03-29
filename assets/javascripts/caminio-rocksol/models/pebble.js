( function(){

  'use strict';
  
  window.App.Pebble = DS.Model.extend({
    name: DS.attr(),
    type: DS.attr(),
    description: DS.attr(),
    teaser: DS.belongsTo('mediafile'),
    translations: DS.hasMany( 'translation' ),
    preferences: DS.attr('object'),
    activities: DS.hasMany( 'activity' ),
    street: DS.attr(),
    zip: DS.attr(),
    city: DS.attr(),
    country: DS.attr(),
    state: DS.attr(),
    lat: DS.attr('number'),
    lng: DS.attr('number'),
    getIcon: function(){
      switch( this.get('type') ){
        case 'teaser':
          return 'fa-picture-o';
        case 'events':
          return 'fa-clock-o';
        default: 
          return 'fa-square';
      }
    }.property('type')
  });

}).call();