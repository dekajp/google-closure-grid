
goog.provide('pear.data.Column');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');



/**
 * @class
 * Represent the Column of Grid
 * @example
 * new pear.data.Column("header Text",'column-id',275,
 *                         pear.data.Column.DataType.NUMBER)
 *
 * @param {string} content   header Text
 * @param {string} id       column id should be unique , if not class
 * will generate a unique id for each column
 * @param {string=} opt_datafield    field mapping to DataRow field name
 * @param {number=} opt_width    width of column , defaults to 75
 * @param {pear.data.Column.DataType=} opt_datatype DataType , default DataType
 * is pear.data.Column.DataType.TEXT
 * @param {pear.data.Column.Align=} opt_align    text Align of column data ,
 * defaults to pear.data.Column.Align.LEFT
 * @param {pear.ui.GridCellRenderer=} opt_renderer Optional GridCellRenderer
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.data.Column = function(content, id, opt_datafield, opt_width,
    opt_datatype, opt_align, opt_renderer) {
  goog.Disposable.call(this);
  this.headerText_ = content;
  this.id_ = id;
  this.dataType_ = opt_datatype || pear.data.Column.DataType.TEXT;
  this.width_ = opt_width || 75;
  this.align_ = opt_align || pear.data.Column.Align.LEFT;
  this.dataField_ = opt_datafield || this.id_;
  this.renderer_ = opt_renderer || pear.ui.GridCellRenderer.getInstance();
};
goog.inherits(pear.data.Column, goog.events.EventTarget);


/**
 * DataType
 * @enum {string}
 * @public
 */
pear.data.Column.DataType = {
  NUMBER: 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  DATETIME: 'datetime'
};


/**
 * Align of Column
 * @enum {string}
 * @public
 */
pear.data.Column.Align = {
  /**
   * Default Alignment , if align is not specified
   * @type {String}
   */
  LEFT: 'left',
  RIGHT: 'right'
};


/**
 * header text of column
 * @type {string}
 * @private
 */
pear.data.Column.prototype.headerText_ = '';


/**
 * column id
 * @type {string}
 * @private
 */
pear.data.Column.prototype.id_ = '';


/**
 * Datafield ID
 * @type {string}
 * @private
 */
pear.data.Column.prototype.dataField_ = '';


/**
 * align_
 * @type {pear.data.Column.Align}
 * @private
 */

pear.data.Column.prototype.align_ = pear.data.Column.Align.LEFT;


/**
 * datatype of column
 * @type {pear.data.Column.DataType}
 * @private
 */
pear.data.Column.prototype.dataType_ = pear.data.Column.DataType.TEXT;


/**
 * width_ of column
 * @type {number}
 * @private
 */
pear.data.Column.prototype.width_ = -1;


/**
 * set visibility of column
 * @type {boolean}
 * @private
 */
pear.data.Column.prototype.visible_ = true;


/**
 * set freeze of column
 * @type {boolean}
 * @private
 */
pear.data.Column.prototype.freeze_ = false;


/**
 * formatting function
 * @type {function(pear.ui.GridCell)|null}
 * @private
 */
pear.data.Column.prototype.formatterFn_ = null;


/**
 * formatting function execution scope
 * @type {?Object}
 * @private
 */
pear.data.Column.prototype.formatterFnScope_ = null;


/**
 * Renderer for GridCell.  Defaults to {@link pear.ui.GridCellRenderer}.
 * @type {pear.ui.GridCellRenderer?}
 * @private
 */
pear.data.Column.prototype.renderer_;


/**
 * Extra CSS Class Names
 * @type {Array.<string>?}
 * @private
 */
pear.data.Column.prototype.cssClasses_;


/**
 * get Header Text of Column
 * @return {string} header text of column
 * @public
 */
pear.data.Column.prototype.getHeaderText = function() {
  return this.headerText_;
};


/**
 * get Column Id
 * @return {string}
 * @public
 */
pear.data.Column.prototype.getId = function() {
  return this.id_;
};


/**
 * get Data Field , bound to this column
 * @return {string}
 * @public
 */
pear.data.Column.prototype.getDataField = function() {
  return this.dataField_;
};


/**
 * Get DataType of Column
 * @return {pear.data.Column.DataType} DataType of Column
 * @public
 */
