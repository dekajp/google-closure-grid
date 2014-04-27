goog.provide('pear.ui.Cell');

goog.require('goog.ui.Control');
goog.require('pear.ui.CellRenderer');



/**
 * @classdesc Represent a Cell of Grid , this is a base class for All different 
 * types of cells e.g GridHeaderCell , GridCell
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
pear.ui.Cell = function(opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, '',
      opt_renderer || pear.ui.CellRenderer.getInstance(),
      opt_domHelper);


  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, true);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
  this.setSupportedState(goog.ui.Component.State.SELECTED, false);
  this.setSupportedState(goog.ui.Component.State.CHECKED, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  this.setSupportedState(goog.ui.Component.State.OPENED, false);

  this.setAllowTextSelection(false);

};
goog.inherits(pear.ui.Cell, goog.ui.Control);


/**
 * @enum {string}
 */
pear.ui.Cell.EventType = {
  CLICK: 'evt-pear-grid-cell-click',
  OPTION_CLICK: 'evt-pear-grid-cell-options-click'
};


/**
 * @type {number}
 * @private
 */
pear.ui.Cell.prototype.columnIndex_ = -1;


/**
 * @type {pear.data.Column?}
 * @private
 */
pear.ui.Cell.prototype.datacolumn_ = null;


/**
 * @type {pear.ui.Row?}
 * @private
 */
pear.ui.Cell.prototype.row_ = null;


/**
 * @type {pear.ui.Grid?}
 * @private
 */
pear.ui.Cell.prototype.grid_ = null;

/**
 * @inheritDoc
 */
pear.ui.Cell.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.row_ = null;
  this.datacolumn_ = null;

  pear.ui.Cell.superClass_.disposeInternal.call(this);
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.Cell.prototype.enterDocument = function() {
  // TODO check if exists
  this.addClassName('pear-grid-cell');

  pear.ui.Cell.superClass_.
      enterDocument.call(this);
  // this.updateSizeAndPosition();
};


/**
 * Returns the component's parent, if any.
 * @return {pear.ui.Row?} The Row Container.
 */
pear.ui.Cell.prototype.getRow = function() {
  // RowContainer
  this.row_ = this.row_ || /** @type {pear.ui.Row} */ (this.getParent());
  return this.row_;
};


/**
 * Get Instance of Grid , which owns this Cell
 * @return {pear.ui.Grid?}
 */
pear.ui.Cell.prototype.getGrid = function() {
  // RowContainer
  this.grid_ = this.grid_ || this.getRow().getGrid();
  return this.grid_;
};


/**
 * @param {number} index
 */
pear.ui.Cell.prototype.setCellIndex = function(index) {
  this.columnIndex_ = index;
};


/**
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellIndex = function() {
  return this.columnIndex_;
};

/**
 * Get Data Column Associated with the Cell
 * @return {pear.data.Column} Data Column
 */
pear.ui.Cell.prototype.getDataColumn = function() {
  return this.datacolumn_;
};


/**
 * Set Data Column
 * @param  {pear.data.Column} datacolumn 
 */
pear.ui.Cell.prototype.setDataColumn = function(datacolumn) {
 this.datacolumn_ = datacolumn;
};

/**
 * @return  {number}
 */
pear.ui.Cell.prototype.getRowPosition = function() {
  return this.getRow().getRowPosition();
};

/**
 * @private
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellWidth = function() {
  return this.getDataColumn().getWidth();
};

/**
 * @deprecated 
 * @return {number} [description]
 */
pear.ui.Cell.prototype.getCellComputedWidth = function() {
  var width = this.getCellWidth();
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());
  return (width + paddingBox.left + paddingBox.right + borderBox.left +
      borderBox.right);
};


/**
 * @private
 * @deprecated 
 */
pear.ui.Cell.prototype.getCellHeight_ = function() {
  return this.getRow().getHeight();
};


/**
 * @private
 * @deprecated 
 */
pear.ui.Cell.prototype.getCellWidthOffset_ = function() {
  var width = this.getCellWidth();
  return width;
  /*var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());

  return (width - paddingBox.left - paddingBox.right - borderBox.left -
      borderBox.right);*/
};


/**
 * @private
 * @return  {number}
 * @deprecated 
 */
pear.ui.Cell.prototype.getCellHeightOffset_ = function() {
  var height = this.getCellHeight_();
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());

  var h = (height - paddingBox.top - paddingBox.bottom - borderBox.top -
      borderBox.bottom);
  return h;
};


/**
 * @deprecated 
 */
pear.ui.Cell.prototype.setPosition = function() {
  var left, top;
  left = 0;
  top = 0;
  left = 0;
  top = 0;
  var i = 0;
  for (; i < this.getCellIndex(); i++) {
    left = left + this.getRow().getCellComputedWidth(i);
  }

  goog.style.setPosition(this.getElement(), left, top);
};


/**
 * @private
 * @deprecated 
 */
pear.ui.Cell.prototype.setSize_ = function() {
  var width, height;
  width = this.getCellWidthOffset_();
  height = this.getCellHeightOffset_();
  //goog.style.setSize(this.getElement(), width, height);
  goog.style.setWidth(this.getElement(), width);
  goog.style.setHeight(this.getElement(), height);
};


/**
 * @private
 * @deprecated 
 */
pear.ui.Cell.prototype.updateSizeAndPosition = function() {
//  this.setSize_();
//  this.setPosition();
};
