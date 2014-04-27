goog.provide('pear.data.DataTable');

goog.require('goog.events.EventTarget');
goog.require('pear.data.Column');


/**
 * @class  pear.data.DataTable
 * @classdesc
 * DataTable - holds column and raw data for grid
 * Any operations Directly done on DataTable will
 * affect Grid expected behaviour. All operations on DataTable should be done
 * thru DataView {@link pear.data.DataView}
 *  
 * @param {Array.<pear.data.Column>} datacolumns -Each Column in 
 * dataColumns must have unique id
 * @param {Array} datarows a datarow is a array of Objects , where each object 
 * should have property  @link pear.data.Datacolumn.Id from DataColumn Collection
 * 
 * @example
 *   var datarows = [
 *     {orderno:1,item:'Samsung-Galaxy',unitprice:200,...,...,...},
 *     {orderno:2,item:'Iphone',unitprice:200,...,...,...},
 *     {orderno:3,item:'Kindle-Fire',unitprice:200,...,...,...},
 *     ...
 *     ...
 *     ...
 *   ];
 *
 *  
 * TODO - not available
 * add datarow array to hold object as data 
 * e.g [{display:'data1',...},{display:'data2',...}]
 * var data = [
 *     {orderno:{display :1 ,value:{}},item:{display :'Samsung-Galaxy' ,value:{}},......},
 *     {orderno:{display :2 ,value:{}},item:{display :'iphone' ,value:{}},......},
 *     {orderno:{display :3 ,value:{}},item:{display :'Kindle-Fire' ,value:{}},......},
 *     ...
 *     ...
 *     ...
 *   ];
 *   
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.data.DataTable = function(datacolumns, datarows) {
  goog.events.EventTarget.call(this);
  this.dataColumns_ = datacolumns || [];
  this.dataRows_ = datarows || [];

  this.init_();
};
goog.inherits(pear.data.DataTable, goog.events.EventTarget);



/**
 * Generator for unique IDs.
 * @type {goog.ui.IdGenerator}
 * @private
 */
pear.data.DataTable.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();


/**
 * @type {Array.<pear.data.Column>}
 * @private
 */
pear.data.DataTable.prototype.dataColumns_ = [];


/**
 * @type {Array}
 * @private
 */
pear.data.DataTable.prototype.dataRows_ = [];


/**
 * Map of RowID and DataRow
 * @type {goog.structs.Map}
 * @private
 */
pear.data.DataTable.prototype.dataRowsMap_ = null;

/**
 * struct to keep mapping between DataRow and RowId (RowView Id)
 * @return {goog.structs.Map} [description]
 */
pear.data.DataTable.prototype.getMapIdToRow = function() {
  return this.dataRowsMap_;
};


/**
 * get columns
 * @return {Array.<pear.data.Column>}
 */
pear.data.DataTable.prototype.getColumns = function() {
  return this.dataColumns_;
};


/**
 * set columns
 * @param {Array.<pear.data.Column>} dc
 */
pear.data.DataTable.prototype.setColumns = function(dc) {
  this.dataColumns_ = dc;
};


/**
 * Get Datarows
 *
 * @return {Array}
 */
pear.data.DataTable.prototype.getDataRows = function() {
  return this.dataRows_;
};


/**
 * Set DataRows 
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
 *  mydataTable.setDataRows(data);
 *     
 * @param {Array} rows
 */
pear.data.DataTable.prototype.setDataRows = function(rows) {
  this.dataRows_ = rows;
  this.init_();
};


/**
 * Initialize the dataRowsMap for DataRows - each 
 * row is assigned a ID and it is stored in the dataRowsMap
 * @private
 */
pear.data.DataTable.prototype.init_ = function() {

  this.dataRowsMap_ = new goog.structs.Map();
  // Add a unique Row Identifier
  goog.array.forEach(this.dataRows_, function(row, index) {
    var uniqueId = this.idGenerator_.getNextUniqueId();
    this.dataRowsMap_.set(uniqueId, row);
  },this);
};


/**
 * Return a single row by Id , this Id is unique id
 * generated for each Row and stored in DataM
 * @param  {string} rowid
 * @return {Object}
 * @public
 */
pear.data.DataTable.prototype.getDataRowById = function(rowid) {
  return this.dataRowsMap_.get(rowid);
};


/**
 * Add a single row
 * @todo  Allow to add Multiple rows
 * @param {Array} row
 * @public
 */
pear.data.DataTable.prototype.addDataRow = function(row) {
  var uniqueId = this.idGenerator_.getNextUniqueId();
  this.dataRowsMap_.set(uniqueId, row);
  this.dataRows_.push(row);
};


/**
 * Remove a single row
 * @todo Allow to remove multiple rows
 * @param  {?string} id - unique RowId
 * @public
 */
pear.data.DataTable.prototype.removeDataRow = function(id) {
  this.dataRowsMap_.remove(id);
  this.dataRows_ = this.dataRowsMap_.getValues();
};


/**
 * Update a Single DataRow
 * @param  {?string} uniqueid is Unique RowId
 * @param  {Array} datarow
 * @public
 */
pear.data.DataTable.prototype.updateDataRow = function(uniqueid, datarow) {
  this.dataRowsMap_.set(uniqueid, datarow);
  this.dataRows_ = this.dataRowsMap_.getValues();
};


/**
 * @inheritDoc
 * @protected
 */
pear.data.DataTable.prototype.disposeInternal = function() {
  this.dataColumns_ = null;
  this.dataRows_ = null;

  this.dataRowsMap_.clear();

  this.dataRowsMap_ = null;

  pear.data.DataTable.superClass_.disposeInternal.call(this);
};

