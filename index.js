'use strict';
var Gear    = require('caminio/gear');
new Gear({ 
  api: true,
  applications: [
    { name: 'rocksol', icon: 'fa-globe',
      i18n:{
        en: 'www',
        de: 'www'
      },
      requireEditor: true
    }
  ] 
});
   
   
   
   
