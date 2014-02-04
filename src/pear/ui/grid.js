/**
 * @license
 * Distributed under - The MIT License (MIT).
 *
 * Copyright (c) 2014  Jyoti Deka
 * dekajp{at}gmail{dot}com
 * http://github.com/dekajp/google-closure-grid
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * version 0.1
 *
 */

goog.provide('pear.ui.Grid');
goog.provide('pear.ui.Grid.GridDataCellEvent');
goog.provide('pear.ui.Grid.GridHeaderCellEvent');

goog.require('goog.events.EventType');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.log');
goog.require('goog.object');
goog.require('pear.data.DataTable');
goog.require('pear.data.DataView');
goog.require('pear.plugin.ColumnPicker');
goog.require('pear.plugin.FilterMenu');
goog.require('pear.plugin.FooterStatus');
goog.require('pear.plugin.HeaderMenu');
goog.require('pear.plugin.Pager');
goog.require('pear.ui.Body');
goog.require('pear.ui.BodyCanvas');
goog.require('pear.ui.GridCell');
goog.require('pear.ui.GridFooterRow');
goog.require('pear.ui.GridHeaderCell');
goog.require('pear.ui.GridHeaderRow');
goog.require('pear.ui.GridRow');
goog.require('pear.ui.Header');
goog.require('pear.ui.Plugin');



/**
 * Grid.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Grid = function(opt_domHelper) {
  goog.ui.Component.call(this);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  this.previousScrollTop_ = 0;
  this.renderedGridRows_ = [];
  this.renderedGridRowsCache_ = [];
  this.scrollbarWidth_ = goog.style.getScrollbarWidth();
  this.dataTable_ = new pear.data.DataTable([], []);
  /**
   * Map of class id to registered plugin.
   * @type {Object}
   * @private
   */
  this.plugins_ = {};
};
goog.inherits(pear.ui.Grid, goog.ui.Component);


/**
 * @enum
 */
pear.ui.Grid.ScrollDirection = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
  NONE: 0
};


/**
 * @enum
 */
pear.ui.Grid.SortDirection = {
  NONE: 0,
  ASC: 1,
  DESC: 2
};

pear.ui.Grid.RenderState_ = {
  RENDERING: 1,
  RENDERED: 2
};


/**
 * @enum
 */
pear.ui.Grid.prototype.Configuration_ = {
  Width: 500,
  Height: 600,
  RowHeight: 25,
  RowHeaderHeight: 30,
  RowFooterHeight: 20,
  ColumnWidth: 125,
  PageSize: 50,
  AllowSorting: false,
  AllowPaging: false,
  AllowColumnResize: false,
  AllowColumnHeaderMenu: false,
  AllowRowSelection:false
};

pear.ui.Grid.EventType = {
  BEFORE_HEADER_CELL_CLICK: 'before-header-cell-click',
  AFTER_HEADER_CELL_CLICK: 'after-header-cell-click',
  SORT: 'on-sort',
  PAGE_INDEX_CHANGED: 'on-page-index-change',
  PAGE_SIZE_CHANGED: 'on-page-size-change',
  DATACELL_BEFORE_CLICK: 'datacell-before-click',
  DATACELL_AFTER_CLICK: 'datacell-after-click',
  HEADERCELLS_RENDERED: 'headercells-rendered',
  AFTER_HEADERCELL_RENDER: 'after-headercell-render',
  DATAROWS_CHANGED: 'on-datarows-changed',
  COLUMNS_CHANGED: 'on-columns-changed',
  GRIDROW_SELECT: 'on-gridrow-selected',
  GRIDROW_UNSELECT: 'on-gridrow-unselected'
};


/**
 * @private
 * @type {pear.ui.GridHeaderRow?}
 */
pear.ui.Grid.prototype.headerRow_ = null;


/**
 * @private
 * @type {pear.ui.Body}
 */
pear.ui.Grid.prototype.body_ = null;


/**
 * @private
 * @type {Array}
 */
pear.ui.Grid.prototype.gridRows_ = null;


/**
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.width_ = null;


/**
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.height_ = null;


/**
 * @private
 * @type {string}
 */
pear.ui.Grid.prototype.sortColumnId_ = null;


/**
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.currentPageIndex_ = null;


/**
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.highlightedGridRowIndex_ = -1;


/**
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.currentHighligtedCellIndex_ = null;


/**
 * Logging object.
 * @type {goog.log.Logger}
 * @protected
 */
pear.ui.Grid.prototype.logger =
    goog.log.getLogger('pear.ui.Grid');


/**
 * @return {*}
 */
pear.ui.Grid.prototype.getConfiguration = function() {
  return this.Configuration_;
};

var logger = goog.log.getLogger('demo');


/**
 * @param {*} colsdata
 */
//pear.ui.Grid.prototype.setColumnsDataModel_ = function(colsdata) {
//  return this.columns_ = colsdata;
//}


/**
 * @return {*}
 */
//pear.ui.Grid.prototype.getRowsDataModel_ = function() {
//  return this.rows_;
//};

/**
 * @return {*}
 */
//pear.ui.Grid.prototype.setRowsDataModel_ = function(rowsdata) {
//  return this.rows_ = rowsdata;
//};


/**
 * @return {pear.ui.Body}
 */
pear.ui.Grid.prototype.getBody = function() {
  return this.body_;
};


/**
 * @return {Array.<pear.ui.GridRow>}
 */
pear.ui.Grid.prototype.getGridRowsCount_ = function() {
  this.gridRows_ = this.gridRows_ || [];
  return this.gridRows_.length;
};


/**
 * @return {Array.<pear.ui.GridRow>}
 */
pear.ui.Grid.prototype.getGridRows_ = function() {
  this.gridRows_ = this.gridRows_ || [];
  return this.gridRows_;
};


