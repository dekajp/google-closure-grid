goog.provide('pear.data.DataView');

goog.require('goog.events.EventTarget');
goog.require('pear.data.DataTable');
goog.require('pear.data.RowView');



/**
 * [DataView description]
 * @param {Array} datacolumns
 * @param {Array} datarows
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.data.DataView = function(datacolumns, datarows) {
  goog.events.EventTarget.call(this);

  this.dataTable_ = new pear.data.DataTable(datacolumns, datarows);

  if (datacolumns && datarows) {
    this.initDataRowViews_();
  }
  this.attachEvents_();
};
goog.inherits(pear.data.DataView, goog.events.EventTarget);


/**
 * @enum {number}
 */
pear.data.DataView.FilterType = {
  LIKE: 1,
  EQUAL: 2,
  GREATER_THAN: 3,
  LESS_THAN: 4,
  BETWEEN: 5
};


/**
 * [EventType description]
 * @enum {string}
 */
pear.data.DataView.EventType = {
  DATAVIEW_CHANGED: 'dataview-changed',
  DATASOURCE_CHANGED: 'datasource-changed',
  ROWVIEW_CHANGED: 'rowview-changed',
  DATAROW_CHANGED: 'datarow-changed'
};


/**
 * @private
 * @type {?pear.data.DataTable}
 */
pear.data.DataView.prototype.dataTable_ = null;


/**
 * @private
 * @type {?pear.ui.Grid}
 */
pear.data.DataView.prototype.grid_ = null;


/**
 * @private
 * @type {Array.<pear.data.RowView>}
 */
pear.data.DataView.prototype.dataRowViews_ = [];


/**
 * @private
 * @type {Array.<pear.data.RowView>}
 */
pear.data.DataView.prototype.originalDataRowViews_ = [];


/**
 * @private
 * @type {?Array.<string>}
 */
pear.data.DataView.prototype.selectedRowViewsIds_ = [];


/**
 * [getDataColumns description]
 * @return {Array.<pear.data.Column>}
 */
pear.data.DataView.prototype.getColumns = function() {
  return this.dataTable_.getColumns();
};


/**
 * set column info of dataview
 * @param {Array.<pear.data.Column>} dc
 */
pear.data.DataView.prototype.setColumns = function(dc) {
  this.dataTable_.setColumns(dc);
};


/**
 * [getDataRows description]
 * @return {Array}
 */
pear.data.DataView.prototype.getDataRows = function() {
  return this.dataTable_.getDataRows();
};


/**
 * [setDataRows description]
 * @param {Array} data
 */
pear.data.DataView.prototype.setDataRows = function(data) {
  this.dataTable_.setDataRows(data);
  this.initDataRowViews_();
  this.dispatchDataViewChange_();
};


/**
 * [getDataRowViews description]
 * @return {Array}
 */
pear.data.DataView.prototype.getDataRowViews = function() {
  return this.dataRowViews_;
};


/**
 * [initDataRowViews_ description]
 */
pear.data.DataView.prototype.initDataRowViews_ = function() {
  var map = this.dataTable_.getMapIdToRow();
  this.dataRowViews_ = [];
  goog.iter.forEach(map.getKeyIterator(), function(key) {
    this.dataRowViews_.push(new pear.data.RowView(key, map.get(key)));
  },this);
};


/**
 * [setDataRowViews description]
 * @param {Array.<pear.data.RowView>} rowViews
 */
pear.data.DataView.prototype.setDataRowViews = function(rowViews) {
  this.dataRowViews_ = rowViews;
  this.dispatchDataViewChange_();
};


/**
 * [selectRowView description]
 * @param  {pear.data.RowView} rowview
 * @param  {boolean} select
 */
pear.data.DataView.prototype.selectRowView = function(rowview, select) {
  this.selectedRowViewsIds_.push(rowview.getRowId());
  rowview.setSelected(select);
};


/**
 * [getSelectedRowViewsIds description]
 * @return {?Array.<string>}
 */
pear.data.DataView.prototype.getSelectedRowViewsIds = function() {
  return this.selectedRowViewsIds_;
};


/**
 * [clearSelectedRowViews description]
 */
pear.data.DataView.prototype.clearSelectedRowViews = function() {
  this.selectedRowViewsIds_ = [];
};


/**
 * [getRowCount description]
 * @return {number}
 */
pear.data.DataView.prototype.getRowCount = function() {
  return this.dataTable_.getDataRows().length;
};


/**
 * [getDataRowViewCount description]
 * @return {number}
 */
pear.data.DataView.prototype.getDataRowViewCount = function() {
  return this.dataRowViews_.length;
};


/**
 * @param {pear.ui.Grid} grid
 */
pear.data.DataView.prototype.setGrid = function(grid) {
  this.grid_ = grid;
};


/**
 * [getGrid description]
 * @return {pear.ui.Grid}
 */
pear.data.DataView.prototype.getGrid = function() {
  return this.grid_;
};


/**
 * [addDataRow description]
 * @param {Array} row
 */
pear.data.DataView.prototype.addDataRow = function(row) {
  this.dataTable_.addDataRow(row);
  this.updateDataRowViews_();
  // assume there is undefined row - hence adding row means undefined to
  // defined row
  this.dispatchDataRowChange_(row);
  this.dispatchDataSourceChange_();
};


