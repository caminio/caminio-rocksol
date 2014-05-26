( function(){

  'use strict';
  
  window.App.Pebble = DS.Model.extend({
    name: DS.attr(),
    type: DS.attr(),
    description: DS.attr(),
    teaser: DS.belongsTo('mediafile'),
    linkType: DS.attr(),
    link: DS.attr(),
    translations: DS.hasMany( 'translation', { embedded: 'always'} ),
    preferences: DS.attr('object'),
    activities: DS.hasMany( 'activity' ),
    street: DS.attr(),
    zip: DS.attr(),
    city: DS.attr(),
    country: DS.attr(),
    state: DS.attr(),
    lat: DS.attr('number'),
    lng: DS.attr('number'),
    //contactinfo: DS.attr(),
    //timeinfo: DS.attr(),
    //businfo: DS.attr(),
    //traminfo: DS.attr(),
    //getIcon: function(){
    //  switch( this.get('type') ){
    //    case 'teaser':
    //      return 'fa-picture-o';
    //    case 'events':
    //      return 'fa-clock-o';
    //    case 'video':
    //      return 'fa-youtube-play';
    //    case 'text':
    //      return 'fa-file-text';
    //    default: 
    //      return 'fa-square';
    //  }
    //}.property('type'),
    //isYoutubeLink: function(){
    //  return this.get('linkType') === 'youtube';
    //}.property('linkType'),
    //isVimeoLink: function(){
    //  return this.get('linkType') === 'vimeo';
    //}.property('linkType'),
    curTranslation: function(){
      return this.get('translations').findBy('locale', App._curLang);
    }.property('translations.@each', 'App._curLang'),
    updateVideoPreview: function(){
      if( !this.get('link') )
        return
      if( this.get('link').indexOf('watch?v=') > 0 ){
        $('#video-preview').attr('src', '//www.youtube.com/embed/'+ this.get('link').split('watch?v=')[1] );
        this.set('linkType', 'youtube');
      }
    }.observes('link','linkType')
  });

}).call();
