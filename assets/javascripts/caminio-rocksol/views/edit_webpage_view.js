(function(){
  
  'use strict';

  window.App.WebpagesEditView = Em.View.extend({
    didInsertElement: function(){
      $('#editor-input-content').val( this.get('controller.translation.content') );
      $(".editor").ghostDown();
      $('.CodeMirror-vscrollbar').niceScroll();
      setTimeout(function(){
        $('.entry-preview-content').niceScroll();
      },500);
    },
  }); 
}).call();