goog.provide('pear.ui.GridRow');

goog.require('pear.ui.GridRowRenderer');
goog.require('pear.ui.Row');



/**
 * DataRow
 *
 * @constructor
 * @extends {pear.ui.Row}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.GridRow = function(grid, height, opt_orientation, opt_renderer, opt_domHelper) {
  pear.ui.Row.call(this, grid, height, goog.ui.Container.Orientation.HORIZONTAL,
                        pear.ui.GridRowRenderer.getInstance(),
                        opt_domHelper);

  this.setFocusable(true);
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
    this.setHighlightedIndex(-1);
    this.highlighted_ = false;
  }
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

  this.setPosition();

  // Unlisten Key Handling - All Key Handling will be done at Grid Level
  var handler = this.getHandler();
  handler.
      unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
      this.handleKeyEvent);

  // Sync GridRow root element ID with DataRow ID
  this.setId(this.getDataRowId());
  this.getElement().id = this.getId();
};


/**
 * [handleEnterItem description]
 * @param  {goog.events.Event} ge
 * @return {boolean}
 */
pear.ui.GridRow.prototype.handleEnterItem = function(ge) {
  return true;
};

/**
 * Handles blur events raised when the container's key event target loses
 * keyboard focus.  The default implementation clears the highlight index.
 * @param {goog.events.BrowserEvent} e Blur event to handle.
 */
pear.ui.GridRow.prototype.handleBlur = function(e) {
  // this.setHighlightedIndex(-1);
  this.setMouseButtonPressed(false);
  // If the container loses focus, and one of its children is open, close it.
  //if (this.openItem_) {
  //  this.openItem_.setOpen(false);
  //}
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
 * 
 */
pear.ui.Row.prototype.setPosition = function() {
  var left, top;
  left = 0;
  top = 0;
  left = 0;
  top = this.getLocationTop();
  //top = this.getModel().getLocationTop();

  goog.style.setPosition(this.getElement(), left, top);
  // goog.style.setSize(this.getElement(), this.getWidth(), this.getHeight());
};

/**
 * @override
 */
pear.ui.GridRow.prototype.disposeInternal = function() {
  this.setFocusable(false);
  pear.ui.GridRow.superClass_.disposeInternal.call(this);
};
