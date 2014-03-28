(function(){

  'use strict';

  if( currentLang !== 'en' ) return;

  var translations = {
    
    'nav.webpages': 'Webpages',
    'nav.media': 'Media',
    'nav.blog': 'Blog',

    'will_be_filename': 'will become part of the document\'s url',

    'edit_content': 'Edit content',
    'preview_content': 'Preview',

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
    'pebble.teaser.upload_other_picture': 'Upload other picture and replace',
    'pebble.teaser.saved': '{{name}} has been saved',
    'pebble.insert_selected': 'Insert selected pebble',

    'pebble.press_texts': 'Press texts',
    'pebble.text_here': 'No text content here yet',
    'pebble.add_activity': 'Add event',
    'pebble.activity_saved': 'Event {{at}} has been saved',
    'pebble.remove_activity': 'Delete event',
    'pebble.activity_removed': 'Event {{at}} has been removed',

    'markdown_code': 'Markdown editor',
    'preview': 'Preview',

    'website.subtitle': 'Your website',
    
    'webpages.title': 'Webpages',
    'webpages.list': 'Listing webpages',

    'webpage.new_subpage_of': 'Enter name for new subpage of &raquo;{{name}}&laquo;',
    'webpage.new_name': 'Enter name for new webpage on root level',

    'blogs.title': 'Blog',

    'webpage.title': 'Title',
    'webpage.subtitle': 'Subtitle',
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
    'webpage.layout_changed': 'Layout for {{name}} has been been changed to {{layout}}',

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
    'activity.time': 'Time',
    'activity.location': 'Location',

    'activity.saved': 'Activity from {{starts}} has been saved successfully',

    'children_layout': 'Layout child pages',
    'webpage.init_pebbles': 'Pebbles for {{name}} are being initialized',
    'webpage.init_pebbles_done': 'Pebbles for {{name}} have been initialized and are now readz to use',
    'adv.title': 'Advanced settings',

    'meta.title': 'Webpage Meta Information',
    'meta.description': 'Meta Description',
    'meta.description_desc': 'this text may appear as short description in google search results',
    'meta.keywords': 'Meta Keywords',
    'meta.keywords_desc': 'help search engines to categorize your webpage'

  };

  for( var i in translations )
    Em.I18n.translations[i] = translations[i];

}).call();