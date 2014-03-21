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
goog.require('pear.data.Column');
goog.require('pear.plugin.ColumnMove');
goog.require('pear.plugin.FilterMenu');
goog.require('pear.plugin.FooterStatus');
goog.require('pear.plugin.HeaderMenu');
goog.require('pear.plugin.Pager');
goog.require('pear.ui.Body');
goog.require('pear.ui.BodyCanvas');
goog.require('pear.ui.GridCell');
goog.require('pear.ui.GridFooterRow');
goog.require('pear.ui.GridHeaderCell');
goog.require('pear.ui.GridFooterCell');
goog.require('pear.ui.GridHeaderRow');
goog.require('pear.ui.GridRow');
goog.require('pear.ui.Header');
goog.require('pear.ui.Footer');
goog.require('pear.ui.Plugin');



/**
 * @classdesc 
 * Table/Grid built in Google Closure
 * <ul>
 *   <li> Data Virtualization ~ 100,000 Rows </li>
 *   <li> Active Cell and Active Row Highlight </li>
 *   <li> Sorting , Column Resizing , Header Cell Menu , Paging  </li>
 *   <li> Column Formatting , Keyboard Navigation , Data Filter </li>
 *   <li> Column Move </li>
 *   <li> Footer Row </li>
 * </ul>
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
	/**
	 * Map of class id to registered plugin.
	 * @type {Object.<string,pear.ui.Plugin>}
	 * @private
	 */
	this.plugins_ = {};
};
goog.inherits(pear.ui.Grid, goog.ui.Component);


/**
 * Scroll Direction of Grid
 * @enum {number}
 * @private
 */
pear.ui.Grid.ScrollDirection = {
	/** Scroll direction up */
	UP: 1,
	/** Scroll direction down */
	DOWN: 2,
	/** Scroll direction left */
	LEFT: 3,
	/** Scroll direction right */
	RIGHT: 4,
	/** Scroll direction none */
	NONE: 0
};


/**
 * Sort Direction
 * @enum {number}
 * @public
 */
pear.ui.Grid.SortDirection = {
	/** None - no sort */
	NONE: 0,
	/** Asending Order */
	ASC: 1,
	/** Desending Order */
	DESC: 2
};


/**
 * @enum {number}
 * @private
 */
pear.ui.Grid.RenderState_ = {
	/** Grid is rendering */
	RENDERING: 1,
	/** Grid finished Rendering */
	RENDERED: 2
};


/**
 * Selection Mode of Grid
 * @enum {number}
 * @public
 */
pear.ui.Grid.SelectionMode = {
	/** No Selection Mode */
	NONE: 0,
	/** Cell can be selected - CURRENTLY NOT SUPPORTED */
	CELL: 1,
	/** Single Row Selection */
	ROW: 2,
	/** Multiple Row Selection */
	MULTIPLE_ROW: 3
};


/**
 * @type {Object}
 * @private
 */
pear.ui.Grid.prototype.Configuration_ = {
	/** 
	 * Width of Grid , defaulted to 500px 
	 * @type {number} 
	 */
	Width: 500,
	/** 
	 * Height of Grid , defaulted to 600px
	 * @type {number}
	 */
	Height: 600,
	/** 
	 * RowHeight , defaulted to 25px
	 * @type {number}
	 */
	RowHeight: 25,
	/** 
	 * Header Row Height , defaulted to 30px
	 * @type {number}
	 */
	HeaderRowHeight: 30,
	/** 
	 * Footer Row Height , defaulted to 30px
	 * @type {number}
	 */
	FooterRowHeight: 30,
	/** 
	 * Default column width , if not supplied , defaulted to 125px
	 * @type {number}
	 */
	ColumnWidth: 125,
	/** 
	 * pagesize , if paging is enabled
	 * @type {number}
	 */
	PageSize: 50,
	/** 
	 * On True, Allow sorting on Grid
	 * @type {boolean}
	 */
	AllowSorting: false,
	/** 
	 * On True, Allow paging on Grid
	 * @type {boolean}
	 */
	AllowPaging: false,
	/** 
	 * On True, Allow Column Resize
	 * @type {boolean}
	 */
	AllowColumnResize: false,
	/** 
	 * On True, Allow sliding header menu
	 * @type {boolean}
	 */
	AllowColumnHeaderMenu: false,
	/** 
	 * On True, Allow Alternate color highlighting
	 * @type {boolean}
	 */
	AllowAlternateRowHighlight: false,
	/** 
	 * Selection Mode , Default is NONE
	 * @type {pear.ui.Grid.SelectionMode}
	 */
	SelectionMode: pear.ui.Grid.SelectionMode.NONE
};


/**
 * Events of grid
 * @enum {string}
 */
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
	DATAROWS_CHANGED: 'on-grid-datarows-changed',
	DATASOURCE_CHANGED: 'on-grid-datasource-changed',
	COLUMNS_CHANGED: 'on-columns-changed',
	GRIDROW_HIGHLIGHT: 'on-gridrow-highlighted',
	GRIDROW_UNHIGHLIGHT: 'on-gridrow-unhighlighted',
	GRIDROW_SELECT: 'on-gridrow-select',
	GRIDROW_UNSELECT: 'on-gridrow-unselect',
	RENDERED: 'rendered',
	HEADER_CELL_MENU_CLICK: 'header-cell-menu-click'
};


/**
 * header row instance
 * @private
 * @type {pear.ui.GridHeaderRow?}
 */
pear.ui.Grid.prototype.headerRow_ = null;


/**
 * body of grid
 * @private
 * @type {pear.ui.Body?}
 */
pear.ui.Grid.prototype.body_ = null;

/**
 * Body Canvas 
 * @type {pear.ui.BodyCanvas?}
 * @private
 */
pear.ui.Grid.prototype.bodyCanvas_ = null;


/**
 * gridrows , which are currently loaded in grid
 * @private
 * @type {Array.<pear.ui.GridRow>?}
 */
pear.ui.Grid.prototype.gridRows_ = null;


/**
 * width of grid
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.width_ = 0;


/**
 * height of grid , inclusive of header and footer row
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.height_ = 0;


/**
 * index of column , where sort is performed
 * @private
 * @type {string}
 */
pear.ui.Grid.prototype.sortColumnId_ = '';


/**
 * page index
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.currentPageIndex_ = -1;


/**
 * highligted row index
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.highlightedGridRowIndex_ = -1;


/**
 * highlighted cell index
 * @private
 * @type {number}
 */
pear.ui.Grid.prototype.highligtedCellIndex_ = -1;


/**
 * selected grid rows id
 * @private
 * @type {Array?}
 */
pear.ui.Grid.prototype.selectedGridRowsIds_ = null;

/**
 * flag to show footer row
 * @private
 * @type { boolean }
 */
pear.ui.Grid.prototype.showFooter_ = false;