/**
 * @return {Array.<pear.ui.GridRow>}
 */
pear.ui.Grid.prototype.getGridRowsAt_ = function(index) {
  return this.gridRows_[index];
};


/**
 * @return {Array.<pear.ui.GridRow>}
 */
pear.ui.Grid.prototype.setGridRows_ = function(rows) {
  this.gridRows_ = rows || [];
};


/**
 * @param {row} pear.ui.GridRow
 */
pear.ui.Grid.prototype.addGridRows_ = function(row) {
  this.gridRows_.push(row);
};


pear.ui.Grid.prototype.isRendered = function() {
  return this.renderState_ == pear.ui.Grid.RenderState_.RENDERED;
};


/**
 * @return {Array.<Object>}
 */
pear.ui.Grid.prototype.getPlugins = function() {
  this.plugins_ = this.plugins_ || [];
  return this.plugins_;
};


/**
 * Returns the registered plugin with the given classId.
 * @param {string} classId classId of the plugin.
 * @return {pear.ui.Plugin} Registered plugin with the given classId.
 */
pear.ui.Grid.prototype.getPluginByClassId = function(classId) {
  return this.plugins_[classId];
};


/**
 * @return {number}
 */
pear.ui.Grid.prototype.getWidth = function() {
  this.width_ = this.width_ || this.Configuration_.Width;
  return this.width_;
};


/**
 * @return {number}
 */
pear.ui.Grid.prototype.getHeight = function() {
  this.height_ = this.height_ || this.Configuration_.Height;
  return this.height_;
};


/**
 * @param {number} width
 */
pear.ui.Grid.prototype.setWidth = function(width) {
  return this.width_ = width;
};


/**
 * @param {number} height
 */
pear.ui.Grid.prototype.setHeight = function(height) {
  return this.height_ = height;
};


/**
 * @return {number}
 */
pear.ui.Grid.prototype.getColumnWidth = function(index) {
  var coldata = this.getColumns_();
  coldata[index]['width'] = coldata[index]['width'] ||
      this.Configuration_.ColumnWidth;
  return coldata[index]['width'];
};


/**
 * @return {number}
 */
pear.ui.Grid.prototype.applyColumnWidth_ = function(index, width, opt_render) {
  var coldata = this.getColumns_();
  coldata[index]['width'] = width || this.Configuration_.ColumnWidth;
  var headerCell = this.headerRow_.getChildAt(index);
  if (opt_render && headerCell) {
    headerCell.setCellWidth(width);
    headerCell.draw();
  }
};

pear.ui.Grid.prototype.setColumnWidth = function(index, width) {
  var coldata = this.getColumns_();
  var diff = width - coldata[index]['width'];
  this.applyColumnWidth_(index, coldata[index]['width'] + diff, true);

  /*
  goog.array.forEach(coldata,function(data,pos){
    if (pos>index){
      var c = this.headerRow_.getChildAt(pos);
      c.draw();
    }
  },this);
  */

  this.updateWidthOfHeaderRow_();
  this.syncWidth_();
};


/**
 *
 *
*/
pear.ui.Grid.prototype.getScrollbarWidth = function() {
  return this.scrollbarWidth_;
};


/**
 * Returns the model associated with the UI component.
 * @return {*} The model.
 */
pear.ui.Grid.prototype.getDataView = function() {
  return this.dataview_;
};

pear.ui.Grid.prototype.setDataView = function(dv) {
  this.dataview_ = dv;
  dv.setGrid(this);

  if (this.dataTable_) {
    this.dataTable_.dispose();
  }

  this.dataTable_ = new pear.data.DataTable([], []);
  this.setColumns(dv.getDataColumns());
  this.setDataRows(dv.getDataRowViews());
};

//pear.ui.Grid.prototype.getDataSourceTable_ = function() {
//  return  this.dataTable_;
//};

//pear.ui.Grid.prototype.setDataSourceTable_ = function(datatable) {
//  this.dataTable_ = datatable;
//};


/**
 * @return {*}
 */
pear.ui.Grid.prototype.getColumns = function() {
  var datacolumns = this.dataTable_.getDataColumns();
  var columns = [];
  goog.array.forEach(datacolumns, function(c) {
    clone = goog.object.clone(c);
    columns.push(clone);
  });
  return columns;
};

pear.ui.Grid.prototype.getColumns_ = function() {
  var cols = this.dataTable_.getDataColumns();
  return cols;
};


pear.ui.Grid.prototype.setColumns = function(datacolumns) {
  var columns = [];
  goog.array.forEach(datacolumns, function(c) {
    clone = goog.object.clone(c);
    columns.push(clone);
  });
  this.dataTable_.setDataColumns(columns);
  var evt = new goog.events.Event(pear.ui.Grid.EventType.COLUMNS_CHANGED,
      this);
  this.dispatchEvent(evt);
};


/**
 * Sets the model associated with the UI component.
 * @param {pear.data.DataView} dv DataView.
 */
pear.ui.Grid.prototype.setDataRows = function(data) {
  this.dataTable_.setDataRows(goog.array.clone(data));
  this.triggerDataRowChangeEvent_();
};

pear.ui.Grid.prototype.getDataRows = function(data) {
  return goog.array.clone(this.dataTable_.getDataRows());
};

pear.ui.Grid.prototype.getDataRows_ = function(data) {
  return this.dataTable_.getDataRows();
};

pear.ui.Grid.prototype.getDataRowsGrid_ = function() {
  var rows = (this.getConfiguration().AllowPaging) ? this.getPagedDataRows_() : this.getDataRows_();
  return rows;
};

