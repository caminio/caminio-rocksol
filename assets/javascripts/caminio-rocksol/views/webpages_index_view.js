(function( App ){
  
  'use strict';

  App.WebpagesIndexView = Em.View.extend({

    didInsertElement: function(){

      var controller = this.get('controller');

      $(document).on('keydown', function(e){

        var content = controller.get('curSelectedItem');
        if( !( e.keyCode === 83 && ( e.metaKey || e.ctrlKey ) ) )
          return;
        e.preventDefault();
        content.save().then(function(){
          notify('info', Em.I18n.t('webpage.saved', {name: content.get('filename')}));
        });
      });

    }

  });

})( App );
