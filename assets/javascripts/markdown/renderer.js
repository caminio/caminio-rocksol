(function(){

  'use strict';

  /* global marked, hljs */

  marked.setOptions({
    breaks: true,
    tables: true,
    pedantic: false,
    smartLists: true,
    gfm: true,
    smartypants: true,
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    }
  });

  window.renderMD = function renderMD( content ){
    return marked( content );
  };

})(App);
