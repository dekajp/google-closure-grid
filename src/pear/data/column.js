
goog.provide('pear.data.Column');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');


/**
 * Represent the Column of Grid
 * @param {string | Object.<string,string,string,number>} content   
 * @param {string=} opt_id       column id should be unique
 * @param {string=} opt_datatype enum for DataType
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
 * [rowdata_ description]
 * @type {string}
 * @private
 */
pear.data.Column.prototype.headerText = '';


/**
 * [rowId_ description]
 * @type {string}
 * @private
 */
pear.data.Column.prototype.id = '';


/**
 * [dataType description]
 * @type {string}
 * @private
 */
pear.data.Column.prototype.dataType = 'text';

/**
 * width of column
 * @type {number}
 * @private
 */
pear.data.Column.prototype.width = -1;

/**
 * formatting function 
 * @type {?function}
 */
pear.data.Column.prototype.formatterFn = null;

/**
 * formatting function execution scope
 * @type {?Object}
 */
pear.data.Column.prototype.formatterFnScope = null;

/**
 * get Header Text of Column
 * @return {string} [description]
 */
pear.data.Column.prototype.getHeaderText=function(){
  return this.headerText;
};

/**
 * get Column ID
 * @return {string} [description]
 */
pear.data.Column.prototype.getId=function(){
  return this.id;
};

/**
 * Get DataType of Column
 * @return {string} [description]
 */
pear.data.Column.prototype.getDataType=function(){
  return this.dataType;
};

/**
 * get Column Width
 * @return {number} [description]
 */
pear.data.Column.prototype.getWidth=function(){
  return this.width;
};

/**
 * column formatting
 * @return {{fn: function, handler: Object}} [description]
 */
pear.data.Column.prototype.getColumnFormatter = function(){
  return {
    fn: this.formatterFn,
    handler: this.formatterFnScope
  };
};

/**
 * formatting function
 * @param {Function} fn        [description]
 * @param {Object=} opt_scope  whose scope to call the formatter.
 */
pear.data.Column.prototype.setColumnFormatter = function(fn,opt_scope){
  this.formatterFn = fn;
  if (opt_scope){
    this.formatterFnScope = opt_scope ;
  }
};

/**
 * @override
 */
pear.data.Column.prototype.disposeInternal = function() {
  delete this.headerText;
  delete this.id;
  delete this.dataType;
  pear.data.Column.superClass_.disposeInternal.call(this);
};
