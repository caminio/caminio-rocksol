( function( App ){

    App.WebpageTreeNodeView = Ember.View.extend({
        opened: false,
        branch: true,
        subBranch: undefined,
        fetchedData: false,
        tagName: 'li',
        // class names that determine what icons are used beside the node
        classNameBindings: ['opened: tree-branch-open', 'branch:tree-branch-icon:tree-node-icon'],
        //templateName: 'treenode',
        // Ember had some issues with finding the treenode template when the branch view is dynamically added to
        // the parent collection view in the click event. Had to compile the template here instead
        templateName: 'webpage/tree-item',
        curWebpageChanged: function(){
          if( this.get('controller.addedWebpage.parent') && this.get('controller.addedWebpage.parent.id') === this.get('content.id') ){
            console.log('added', this.get('controller.addedWebpage'));
            this.get('subBranch.content').pushObject( this.get('controller.addedWebpage') );
            this.get('controller').set('addedWebpage',null);
          }
        }.observes('controller.addedWebpage'),
        isSelected: function(){
          if( this.get('controller.curWebpage') )
            return this.get('content.id') === this.get('controller.curWebpage.id');
          if( this.get('controller.curItem') )
            return this.get('content.id') === this.get('controller.curItem.id');
        }.property('controller.curWebpage', 'controller.curItem'),
        click: function( evt ){
          this.get('controller').send('treeItemSelected', this.get('content'));
          var index;
          if( this.get('opened') ){
            // user wants to close the branch
            index = this.get('parentView').indexOf(this) + 1;
            this.get('parentView').removeAt(index);
            this.set('opened', false);
          } else if( this.get('fetchedData') && this.get('branch') ){
            // user wants to open the branch and we have already created the view before
            index = this.get('parentView').indexOf(this) + 1;
            this.get('parentView').insertAt(index, this.get('subBranch'));
            this.set('opened', true);
          } else if( this.get('branch') ){
            // user wants to open the branch for the first time
            var name, age;
            var self = this;
            name = this.get('content').name;
            age = this.get('content').age;
            setupTreeBranchView( self );
          }
        },
        didInsertElement: function(){
          var self = this;

          this.$().draggable({
            handle: '.move',
            helper: 'clone',
            revert: 'invalid'
          })
          .droppable({
            accept: '.webpages-tree li',
            hoverClass: 'droppable-candiate',
            drop: function( e, ui ){
              ui.helper.remove();
              var childId = ui.draggable.find('.item-container').attr('data-id');
              ui.draggable.remove();
              App.Webpage.store.getById('webpage', childId);
              child.set('parent', self.get('content'));
              child.save().then( function(){
                notify('info', Em.I18n.t('webpage.moved_to', { name: child.get('name'), to: self.get('content.name') }));
                if( self.get('subBranch') )
                  return self.get('subBranch.content').pushObject( child );
                setupTreeBranchView( self );
              });
            }
          });
        }
    });


    App.WebpageTreeBranchView = Ember.CollectionView.extend({
      tagName: 'ol',
      classNames: ['caminio-tree webpages-tree'],
      itemViewClass: 'App.WebpageTreeNodeView',
      curWebpageChanged: function(){
        if( this.get('controller.addedWebpage') && !this.get('controller.addedWebpage.parent') ){
          this.get('content').pushObject( this.get('controller.addedWebpage') );
          this.get('controller').set('addedWebpage',null);
        }
      }.observes('controller.addedWebpage'),
      didInsertElement: function(){
        var self = this;
        if( !(this.get('controller.curItem.parent') && !(this.get('parentView') instanceof App.WebpageTreeBranchView)) )
          return;
          
        var found = !(self._childViews.every( function( view ){
          if( view.get('content.id') === self.get('controller.curItem.id') )
            return false;
        }));

        if( found )
          return;

        collectParents( [], this.get('controller.curItem.parent.id'), openParentNodes );

        maxDepth = 10;

        /**
         * opens all given parent nodes, so
         * the actual item should be exposed
         */
        function openParentNodes( parentIds ){
          var keptIds = [];
          parentIds.forEach( function(parentId){
            self._childViews.every( function( view ){
              if( view.get('content.id') === parentId ){
                setupTreeBranchView( view );
                return false;
              }
              keptIds.push( parentId );
            });
          });
          if( --maxDepth > 0 && keptIds.length > 0 )
            openParentNodes( keptIds );
        }

      }
    });

    function collectParents( arr, parentId, cb ){

      if( !parentId )
        return cb( arr );

      arr.push( parentId );

      App.User.store.find('webpage', { _id: parentId }).then( function( parent ){
        collectParents( arr, parent ? parent.id : null, cb );
      });

    }

    function setupTreeBranchView( view ){
      if( !view.get('opened') )
        App.Webpage.store.find('webpage',{ parent: view.get('content').id }).then( continueWithChildren );
      else
        continueWithChildren();

      function continueWithChildren( children ){

        if( children && children.content.length < 1 ){
          view.set('branch',false);
          view.set('opened', false);
          return;
        }

        if( children ){
          if( view.get('subBranch') )
            view.get('subBranch').destroy();
          var treeBranchView = view.container.lookup('view:webpage_tree_branch'); //App.WebpageTreeBranchView.create();
          treeBranchView.set('content', children);
          index = view.get('parentView').indexOf(view) + 1;
          view.get('parentView').insertAt(index, treeBranchView);
          view.set('subBranch', treeBranchView);
        }
      
        view.set('opened', true);
        view.set('fetchedData', true);

      }
    }

})( App );