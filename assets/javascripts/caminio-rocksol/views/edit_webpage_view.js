(function(){
  
  'use strict';

  var syncModelIval;

  window.App.WebpagesEditView = Em.View.extend({
    didInsertElement: function(){

      $('.features').css({ height: $(window).height() - 180 });
      $(window).on('resize', function(){
        $('.features').css({ height: $(window).height() - 180 });
      });

      
      $('#editor').ghostDown();
      $('#editor').ghostDown('setValue', this.get('controller.translation.content') );

      var controller = this.get('controller');
      clearInterval( syncModelIval );
      syncModelIval = setInterval( function(){
        var tr = controller.get('model.translations').findBy('id', controller.get('translation').id);
        if( tr && $('#editor').length )
          tr.set('content', $('#editor').ghostDown('getMarkdown') );
      }, 1000);

      setupScrolls();

    },

    willClearRender: function(){
      $('#editor').remove();
    }
  });


  function setupScrolls(){

    $('.CodeMirror-vscrollbar').niceScroll();
    setTimeout(function(){
      $('.entry-preview-content').niceScroll();
    },500);

  }

}).call();