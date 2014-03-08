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

  this.setAllowTextSelection(true);

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
goog.ui.Component.prototype.columnIndex_ = -1;


/**
 * @type {pear.data.Column?}
 * @private
 */
goog.ui.Component.prototype.datacolumn_ = null;


/**
 * @type {number}
 * @private
 */
// goog.ui.Component.prototype.columnWidth_ = 0;


/**
 * @type {pear.ui.Row?}
 * @private
 */
goog.ui.Component.prototype.row_ = null;


/**
 * @type {pear.ui.Grid?}
 * @private
 */
goog.ui.Component.prototype.grid_ = null;

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
  this.draw();

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
  // var column = ( /** @type {pear.data.Column} */ (this.getModel()));
  return this.datacolumn_;
};


/**
 * Set Data Column
 * @param  {pear.data.Column} datacolumn 
 */
pear.ui.Cell.prototype.setDataColumn = function(datacolumn) {
  // var data = ( /** @type {pear.data.Column} */ (datacolumn));
  // this.setModel(data);
  this.datacolumn_ = datacolumn;
};

/**
 * @return  {number}
 */
pear.ui.Cell.prototype.getRowPosition = function() {
  return this.getRow().getRowPosition();
};


/**
 * @public
 * @param {number} width
 */
/*pear.ui.Cell.prototype.setCellWidth = function(width, opt_render) {
  this.columnWidth_ = width;
  if (opt_render) {
    this.draw();
  }
};*/


/**
 * @private
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellWidth = function() {
  /*this.columnWidth_ = this.columnWidth_ ||
      this.getGrid().getColumnWidthAt(this.getCellIndex()) ||
      this.getGrid().getConfiguration().ColumnWidth;
  return this.columnWidth_;*/

  return this.getDataColumn().getWidth();
};

pear.ui.Cell.prototype.getCellComputedWidth = function() {
  var width = this.getCellWidth();
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());
  return (width + paddingBox.left + paddingBox.right + borderBox.left +
      borderBox.right);
};


/**
 * @private
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellHeight_ = function() {
  return this.getRow().getHeight();
};


/**
 * @private
 * @return  {number}
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
 * 
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
 *
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
 *
 */
pear.ui.Cell.prototype.draw = function() {
  this.setSize_();
  this.setPosition();
};
