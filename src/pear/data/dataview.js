goog.provide('pear.data.DataView');

goog.require('pear.data.DataTable');
goog.require('pear.data.RowView');
goog.require('goog.events.EventTarget');


/**
 * @constructor
 * @param {pear.data.DataView} datamodel
 * @extends {goog.Disposable}
 */
pear.data.DataView = function(datacolumns,datarows) {
  pear.data.DataTable.call(this,datacolumns,datarows);

  if (datacolumns && datarows){
    this.setDataRowViews(datarows);
  }
};
goog.inherits(pear.data.DataView, pear.data.DataTable);


/**
 * @enum
 */
pear.data.DataView.FilterType = {
  LIKE: 1,
  EQUAL: 2,
  GREATER_THAN: 3,
  LESS_THAN: 4,
  BETWEEN:5
};


pear.data.DataView.EventType = {
  ROWVIEWS_CHANGED: 'row-views-changed'
};


/**
 * @private
 * @type {pear.ui.Grid}
 */
pear.data.DataView.prototype.grid_ = null;

/**
 * @private
 * @type {pear.ui.Grid}
 */
pear.data.DataView.prototype.dataRowidx_ = [];
/**
 * @private
 * @type {Object}
 */
pear.data.DataView.prototype.dataRowViews_ = [];

pear.data.DataView.prototype.sortField_ = null;

pear.data.DataView.prototype.sortDirection_ = null;

// Zero based Index
pear.data.DataView.prototype.pageIndex_ = null;

pear.data.DataView.prototype.pageSize_ = null;



pear.data.DataView.prototype.disposeInternal = function() {
  this.dataRowidx_ = null;
  this.originaldataRowViews_ = null;
  this.dataRowViews_ = null; 
  this.grid_ = null;
  this.pageIndex_ = null;
  this.pageSize_ = null;
  this.sortFieldId_ = null;
  this.sortDirection_ = null;
 
  pear.data.DataView.superClass_.disposeInternal.call(this);
};


pear.data.DataView.prototype.setDataRows = function(data) {
  pear.data.DataView.superClass_.setDataRows.call(this,data);
  this.pageIndex_=0;
  this.setDataRowViews(data);
};






/**
 * @param {pear.ui.Grid} grid
 */
pear.data.DataView.prototype.setGrid = function(grid) {
  this.grid_ = grid;
};

pear.data.DataView.prototype.getGrid = function(){
  return this.grid_;
};

pear.data.DataView.prototype.setPageIndex = function(pageIndex) {
  var index = ( this.pageSize_ && this.pageSize_ > 0 ) ? 
                  ( pageIndex ? pageIndex : 0 ) : 0;
  var rowcount = this.getDataRowViewCount();
  var pagesize = this.getPageSize();

  this.pageIndex_ = index;

  if ( this.pageIndex_ < 0){
    this.pageIndex_ = 0;
  }
  index++;
  if ( index * pagesize >= rowcount ){
    this.pageIndex_ = Math.ceil(rowcount/pagesize)-1;
  }

  var evt = new pear.data.DataViewEvent ( pear.data.DataView.EventType.PAGE_INDEX_CHANGED, this );
  this.dispatchEvent(evt);
};

pear.data.DataView.prototype.getPageIndex = function() {
  this.pageIndex_ = this.pageIndex_ || 0;
  return this.pageIndex_;
};

pear.data.DataView.prototype.setPageSize = function(pageSize) {
  this.pageSize_ = pageSize;
  var evt = new pear.data.DataViewEvent ( pear.data.DataView.EventType.PAGE_SIZE_CHANGED, this );
  this.dispatchEvent(evt);
};

pear.data.DataView.prototype.getPageSize = function() {
  var rowcount = this.getDataRowViewCount();
  this.pageSize_ = this.pageSize_ || rowcount;
  this.pageSize_ = ( this.pageSize_ > rowcount ) ? rowcount : this.pageSize_;
  return this.pageSize_;
};


/*
 * filter ={
 *   type:
 *   expression:
 *  }
 */
pear.data.DataView.prototype.addColumnFilter = function(dataColumn,filter) {
  var columns = this.getDataColumns();
  goog.array.forEach(columns,function(column,index){
    if (column.id === dataColumn.id){
      column.filter = column.filter || [] ;
      // TODO - Multiple Filter support not yet complete
      column.filter = [];
      column.filter.push(filter);
    }
  },this);
};

pear.data.DataView.prototype.getColumnFilter = function(dataColumn) {
  var columns = this.getDataColumns();
  var text = '';
  goog.array.forEach(columns,function(column,index){
    if (column.id === dataColumn.id){
      if (column.filter){
        text = column.filter[0] || '';
      }
    }
  },this);
  return text;
};
pear.data.DataView.prototype.clearColumnFilter = function(dataColumn) {
  var columns = this.getDataColumns();
  goog.array.forEach(columns,function(column,index){
    if (column.id === dataColumn.id){
      column.filter = null;
    }
  },this);
};





/**
 * @private
 * @type {number}
 */
//pear.data.DataView.prototype.idx_ = 0;

//pear.data.DataView.prototype.getNextIdx = function() {
//  var id =  this.idx_ ;
//  this.idx_ ++;
//  return id;
//};

/**
 * @return {Array.<pear.data.RowModel>}
 */
pear.data.DataView.prototype.getRowViewByRowId = function(rowId) {
  var rv = null;
  rv = this.dataRowViews_[rowId] || [];
  return rv;
};


/**
 * @param {Object} row
 */
//pear.data.DataView.prototype.addRow = function(row) {
//  this.rows_.push(row);
//  this.addRowView_(row);
//};

/**
 * @return {Array.<pear.data.RowModel>}
 */
pear.data.DataView.prototype.getDataRowViews = function() {
  return this.dataRowViews_;
};

pear.data.DataView.prototype.getPagedRowsViews_ = function() {
  var pgIdx = this.getPageIndex();
  var pgSize = this.getPageSize();
  var start = (pgIdx * pgSize) > this.dataRowViews_.length ? this.dataRowViews_.length : (pgIdx * pgSize);
  var end  = (start + pgSize) > this.dataRowViews_.length ? this.dataRowViews_.length : (start + pgSize);
  var rows = this.dataRowViews_.slice( start,end );

  return rows; 
};

pear.data.DataView.prototype.setDataRowViews = function(rowviews) {
  this.dataRowViews_= rowviews;
  this.updateRowsIdx();
  this.dispatchRowChange();
};

pear.data.DataView.prototype.dispatchRowChange = function (){
  var evt = new pear.data.DataViewEvent ( pear.data.DataView.EventType.ROWVIEWS_CHANGED, this );
  this.dispatchEvent(evt);
};


pear.data.DataView.prototype.getRowCount = function() {
  return this.getDataRows().length;
};

pear.data.DataView.prototype.getDataRowViewCount = function() {
  return this.dataRowViews_.length;
};

pear.data.DataView.prototype.updateRowsIdx = function() {
  this.dataRowidx_=[];
  goog.array.forEach(this.dataRowViews_ , function (value,index){
    this.dataRowidx_.push(index);
  },this);
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