pear.ui.Grid.prototype.getPagedDataRows_ = function() {
  var pgIdx = this.getPageIndex();
  var pgSize = this.getPageSize();
  var dataRows = this.getDataRows_();
  var start = (pgIdx * pgSize) > dataRows.length ? dataRows.length : (pgIdx * pgSize);
  var end = (start + pgSize) > dataRows.length ? dataRows.length : (start + pgSize);
  var rows = dataRows.slice(start, end);

  return rows;

};



/**
 * @public
 */
pear.ui.Grid.prototype.addDataRow = function(datarow) {
  this.dataTable_.addDataRow(datarow);
  this.triggerDataRowChangeEvent_();
  this.refresh();
};

/**
 * @public
 */
pear.ui.Grid.prototype.addDataRowAt = function(datarow,index) {
  
};

/**
 * @public
 */
pear.ui.Grid.prototype.removeDataRow = function(index) {
  
};


/**
 * @public
 */
pear.ui.Grid.prototype.updateDataRow = function(index,datarow) {
  
};

/**
 * Row Count
 * @return {number}
 */
pear.ui.Grid.prototype.getRowCount = function() {
  return this.dataTable_.getDataRows().length;
};


/**
 * Header Row
 * @return {pear.ui.GridHeaderRow?}
 */
pear.ui.Grid.prototype.getHeaderRow = function() {
  return this.headerRow_;
};


/**
 * Header Row
 * @return {pear.ui.GridHeaderRow?}
 */
pear.ui.Grid.prototype.getFooterRow = function() {
  return this.footerRow_;
};


/**
 * Sorted Column Index
 * @return {number}
 */
//pear.ui.Grid.prototype.getSortColumnIndex = function() {
//  this.sortColumnIndex_ = this.sortColumnIndex_ || -1;
//  return this.sortColumnIndex_;
//};

pear.ui.Grid.prototype.getCurrentPageIndex = function() {
  this.currentPageIndex_ = this.currentPageIndex_ || 0;
  return this.currentPageIndex_;
};

pear.ui.Grid.prototype.getSortColumnId = function() {
  return this.sortColumnId_;
};


/**
 * Sorted Column Index
 * @param {number}  n
 */
pear.ui.Grid.prototype.setSortColumnId = function(id) {
  return this.sortColumnId_ = id;
};

pear.ui.Grid.prototype.getPageSize = function() {
  return this.getConfiguration().PageSize;
};

pear.ui.Grid.prototype.setPageIndex = function(index) {
  if (index === this.currentPageIndex_ || index < 0 || index > this.getMaxPageIndex()) {
    return;
  }
  this.currentPageIndex_ = index;

  this.refresh();
  var evt = new goog.events.Event(pear.ui.Grid.EventType.PAGE_INDEX_CHANGED,
      this);
  this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.getMaxPageIndex = function() {
  var max = Math.ceil(this.getRowCount() / this.getPageSize());
  return --max;
};

pear.ui.Grid.prototype.getPageIndex = function() {
  return this.currentPageIndex_;
};

pear.ui.Grid.prototype.gotoNextPage = function() {
  this.setPageIndex(this.currentPageIndex_ + 1);
  return this.currentPageIndex_;
};

pear.ui.Grid.prototype.gotoPreviousPage = function() {
  this.setPageIndex(this.currentPageIndex_ - 1);
  return this.currentPageIndex_;
};

pear.ui.Grid.prototype.gotoFirstPage = function() {
  this.setPageIndex(0);
  return this.currentPageIndex_;
};

pear.ui.Grid.prototype.gotoLastPage = function() {
  this.setPageIndex(parseInt(this.getRowCount() / this.getPageSize()));
  return this.currentPageIndex_;
};


/**
 * Header Cell on which Sort is applied
 * @return {pear.ui.GridHeaderCell}
 */
pear.ui.Grid.prototype.getSortedHeaderCell = function() {
  var cell = this.headerRow_.getHeaderCellById(this.getSortColumnId());
  return cell;
};


/**
 * highlighted Row
 * @return {pear.ui.GridHeaderCell}
 */
pear.ui.Grid.prototype.getCurrentHighlightedRow = function() {
  var row = this.getGridRowsAt_(this.highlightedGridRowIndex_);
  return row;
};

pear.ui.Grid.prototype.getCurrentHighlightedCell = function() {
  var cell = this.getCurrentHighlightedRow().getHighlighted();
  return cell;
};

pear.ui.Grid.prototype.setConfiguration = function(config) {
  goog.object.forEach(config, function(value, key) {
    this.Configuration_[key] = value;
  },this);
  return this.Configuration_;
};


/**
 * Registers the plugin with the grid.
 * @param {pear.ui.Plugin} plugin The plugin to register.
 */
pear.ui.Grid.prototype.registerPlugin = function(plugin) {
  var classId = plugin.getClassId();
  if (this.plugins_[classId]) {
    goog.log.error(this.logger,
        'Cannot register the same class of plugin twice.');
  }
  this.plugins_[classId] = plugin;

  plugin.registerGrid(this);

  // By default we enable all plugins for fields that are currently loaded.
  if (this.isRendered()) {
    plugin.enable(this);
    plugin.init();
  }
};


/**
 * Unregisters the plugin with this field.
 * @param {pear.ui.Grid} plugin The plugin to unregister.
 */
pear.ui.Grid.prototype.unregisterPlugin = function(plugin) {
  var classId = plugin.getClassId();
  if (!this.plugins_[classId]) {
    goog.log.error(this.logger,
        'Cannot unregister a plugin that isn\'t registered.');
  }
  delete this.plugins_[classId];

  plugin.unregisterFieldObject(this);
};


/**

 */
pear.ui.Grid.prototype.isEnabled = function() {
  return true;
};

/**

 */
pear.ui.Grid.prototype.isVisible = function() {
  return true;
};



/**
 * @private
 */
pear.ui.Grid.prototype.prepareControlHierarchy_ = function() {
  this.createDom();
};


/**
 * @override
 */
pear.ui.Grid.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();

  goog.dom.classes.set(elem, 'pear-grid');
};


