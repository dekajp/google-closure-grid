goog.provide('pear.plugin.Pager');

goog.require('goog.ui.ComboBox');
goog.require('pear.plugin.FooterStatusRenderer');
goog.require('pear.ui.Plugin');



/**
 * @class Pager
 * @classdesc
 * Pager plugin is full featured plugin - Just add this plugin to enable paging
 * features on the Grid
 * <ul>
 *   <li> Navigation of Next and Previous Page </li>
 *   <li> Jump to any page - this is enabled by pager dropdown </li>
 *   <li> On Change of Datasource ,e.g when filters are updated , row counts are
 *   updated</li>
 * </ul>
 * @constructor
 * @extends {pear.ui.Plugin}
 */
pear.plugin.Pager = function() {
  pear.ui.Plugin.call(this);
  // Combobox setvalue fire change event - so to avoid infinite loop
  this.trigger_ = false;
};
goog.inherits(pear.plugin.Pager, pear.ui.Plugin);


/**
 * Navigation Control Array
 * @type {Array.<goog.ui.Control>?}
 * @private
 */
pear.plugin.Pager.prototype.navControl_ = null;


/**
 * Pager Dropdown control
 * @type {goog.ui.ComboBox?}
 * @private
 */
pear.plugin.Pager.prototype.pagerComboBox_ = null;


/**
 * @inheritDoc
 */
pear.plugin.Pager.prototype.getClassId = function() {
  return 'Pager';
};


/**
 * Navigation Controls (goog.ui.Control) [left,right]
 * @public
 * @return {Array.<goog.ui.Control>?} Navigation Controls
 */
pear.plugin.Pager.prototype.getNavigationControls = function() {
  return this.navControl_;
};


/**
 * get the pager dropdown
 * @return {goog.ui.ComboBox?}  pager dropdown
 */
pear.plugin.Pager.prototype.getPagerDropdown = function() {
  return this.pagerComboBox_;
};


/**
 * init
 *
 */
pear.plugin.Pager.prototype.init = function() {
  var grid = this.getGrid();
  this.createPager_();

  goog.events.listen(grid.getDataView(),
      pear.data.DataView.EventType.DATAVIEW_CHANGED,
      function(ge) {
        this.handleRowCountChange_(ge);
        this.updateMsg_();
      },false, this);

  goog.events.listen(grid,
      pear.ui.Grid.EventType.PAGE_INDEX_CHANGED,
      function(ge) {
        this.trigger_ = false;
        this.updateMsg_();
        this.updatePagerDropdown_(this.getGrid().getPageIndex());
        this.trigger_ = true;
      },false, this);

  goog.events.listen(grid,
      pear.ui.Grid.EventType.PAGE_SIZE_CHANGED,
      function(ge) {
        this.trigger_ = false;
        this.handleRowCountChange_(ge);
        this.updateMsg_();
        this.trigger_ = true;
      },false, this);

  this.trigger_ = true;
};


/**
 * Get Element
 * @return {Element}
 */
pear.plugin.Pager.prototype.getElement = function() {
  this.element_ = this.element_ ||
      goog.dom.createDom('div', 'pear-grid-pager');
  return this.element_;
};


/**
 * @private
 *
 */
pear.plugin.Pager.prototype.createPager_ = function() {
  var grid = this.getGrid();
  this.createFooter_();
  goog.dom.appendChild(this.footer_, this.getElement());

  this.createPagerNavControls_();
  this.createPagerDropDown_();
  this.createPageSizeDropDown_();

  this.updatePagerDropdown_(grid.getPageIndex());
};


/**
 * @inheritDoc
 */
pear.plugin.Pager.prototype.disposeInternal = function() {
  this.pagerComboBox_.dispose();
  this.pagerComboBox_ = null;
  goog.dom.removeNode(this.footer_);
  this.footer_ = null;
  goog.array.forEach(this.navControl_, function(nav) {
    nav.dispose();
  });
  this.footerStatus_.dispose();

  pear.plugin.Pager.superClass_.disposeInternal.call(this);
};


/**
 * Create footer DOM
 * @private
 */
