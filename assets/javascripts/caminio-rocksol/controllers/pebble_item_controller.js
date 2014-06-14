(function(App){
  
  'use strict';

  App.PebbleItemController = Em.ObjectController.extend({

    isCurContent: function(){
      return this.get('content.id') === this.get('parentController.curContent.id');
    }.property('parentController.curContent'),

    actions: {
      'toggleEditing': function(){
        var content = this.get('content');
        if( content.get('isEditing') )
          setTimeout(function(){ content.set('isEditing', false); }, 10);
        else
          content.set('isEditing',true);
      },
      'remove': function(){
        this.get('parentController').get('content.pebbles').removeObject( this.get('content'));
      },
      'togglePebble': function(){
        if( this.get('content.isEditing') )
          return false;
        this.get('parentController').set('curContent', this.get('content'));
        $('.editor-tools').removeClass('show-list');
      }
    }

  });

})( App );
