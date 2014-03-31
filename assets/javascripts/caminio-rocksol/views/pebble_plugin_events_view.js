(function(){
  
  'use strict';

  var syncModelIval;

  window.App.PebblePluginEventsView = Em.View.extend({

    templateName: 'pebble_plugins/events',

    didInsertElement: function(){

      var starts = moment().add('hour',1).startOf('hour').toDate();
      var activity = App.User.store.createRecord('activity', { startsAt: starts });
      this.get('controller').set('curPebbleActivity', activity );
      $('#activity-datepicker').datepicker('setDate', starts );
      $('#activity-timepicker').val( moment(starts).format('HH:mm') );    

      setupPebbleActivity( this.get('controller') );
        
    },

  });

}).call();

function setupPebbleActivity( controller ){

  $('#activity-datepicker')
    .datepicker({
      prevText: '',
      nextText: '',
      dateFormat: 'yy-mm-dd',
      onSelect: function( dateString ){
        setDate( moment(dateString) );
      }
    });

  $('#activity-timepicker').on('change', function(e){
    setDate( moment( $('#activity-datepicker').val() ) );
  });

  function setDate( startDate ){
    var startTime = $('#activity-timepicker').val().split(':');
    if( startTime.length === 2 ){
      startDate.hour( startTime[0] );
      startDate.minute( startTime[1] );
    }
    if( controller.get('curPebbleActivity') )
      controller.get('curPebbleActivity').set('startsAt', new Date(startDate.toISOString()) );

  }

}