/**
 * @override
 */
pear.ui.Grid.prototype.enterDocument = function() {
  pear.ui.Grid.superClass_.enterDocument.call(this);

  // Grid Rendering Started
  this.renderGrid_();
  this.renderState_ = pear.ui.Grid.RenderState_.RENDERED;

  // Enable and Init - plugins
  for (var classId in this.plugins_) {
    this.plugins_[classId].enable(this);
    this.plugins_[classId].init();
  }
};


/**
 * @private
 */
pear.ui.Grid.prototype.renderGrid_ = function() {
  goog.style.setHeight(this.getElement(), this.height_);
  goog.style.setWidth(this.getElement(), this.width_);

  this.renderHeader_();
  this.renderBody_();
  if (this.Configuration_.AllowPaging) {
    this.setPageIndex(0);
    //this.getDataView().setPageSize(this.Configuration_.PageSize);
  }
  this.prepareGridRows_();
  this.setCanvasHeight_();
  //this.renderfooterRow_();
  this.updateWidthOfHeaderRow_();
  this.syncWidth_();
  this.draw_();
  this.restoreHighlightedRow_();
};


/**
 * @private
 */
pear.ui.Grid.prototype.renderHeader_ = function() {
  this.header_ = new pear.ui.Header();
  this.addChild(this.header_, true);
  goog.style.setWidth(this.header_.getElement(), this.width_);


  this.createHeader_();
  this.registerEventsOnHeaderRow_();

  goog.style.setWidth(this.headerRow_.getElement(),
      this.headerRow_.getWidth());
};


/**
 * @private
 */
pear.ui.Grid.prototype.createHeader_ = function() {
  this.headerRow_ = this.headerRow_ ||
      new pear.ui.GridHeaderRow(this,
      this.Configuration_.RowHeaderHeight);
  this.header_.addChild(this.headerRow_, true);
  goog.style.setHeight(this.headerRow_.getElement(),
      this.Configuration_.RowHeaderHeight);

  // render header
  this.createHeaderCells_();
};


/**
 * @private
 */
pear.ui.Grid.prototype.createHeaderCells_ = function() {
  var columns = this.getColumns_();
  goog.array.forEach(columns, function(column, index) {
    // create header cells here
    var headerCell = new pear.ui.GridHeaderCell();
    headerCell.setModel(column);
    headerCell.setCellIndex(index);
    this.headerRow_.addCell(headerCell, true);
    var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.AFTER_HEADERCELL_RENDER,
        this, headerCell);
    this.dispatchEvent(evt);
  }, this);

  var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.HEADERCELLS_RENDERED, this);
  this.dispatchEvent(evt);
};


/**
 * @private
 */
pear.ui.Grid.prototype.renderfooterRow_ = function() {
  this.footerRow_ = this.footerRow_ || new pear.ui.GridFooterRow(this,
      this.Configuration_.RowFooterHeight);
  this.addChild(this.footerRow_, true);

  this.registerEventsOnFooterRow_();
};


/**
 * @private
 */
pear.ui.Grid.prototype.renderBody_ = function() {
  this.body_ = new pear.ui.Body();
  this.addChild(this.body_, true);
  goog.style.setHeight(this.body_.getElement(), this.height_ - this.headerRow_.getHeight());
  goog.style.setWidth(this.body_.getElement(), this.width_);

  this.bodyCanvas_ = new pear.ui.BodyCanvas();
  this.body_.addChild(this.bodyCanvas_, true);

  this.setCanvasHeight_();

  this.registerEventsOnBody_();
  this.registerEventsOnBodyCanvas_();
};

pear.ui.Grid.prototype.setCanvasHeight_ = function() {
  var height = 0;
  var pagesize = this.getPageSize();
  if (this.Configuration_.AllowPaging) {
    height = (this.getGridRowsCount_() * this.Configuration_.RowHeight);
  }else {
    height = this.getRowCount() * this.Configuration_.RowHeight;
  }
  goog.style.setHeight(this.bodyCanvas_.getElement(), height);
};

pear.ui.Grid.prototype.updateWidthOfHeaderRow_ = function() {
  var rowWidth = 0;
  this.headerRow_.forEachChild(function(headerCell) {
    rowWidth = rowWidth + goog.style.getSize(headerCell.getElement()).width;
  });
  goog.style.setWidth(this.headerRow_.getElement(), rowWidth);
};

pear.ui.Grid.prototype.syncWidth_ = function() {
  var headerWidth = goog.style.getSize(this.headerRow_.getElement()).width;
  var bounds = goog.style.getSize(this.getElement());
  width = (headerWidth > bounds.width) ? headerWidth : bounds.width;
  // Take care of scrollbar width
  goog.style.setWidth(this.headerRow_.getElement(), width + this.getScrollbarWidth());
  var canvasWidth = (headerWidth < width) ? width - this.getScrollbarWidth() : width;
  goog.style.setWidth(this.bodyCanvas_.getElement(), canvasWidth);
};


pear.ui.Grid.prototype.syncScrollOnHeaderRow_ = function() {
  this.header_.getElement().scrollLeft = this.body_.getElement().scrollLeft;
};


pear.ui.Grid.prototype.getKeyEventTarget = function() {
  return this.getElement();
};


/**
 * @private
 */
