(function(){
  
  'use strict';

  window.App.WebpagesEditView = Em.View.extend({
    didInsertElement: function(){
      $('#editor-input-content').val( this.get('controller.translation.content') );
      
      $('.editor').ghostDown();

      var controller = this.get('controller');
      var syncModelIval = setInterval( function(){
        var tr = controller.get('model.translations').findBy('id', controller.get('translation').id);
        tr.set('content', $('#editor').ghostDown('getMarkdown') );
      }, 1000);

      setupScrolls();

    },
  });


  function setupScrolls(){

    $('.CodeMirror-vscrollbar').niceScroll();
    setTimeout(function(){
      $('.entry-preview-content').niceScroll();
    },500);

  }

}).call();