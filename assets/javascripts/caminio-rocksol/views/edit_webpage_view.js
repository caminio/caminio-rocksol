(function(){
  
  'use strict';

  window.App.WebpagesEditView = Em.View.extend({
    didInsertElement: function(){
        $(document).ready(function () {
          $(".editor").ghostDown();
        });
    },
  }); 
}).call();