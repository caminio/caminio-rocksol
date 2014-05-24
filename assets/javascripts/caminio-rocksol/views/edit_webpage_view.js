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

      scaleViewport.call(this);

      var controller = this.get('controller');
      clearInterval( syncModelIval );
      syncModelIval = setInterval( function(){
        var tr = controller.get('webpage.translations').findBy('id', controller.get('translation').id);
        if( tr && $('#editor').length )
          tr.set('content', $('#editor').ghostDown('getMarkdown') );
      }, 1000);

      setupScrolls();

      App.setupCtrlS( controller.get('webpage'), Em.I18n.t('webpage.saved', {name: controller.get('webpage.curTranslation.title')}) );

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

  function scaleViewport(){

    var $preview = $('#rocksol-preview');
    var webpage = this.get('controller.webpage')
    $.get( $preview.attr('data-url') )
      .done( function( html ){

        var doc = $preview.get(0).contentWindow.document;

        doc.open();
        doc.write( html );


        setTimeout( function(){
          console.log($('#rocksol-preview').contents().find('#markdown_' + webpage.get('id') ).height()  )

          var target = $('#rocksol-preview').contents().find('#markdown_' + webpage.get('id'));

          var offset = target.position();
          var bottom = target.height() + offset.top;
          console.log('the position',  offset)
          $('#rocksol-preview').contents().find('body').css({position:'absolute', top: -offset.top, left: -offset.left })
        }, 500);

      });
  }



}).call();

//$('#rocksol-preview').contents().find('body').css({position:'absolute', top: -100})