/**
 * [removeDataRow description]
 * @param  {?string} id
 */
pear.data.DataView.prototype.removeDataRow = function(id) {
  this.dataTable_.removeDataRow(id);
  this.updateDataRowViews_();
  this.dispatchDataSourceChange_();
};


/**
 * [updateDataRow description]
 * @param  {string} uniqueid
 * @param  {Array} datarow
 */
pear.data.DataView.prototype.updateDataRow = function(uniqueid, datarow) {
  this.dataTable_.updateDataRow(uniqueid, datarow);
  this.updateDataRowViews_();
  this.dispatchDataRowChange_(datarow);
  this.dispatchDataSourceChange_();
};


/**
 * [addColumnFilter description]
 *  filter ={
 *   type:
 *   expression:
 *  }
 * @param {Object} dataColumn
 * @param {Object} filter
 */
pear.data.DataView.prototype.addColumnFilter = function(dataColumn, filter) {
  var columns = this.getColumns();
  goog.array.forEach(columns, function(column, index) {
    if (column.getId() === dataColumn.getId())  {
      column.filter = column.filter || [];
      // TODO - Multiple Filter support not yet complete
      column.filter = [];
      column.filter.push(filter);
    }
  },this);
};


/**
 * [getColumnFilter description]
 * @param  {Object} dataColumn
 * @return {string}
 */
pear.data.DataView.prototype.getColumnFilter = function(dataColumn) {
  var columns = this.getColumns();
  var text = '';
  goog.array.forEach(columns, function(column, index) {
    if (column.getId() === dataColumn.getId()) {
      if (column.filter) {
        text = column.filter[0] || '';
      }
    }
  },this);
  return text;
};


/**
 * [clearColumnFilter description]
 * @param  {Object} dataColumn
 */
pear.data.DataView.prototype.clearColumnFilter = function(dataColumn) {
  var columns = this.getColumns();
  goog.array.forEach(columns, function(column, index) {
    if (column.getId() === dataColumn.getId()) {
      column.filter = null;
    }
  },this);
};


/**
 * [applyFilter description]
 * @param  {function(pear.data.RowView)} fnFilter
 * @param  {Object} op_context
 */
pear.data.DataView.prototype.applyFilter = function(fnFilter, op_context) {
  this.initDataRowViews_();
  var filteredRows = this.dataRowViews_.filter(fnFilter, this);
  return filteredRows;
};


/**
 * [getDataRowById description]
 * @param  {string} rowid
 * @return {Array}
 */
pear.data.DataView.prototype.getDataRowById = function(rowid) {
  return this.dataTable_.getMapIdToRow().get(rowid);
};


/**
 * [attachEvents_ description]
 */
pear.data.DataView.prototype.attachEvents_ = function() {

};


/**
 * [dispatchDataViewChange_ description]
 */
pear.data.DataView.prototype.dispatchDataViewChange_ = function() {
  var evt = new pear.data.DataViewEvent(
      pear.data.DataView.EventType.DATAVIEW_CHANGED, this);
  this.dispatchEvent(evt);
};


/**
 * [dispatchDataRowChange_ description]
 * @param  {Array} row
 */
pear.data.DataView.prototype.dispatchDataRowChange_ = function(row) {
  var evt = new pear.data.DataRowChangeEvent(
      pear.data.DataView.EventType.DATAROW_CHANGED, this, row);
  this.dispatchEvent(evt);
};


/**
 * [dispatchDataSourceChange_ description]
 */
pear.data.DataView.prototype.dispatchDataSourceChange_ = function() {
  var evt = new pear.data.DataTableEvent(
      pear.data.DataView.EventType.DATASOURCE_CHANGED, this.dataTable_);
  this.dispatchEvent(evt);
};


/**
 * [updateDataRowViews_ description]
 */
pear.data.DataView.prototype.updateDataRowViews_ = function() {
  this.initDataRowViews_();
};


/**
 * @override
 */
pear.data.DataView.prototype.disposeInternal = function() {
  goog.array.forEach(this.dataRowViews_, function(rv) {
    rv.dispose();
  });

  this.dataRowViews_ = null;
  this.dataTable_.dispose();
  this.grid_ = null;
  pear.data.DataView.superClass_.disposeInternal.call(this);
};



/**
 * Object representing DataViewEvent.
 *
 * @param {string} type Event type.
 * @param {pear.data.DataView} target
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.data.DataViewEvent = function(type, target) {
  goog.events.Event.call(this, type, target);
};
goog.inherits(pear.data.DataViewEvent, goog.events.Event);



/**
 * Object representing DataRowChangeEvent.
 *
 * @param {string} type Event type.
 * @param {pear.data.DataView} target
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.data.DataRowChangeEvent = function(type, target, row) {
  goog.events.Event.call(this, type, target);
  this.dataRow = row;
};
goog.inherits(pear.data.DataRowChangeEvent, goog.events.Event);



/**
 * Object representing DataTableEvent.
 *
 * @param {string} type Event type.
 * @param {pear.data.DataTable} target
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.data.DataTableEvent = function(type, target) {
  goog.events.Event.call(this, type, target);
};
goog.inherits(pear.data.DataTableEvent, goog.events.Event);
