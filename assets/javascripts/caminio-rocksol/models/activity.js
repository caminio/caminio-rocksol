( function( App ){

  'use strict';
  
  App.Activity = DS.Model.extend({
    startsAt: DS.attr('date'),
    note: DS.attr(),
    seats: DS.attr('number', { defaultValue: 80 })
  });

})( App );