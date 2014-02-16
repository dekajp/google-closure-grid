goog.provide('pear.plugin.FilterMenu');
goog.provide('pear.plugin.FilterMenuButton');
goog.provide('pear.plugin.FilterMenuEvent');

goog.require('goog.events.Event');
goog.require('goog.positioning.AbsolutePosition');
goog.require('goog.ui.Control');
goog.require('goog.ui.FlatButtonRenderer');
goog.require('pear.ui.Plugin');
goog.require('pear.ui.GridHeaderCell');


/**
 * Filter Menu Plugin
 * @constructor
 * @extends {pear.ui.Plugin}
 */
pear.plugin.FilterMenu = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.FilterMenu, pear.ui.Plugin);


/**
 * Events on Plugin
 * @enum {string}
 */
pear.plugin.FilterMenu.EventType = {
  APPLY_FILTER: 'on-apply-filter',
  CLEAR_FILTER: 'on-clear-filter'
};


/**
 * [headerCell_ description]
 * @type {?pear.ui.GridHeaderCell}
 */
pear.plugin.FilterMenu.prototype.headerCell_ =null;

/**
 * [titleContent_ description]
 * @type {Node|Element}
 */
pear.plugin.FilterMenu.prototype.titleContent_ = null;

/**
 * [closeElement__ description]
 * @type {Node|Element}
 */
pear.plugin.FilterMenu.prototype.closeElement_ = null;


/**
 * [element_ description]
 * @type {?Element}
 */
pear.plugin.FilterMenu.prototype.element_ = null;

/**
 * [filterInput_ description]
 * @type {?goog.ui.LabelInput}
 */
pear.plugin.FilterMenu.prototype.filterInput_ =null;






/**
 * @inheritDoc
 */
pear.plugin.FilterMenu.prototype.getClassId = function() {
  return 'FilterMenu';
};

/**
 * 
 */
pear.plugin.FilterMenu.prototype.init = function() {
  var grid = this.getGrid();
  this.createHeaderMenuDom();
  this.createFilterUIBody();
};

/**
 * @inheritDoc
 */
pear.plugin.FilterMenu.prototype.disposeInternal = function() {
  this.headerCell_ = null;
  this.titleContent_.remove();
  this.titleContent_ = null;

  this.filterInput_.dispose();

  this.closeElement_.remove();
  this.closeElement_ = null;
  goog.events.unlisten(this.closeElement_, goog.events.EventType.CLICK,
                         this.close_);

  this.element_.remove();
  this.element_ = null;

  goog.array.forEach(this.headerMenuBtns_, function(mb) {
    mb.dispose();
  });

  pear.plugin.FilterMenu.superClass_.disposeInternal.call(this);
};


/**
 * [getElement description]
 * @return {Element} 
 */
pear.plugin.FilterMenu.prototype.getElement = function() {
  return this.element_;
};

pear.plugin.FilterMenu.prototype.createHeaderMenuDom = function() {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  this.headerMenuBtns_ = [];
  headerRow.forEachChild(function(headercell) {
    var mb = new pear.plugin.FilterMenuButton(goog.dom.createDom('div',
                       'fa fa-caret-square-o-down'));
    mb.setHeaderCell(headercell);
    mb.render(headercell.getMenuControl().getElement());
    //goog.dom.appendChild(headercell.getMenuControl().getElement(),mb);
    this.headerMenuBtns_.push(mb);
  },this);

  goog.array.forEach(this.headerMenuBtns_, function(mb) {
    goog.events.listen(mb, goog.ui.Component.EventType.ACTION, 
                                              this.showFilterUI_, false, this);
  },this);
};


/**
 * @private
 *
 */
pear.plugin.FilterMenu.prototype.createFilterUIBody = function() {
  var grid = this.getGrid();

  this.element_ = goog.dom.createDom('div', this.getCSSClassName());
  goog.dom.appendChild(grid.getElement(), this.element_);

  var titleBar = goog.dom.createDom('div', this.getCSSClassName() + '-title');
  goog.dom.appendChild(this.getElement(), titleBar);

  this.titleContent_ = goog.dom.createDom('div',
                                this.getCSSClassName() + '-title-content');
  goog.dom.appendChild(titleBar, this.titleContent_);

  this.closeElement_ = goog.dom.createDom('div',
                      'pear-grid-header-cell-menu-title-close fa fa-times');
  goog.dom.appendChild(titleBar, this.closeElement_);

  var breakElem = goog.dom.createDom('div',
      {
        style: 'clear:both'
      });
  goog.dom.appendChild(this.getElement(), breakElem);

  this.createFilterMenu_();

  goog.events.listen(this.closeElement_,
                   goog.events.EventType.CLICK, this.close_, false, this);
};


/**
 * @private
 */
pear.plugin.FilterMenu.prototype.createFilterMenu_ = function() {
  var domEl = goog.dom.createDom('div',
                                   'pear-grid-header-cell-menu-title-filter');
  goog.dom.appendChild(this.getElement(), domEl);
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

  goog.events.listen(fbApply, goog.ui.Component.EventType.ACTION,
                                       this.handleApplyFilter_, false, this);
  goog.events.listen(fbClear, goog.ui.Component.EventType.ACTION,
                                       this.handleCancelFilter_, false, this);
};

