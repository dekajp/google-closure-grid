goog.provide('pear.data.DataView');

goog.require('pear.data.DataModel');
goog.require('pear.data.RowView');
goog.require('goog.Disposable');


/**
 * @constructor
 * @param {pear.data.DataView} datamodel
 * @extends {goog.Disposable}
 */
pear.data.DataView = function(datamodel) {
  goog.Disposable.call(this);
  
  this.datamodel_ = datamodel;


  this.init_();
};
goog.inherits(pear.data.DataView, goog.Disposable);


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

/**
 * @private
 * @type {pear.data.DataView}
 */
pear.data.DataView.prototype.datamodel_ = null;

/**
 * @private
 * @type {pear.ui.Grid}
 */
pear.data.DataView.prototype.grid_ = null;

/**
 * @private
 * @type {Object}
 */
pear.data.DataView.prototype.rowViews_ = [];

pear.data.DataView.prototype.sortField_ = null;

pear.data.DataView.prototype.sortDirection_ = null;

// Zero based Index
pear.data.DataView.prototype.pageIndex_ = null;

pear.data.DataView.prototype.pageSize_ = null;

/**
 * @private
 * @type {pear.ui.Grid}
 */
pear.data.DataView.prototype.rowidx_ = [];

pear.data.DataView.prototype.disposeInternal = function() {
  this.rowidx_ = null;
  this.originalRowViews_ = null;
  this.rowViews_ = null; 
  this.grid_ = null;
  this.pageIndex_ = null;
  this.pageSize_ = null;
  this.sortFieldId_ = null;
  this.sortDirection_ = null;
  this.datamodel_.dispose();
  this.datamodel_=null;

  pear.data.DataView.superClass_.disposeInternal.call(this);
};


pear.data.DataView.prototype.init_ = function() {
  this.initLocalCacheRowViews_();
};


pear.data.DataView.prototype.initLocalCacheRowViews_ = function() {
  // TODO - Cache
  this.rowViews_ = [];
  this.rowidx_=[];
  this.transformToRowViews_(this.datamodel_.getRows());
  this.updateRowsIdx();
};

/**
 * @param {Array.<Object>} rows
 */
pear.data.DataView.prototype.transformToRowViews_ = function(rows) {
  goog.array.forEach(rows, function(value) {
    this.addRowView_(value);
  },this);
};


/**
 * @param {Object} row
 */
pear.data.DataView.prototype.addRowView_ = function(row) {
  var rv = new pear.data.RowView(row,this);
  this.rowViews_.push(rv);

};

/**
 * @return {Array}
 */
pear.data.DataView.prototype.getSortField = function() {
  return this.sortFieldId_;
};

pear.data.DataView.prototype.getSortDirection = function(){
  return this.sortDirection_;
};
/**
 * @return {Array}
 */
pear.data.DataView.prototype.getColumns = function() {
  return this.datamodel_.getColumns();
};

/**
 * @param {pear.ui.Grid} grid
 */
pear.data.DataView.prototype.setGrid = function(grid) {
  this.grid_ = grid;
};

pear.data.DataView.prototype.setPageIndex = function(pageIndex) {
  this.pageIndex_ = pageIndex;
};

pear.data.DataView.prototype.getPageIndex = function() {
  var index = ( this.pageSize_ && this.pageSize_ > 0 ) ? 
                  ( this.pageIndex_ ? this.pageIndex_ : 0 ) : 0;
  return index;
};

pear.data.DataView.prototype.setPageSize = function(pageSize) {
  this.pageSize_ = pageSize;
};

pear.data.DataView.prototype.getPageSize = function() {
  this.pageSize_ = this.pageSize_ || this.getRowCount();
  return this.pageSize_;
};


/*
 * filter ={
 *   type:
 *   expression:
 *  }
 */
pear.data.DataView.prototype.addColumnFilter = function(columnId,filter) {
  var columns = this.getColumns();
  goog.array.forEach(columns,function(column,index){
    if (column.id === columnId){
      column.filter = column.filter || [] ;
      // TODO - Multiple Filter support not yet complete
      column.filter = [];
      column.filter.push(filter);
    }
  },this);
};

