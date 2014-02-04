goog.provide('pear.data.DataTable');

goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @param {Array} columns
 * @param {Array} rows
 * @param {number} width
 * @param {number} height
 * @extends {goog.Disposable}
 */
pear.data.DataTable = function(datacolumns, datarows) {
  goog.events.EventTarget.call(this);

  this.dataColumns_ = datacolumns || [];
  this.dataRows_ = datarows || [];
};
goog.inherits(pear.data.DataTable, goog.events.EventTarget);


pear.data.DataTable.DataType = {
  NUMBER: 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  DATETIME: 'datetime'
};


/**
 * @private
 * @type {Array}
 */
pear.data.DataTable.prototype.dataColumns_ = [];


/**
 * @private
 * @type {Array}
 */
pear.data.DataTable.prototype.dataRows_ = [];


/**
 * @return {Array}
 */
pear.data.DataTable.prototype.getDataColumns = function() {
  return this.dataColumns_;
};

pear.data.DataTable.prototype.setDataColumns = function(dc) {
  this.dataColumns_ = dc;
};


/**
 * @return {Array}
 */
pear.data.DataTable.prototype.getDataRows = function() {
  return this.dataRows_;
};

pear.data.DataTable.prototype.setDataRows = function(rows) {
  this.dataRows_ = rows;
};

/**
 * @public
 */
pear.data.DataTable.prototype.addDataRow = function(datarow) {
  this.dataRows_.push(datarow);
};

/**
 * @public
 */
pear.data.DataTable.prototype.addDataRowAt = function(datarow,index) {
  goog.array.insertAt(this.dataRows_, datarow, index); 
};

/**
 * @public
 */
pear.data.DataTable.prototype.removeDataRow = function(index) {
  goog.array.removeAt(this.dataRows_,index);
};


/**
 * @public
 */
pear.data.DataTable.prototype.updateDataRow = function(datarow) {
  
};

pear.data.DataTable.prototype.disposeInternal = function() {
  this.dataColumns_ = null;
  this.dataRows_ = null;

  pear.data.DataTable.superClass_.disposeInternal.call(this);
};
