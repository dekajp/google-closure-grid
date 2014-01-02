
goog.provide('pear.data.RowView');

goog.require('goog.Disposable');
goog.require('goog.ui.IdGenerator');


/**
 * @constructor
 * @param {number} id
 * @param {Array} rowdata
 * @extends {goog.Disposable}
 */
pear.data.RowView = function(rowdata,dv) {
  goog.Disposable.call(this);

  // this.position_= position;
  this.rowdata_ = rowdata;
  this.dataview_ = dv;
  this.rowId_ = this.idGenerator_.getNextUniqueId();
};
goog.inherits(pear.data.RowView, goog.Disposable);

pear.data.RowView.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();
pear.data.RowView.prototype.rowId_ = null;

pear.data.RowView.prototype.getRowData = function() {
  return this.rowdata_;
};


//pear.data.RowView.prototype.setRowID = function(id) {
//  this.rowId_ = id;
//};

pear.data.RowView.prototype.getDataView = function() {
  return this.dataview_;
};

pear.data.RowView.prototype.getRowId = function() {
  return this.rowId_;
};


//pear.data.RowView.prototype.getRowContainer = function() {
//  return this.row_;
//};
//pear.data.RowView.prototype.setRowContainer = function(container) {
//  this.row_ = container;
//};