/**
 * Logging object.
 * @type {goog.log.Logger}
 * @protected
 */
pear.ui.Grid.prototype.logger =
		goog.log.getLogger('pear.ui.Grid');


/**
 * configuration object of grid
 * @return {*}
 * @public
 */
pear.ui.Grid.prototype.getConfiguration = function() {
	return this.Configuration_;
};

var logger = goog.log.getLogger('demo');


/**
 * @return {pear.ui.Body}
 * @public
 */
pear.ui.Grid.prototype.getBody = function() {
	return this.body_;
};


/**
 * @return {pear.ui.BodyCanvas}
 * @public
 */
pear.ui.Grid.prototype.getBodyCanvas = function() {
	return this.bodyCanvas_
};

/**
 * Total count of gridrows. The number of rows currently grid has loaded
 * if paging is included that total rows
 * @return {number}
 * @private
 */
pear.ui.Grid.prototype.getGridRowsCount_ = function() {
	this.gridRows_ = this.gridRows_ || [];
	return this.gridRows_.length;
};


/**
 * All gridrows visible in Grid , in case of paging this should show all
 * available in all pages
 * @return {Array.<pear.ui.GridRow>}
 * @public
 */
pear.ui.Grid.prototype.getGridRows = function() {
	this.gridRows_ = this.gridRows_ || [];
	return this.gridRows_;
};


/**
 * Get a gridrow at position
 * @return {pear.ui.GridRow}
 * @public
 */
pear.ui.Grid.prototype.getGridRowAt = function(index) {
	return this.gridRows_[index];
};


/**
 * set Grid Rows
 * @param {Array.<pear.ui.GridRow>} rows
 * @private
 */
pear.ui.Grid.prototype.setGridRows_ = function(rows) {
	this.gridRows_ = rows || [];
};


/**
 * add a single row
 * @param {pear.ui.GridRow} row
 * @private
 */
pear.ui.Grid.prototype.addGridRows_ = function(row) {
	this.gridRows_.push(row);

};


/**
 * is Grid is rendered ?
 * @return {boolean}
 * @public
 */
pear.ui.Grid.prototype.isRendered = function() {
	return this.renderState_ == pear.ui.Grid.RenderState_.RENDERED;
};


/**
 * Get a list of all plugins currently loaded by the grid
 * @return {Object.<string,pear.ui.Plugin>}
 * @public
 */
pear.ui.Grid.prototype.getPlugins = function() {
	this.plugins_ = this.plugins_ || [];
	return this.plugins_;
};


/**
 * Returns the registered plugin with the given classId.
 * @param {string} classId classId of the plugin.
 * @return {pear.ui.Plugin} Registered plugin with the given classId.
 * @public
 */
pear.ui.Grid.prototype.getPluginByClassId = function(classId) {
	return this.plugins_[classId];
};


/**
 * width of grid
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getWidth = function() {
	this.width_ = this.width_ || this.Configuration_.Width;
	return this.width_;
};


/**
 * height of grid
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getHeight = function() {
	this.height_ = this.height_ || this.Configuration_.Height;
	return this.height_;
};


/**
 * set width of grid
 * @param {number} width
 * @public
 */
pear.ui.Grid.prototype.setWidth = function(width) {
	return this.width_ = width;
};


/**
 * set height of grid
 * @param {number} height
 * @public
 */
pear.ui.Grid.prototype.setHeight = function(height) {
	return this.height_ = height;
};


/**
 * get width of column
 * @param {number} [index] Column Index
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getColumnWidthAt = function(index) {
	var coldata = this.getColumns_();
	coldata[index]['width'] = coldata[index]['width'] ||
			this.Configuration_.ColumnWidth;
	return coldata[index]['width'];
};


/**
 * apply the width on column
 * @param {number} index
 * @param {number} width
 * @param {boolean}  opt_render if true ,render it now
 * @private
 */
pear.ui.Grid.prototype.applyColumnWidth_ = function(index, width, opt_render) {
	var coldata = this.getColumns_();
	coldata[index]['width'] = width || this.Configuration_.ColumnWidth;
	var headerCell = this.headerRow_.getChildAt(index);
	if (opt_render && headerCell) {
		headerCell.updateSizeAndPosition();
	}
};


/**
 * Set the width of column , this will instantly apply the changes
 * @param {number} index
 * @param {number} width
 * @public
 */
pear.ui.Grid.prototype.setColumnWidth = function(index, width) {
	var coldata = this.getColumns_();
	var diff = width - coldata[index]['width'];
	this.applyColumnWidth_(index, coldata[index]['width'] + diff, true);

	this.updateWidthOfHeaderRow_();
	this.adjustWidthOfCanvas_();
};


/**
 * Returns the width of scrollbar , if browser uses scrollbar
 * @return {number}
 */
pear.ui.Grid.prototype.getScrollbarWidth = function() {
	return this.scrollbarWidth_;
};


/**
 * DataView associated with this Grid. All data is encapsulated with in DataView
 * DataView also acts like a Adapter between DataTable and Grid
 * @return {pear.data.DataView}
 * @public
 */
pear.ui.Grid.prototype.getDataView = function() {
	this.dataview_ = this.dataview_ || new pear.data.DataView([], []);
	return this.dataview_;
};


/**
 * DataView associated with this Grid. All data is encapsulated with in DataView
 * DataView also acts like a Adapter between DataTable and Grid.
 * @param {pear.data.DataView} dv
 * @public
 */
pear.ui.Grid.prototype.setDataView = function(dv) {
	this.dataview_ = dv;
	dv.setGrid(this);
};


/**
 * clone array of columns and return them
 * @return {Array.<pear.data.Column>}
 * @public
 */
pear.ui.Grid.prototype.getColumns = function() {
	var cols = this.dataview_.getColumns();
	var columns = [];
	goog.array.forEach(cols, function(c) {
		var clone = goog.object.clone(c);
		columns.push(clone);
	});
	return columns;
};

/**
 * Get column by id
 * @param  {string} id [description]
 * @return {?pear.data.Column}
 * @public
 */
pear.ui.Grid.prototype.getColumnById = function(id) {
	var columns = this.getColumns_();
  goog.array.forEach(columns,function(col){
    if (col.getId()=== id){
      return col;
    }
  });
  return null;
};

/**
 * clone array of columns and return them
 * @return {Array.<pear.data.Column>} 
 * @private
 */
pear.ui.Grid.prototype.getColumns_ = function() {
	var cols = this.dataview_.getColumns();
	return cols;
};


/**
 * set columns of grid , dispatch COLUMN_CHANGED event
 * @param {Array.<pear.data.Column>} cols
 * @public
 */
