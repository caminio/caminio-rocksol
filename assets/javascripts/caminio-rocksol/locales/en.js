(function(){

  'use strict';

  if( currentLang !== 'en' ) return;

  var translations = {
    
    'nav.webpages': 'Webpages',
    'nav.media': 'Media',
    'nav.blog': 'Blog',

    'will_be_filename': 'will become part of the document\'s url',

    'edit_content': 'Edit content',

    'editor.heading': 'Heading',
    'editor.bold': 'Bold',
    'editor.italic': 'Italic',
    'editor.underline': 'Underline',

    'editor.image': 'Open Media Library',
    'editor.pebbles': 'Open Pebbles Library',
    'editor.link': 'Link with other webpage',

    'pebbles.title': 'Pebbles',
    'pebble.name': 'Name',
    'pebble.description': 'Description',
    'pebble.saved': 'Pebble {{name}} has been saved',
    'pebble.teaser.drop_image_here': 'Drop your teaser image or click here to upload',
    'pebble.insert_selected': 'Insert selected pebble',

    'markdown_code': 'Markdown editor',
    'preview': 'Preview',

    'website.subtitle': 'Your website',
    
    'webpages.title': 'Webpages',
    'webpages.list': 'Listing webpages',

    'webpage.new_subpage_of': 'Enter name for new subpage of &raquo;{{name}}&laquo;',
    'webpage.new_name': 'Enter name for new webpage on root level',

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
    'webpage.moved_to': 'Webpage {{name}} has been moved to {{to}}',

    'webpage.select_layout': 'Select a layout',

    'webpage.saved': 'Webpage {{name}} has been saved successfully',

    'translation.no': 'No languages',
    'translation.title': 'Language',

    'pebbles.amount': '{{count}} pebbles',

    'activities.title': 'Actvities',
    'activity.keep_open': 'keep open',
    'activity.new': 'New activity',
    'activity.create': 'Create activity',
    'activity.seats': 'Seats',
    'activity.note': 'Note',
    'activity.starts_at': 'Starts',

    'activity.saved': 'Activity from {{starts}} has been saved successfully',

    'meta.title': 'Webpage Meta Information',
    'meta.description': 'Meta Description',
    'meta.description_desc': 'this text may appear as short description in google search results',
    'meta.keywords': 'Meta Keywords',
    'meta.keywords_desc': 'help search engines to categorize your webpage'

  };

  for( var i in translations )
    Em.I18n.translations[i] = translations[i];

}).call();