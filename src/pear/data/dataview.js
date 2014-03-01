goog.provide('pear.data.DataView');

goog.require('goog.events.EventTarget');
goog.require('pear.data.DataTable');
goog.require('pear.data.RowView');



/**
 * @class
 * @classdesc
 * DataView is a View on top of DataTable , all CRUD operations on datatable
 * are done thru DataView . 
 * @example
 *     var columns = [
 *       new pear.data.Column("Order No",'orderno',75,pear.data.DataTable.DataType.NUMBER),
 *       new pear.data.Column("Item",'item',115,pear.data.DataTable.DataType.TEXT),
 *       new pear.data.Column("Unit Price",'unitprice',75,pear.data.DataTable.DataType.NUMBER),
 *       ...
 *       ...
 *     ];
 *
 *     // that datarow object property name is identical to the Column Id
 *     var data = [
 *       {orderno:1,item:'Samsung-Galaxy',unitprice:200,...,...,...},
 *       {orderno:2,item:'Iphone',unitprice:200,...,...,...},
 *       {orderno:3,item:'Kindle-Fire',unitprice:200,...,...,...},
 *       ...
 *       ...
 *       ...
 *     ];
 *
 *    // Create DataView Object
 *    var dataView = new pear.data.DataView(columns,data);
 * 
 * @param {Array.<pear.data.Column>} datacolumns Array of pear.data.Column
 * @param {Array.<Object>} datarows 
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.data.DataView = function(datacolumns, datarows) {
  goog.events.EventTarget.call(this);

  this.dataTable_ = new pear.data.DataTable(datacolumns, datarows);

  if (datacolumns && datarows) {
    this.initDataRowViews_();
  }
  // this.attachEvents_();
};
goog.inherits(pear.data.DataView, goog.events.EventTarget);


/**
 * @enum {number}
 * @public
 */
pear.data.DataView.FilterType = {
  LIKE: 1,
  EQUAL: 2,
  GREATER_THAN: 3,
  LESS_THAN: 4,
  BETWEEN: 5
};


/**
 * DataView Events
 * @enum {string}
 */