pear.plugin.Pager.prototype.createFooter_ = function() {
  var grid = this.getGrid();
  var parentElem = grid.getElement();
  this.footer_ = goog.dom.getNextElementSibling(grid.getElement());
  if (this.footer_ &&
      goog.dom.classes.has(this.footer_, 'pear-grid-footer-panel')) {
    // do nothing
  }else {
    this.footer_ = goog.dom.createDom('div', 'pear-grid-footer-panel');
    goog.dom.insertSiblingAfter(this.footer_, parentElem);

    // Set Width
    goog.style.setWidth(this.footer_, grid.getWidth());
  }

  this.footerStatus_ = new goog.ui.Control(
      goog.dom.createDom('div'),
      pear.plugin.FooterStatusRenderer.getInstance());

  this.footerStatus_.render(this.footer_);
  this.updateMsg_();
};


/**
 * Create Pager Dropdown List
 * @private
 */
pear.plugin.Pager.prototype.createPagerDropDown_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getDataViewRowCount();

  this.pagerComboBox_ = new goog.ui.ComboBox();
  this.pagerComboBox_.setUseDropdownArrow(true);
  var i = 0;
  do {
    this.pagerComboBox_.addItem(
        new goog.ui.ComboBoxItem(goog.string.buildString(i + 1)));
    i++;
  }while (i * rowsPerPage < totalRows);

  var text = goog.dom.createDom('span', 'label', 'Go to Page:');
  goog.dom.appendChild(this.getElement(), text);

  this.pagerComboBox_.render(this.getElement());
  goog.style.setWidth(this.pagerComboBox_.getInputElement(), 30);
  goog.style.setHeight(this.pagerComboBox_.getMenu().getElement(), 150);
  this.pagerComboBox_.getMenu().getElement().style.overflowY = 'auto';

  goog.events.
      listen(this.pagerComboBox_,
      goog.ui.Component.EventType.CHANGE,
      this.handleChange_, false, this);
};


/**
 * Create Pager-size Dropdown List
 * @private
 */
pear.plugin.Pager.prototype.createPageSizeDropDown_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;


  this.pageSizeComboBox_ = new goog.ui.ComboBox();
  this.pageSizeComboBox_.setUseDropdownArrow(true);

  this.pageSizeComboBox_.addItem(new goog.ui.ComboBoxItem('10'));
  this.pageSizeComboBox_.addItem(new goog.ui.ComboBoxItem('25'));
  this.pageSizeComboBox_.addItem(new goog.ui.ComboBoxItem('50'));
  this.pageSizeComboBox_.addItem(new goog.ui.ComboBoxItem('100'));
  this.pageSizeComboBox_.addItem(new goog.ui.ComboBoxItem('500'));

  var text = goog.dom.createDom('span', 'label', 'Show rows:');
  goog.dom.appendChild(this.getElement(), text);

  this.pageSizeComboBox_.render(this.getElement());

  goog.style.setWidth(this.pageSizeComboBox_.getInputElement(), 30);
  goog.style.setHeight(this.pageSizeComboBox_.getMenu().getElement(), 150);
  this.pageSizeComboBox_.getMenu().getElement().style.overflowY = 'auto';

  this.pageSizeComboBox_.setValue('' + grid.getPageSize());

  goog.events.
      listen(this.pageSizeComboBox_,
      goog.ui.Component.EventType.CHANGE,
      this.handlePageSizeChange_, false, this);
};


/**
 * Create Pager Navigation controls
 * @private
 */
pear.plugin.Pager.prototype.createPagerNavControls_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getDataViewRowCount();

  var prev = new goog.ui.Control(
      goog.dom.createDom('span', 'fa fa-chevron-left'),
      pear.plugin.PagerCellRenderer.getInstance());
  prev.render(elem);

  var next = new goog.ui.Control(
      goog.dom.createDom('span', 'fa fa-chevron-right'),
      pear.plugin.PagerCellRenderer.getInstance());
  next.render(elem);

  this.navControl_ = [prev, next];

  goog.array.forEach(this.navControl_, function(value) {
    value.setHandleMouseEvents(true);
    goog.events.
        listen(value,
        goog.ui.Component.EventType.ACTION,
        this.handleAction_,
        false,
        this);
  },this);
};


