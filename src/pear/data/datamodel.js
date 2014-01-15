goog.provide('pear.data.DataModel');

goog.require('goog.events.EventTarget');



/**
 * @constructor
 * @param {Array} columns
 * @param {Array} rows
 * @param {number} width
 * @param {number} height
 * @extends {goog.Disposable}
 */
pear.data.DataModel = function(datacolumns, datarows) {
  goog.events.EventTarget.call(this);

  this.dataColumns_ = datacolumns || [];
  this.dataRows_ = datarows || [];
};
goog.inherits(pear.data.DataModel, goog.events.EventTarget);


pear.data.DataModel.DataType ={
  NUMBER : 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  DATETIME: 'datetime'
};
/**
 * @private
 * @type {Array}
 */
pear.data.DataModel.prototype.dataColumns_ = [];


/**
 * @private
 * @type {Array}
 */
pear.data.DataModel.prototype.dataRows_ = [];



/**
 * @return {Array}
 */
pear.data.DataModel.prototype.getDataColumns = function() {
  return this.dataColumns_;
};

pear.data.DataModel.prototype.setDataColumns = function(dc) {
  this.dataColumns_ = dc;
};
/**
 * @return {Array}
 */
pear.data.DataModel.prototype.getDataRows = function() {
  return this.dataRows_;
};

pear.data.DataModel.prototype.setDataRows = function(dr) {
  this.dataRows_ = dr;
};

pear.data.DataModel.prototype.disposeInternal = function() {
  this.dataColumns_ = null;
  this.dataRows_ = null; 

  pear.data.DataModel.superClass_.disposeInternal.call(this);
};
