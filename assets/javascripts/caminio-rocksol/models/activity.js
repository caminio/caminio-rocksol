( function( App ){

  'use strict';
  
  App.Activity = DS.Model.extend({
    startsAt: DS.attr('date'),
    note: DS.attr(),
    seats: DS.attr('number', { defaultValue: 80 }),
    location: DS.attr(),
    locationObj: function(){
      return App.Pebble.store.getById('pebble', this.get('location'));
    }.property('location')
  });

})( App );