pear.ui.Grid.prototype.prepareGridRows_ = function() {
  var rows = this.getDataRowsGrid_();
  var pagesize = this.getPageSize();

  this.setGridRows_([]);

  goog.array.forEach(rows, function(value, index) {
    var row = new pear.ui.GridRow(this, this.Configuration_.RowHeight);
    row.setModel(value);
    row.setRowPosition(index);
    if (this.Configuration_.AllowPaging) {
      row.setLocationTop((index % pagesize) * this.Configuration_.RowHeight);
    }else {
      row.setLocationTop(index * this.Configuration_.RowHeight);
    }
    this.addGridRows_(row);
    //can not create cells here - performance delay
  }, this);
};

pear.ui.Grid.prototype.restoreHighlightedRow_ = function(){
  // restore highlighted row
  if (this.highlightedGridRowIndex_ > -1 && 
      this.highlightedGridRowIndex_ < this.getGridRowsCount_() &&
      this.getGridRowsCount_() >0 ){
    var gridrow = this.getGridRowsAt_(this.highlightedGridRowIndex_);
    gridrow.setHighlight(true);
    gridrow.getElement().focus();
  }
}

/**
 * @private
 * @param {pear.ui.Row} row
 */
pear.ui.Grid.prototype.renderDataRowCells_ = function(row) {
  var model = row.getDataRow();
  var columns = this.getColumns_();
  if (row.getChildCount() > 0) {
    row.removeChildren(true);
  }

  goog.array.forEach(columns, function(value, index) {
    var c = new pear.ui.GridCell();
    c.setModel(model[value.id]);
    c.setCellIndex(index);
    row.addCell(c, true);
  },this);
  this.registerEventsOnDataRow_(row);
};


/**
 * @private
 * @param {number} start
 * @param {number} end
 */
pear.ui.Grid.prototype.removeRowsFromRowModelCache_ = function(start, end) {
  for (var i in this.renderedGridRowsCache_) {
    if (i < start || i > end) {
      this.renderedGridRowsCache_[i].removeChildren(true);
      this.bodyCanvas_.removeChild(this.renderedGridRowsCache_[i], true);
      delete this.renderedGridRowsCache_[i];
    }
  }
};


/**
 * @private
 */
pear.ui.Grid.prototype.refreshRenderRows_ = function() {
  var rowCount = this.getRowCount();
  var canvasVisibleBeginPx = (this.body_.getElement().scrollTop >
      (this.Configuration_.RowHeight * 10))
                              ? (this.body_.getElement().scrollTop -
      (this.Configuration_.RowHeight * 10))
                              : 0;

  var size = goog.style.getSize(this.body_.getElement());
  var canvasSize = goog.style.getSize(this.bodyCanvas_.getElement());

  var modulo = canvasVisibleBeginPx % this.Configuration_.RowHeight;
  canvasVisibleBeginPx = canvasVisibleBeginPx - modulo;
  var canvasVisibleEndPx = canvasVisibleBeginPx + size.height +
      (this.Configuration_.RowHeight * 30);
  canvasVisibleEndPx = (canvasVisibleEndPx > canvasSize.height) ?
      canvasSize.height : canvasVisibleEndPx;

  var startIndex = 0 , endIndex = 0;
  startIndex = parseInt(canvasVisibleBeginPx / this.Configuration_.RowHeight, 10);
  startIndex = (startIndex < 0) ? 0 : startIndex;

  endIndex = parseInt(canvasVisibleEndPx / this.Configuration_.RowHeight, 10);
  endIndex = (endIndex > rowCount) ? rowCount : endIndex;

  var i = 0;
  var gridrows = this.getGridRows_();
  for (i = startIndex; (i < endIndex && i < gridrows.length); i++) {
    if (!this.renderedGridRowsCache_[i]) {
      this.renderedGridRows_[i] = this.getGridRowsAt_(i);
    }
  }
  this.removeRowsFromRowModelCache_(startIndex, endIndex);
};


/**
 * @private
 */
pear.ui.Grid.prototype.bodyCanvasRender_ = function(opt_redraw) {
  
  // var dv = this.getDataView();
  if (opt_redraw && this.bodyCanvas_.getChildCount() > 0) {
    this.bodyCanvas_.removeChildren(true);
  }
  goog.array.forEach(this.renderedGridRows_, function(datarow, index) {
    // Render Cell on Canvas on demand for Performance
    this.renderDataRowCells_(datarow);
    this.bodyCanvas_.addChild(datarow, true);
    this.renderedGridRowsCache_[index] = datarow;
  },this);
  this.renderedGridRows_ = [];
};


pear.ui.Grid.prototype.draw_ = function() {
  this.refreshRenderRows_();
  this.bodyCanvasRender_();
  this.restoreHighlightedRow_();
};



pear.ui.Grid.prototype.refreshHeader = function() {
  this.headerRow_.removeChildren(true);
  this.createHeaderCells_();
};

pear.ui.Grid.prototype.refresh = function() {
  this.renderedGridRowsCache_ = [];
  this.renderedGridRows_ = [];
  this.prepareGridRows_();
  this.setCanvasHeight_();
  this.refreshRenderRows_();
  this.bodyCanvasRender_(true);
  this.restoreHighlightedRow_()
};


/**
 * Returns the keyboard event handler for this grid, lazily created the
 * first time this method is called.  The keyboard event handler listens for
 * keyboard events on the grid canvas
 * @return {goog.events.KeyHandler} Keyboard event handler for this container.
 */
pear.ui.Grid.prototype.getKeyHandler = function() {
  return this.keyHandler_ ||
      (this.keyHandler_ = new goog.events.KeyHandler(this.getKeyEventTarget()));
};


/**
 * Sets up listening for events applicable to focusable grid.
 * @param {boolean} enable Whether to enable or disable focus handling.
 * @private
 */
