goog.provide('pear.data.DataTable');

goog.require('goog.events.EventTarget');



/**
 * DataTable - holds column and raw data for grid
 * 
 * @param {Array} datacolumns
 * @param {Array} datarows
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
 * [DataType description]
 * @type {Object}
 */
pear.data.DataTable.DataType = {
  NUMBER: 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  DATETIME: 'datetime'
};


/**
 * Generator for unique IDs.
 * @type {goog.ui.IdGenerator}
 * @private
 */
pear.data.DataTable.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();


/**
 * @private
 * @type {Array}
 */
pear.data.DataTable.prototype.dataColumns_ = [];


/**
 * @private
 * @type {Array}
 */
pear.data.DataTable.prototype.dataRows_ = [];


/**
 * [mapIdToRow_ description]
 * @type {goog.structs.Map}
 */
pear.data.DataTable.prototype.mapIdToRow_ = null;

pear.data.DataTable.prototype.getMapIdToRow = function() {
  return this.mapIdToRow_;
};


/**
 * @return {Array}
 */
pear.data.DataTable.prototype.getDataColumns = function() {
  return this.dataColumns_;
};

pear.data.DataTable.prototype.setDataColumns = function(dc) {
  this.dataColumns_ = dc;
};


/**
 * @return {Array}
 */
pear.data.DataTable.prototype.getDataRows = function() {
  return this.dataRows_;
};


/**
 * [setDataRows description]
 * @param {Array} rows
 */
pear.data.DataTable.prototype.setDataRows = function(rows) {
  this.dataRows_ = rows;
  this.init_();
};


/**
 * [init_ description]
 */
pear.data.DataTable.prototype.init_ = function() {

  this.mapIdToRow_ = new goog.structs.Map();
  // Add a unique Row Identifier
  goog.array.forEach(this.dataRows_, function(row, index) {
    var uniqueId = this.idGenerator_.getNextUniqueId();
    this.mapIdToRow_.set(uniqueId, row);
  },this);
};


/**
 * [getDataRowById description]
 * @param  {string} rowid
 * @return {Array}
 */
pear.data.DataTable.prototype.getDataRowById = function(rowid) {
  return this.mapIdToRow_.get(rowid);
};


/**
 * [addDataRow description]
 * @param {Array} row
 */
pear.data.DataTable.prototype.addDataRow = function(row) {
  var uniqueId = this.idGenerator_.getNextUniqueId();
  this.mapIdToRow_.set(uniqueId, row);
  this.dataRows_.push(row);
};


/**
 * Remove row
 * @param  {?string} id
 */
pear.data.DataTable.prototype.removeDataRow = function(id) {
  this.mapIdToRow_.remove(id);
  this.dataRows_ = this.mapIdToRow_.getValues();
};


/**
 * UpdateDataRow
 * @param  {?string} uniqueid
 * @param  {Array} datarow
 */
pear.data.DataTable.prototype.updateDataRow = function(uniqueid, datarow) {
  this.mapIdToRow_.set(uniqueid, datarow);
  this.dataRows_ = this.mapIdToRow_.getValues();
};


/**
 * @override
 */
pear.data.DataTable.prototype.disposeInternal = function() {
  this.dataColumns_ = null;
  this.dataRows_ = null;

  this.mapIdToRow_.clear();

  this.mapIdToRow_ = null;

  pear.data.DataTable.superClass_.disposeInternal.call(this);
};

