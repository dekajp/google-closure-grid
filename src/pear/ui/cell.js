goog.provide('pear.ui.Cell');

goog.require('goog.ui.Control');
goog.require('pear.ui.CellRenderer');



/**
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
 * @type {number}
 * @private
 */
goog.ui.Component.prototype.columnWidth_ = 0;


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


pear.ui.Cell.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.row_= null;

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
  return this.grid_
};


/**
 * @param {number} pos
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

pear.ui.Cell.prototype.getColumnObject = function() {
  var grid = this.getGrid();
  var columns = grid.getColumns();
  return columns[this.getCellIndex()];
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
pear.ui.Cell.prototype.setCellWidth = function(width,opt_render) {
  this.columnWidth_ = width;
  if (opt_render){
    this.draw();
  }
};


/**
 * @private
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellWidth = function() {
  this.columnWidth_ = this.columnWidth_ || 
            this.getGrid().getColumnWidth(this.getCellIndex()) ||
            this.getGrid().getConfiguration().ColumnWidth;
  return this.columnWidth_;
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
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());

  return (width - paddingBox.left - paddingBox.right - borderBox.left -
      borderBox.right);
};


/**
 * @private
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellHeightOffset_ = function() {
  var height = this.getCellHeight_();
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());

  return (height - paddingBox.top - paddingBox.bottom - borderBox.top -
      borderBox.bottom);
};


/**
 * @private
 */
pear.ui.Cell.prototype.setPosition_ = function() {
  var left, top;
  left = 0;
  top = 0;
  left = 0
  top = 0;
  var i =0;
  for (;i<this.getCellIndex();i++ ){
    left = left + this.getRow().getCellWidth(i);
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

  goog.style.setSize(this.getElement(), width, height);
};


/**
 * @private
 *
 */
pear.ui.Cell.prototype.draw = function() {
  this.setSize_();
  this.setPosition_();
};
