(function(){

  'use strict';

  var translations = {
    
    'nav.webpages': 'Webpages',
    'nav.media': 'Media',
    'nav.blog': 'Blog',

    'edit_content': 'Edit content',

    'markdown_code': 'Markdown editor',
    'preview': 'Preview',

    'website.subtitle': 'Your website',
    
    'webpages.title': 'Webpages',
    'webpages.list': 'Listing webpages',

    'blogs.title': 'Blog',

    'webpage.new': 'New webpage',
    'webpage.enter_name': 'New webpage name',
    'webpage.created': 'Webpage {{name}} has been created successfully',
    'webpage.select_webpage_to_show_info': 'Select a webpage to show it\'s info',

    'webpage.properties_of': 'Properties of',
    'webpage.status': 'Publishing status',
    'webpage.published': 'Published',
    'webpage.draft': 'Draft',
    'webpage.review': 'Review',
    'webpage.no_webpage_yet': 'There is no webpage here yet. Go ahead and',
    'webpage.create_new': 'create a new one',
    'webpage.assign_to': 'Assign to',
    'webpage.request_review': 'Review request settings',
    'webpage.review_message': 'Notes for reviewer',
    'webpage.layout': 'Layout',
    'webpage.really_delete': 'Really delete {{name}}?',
    'webpage.deleted': 'Webpage {{name}} has been deleted',

    'webpage.select_layout': 'Select a layout',

    'webpage.saved': 'Webpage {{name}} has been saved successfully',

    'translation.no': 'No languages',
    'translation.title': 'Language',

    'pebbles.amount': '{{count}} pebbles'

  };

  for( var i in translations )
    Em.I18n.translations[i] = translations[i];

}).call();