pear.ui.Grid.prototype.setColumns = function(cols) {
	var columns = [];

	goog.array.forEach(cols, function(c) {
		var clone = goog.object.clone(c);
		columns.push(clone);
	});
	this.getDataView().setColumns(columns);

	var evt = new goog.events.Event(pear.ui.Grid.EventType.COLUMNS_CHANGED,
			this);
	this.dispatchEvent(evt);
};


/**
 * array of datarows - dispatches DATASOURCE_CHANGE event
 * @param {Array} data
 * @public
 */
pear.ui.Grid.prototype.setDataRows = function(data) {
	this.getDataView().setDataRows(goog.array.clone(data));
	this.dispatchDataSourceChangeEvent_();
};


/**
 * get rows , currently dispalyed or loaded in grid , in case of paging
 * this will return all the rows
 * @return {Array}
 * @public
 */
pear.ui.Grid.prototype.getDisplayDataRows = function(data) {
	var rows = goog.array.clone(this.getDataView().getDataRowViews());
	return rows;
};


/**
 * get all rows
 * @return {Array}
 * @public
 */
pear.ui.Grid.prototype.getDataRows = function(data) {
	var rows = goog.array.clone(this.getDataView().getDataRows());
	return rows;
};


/**
 * get all rows
 * @return {Array.<pear.data.RowView>}
 * @public
 */
pear.ui.Grid.prototype.getDataRowViews = function() {
	var rows = this.dataview_.getDataRowViews();
	return rows;
};


/**
 * number of rows currently loaded in grid
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getDataViewRowCount = function() {
	return this.getDataRowViews().length;
};


/**
 * Get All data rows , in case of paging enabled get all rows at current
 * page index
 * @return {Array.<pear.data.RowView>}
 * @private
 */
pear.ui.Grid.prototype.getDataRowsGrid_ = function() {
	var rows = (this.getConfiguration().AllowPaging) ?
			this.getPagedDataRowViews() :
			this.getDataRowViews();
	return rows;
};


/**
 * Get all datarow views for current page index
 * @private
 * @return {Array.<pear.data.RowView>}
 */
pear.ui.Grid.prototype.getPagedDataRowViews = function() {
	var pgIdx = this.getPageIndex();
	var pgSize = this.getPageSize();
	var dataRows = this.getDataRowViews();
	var start = (pgIdx * pgSize) > dataRows.length ? dataRows.length : (pgIdx * pgSize);
	var end = (start + pgSize) > dataRows.length ? dataRows.length : (start + pgSize);
	var rows = dataRows.slice(start, end);

	return rows;

};

/**
 * Show Footer Row
 * @param  {boolean} display true : shows footer row\
 * @public
 */
pear.ui.Grid.prototype.showFooterRow = function(display) {
	this.showFooter_ = true;
};

/**
 * add a single row , this dispatch DATAROW_CHANGE and DATASOURCE_CHANGE
 * event. this will also dispatch events from DataView
 * @public
 * @param {Array} datarow
 */
pear.ui.Grid.prototype.addDataRow = function(datarow) {
	this.getDataView().addDataRow(datarow);
	// assume there is undefined row - hence adding row means undefined to
	// defined row
	this.dispatchDataRowChangeEvent_();
	this.dispatchDataSourceChangeEvent_();
	this.refresh();
};


/**
 * remove a single row , this dispatch a DATASOURCE_CHANGE
 * event. this will also dispatch events from DataView
 * @public
 * @param {string} rowid
 */
pear.ui.Grid.prototype.removeDataRow = function(rowid) {
	this.dataview_.removeDataRow(rowid);
	this.dispatchDataSourceChangeEvent_();
};


/**
 * update a datarow , this dispatch a DATAROW_CHANGE
 * event. this will also dispatch events from DataView
 * @public
 * @param {string} rowid
 * @param {Array} row
 */
pear.ui.Grid.prototype.updateDataRow = function(rowid, row) {
	this.dataview_.updateDataRow(rowid, row);
	this.dispatchDataRowChangeEvent_();
};


/**
 * Header Row
 * @return {pear.ui.GridHeaderRow?}
 * @public
 */
pear.ui.Grid.prototype.getHeaderRow = function() {
	return this.headerRow_;
};


/**
 * Header Row
 * @return {pear.ui.GridHeaderRow?}
 * @public
 */
pear.ui.Grid.prototype.getFooterRow = function() {
	return this.footerRow_;
};


/**
 * Get the column Index on which sort is applied
 * @return {string}
 * @public
 */
pear.ui.Grid.prototype.getSortColumnId = function() {
	return this.sortColumnId_;
};


/**
 * set Sorted Column Index
 * @param {string}  id
 * @public
 */
pear.ui.Grid.prototype.setSortColumnId = function(id) {
	return this.sortColumnId_ = id;
};


/**
 * Get the page size configuration
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getPageSize = function() {
	return this.getConfiguration().PageSize;
};


/**
 * Set the current page index of grid , Also dispatches PageIndex Change Event
 * @param {number} index
 * @public
 */
pear.ui.Grid.prototype.setPageIndex = function(index) {
	if (index === this.currentPageIndex_ ||
			index < 0 ||
			index > this.getMaxPageIndex()) {
		return;
	}
	this.currentPageIndex_ = index;

	this.refresh();
	var evt = new goog.events.Event(pear.ui.Grid.EventType.PAGE_INDEX_CHANGED,
			this);
	this.dispatchEvent(evt);
};


/**
 * get the Max Page Index
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getMaxPageIndex = function() {
	var max = Math.ceil(this.getDataViewRowCount() / this.getPageSize());
	return --max;
};


/**
 * Get the current page index of grid
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getPageIndex = function() {
	return this.currentPageIndex_;
};


/**
 * Goto Next Page
 * @public
 */
pear.ui.Grid.prototype.gotoNextPage = function() {
	this.setPageIndex(this.currentPageIndex_ + 1);
	return this.currentPageIndex_;
};


/**
 * Goto Previous Page
 * @public
 */
pear.ui.Grid.prototype.gotoPreviousPage = function() {
	this.setPageIndex(this.currentPageIndex_ - 1);
	return this.currentPageIndex_;
};


/**
 * Goto First Page
 * @public
 */
pear.ui.Grid.prototype.gotoFirstPage = function() {
	this.setPageIndex(0);
	return this.currentPageIndex_;
};


/**
 * Goto Last Page
 * @public
 */
pear.ui.Grid.prototype.gotoLastPage = function() {
	this.setPageIndex(parseInt(
											this.getDataViewRowCount() / this.getPageSize(), 10));
	return this.currentPageIndex_;
};


/**
 * get Header Cell on which Sort is applied
 * @return {pear.ui.GridHeaderCell}
 * @public
 */
pear.ui.Grid.prototype.getSortedHeaderCell = function() {
	var cell = this.headerRow_.getHeaderCellById(this.getSortColumnId());
	return cell;
};


