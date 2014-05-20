var Gear    = require('caminio/gear');
new Gear({ 
  api: true,
  applications: [
    { name: 'web', icon: 'fa-globe',
      i18n: { en: 'Web' }
    }
  ] 
});
