goog.provide('pear.ui.Pager');
goog.provide('pear.ui.PagerEvent');

goog.require('goog.ui.Container');
goog.require('pear.ui.Row');
goog.require('pear.ui.PagerCellRenderer');
goog.require('goog.events.Event');



/**
 * Pager - Pager Navigation and Pager Dropdown
 *
 * @constructor
 * @extends {goog.ui.Container}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.Pager = function(grid,height,opt_orientation, opt_renderer, opt_domHelper) {
  pear.ui.Row.call(this, grid,height, goog.ui.Container.Orientation.HORIZONTAL,
      pear.ui.HeaderRowRenderer.getInstance(),
      opt_domHelper);

  this.setFocusable(false);
};
goog.inherits(pear.ui.Pager, pear.ui.Row);


pear.ui.Pager.EventType = {
  CHANGE : 'pear-pager-evt-changed'
};


/**
 * 
 */
pear.ui.Pager.prototype.getPageIndex = function() {
  return this.getGrid().getPageIndex();
};



/**
 * @override
 */
pear.ui.Pager.prototype.createDom = function() {
  this.element_ = goog.dom.createDom('div', 'pear-grid-pager');
};


/**
 * @override
 *
 */
pear.ui.Pager.prototype.enterDocument = function() {
  pear.ui.Pager.superClass_.enterDocument.call(this);
  
  var elem = this.getElement();
  this.setPosition_();
  //goog.style.setSize(elem,pear.ui.Grid.Configuration.RowHeight);
  this.createPager_();
};


/**
 * @private
 *
 */
pear.ui.Pager.prototype.createPager_ = function() {
  this.createPagerNavControls_();
  this.createPagerDropDown_();
};

pear.ui.Pager.prototype.createPagerDropDown_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();

  this.pagerComboBox_ = new goog.ui.ComboBox();
  this.pagerComboBox_.setUseDropdownArrow(true);
  this.pagerComboBox_.setDefaultText('Page');

  var caption = new goog.ui.ComboBoxItem('Page');
  caption.setSticky(true);
  caption.setEnabled(false);
  this.pagerComboBox_.addItem(caption);
  var i=0;
  do {
    this.pagerComboBox_.addItem(new goog.ui.ComboBoxItem(goog.string.buildString(i+1)));
    i++;
  }while (i*rowsPerPage < totalRows)
  this.pagerComboBox_.render(this.getElement()); 
  goog.style.setWidth(this.pagerComboBox_.getInputElement(),30);
  goog.style.setHeight(this.pagerComboBox_.getMenu().getElement(),150);
  this.pagerComboBox_.getMenu().getElement().style.overflowY = 'auto';

  this.getHandler().
      listen(this.pagerComboBox_,goog.ui.Component.EventType.CHANGE,this.handleChange_,false,this);
};

pear.ui.Pager.prototype.createPagerNavControls_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();
  
  var prev = new goog.ui.Control(
        goog.dom.createDom('span',"fa fa-chevron-left"),
        pear.ui.PagerCellRenderer.getInstance());
  prev.render(elem);

  var next = new goog.ui.Control(
        goog.dom.createDom('span',"fa fa-chevron-right"),
        pear.ui.PagerCellRenderer.getInstance());
  next.render(elem);

  this.navControl_ = [prev,next];

  goog.array.forEach(this.navControl_,function(value){
    value.setHandleMouseEvents(true);
    this.getHandler().
      listen(value,goog.ui.Component.EventType.ACTION,this.handleAction_,false,this);
  },this);
};

pear.ui.Pager.prototype.handleAction_ = function (ge){
  var pageIndex = this.getPageIndex();

  if (ge.target === this.navControl_[0]){
    // Prev
    pageIndex--;
    this.pagerComboBox_.setValue(pageIndex);
  }else if (ge.target === this.navControl_[1]){
    // Next
    pageIndex++;
    this.pagerComboBox_.setValue(pageIndex);
  }
  ge.stopPropagation();
};


pear.ui.Pager.prototype.handleChange_ = function (ge){
  this.dispatchEvent(new pear.ui.PagerEvent(pear.ui.Pager.EventType.CHANGE,
                                                this, ge.target.getValue()));
};



/**
 * Object representing a grid page change event.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {number} pageIndex Selected page index.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.PagerEvent = function(type, target, pageIndex) {
  goog.events.Event.call(this, type, target);

  /**
   * The selected page Index.
   * @type {number}
   */
  this.pageIndex = (pageIndex < 1 ? 1 : pageIndex);
};
goog.inherits(pear.ui.PagerEvent, goog.events.Event);
