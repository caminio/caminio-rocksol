(function( App ){
  
  'use strict';

  //var syncModelIval;

  App.WebpagesEditView = Em.View.extend({
    didInsertElement: function(){

      var self = this;

      $('.features').css({ height: $(window).height() - 180 });
      $(window).on('resize', function(){
        $('.features').css({ height: $(window).height() - 180 });
      });
      
      $('#editor').ghostDown();
      $('#editor').ghostDown('setValue', this.get('controller.translation.content') );

      $('#editor').on('keyup', function(){
        self.get('controller.webpage.curTranslation').set('content', $('#editor').ghostDown('getMarkdown') );
      });

      scaleViewport.call(this);
      this.get('controller.webpage').on('didUpdate', function(){ scaleViewport.call(self); });

      //clearInterval( syncModelIval );
      //syncModelIval = setInterval( function(){
      //  var tr = controller.get('webpage.translations').findBy('id', controller.get('translation').id);
      //  if( tr && $('#editor').length )
      //    tr.set('content', $('#editor').ghostDown('getMarkdown') );
      //}, 1000);

      setupScrolls();

      App.setupCtrlS( this.get('controller.webpage'), Em.I18n.t('webpage.saved', {name: self.get('controller.webpage.curTranslation.title')}) );

    },

    willClearRender: function(){
      $('#editor').remove();
    },

  });


  function setupScrolls(){

    $('.CodeMirror-vscrollbar').niceScroll();
    setTimeout(function(){
      $('.entry-preview-content').niceScroll();
    },500);

  }

  function scaleViewport(){

    var $preview = $('#rocksol-preview');
    var webpage = this.get('controller.webpage');

    $preview.css({ height: $(window).height() - 240});

    $.get( $preview.attr('data-url') )
      .done( function( html ){

        var doc = $preview.get(0).contentWindow.document;
        doc.open();
        doc.onreadystatechange = function(){
          $preview.contents().find('html').css('transform','scale(0.7)');
          var $contentArea = $preview.contents().find('#markdown_' + webpage.get('id'));
          //$preview.contents().find('*').css('opacity',0.7);
          //$contentArea.find('*').css('opacity',1);
          //$contentArea.parents().each(function(){
          //  $(this).css('opacity',1);
          //}).end().css('opacity',1);
        };
        doc.write( html );
        doc.close();

      });
  }

})( App );
