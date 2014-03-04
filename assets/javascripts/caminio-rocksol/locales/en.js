(function(){

  'use strict';

  var translations = {
    
    'website.subtitle': 'Your website',
    
    'webpages.title': 'Webpages',
    'webpages.list': 'Listing webpages',

    'blogs.title': 'Blog',

    'webpage.new': 'New webpage',
    'webpage.enter_name': 'New webpage name',
    'webpage.created': 'Webpage {{name}} has been created successfully',
    'webpage.select_webpage_to_show_info': 'Select a webpage to show it\'s info',

    'webpage.properties_of': 'Properties of',
    'webpage.request_review': 'Request review',
    'webpage.status': 'Publishing status',
    'webpage.published': 'Published',
    'webpage.draft': 'Draft',
    'webpage.review': 'Review',

    'translation.no': 'No languages',

    'pebbles.amount': '{{count}} pebbles'

  }

  for( var i in translations )
    Em.I18n.translations[i] = translations[i];

}).call();