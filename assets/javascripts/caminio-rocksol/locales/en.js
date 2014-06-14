(function(){

  'use strict';

  if( currentLang !== 'en' ) return;

  var translations = {
    
    'apps.rocksol': 'Website',
    'nav.webpages': 'Webpages',
    'nav.media': 'Media',
    'nav.blog': 'Blog',
    'nav.locations': 'Locations',
    
    'will_be_filename': 'will become part of the document\'s url',
    'shown_in_title_not_filename': 'Title of webpage (not filename)',

    'edit_content': 'Edit webpage',
    'back_to_list': 'back to list',
    'edit_settings': 'Webpage settings',

    'editor.heading': 'Heading',
    'editor.bold': 'Bold',
    'editor.italic': 'Italic',
    'editor.underline': 'Underline',

    'editor.image': 'Open Media Library',
    'editor.pebbles': 'Open Pebbles Library',
    'editor.link': 'Link with other webpage',

    'pebbles.title': 'Pebbles',
    'pebble.name': 'Pebble name',
    'pebble.delete': 'Delete this pebble',
    'pebble.description': 'Description',
    'pebble.saved': 'Pebble {{name}} has been saved',
    'pebble.teaser.drop_image_here': 'Drop your teaser image or click here to upload',
    'pebble.teaser.upload_other_picture': 'Upload other picture and replace',
    'pebble.teaser.saved': '{{name}} has been saved',
    'pebble.insert_selected': 'Insert selected pebble',

    'pebble.type': 'Type',
    'pebble.video': 'Video',
    'pebble.press_texts': 'Press texts',
    'pebble.text_here': 'No text content here yet',
    'pebble.add_activity': 'Add event',
    'pebble.activity_saved': 'Event {{at}} has been saved',
    'pebble.remove_activity': 'Delete event',
    'pebble.activity_removed': 'Event {{at}} has been removed',

    'markdown_code': 'Markdown editor',
    'preview': 'Preview',

    'website.stats': 'Stats for {{name}}',
    'website.subtitle': 'Your website',
    
    'webpages.title': 'Webpages',
    'webpages.list': 'Listing webpages',

    'webpage.new_subpage_of': 'Enter name for new subpage of &raquo;{{name}}&laquo;',
    'webpage.compile_all': 'Compile all',
    'webpage.compiling_all': 'The whole website is about to be recompiled. This can take a while...',
    'webpage.compile_all_desc': 'The whole website is being recompiled. This can take several minutes',
    'webpage.done_compile_all': 'All pages have been recompiled',
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
    'webpage.publish': 'Publish webpage',
    'webpage.save_draft': 'Save as draft',
    'webpage.create_draft': 'Create as draft',
    'webpage.create_and_publish': 'Create and publish',
    'webpage.save_and_publish': 'Save and publish',
    'webpage.update_publication': 'Create and update publication',
    'webpage.revoke': 'Revoke publication',
    'webpage.draft': 'Draft',
    'webpage.review': 'Review',
    'webpage.no_webpage_yet': 'There is no webpage here yet. Go ahead and',
    'webpage.create_new': 'create a new one',
    'webpage.assign_to': 'Assign to',
    'webpage.request_review': 'Review request settings',
    'webpage.review_message': 'Notes for reviewer',
    'webpage.layout': 'Layout',
    'webpage.delete': 'Delete webpage',
    'webpage.really_delete': 'Really delete {{name}}?',
    'webpage.deleted': 'Webpage {{name}} has been deleted',
    'webpage.moved_to': 'Webpage {{name}} has been moved to {{to}}',

    'reference': 'Editor Reference',
    'italic': 'Emphasize',
    'bold': 'Bold',
    'link': 'Link',
    'image': 'Image',
    'list_item': 'List item',
    'heading1': 'Heading 1',
    'heading2': 'Heading 2',
    'heading3': 'Heading 3',
    'strike-through': 'Strike-through',
    'result': 'Result',
    'markdown': 'Markdown',
    'shortcut': 'Shortcut',


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
    'meta.keywords_desc': 'help search engines to categorize your webpage',

    'locations.title': 'Locations',
    'location.description': 'Description',
    'location.new': 'New location',
    'location.name': 'Location name',
    'location.city': 'Stadt',
    'location.street': 'Street',
    'location.zip': 'ZIP',
    'location.country': 'Country',
    'location.businfo': 'Travel information',
    'location.timeinfo': 'Time information',
    'location.contact': 'Contact information',

    'location.saved': 'Location {{name}} has been saved',
    'location.remove': 'remove this location',
    'location.removed': 'Location {{name}} has ben deleted',
    'location.use': 'Use this location',

    'location.linked': 'Location {{name}} has been linked with {{at}}',
    'location.geo_coords_changed': '{{name}} Latitude: {{lat}}, Longitude: {{lng}} (unsaved)',

    'stats.unique': 'Unique visitors',
    'stats.views': 'Pages visited'
  };

  for( var i in translations )
    Em.I18n.translations[i] = translations[i];

}).call();
