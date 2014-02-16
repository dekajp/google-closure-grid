
goog.provide('pear.data.RowView');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');


/**
 * [RowView description]
 * @param {?string} rowid   
 * @param {?Array} rowdata 
 * @constructor
 * @extends {goog.Disposable}
 */
pear.data.RowView = function(rowid, rowdata) {
  goog.Disposable.call(this);

  this.rowdata_ = rowdata || [];
  this.rowId_ = rowid || '';
};
goog.inherits(pear.data.RowView, goog.Disposable);


/**
 * [rowdata_ description]
 * @type {?Array}
 * @private
 */
pear.data.RowView.prototype.rowdata_ = null;


/**
 * [rowId_ description]
 * @type {string}
 * @private
 */
pear.data.RowView.prototype.rowId_ = '';


/**
 * [selectState_ description]
 * @type {boolean}
 */
pear.data.RowView.prototype.selectState_ = false;


/**
 * [getRowData description]
 * @return {?Array}
 */
pear.data.RowView.prototype.getRowData = function() {
  return this.rowdata_;
};


/**
 * [getRowId description]
 * @return {string}
 */
pear.data.RowView.prototype.getRowId = function() {
  return this.rowId_ || 'no-id';
};


/**
 * [setSelected description]
 * @param {boolean} select
 */
pear.data.RowView.prototype.setSelected = function(select) {
  this.selectState_ = select;
};


/**
 * @override
 */
pear.data.RowView.prototype.disposeInternal = function() {
  this.rowdata_ = null;
  delete this.rowId_;
  pear.data.RowView.superClass_.disposeInternal.call(this);
};
