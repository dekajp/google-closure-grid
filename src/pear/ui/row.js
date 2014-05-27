goog.provide('pear.ui.Row');

goog.require('goog.ui.Component');
goog.require('pear.data.RowView');



/**
 * Row - represent row in a grid. All kind of rows (datarow,footerrow)
 * must inherit this class
 *
 * @constructor
 * @extends {goog.ui.Component}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.Row = function(grid, height, opt_domHelper) {

  goog.ui.Component.call(this, opt_domHelper);

  // To avoid Blur Event on Header cells
  this.setHeight(height);
  this.setGrid(grid);
};
goog.inherits(pear.ui.Row, goog.ui.Component);


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
 * Default CSS class to be applied to the root element
 * @type {string}
 */
pear.ui.Row.CSS_CLASS =
    goog.getCssName('pear-grid-row');


/**
  @override
*/
pear.ui.Row.prototype.enterDocument = function() {
  pear.ui.Row.superClass_.enterDocument.call(this);
  var elem = this.getElement();

  this.setPosition();
  goog.dom.classes.add(elem, pear.ui.Row.CSS_CLASS);
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
 * Get Instance of Grid , which owns this Row
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
  this.grid_ = grid;
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
//pear.ui.Row.prototype.getCellWidth = function(index) {
// var child = this.getChildAt(index);
//  return child.getCellWidth();
//};


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
 * Returns the child control that owns the given DOM node, or null if no such
 * control is found.
 * @param {Node} node DOM node whose owner is to be returned.
 * @return {pear.ui.GridCell?} Control hosted in the Component to which the node
 *     belongs (if found)
 * @public
 */
pear.ui.Row.prototype.getNodeOwnerControl = function(node) {
  var elem = this.getElement();
  while (node && node !== elem) {
    var id = node.id;
    var cell = this.getChild(id);
    if (cell) {
      return (/** @type {pear.ui.GridCell} */ (cell));
    }
    node = node.parentNode;
  }
  return null;
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