pear.data.Column.prototype.getDataType = function() {
  return this.dataType_;
};


/**

 * Get Align
 * @return {pear.data.Column.Align} Text Align of Column
 * @public
 */
pear.data.Column.prototype.getAlign = function() {
  return this.align_;
};


/**
 * get Column width
 * @return {number}
 * @public
 */
pear.data.Column.prototype.getWidth = function() {
  return this.width_;
};


/**
 * set width
 * @param {number} width  width of column
 */
pear.data.Column.prototype.setWidth = function(width) {
  this.width_ = width;
};


/**
 * set column freeze
 * @param {boolean} freeze
 */
pear.data.Column.prototype.setFrozen = function(freeze) {
  this.freeze_ = freeze;
};


/**
 * Is Column Frozen
 * @return {boolean}
 * @public
 */
pear.data.Column.prototype.isFrozen = function() {
  return this.freeze_;
};


/**
 * set column visibility
 * @param {boolean} visible
 */
pear.data.Column.prototype.setVisibility = function(visible) {
  this.visible_ = visible;
};


/**
 * get Column visibility
 * @return {boolean}
 * @public
 */
pear.data.Column.prototype.getVisibility = function() {
  return this.visible_;
};


/**
 * Get the column formatting function - this function will be called
 * for each DataCell for the column it belong to
 * @return {Object.<function(pear.ui.GridCell),Object>}
 * @public
 */
pear.data.Column.prototype.getColumnFormatter = function() {
  return {
    fn: this.formatterFn_,
    handler: this.formatterFnScope_
  };
};


/**
 * Set callback function for formatting all GridCell Data which belongs
 * to this column
 * @example
 * function myformatter (GridCell) {
 *
 *   // this function is called for every cell
 *   // for given column
 * }
 * ...
 * ...
 * column.setColumnFormatter(myformatter);
 *
 * @param {function(pear.ui.GridCell)} fn formatting function - which will be
 *   called for every GridCell which belongs to this column
 * @param {Object=} opt_scope  whose scope to call the formatter function.
 * @public
 */
pear.data.Column.prototype.setColumnFormatter = function(fn, opt_scope) {
  this.formatterFn_ = fn;
  if (opt_scope) {
    this.formatterFnScope_ = opt_scope;
  }
};


/**
 * set the Callback function for Footer Aggregates Calculation
 * @param {Function} fn Aggregate Function - this function fn will be called
 * if footer row is enabled/show and will be called for GridFooterCell which
 * belongs to this Column
 */
pear.data.Column.prototype.setColumnFooterAggregatesFn = function(fn) {
  this.fnFooterAggregate_ = fn;
};


/**
 * get the Aggregate function
 * @return {Function} Callback function for Footer Aggregate
 */
pear.data.Column.prototype.getColumnFooterAggregatesFn = function() {
  return this.fnFooterAggregate_;
};


/**
 * getGridCellRenderer
 * @return {pear.ui.GridCellRenderer?}  column renderer
 */
pear.data.Column.prototype.getGridCellRenderer = function() {
  return this.renderer_;
};


/**
 * setGridCellRenderer
 * @param {pear.ui.GridCellRenderer?} renderer GridCell Renderer
 * @return {pear.ui.GridCellRenderer } [description]
 */
pear.data.Column.prototype.setGridCellRenderer = function(renderer) {
  return this.renderer_ = renderer;
};


/**
 * Extra CSS Classes
 * @return {Array.<string>?}
 */
pear.data.Column.prototype.getExtraCSSClasses = function() {
  return this.cssClasses_;
};


/**
 * Extra CSS Classes
 * @param {Array.<string>?}  classes
 */
pear.data.Column.prototype.setExtraCSSClasses = function(classes) {
  this.cssClasses_ = classes;
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects
 * @protected
 */
pear.data.Column.prototype.disposeInternal = function() {
  delete this.headerText_;
  delete this.id_;
  delete this.dataType_;
  delete this.align_;
  delete this.renderer_;
  delete this.cssClasses_;

  this.formatter_ = null;
  this.formatterFn_ = null;
  this.fnFooterAggregate_ = null;

  pear.data.Column.superClass_.disposeInternal.call(this);
};
