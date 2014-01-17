goog.provide('pear.plugin.HeaderMenu');

goog.require('goog.ui.Component');
goog.require('goog.events.Event');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.ui.FlatButtonRenderer');



pear.plugin.HeaderMenu = function(grid,opt_renderer,opt_domHelper) {
  goog.ui.Component.call(this,opt_renderer || pear.ui.RowRenderer.getInstance(),
                          opt_domHelper);
};
goog.inherits(pear.plugin.HeaderMenu, goog.ui.Component);

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
  this.element_ = goog.dom.createDom('div', this.getCSSClassName());
};

pear.plugin.HeaderMenu.prototype.disposeInternal = function() {
  this.grid_= null;
  this.headerCell_ = null;
  this.titleContent_ = null;
  this.filterInput_ = null;
  pear.plugin.HeaderMenu.superClass_.disposeInternal.call(this);
};


/**
 * @override
 *
 */
pear.plugin.HeaderMenu.prototype.enterDocument = function() {
  pear.plugin.HeaderMenu.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  
  this.createHeaderMenuDom();
};


/**
 * @private
 *
 */
pear.plugin.HeaderMenu.prototype.createHeaderMenuDom = function() {
  var titleBar = goog.dom.createDom('div',this.getCSSClassName()+'-title');
  goog.dom.appendChild(this.getElement(),titleBar);

  this.titleContent_ = goog.dom.createDom('div',this.getCSSClassName()+'-title-content');
  goog.dom.appendChild(titleBar,this.titleContent_);

  var closeElement = goog.dom.createDom('div','pear-grid-header-cell-menu-title-close fa fa-times');
  goog.dom.appendChild(titleBar,closeElement);

  var breakElem = goog.dom.createDom('div',
                                        {
                                          style:'clear:both'
                                        });
  goog.dom.appendChild(this.getElement(),breakElem);

  this.createFilterMenu_();
 
  goog.events.listen(closeElement,goog.events.EventType.CLICK,this.close_,false,this);
};

pear.plugin.HeaderMenu.prototype.close_ = function(){
  goog.style.showElement(this.getElement(),'');
}

pear.plugin.HeaderMenu.prototype.createFilterMenu_ = function() {
  var domEl = goog.dom.createDom('div','pear-grid-header-cell-menu-title-filter');
  goog.dom.appendChild(this.getElement(),domEl);
  this.filterInput_ = new goog.ui.LabelInput('Filter Text');
  this.filterInput_.render(domEl);

  var fbApply = new goog.ui.Button('Apply',
        goog.ui.FlatButtonRenderer.getInstance());
    fbApply.render(this.getElement());
    fbApply.setTooltip('Apply Filter to DataView');

  var fbClear = new goog.ui.Button('Clear',
        goog.ui.FlatButtonRenderer.getInstance());
    fbClear.render(this.getElement());
    fbClear.setTooltip('clear filter');

  goog.events.listen(fbApply,goog.ui.Component.EventType.ACTION,this.handleApplyFilter_,false,this);

  goog.events.listen(fbClear,goog.ui.Component.EventType.ACTION,this.handleCancelFilter_,false,this); 
};

pear.plugin.HeaderMenu.prototype.handleApplyFilter_ = function(be){
  var dv = this.grid_.getDataView();
  var column = this.headerCell_.getCellData();
  dv.addColumnFilter(column.id , {
    type:pear.data.DataView.FilterType.EQUAL,
    expression:this.filterInput_.getValue()
  });

  dv.applyFilter();
  this.grid_.refresh();
  this.close_();
};

pear.plugin.HeaderMenu.prototype.handleCancelFilter_ = function(be){
  var dv = this.grid_.getDataView();
  var column = this.headerCell_.getCellData();
  dv.clearColumnFilter(column.id );
  dv.applyFilter();
  this.grid_.refresh();
  this.close_();
};


pear.plugin.HeaderMenu.prototype.
                          handleGridHeaderMenuOptionClick_ = function(ge){
  console.dir(ge); 
  this.headerCell_ = ge.cell; 
  var menuElement = this.headerCell_.getMenuElement();
  var menuPosition = goog.style.getPosition(menuElement);
  var position = new goog.positioning.MenuAnchoredPosition(menuElement,
        goog.positioning.Corner.BOTTOM_START, true);
  position.reposition(this.getElement(),
        goog.positioning.Corner.TOP_START);

  goog.style.showElement(this.getElement(),'inline-block');

  goog.dom.setTextContent(this.titleContent_,this.headerCell_.getContentText());
};

pear.plugin.HeaderMenu.prototype.getCSSClassName = function(){
  return 'pear-grid-header-cell-menu';
}