/**
 * get current highlighted Row
 * @return {pear.ui.GridRow}
 * @public
 */
pear.ui.Grid.prototype.getCurrentHighlightedRow = function() {
	var row = this.getGridRowAt(this.highlightedGridRowIndex_);
	return row;
};


/**
 * get current highlighted Cell
 * @return {pear.ui.GridCell}
 * @public
 */
pear.ui.Grid.prototype.getCurrentHighlightedCell = function() {
	var cell = ( /** @type {pear.ui.GridCell} */ (this.getCurrentHighlightedRow().
										getHighlighted()));
	return cell;
};


/**
 * get Selected Rows Ids
 * @return {Array.<string>}
 * @public
 */
pear.ui.Grid.prototype.getSelectedGridRowsIds = function() {
	var rows = this.selectedGridRowsIds_ || [];
	return rows;
};


/**
 * Clear all row selection , also raises ROW-UNSELECT event for each
 * row , getting unselected
 * @public
 */
pear.ui.Grid.prototype.clearSelectedGridRows = function() {
	this.getDataView().clearSelectedRowViews();
	goog.array.forEach(this.getSelectedGridRowsIds(), function(id) {
		var gridrow = this.getGridRowById(id);
		if (gridrow){
			gridrow.setSelect(false);
		}
		this.dispatchGridRowUnselectEvent_(gridrow);
	},this);
	this.selectedGridRowsIds_ = [];
};


/**
 * Set configuration object
 * @param {Object} config
 * @public
 */
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
 * @param {pear.ui.Plugin} plugin The plugin to unregister.
 */
pear.ui.Grid.prototype.unregisterPlugin = function(plugin) {
	var classId = plugin.getClassId();
	if (!this.plugins_[classId]) {
		goog.log.error(this.logger,
				'Cannot unregister a plugin that isn\'t registered.');
	}
	delete this.plugins_[classId];
};


/**
 *  @return {boolean} true always
 */
pear.ui.Grid.prototype.isEnabled = function() {
	return true;
};


/**
 *  @return {boolean} true always
 */
pear.ui.Grid.prototype.isVisible = function() {
	return true;
};


/**
 *
 * kick off the DOM creation for Grid
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
 * Render Grid 
 * Sets Height and Width of Grid , render header row
 * then prepare Grid Body and Set Canvas Height 
 * Transform datasource/dataview to GridRows
 * Draw all the GridRows - based on position of ScrollTop of Canvas
 * Restore selectedRows and Highlighted Rows
 * @private
 */
pear.ui.Grid.prototype.renderGrid_ = function() {
	goog.style.setHeight(this.getElement(), this.height_);
	goog.style.setWidth(this.getElement(), this.width_);

	this.renderHeader_();

	// Render Body and BodyCanvas -  Set the Height of Canvas
	this.renderBody_();
	this.renderBodyCanvas_();

	if (this.showFooter_){
		this.renderFooter_();
	}

	this.setBodySize_();

	this.transformDataRowsToGridRows_();
	if (this.Configuration_.AllowPaging) {
		this.setPageIndex(0);
	}
	this.updateBodyCanvasHeight_();
	this.updateWidthOfHeaderRow_();
	this.adjustWidthOfCanvas_();
	this.updateViewport_();
	this.restoreHighlightedRow_();
	this.restoreSelectedRows_();
	this.dispatchGridRenderedEvent_();
};


/**
 *
 * Render grid header Container
 * @private
 */
pear.ui.Grid.prototype.renderHeader_ = function() {
	this.header_ = new pear.ui.Header();
	this.addChild(this.header_, true);
	goog.style.setWidth(this.header_.getElement(), this.width_);


	this.createSingleRowHeader_();
	this.registerEventsOnHeaderRow_();

	goog.style.setWidth(this.headerRow_.getElement(),
			this.headerRow_.getWidth());
};


/**
 *
 * Render grid single row grid header
 * @private
 */
pear.ui.Grid.prototype.createSingleRowHeader_ = function() {
	this.headerRow_ = this.headerRow_ ||
			new pear.ui.GridHeaderRow(this,
			this.Configuration_.HeaderRowHeight);
	this.header_.addChild(this.headerRow_, true);
	this.headerRow_.setHeight(this.Configuration_.HeaderRowHeight);
	goog.style.setHeight(this.headerRow_.getElement(),
			this.Configuration_.HeaderRowHeight);

	// render header
	this.createHeaderCells_();
};


/**
 *
 * Render grid header row cells
 * @private
 */
pear.ui.Grid.prototype.createHeaderCells_ = function() {
	var columns = this.getColumns_();
	goog.array.forEach(columns, function(column, index) {
		// create header cells here
		var headerCell = new pear.ui.GridHeaderCell();
		headerCell.setDataColumn(column);
		headerCell.setCellIndex(index);
		this.headerRow_.addCell(headerCell, true);
		var evt = new pear.ui.Grid.GridHeaderCellEvent(
										pear.ui.Grid.EventType.AFTER_HEADERCELL_RENDER,
										this, 
										headerCell);
		this.dispatchEvent(evt);
	}, this);

	var evt = new goog.events.Event(
									pear.ui.Grid.EventType.HEADERCELLS_RENDERED,
									this);
	this.dispatchEvent(evt);
};


/**
 *
 * Render footer row
 * @private
 */
pear.ui.Grid.prototype.renderFooter_ = function() {
	this.footer_ = new pear.ui.Footer();
	this.addChild(this.footer_, true);
	goog.style.setWidth(this.footer_.getElement(), this.width_);
	this.createFooterRow_();
};

/**
 * Create Footer Row 
 * @private
 */
pear.ui.Grid.prototype.createFooterRow_ = function() {
	this.footerRow_ = this.footerRow_ || new pear.ui.GridFooterRow(this,
			this.Configuration_.FooterRowHeight);
	this.footer_.addChild(this.footerRow_, true);
	goog.style.setWidth(this.footerRow_.getElement(), this.width_);

	this.createFooterCells_();
};

/**
 * Create Footer Cells 
 * @private
 */
pear.ui.Grid.prototype.createFooterCells_ = function() {
	var columns = this.getColumns_();
	goog.array.forEach(columns, function(column, index) {
		// Create Footer Cells
		var footerCell = new pear.ui.GridFooterCell();
		footerCell.setDataColumn(column);
		footerCell.setCellIndex(index);
		this.footerRow_.addCell(footerCell, true);
	}, this);
};


/**
 * get the height of Body
 * @return {number} [description]
 */
pear.ui.Grid.prototype.calculateBodyHeight_ = function(){
	var bodyHeight = this.height_;
	bodyHeight = bodyHeight- this.headerRow_.getHeight();

	if (this.showFooter_){
		bodyHeight = bodyHeight - this.footerRow_.getHeight();
	}

	return bodyHeight;
};


