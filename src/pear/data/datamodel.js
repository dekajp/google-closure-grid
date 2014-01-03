goog.provide('pear.data.DataModel');

goog.require('goog.Disposable');



/**
 * @constructor
 * @param {Array} columns
 * @param {Array} rows
 * @param {number} width
 * @param {number} height
 * @extends {goog.Disposable}
 */
pear.data.DataModel = function(columns, rows) {
  goog.Disposable.call(this);

  this.columns_ = columns || [];
  this.rows_ = rows || [];
};
goog.inherits(pear.data.DataModel, goog.Disposable);


/**
 * @private
 * @type {Array}
 */
pear.data.DataModel.prototype.columns_ = [];


/**
 * @private
 * @type {Array}
 */
pear.data.DataModel.prototype.rows_ = [];

/**
 * @return {Array}
 */
pear.data.DataModel.prototype.getColumns = function() {
  return this.columns_;
};

/**
 * @return {Array}
 */
pear.data.DataModel.prototype.getRows = function() {
  return this.rows_;
};

pear.data.DataModel.prototype.disposeInternal = function() {
  this.columns_ = null;
  this.rows_ = null; 

  pear.data.DataModel.superClass_.disposeInternal.call(this);
};
