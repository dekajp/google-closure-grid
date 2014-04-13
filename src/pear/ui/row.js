goog.provide('pear.ui.Row');

goog.require('goog.ui.Container');
goog.require('pear.data.RowView');
goog.require('pear.ui.RowRenderer');



/**
 * Row
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
pear.ui.Row = function(grid, height, opt_orientation,
    opt_renderer, opt_domHelper) {

  goog.ui.Container.call(this, goog.ui.Container.Orientation.HORIZONTAL,
      opt_renderer || pear.ui.RowRenderer.getInstance(),
      opt_domHelper);

  // To avoid Blur Event on Header cells
  this.setFocusable(false);
  this.setHeight(height);
  this.setGrid(grid);
};
goog.inherits(pear.ui.Row, goog.ui.Container);


/**
 * grid
 * @type {pear.ui.Grid?}
 * @private
 */
pear.ui.Row.prototype.grid_ = null;


/**
 * Grid
 * @type {number}
 * @private
 */
pear.ui.Row.prototype.height_ = -1;


/**
* Grid
* @type {number}
* @private
*/
pear.ui.Row.prototype.rowPosition_ = -1;


/**
  @override
*/
pear.ui.Row.prototype.enterDocument = function() {
  pear.ui.Row.superClass_.enterDocument.call(this);
  var elem = this.getElement();

  this.setPosition();
};


/**
 * @return {?pear.data.RowView}
 */
pear.ui.Row.prototype.getDataRowView = function() {
  return (/** @type {pear.data.RowView} */ (this.getModel()));
};

/**
 * set Data RowView
 * @param {pear.data.RowView} rowview 
 */
pear.ui.Row.prototype.setDataRowView = function(rowview) {
  var rv = (/** @type {pear.data.RowView} */ (rowview));
  this.setModel(rv);
};

/**
 * add Cell
 * @param {pear.ui.Cell} cell
 * @param {boolean=} opt_render Whether the new child should be rendered
 *     immediately after being added (defaults to false).
 */
pear.ui.Row.prototype.addCell = function(cell, opt_render) {
  this.addChild(cell, opt_render);
};


/**
 * get Child Cell at
 * @param  {number} index  
 * @return {pear.ui.Cell}  
 * @public
 */
pear.ui.Row.prototype.getCellAt = function(index) {
  return (/** @type {pear.ui.Cell} */ (this.getChildAt(index)));
};


/**
 * return grid
 * @return {pear.ui.Grid}
*/
pear.ui.Row.prototype.getGrid = function() {
  return this.grid_;
};

/**
 * setGrid
 * @param {pear.ui.Grid} grid [description]
 */
pear.ui.Row.prototype.setGrid = function(grid) {
  this.grid_=grid;
};

/**
 * set height of row
 * @param {number} height
*/
pear.ui.Row.prototype.setHeight = function(height) {
  this.height_ = height;
};


/**
 * get width  of row
 * @return {number}
 */
pear.ui.Row.prototype.getWidth = function() {
  var width = 0;
  this.forEachChild(function(child) {
    width = width + child.getCellComputedWidth();
  });

  return width;
};


/**
 * get height of row
 * @return {number}
 */
pear.ui.Row.prototype.getHeight = function() {
  return this.height_;
};


/**
 * get computed height of row
 * @return {number}
 */
pear.ui.Row.prototype.getComputedHeight = function() {
  return this.getHeight();
};


/**
 * set positon of row
 * @param {number} pos
 */
pear.ui.Row.prototype.setRowPosition = function(pos) {
  this.rowPosition_ = pos;
};


/**
 * get position of row
 * @return {number}
 */
pear.ui.Row.prototype.getRowPosition = function() {
  return this.rowPosition_;
};


/**
 * @public
 * @return {number}
 */
pear.ui.Row.prototype.getLocationTop = function() {
  return 0;
};


/**
 * return cell width
 * @param {number} index of cell
 * @return {number}
 */
pear.ui.Row.prototype.getCellWidth = function(index) {
  var child = this.getChildAt(index);
  return child.getCellWidth();
};


/**
 * return computed cell width
 * @param {number} index of cell
 * @return {number}
 */
pear.ui.Row.prototype.getCellComputedWidth = function(index) {
  var child = this.getChildAt(index);
  return child.getCellComputedWidth();
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
  goog.style.setPosition(this.getElement(), left, top);
};


/**
  @private
  @param {goog.events.BrowserEvent} be
*/
pear.ui.Row.prototype.handleScroll_ = function(be) {

  var cell = this.getChild(be.target.id);
  be.stopPropagation();
  be.preventDefault();
};


/**
  @private
  @param {goog.events.BrowserEvent} be
*/
pear.ui.Row.prototype.handleClickEvent_ = function(be) {

  var cell = this.getChild(be.target.id);
  if (cell) {
    cell.setSelected(true);
  }
};


/**
 * @override
 */
pear.ui.Row.prototype.disposeInternal = function() {
  this.grid_ = null;
  delete this.height_;
  delete this.rowPosition_;
  pear.ui.Row.superClass_.disposeInternal.call(this);
};