/**
 * get the height of Body
 * @return {number} [description]
 */
pear.ui.Grid.prototype.setBodySize_ = function(){
	goog.style.setHeight(this.body_.getElement(), this.calculateBodyHeight_());
	goog.style.setWidth(this.body_.getElement(), this.width_);
};


/**
 * Render body of grid
 * @private
 */
pear.ui.Grid.prototype.renderBody_ = function() {
	this.body_ = new pear.ui.Body();
	this.addChild(this.body_, true);
  
	this.registerEventsOnBody_();
};


/**
 * Render body Canvas
 * @private
 */
pear.ui.Grid.prototype.renderBodyCanvas_ = function() {
	this.bodyCanvas_ = new pear.ui.BodyCanvas();
	this.body_.addChild(this.bodyCanvas_, true);

	this.registerEventsOnBodyCanvas_();
};



/**
 * Set height of Body Canvas
 * @private
 */
pear.ui.Grid.prototype.updateBodyCanvasHeight_ = function() {
	var height = 0;
	var pagesize = this.getPageSize();
	if (this.Configuration_.AllowPaging) {
		height = (this.getGridRowsCount_() * this.Configuration_.RowHeight);
	}else {
		height = this.getDataViewRowCount() * this.Configuration_.RowHeight;
	}
	goog.style.setHeight(this.bodyCanvas_.getElement(), height);
};


/**
 * update width of header Row
 * @private
 */
pear.ui.Grid.prototype.updateWidthOfHeaderRow_ = function() {
	var rowWidth = 0;
	this.headerRow_.forEachChild(function(headerCell) {
		rowWidth = rowWidth + goog.style.getSize(headerCell.getElement()).width;
	});
	goog.style.setWidth(this.headerRow_.getElement(), rowWidth);
};

/**
 * update width of footer Row
 * @private
 */
pear.ui.Grid.prototype.updateWidthOfFooterRow_ = function() {
	var rowWidth = 0;
	this.footerRow_.forEachChild(function(footerCell) {
		rowWidth = rowWidth + goog.style.getSize(footerCell.getElement()).width;
	});
	goog.style.setWidth(this.footerRow_.getElement(), rowWidth);
};

/**
 * Adjust width of Canvas - take account of Scrollbar Width
 * @private
 */
pear.ui.Grid.prototype.adjustWidthOfCanvas_ = function() {
	var headerWidth = goog.style.getSize(this.headerRow_.getElement()).width;
	var bounds = goog.style.getSize(this.getElement());
	var width = (headerWidth > bounds.width) ? headerWidth : bounds.width;
	// Take care of scrollbar width
	goog.style.setWidth(this.headerRow_.getElement(), width + this.getScrollbarWidth());
	var canvasWidth = (headerWidth < width) ? width - this.getScrollbarWidth() : width;
	goog.style.setWidth(this.bodyCanvas_.getElement(), canvasWidth);
};

/**
 * Adjust Scrollbar Width on - Width of Footer and Header Row
 * @private
 */
pear.ui.Grid.prototype.adjustScrollbarWidthOnFooter_ = function() {
	var footerWidth = goog.style.getSize(this.footerRow_.getElement()).width;
	var bounds = goog.style.getSize(this.getElement());
	var width = (footerWidth > bounds.width) ? footerWidth : bounds.width;
	// Take care of scrollbar width
	goog.style.setWidth(this.footerRow_.getElement(), width + this.getScrollbarWidth());
};


/**
 * get Scrollleft of Body
 * @return {number} [description]
 */
pear.ui.Grid.prototype.getScrollLeftOfBody_ = function() { 
	return  (/** @type {number} */ (this.body_.getElement().scrollLeft));
};

/**
 * Set ScrollLeft on Header
 * @param  {number} scrollLeft 
 * @private
 */
pear.ui.Grid.prototype.setScrollOnHeaderRow_ = function(scrollLeft) {
	this.header_.getElement().scrollLeft = scrollLeft ;//this.body_.getElement().scrollLeft;
};

/**
 * Set Scrolleft on Footer
 * @param  {number} scrollLeft [description]
 * @private
 */
pear.ui.Grid.prototype.setScrollOnFooterRow_ = function(scrollLeft) {
	this.footer_.getElement().scrollLeft = scrollLeft; 
};


/**
 * Set Scrolleft on Footer
 * @param  {number} scrollLeft [description]
 * @private
 */
pear.ui.Grid.prototype.syncScrollLeft_ = function() {
	var scrollLeft = this.getScrollLeftOfBody_();
	this.setScrollOnHeaderRow_(scrollLeft);
	if ( this. showFooter_){
		this.setScrollOnFooterRow_(scrollLeft);
	}
};

/**
 * Key Event Target
 * @private
 */
pear.ui.Grid.prototype.getKeyEventTarget = function() {
	return this.getElement();
};


/**
 * Transform Data-RowView to GridRows
 * @private
 */
