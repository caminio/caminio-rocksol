( function( App ){

  'use strict';

  App.WebpageActivitiesComponent = App.WebpageComponent.extend({

    actions: {

      newActivityDialog: function(){
        $('#activity-modal').modal('show');
        var activity = App.User.store.createRecord('activity', { startsAt: new Date() });
        this.set('activity', activity);
        $('#dp-start').datepicker('setDate', activity.get('startsAt') );
        $('#tp-start').timepicker('setTime', activity.get('startsAt') );
      },

      pushActivity: function(){
        var self = this;
        var activity = this.get('activity');
        this.get('webpage.activities').pushObject( activity );
        this.get('webpage').save().then( function(){
          self.get('webpage.activities').removeObject( activity );
          notify('info', Em.I18n.t('activity.saved', {starts: moment(activity.get('startsAt')).format('LLLL')}) );
        });
        if( !$('#activity-modal .keep-open').is(':checked') )
          $('#activity-modal').modal('hide');
      }

    },

    didInsertElement: function(){

      var self = this;

      $('#dp-start')
        .datepicker({
          format: 'yyyy-mm-dd',
          language: currentLang,
          autoclose: true,
          weekStart: 1
        })
        .on('changeDate.datepicker', function(e){
          var startDate = moment(e.date);
          var startTime = $('#tp-start').val().split(':');
          startDate.hour( startTime[0] );
          startDate.minute( startTime[0] );
          self.get('activity').set('startsAt', new Date(startDate.toISOString()) );
        });

      $('#tp-start').timepicker({minuteStep: 15})
        .on('changeTime.timepicker', function(e){
          var curTime = moment(self.get('activity.startsAt'));
          curTime.hour(e.time.hours);
          curTime.minute(e.time.minutes);
          self.get('activity').set('startsAt', new Date(curTime.toISOString()) );
        });

    }

  });



})( App );