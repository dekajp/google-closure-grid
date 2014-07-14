goog.provide('pear.ui.GridRow');

goog.require('pear.ui.Row');



/**
 * DataRow
 *
 * @constructor
 * @extends {pear.ui.Row}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.GridRow = function(grid, height, opt_domHelper) {
  pear.ui.Row.call(this, grid, height, opt_domHelper);

  this.selected_ = false;
  this.highlighted_ = false;
};
goog.inherits(pear.ui.GridRow, pear.ui.Row);


/**
 * top position
 * @type {number}
 * @private
 */
pear.ui.GridRow.prototype.top_ = 0;


/**
 * Selected
 * @type {boolean}
 * @private
 */
pear.ui.GridRow.prototype.selected_;


/**
 * Highlighted
 * @type {boolean}
 * @private
 */
pear.ui.GridRow.prototype.highlighted_;


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridRow.CSS_CLASS =
    goog.getCssName('pear-grid-row-data');


/**
 * Get Top Postion of Gridrow
 * @return {number}
 */
pear.ui.GridRow.prototype.getLocationTop = function() {
  return this.top_;
};


/**
 * Set location top
 * @param {number} top
 */
pear.ui.GridRow.prototype.setLocationTop = function(top) {
  this.top_ = top;

  if (this.isInDocument()) {
    goog.style.setStyle(this.getElement(), 'top', this.top_ + 'px');
  }
};


/**
 * [isHighLighted description]
 * @return {boolean}
 */
pear.ui.GridRow.prototype.isHighLighted = function() {
  return this.highlighted_;
};


/**
 * [isSelected description]
 * @return {boolean}
 */
pear.ui.GridRow.prototype.isSelected = function() {
  return this.selected_;
};


/**
 * IsVisible
 * @return {boolean} [description]
 */
pear.ui.GridRow.prototype.isVisible = function() {
  return true;
};


/**
 * IsEnabled
 * @return {boolean} [description]
 */
pear.ui.GridRow.prototype.isEnabled = function() {
  return true;
};


/**
 * [setHighlight description]
 * @param {boolean} highlight
 */
pear.ui.GridRow.prototype.setHighlight = function(highlight) {

  if (highlight) {
    goog.dom.classes.add(this.getElement(), 'pear-grid-row-highlight');
    this.highlighted_ = true;
  }else {
    goog.dom.classes.remove(this.getElement(), 'pear-grid-row-highlight');
    this.highlighted_ = false;
    this.clearHighlight();
  }
};


/**
 * Clear row highlight
 */
pear.ui.GridRow.prototype.clearHighlight = function() {
  this.forEachChild(function(child) {
    // child could be goog.ui.Component
    if (child.setHighlight) {
      child.setHighlight(false);
    }
  });
  this.highlightedCellIndex_ = -1;
};


/**
 * Highlight Child (GridCell)
 * @param  {number} index
 */
pear.ui.GridRow.prototype.highlightChildAt = function(index) {
  this.clearHighlight();
  var child = this.getChildAt(index);
  child.setHighlight(true);
  this.highlightedCellIndex_ = index;
};


/**
 * [setSelect description]
 * @param {boolean} select
 */
pear.ui.GridRow.prototype.setSelect = function(select) {
  if (select) {
    this.selected_ = true;
    goog.dom.classes.add(this.getElement(), 'pear-grid-row-select');
  }else {
    goog.dom.classes.remove(this.getElement(), 'pear-grid-row-select');
    // No need to removing highlight cell - current focus cell should always
    // be highlighted as a part of navigation
    // this.setHighlightedIndex(-1);
    this.selected_ = false;
  }
};


/**
 * For each child @link {pear.ui.GridCell} update size
 * @public
 */
pear.ui.GridRow.prototype.repositionCells = function() {
  this.forEachChild(function(child) {
    //    child.updateSizeAndPosition();
  },this);
};


/**
 * @override
 *
 */
