'use strict';
var Gear    = require('caminio/gear');
new Gear({ 
  api: true,
  applications: [
    { name: 'rocksol', icon: 'fa-globe',
      i18n:{
        en: 'WWW',
        de: 'WWW'
      },
      requireEditor: true
    }
  ] 
});
   
   
   
   
