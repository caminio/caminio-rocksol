( function( App ){

  'use strict';

  App.WebpageMetaComponent = App.WebpageComponent.extend({

    updateElements: function(){
      this._updateElements();
    }.observes('webpage','curLang'),

    didInsertElement: function(){
      $('#meta-keys').select2({ tags: [] });
      this._updateElements();
    },

    _updateElements: function(){

      var tags = this.get('translation.metaKeywords') ? this.get('translation.metaKeywords') : '';
      $('#meta-keys').select2('val', tags.split(','));

    }

  });



})( App );