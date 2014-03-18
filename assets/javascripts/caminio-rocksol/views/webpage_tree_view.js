( function( App ){

  App.WebpageTreeView = Ember.Tree.BranchView.extend({
    itemViewClass: 'App.WebpageTreeNodeView'
  });

  App.WebpageTreeNodeView = Ember.Tree.NodeView.extend({
    templateName: 'webpage/tree-item'
  });

})( App );