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

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.log');

goog.require('goog.Timer');
goog.require('pear.data.DataModel');
goog.require('pear.ui.Header');
goog.require('pear.ui.Body');
goog.require('pear.ui.BodyCanvas');
goog.require('pear.ui.DataCell');
goog.require('pear.ui.DataRow');
goog.require('pear.ui.FooterRow');
goog.require('pear.ui.HeaderCell');
goog.require('pear.ui.HeaderRow');
goog.require('pear.data.DataView');
goog.require('pear.ui.Plugin');

goog.require('pear.plugin.FooterStatus');
goog.require('pear.plugin.Pager');



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
  this.renderedDataRows_ = [];
  this.renderedDataRowsCache_ = [];
  this.scrollbarWidth_ = goog.style.getScrollbarWidth();

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
  AllowColumnHeaderMenu: false
};

pear.ui.Grid.EventType = {
  BEFORE_HEADER_CELL_CLICK: 'before-header-cell-click',
  AFTER_HEADER_CELL_CLICK: 'after-header-cell-click',
  SORT: 'on-sort',
  PAGE_CHANGED: 'on-paging',
  HEADER_CELL_MENU_CLICK: 'headercell-menu-click',
  DATACELL_BEFORE_CLICK: 'datacell-before-click',
  DATACELL_AFTER_CLICK: 'datacell-after-click',
  HEADERCELL_RENDERED: 'on-headercell-rendered'
};

/**
 * @private 
 * @type {pear.ui.HeaderRow?}
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
pear.ui.Grid.prototype.dataRows_ = null;



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
pear.ui.Grid.prototype.sortColumnId_ = null ;


/**
 * @private 
 * @type {number}
 */
pear.ui.Grid.prototype.currentPageIndex_ = null ;

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

/**
 * @return {*}
 */
pear.ui.Grid.prototype.getColumns = function() {
  var cols ;
  var dv = this.getDataView();
  cols = dv.getDataColumns();
  return cols;
};


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
 * @return {Array.<Object>}
 */
pear.ui.Grid.prototype.getDataRows = function() {
  this.dataRows_ = this.dataRows_ || [];
  return this.dataRows_;
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
  var coldata = this.getColumns();
  coldata[index]["width"] = coldata[index]["width"] || 
                            this.Configuration_.ColumnWidth;
  return coldata[index]["width"];
};

/**
 * @return {number}
 */
pear.ui.Grid.prototype.setColumnWidth = function(index,width,opt_render) {
  var coldata = this.getColumns();
  coldata[index]["width"] = width || this.Configuration_.ColumnWidth;
  var headerCell = this.headerRow_.getChildAt(index);
  if (opt_render && headerCell){
    headerCell.setCellWidth(width);
    headerCell.draw();
  }
};

/**
 *
 *
*/
pear.ui.Grid.prototype.getScrollbarWidth = function(){
  return this.scrollbarWidth_;
};


/**
 * Returns the model associated with the UI component.
 * @return {*} The model.
 */
pear.ui.Grid.prototype.getDataView = function() {
  this.dataview_ = this.dataview_ || new pear.data.DataView([],[]) ;
  return  this.dataview_;
};

pear.ui.Grid.prototype.setDataView = function(dv) {
  this.dataview_ = dv;
  dv.setGrid(this);
};


/**
 * Row Count
 * @return {number} 
 */
pear.ui.Grid.prototype.getRowCount = function() {
  return this.getDataView().getDataRowViewCount();
};

/**
 * Header Row
 * @return {pear.ui.HeaderRow?} 
 */
pear.ui.Grid.prototype.getHeaderRow = function() {
  return this.headerRow_;
};

/**
 * Header Row
 * @return {pear.ui.HeaderRow?} 
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

pear.ui.Grid.prototype.setPageIndex = function (index){
  this.getDataView().setPageIndex(index);
  this.currentPageIndex_ = this.getDataView().getPageIndex();

  this.refresh();
  var evt = new goog.events.Event(pear.ui.Grid.EventType.PAGE_CHANGED,
      this);
  this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.getPageIndex = function (){
  return this.currentPageIndex_ ;
};

pear.ui.Grid.prototype.gotoNextPage = function (){
  this.setPageIndex(this.currentPageIndex_ + 1);
  return this.currentPageIndex_ ;
};

pear.ui.Grid.prototype.gotoPreviousPage = function (){
  this.setPageIndex(this.currentPageIndex_ - 1);
  return this.currentPageIndex_ ;
};

pear.ui.Grid.prototype.gotoFirstPage = function (){
  this.setPageIndex(0);
  return this.currentPageIndex_ ;
};

pear.ui.Grid.prototype.gotoLastPage = function (){
  this.setPageIndex(parseInt(this.getRowCount()/this.getPageSize()));
  return this.currentPageIndex_ ;
};


/**
 * Header Cell on which Sort is applied
 * @return {pear.ui.HeaderCell} 
 */
