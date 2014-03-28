( function( App ){

  'use strict';

  var locationMap;

  var PlainLocationSchema = {
    type: 'location'
  };

  App.LocationsModalComponent = Ember.Component.extend({

    didInsertElement: function(){
      this.set('locations', App.User.store.find('pebble', { type: 'location' }));
      this.set('curLocation', App.User.store.createRecord('pebble', PlainLocationSchema));
      setTimeout(function(){
        locationMap = L.map('location-map').setView([47.0667, 15.433], 13);
        L.tileLayer('http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}', {
          attribution: 'Map &copy; <a href="http://developer.here.com">Nokia</a>, Data &copy; NAVTEQ 2012',
          subdomains: '1234',
          devID: 'xyz',
          appID: 'abc'
        }).addTo(locationMap);
      }, 500);
    },

    actions: {

      saveLocation: function(){

        var self = this;
        this.get('curLocation').save().then(function(){
          notify('info', Em.I18n.t('location.saved', {name: self.get('location.name') }));
        });

      },

      useLocation: function(){
        var view = Ember.View.views[ $('#pebbles-library').closest('.ember-view').attr('id') ];
        var activity = view.get('curPebbleActivity');
        var loc = this.get('curLocation');
        activity.set('location', loc);
        view.get('curPebble').save().then(function(){
          notify('info', Em.I18n.t('location.linked', { name: loc.get('name'), at: moment(activity.get('startsAt')).format('LLLL') }));
        });
      }

    }

  });

  App.LocationController = Ember.Controller.extend({

    isCurrentLocation: function(){
      return( this.get('parentController.curLocation.id') && this.get('parentController.curLocation.id') === this.get('content.id') );
    }.property('parentController.curLocation'),

    actions: {

      editLocation: function( location ){
        
        if( location.get('id') === this.get('parentController.curLocation.id') )
          return this.set('curLocation', App.User.store.createRecord('pebble', PlainLocationSchema));

        this.get('parentController').set('curLocation', location);
      }

    }

  });

})(App);