pear.data.DataView.prototype.clearColumnFilter = function(columnMapId) {
  var columns = this.getColumns();
  goog.array.forEach(columns,function(column,index){
    if (column.id === columnMapId){
      column.filter = null;
    }
  },this);
};


pear.data.DataView.prototype.applyFilter = function() {
  var columns = this.getColumns();
  this.rowViews_ =[];
  this.transformToRowViews_(this.datamodel_.getRows());

  this.updateRowsIdx();
  this.rowViews_ = this.rowViews_.filter(this.filter_,this);
};

pear.data.DataView.prototype.filter_ = function(row) {
  var columns = this.getColumns();
  var rowdata = row.getRowData();
  var ret = false;
  goog.array.forEach(columns,function(column){
    if (column.filter && column.filter.length > 0){
      goog.array.forEach(column.filter,function(filter){
        if (rowdata[column.id] == filter.expression){
          ret = true;
          return ret;
        }
      },this);
    }
  },this);
  return ret;
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
  rv = this.rowViews_[rowId] || [];
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
pear.data.DataView.prototype.getRowViews = function() {
  return this.getPagedRowsViews_();
};

pear.data.DataView.prototype.getPagedRowsViews_ = function() {
  var pgIdx = this.getPageIndex();
  var pgSize = this.getPageSize();
  var start = (pgIdx * pgSize) > this.rowViews_.length ? this.rowViews_.length : (pgIdx * pgSize);
  var end  = (start + pgSize) > this.rowViews_.length ? this.rowViews_.length : (start + pgSize);
  var rows = this.rowViews_.slice( start,end );

  return rows; 

};

pear.data.DataView.prototype.setRowViews = function(rowviews) {
  this.rowViews_= rowviews;
  this.updateRowsIdx();
};

pear.data.DataView.prototype.getRowCount = function() {
  return this.datamodel_.getRows().length;
};

pear.data.DataView.prototype.updateRowsIdx = function() {
  this.rowidx_=[];
  goog.array.forEach(this.rowViews_ , function (value,index){
    this.rowidx_.push(index);
  },this);
};
  

/**
 * @return {Array.<pear.data.RowModel>}
 */
pear.data.DataView.prototype.sort = function(col) {
  if (this.sortFieldId_ === col.id){
    this.sortDirection_ = !this.sortDirection_;
  }
  this.sortFieldId_= col.id;


  var sortFn = function (column){
    var rv = this.rowViews_;
    if (column.datatype === "number"){
      rv.sort(this.numberCompare);
    }else if (column.datatype === "datetime"){
      rv.sort(this.dateCompare);
    }else if (column.datatype === "booleam"){
      rv.sort(this.defaultCompare);
    }else{
      rv.sort(this.defaultCompare);
    } 

    return rv;
  };
  
  this.setRowViews(sortFn.call(this,col));

};


pear.data.DataView.prototype.defaultCompare = function(value1,value2) {
  var dv = value1.getDataView();
  var sortfield = dv.getSortField();
  var temp;
  if (dv.getSortDirection()){
    temp = value1;
    value1=value2;
    value2 = temp;
  }
  if (value1.getRowData()[sortfield]>value2.getRowData()[sortfield]){
    return 1;
  }

  if (value1.getRowData()[sortfield]<value2.getRowData()[sortfield]){
    return -1;
  }

  return 0;
};

pear.data.DataView.prototype.numberCompare = function(value1,value2) {
  var dv = value1.getDataView();
  var sortfield = dv.getSortField();
  var temp;
  if (dv.getSortDirection()){
    temp = value1;
    value1=value2;
    value2 = temp;
  }
  return value1.getRowData()[sortfield] - value2.getRowData()[sortfield];
};

pear.data.DataView.prototype.dateCompare = function(value1,value2) {
  var dv = value1.getDataView();
  var sortfield = dv.getSortField();
  var temp;
  if (dv.getSortDirection()){
    temp = value1;
    value1=value2;
    value2 = temp;
  }
  var dateA=new Date(value1.getRowData()[sortfield]), dateB=new Date(value2.getRowData()[sortfield]);
  return dateA-dateB; //sort by date ascending
};