/**
 * [handleApplyFilter_ description]
 * @param  {goog.events.BrowserEvent} be 
 * @private 
 */
pear.plugin.FilterMenu.prototype.handleApplyFilter_ = function(be) {
  var evt = new pear.plugin.FilterMenuEvent(
                          pear.plugin.FilterMenu.EventType.APPLY_FILTER,
                          this.getGrid(),
                          this.headerCell_, this.filterInput_.getValue());
  this.dispatchEvent(evt);

  this.close_();
  this.headerCell_.setMenuState(false);
  this.headerCell_.slideMenuOpen(false);
};

/**
 * [handleCancelFilter_ description]
 * @param  {goog.events.BrowserEvent} be 
 * @private
 */
pear.plugin.FilterMenu.prototype.handleCancelFilter_ = function(be) {
  /*var grid = this.getGrid();
  var dv = grid.getDataView();
  var column = this.headerCell_.getCellData();
  dv.clearColumnFilter(column.id );
  dv.applyFilter();
  grid.refresh();*/

  var evt = new pear.plugin.FilterMenuEvent(
                          pear.plugin.FilterMenu.EventType.CLEAR_FILTER,
      this.getGrid(), this.headerCell_, '');
  this.dispatchEvent(evt);

  this.close_();
  this.headerCell_.setMenuState(false);
  this.headerCell_.slideMenuOpen(false);
};

/**
 * [close_ description]
 * @private 
 */
pear.plugin.FilterMenu.prototype.close_ = function() {
  goog.style.showElement(this.getElement(), '');
  this.headerCell_.setMenuState(false);
  this.headerCell_.slideMenuOpen(false);
};

/**
 * @param  {goog.events.Event} ge 
 * @private 
 */
pear.plugin.FilterMenu.prototype.showFilterUI_ = function(ge) {

  // Reset
  
  var mb = (/** @type {pear.plugin.FilterMenuButton} */(ge.currentTarget));

  if (this.headerCell_ &&
         this.headerCell_ !== mb.getHeaderCell()) {
    this.headerCell_.setMenuState(false);
    this.headerCell_.slideMenuOpen(false);
  }

  this.headerCell_ = mb.getHeaderCell();
  var menuElement = this.headerCell_.getMenuControl().getElement();
  var menuPosition = goog.style.getRelativePosition(menuElement, this.getGrid().getElement());
  menuPosition.y = menuPosition.y + goog.style.getSize(this.headerCell_.getMenuControl().getElement()).height;
  var position = new goog.positioning.AbsolutePosition(menuPosition,
      goog.positioning.Corner.TOP_START);

  //goog.style.setPosition(this.getElement(),0,0);
  position.reposition(this.getElement(),
      goog.positioning.Corner.TOP_START);

  goog.style.showElement(this.getElement(), 'inline-block');
  this.headerCell_.setMenuState(true);

  // Update Content
  var grid = this.getGrid();
  var dv = grid.getDataView();

  var text = dv.getColumnFilter(this.headerCell_.getCellData());

  goog.dom.setTextContent(this.titleContent_, this.headerCell_.getContentText());
  this.filterInput_.setValue(text);
};

/**
 * @return {string}
 */
pear.plugin.FilterMenu.prototype.getCSSClassName = function() {
  return 'pear-grid-header-cell-menu';
};






/**
 * [FilterMenuButton description]
 * @param {string|Node|Array.<Node>|NodeList} content Text caption 
 * or DOM structure to display as the content of the control (if any).
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
pear.plugin.FilterMenuButton = function(
    content, opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, content, opt_renderer,opt_domHelper);
};
goog.inherits(pear.plugin.FilterMenuButton, goog.ui.Control);

/**
 * [cell_ description]
 * @type {pear.ui.GridHeaderCell}
 * @private
 */
pear.plugin.FilterMenuButton.prototype.cell_ = null;

/**
 * [setHeaderCell description]
 * @param {pear.ui.GridHeaderCell} cell 
 */
pear.plugin.FilterMenuButton.prototype.setHeaderCell = function(cell) {
  this.cell_ = cell;
};

/**
 * [getHeaderCell description]
 * @return {pear.ui.GridHeaderCell} 
 */
pear.plugin.FilterMenuButton.prototype.getHeaderCell = function() {
  return this.cell_;
};



/**
 * [FilterMenuEvent description]
 * @param {string} type       [description]
 * @param {pear.ui.Grid} target     [description]
 * @param {pear.ui.GridHeaderCell} cell       [description]
 * @param {string} filterText [description]
 * @constructor
 * @extends {goog.events.Event}
 */
pear.plugin.FilterMenuEvent = function(type, target, cell, filterText) {
  goog.events.Event.call(this, type, target);

  /**
   * header cell.
   * @type {pear.ui.GridHeaderCell}
   */
  this.cell = cell;
  /**
   * [filterText description]
   * @type {string}
   */
  this.filterText = filterText;
};
goog.inherits(pear.plugin.FilterMenuEvent, goog.events.Event);