/**
 * Handle Navigation Events
 * @param  {goog.events.Event} ge Navigation Button events
 * @private
 */
pear.plugin.Pager.prototype.handleAction_ = function(ge) {
  var grid = this.getGrid();
  var index = grid.getPageIndex();
  if (ge.target === this.navControl_[0]) {
    grid.gotoPreviousPage();
  }else if (ge.target === this.navControl_[1]) {
    grid.gotoNextPage();
  }
  ge.preventDefault();
};


/**
 * Update Pager Dropdownlist
 * @param  {number} index  Grid Page Index
 * @private
 */
pear.plugin.Pager.prototype.updatePagerDropdown_ = function(index) {
  // TODO : check for boundary
  index = (index < 0) ? 0 : index;
  index = index <= this.pagerComboBox_.getItemCount() - 1 ?
      index : (this.pagerComboBox_.getItemCount() - 1);
  var s = '' + (index + 1);
  this.pagerComboBox_.setValue(s);
};


/**
 * Handle Pager Dropdown Change Event
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.plugin.Pager.prototype.handleChange_ = function(ge) {
  var grid = this.getGrid();
  if (this.trigger_) {
    var cbValue = parseInt(this.pagerComboBox_.getValue(), 10);
    if (cbValue && cbValue > 0) {
      var index = parseInt(this.pagerComboBox_.getValue(), 10) - 1;
      grid.setPageIndex(index);
    }
  }
};


/**
 * Handle Page Size Change
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.plugin.Pager.prototype.handlePageSizeChange_ = function(ge) {
  var grid = this.getGrid();
  var cbValue = parseInt(this.pageSizeComboBox_.getValue(), 10);
  if (cbValue && cbValue > 0) {
    var size = parseInt(this.pageSizeComboBox_.getValue(), 10);
    grid.setPageSize(size);
  }
};


/**
 * Handle Page Index Change
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.plugin.Pager.prototype.handlePageIndexChange_ = function(ge) {
  var index = this.getGrid().getPageIndex();
  // THIS WILL ALSO CAUSE COMBOBOX CHANGE EVENT
  // setPageIndex are fired 2 times , this could be avoided by directly calling
  // handlePageIndexChange_ from handleChange_

  var s = '' + (index + 1);
  this.pagerComboBox_.setValue(s);
};


/**
 * Handle Row Count Change
 * @param  {pear.data.DataViewEvent} ge
 * @private
 */
pear.plugin.Pager.prototype.handleRowCountChange_ = function(ge) {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getDataViewRowCount();

  this.pagerComboBox_.removeAllItems();
  var i = 0;
  do {
    this.pagerComboBox_.addItem(
        new goog.ui.ComboBoxItem(goog.string.buildString(i + 1)));
    i++;
  }while (i * rowsPerPage < totalRows);

  var index = this.getGrid().getPageIndex();
  var s = '' + (index + 1);
  this.pagerComboBox_.setValue(s);
};


/**
 * Update Footer Message
 * @private
 */
pear.plugin.Pager.prototype.updateMsg_ = function() {
  var grid = this.getGrid();
  var startRowIndex = 1;
  var rowCount = grid.getDataViewRowCount();
  var configuration = grid.getConfiguration();
  var currentPageIndex = grid.getPageIndex();
  var endRowIndex = currentPageIndex * grid.getPageSize();

  if (configuration.AllowPaging) {
    startRowIndex = (currentPageIndex) * configuration.PageSize;
    endRowIndex = (startRowIndex + configuration.PageSize) >
        rowCount ?
        rowCount : (startRowIndex + configuration.PageSize);
  }
  startRowIndex = (rowCount > 0) ?
                      (startRowIndex ? startRowIndex : 1) :
                      0;
  endRowIndex = endRowIndex ? endRowIndex : rowCount;
  this.footerStatus_.setContent(
      '[' + startRowIndex + ' - ' + endRowIndex + '] of ' + rowCount + '');
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
pear.plugin.PagerCellRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-pager-cell');


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
      'div',
      this.getClassNames(cellControl).join(' '),
      cellControl.getContent());

  this.setAriaStates(cellControl, element);
  return element;
};