pear.ui.Grid.prototype.getSortedHeaderCell = function() {
  var cell = this.headerRow_.getHeaderCellById(this.getSortColumnId());
  return cell;
};

pear.ui.Grid.prototype.setColumns = function(datacolumns) {
  var dv = this.getDataView();
  dv.setDataColumns(datacolumns);
  dv.setGrid(this);
};

/**
 * Sets the model associated with the UI component.
 * @param {pear.data.DataView} dv DataView.
 */
pear.ui.Grid.prototype.setDataSource = function(data) {
  var dv = this.getDataView();
  dv.setDataRows(data);
  dv.setGrid(this);
  if ( this.getConfiguration().AllowPaging){
    dv.setPageSize(this.getConfiguration().PageSize);
  }
};



pear.ui.Grid.prototype.setConfiguration = function(config){
  goog.object.forEach(config,function(value,key){
    this.Configuration_[key]=value;
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
 * @override
 */
pear.ui.Grid.prototype.disposeInternal = function() {

   // Instance 
  this.previousScrollTop_ = null;
  this.renderedDataRows_ = null;
  this.renderedDataRowsCache_ = null;

  // TODO : better dispose needs to be done
  // call dispose on each child

  for (var classId in this.plugins_) {
    var plugin = this.plugins_[classId];
    plugin.dispose();
  }
  delete(this.plugins_);

  this.headerRow_.dispose();
  this.headerRow_ = null;
  
  goog.array.forEach(this.getDataRows() ,function(value){
    value.dispose();
  })
  this.dataRows_ = null;

  this.body_.dispose();
  this.body_ = null;

  this.bodyCanvas_.dispose();
  this.bodyCanvas_ = null;

  if (this.footerRow_){
    this.footerRow_.dispose();
  }
  this.footerRow_ = null;

  
  this.dataview_.dispose();
  this.dataview_=null;

  this.width_ = null;
  this.height_ = null;
  this.sortColumnId_ = null;
  this.currentPageIndex_  = null;
  this.previousScrollTop_ = null;
  this.bodyScrollTriggerDirection_ = null;
  this.previousScrollLeft_ = null;

  pear.ui.Grid.superClass_.disposeInternal.call(this);
};


/**
 * @private
 */
pear.ui.Grid.prototype.renderGrid_ = function() {
  goog.style.setHeight(this.getElement(),this.height_);
  goog.style.setWidth(this.getElement(),this.width_);

  this.renderHeader_();
  this.renderBody_();
  if (this.Configuration_.AllowPaging){
    this.setPageIndex(0);
    this.getDataView().setPageSize(this.Configuration_.PageSize);
  }
  this.prepareDataRows_();
  this.setCanvasHeight_();
  //this.renderfooterRow_();
  this.syncWidth_();
  this.draw_();
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
        new pear.ui.HeaderRow(this,
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
  var columns = this.getColumns();
  goog.array.forEach(columns, function(column,index) {
    // create header cells here
    var headerCell = new pear.ui.HeaderCell();
    headerCell.setModel(column);
    headerCell.setCellIndex(index);
    this.headerRow_.addCell(headerCell, true);

    var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.HEADERCELL_RENDERED,
      this,headerCell);
    this.dispatchEvent(evt);
    
  }, this);
};

/**
 * @private
 */
pear.ui.Grid.prototype.renderfooterRow_ = function() {
  this.footerRow_ = this.footerRow_ || new pear.ui.FooterRow(this,
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
  goog.style.setHeight(this.body_.getElement(), this.height_ -  this.headerRow_.getHeight());
  goog.style.setWidth(this.body_.getElement(), this.width_);

  this.bodyCanvas_ = new pear.ui.BodyCanvas();
  this.body_.addChild(this.bodyCanvas_, true);
  
  this.setCanvasHeight_();
  
  this.registerEventsOnBody_();
};

pear.ui.Grid.prototype.setCanvasHeight_ = function(){
  var height = 0;
  var pagesize = this.getDataView().getPageSize();
  if (this.Configuration_.AllowPaging){
    height =  (this.getDataRows().length * this.Configuration_.RowHeight);
  }else{
    height =  this.getRowCount() * this.Configuration_.RowHeight;
  }
  goog.style.setHeight(this.bodyCanvas_.getElement(),height);
}


pear.ui.Grid.prototype.syncWidth_ = function(){
  var headerWidth = this.headerRow_.getWidth();
  //width = width + 10;
  var bounds = goog.style.getBounds(this.getElement());
  width = ( headerWidth > bounds.width )? headerWidth :bounds.width;
  // Take care of scrollbar width
  goog.style.setWidth(this.headerRow_.getElement(),width+this.getScrollbarWidth());
  //goog.style.setWidth(this.body_.getElement(), width);
  var canvasWidth = (headerWidth < width) ? width-this.getScrollbarWidth() : width;
  goog.style.setWidth(this.bodyCanvas_.getElement(), canvasWidth);
  //goog.style.setWidth(this.footerRow_.getElement(), width);
}


pear.ui.Grid.prototype.syncHeaderRow_ = function(){
  this.header_.getElement().scrollLeft = this.body_.getElement().scrollLeft;
}
/**
 * @private
 */
pear.ui.Grid.prototype.prepareDataRows_ = function() {
  var dv = this.getDataView();
  var rows = dv.getRowViews();
  var pagesize = dv.getPageSize();
  this.dataRows_ = [];

  goog.array.forEach(rows, function(value, index) {
    var row = new pear.ui.DataRow(this,this.Configuration_.RowHeight);
    row.setModel(value);
    row.setRowPosition(index);
    if (this.Configuration_.AllowPaging){
      row.setLocationTop( (index % pagesize) * this.Configuration_.RowHeight);
    }else{
      row.setLocationTop(index * this.Configuration_.RowHeight);
    }
    this.dataRows_.push(row);
    //can not create cells here - performance delay
  }, this);
};


/**
 * @private
 * @param {pear.ui.Row} row
 */
pear.ui.Grid.prototype.renderDataRowCells_ = function(row) {
  var model = row.getRowView();
  var dv = this.getDataView();
  var columns = this.getColumns()
  if (row.getChildCount() >0 ){
    row.removeChildren(true);
  }
  
  goog.array.forEach(columns,function (value,index){
    var c = new pear.ui.DataCell();
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
  for (var i in this.renderedDataRowsCache_) {
    if (i < start || i > end) {
      this.renderedDataRowsCache_[i].removeChildren(true);
      this.bodyCanvas_.removeChild(this.renderedDataRowsCache_[i], true);
      delete this.renderedDataRowsCache_[i];
    }
  }
};


/**
 * @private
 */
pear.ui.Grid.prototype.refreshRenderRows_ = function() {
  var rowCount = this.getRowCount();
  var canvasVisibleBeginPx = (this.body_.getElement().scrollTop > (this.Configuration_.RowHeight * 10))
                              ? (this.body_.getElement().scrollTop - (this.Configuration_.RowHeight * 10))
                              : 0;

  var size = goog.style.getSize(this.body_.getElement());
  var canvasSize = goog.style.getSize(this.bodyCanvas_.getElement());

  var modulo = canvasVisibleBeginPx % this.Configuration_.RowHeight;
  canvasVisibleBeginPx = canvasVisibleBeginPx - modulo;
  var canvasVisibleEndPx = canvasVisibleBeginPx + size.height + (this.Configuration_.RowHeight * 30);
  canvasVisibleEndPx = (canvasVisibleEndPx > canvasSize.height) ? canvasSize.height : canvasVisibleEndPx;

  var startIndex =0 ,endIndex =0 ;
  startIndex = parseInt(canvasVisibleBeginPx / this.Configuration_.RowHeight, 10);
  startIndex = (startIndex < 0) ? 0 : startIndex;

  endIndex = parseInt(canvasVisibleEndPx / this.Configuration_.RowHeight, 10);
  endIndex = ( endIndex > rowCount )? rowCount : endIndex;

  var i = 0;
  var datarows = this.getDataRows();
  for (i = startIndex; (i < endIndex && i< datarows.length); i++) {
    if (!this.renderedDataRowsCache_[i]) {
      this.renderedDataRows_[i] = this.getDataRows()[i];
    }
  }

  this.removeRowsFromRowModelCache_(startIndex, endIndex);
};

/**
 * @private
 */
pear.ui.Grid.prototype.bodyCanvasRender_ = function(opt_redraw) {
  var dv = this.getDataView();
  if (opt_redraw && this.bodyCanvas_.getChildCount() > 0){
    this.bodyCanvas_.removeChildren(true);
  }
  goog.array.forEach(this.renderedDataRows_, function(datarow, index) {
    // Render Cell on Canvas on demand for Performance
    this.renderDataRowCells_(datarow);
    this.bodyCanvas_.addChild(datarow, true);
    this.renderedDataRowsCache_[index] = datarow;
  },this);
  this.renderedDataRows_ = [];
};


pear.ui.Grid.prototype.draw_ = function (){
  this.refreshRenderRows_();
  this.bodyCanvasRender_();
};

pear.ui.Grid.prototype.refresh = function (){
  this.renderedDataRowsCache_= [];
  this.renderedDataRows_ = [];
  this.prepareDataRows_();
  this.setCanvasHeight_();
  this.refreshRenderRows_();
  this.bodyCanvasRender_(true);
};

pear.ui.Grid.prototype.setColumnResize = function (index,width){
  var cell = this.headerRow_.getChildAt(index);
  var coldata = grid.getColumns();
  var diff = width - coldata[index]["width"] ;
  this.setColumnWidth(index,coldata[index]["width"] + diff,true);

  goog.array.forEach(coldata,function(data,pos){
    if (pos>index){
      var c = this.headerRow_.getChildAt(pos);
      c.draw();
    }
  },this);

  this.syncWidth_();
};


/**
 *
 *
 */
pear.ui.Grid.prototype.registerEventsOnHeaderRow_ = function(){
  this.forEachChild(function(cell) {
    if (this.Configuration_.AllowSorting){
     this.getHandler().
      listen(cell, pear.ui.Cell.EventType.CLICK,
          this.handleHeaderCellClick_,false,this);
    }
    this.getHandler().  
      listen(cell, pear.ui.Cell.EventType.OPTION_CLICK,
          this.handleHeaderCellOptionClick_,false,this);
  }, this);
};

pear.ui.Grid.prototype.registerEventsOnDataRow_ = function(row){
  row.getHandler().
    listen(row.getElement(), goog.events.EventType.CLICK,
      this.handleDataCellClick_,false,this);

};

pear.ui.Grid.prototype.registerEventsOnFooterRow_ = function(){
  var pager = this.footerRow_.getPager();
  if (pager){
    this.getHandler().
      listen(pager,pear.ui.Pager.EventType.CHANGE,this.handlePageChange_,false,this);
  }
};

pear.ui.Grid.prototype.registerEventsOnBody_ = function(){
  // Capture Scroll Event on the Body Canvas Element for Virtualization
  this.getHandler().
      listen(this.body_.getElement(), goog.events.EventType.SCROLL,
          this.handleBodyCanvasScroll_);
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
    ){
    this.draw_();
  }

  if (this.previousScrollLeft_ <= this.body_.getElement().scrollLeft) {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.RIGHT;
  }else {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.LEFT;
  }

  if ( this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.LEFT || 
      this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.RIGHT
  ){
    this.syncHeaderRow_();
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
      this,headerCell);
  this.dispatchEvent(evt);

  // On Sort
  if ( this.getConfiguration().AllowSorting ){
    if (prevSortedCell && prevSortedCell !== headerCell){
      prevSortedCell.resetSortDirection();
    }
    
    this.setSortColumnId(headerCell.getColumnId());
    headerCell.toggleSortDirection();

    evt = new pear.ui.Grid.GridSortCellEvent(pear.ui.Grid.EventType.SORT,
        this,headerCell);
    this.dispatchEvent(evt);
  }
 
  evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.AFTER_HEADER_CELL_CLICK,
      this,headerCell);
  this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.handleHeaderCellOptionClick_ = function(ge) {
  ge.stopPropagation();
   var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK,
      this,ge.target);
  this.dispatchEvent(evt);
};


pear.ui.Grid.prototype.handleDataCellClick_ = function(be) {
  be.stopPropagation();
  var control = this.getOwnerControl(/** @type {Node} */ (be.target));
  var evt = new pear.ui.Grid.GridDataCellEvent (pear.ui.Grid.EventType.DATACELL_BEFORE_CLICK,
      this,control);
  this.dispatchEvent(evt);

  // do more

  evt = new pear.ui.Grid.GridDataCellEvent (pear.ui.Grid.EventType.DATACELL_AFTER_CLICK,
      this,control);
  this.dispatchEvent(evt);
};



/**
 * Object representing GridDataCellEvent
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.DataCell} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridDataCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.DataCell}
   */
  this.cell = cell;
};
goog.inherits(pear.ui.Grid.GridDataCellEvent, goog.events.Event);

/**
 * Object representing GridHeaderCellEvent.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.HeaderCell} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridHeaderCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.HeaderCell}
   */
  this.cell = cell;
};
goog.inherits(pear.ui.Grid.GridHeaderCellEvent, goog.events.Event);


/**
 * Object representing GridHeaderCellEvent.
 *
 * @param {string} type Event type.
 * @param {goog.ui.Control} target
 * @param {pear.ui.HeaderCell} cell
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridSortCellEvent = function(type, target, cell ) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.HeaderCell}
   */
  this.sortCell = cell;
  this.sortDirection = cell.getSortDirection();
};
goog.inherits(pear.ui.Grid.GridSortCellEvent, goog.events.Event);
