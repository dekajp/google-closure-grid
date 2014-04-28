
goog.provide('pear.data.RowView');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');


/**
 * @class
 * @classdesc this represent a individual Row and Row state
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
 * Data , this is typically a DataRow
 * @type {Object.<string,*>}
 * @private
 */
pear.data.RowView.prototype.rowdata_ = null;


/**
 * unique Id to identify each row
 * @type {string}
 * @private
 */
pear.data.RowView.prototype.rowId_ = '';


/**
 * Row State , whether the row is selected or not
 * @todo  this should be enumerator 
 * @type {boolean}
 * @private
 */
pear.data.RowView.prototype.selectState_ = false;


/**
 * get Data of Row
 * @return {Object.<string,*>}
 * @public
 */
pear.data.RowView.prototype.getRowData = function() {
  return this.rowdata_;
};


/**
 * get Row Id 
 * @return {string}
 * @public
 */
pear.data.RowView.prototype.getRowId = function() {
  return this.rowId_ || 'no-id';
};


/**
 * Set state of row as selected
 * @todo  this should be enum
 * @param {boolean} select
 * @public
 */
pear.data.RowView.prototype.setSelected = function(select) {
  this.selectState_ = select;
};


/**
 * @override
 * @protected
 */
pear.data.RowView.prototype.disposeInternal = function() {
  this.rowdata_ = null;
  delete this.rowId_;
  pear.data.RowView.superClass_.disposeInternal.call(this);
};
