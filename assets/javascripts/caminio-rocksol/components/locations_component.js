( function( App ){

  'use strict';

  var locationMap;
  var locationMarker;
  var locationLatLng;

  var PlainLocationSchema = {
    type: 'location'
  };

  App.LocationsModalComponent = Ember.Component.extend({

    didInsertElement: function(){
      this.set('locations', App.User.store.find('pebble', { type: 'location' }));
      this.set('curLocation', App.User.store.createRecord('pebble', PlainLocationSchema));

      locationLatLng = new L.LatLng( 47.0667, 15.433 );

      locationMap = L.map('location-map').setView( locationLatLng, 13);
      L.tileLayer('http://{s}.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?token={devID}&app_id={appID}', {
        attribution: 'Map &copy; <a href="http://developer.here.com">Nokia</a>, Data &copy; NAVTEQ 2012',
        subdomains: '1234',
        devID: 'xyz',
        appID: 'abc'
      }).addTo(locationMap);

      var self = this;
      locationMap.on('click', function(e){ setMapMarker( self.get('curLocation'), e ); });

    },

    actions: {

      saveLocation: function(){

        var self = this;
        this.get('curLocation').save().then(function(){
          self.set('locations', App.User.store.find('pebble', {type: 'location'}));
          notify('info', Em.I18n.t('location.saved', {name: self.get('location.name') }));
        });

      },

      useLocation: function(){
        var view = Ember.View.views[ $('#pebbles-library').closest('.ember-view').attr('id') ];
        var activity = view.get('curPebbleActivity');
        var loc = this.get('curLocation');
        activity.set('location', loc.get('id'));
        view.get('curPebble').save().then(function(){
          notify('info', Em.I18n.t('location.linked', { name: loc.get('name'), at: moment(activity.get('startsAt')).format('LLLL') }));
          $('#locations-library').modal('hide');
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

        if( typeof(location.get('lng')) === 'number'  && typeof(location.get('lat')) === 'number' ){
          var latLng = L.latLng(location.get('lat'),location.get('lng'));
          setMapMarker( location, { latlng: latLng });
        }
      },

      removeLocation: function( location ){
        location.deleteRecord();
        location.save().then(function(){
          notify('info', Em.I18n.t('location.removed', { name: location.get('name')}) );
        });
      }

    }

  });

  function setMapMarker( curLocation, e ){
    
    locationLatLng.lat = e.latlng.lat;
    locationLatLng.lng = e.latlng.lng;

    if( !locationMarker ){ // only activate marker once
      locationMarker = new L.marker( locationLatLng, {id: 'location-marker', icon: getMapMarkerIcon(), draggable: true });
      locationMarker.on('dragend', function(e){ setMapMarkerDrag(curLocation,e); });
      locationMap.addLayer(locationMarker);
    }

    if( e.target ){
      var position = locationMarker.getLatLng();
      curLocation.set('lat', position.lat);
      curLocation.set('lng', position.lng);
      notify('info', Em.I18n.t('location.geo_coords_changed', {name: curLocation.get('name'), lat: position.lat, lng: position.lng}));
    }

    locationMarker.update();
    locationMap.panTo( locationLatLng );

  }

  function setMapMarkerDrag( curLocation, e ){
    var marker = e.target;
    var position = marker.getLatLng();
    curLocation.set('lat', position.lat);
    curLocation.set('lng', position.lng);
    notify('info', Em.I18n.t('location.geo_coords_changed', {name: curLocation.get('name'), lat: position.lat, lng: position.lng}));
  }

  function getMapMarkerIcon(){
    return L.icon({
        iconUrl: '/images/3rdparty/leaflet/marker-icon.png',
        shadowUrl: '/images/3rdparty/leaflet/marker-shadow.png',
    });
  }

})(App);