pear.ui.Grid.prototype.enableFocusHandling_ = function(enable) {
  var handler = this.getHandler();
  var keyTarget = this.getKeyEventTarget();
  if (enable) {
    handler.
        listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus, false, this).
        listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur, false, this).
        listen(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
            this.handleKeyEvent, false, this);
  } else {
    handler.
        unlisten(keyTarget, goog.events.EventType.FOCUS, this.handleFocus, false, this).
        unlisten(keyTarget, goog.events.EventType.BLUR, this.handleBlur, false, this).
        unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
            this.handleKeyEvent, false, this);
  }
};

pear.ui.Grid.prototype.scrollViewIntoGridRow = function(gridrow){
  if (!this.getGridRowsCount_() && !this.getConfiguration().AllowRowSelection){
    return ;
  }
  var scrollTopBody = this.getBody().getElement().scrollTop;
  var scrollLeftBody = this.getBody().getElement().scrollLeft;
  var positionRow = goog.style.getPosition(gridrow.getElement());
  var boundBody = goog.style.getBounds(this.getBody().getElement());
  var boundRow = goog.style.getBorderBoxSize(gridrow.getElement());
  var cell = gridrow.getHighlighted() || gridrow.getChildAt(0);
  var positionCell = goog.style.getPosition(cell.getElement());
  var boundCell = goog.style.getBorderBoxSize(cell.getElement());

  if ((positionRow.y + boundRow.height ) >= (boundBody.height + scrollTopBody) ){
    scrollTopBody = positionRow.y  + boundRow.height - boundBody.height;
  }else if ((positionRow.y + boundRow.height ) <= scrollTopBody) {
    scrollTopBody = positionRow.y;
  }

  if ((positionCell.x + boundCell.width ) >= (boundBody.width + scrollLeftBody) ){
      scrollLeftBody = positionCell.x + boundCell.width -boundBody.width;
  }else if (positionCell.x  <= scrollLeftBody) {
      scrollLeftBody = positionCell.x ;
  }

  this.body_.getElement().scrollTop=scrollTopBody;
  this.body_.getElement().scrollLeft=scrollLeftBody;
};


// Key Handling - Highlight Management


/**
 * Highlighted Row
 * @return {pear.ui.GridRow?}
 */
pear.ui.Grid.prototype.getHighlightedGridRow = function() {
  return this.getGridRowsAt_(this.getHighlightedGridRowIndex());
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
pear.ui.Grid.prototype.getHighlightedGridRowIndex = function() {
  return this.highlightedGridRowIndex_ || 0;
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
pear.ui.Grid.prototype.getHighlightedCellIndex = function() {
  var gridrow =  this.getHighlightedGridRow();
  return gridrow.getHighlightedIndex();
};

/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
pear.ui.Grid.prototype.setHighlightedCellIndex = function(index) {
  var gridrow =  this.getHighlightedGridRow();
  gridrow.setHighlightedIndex(index);
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
pear.ui.Grid.prototype.getHighlightedCell = function(index) {
  var gridrow =  this.getHighlightedGridRow();
  return gridrow.getHighlighted(index);
};

/**
 * Returns the 0-based index of the given child component, or -1 if no such
 * child is found.
 * @param {goog.ui.Component?} child The child component.
 * @return {number} 0-based index of the child component; -1 if not found.
 */
pear.ui.Grid.prototype.indexOfGridRow = function(gridrow) {
  return (this.getGridRows_ && gridrow) ?
      goog.array.indexOf(this.getGridRows_(), gridrow) : -1;
};


/**
 * Highlights the item at the given 0-based index (if any).  If another item
 * was previously highlighted, it is un-highlighted.
 * @param {number} index Index of item to highlight (-1 removes the current
 *     highlight).
 */
pear.ui.Grid.prototype.setHighlightedGridRowIndex = function(index) {
  if (this.highlightedGridRowIndex_ > -1 && 
      this.highlightedGridRowIndex_ < this.getGridRowsCount_() &&
      this.getGridRowsCount_() > 0 ) {
    this.setHighlighted(this.getHighlightedGridRow(),false);
  }

  var gridRow = this.getGridRowsAt_(index);
  if (gridRow) {
    this.setHighlighted(gridRow,true);
    this.highlightedGridRowIndex_ = index;
  } 
};


/**
 * Highlights the given item if it exists and is a child of the container;
 * otherwise un-highlights the currently highlighted item.
 * @param {goog.ui.Control} item Item to highlight.
 */
pear.ui.Grid.prototype.setHighlighted = function(gridrow,highlight) {
  var evt;
  gridrow.setHighlight(highlight);
  var index = this.indexOfGridRow(gridrow);
  if (highlight){
    evt = new pear.ui.Grid.GridRowSelectEvent(pear.ui.Grid.EventType.GRIDROW_SELECT,
        this, gridrow,index);
    
  }else{
    evt = new pear.ui.Grid.GridRowSelectEvent(pear.ui.Grid.EventType.GRIDROW_UNSELECT,
        this, gridrow,index);
  }
  this.dispatchEvent(evt);
};



/**
 * Highlights the first highlightable item in the container
 */
pear.ui.Grid.prototype.highlightFirstRow = function() {
  this.highlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.getGridRowsCount_() - 1);
};


/**
 * Highlights the last highlightable item in the container.
 */
pear.ui.Grid.prototype.highlightLastRow = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, 0);
};


/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 */
pear.ui.Grid.prototype.highlightNextRow = function() {
  this.highlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.getHighlightedGridRowIndex());
};


/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 */
pear.ui.Grid.prototype.highlightPreviousRow = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? 0 : index;
  }, this.getHighlightedGridRowIndex());
};


/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 */
//pear.ui.Grid.prototype.highlightNextCell = function() {
//  this.highlightHelper(function(index, max) {
//    return (index + 1) % max;
//  }, this.getHighlightedGridRowIndex());
//};


/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 */
//pear.ui.Grid.prototype.highlightPreviousCell = function() {
//  this.highlightHelper(function(index, max) {
//    index--;
//    return index < 0 ? 0 : index;
//  }, this.getHighlightedGridRowIndex());
//};