pear.data.DataView.EventType = {
  /**
   * When DataView is changed - like row added ,removed or updated
   * @type {String}
   */
  DATAVIEW_CHANGED: 'dataview-changed',
  /**
   * When DataView is initialized - this is primarily when DataRows are 
   * changed
   * @type {String}
   */
  DATASOURCE_CHANGED: 'datasource-changed',
  
  /**
   * This event is fired for each Row Added/Updated/Removed 
   * Note : not yet implemented
   * @type {String}
   */
  ROWVIEW_CHANGED: 'rowview-changed',

   /**
   * This event is fired when a rowview is added to "rowview select" 
   * collection
   * @type {String}
   */
  ROWVIEW_SELECT: 'rowview-select',

   /**
   * This event is fired when a rowview is removed from "rowview select" 
   * collection
   * @type {String}
   */
  ROWVIEW_UNSELECT: 'rowview-unselect',

  /**
   * This event is fired for each Row Added/Updated/Removed
   * @type {String}
   */
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
 * get All Columns info 
 * @return {Array.<pear.data.Column>}
 * @public
 */
pear.data.DataView.prototype.getColumns = function() {
  return this.dataTable_.getColumns();
};


/**
 * set column info of dataview
 * @param {Array.<pear.data.Column>} dc
 * @public
 */
pear.data.DataView.prototype.setColumns = function(dc) {
  this.dataTable_.setColumns(dc);
};


/**
 * Get DataRows
 * @return {Array.<Object>}
 * @public
 */
pear.data.DataView.prototype.getDataRows = function() {
  return this.dataTable_.getDataRows();
};


/**
 * Set DataRows , this will fire DataSourceChange and DataViewChange event
 *
 * @fires pear.data.DataView.EventType#DATASOURCE_CHANGED
 * @fires pear.data.DataView.EventType#DATAVIEW_CHANGED
 * @example
 *   var data = [
 *     {orderno:1,item:'Samsung-Galaxy',unitprice:200,...,...,...},
 *     {orderno:2,item:'Iphone',unitprice:200,...,...,...},
 *     {orderno:3,item:'Kindle-Fire',unitprice:200,...,...,...},
 *     ...
 *     ...
 *     ...
 *   ];
 *
 *  // Set DataRows
 *  myDataView.setDataRows(data);
 * @param {Array.<Object>} data
 * @public
 */
pear.data.DataView.prototype.setDataRows = function(data) {
  this.dataTable_.setDataRows(data);
  this.dispatchDataSourceChange_();
  this.initDataRowViews_();
  this.dispatchDataViewChange_();
};


/**
 * get DataRow View
 * @return {Array.<pear.data.RowView>}
 * @public
 */
pear.data.DataView.prototype.getDataRowViews = function() {
  return this.dataRowViews_;
};


/**
 * Initialize the DataView
 * @private
 */
pear.data.DataView.prototype.initDataRowViews_ = function() {
  var map = this.dataTable_.getMapIdToRow();
  this.dataRowViews_ = [];
  goog.iter.forEach(map.getKeyIterator(), function(key) {
    this.dataRowViews_.push(new pear.data.RowView(key, map.get(key)));
  },this);
};


/**
 * Set DataView 
 * @param {Array.<pear.data.RowView>} rowViews
 * @public
 */
pear.data.DataView.prototype.setDataRowViews = function(rowViews) {
  this.dataRowViews_ = rowViews;
  this.dispatchDataViewChange_();
};


/**
 * Select a RowView , this method will fire ROWVIEW_SELECT and ROWVIEW_UNSELECT
 * event
 * @param  {pear.data.RowView} rowview
 * @param  {boolean} select
 * @fires pear.data.DataView.EventType#ROWVIEW_SELECT
 * @fires pear.data.DataView.EventType#ROWVIEW_UNSELECT
 * @public
 */
pear.data.DataView.prototype.selectRowView = function(rowview, select) {
  this.selectedRowViewsIds_.push(rowview.getRowId());
  rowview.setSelected(select);
  var evt;
  if (select){
    evt = new pear.data.DataRowViewEvent(
      pear.data.DataView.EventType.ROWVIEW_SELECT, this ,rowview);
    
  }else{
    evt = new pear.data.DataRowViewEvent(
      pear.data.DataView.EventType.ROWVIEW_UNSELECT, this ,rowview);
  }
  this.dispatchEvent(evt);
};


/**
 * Get Id's of Selected RowViews
 * @return {?Array.<string>}
 * @public
 */
pear.data.DataView.prototype.getSelectedRowViewsIds = function() {
  return this.selectedRowViewsIds_;
};


/**
 * Clear the Selected RowView collection
 * @public
 */
pear.data.DataView.prototype.clearSelectedRowViews = function() {
  this.selectedRowViewsIds_ = [];
};


/**
 * Get the row count of Actual datasource (DataRows in DataTable)
 * @return {number}
 * @public
 */
pear.data.DataView.prototype.getRowCount = function() {
  return this.dataTable_.getDataRows().length;
};


/**
 * Get DataRowView count this could be different than DataRow Count
 * e.g if you set Filter on Grid , DataRowView count will return 
 * all the rows which are result of filter being applied
 * where as , getDataRowCount will return all rows available
 * @return {number}
 */
pear.data.DataView.prototype.getDataRowViewCount = function() {
  return this.dataRowViews_.length;
};


/**
 * this should not be used to set a Grid , this is used internally
 * by grid to set itself when DataView is assigned to Grid
 * @see  {@link pear.ui.Grid#setDataView}
 * @param {pear.ui.Grid} grid
 * @public
 */
pear.data.DataView.prototype.setGrid = function(grid) {
  this.grid_ = grid;
};


/**
 * Return the instance of Grid on which DataView is used
 * There can be one Grid per instance of DataView
 * @return {pear.ui.Grid}
 * @public
 */
pear.data.DataView.prototype.getGrid = function() {
  return this.grid_;
};


/**
 * Add a DataRow
 * @param {Array} datarow
 * @public
 */
pear.data.DataView.prototype.addDataRow = function(datarow) {
  this.dataTable_.addDataRow(datarow);
  // assume there is undefined datarow - hence adding row means undefined to
  // defined row
  this.dispatchDataRowChange_(datarow);
  this.dispatchDataSourceChange_();

  this.updateDataRowViews_();
  this.dispatchDataViewChange_();
  
};


/**
 * Remove a DataRow
 * @param  {?string} id
 * @public
 */
pear.data.DataView.prototype.removeDataRow = function(id) {
  this.dataTable_.removeDataRow(id);
  this.dispatchDataSourceChange_();

  this.updateDataRowViews_();
  this.dispatchDataViewChange_();
  
};


/**
 * Update a DataRow
 * @param  {string} uniqueid
 * @param  {Array} datarow
 * @public
 */
pear.data.DataView.prototype.updateDataRow = function(uniqueid, datarow) {
  this.dataTable_.updateDataRow(uniqueid, datarow);
  this.dispatchDataRowChange_(datarow);
  this.dispatchDataSourceChange_();

  this.updateDataRowViews_();
  this.dispatchDataViewChange_();
  
};


/**
 * 
 * Add a filter expression for a datacolumn , currently grid support one filter
 * expression per column
 * @param {pear.data.Column} dataColumn
 * @param {string} filter
 * @public
 */
pear.data.DataView.prototype.addColumnFilter = function(dataColumn, filter) {
  var columns = this.getColumns();
  goog.array.forEach(columns, function(column, index) {
    if (column.getId() === dataColumn.getId())  {
      column.filter = column.filter || [];
      // @todo - Multiple Filter support not yet complete
      column.filter = [];
      column.filter.push(filter);
    }
  },this);
};


/**
 * get fitler expression for the column
 * @param  {pear.data.Column} dataColumn
 * @return {string}
 * @public
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
 * remove filter expression from the column
 * @param  {pear.data.Column}  dataColumn
 * @public
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
 * Apply filter on DataView , it uses {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter Array.filter }
 * @param  {function(pear.data.RowView)} fnFilter
 * @param  {Object} op_context
 * @example
 *
 *  var filteredRows = dv.applyFilter(filterfn,this);
 *   dv.setDataRowViews(filteredRows);
 *  ...
 *  ...
 *  var filterfn = function(rowview) {
    var columns = dv.getDataColumns();
    var match = true;
    goog.array.forEach(columns,function(column){
      var rowdata= rowview.getRowData();
      if (column.filter && column.filter.length > 0){
        var str;
        var filter = String(column.filter);
        if (column.formatter){
          str = String(column.formatter(rowdata[column.id]));
        }else{
          str = String(rowdata[column.id]);
        }
          
        if (str.toLowerCase().indexOf(filter.toLowerCase()) >=0) {
          match = match && true;
        }else{
          match = match && false;
        }
      }else{
  
      }
    },this);
    return match;
  };
 * @public
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter Array.filter }
 */
pear.data.DataView.prototype.applyFilter = function(fnFilter, op_context) {
  this.initDataRowViews_();
  var filteredRows = this.dataRowViews_.filter(fnFilter, this);
  return filteredRows;
};


/**
 * Get DataRow by RowView Id i.e RowId
 * @param  {string} rowid
 * @return {Array}
 * @public
 */
pear.data.DataView.prototype.getDataRowById = function(rowid) {
  return this.dataTable_.getMapIdToRow().get(rowid);
};


/**
 * Dispatch DataView Change Event
 * @private
 */
pear.data.DataView.prototype.dispatchDataViewChange_ = function() {
  var evt = new pear.data.DataViewEvent(
      pear.data.DataView.EventType.DATAVIEW_CHANGED, this);
  this.dispatchEvent(evt);
};


/**
 * Dispatch DataRow Change event
 * @param  {Array} row
 * @private
 */
pear.data.DataView.prototype.dispatchDataRowChange_ = function(row) {
  var evt = new pear.data.DataRowEvent(
      pear.data.DataView.EventType.DATAROW_CHANGED, this, row);
  this.dispatchEvent(evt);
};


/**
 * Dispatch DataSource Change event
 * @private
 */
pear.data.DataView.prototype.dispatchDataSourceChange_ = function() {
  var evt = new pear.data.DataTableEvent(
      pear.data.DataView.EventType.DATASOURCE_CHANGED, this.dataTable_);
  this.dispatchEvent(evt);
};


/**
 * Update DataRowViews
 * @private
 */
pear.data.DataView.prototype.updateDataRowViews_ = function() {
  this.initDataRowViews_();
};


/**
 * @override
 * @protected
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
 * Object representing DataRowEvent.
 *
 * @param {string} type Event type.
 * @param {pear.data.DataView} target
 * @param {Array.<Object>} row    DataRow
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.data.DataRowEvent = function(type, target, row) {
  goog.events.Event.call(this, type, target);
  this.dataRow = row;
};
goog.inherits(pear.data.DataRowEvent, goog.events.Event);

/**
 * DataRowView Event - represent a DataRowView
 * @param {string} type    [description]
 * @param {pear.data.DataView} target  [description]
 * @param {pear.data.RowView} rowview [description]
 * @constructor
 * @extends {goog.events.Event}
 */
pear.data.DataRowViewEvent = function(type, target, rowview) {
  goog.events.Event.call(this, type, target);
  this.rowview = rowview;
};
goog.inherits(pear.data.DataRowViewEvent, goog.events.Event);

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
