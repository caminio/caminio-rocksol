( function( App ){

  'use strict';

  App.WebpageComponent = Ember.Component.extend({

    actions: {
      'toggleContainer': function( prop ){
        this.toggleProperty( prop );
      }
    }

  });

})(App);