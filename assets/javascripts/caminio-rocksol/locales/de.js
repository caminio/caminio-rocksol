(function(){

  'use strict';

  if( currentLang !== 'de' ) return;

  var translations = {
    
    'nav.webpages': 'Webseiten',
    'nav.media': 'Medien',
    'nav.blog': 'Blog',

    'will_be_filename': 'wird Teil der URL dieser Webseite',

    'edit_content': 'bearbeiten',
    'preview_content': 'Vorschau',

    'editor.heading': 'Überschrift',
    'editor.bold': 'Fett',
    'editor.italic': 'Kursiv',
    'editor.underline': 'Unterstrichen',

    'editor.image': 'Medienbibliothek',
    'editor.pebbles': 'Pebbles',
    'editor.link': 'Mit anderer Seite verlinken',

    'pebbles.title': 'Pebbles',
    'pebble.name': 'Name',
    'pebble.description': 'Beschreibung',
    'pebble.saved': 'Pebble {{name}} wurde gespeichert',
    'pebble.teaser.drop_image_here': 'Bild hochladen',
    'pebble.teaser.upload_other_picture': 'Bild ersetzen',
    'pebble.teaser.saved': '{{name}} wurde gespeichert',
    'pebble.insert_selected': 'Ausgewähltes Pebble einfügen',

    'markdown_code': 'Markdown Editor',
    'preview': 'Vorschau',

    'website.subtitle': 'Webseite',
    
    'webpages.title': 'Webseite',
    'webpages.list': 'Übersicht Webseiten',

    'webpage.new_subpage_of': 'Namen für Unterseite von &raquo;{{name}}&laquo;',
    'webpage.new_name': 'Name für Seite auf oberster Ebene',

    'blogs.title': 'Blog',

    'webpage.title': 'Titel',
    'webpage.subtitle': 'Untertitel',
    'webpage.new': 'Neue Webseite',
    'webpage.enter_name': 'Name der neuen Webseite',
    'webpage.created': 'Webseite {{name}} wurde erstellt',
    'webpage.select_webpage_to_show_info': 'Webseite anklicken, um Details zu sehen',

    'webpage.properties_of': 'Einstellungen von',
    'webpage.status': 'Veröffentlichungsstatus',
    'webpage.published': 'Öffentlich',
    'webpage.draft': 'Vorlage',
    'webpage.review': 'Zur Revision',
    'webpage.no_webpage_yet': 'Es gibt noch keine Webseite.',
    'webpage.create_new': 'Neue Webseite erstellen',
    'webpage.assign_to': 'zuweisen an',
    'webpage.request_review': 'Revisionseinstellungen',
    'webpage.review_message': 'Notiz',
    'webpage.layout': 'Layout',
    'webpage.really_delete': '{{name}} und Unterseiten wirklich löschen?',
    'webpage.deleted': '{{name}} mit allen Unterseiten wurde gelöscht',
    'webpage.moved_to': '{{name}} wurde verschoben nach {{to}}',

    'webpage.select_layout': 'Layout auswählen',

    'webpage.saved': '{{name}} wurde gespeichert',
    'webpage.layout_changed': 'Layout für {{name}} wurde geändert auf {{layout}}',

    'translation.no': 'Keine Sprachen',
    'translation.title': 'Sprache',

    'pebbles.amount': '{{count}} Pebbles',

    'activities.title': 'Termine',
    'activity.keep_open': 'offen halten',
    'activity.new': 'Neuer Termin',
    'activity.create': 'Termin erstellen',
    'activity.seats': 'Sitzplätze',
    'activity.note': 'Notiz',
    'activity.starts_at': 'Beginnt',

    'activity.saved': 'Termin {{starts}} wurde gespeichert',

    'meta.title': 'Webseite Meta Informationen',
    'meta.description': 'Meta Beschreibung',
    'meta.description_desc': 'Dieser Text erscheint eventuell bei einer Suchmaschine als Beschreibungstext',
    'meta.keywords': 'Schlagwörter',
    'meta.keywords_desc': 'hilft diese Webseite einzuordnen'

  };

  for( var i in translations )
    Em.I18n.translations[i] = translations[i];

}).call();