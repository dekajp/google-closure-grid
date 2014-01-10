goog.provide('pear.plugin.HeaderMenu');

goog.require('goog.ui.Component');
goog.require('goog.events.Event');
goog.require('pear.ui.Plugable');
goog.require('goog.positioning.MenuAnchoredPosition');



/**
 * Pager - Pager Navigation and Pager Dropdown Plugin
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {pear.ui.Grid} grid
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.plugin.HeaderMenu = function(grid,opt_renderer,opt_domHelper) {
  goog.ui.Component.call(this,opt_renderer || pear.ui.RowRenderer.getInstance(),
                          opt_domHelper);
};
goog.inherits(pear.plugin.HeaderMenu, goog.ui.Component);
pear.ui.Plugable.addImplementation(pear.plugin.HeaderMenu);

/**
 * 
 */
pear.plugin.HeaderMenu.prototype.getPageIndex = function() {
  return this.getGrid().getPageIndex();
};

pear.plugin.HeaderMenu.prototype.getGrid = function() {
  return this.grid_;
};

pear.plugin.HeaderMenu.prototype.show = function(grid){
  this.grid_ = grid;
  var gridElem = this.grid_.getElement();
  var parentElem = goog.dom.getAncestor(gridElem,function(){
    return true;
  })
  this.render(parentElem);
  goog.events.listen( this.grid_,
      pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK,
      this.handleGridHeaderMenuOptionClick_,false,this );

  goog.style.showElement(this.getElement(),'');
  
}


/**
 * @override
 */
pear.plugin.HeaderMenu.prototype.createDom = function() {
  this.element_ = goog.dom.createDom('div', 'pear-grid-header-cell-menu');
};

pear.plugin.HeaderMenu.prototype.disposeInternal = function() {
  this.grid_= null;
  pear.plugin.HeaderMenu.superClass_.disposeInternal.call(this);
};


/**
 * @override
 *
 */
pear.plugin.HeaderMenu.prototype.enterDocument = function() {
  pear.plugin.HeaderMenu.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  
  this.createMenu_();
};


/**
 * @private
 *
 */
pear.plugin.HeaderMenu.prototype.createMenu_ = function() {
  var closeElement = goog.dom.createDom('div',
                                  'fa fa-times'
                                  );
  goog.dom.appendChild(this.getElement(),closeElement);

  var sampleElement = goog.dom.createDom('span');

  goog.dom.setTextContent(sampleElement,'Header Cell Menu Plugin - placeholder for UI controls - Sorting , Filtering , Other menu options');
   goog.dom.appendChild(this.getElement(),sampleElement);

  goog.events.listen(closeElement,goog.events.EventType.CLICK,function(){
    goog.style.showElement(this.getElement(),'');
  },false,this);
};


pear.plugin.HeaderMenu.prototype.
                          handleGridHeaderMenuOptionClick_ = function(ge){
  console.dir(ge); 
  var headerCell = ge.cell; 
  var menuElement = headerCell.getMenuElement();
  var menuPosition = goog.style.getPosition(menuElement);
  var position = new goog.positioning.MenuAnchoredPosition(menuElement,
        goog.positioning.Corner.BOTTOM_START, true);
  position.reposition(this.getElement(),
        goog.positioning.Corner.TOP_START);

  goog.style.showElement(this.getElement(),'inline-block');
};