pear.ui.Grid.prototype.transformDataRowsToGridRows_ = function() {
	var rows = this.getDataRowsGrid_();
	var pagesize = this.getPageSize();

	this.setGridRows_([]);

	goog.array.forEach(rows, function(rowview, index) {
		var row = new pear.ui.GridRow(this, this.Configuration_.RowHeight);
		row.setDataRowView(rowview);
		row.setHeight(this.Configuration_.RowHeight)
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


/**
 * Restore the highlighted row
 * @private
 */
pear.ui.Grid.prototype.restoreHighlightedRow_ = function() {
	// restore highlighted row
	if (this.highlightedGridRowIndex_ > -1 &&
			this.highlightedGridRowIndex_ < this.getGridRowsCount_() &&
			this.getGridRowsCount_() > 0) {
		var gridrow = this.getGridRowAt(this.highlightedGridRowIndex_);
		gridrow.setHighlight(true);
		gridrow.getElement().focus();
	}
};


/**
 * Restore all selected rows
 * @private
 */
pear.ui.Grid.prototype.restoreSelectedRows_ = function() {
	// restore highlighted row
	var rows = this.getSelectedGridRowsIds();
	goog.array.forEach(rows, function(id) {
		var gridrow = this.getGridRowById(id);
		if (gridrow ){ 
			gridrow.setSelect(true) ;
		} 
	},this);
};


/**
 * render the GridRow cells
 * @private
 * @param {pear.ui.Row} row
 */
pear.ui.Grid.prototype.renderDataRowCells_ = function(row) {
	var rowview = row.getDataRowView();
	var model = rowview.getRowData();
	var columns = this.getColumns_();
	if (row.getChildCount() > 0) {
		row.removeChildren(true);
	}

	goog.array.forEach(columns, function(datacolumn, index) {
		var c = new pear.ui.GridCell();
		c.setDataColumn(datacolumn);
		c.setCellData(model[datacolumn.getId()]);
		c.setCellIndex(index);

		if (this.getConfiguration().SelectionMode ===
				 pear.ui.Grid.SelectionMode.NONE){
			c.setSupportedState(goog.ui.Component.State.HOVER, false);
		}

		row.addCell(c, true);
	},this);
	this.registerEventsOnGridRow_(row);
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
 * Calculatre Viewport Area and then Cache GridRows to be rendered , in ViewPort.
 * @private
 */
pear.ui.Grid.prototype.cacheGridRowsReadyForViewport_ = function() {
	var rowCount = this.getDataViewRowCount();
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
	var gridrows = this.getGridRows();
	for (i = startIndex; (i < endIndex && i < gridrows.length); i++) {
		if (!this.renderedGridRowsCache_[i]) {
			this.renderedGridRows_[i] = this.getGridRowAt(i);
		}
	}
	this.removeRowsFromRowModelCache_(startIndex, endIndex);
};

/**
 * Render Cached GridRows for Viewport in BodyCanvas Element 
 * @param  {boolean=} opt_redraw [description]
 * @private
 */
pear.ui.Grid.prototype.renderCachedGridRowsInBodyCanvas_ = function(opt_redraw) {

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

/**
 * Reposition each GridRow cells
 * @private
 */
pear.ui.Grid.prototype.updateWidthOfGridRows = function(){
	goog.array.forEach(this.gridRows_, function(gridrow) {
		if (gridrow.isInDocument()){
			gridrow.repositionCells();
			gridrow.setPosition();
		}
	},this);
};


/**
 * update width of each Footer Row Cells
 * @private
 */
pear.ui.Grid.prototype.updateWidthOfFooterRow = function(){
	this.footerRow_.repositionCells();
	this.footerRow_.setPosition();
};


/**
 * update the Viewable area of the Body Canvas element
 * @private
 */
pear.ui.Grid.prototype.updateViewport_ = function() {
	this.cacheGridRowsReadyForViewport_();
	this.renderCachedGridRowsInBodyCanvas_();
	this.restoreHighlightedRow_();
	this.restoreSelectedRows_();
};


/**
 * refresh header row
 * 
 */
pear.ui.Grid.prototype.refreshHeader = function() {
	this.headerRow_.removeChildren(true);
	this.createHeaderCells_();
};


/**
 * refresh footer row
 * 
 */
pear.ui.Grid.prototype.refreshFooterRow = function() {
	this.footerRow_.removeChildren(true);
	this.createFooterCells_();
};


/**
 * On columns width changed
 * @private
 */
pear.ui.Grid.prototype.refreshOnColumnResize = function() {
	this.updateWidthOfGridRows();
	if (this.showFooter_){
		this.updateWidthOfFooterRow();
		this.adjustScrollbarWidthOnFooter_();
	}
};

/**
 * refresh grid , technically complete repaint
 * Clear the Rendered Grid Row Cache , Clear the Rendered Grid
 * Prepare Grid Rows from the DataSource
 * Set the height of canvas and cache Rendered Rows
 * Restore Highlight Rows and Restore Selected Rows
 *
 */
pear.ui.Grid.prototype.refresh = function() {
	this.renderedGridRowsCache_ = [];
	this.renderedGridRows_ = [];
	this.transformDataRowsToGridRows_();
	this.updateBodyCanvasHeight_();
	this.cacheGridRowsReadyForViewport_();
	this.renderCachedGridRowsInBodyCanvas_(true);
	this.restoreHighlightedRow_();
	this.restoreSelectedRows_();
};


/**
 * bring gridrow in to view if hiding and bring the active cell into the view
 * @param {pear.ui.GridRow} gridrow
 */
pear.ui.Grid.prototype.scrollViewIntoGridRow = function(gridrow) {
	if (!this.getGridRowsCount_() /*&& !this.getConfiguration().AllowRowSelection*/
	) {
		return;
	}
	var scrollTopBody = this.getBody().getElement().scrollTop;
	var scrollLeftBody = this.getBody().getElement().scrollLeft;
	var positionRow = goog.style.getPosition(gridrow.getElement());
	var boundBody = goog.style.getBounds(this.getBody().getElement());
	var boundRow = goog.style.getBorderBoxSize(gridrow.getElement());
	var cell = gridrow.getHighlighted() || gridrow.getChildAt(0);
	var positionCell = goog.style.getPosition(cell.getElement());
	var boundCell = goog.style.getBorderBoxSize(cell.getElement());

	if ((positionRow.y + boundRow.height) >= (boundBody.height + scrollTopBody)) {
		scrollTopBody = positionRow.y + boundRow.height - boundBody.height;
	}else if ((positionRow.y + boundRow.height) <= scrollTopBody) {
		scrollTopBody = positionRow.y;
	}

	if ((positionCell.x + boundCell.width) >= (boundBody.width + scrollLeftBody)) {
		scrollLeftBody = positionCell.x + boundCell.width - boundBody.width;
	}else if (positionCell.x <= scrollLeftBody) {
		scrollLeftBody = positionCell.x;
	}

	this.body_.getElement().scrollTop = scrollTopBody;
	this.body_.getElement().scrollLeft = scrollLeftBody;
};

// Row Selection


/**
 * Select highlighted GridRow
 */
pear.ui.Grid.prototype.selectGridRow = function() {
	var gridrow = this.getHighlightedGridRow();

	if (gridrow.isSelected()) {
		if (this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.ROW) {
			this.clearSelectedGridRows();
		}
		if (this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.MULTIPLE_ROW) {
			gridrow.setSelect(false);
			this.dispatchGridRowUnselectEvent_(gridrow);
		}
	}else {
		if (this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.ROW) {
			this.clearSelectedGridRows();
		}
		var rowview = ( /** @type {pear.data.RowView} */(gridrow.getModel()));
		this.getDataView().selectRowView(rowview,true);
		gridrow.setSelect(true);

		this.selectedGridRowsIds_ = this.selectedGridRowsIds_ || [];
		this.selectedGridRowsIds_.push(gridrow.getId());

		this.dispatchGridRowSelectEvent_(gridrow);
	}
};

// Key Handling - Highlight Management


/**
 * Highlighted Row
 * @return {pear.ui.GridRow?}
 */
pear.ui.Grid.prototype.getHighlightedGridRow = function() {
	return this.getGridRowAt(this.getHighlightedGridRowIndex());
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
	var gridrow = this.getHighlightedGridRow();
	return gridrow.getHighlightedIndex();
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @param {number} index of the currently highlighted item.
 */
pear.ui.Grid.prototype.setHighlightedCellIndex = function(index) {
	var gridrow = (/** @type {goog.ui.Container} */
									(this.getHighlightedGridRow()));
	gridrow.setHighlightedIndex(index);
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @param {number} index of the currently highlighted item.
 * @return {pear.ui.GridCell}
 */
pear.ui.Grid.prototype.getHighlightedCell = function(index) {
	var gridrow = this.getHighlightedGridRow();
	return  (/** @type {pear.ui.GridCell} */ (gridrow.getHighlighted()));
};


/**
 * Returns the 0-based index of the given gridrow
 * @param {pear.ui.GridRow} gridrow
 * @return {number} 0-based index of gridrow; -1 if not found.
 */
pear.ui.Grid.prototype.indexOfGridRow = function(gridrow) {
	return (this.getGridRows && gridrow) ?
			goog.array.indexOf(this.getGridRows(), gridrow) : -1;
};


/**
 * Returns the 0-based index of the given child component, or -1 if no such
 * child is found.
 * @param {string} id
 * @return {pear.ui.GridRow} gridrow
 */
pear.ui.Grid.prototype.getGridRowById = function(id) {
	return (/** @type {pear.ui.GridRow} */ (this.bodyCanvas_.getChild(id)));
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
			this.getGridRowsCount_() > 0) {
		this.setHighlighted(this.getHighlightedGridRow(), false);
	}

	var gridRow = this.getGridRowAt(index);
	if (gridRow) {
		this.setHighlighted(gridRow, true);
		this.highlightedGridRowIndex_ = index;
	}else{
		this.highlightedGridRowIndex_ = index;
	}
};

pear.ui.Grid.prototype.setHighlightedGridRow = function(gridrow) {
	var highlightIndex = this.indexOfGridRow(gridrow);
	this.setHighlightedGridRowIndex(highlightIndex);
};


/**
 * Highlights the given item if it exists and is a child of the container;
 * otherwise un-highlights the currently highlighted item.
 * @param {pear.ui.GridRow} gridrow Item to highlight.
 * @param {boolean} highlight
 */
pear.ui.Grid.prototype.setHighlighted = function(gridrow, highlight) {
	var evt;
	gridrow.setHighlight(highlight);
	var index = this.indexOfGridRow(gridrow);
	if (highlight) {
		evt = new pear.ui.Grid.GridRowEvent(pear.ui.Grid.EventType.GRIDROW_HIGHLIGHT,
				this, gridrow, index);

	}else {
		evt = new pear.ui.Grid.GridRowEvent(pear.ui.Grid.EventType.GRIDROW_UNHIGHLIGHT,
				this, gridrow, index);
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
	this.highligtedCellIndex_ = this.getHighlightedCellIndex();
	var visited = 0;
	while (visited <= numItems) {
		var gridrow = this.getGridRowAt(curIndex);
		if (gridrow && this.canHighlightGridRow(gridrow)) {
			this.setHighlightedIndexFromKeyEvent(curIndex);
			this.setHighlightedCellIndex(this.highligtedCellIndex_);
			return true;
		}
		visited++;
		curIndex = fn.call(this, curIndex, numItems);
	}
	return false;
};


/**
 * Returns whether the given gridrow can be highlighted.
 * @param {pear.ui.GridRow} gridrow The item to check.
 * @return {boolean} Whether the item can be highlighted.
 * @public
 */
pear.ui.Grid.prototype.canHighlightGridRow = function(gridrow) {
	return gridrow.isVisible() && gridrow.isEnabled();
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



pear.ui.Grid.prototype.dispatchGridRowSelectEvent_ = function(gridrow) {
	var index = this.indexOfGridRow(gridrow);
	var evt = new pear.ui.Grid.GridRowEvent(pear.ui.Grid.EventType.GRIDROW_SELECT,
			this, gridrow, index);
	this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.dispatchGridRowUnselectEvent_ = function(gridrow) {
	var index = this.indexOfGridRow(gridrow);
	var evt = new pear.ui.Grid.GridRowEvent(
			pear.ui.Grid.EventType.GRIDROW_UNSELECT, this, gridrow, index);
	this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.dispatchDataRowChangeEvent_ = function() {
	var evt = new goog.events.Event(pear.ui.Grid.EventType.DATAROWS_CHANGED,
			this);
	this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.dispatchDataSourceChangeEvent_ = function() {
	var evt = new goog.events.Event(pear.ui.Grid.EventType.DATASOURCE_CHANGED,
			this);
	this.dispatchEvent(evt);
};

pear.ui.Grid.prototype.dispatchGridRenderedEvent_ = function() {
	var evt = new goog.events.Event(pear.ui.Grid.EventType.RENDERED,
			this);
	this.dispatchEvent(evt);
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
				listenWithScope(keyTarget,
					goog.events.EventType.FOCUS, this.handleFocus, false, this).
				listenWithScope(keyTarget,
					goog.events.EventType.BLUR, this.handleBlur, false, this).
				listenWithScope(this.getKeyHandler(),
					goog.events.KeyHandler.EventType.KEY,
						this.handleKeyEvent, false, this);
	} else {
		handler.
				unlisten(keyTarget,
					goog.events.EventType.FOCUS, this.handleFocus, false, this).
				unlisten(keyTarget,
					goog.events.EventType.BLUR, this.handleBlur, false, this).
				unlisten(this.getKeyHandler(),
					goog.events.KeyHandler.EventType.KEY,
						this.handleKeyEvent, false, this);
	}
};


/**
 * Sets up listening for events applicable to focusable grid.
 * @param {boolean} enable Whether to enable or disable focus handling.
 * @private
 */
pear.ui.Grid.prototype.enableGridRowMouseHandling_ = function(enable) {
	var handler = this.getHandler();
	var keyTarget = this.bodyCanvas_;
	if (enable) {
		handler.
				listenWithScope(keyTarget, goog.ui.Component.EventType.ENTER,
								this.handleCanvasMouseEnter_,
							 	false,
							 	this).
				listenWithScope(keyTarget,
								goog.ui.Component.EventType.LEAVE,
								this.handleCanvasMouseLeave_,
								false,
								this);
	} else {
		handler.
				unlisten(keyTarget,
									goog.ui.Component.EventType.ENTER,
									this.handleCanvasMouseEnter_,
									false,
									this).
				unlisten(keyTarget,
									goog.ui.Component.EventType.LEAVE,
									this.handleCanvasMouseLeave_,
									false,
									this);
	}
};


/**
 *
 *
 */
pear.ui.Grid.prototype.registerEventsOnHeaderRow_ = function() {
	this.forEachChild(function(cell) {
		if (this.Configuration_.AllowSorting) {
			this.getHandler().
					listenWithScope(cell, pear.ui.Cell.EventType.CLICK,
					this.handleHeaderCellClick_, false, this);
		}
		this.getHandler().
				listenWithScope(cell, pear.ui.Cell.EventType.OPTION_CLICK,
				this.handleHeaderCellOptionClick_, false, this);
	}, this);
};

pear.ui.Grid.prototype.registerEventsOnGridRow_ = function(row) {
	var self = this;
	row.getHandler().
			listenWithScope(row, goog.ui.Component.EventType.ACTION,
			this.handleDataCellClick_, false, self);
	if ( this.getConfiguration().SelectionMode !==
				 pear.ui.Grid.SelectionMode.NONE){
		row.getHandler().
			listenWithScope(row, goog.ui.Component.EventType.ENTER,
			this.handleGridRowMouseOver_, false, self).
			listenWithScope(row, goog.ui.Component.EventType.LEAVE,
			this.handleGridRowMouseOut_, false, self);
	}
			
};

/*pear.ui.Grid.prototype.registerEventsOnFooterRow_ = function() {
	var pager = this.footerRow_.getPager();
	if (pager) {
		this.getHandler().
				listen(pager, pear.ui.Pager.EventType.CHANGE, this.handlePageChange_, false, this);
	}
};*/

pear.ui.Grid.prototype.registerEventsOnBody_ = function() {
	// Capture Scroll Event on the Body Canvas Element for Virtualization
	this.getHandler().
			listen(this.body_.getElement(), goog.events.EventType.SCROLL,
					this.handleBodyCanvasScroll_);
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
		this.updateViewport_();
	}

	if (this.previousScrollLeft_ <= this.body_.getElement().scrollLeft) {
		this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.RIGHT;
	}else {
		this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.LEFT;
	}

	if (this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.LEFT ||
			this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.RIGHT
	) {
		this.syncScrollLeft_();
	}

	this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.NONE;
	this.previousScrollTop_ = this.body_.getElement().scrollTop;

	if (e) {
		e.stopPropagation();
	}
};

/**
 * [handleHeaderCellClick_ description]
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.ui.Grid.prototype.handleHeaderCellClick_ = function(ge) {
	ge.stopPropagation();

	var headerCell = ( /** @type {pear.ui.GridHeaderCell} */ (ge.target));
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

/**
 * [handleHeaderCellOptionClick_ description]
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.ui.Grid.prototype.handleHeaderCellOptionClick_ = function(ge) {
	ge.stopPropagation();
	var headerCell = ( /** @type {pear.ui.GridHeaderCell} */ (ge.target));
	var evt = new pear.ui.Grid.GridHeaderCellEvent(
			pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK, this, headerCell);
	this.dispatchEvent(evt);
};

/**
 * [handleDataCellClick_ description]
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.ui.Grid.prototype.handleDataCellClick_ = function(ge) {
	ge.stopPropagation();
	var cell = ( /** @type {pear.ui.GridCell} */(ge.target));
	var gridrow = ge.currentTarget;

	var evt = new pear.ui.Grid.GridDataCellEvent(
			pear.ui.Grid.EventType.DATACELL_BEFORE_CLICK, this, cell);
	this.dispatchEvent(evt);

	// Select Row or Cell - depend on Selection Mode
	if (this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.MULTIPLE_ROW ||
					this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.ROW) {
		this.selectGridRow();
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
	console.dir(e);
};


/**
 * Handles blur events raised when grid  loses keyboard focus.
 * @param {goog.events.BrowserEvent} e Blur event to handle.
 */
pear.ui.Grid.prototype.handleBlur = function(e) {
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
			this.handleKeyEventInternal(e))
	{
		e.preventDefault();
		e.stopPropagation();

		this.scrollViewIntoGridRow(this.getHighlightedGridRow());
		this.updateViewport_();
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

	if ( this.getConfiguration().SelectionMode ===
									 pear.ui.Grid.SelectionMode.NONE){
		return false;
	}


	// Do not handle the key event if any modifier key is pressed.
	if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
		return false;
	}

	// Either nothing is highlighted, or the highlighted control didn't handle
	// the key event, so attempt to handle it here.
	switch (e.keyCode) {
		case goog.events.KeyCodes.ESC:
			/*if (this.isFocusable()) {
				this.getKeyEventTarget().blur();
			} else {
				return false;
			}*/
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
			return this.getHighlightedGridRow().handleKeyEvent(e);
			break;
		case goog.events.KeyCodes.ENTER:
			if (this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.MULTIPLE_ROW ||
					this.getConfiguration().SelectionMode
						=== pear.ui.Grid.SelectionMode.ROW) {
				this.selectGridRow();
			}
			break;
		default:
			return false;
	}
	return true;
};


/**
 * @param {goog.events.Event} ge
 * @private
 */
pear.ui.Grid.prototype.handleCanvasMouseEnter_ = function(ge) {
	console.dir(ge);
};


/**
 * @param {goog.events.Event} ge
 * @private
 */
pear.ui.Grid.prototype.handleCanvasMouseLeave_ = function(ge) {
	console.dir(ge);
};


/**
 * @param {goog.events.Event} ge
 * @private
 */
pear.ui.Grid.prototype.handleGridRowMouseOver_ = function(ge) {
	var cell = ( /** @type {pear.ui.GridCell} */(ge.target));
	var gridrow = cell.getParent();
	this.setHighlightedGridRow(gridrow);
};


/**
 * @param {goog.events.Event} ge
 * @private
 */
pear.ui.Grid.prototype.handleGridRowMouseOut_ = function(ge) {
	this.setHighlightedGridRowIndex(-1);
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

	if(this.headerRow_){
		this.headerRow_.dispose();
	}
	
	this.headerRow_ = null;

	goog.array.forEach(this.getGridRows() , function(value) {
		value.dispose();
	});
	this.gridRows_ = null;

	if (this.body_){
		this.body_.dispose();
	}
	this.body_ = null;

	if (this.bodyCanvas_){
		this.bodyCanvas_.dispose();
	}
	this.bodyCanvas_ = null;

	if (this.footerRow_) {
		this.footerRow_.dispose();
	}
	this.footerRow_ = null;

	if (this.dataview_) {
		this.dataview_.dispose();
	}

	/**
	 * Map of class id to registered plugin.
	 * @type {Object}
	 * @private
	 */
	this.plugins_ = {};

	delete this.width_;
	delete this.height_;
	delete this.sortColumnId_;
	delete this.currentPageIndex_;
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
 * Object representing GridRowEvent
 *
 * @param {string} type Event type.
 * @param {pear.ui.Grid} target
 * @param {pear.ui.GridRow} gridrow
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
pear.ui.Grid.GridRowEvent = function(type, target, gridrow, index) {
	goog.events.Event.call(this, type, target);

	/**
	 * @type {pear.ui.GridRow}
	 */
	this.gridRow = gridrow;
	this.gridRowIndex = index;
};
goog.inherits(pear.ui.Grid.GridRowEvent, goog.events.Event);



/**
 * Object representing GridDataCellEvent
 *
 * @param {string} type Event type.
 * @param {pear.ui.Grid} target
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
 * @param {pear.ui.Grid} target
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
 * @param {pear.ui.Grid} target
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
