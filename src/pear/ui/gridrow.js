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

  
};
goog.inherits(pear.ui.GridRow, pear.ui.Row);


/**
 * Grid
 * @type {number}
 * @private
 */
pear.ui.GridRow.prototype.top_ = 0;

/**
 * [selected_ description]
 * @type {boolean}
 */
pear.ui.GridRow.prototype.selected_ = false;


/**
 * [highlighted_ description]
 * @type {boolean}
 */
pear.ui.GridRow.prototype.highlighted_ = false;

/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridRow.CSS_CLASS =
    goog.getCssName('pear-grid-row-data');

/**
 * [getLocationTop description]
 * @return {number}
 */
pear.ui.GridRow.prototype.getLocationTop = function() {
  return this.top_;
};


/**
 * [setLocationTop description]
 * @param {number} top
 */
pear.ui.GridRow.prototype.setLocationTop = function(top) {
  this.top_ = top;
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

pear.ui.GridRow.prototype.isVisible = function() {
  return true;
};


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

pear.ui.GridRow.prototype.clearHighlight = function(){
  this.forEachChild(function(child){
    child.setHighlight(false);
  });
  this.highlightedCellIndex_ = -1;
};

pear.ui.GridRow.prototype.highlightChildAt = function(index){
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
    goog.dom.classes.add(elem,even ? goog.getCssName(baseClass, 'even') :
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
  pear.ui.GridRow.superClass_.disposeInternal.call(this);
};
