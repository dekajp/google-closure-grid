
goog.provide('pear.data.Column');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');


/**
 * @classdesc  Represent the Column of Grid
 * @example
 * new pear.data.Column("header Text",'column-id',275,pear.data.DataType.NUMBER)
 * 
 * @param {string} content   
 * @param {string=} opt_id       column id should be unique
 * @param {pear.data.DataType=} opt_datatype DataType
 * @param {number=} opt_width    width of column
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.data.Column = function(content,opt_id,opt_width,opt_datatype) {
  goog.Disposable.call(this);
  this.headerText=content;
  this.id = opt_id || goog.ui.IdGenerator.getInstance().getNextUniqueId();
  this.dataType = opt_datatype || pear.data.DataTable.DataType.TEXT;
  this.width=opt_width || 75;
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
 * @return {pear.data.DataType} [description]
 * @public
 */
pear.data.Column.prototype.getDataType=function(){
  return this.dataType;
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
 * formatting function
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
 * @param {function(pear.ui.GridCell)} fn    formatting function 
 * @param {Object=} opt_scope  whose scope to call the formatter.
 * @public
 */
pear.data.Column.prototype.setColumnFormatter = function(fn,opt_scope){
  this.formatterFn = fn;
  if (opt_scope){
    this.formatterFnScope = opt_scope ;
  }
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
  this.formatter =null;
  this.formatterFn=null;
  pear.data.Column.superClass_.disposeInternal.call(this);
};
