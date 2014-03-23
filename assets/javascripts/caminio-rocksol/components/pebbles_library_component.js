( function( App ){

  'use strict';

  App.PebblesLibraryComponent = Ember.Component.extend({

    domainThumbs: currentDomain.preferences.thumbs,

    didInsertElement: function(){

    },

    actions: {
      
      showPebble: function( pebble ){
        var self = this;
        this.set('curPebble', pebble);

        setTimeout(function(){

          if( pebble.get('type') === 'teaser' )
            setupTeaser( pebble, self );

        },100);
      },

      savePebble: function(){
        var pebble = this.get('curPebble');
        pebble.save().then( function(){
          notify('info', Em.I18n.t('pebble.saved', { name: pebble.get('name') }) );
        });
      }

    }

  });

  function setupTeaser( pebble, comp ){

    var controller = comp.get('controller');

    $('#teaserupload').fileupload({
      url: '/caminio/mediafiles',
      dataType: 'json',
      done: function (e, data) {
        setTimeout(function(){
          $('#progress').removeClass('active');
        },500);
        App.Mediafile.store.pushPayload( 'mediafile', data.result );
        var teaser = App.Mediafile.store.getById( 'mediafile', data.result.mediafiles[0].id );
        pebble.set('teaser', teaser);
        pebble.save().catch(function(err){
          console.error(err);
          notify.processError( err );
        });
      },
      progressall: function (e, data) {
        $('#progress').addClass('active');
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css(
          'width',
          progress + '%'
        )
        .attr('aria-valuenow', progress)
        .find('.perc-text').text(progress+'%');
      }
    }).on('fileuploadsubmit', function( e, data ){
      data.formData = { parent: controller.get('webpage').id,
                        parentType: 'Webpage' };
    });

    $('#crop-img').Jcrop({
      onChange: showPreview,
      onSelect: showPreview,
      aspectRatio: 1
    });

  }

  function showPreview(coords){
    var rx = 100 / coords.w;
    var ry = 100 / coords.h;

    if( !currentDomain.preferences.thumbs )
      return console.error('no domain.preferences.thumbs settings were found. aborting');

    currentDomain.preferences.thumbs.forEach( function(thumbSize){
      $('#preview-thumb'+thumbSize+'-img').css({
        width: Math.round(rx * $('#crop-img').width()) + 'px',
        height: Math.round(ry * $('#crop-img').height()) + 'px',
        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
        marginTop: '-' + Math.round(ry * coords.y) + 'px'
      });
    });
  }

  App.ThumbsController = Ember.ObjectController.extend({
    genThumbSizes: function(){
      var dim = this.get('content').split('x');
      return "width: "+dim[0]+"px; height: "+dim[1]+"px";
    }.property(),
    genThumbId: function(){
      return "preview-thumb"+this.get('content')+"-img";
    }.property()
  });

})(App);