/**
 * Helper function that manages the details of moving the highlight among
 * child controls in response to keyboard events.
 * @param {function(number, number) : number} fn Function that accepts the
 *     current and maximum indices, and returns the next index to check.
 * @param {number} startIndex Start index.
 * @return {boolean} Whether the highlight has changed.
 * @protected
 */
pear.ui.Grid.prototype.highlightHelper = function(fn, startIndex) {
  var curIndex = startIndex < 0 ? 0 : startIndex;
  var numItems = this.getGridRowsCount_();

  curIndex = fn.call(this, curIndex, numItems);
  this.currentHighligtedCellIndex_ = this.getHighlightedCellIndex();
  var visited = 0;
  while (visited <= numItems) {
    var gridrow = this.getGridRowsAt_(curIndex);
    if (gridrow && this.canHighlightItem(gridrow)) {
      this.setHighlightedIndexFromKeyEvent(curIndex);
      this.setHighlightedCellIndex(this.currentHighligtedCellIndex_);
      return true;
    }
    visited++;
    curIndex = fn.call(this, curIndex, numItems);
  }
  return false;
};


/**
 * Returns whether the given item can be highlighted.
 * @param {goog.ui.Control} item The item to check.
 * @return {boolean} Whether the item can be highlighted.
 * @protected
 */
pear.ui.Grid.prototype.canHighlightItem = function(item) {
  return item.isVisible() && item.isEnabled() ;
};


/**
 * Helper method that sets the highlighted index to the given index in response
 * to a keyboard event.  The base class implementation simply calls the
 * {@link #setHighlightedIndex} method, but subclasses can override this
 * behavior as needed.
 * @param {number} index Index of item to highlight.
 * @protected
 */
pear.ui.Grid.prototype.setHighlightedIndexFromKeyEvent = function(index) {
  this.setHighlightedGridRowIndex(index);
};


pear.ui.Grid.prototype.triggerDataRowChangeEvent_ = function(){
  var evt = new goog.events.Event(pear.ui.Grid.EventType.DATAROWS_CHANGED,
      this);
  this.dispatchEvent(evt);
};

/**
 *
 *
 */
pear.ui.Grid.prototype.registerEventsOnHeaderRow_ = function() {
  this.forEachChild(function(cell) {
    if (this.Configuration_.AllowSorting) {
      this.getHandler().
          listen(cell, pear.ui.Cell.EventType.CLICK,
          this.handleHeaderCellClick_, false, this);
    }
    this.getHandler().
        listen(cell, pear.ui.Cell.EventType.OPTION_CLICK,
        this.handleHeaderCellOptionClick_, false, this);
  }, this);
};

pear.ui.Grid.prototype.registerEventsOnDataRow_ = function(row) {
  var self = this;
  row.getHandler().
      listenWithScope(row, goog.ui.Component.EventType.ACTION,
      this.handleDataCellClick_, false, self);
};

pear.ui.Grid.prototype.registerEventsOnFooterRow_ = function() {
  var pager = this.footerRow_.getPager();
  if (pager) {
    this.getHandler().
        listen(pager, pear.ui.Pager.EventType.CHANGE, this.handlePageChange_, false, this);
  }
};

pear.ui.Grid.prototype.registerEventsOnBody_ = function() {
  // Capture Scroll Event on the Body Canvas Element for Virtualization
  this.getHandler().
      listen(this.body_.getElement(), goog.events.EventType.SCROLL,
          this.handleBodyCanvasScroll_);

  this.enableFocusHandling_(true);
};

pear.ui.Grid.prototype.registerEventsOnBodyCanvas_ = function() {
  this.enableFocusHandling_(true);
};


/**
 * @private
 * @param {goog.events.BrowserEvent} e
 */
pear.ui.Grid.prototype.handleBodyCanvasScroll_ = function(e) {
  if (this.previousScrollTop_ <= this.body_.getElement().scrollTop) {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.DOWN;
  }else {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.UP;
  }

  if (this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.DOWN ||
      this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.UP
  ) {
    this.draw_();
  }

  if (this.previousScrollLeft_ <= this.body_.getElement().scrollLeft) {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.RIGHT;
  }else {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.LEFT;
  }

  if (this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.LEFT ||
      this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.RIGHT
  ) {
    this.syncScrollOnHeaderRow_();
  }

  this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.NONE;
  this.previousScrollTop_ = this.body_.getElement().scrollTop;

  if (e) {
    e.stopPropagation();
  }
};

pear.ui.Grid.prototype.handleHeaderCellClick_ = function(ge) {
  ge.stopPropagation();

  var headerCell = ge.target;
  var grid = ge.currentTarget;
  var prevSortedCell = this.getSortedHeaderCell();

  var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.BEFORE_HEADER_CELL_CLICK,
      this, headerCell);
  this.dispatchEvent(evt);

  // On Sort
  if (this.getConfiguration().AllowSorting) {
    if (prevSortedCell && prevSortedCell !== headerCell) {
      prevSortedCell.resetSortDirection();
    }

    this.setSortColumnId(headerCell.getColumnId());
    headerCell.toggleSortDirection();

    evt = new pear.ui.Grid.GridSortCellEvent(pear.ui.Grid.EventType.SORT,
        this, headerCell);
    this.dispatchEvent(evt);
  }

  evt = new pear.ui.Grid.GridHeaderCellEvent(
        pear.ui.Grid.EventType.AFTER_HEADER_CELL_CLICK, this, headerCell);
  this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.handleHeaderCellOptionClick_ = function(ge) {
  ge.stopPropagation();
  var evt = new pear.ui.Grid.GridHeaderCellEvent(
    pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK, this, ge.target);
  this.dispatchEvent(evt);
};


