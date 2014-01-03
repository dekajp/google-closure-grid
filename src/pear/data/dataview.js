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

/**
 * @private
 * @type {pear.ui.Grid}
 */
pear.data.DataView.prototype.rowidx_ = [];

pear.data.DataView.prototype.viewrange_ = {
  start : 0,
  end : 0
};

pear.data.DataView.prototype.disposeInternal = function() {
  this.rowidx_ = null;
  this.rowViews_ = null; 
  this.grid_ = null;
  this.datamodel_.dispose();
  this.datamodel_=null;

  pear.data.DataView.superClass_.disposeInternal.call(this);
};

/**
 * @return {Array}
 */
pear.data.DataView.prototype.getSortField = function() {
  return this.sortField_;
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
  this.refresh_();
};

pear.data.DataView.prototype.getPageIndex = function() {
  var index = ( this.pageSize_ && this.pageSize_ > 0 ) ? 
                  ( this.pageIndex_ ? this.pageIndex_ : 1 ) : 0;
  return index;
};

pear.data.DataView.prototype.setPageSize = function(pageSize) {
  this.pageSize_ = pageSize;
  this.refresh_();
};

pear.data.DataView.prototype.getPageSize = function() {
  var pageSize = this.pageSize_ || 0;
  return this.pageSize_;
};

pear.data.DataView.prototype.init_ = function() {
  this.rowViews_ = [];
  this.rowidx_=[];
  this.transformToRowViews_(this.datamodel_.getRows());

  goog.array.forEach(this.rowViews_ , function (value,index){
    this.rowidx_.push(index);
  },this);

  this.refresh_();
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
  var rows = [];
  var i;
  for ( i=this.viewrange_.start -1 ;i<this.viewrange_.end;i++){
    rows.push ( this.rowViews_[this.rowidx_[i]]);
  }
  return rows;
};

pear.data.DataView.prototype.getRowCount = function() {
  return this.rowViews_.length;
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
pear.data.DataView.prototype.sort = function(model) {
  if (this.sortField_ === model.id){
    this.sortDirection_ = !this.sortDirection_;
  }
  this.sortField_= model.id;

  if (model.type === "number"){
    this.rowViews_.sort(this.numberCompare);
  }else if (model.type === "datetime"){
    this.rowViews_.sort(this.dateCompare);
  }else if (model.type === "booleam"){
    this.rowViews_.sort(this.defaultCompare);
  }else{
    this.rowViews_.sort(this.defaultCompare);
  } 
  this.updateRowsIdx();
  this.refresh_();
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
  return dateA-dateB //sort by date ascending
};

/**
 * @return {Object.<pear.data.RowModel>}
 */
pear.data.DataView.prototype.refresh_ = function() {
  var pageSize = this.getPageSize();
  var pageIndex = this.getPageIndex()-1;
  this.viewrange_.start = 1 , this.viewrange_.end = this.rowidx_.length;

  if (pageSize > 0 && pageIndex > 0){
    this.viewrange_.start = pageIndex * pageSize +1;
    this.viewrange_.start = ( this.viewrange_.start < 1 ) ? 
                              1 :
                              this.viewrange_.start;
    this.viewrange_.end = this.viewrange_.start + pageSize;
  }
};



