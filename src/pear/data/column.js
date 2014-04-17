
goog.provide('pear.data.Column');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');


/**
 * @classdesc  Represent the Column of Grid
 * @example
 * new pear.data.Column("header Text",'column-id',275,pear.data.DataType.NUMBER)
 * 
 * @param {string} content   header Text 
 * @param {string=} opt_id       column id should be unique
 * @param {pear.data.DataType=} opt_datatype DataType
 * @param {number=} opt_width    width of column
 * @param {number=} opt_align    text Align of column data
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.data.Column = function(content,opt_id,opt_width,opt_datatype,opt_align) {
  goog.Disposable.call(this);
  this.headerText=content;
  this.id = opt_id || goog.ui.IdGenerator.getInstance().getNextUniqueId();
  this.dataType = opt_datatype || pear.data.DataTable.DataType.TEXT;
  this.width=opt_width || 75;
  this.align = opt_align || pear.data.Align.LEFT;
};
goog.inherits(pear.data.Column, goog.events.EventTarget);


/**
 * DataType
 * @enum {string}
 * @public
 */
pear.data.DataType = {
  NUMBER: 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  DATETIME: 'datetime'
  // DECIMAL: 'decimal'
};


/**
 * Align
 * @enum {string}
 * @public
 */
pear.data.Align = {
  LEFT:'left',
  RIGHT:'right'
};


/**
 * header text of column
 * @type {string}
 * @private
 */
pear.data.Column.prototype.headerText = '';


/**
 * column id
 * @type {string}
 * @private
 */
pear.data.Column.prototype.id = '';

/**
 * Align
 * @type {string}
 * @private
 */
pear.data.Column.prototype.align = pear.data.Align.LEFT;

/**
 * datatype of column
 * @type {pear.data.DataType}
 * @private
 */
pear.data.Column.prototype.dataType = pear.data.DataType.TEXT;

/**
 * width of column
 * @type {number}
 * @private
 */
pear.data.Column.prototype.width = -1;

/**
 * formatting function 
 * @type {function(pear.ui.GridCell)|null}
 * @private
 */
pear.data.Column.prototype.formatterFn = null;

/**
 * formatting function execution scope
 * @type {?Object}
 * @private
 */
pear.data.Column.prototype.formatterFnScope = null;

/**
 * get Header Text of Column
 * @return {string} header text of column
 * @public
 */
pear.data.Column.prototype.getHeaderText=function(){
  return this.headerText;
};

/**
 * get Column Id
 * @return {string} [description]
 * @public
 */
pear.data.Column.prototype.getId=function(){
  return this.id;
};

/**
 * Get DataType of Column
 * @return {pear.data.DataType} DataType of Column
 * @public
 */
pear.data.Column.prototype.getDataType=function(){
  return this.dataType;
};

/**
 * Get Align
 * @return {pear.data.Align} Text Align of Column
 * @public
 */
pear.data.Column.prototype.getAlign=function(){
  return this.align;
};

/**
 * get Column Width
 * @return {number} [description]
 * @public
 */
pear.data.Column.prototype.getWidth=function(){
  return this.width;
};

/**
 * Get the column formatting function - this function will be called
 * for each DataCell for the column it belong to
 * @return {Object.<function(pear.ui.GridCell),Object>} [description]
 * @public
 */
pear.data.Column.prototype.getColumnFormatter = function(){
  return {
    fn: this.formatterFn,
    handler: this.formatterFnScope
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
pear.data.Column.prototype.setColumnFormatter = function(fn,opt_scope){
  this.formatterFn = fn;
  if (opt_scope){
    this.formatterFnScope = opt_scope ;
  }
};


/**
 * set the Callback function for Footer Aggregates Calculation
 * @param {Function} fn Aggregate Function - this function fn will be called 
 * if footer row is enabled/show and will be called for GridFooterCell which
 * belongs to this Column 
 */
pear.data.Column.prototype.setColumnFooterAggregatesFn = function(fn){
  this.fnFooterAggregate_ = fn;
};

/**
 * get the Aggregate function
 * @return {Function} Callback function for Footer Aggregate
 */
pear.data.Column.prototype.getColumnFooterAggregatesFn = function(){
  return this.fnFooterAggregate_;
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects
 * @protected
 */
pear.data.Column.prototype.disposeInternal = function() {
  delete this.headerText;
  delete this.id;
  delete this.dataType;
  delete this.align;

  this.formatter =null;
  this.formatterFn=null;
  this.fnFooterAggregate_ =null;

  pear.data.Column.superClass_.disposeInternal.call(this);
};
