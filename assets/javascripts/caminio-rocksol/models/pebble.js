( function( App ){

  'use strict';
  
  App.Pebble = DS.Model.extend({
    name: DS.attr(),
    type: DS.attr('string'),
    description: DS.attr(),
    pebbles: DS.hasMany( 'pebble', { embedded: 'always' } ),
    updatedBy: DS.belongsTo('user'),
    createdBy: DS.belongsTo('user'),
    updatedAt: DS.attr('date'),
    createdAt: DS.attr('date'),
    translations: DS.hasMany( 'translation', { embedded: 'always'} ),
    preferences: DS.attr('object'),
    curTranslation: function(){
      return this.get('translations').findBy('locale', App._curLang);
    }.property('translations.@each', 'App._curLang')
  });

})( App );
