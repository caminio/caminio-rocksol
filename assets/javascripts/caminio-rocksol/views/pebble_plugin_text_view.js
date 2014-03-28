(function(){
  
  'use strict';

  var syncModelIval;

  window.App.PebblePluginTextView = Em.View.extend({

    templateName: 'pebble_plugins/text',

    didInsertElement: function(){

      var controller = this.get('controller');
      if( !controller.get('curPebbleTranslation') ){
        controller.get('curPebble.translations').content.forEach(function(tr){
          controller.set('curPebbleTranslation', tr);
        });
        if( !controller.get('curPebbleTranslation') )
          controller.set('curPebbleTranslation', App.User.store.createRecord('translation', { 
                                                  locale: controller.get('curTranslation.locale'),
                                                  content: Em.I18n.t('pebble.text_here') }));
      }

      // $('#plugin-text-editor-wrap').css({ height: $(window).height() - 220 })
      //   .find('features').css({ height: '100%'});
      // $(window).on('resize', function(){
      //   $('#plugin-text-editor-wrap').css({ height: $(window).height() - 220 })
      //     .find('features').css({ height: '100%'});
      // });
      
      $('#pebble-plugin-text-editor').ghostDown();
      $('#pebble-plugin-text-editor').ghostDown('setValue', controller.get('curPebbleTranslation.content') );

      clearInterval( syncModelIval );
      syncModelIval = setInterval( function(){
        var tr = controller.get('curPebbleTranslation');
        if( tr && $('#pebble-plugin-text-editor').length )
          tr.set('content', $('#pebble-plugin-text-editor').ghostDown('getMarkdown') );
      }, 1000);

      setupScrolls();

    },

    willClearRender: function(){
      $('#pebble-plugin-text-editor').remove();
    }
  });


  function setupScrolls(){

    $('#pebble-plugin-text-editor .CodeMirror-vscrollbar').niceScroll();
    setTimeout(function(){
      $('#pebble-plugin-text-editor .entry-preview-content').niceScroll();
    },500);

  }

}).call();