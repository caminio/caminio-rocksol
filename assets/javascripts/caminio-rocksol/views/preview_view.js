(function( App ){
  
  'use strict';

  /* global renderMD */

  App.PreviewView = Em.View.extend({
    tagName: 'iframe',
    classNames: ['md-preview'],
    didInsertElement: function(){
      var view = this;
      var model = this.get('controller.curSelectedItem');

      model.set('previewHtml', renderMD(model.get('curTranslation.content') ) );

      scaleViewport(view, view.get('controller'));
      model.on('didUpdate', function(){ scaleViewport(view,view.get('controller')); });

      App.setupCtrlS( model, Em.I18n.t('webpage.saved', {name: model.get('curTranslation.title')}) );

    },

    curSelectedItemObserver: function(){
      this.rerender();
    }.observes('controller.curContent')

  });


  function scaleViewport( view, controller ){

    var $preview = view.$();
    var webpage = controller.get('curSelectedItem')

    $.get( webpage.get('previewUrl') )
      .done( function( html ){

        html = html.replace(/\/assets\//g, 'http://'+view.get('controller.domain.fqdn')+'/assets/');

        var doc = $preview.get(0).contentWindow.document;
        doc.open();
        doc.onreadystatechange = function(){
          $preview.contents().find('html').css('transform','scale(0.8)');
          $preview.contents().find('#markdown_' + controller.get('curContent.id'));
        };
        doc.write( html );
        doc.close();
        $(doc).on('click', function(e){ e.preventDefault(); return false; });
      
        // sync scroll
        $('.CodeMirror-vscrollbar').on('scroll', syncScroll);
        function syncScroll(e){
          var $codeViewport = $(e.target),
          $previewViewport = $($preview.get(0).contentWindow),
          $codeContent = $('.CodeMirror-sizer'),
          $previewContent = $(doc).find('#markdown_'+controller.get('curContent.id')),
          // calc position
          //
          codeHeight = $codeContent.height() - $codeViewport.height() + $codeContent.offset().top,
          previewHeight = $previewContent.height() - $previewViewport.height() + $previewContent.offset().top,
          ratio = previewHeight / codeHeight,
          maxTop = $previewContent.height() + $previewContent.offset().top - $previewViewport.height(),
          previewPosition = $codeViewport.scrollTop() * ratio;
          if( previewPosition > maxTop )
            previewPosition = maxTop;

          // apply new scroll
          $previewViewport.scrollTop(previewPosition);
        }

        // sync typing
        $('.md-editor-wrap').on('keyup', function(){
          $(doc).find('#markdown_'+controller.get('curContent.id')).html( renderMD( controller.get('curContent.curTranslation.content') ) );
        });

      });
  }

})( App );
