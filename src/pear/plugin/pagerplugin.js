goog.provide('pear.plugin.Pager');

goog.require('pear.plugin.FooterStatusRenderer');
goog.require('pear.ui.Plugin');
goog.require('goog.ui.ComboBox');




pear.plugin.Pager = function(grid,opt_renderer,opt_domHelper) {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.Pager, pear.ui.Plugin);

pear.plugin.Pager.prototype.getClassId = function() {
  return 'Pager';
};

pear.plugin.Pager.prototype.init = function(){
  var grid = this.getGrid();
  this.createPager_();
}

pear.plugin.Pager.prototype.getElement = function(){
  this.element_ = this.element_ || goog.dom.createDom('div', 'pear-grid-pager');
  return this.element_;
}

/**
 * @private
 *
 */
pear.plugin.Pager.prototype.createPager_ = function() {
  var grid = this.getGrid();
  this.createFooter_();
  goog.dom.appendChild(this.footer_,this.getElement());

  this.createPagerNavControls_();
  this.createPagerDropDown_();

  this.changePageIndex_(this.getPageIndex());
  goog.events.listen(grid.getDataView(),pear.data.DataView.EventType.ROWCOUNT_CHANGED,this.handleRowCountChange_,false,this);
  goog.events.listen(grid,pear.ui.Grid.EventType.PAGE_CHANGED,this.handlePageIndexChange_,false,this);
  
};

pear.plugin.Pager.prototype.disposeInternal = function() {
  if (this.grid_.getConfiguration().AllowPaging){
    this.pagerComboBox_.dispose();
    this.pagerComboBox_=null;
  }
  if (this.footer_){
     this.footer_.remove();
    this.footer_ = null;
  }
  this.grid_= null;
  pear.plugin.Pager.superClass_.disposeInternal.call(this);
};


pear.plugin.Pager.prototype.getPageIndex = function() {
  return this.getGrid().getPageIndex();
};

pear.plugin.Pager.prototype.createFooter_ = function(){
  var grid = this.getGrid();
  var parentElem = grid.getElement();
  this.footer_ = goog.dom.getNextElementSibling(grid.getElement());
  if ( this.footer_ && goog.dom.classes.has(this.footer_, 'pear-grid-footer')){

  }else{
    this.footer_ = goog.dom.createDom('div', 'pear-grid-footer');
    goog.dom.insertSiblingAfter(this.footer_,parentElem);
  }

  this.footerStatus_ = new goog.ui.Control(
        goog.dom.createDom('div'),
        pear.plugin.FooterStatusRenderer.getInstance());
  
  this.footerStatus_.render(this.footer_);
  this.updateMsg_();
  
  goog.events.listen(grid,pear.ui.Grid.EventType.PAGE_CHANGED,this.updateMsg_,false,this);
}




pear.plugin.Pager.prototype.createPagerDropDown_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();

  this.pagerComboBox_ = new goog.ui.ComboBox();
  this.pagerComboBox_.setUseDropdownArrow(true);
  var i=0;
  do {
    this.pagerComboBox_.addItem(new goog.ui.ComboBoxItem(goog.string.buildString(i+1)));
    i++;
  }while (i*rowsPerPage < totalRows)
  this.pagerComboBox_.render(this.getElement()); 
  goog.style.setWidth(this.pagerComboBox_.getInputElement(),30);
  goog.style.setHeight(this.pagerComboBox_.getMenu().getElement(),150);
  this.pagerComboBox_.getMenu().getElement().style.overflowY = 'auto';

  goog.events.
      listen(this.pagerComboBox_,goog.ui.Component.EventType.CHANGE,this.handleChange_,false,this);
};

pear.plugin.Pager.prototype.createPagerNavControls_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();
  
  var prev = new goog.ui.Control(
        goog.dom.createDom('span',"fa fa-chevron-left"),
        pear.plugin.PagerCellRenderer.getInstance());
  prev.render(elem);

  var next = new goog.ui.Control(
        goog.dom.createDom('span',"fa fa-chevron-right"),
        pear.plugin.PagerCellRenderer.getInstance());
  next.render(elem);

  this.navControl_ = [prev,next];

  goog.array.forEach(this.navControl_,function(value){
    value.setHandleMouseEvents(true);
    goog.events.
      listen(value,goog.ui.Component.EventType.ACTION,this.handleAction_,false,this);
  },this);
};

pear.plugin.Pager.prototype.handleAction_ = function (ge){
  var grid = this.getGrid();
  if (ge.target === this.navControl_[0]){
    grid.gotoPreviousPage();
  }else if (ge.target === this.navControl_[1]){
    grid.gotoNextPage();
  }
  ge.stopPropagation();
};

pear.plugin.Pager.prototype.changePageIndex_ = function (index){
  // TODO : check for boundary 
  index = ( index < 0 ) ? 0 : index;
  index =  index <= this.pagerComboBox_.getItemCount()-1 ? index : (this.pagerComboBox_.getItemCount() - 1);
  this.pagerComboBox_.setValue(index+1);
};


pear.plugin.Pager.prototype.handleChange_ = function (ge){
  var grid = this.getGrid();
  grid.setPageIndex(parseInt(this.pagerComboBox_.getValue())-1);
};

pear.plugin.Pager.prototype.handlePageIndexChange_ = function (ge){
  index = this.getGrid().getPageIndex();
  // THIS WILL ALSO CAUSE COMBOBOX CHANGE EVENT 
  // setPageIndex are fired 2 times , this could be avoided by directly calling
  // handlePageIndexChange_ from handleChange_ 
  this.pagerComboBox_.setValue(index+1);
};

pear.plugin.Pager.prototype.handleRowCountChange_ = function(ge){
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();

  this.pagerComboBox_.removeAllItems() ;
  var i=0;
  do {
    this.pagerComboBox_.addItem(new goog.ui.ComboBoxItem(goog.string.buildString(i+1)));
    i++;
  }while (i*rowsPerPage < totalRows);

  index = this.getGrid().getPageIndex();
  this.pagerComboBox_.setValue(index+1);
};

pear.plugin.Pager.prototype.updateMsg_ = function(){
  var grid = this.getGrid();
  var startIndex = 1;
  var rowCount = grid.getRowCount();
  var endIndex = grid.getDataView().getRowViews().length;
  var configuration = grid.getConfiguration();
  var currentPageIndex = grid.getCurrentPageIndex();

  if (configuration.AllowPaging){
    startIndex = ( currentPageIndex  )* configuration.PageSize;
    endIndex = (startIndex + configuration.PageSize) > rowCount  ? rowCount : (startIndex + configuration.PageSize);
  }
  startIndex = startIndex ? startIndex : 1;
  this.footerStatus_.setContent("["+startIndex+" - "+endIndex+"]");
};


goog.provide('pear.plugin.PagerCellRenderer');

goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');



/**
  @constructor
  @extends {goog.ui.ControlRenderer}
*/
pear.plugin.PagerCellRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.plugin.PagerCellRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.plugin.PagerCellRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.plugin.PagerCellRenderer.CSS_CLASS = goog.getCssName('pear-grid-pager-cell');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.plugin.PagerCellRenderer.prototype.getCssClass = function() {
  return pear.plugin.PagerCellRenderer.CSS_CLASS;
};


/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} cellControl Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.plugin.PagerCellRenderer.prototype.createDom = function(cellControl) {
  // Create and return DIV wrapping contents.
  var element = cellControl.getDomHelper().createDom(
      'div', this.getClassNames(cellControl).join(' '), cellControl.getContent());

  this.setAriaStates(cellControl, element);
  return element;
};
