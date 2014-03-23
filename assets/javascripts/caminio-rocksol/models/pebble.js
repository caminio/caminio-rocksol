( function(){

  'use strict';
  
  window.App.Pebble = DS.Model.extend({
    name: DS.attr(),
    type: DS.attr(),
    description: DS.attr(),
    teaser: DS.belongsTo('mediafile'),
    translations: DS.hasMany( 'translation' ),
    getIcon: function(){
      switch( this.get('type') ){
        case 'teaser':
          return 'fa-picture-o';
        default: 
          return 'fa-square';
      }
    }.property('type')
  });

}).call();