pear.ui.GridRow.prototype.enterDocument = function() {
  pear.ui.Row.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  var baseClass = pear.ui.GridRow.CSS_CLASS;

  goog.dom.classes.add(elem, pear.ui.GridRow.CSS_CLASS);

  var even = this.getRowPosition() % 2 == 0;
  if (this.isAllowAlternateRowHighlight()) {
    goog.dom.classes.add(elem, even ? goog.getCssName(baseClass, 'even') :
        goog.getCssName(baseClass, 'odd'));
  }else {
    // No Alternate Color Highlight
  }

  // if (!this.isEnabled()) {
  //  goog.dom.classes.add(elem,goog.getCssName(baseClass, 'disabled'));
  //}

  this.setPosition();

  // Sync GridRow root element ID with DataRow ID
  this.setId(this.getDataRowId());
  this.getElement().id = this.getId();
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#exitDocument}.
 * @override
 */
pear.ui.GridRow.prototype.exitDocument = function() {
  pear.ui.GridRow.superClass_.exitDocument.call(this);

  // TODO : temporary arrangment to avoid Detached DOM - HEAP Snapshot
  //this.children_ = null;
  //this.childIndex_ = null;
  //this.setElementInternal(null);
};


/**
 * showGridRowDetailsContainer
 * @param  {boolean} display
 * @public
 */
pear.ui.GridRow.prototype.showGridRowDetailsContainer = function(display) {
  var domHelper = this.getDomHelper();
  if (display) {
    this.gridRowDetails_ = new goog.ui.Component();

    this.addChild(this.gridRowDetails_, true);
    var elem = this.gridRowDetails_.getElement();

    goog.dom.classes.add(elem, 'pear-grid-cell pear-grid-row-detail');
    goog.style.setStyle(elem, 'border-top-width', '0px');
    var grid = this.getGrid();
    var desiredheight = grid.getGridRowDetailHeight();
    var gridWidth = grid.getWidth() > grid.getGridRowWidth() ?
        grid.getGridRowWidth() : grid.getWidth();

    var paddingBox = goog.style.getPaddingBox(
        this.gridRowDetails_.getElement());
    var borderBox = goog.style.getBorderBox(this.gridRowDetails_.getElement());
    var width = gridWidth - borderBox.left - paddingBox.left -
        paddingBox.right - borderBox.right;

    var height = desiredheight - borderBox.top - paddingBox.top -
        paddingBox.bottom - borderBox.bottom;


    goog.style.setHeight(elem, height);
    goog.style.setWidth(elem, width);

    goog.style.setPosition(elem, 0, this.getGrid().getComputedRowHeight());

    this.forEachChild(function(child) {
      goog.dom.classes.add(child.getElement(), 'bottom-border');
    });
  }else {
    this.forEachChild(function(child) {
      goog.dom.classes.remove(child.getElement(), 'bottom-border');
    });
    this.removeChild(this.gridRowDetails_, true);
    this.gridRowDetails_.dispose();
  }
};


/**
 * [applyBottomBorder description]
 * @param  {boolean} display [description]
 */
pear.ui.GridRow.prototype.applyBottomBorder = function(display) {
  if (display) {
    this.forEachChild(function(child) {
      goog.dom.classes.add(child.getElement(), 'bottom-border');
    });
  }else {
    this.forEachChild(function(child) {
      goog.dom.classes.remove(child.getElement(), 'bottom-border');
    });
  }
};


/**
 * Get GridRow Details Container
 * @return {goog.ui.Component} [description]
 */
pear.ui.GridRow.prototype.getGridRowDetailsContainer = function() {
  return this.gridRowDetails_;
};


/**
 * [getDataRowId description]
 * @return {string}
 */
pear.ui.GridRow.prototype.getDataRowId = function() {
  var rowview = this.getDataRowView();
  return rowview.getRowId();
};


/**
 * [isAllowAlternateRowHighlight description]
 * @return {boolean}
 */
pear.ui.GridRow.prototype.isAllowAlternateRowHighlight = function() {
  return this.getGrid().getConfiguration().AllowAlternateRowHighlight;
};


/**
 * @override
 */
pear.ui.GridRow.prototype.disposeInternal = function() {
  if (this.gridRowDetails_) {
    this.gridRowDetails_.dispose();
  }
  pear.ui.GridRow.superClass_.disposeInternal.call(this);
};
