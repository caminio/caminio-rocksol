(function( App ){

  /* globals Morris */
  'use strict';

  App.StatsVisitsView = Ember.View.extend({
    tagName: 'div',
    classNames: ['caminio-chart','visits-chart'],

    didInsertElement: function(){
      var visits = [
        { date: '2014-06-11', unique: 5, views: 22 },
        { date: '2014-06-12', unique: 15, views: 40 },
        { date: '2014-06-13', unique: 25, views: 65 },
        { date: '2014-06-14', unique: 22, views: 60 },
        { date: '2014-06-15', unique: 18, views: 30 },
        { date: '2014-06-16', unique: 5, views: 7 }
      ];
      Morris.Line({
        element: this.$().get(0),
        data: visits,
        hideHover: 'auto',
        xkey: 'date',
        ykeys: ['unique', 'views' ],
        dateFormat: function (x) { return new moment(x).format('dddd'); },
        labels: [ Em.I18n.t('stats.unique'), Em.I18n.t('stats.views')]
      });

    }

  });

})(App);