pear.ui.Grid.prototype.handleDataCellClick_ = function(ge) {
  ge.stopPropagation();
  var cell = ge.target;
  var gridrow = ge.currentTarget;

  var evt = new pear.ui.Grid.GridDataCellEvent(
    pear.ui.Grid.EventType.DATACELL_BEFORE_CLICK, this, cell);
  this.dispatchEvent(evt);

  // Highlight Cell
  if (this.getConfiguration().AllowRowSelection){
    var highlightIndex = this.indexOfGridRow(gridrow);
    this.setHighlightedGridRowIndex(highlightIndex);
    gridrow.setHighlighted(cell);
  }

  evt = new pear.ui.Grid.GridDataCellEvent(
    pear.ui.Grid.EventType.DATACELL_AFTER_CLICK, this, cell);
  this.dispatchEvent(evt);
};


/**
 * Handles focus events raised when the key event target receives
 * keyboard focus.
 * @param {goog.events.BrowserEvent} e Focus event to handle.
 */
pear.ui.Grid.prototype.handleFocus = function(e) {
   logger.info('handle focus');
};


/**
 * Handles blur events raised when grid  loses keyboard focus.
 * @param {goog.events.BrowserEvent} e Blur event to handle.
 */
goog.ui.Container.prototype.handleBlur = function(e) {
  logger.info('handle blur');
};


/**
 * Handle Keyboard Events
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 */
pear.ui.Grid.prototype.handleKeyEvent = function(e) {
  if (this.isEnabled() && 
      this.getGridRowsCount_() != 0 &&
      this.getConfiguration().AllowRowSelection &&
      this.handleKeyEventInternal(e))
  {
    e.preventDefault();
    e.stopPropagation();

    this.scrollViewIntoGridRow(this.getHighlightedGridRow());
    this.draw_();
    return true;
  }
  return false;
};


/**
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 */
pear.ui.Grid.prototype.handleKeyEventInternal = function(e) {

  // Do not handle the key event if any modifier key is pressed.
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return false;
  }

  // Either nothing is highlighted, or the highlighted control didn't handle
  // the key event, so attempt to handle it here.
  switch (e.keyCode) {
    case goog.events.KeyCodes.ESC:
      if (this.isFocusable()) {
        this.getKeyEventTarget().blur();
      } else {
        return false;
      }
      break;
    case goog.events.KeyCodes.HOME:
      this.highlightFirstRow();
      break;
    case goog.events.KeyCodes.END:
      this.highlightLastRow();
      break;
    case goog.events.KeyCodes.UP:
      this.highlightPreviousRow();
      break;
    case goog.events.KeyCodes.DOWN:
      this.highlightNextRow();
      break;
    case goog.events.KeyCodes.RIGHT:
    case goog.events.KeyCodes.LEFT:
      return  this.getHighlightedGridRow().handleKeyEvent(e);
      break;
    default:
      return false;
  }
  return true;
};


/**
 * @override
 */
pear.ui.Grid.prototype.disposeInternal = function() {

  // Instance
  this.previousScrollTop_ = null;
  this.renderedGridRows_ = null;
  this.renderedGridRowsCache_ = null;

  // TODO : better dispose needs to be done
  // call dispose on each child

  for (var classId in this.plugins_) {
    var plugin = this.plugins_[classId];
    plugin.dispose();
  }
  delete(this.plugins_);

  this.headerRow_.dispose();
  this.headerRow_ = null;

  goog.array.forEach(this.getGridRows_() , function(value) {
    value.dispose();
  });
  this.gridRows_ = null;

  this.body_.dispose();
  this.body_ = null;

  this.bodyCanvas_.dispose();
  this.bodyCanvas_ = null;

  if (this.footerRow_) {
    this.footerRow_.dispose();
  }
  this.footerRow_ = null;

  if (this.dataview_) {
    this.dataview_.dispose();
  }

  this.dataTable_.dispose();
  this.dataTable_ = null;
  delete(this.dataTable_);
  /**
   * Map of class id to registered plugin.
   * @type {Object}
   * @private
   */
  this.plugins_ = {};

  this.width_ = null;
  this.height_ = null;
  this.sortColumnId_ = null;
  this.currentPageIndex_ = null;
  this.previousScrollTop_ = null;
  this.bodyScrollTriggerDirection_ = null;
  this.previousScrollLeft_ = null;

  delete(this.previousScrollTop_);
  delete(this.renderedGridRows_);
  delete(this.renderedGridRowsCache_);
  delete(this.scrollbarWidth_);

  pear.ui.Grid.superClass_.disposeInternal.call(this);
};


/**
 * Object representing GridDataCellEvent
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.GridRow} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridRowSelectEvent = function(type, target, gridrow,index) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.GridCell}
   */
  this.gridRow = gridrow;
  this.gridRowIndex = index;
};
goog.inherits(pear.ui.Grid.GridRowSelectEvent, goog.events.Event);

/**
 * Object representing GridDataCellEvent
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.GridCell} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridDataCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.GridCell}
   */
  this.cell = cell;
};
goog.inherits(pear.ui.Grid.GridDataCellEvent, goog.events.Event);



/**
 * Object representing GridHeaderCellEvent.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.GridHeaderCell} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridHeaderCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.GridHeaderCell}
   */
  this.cell = cell;
};
goog.inherits(pear.ui.Grid.GridHeaderCellEvent, goog.events.Event);



/**
 * Object representing GridHeaderCellEvent.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.GridHeaderCell} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridSortCellEvent = function(type, target, cell ) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.GridHeaderCell}
   */
  this.sortCell = cell;
  this.sortDirection = cell.getSortDirection();
};
goog.inherits(pear.ui.Grid.GridSortCellEvent, goog.events.Event);
