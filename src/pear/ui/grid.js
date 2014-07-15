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
goog.provide('pear.ui.Grid.GridRowEvent');
goog.provide('pear.ui.Grid.GridSortCellEvent');


goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.async.Throttle');
goog.require('goog.cssom');
goog.require('goog.cssom.CssRuleType');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.log');
goog.require('goog.object');
goog.require('pear.data.Column');
goog.require('pear.data.DataTable');
goog.require('pear.data.DataView');
goog.require('pear.ui.Footer');
goog.require('pear.ui.GridCell');
goog.require('pear.ui.GridFooterCell');
goog.require('pear.ui.GridFooterRow');
goog.require('pear.ui.GridHeaderCell');
goog.require('pear.ui.GridHeaderRow');
goog.require('pear.ui.GridRow');
goog.require('pear.ui.Header');
goog.require('pear.ui.Plugin');
goog.require('pear.ui.editor.CellEditorMediator');
goog.require('pear.ui.editor.IEditor');



/**
 * @classdesc
 * Table/Grid built in Google Closure
 * <ul>
 *   <li> Data Virtualization ~ 100,000 Rows </li>
 *   <li> Active Cell and Active Row Highlight , Row Selection</li>
 *   <li> Sorting , Column Resizing , Header Cell Menu , Paging  </li>
 *   <li> Column Formatting , Keyboard Navigation , Data Filter </li>
 *   <li> Column Move </li>
 *   <li> Sticky Footer Row </li>
 *   <li> Cell Editing </li>
 * </ul>
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Grid = function(opt_domHelper) {
  goog.ui.Component.call(this);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();

  /**
   * @type {number?}
   * @private
   */
  this.previousScrollTop_ = 0;
  /**
   * @type {Array.<pear.ui.GridRow>}
   * @private
   */
  this.renderReadyGridRows_ = [];
  /**
   * @type {Array.<pear.ui.GridRow>}
   * @private
   */
  this.renderedGridRowsCache_ = [];
  /**
   * @type {number}
   * @private
   */
  this.scrollbarWidth_ = goog.style.getScrollbarWidth();
  /**
   * Map of class id to registered plugin.
   * @type {Object.<string,pear.ui.Plugin>?}
   * @private
   */
  this.plugins_ = {};

  /**
   * Width of Frozen Columns
   * @type {number}
   * @private
   */
  this.frozenColumnsWidth_ = 0;

  /**
   * Frozen column Index , upto this index all columns will be frozen
   * @type {number}
   * @private
   */
  this.frozenColumnsIndex_ = -1;

  this.highligtedGridrow_ = {
    rowIndex: -1,
    cellIndex: -1
  };

  this.activeGridRow_ = {};
  this.initConfiguration_();
};
goog.inherits(pear.ui.Grid, goog.ui.Component);


/**
 * Scroll Direction of Grid
 * @enum {number}
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
  /** Cell can be selected */
  CELL: 1,
  /** Single Row Selection */
  ROW: 2,
  /** Multiple Row Selection */
  MULTIPLE_ROW: 3
};


/**
 * Events of grid
 * @enum {string}
 */
pear.ui.Grid.EventType = {
  /**
   * On Click of Header Cell , this event is dispatched
   * @type {string}
   */
  HEADER_CELL_ON_CLICK: 'header-cell-on-click',

  /**
   * On Header Cell Menu Option Click - this event is dispatched , this will
   * not dispatch Header-cell-on-click event
   * @type {string}
   */
  HEADER_CELL_MENU_CLICK: 'header-cell-menu-click',

  /**
   * If Sorting is allowed , On Click of Header Cell this event is dispatched
   * before Header-cell-on-click
   * @type {string}
   */
  SORT: 'on-sort',

  /**
   * If Paging is allowed , On Change of Page Index this event is dispatched
   * @type {string}
   */
  PAGE_INDEX_CHANGED: 'on-page-index-change',

  /**
   * If Paging is allowed , On Change of Page Size this event is dispatched ,
   * this will also dispatch Page-index-change . since page size reset
   * page index to 0
   * @type {string}
   */
  PAGE_SIZE_CHANGED: 'on-page-size-change',

  /**
   * On action of Data Cell
   * @type {string}
   */
  DATACELL_ON_ACTION: 'datacell-on-action',

  /**
   * This event is dispatched after all header cells are rendered
   * @type {string}
   */
  HEADERCELLS_RENDERED: 'headercells-rendered',

  /**
   * This event is dispatched ,after header cell is rendered. This will be
   * generated for each header cell
   * @type {string}
   */
  AFTER_HEADERCELL_RENDER: 'after-headercell-render',

  /**
   * This event is dispatched when a DataRow is Changed e.g AddDataRow and
   * UpdateDataRow . This will also dispatch DataSource-changed event.
   * @type {string}
   */
  DATAROWS_CHANGED: 'on-grid-datarows-changed',

  /**
   * This event is dispatched when DataSource is Changed
   * @type {string}
   */
  DATASOURCE_CHANGED: 'on-grid-datasource-changed',

  /**
   * This event is dispatched when Columns are Changed on the Grid
   * @type {string}
   */
  COLUMNS_CHANGED: 'on-columns-changed',

  /**
   * This event is dispatched On GridRow Highlight
   * @type {string}
   */
  GRIDROW_HIGHLIGHT: 'on-gridrow-highlighted',

  /**
   * This event is dispatched On GridRow unhighlight
   * @type {string}
   */
  GRIDROW_UNHIGHLIGHT: 'on-gridrow-unhighlighted',

  /**
   * If Row Selection is allowed , this event is dispatched when Row is
   * selected
   * @type {string}
   */
  GRIDROW_SELECT: 'on-gridrow-select',

  /**
   * If Row Selection is allowed , this event is dispatched when Row is
   * unselected
   * @type {string}
   */
  GRIDROW_UNSELECT: 'on-gridrow-unselect',
  /**
   * @todo - yet to define
   * @type {string}
   */
  RENDERED: 'rendered',

  /**
   * On Resizing columns
   * @type {string}
   */
  ON_COLUMN_RESIZE: 'on-column-resize'


};


/**
 * Throttle Delay in ms
 * @type {number}
 */
pear.ui.Grid.THROTTLE_DELAY = 25;


/**
 * header row instance
 * @private
 * @type {pear.ui.GridHeaderRow?}
 */
pear.ui.Grid.prototype.headerRow_ = null;


/**
 * body of grid
 * @private
 * @type {goog.ui.Component?}
 */
pear.ui.Grid.prototype.viewport_ = null;


/**
 * Body Canvas
 * @type {goog.ui.Component?}
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
pear.ui.Grid.prototype.currentPageIndex_ = 0;


/**
 * Highlighted GridRow Index and Cell Index
 * @struct
 * @private
 */
pear.ui.Grid.prototype.highligtedGridrow_;


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
 * Active Editor - there can only be one
 * @private
 * @type { pear.ui.editor.CellEditorMediator }
 */
pear.ui.Grid.prototype.editorMediator_ = null;


/**
 * cachedDataRowViews
 * @type {Array.<Object.<string,*>>}
 * @private
 */
pear.ui.Grid.prototype.cachedDataRowsViews_ = null;


/**
 * GridRow Details Height
 * @type {number}
 * @private
 */
pear.ui.Grid.prototype.gridrowDetailsHeight_ = -1;


/**
 * title of Grid
 * @type {string}
 * @private
 */
pear.ui.Grid.prototype.title_ = '';


/**
 * Configuration
 * @type {Object.<string,*>}
 * @private
 */
pear.ui.Grid.prototype.Configuration_ = null;


/**
 * Active GridRow - for showing GridRowDetails
 * @type {Object.<string,pear.ui.GridRow>}
 * @private
 */
pear.ui.Grid.prototype.activeGridRow_;


/**
 * Init Configuration
 * @private
 */
pear.ui.Grid.prototype.initConfiguration_ = function() {
  this.Configuration_ = {
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
     * On True, Each Cell will be shown with Border
     * @type {boolean}
     */
    ShowCellBorder: true,

    /**
     * Selection Mode , Default is NONE
     * @type {pear.ui.Grid.SelectionMode}
     */
    SelectionMode: pear.ui.Grid.SelectionMode.NONE
  };
};


/**
 * Logging object.
 * @type {goog.log.Logger}
 * @protected
 */
pear.ui.Grid.prototype.logger =
    goog.log.getLogger('pear.ui.Grid');


/**
 * set Title of Grid
 * @param {string} title title of grid
 */
pear.ui.Grid.prototype.setTitle = function(title) {
  this.title_ = title;
};


/**
 * Get Grid Title
 * @return {string} title of grid
 */
pear.ui.Grid.prototype.getTitle = function() {
  return this.title_;
};


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
 * @return {goog.ui.Component}
 * @public
 */
pear.ui.Grid.prototype.getViewport = function() {
  return this.viewport_;
};


/**
 * Body Canvas
 * @return {goog.ui.Component}
 * @public
 */
pear.ui.Grid.prototype.getBodyCanvas = function() {
  return this.bodyCanvas_;
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
 * @param  {number} index
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
 * @return {number} Width of Grid
 * @public
 */
pear.ui.Grid.prototype.setWidth = function(width) {
  return this.width_ = width;
};


/**
 * set height of grid
 * @param {number} height
 * @return {number}  height of grid
 * @public
 */
pear.ui.Grid.prototype.setHeight = function(height) {
  return this.height_ = height;
};


/**
 * get width of column
 * @param {number} index Column Index
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.getColumnWidthAt = function(index) {
  var coldata = this.getColumns_();
  coldata[index].setWidth(coldata[index].getWidth() ||
      this.Configuration_.ColumnWidth);
  return coldata[index].getWidth();
};


/**
 * apply the width on column
 * @param {number} index
 * @param {number} width
 * @param {boolean=}  opt_render if true ,render it now
 * @private
 */
pear.ui.Grid.prototype.applyColumnWidth_ = function(index, width, opt_render) {
  var coldata = this.getColumns_();
  coldata[index].setWidth(width || this.Configuration_.ColumnWidth);
  // var headerCell = this.headerRow_.getChildAt(index);
  // if (opt_render && headerCell) {
  //  headerCell.updateSizeAndPosition();
  // }
};


/**
 * Set the width of column , this will instantly apply the changes
 * @param {number} index
 * @param {number} width
 * @public
 */
pear.ui.Grid.prototype.setColumnWidth = function(index, width) {
  var coldata = this.getColumns_();
  var diff = width - coldata[index].getWidth();
  this.applyColumnWidth_(index, coldata[index].getWidth() + diff, true);
};


/**
 * Returns the width of scrollbar , if browser uses scrollbar
 * @return {number}
 */
pear.ui.Grid.prototype.getScrollbarWidth = function() {
  return this.scrollbarWidth_;
};


/**
 * Get Cell Border Box , this will create a Cell in Document
 * and will store the value of BorderBox and then remove the cell from document
 * @param  {string} uniqClass unique css class for this instance of pear grid
 * @return {goog.math.Box}
 */
pear.ui.Grid.prototype.getCellBorderBox = function(uniqClass) {
  if (!this.cellBorderBox_) {
    var outerDiv = goog.dom.createElement('div');
    outerDiv.className = uniqClass;
    outerDiv.style.cssText = 'overflow:auto;' +
        'position:absolute;top:0;width:100px;height:100px';
    var innerDiv = goog.dom.createElement('div');
    innerDiv.className = pear.ui.Cell.CSS_CLASS;
    goog.style.setSize(innerDiv, '200px', '200px');
    outerDiv.appendChild(innerDiv);
    goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);

    this.cellBorderBox_ = goog.style.getBorderBox(innerDiv);
    goog.dom.removeNode(outerDiv);
  }

  return this.cellBorderBox_;
};


/**
 * Get Cell Content Padding Box , this will create a temporary Cell Content
 * in Document  will store the value of PaddingBox and then remove the Element
 * @param  {string} uniqClass unique css class for this instance of pear grid
 * @return {goog.math.Box}
 * TODO : store the border box also - Cell Content shows border on Hover
 */
pear.ui.Grid.prototype.getCellContentPaddingBox = function(uniqClass) {
  if (!this.contentCellPaddingBox_) {
    var outerDiv = goog.dom.createElement('div');
    outerDiv.className = uniqClass;
    outerDiv.style.cssText = 'overflow:auto;' +
        'position:absolute;top:0;width:30px;height:30px';

    // Cell
    var innerDiv = goog.dom.createElement('div');
    goog.dom.classes.add(innerDiv, pear.ui.Cell.CSS_CLASS);
    goog.dom.classes.add(innerDiv, pear.ui.GridCell.CSS_CLASS);
    goog.style.setSize(innerDiv, '25px', '25px');
    outerDiv.appendChild(innerDiv);
    goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);

    // Cell Content
    var cellContentDiv = goog.dom.createElement('div');
    goog.dom.classes.add(cellContentDiv,
        pear.ui.GridCell.CSS_CLASS + '-content');
    goog.style.setSize(innerDiv, '20px', '20px');
    innerDiv.appendChild(cellContentDiv);
    goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);

    this.contentCellPaddingBox_ = goog.style.getPaddingBox(cellContentDiv);
    goog.dom.removeNode(outerDiv);
  }

  return this.contentCellPaddingBox_;
};


/**
 * DataView associated with this Grid. All data is encapsulated
 * with in DataView DataView also acts like a Adapter between
 * DataTable and Grid
 * @return {pear.data.DataView}
 * @public
 */
pear.ui.Grid.prototype.getDataView = function() {
  if (!this.dataview_) {
    this.dataview_ = new pear.data.DataView([], []);
    this.dataview_.setGrid(this);
  }

  return this.dataview_;
};


/**
 * DataView associated with this Grid. All data is encapsulated with
 * in DataView
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
  var cols = this.getColumns_();
  var columns = [];
  goog.array.forEach(cols, function(c) {
    var clone = goog.object.clone(c);
    columns.push(clone);
  });
  return columns;
};


/**
 * Get column by id
 * @param  {string} id UniqueId to identify a Column
 * @return {?pear.data.Column}
 * @public
 */
pear.ui.Grid.prototype.getColumnById = function(id) {
  var columns = this.getColumns_();
  var col = goog.array.find(columns, function(col) {
    if (col.getId() === id) {
      return true;
    }
    return false;
  });
  return col;
};


/**
 * Reference to All Columns
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

  this.dispatchGridEvent_(pear.ui.Grid.EventType.COLUMNS_CHANGED);
};


/**
 * array of datarows - dispatches DATASOURCE_CHANGE event
 * @param {Array} data
 * @public
 */
pear.ui.Grid.prototype.setDataRows = function(data) {
  this.getDataView().setDataRows(data);
  this.dispatchGridEvent_(pear.ui.Grid.EventType.DATASOURCE_CHANGED);
};


/**
 * Get All DataRows - for cloned Rows use getClonedDataRows
 * @return {Array.<Object.<string,*>>}
 * @public
 */
pear.ui.Grid.prototype.getDataRows = function() {
  var rows = this.getDataView().getDataRows();
  return rows;
};


/**
 * Get All DataRows
 * @return {Array.<Object.<string,*>>}
 * @public
 * @todo  - use of deep cloning
 */
pear.ui.Grid.prototype.getClonedDataRows = function() {
  var rows = this.getDataView().getDataRows();
  var cloneRows = [];
  goog.array.forEach(rows, function(rowdata, index) {
    cloneRows[index] = goog.object.clone(rowdata);
  });
  return cloneRows;
};


/**
 * get rows , currently dispalyed or loaded in grid , in case of paging
 * this will return all the rows
 * @return {Array.<Object.<string,*>>}
 * @public
 */
pear.ui.Grid.prototype.getClonedDataViews = function() {
  var rows = this.getDataView().getDataRowViews();
  var cloneRows = [];
  goog.array.forEach(rows, function(rv, index) {
    cloneRows.push(goog.object.clone(rv.getRowData()));
  });
  return cloneRows;
};


/**
 * Get All RowViews
 * @return {Array.<pear.data.RowView>}
 * @public
 */
pear.ui.Grid.prototype.getDataRowViews = function() {
  // TODO : add IsChanged in DataView
  if (this.getDataView().isDatasourceChanged() || !this.cachedDataRowsViews_) {
    this.cachedDataRowsViews_ = this.getDataView().getDataRowViews();
  }
  return this.cachedDataRowsViews_;
};


/**
 * Get All data rows , in case of paging enabled get all rows at current
 * page index. For Internal Use only
 * @return {Array.<pear.data.RowView>}
 * @private
 */
pear.ui.Grid.prototype.getDataRowViewsForViewport_ = function() {
  var rows = (this.getConfiguration().AllowPaging) ?
      this.getPagedDataRowViews() :
      this.getDataRowViews();
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
 * Get all datarow views for current page index
 * @return {Array.<pear.data.RowView>}
 */
pear.ui.Grid.prototype.getPagedDataRowViews = function() {
  var pgIdx = this.getPageIndex();
  var pgSize = this.getPageSize();
  var dataRows = this.getDataRowViews();
  var start = (pgIdx * pgSize) > dataRows.length ?
      dataRows.length : (pgIdx * pgSize);
  var end = (start + pgSize) > dataRows.length ?
                dataRows.length : (start + pgSize);
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
 * add a single row , this dispatch DATAROW_CHANGE and DATASOURCE_CHANGED
 * event. this will also dispatch events from DataView
 * @public
 * @param {Object.<string,*>} datarow
 * @example
 *  var data = {};
    data.columnId =  'sample data';
      ...
      ...
      ...
    grid.addDataRow(data);
    ...
    ...
    grid.refresh();
 */
pear.ui.Grid.prototype.addDataRow = function(datarow) {
  this.getDataView().addDataRow(datarow);
  this.dispatchGridEvent_(pear.ui.Grid.EventType.DATAROWS_CHANGED);
  this.dispatchGridEvent_(pear.ui.Grid.EventType.DATASOURCE_CHANGED);
  this.refreshBody_();
};


/**
 * remove a single row , this dispatch a DATASOURCE_CHANGE
 * event. this will also dispatch events from DataView
 * @public
 * @param {string} rowid
 */
pear.ui.Grid.prototype.removeDataRow = function(rowid) {
  this.dataview_.removeDataRow(rowid);
  this.dispatchGridEvent_(pear.ui.Grid.EventType.DATASOURCE_CHANGED);
};


/**
 * update a datarow , this dispatch a DATAROW_CHANGE
 * event. this will also dispatch events from DataView
 * @public
 * @param {string} rowid
 * @param {Object.<string,*>} row
 */
pear.ui.Grid.prototype.updateDataRow = function(rowid, row) {
  this.dataview_.updateDataRow(rowid, row);
  this.dispatchGridEvent_(pear.ui.Grid.EventType.DATAROWS_CHANGED);
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
 * set Sorted Column Id
 * @param {string}  id
 * @return {string} column id
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
 * Set the page size configuration
 * @param {number} size
 * @public
 * @fires {pear.ui.Grid.EventType.PAGE_SIZE_CHANGED}
 */
pear.ui.Grid.prototype.setPageSize = function(size) {
  // Reset Canvas Size
  this.bodyCanvasSize_ = null;
  this.getConfiguration().PageSize = size;
  if (this.currentPageIndex_ === 0) {
    this.refreshBody_();
  }else {
    this.setPageIndex(0);
  }
  var evt = new goog.events.Event(pear.ui.Grid.EventType.PAGE_SIZE_CHANGED,
      this);
  this.dispatchEvent(evt);
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
    this.refreshBody_();
    return;
  }
  this.currentPageIndex_ = index;

  this.refreshBody_();
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
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.gotoNextPage = function() {
  this.setPageIndex(this.currentPageIndex_ + 1);
  return this.currentPageIndex_;
};


/**
 * Goto Previous Page
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.gotoPreviousPage = function() {
  this.setPageIndex(this.currentPageIndex_ - 1);
  return this.currentPageIndex_;
};


/**
 * Goto First Page
 * @return {number}
 * @public
 */
pear.ui.Grid.prototype.gotoFirstPage = function() {
  this.setPageIndex(0);
  return this.currentPageIndex_;
};


/**
 * Goto Last Page
 * @return {number}
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
  var cell = this.headerRow_.getHeaderCellByColumnId(this.getSortColumnId());
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
  goog.array.forEach(this.getSelectedGridRowsIds(), function(id) {
    var gridrow = this.getGridRowById(id);
    if (gridrow) {
      gridrow.setSelect(false);
      var rowview = ( /** @type {pear.data.RowView} */(gridrow.getModel()));
      this.getDataView().selectRowView(rowview, false);

      this.dispatchGridRowEvent_(gridrow,
          pear.ui.Grid.EventType.GRIDROW_UNSELECT);
    }
  },this);
  this.selectedGridRowsIds_ = [];
};


/**
 * Set configuration object
 * @param {Object.<string,*>} config
 * @public
 * @return {Object.<string,*>}
 */
pear.ui.Grid.prototype.setConfiguration = function(config) {
  goog.object.forEach(config, function(value, key) {
    this.Configuration_[key] = value;
  },this);
  return this.Configuration_;
};


/**
 * get Editor Associated with the Column
 * @param {function()} fn
 * @public
 */
pear.ui.Grid.prototype.setEditor = function(fn) {
  this.editorFn = fn;
};


/**
 * get Editor Associated with the Column
 * @param {pear.data.Column} column
 * @return {pear.ui.editor.IEditor} Editor
 * @public
 */
pear.ui.Grid.prototype.getEditor = function(column) {
  if (this.editorFn) {
    return this.editorFn.call(this, column);
  }
  return null;
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
 *  @todo  - TBD
 */
pear.ui.Grid.prototype.isEnabled = function() {
  return true;
};


/**
 *  @return {boolean} true always
 *  @todo  - TBD
 */
pear.ui.Grid.prototype.isVisible = function() {
  return true;
};


/**
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

};


/**
 * @override
 */
pear.ui.Grid.prototype.enterDocument = function() {
  pear.ui.Grid.superClass_.enterDocument.call(this);

  // Assign Unique ID to Grid
  var uid = goog.getUid(this);
  this.getDomHelper().setProperties(this.getElement(), {id: this.getId()});

  // Focus element
  var domHelper = this.getDomHelper();
  var focusElem = domHelper.createDom('div',
      {
        style: 'position:fixed;width:0;height:0;top:0;left:0;outline:0;',
        id: 'peargrid$focus' + uid
      });
  focusElem.setAttribute('tabindex', 0);
  focusElem.setAttribute('hidefocus', '');
  domHelper.appendChild(this.getElement(), focusElem);
  this.focusElem_ = focusElem;

  // Register Events on Grid (this)
  this.registerEventsOnGrid();

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
 * Get Unique Id for this Instance of Grid
 * @return {string}
 */
pear.ui.Grid.prototype.getUniqueId = function() {
  var prefix = 'peargrid';
  var uniqId = prefix + goog.getUid(this);
  return uniqId;
};


/**
 * Return the Unique CSS Root Style
 * @return {string}
 * @private
 */
pear.ui.Grid.prototype.getUniqueRootCss_ = function() {
  return '.' + this.getUniqueId();
};


/**
 * Create the Style Element for this instance of Grid
 * @return {!Element} Style Element
 * @private
 */
pear.ui.Grid.prototype.createStyleElement_ = function() {
  var domHelper = this.getDomHelper();
  var uniqCssId = this.getUniqueId();
  var element = this.getElement();
  var styleNode = domHelper.createDom('style',
      {
        id: uniqCssId,
        type: 'text/css',
        rel: 'stylesheet'
      });
  //domHelper.appendChild(element.parentNode,styleNode);
  document.getElementsByTagName('head')[0].appendChild(styleNode);
  return styleNode;
};


/**
 * Get the Style Element
 * @return {!Element} Style Node
 */
pear.ui.Grid.prototype.getStyleElement = function() {
  this.styleElem_ = this.styleElem_ || this.createStyleElement_();
  return this.styleElem_;
};


/**
 * Apply Style to Grid Element
 * @private
 */
pear.ui.Grid.prototype.applyCSSStyleToGrid_ = function() {
  var element = this.getElement();
  goog.dom.classes.add(element, this.getUniqueId());
  goog.dom.classes.add(element, 'pear-grid');
  goog.dom.classes.add(element, 'unselectable');

};


/**
 * Get Stylesheet for this instance of Grid
 * @return {CSSStyleSheet} Stylesheet for this instance
 * @protected
 */
pear.ui.Grid.prototype.getCSSStyleSheet = function() {
  if (!this.cssStyleSheet_) {
    var cssStyleSheets = goog.cssom.getAllCssStyleSheets();
    var uniqid = this.getUniqueId();
    var stylesheet;
    for (var i = 0; i < cssStyleSheets.length; i++) {
      if ((cssStyleSheets[i].ownerNode == this.styleElem_) ||
          // IE
          (cssStyleSheets[i].owningElement == this.styleElem_)) {
        stylesheet = cssStyleSheets[i];
        break;
      }
    }
    this.cssStyleSheet_ = stylesheet;
  }
  return this.cssStyleSheet_;
};


/**
 * set CSS Rule
 * @param {string} selectorText [description]
 * @param {Object} ruleObject   [description]
 * @return {Object} [description]
 * @private
 */
pear.ui.Grid.prototype.setInternalCSSRule_ =
    function(selectorText, ruleObject) {
  var uniqCssId = this.getUniqueRootCss_();
  if (!this.cssInternalRules_) {
    this.cssInternalRules_ = {};
  }
  this.cssInternalRules_[uniqCssId + ' ' + selectorText] = ruleObject;
  return this.cssInternalRules_[uniqCssId + ' ' + selectorText];
};


/**
 * transform Rule Object of Key,Value pair to Style Text
 * @param  {string} selectorText selector
 * @param  {Object} ruleobject   CSS Rule in key value pair
 * @return {string}              CSS Rule in Text
 */
pear.ui.Grid.prototype.transformInternalCSSRuleToCSSRule =
    function(selectorText , ruleobject) {
  var text = selectorText + ' { ';
  goog.object.forEach(ruleobject, function(value, key) {
    text = text + key + ' : ' + value + ' ; ';
  });
  text = text + ' }';

  return text;
};


/**
 * Get CSS Rule
 * @param  {string} selectorText Selector
 * @return {Object} CSS Rule in key value pair
 */
pear.ui.Grid.prototype.getCSSRule = function(selectorText) {
  var uniqCssId = this.getUniqueRootCss_();
  this.cssInternalRules_[uniqCssId + ' ' + selectorText] =
      this.cssInternalRules_[uniqCssId + ' ' + selectorText] || {};
  return this.cssInternalRules_[uniqCssId + ' ' + selectorText];
};


/**
 * set CSS Rule in DOM
 * @param {string} text Rule Text
 */
pear.ui.Grid.prototype.setCSSRule = function(text) {
  var domHelper = this.getDomHelper();
  var styleElem = this.getStyleElement();
  var cssStyleSheet = this.getCSSStyleSheet();

  goog.cssom.addCssRule(cssStyleSheet, text);

  // for redability
  //domHelper.append(styleElem,domHelper.createTextNode(text));
  // styleElem.innerHTML = text;
};


/**
 * Prepare ALL CSS Rules
 * @protected
 */
pear.ui.Grid.prototype.buildCSSRules = function() {
  var uniqCssId = this.getUniqueRootCss_();

  this.setInternalCSSRule_('.pear-grid',
      {
        width: this.getWidth() + 'px' ,
        height: this.getHeight() + 'px'
      });
  this.setInternalCSSRule_('.pear-grid-header',
      {
        width: this.getWidth() + 'px' ,
        height: this.Configuration_.HeaderRowHeight + 'px'
      });
  this.setInternalCSSRule_('.pear-grid-footer',
      {
        width: this.getWidth() + 'px' ,
        height: this.Configuration_.FooterRowHeight + 'px'
      });
  this.setInternalCSSRule_('.pear-grid-viewport',
      {
        width: this.getWidth() + 'px'
      });

  if (this.getConfiguration().ShowCellBorder) {
    this.setInternalCSSRule_('.pear-grid-cell',
        {
          'border-top-color': 'silver'
        });
  }else {
    this.setInternalCSSRule_('.pear-grid-cell',
        {
          'border-top-color': 'transparent'
        });
  }

  var cellBorderBox = this.getCellBorderBox(uniqCssId);
  var contentPaddingBox = this.getCellContentPaddingBox(uniqCssId);


  // pear-grid-cell-header
  var cellHeight = this.getConfiguration().HeaderRowHeight -
                   cellBorderBox.top -
                   cellBorderBox.bottom;

  this.setInternalCSSRule_('.pear-grid-cell-header',
      {
        height: cellHeight + 'px'
      });

  cellHeight = this.getConfiguration().FooterRowHeight -
               cellBorderBox.top -
               cellBorderBox.bottom;

  this.setInternalCSSRule_('.pear-grid-cell-footer',
      {
        height: cellHeight + 'px'
      });

  cellHeight = this.getConfiguration().RowHeight -
               cellBorderBox.top -
               cellBorderBox.bottom;

  this.setInternalCSSRule_('.pear-grid-cell-data',
      {
        height: cellHeight + 'px'
      });

  // TODO
  cellHeight = this.getConfiguration().RowHeight -
               cellBorderBox.top -
               cellBorderBox.bottom -
               contentPaddingBox.top -
               contentPaddingBox.bottom -
               2; // for Highlight Border
  this.setInternalCSSRule_('.pear-grid-cell-data-content',
      {
        'line-height': cellHeight + 'px'
      });

  var rowWidth = this.buildColumnCSSRules_();

  var maxWidth = (rowWidth + this.getScrollbarWidth()) > this.getWidth() ?
      rowWidth + this.getScrollbarWidth() : this.getWidth();

  // pear-grid-row
  this.setInternalCSSRule_('.pear-grid-row-data',
      {
        width: rowWidth + 'px',
        height: this.getComputedRowHeight() + 'px'
      });

  this.setInternalCSSRule_('.pear-grid-row-data pear-grid-row-even', { });
  this.setInternalCSSRule_('.pear-grid-row-data pear-grid-row-odd', { });

  this.setInternalCSSRule_('.pear-grid-row-header',
      {
        width: maxWidth + 'px',
        height: this.Configuration_.HeaderRowHeight + 'px'
      });
  this.setInternalCSSRule_('.pear-grid-row-footer',
      {
        width: maxWidth + 'px',
        height: this.Configuration_.FooterRowHeight + 'px'
      });
  this.setInternalCSSRule_('.pear-grid-body-canvas',
      {
        width: rowWidth + 'px'
      });
};


/**
 * Write CSS Rules for Columns
 * @return {number} RowWidth
 * @private
 */
pear.ui.Grid.prototype.buildColumnCSSRules_ = function() {
  var rootCss = this.getUniqueRootCss_();
  var cellBorderBox = this.getCellBorderBox(rootCss);
  var l = 0;
  var rowWidth = 0;
  goog.array.forEach(this.getColumns_(), function(col, index) {
    if (col.getVisibility()) {
      var w = col.getWidth();
      this.setInternalCSSRule_('.col' + index,
          {
            width: w + 'px',
            left: l + 'px'
          });
      l = l + w + cellBorderBox.left + cellBorderBox.right;
      rowWidth = rowWidth +
          w +
          cellBorderBox.left +
                      cellBorderBox.right;
    }
  },this);

  this.setInternalCSSRule_('.pear-grid-row-data',
      {
        width: rowWidth + 'px',
        height: this.getComputedRowHeight() + 'px'
      });

  this.gridRowWidth_ = rowWidth;
  return this.gridRowWidth_;
};


/**
 * [getGridRowWidth description]
 * @return {number} [description]
 */
pear.ui.Grid.prototype.getGridRowWidth = function() {
  return this.gridRowWidth_;
};


/**
 * Set Scrolleft on Frozen Column
 * @param  {number} scrollLeft [description]
 * @private
 */
pear.ui.Grid.prototype.buildFrozenColumnCSSRules_ = function(scrollLeft) {
  var rootCss = this.getUniqueRootCss_();
  var cellBorderBox = this.getCellBorderBox(rootCss);
  var l = scrollLeft;
  var totalFrozenColumnWidth = 0;
  goog.array.forEach(this.getColumns_(), function(col, index) {
    if (index <= this.frozenColumnsIndex_) {
      var w = col.getWidth();
      l = l + w + cellBorderBox.left + cellBorderBox.right;
      totalFrozenColumnWidth = totalFrozenColumnWidth +
                               w +
                               cellBorderBox.left +
                               cellBorderBox.right;
      //var rule = this.getCSSRule('.col'+index);
      //rule["margin-left"]=scrollLeft+'px';
      //var cssText = this.transformInternalCSSRuleToCSSRule('.col'+index,rule);
      //this.setCSSRule(cssText);
    }
  },this);
  this.frozenColumnsWidth_ = totalFrozenColumnWidth;

  goog.array.forEach(this.renderedGridRowsCache_, function(row) {
    for (var i = 0; i <= this.frozenColumnsIndex_; i++) {
      var child = row.getChildAt(i);
      goog.style.setStyle(child.getElement(), 'margin-left', scrollLeft + 'px');
    }
  },this);

  var headerRow = this.getHeaderRow();
  for (var i = 0; i <= this.frozenColumnsIndex_; i++) {
    var child = headerRow.getChildAt(i);
    goog.style.setStyle(child.getElement(), 'margin-left', scrollLeft + 'px');
  }

  if (this.showFooter_) {
    var footerRow = this.getFooterRow();
    for (var i = 0; i <= this.frozenColumnsIndex_; i++) {
      var child = footerRow.getChildAt(i);
      goog.style.setStyle(child.getElement(), 'margin-left', scrollLeft + 'px');
    }
  }

};


/**
 * write CSS Rules in CSSstyleSheet in Document
 * @private
 */
pear.ui.Grid.prototype.setCSSRulesInDocument_ = function() {
  var domHelper = this.getDomHelper();
  var element = this.getElement();
  var uniqCssId = this.getUniqueRootCss_();
  var styleElemInnerHtml = '';
  var styleElem = this.getStyleElement();
  //domHelper.setTextContent(styleElem,'');
  styleElem.textContent = '';

  goog.object.forEach(this.cssInternalRules_, function(cssinternalrule, key) {
    var cssText = this.transformInternalCSSRuleToCSSRule(key, cssinternalrule);
    this.setCSSRule(cssText);
    styleElemInnerHtml = styleElemInnerHtml + ' ' + cssText;
  },this);

  // Chrome Browser - sometime does not immediately adds css text into
  // Style Element
  // var text = goog.cssom.getAllCssText(this.getCSSStyleSheet());
  // domHelper.setTextContent(styleElem,text);
  styleElem.textContent = styleElemInnerHtml;
};


/**
 * set Column Visibility - show/hide column
 * @param {string} columnId ColumnId of @link {pear.data.Column}
 * @param {boolean} visible  true, to show the column
 */
pear.ui.Grid.prototype.setColumnVisibility = function(columnId, visible) {
  var column = this.getColumnById(columnId);
  column.setVisibility(visible);
  this.refreshAll(true);
};


/**
 * Freeze Columns .
 * @param {number} index All columns upto/including index will be frozen
 * @param {boolean} freeze if true, will freeze the column
 */
pear.ui.Grid.prototype.setFrozenColumns = function(index, freeze) {
  var columns = this.getColumns_();
  this.frozenColumnsIndex_ = index;
  goog.array.forEach(columns, function(datacolumn, colIndex) {
    if (colIndex <= this.frozenColumnsIndex_) {
      datacolumn.setFrozen(freeze);
    }
  },this);
  this.viewport_.getElement().scrollLeft = 0;
  this.refreshAll();
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

  this.applyCSSStyleToGrid_();

  // Prepare the CSS Style
  this.buildCSSRules();
  this.setCSSRulesInDocument_();

  // Render Grid
  this.renderHeader_();
  this.renderviewport_();
  this.renderBodyCanvas_();
  if (this.showFooter_) {
    this.renderFooter_();
  }

  // Adjust Size
  this.setViewportSize_();

  this.transformDataRowsToGridRows_();
  if (this.Configuration_.AllowPaging) {
    this.setPageIndex(0);
  }
  this.refreshCanvasView_(false);
  this.restoreHighlightedRow_();
  this.restoreSelectedRows_();
  this.dispatchGridEvent_(pear.ui.Grid.EventType.RENDERED);
};


/**
 *
 * Render grid header Container
 * @private
 */
pear.ui.Grid.prototype.renderHeader_ = function() {
  this.header_ = new pear.ui.Header();
  this.addChild(this.header_, true);

  this.createSingleRowHeader_();
  this.registerEventsOnHeaderRow();
};


/**
 *
 * Render grid single row grid header
 * @private
 */
pear.ui.Grid.prototype.createSingleRowHeader_ = function() {
  this.headerRow_ = this.headerRow_ ||
      new pear.ui.GridHeaderRow(this,
      this.Configuration_.HeaderRowHeight, this.getDomHelper());
  this.header_.addChild(this.headerRow_, true);
  this.headerRow_.setHeight(this.Configuration_.HeaderRowHeight);

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
    if (column.getVisibility()) {
      // create header cells here
      var headerCell = new pear.ui.GridHeaderCell(this.getDomHelper());
      headerCell.setDataColumn(column);
      headerCell.setCellIndex(index);
      this.headerRow_.addCell(headerCell, true);

      var evt = new pear.ui.Grid.GridHeaderCellEvent(
          pear.ui.Grid.EventType.AFTER_HEADERCELL_RENDER,
          this,
          headerCell);
      this.dispatchEvent(evt);
    }
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

  this.createFooterCells_();
};


/**
 * Create Footer Cells
 * @private
 */
pear.ui.Grid.prototype.createFooterCells_ = function() {
  var columns = this.getColumns_();
  goog.array.forEach(columns, function(column, index) {
    if (column.getVisibility()) {
      // Create Footer Cells
      var footerCell = new pear.ui.GridFooterCell();
      footerCell.setDataColumn(column);
      footerCell.setCellIndex(index);
      this.footerRow_.addCell(footerCell, true);
    }
  }, this);
};


/**
 * get the height of Body
 * @return {number} [description]
 * @private
 */
pear.ui.Grid.prototype.calculateBodyHeight_ = function() {
  var bodyHeight = this.height_;
  bodyHeight = bodyHeight - this.headerRow_.getHeight();

  if (this.showFooter_) {
    bodyHeight = bodyHeight - this.footerRow_.getHeight();
  }

  return bodyHeight;
};


/**
 * Set height and Width of Body Element
 * @private
 */
pear.ui.Grid.prototype.setViewportSize_ = function() {
  var element = this.viewport_.getElement();
  goog.style.setHeight(element, this.calculateBodyHeight_());
};


/**
 * Render Viewport of Grid
 * @private
 */
pear.ui.Grid.prototype.renderviewport_ = function() {
  this.viewport_ = new goog.ui.Component();
  this.addChild(this.viewport_, true);

  goog.dom.classes.set(this.viewport_.getElement(), 'pear-grid-viewport');

  this.registerEventsOnViewport();
};


/**
 * Render body Canvas
 * @private
 */
pear.ui.Grid.prototype.renderBodyCanvas_ = function() {
  this.bodyCanvas_ = new goog.ui.Component();
  this.viewport_.addChild(this.bodyCanvas_, true);

  var elem = this.bodyCanvas_.getElement();
  goog.dom.classes.set(elem, 'pear-grid-body-canvas');

  this.registerEventsOnBodyCanvas();
};


/**
 * Set height of Body Canvas
 * @private
 */
pear.ui.Grid.prototype.updateBodyCanvasHeight_ = function() {
  var height = 0;
  var pagesize = this.getPageSize();
  var rowHeight = this.getComputedRowHeight();

  if (this.Configuration_.AllowPaging) {
    height = (this.getGridRowsCount_() * rowHeight);
  }else {
    height = (this.getDataViewRowCount() * rowHeight);
  }

  // @todo handle paging
  goog.object.forEach(this.activeGridRow_, function(gridrow) {
    height = height + this.getGridRowDetailHeight();
  },this);

  goog.style.setHeight(this.bodyCanvas_.getElement(), height);


  // cache size
  var a = this.getBodyCanvasSize(true);
};


/**
 * get Scrollleft of Body
 * @return {number} [description]
 * @private
 */
pear.ui.Grid.prototype.getScrollLeftOfviewport_ = function() {
  return (/** @type {number} */ (this.viewport_.getElement().scrollLeft));
};


/**
 * Set ScrollLeft on Header
 * @param  {number} scrollLeft
 * @private
 */
pear.ui.Grid.prototype.setScrollOnHeaderRow_ = function(scrollLeft) {
  this.header_.getElement().scrollLeft = scrollLeft;
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
 * Get Frozen Columns Width
 * @return {number}
 * @private
 */
pear.ui.Grid.prototype.getfrozenColumnsWidth_ = function() {
  return this.frozenColumnsWidth_;
};


/**
 * Set Scrolleft on Footer
 * @private
 */
pear.ui.Grid.prototype.syncScrollLeft_ = function() {
  var scrollLeft = this.getScrollLeftOfviewport_();
  // Header Sync
  this.setScrollOnHeaderRow_(scrollLeft);

  // Frozen Column Sync
  this.buildFrozenColumnCSSRules_(scrollLeft);

  // Footer Sync
  if (this.showFooter_) {
    this.setScrollOnFooterRow_(scrollLeft);
  }
};


/**
 * Key Event Target
 * @return { Element} [description]
 * @protected
 */
pear.ui.Grid.prototype.getKeyEventTarget = function() {
  return this.focusElem_;
};


/**
 * Focus Event Target
 * @return { Element} [description]
 * @protected
 */
pear.ui.Grid.prototype.getFocusEventTarget = function() {
  return this.focusElem_;
};


/**
 * get Calculated Row Height
 *
 * @return {number}
 */
pear.ui.Grid.prototype.getComputedRowHeight = function() {
  return this.Configuration_.RowHeight;
};


/**
 * Is first row of grid
 * @param  {pear.ui.GridRow}  gridrow
 * @return {boolean}   true, is first row , index equal 0
 * @public
 */
pear.ui.Grid.prototype.isFirstRowInGrid = function(gridrow) {
  var pagesize = this.getPageSize();
  var position = gridrow.getRowPosition();

  if (this.Configuration_.AllowPaging) {
    return ((position % pagesize) === 0);
  }else {
    return (position === 0);
  }
};


/**
 * Is last row of grid
 * @param  {pear.ui.GridRow}  gridrow
 * @return {boolean}   true, is first row , index equal 0
 * @public
 */
pear.ui.Grid.prototype.isLastRowInGrid = function(gridrow) {
  var pagesize = this.getPageSize();
  var position = gridrow.getRowPosition();
  var totalRows = this.getGridRowsCount_();

  if (this.Configuration_.AllowPaging) {
    // @todo - paging
    return false;
  }else {
    return (position === (totalRows - 1));
  }
};


/**
 * Set Top of GridRow
 * @param  {pear.ui.GridRow}  gridrow
 * @protected
 */
pear.ui.Grid.prototype.setTopOfGridRow = function(gridrow) {
  var rowHeight = gridrow.getHeight();

  if (this.isFirstRowInGrid(gridrow)) {
    gridrow.setLocationTop(0);
  }else {
    gridrow.setLocationTop(this.previousTop_ + this.previousHeight_);
  }
  this.previousTop_ = gridrow.getLocationTop();
  this.previousHeight_ = gridrow.getHeight();
};


/**
 * Transform Data-RowView to GridRows
 * @private
 */
pear.ui.Grid.prototype.transformDataRowsToGridRows_ = function() {
  var rows = this.getDataRowViewsForViewport_();
  var rowHeight = this.getComputedRowHeight();

  this.setGridRows_([]);

  goog.array.forEach(rows, function(rowview, index) {
    var row = new pear.ui.GridRow(this, rowHeight, this.getDomHelper());
    row.setDataRowView(rowview);
    row.setRowPosition(index);

    this.addGridRows_(row);
    this.setTopOfGridRow(row);
    //can not create cells here - performance delay
  }, this);
};

// SubGrid / Row Details


/**
 * Get GridRow Details Height , if height is not set than it returns
 * 1/3 one third of grid size
 * @return {number} height of detail
 * @public
 */
pear.ui.Grid.prototype.getGridRowDetailHeight = function() {
  return (this.gridrowDetailsHeight_ < 0 ?
      Math.abs(this.getHeight() / 3) : this.gridrowDetailsHeight_);
};


/**
 * [setGridRowDetailHeight description]
 * @param {number} height [description]
 */
pear.ui.Grid.prototype.setGridRowDetailHeight = function(height) {
  this.gridrowDetailsHeight_ = height;
};


/**
 * Show or Hide GridRow Details
 * @param  {pear.ui.GridRow}  gridrow
 * @param  {boolean} display
 * @public
 */
pear.ui.Grid.prototype.showGridRowDetails = function(gridrow, display) {
  var rowHeight = this.getComputedRowHeight();
  var rowDetailsHeight = this.getGridRowDetailHeight();
  var gridrows = this.getGridRows();

  goog.array.forEach(gridrows, function(grow, index) {
    if (grow.getId() === gridrow.getId()) {
      grow.setHeight(display ? (rowHeight + rowDetailsHeight) : rowHeight);
      grow.showGridRowDetailsContainer(display);
    }
    this.setTopOfGridRow(grow);
  }, this);

  if (display) {
    this.activeGridRow_[gridrow.getId()] = gridrow;
  }else {
    delete this.activeGridRow_[gridrow.getId()];
  }

  this.updateBodyCanvasHeight_();
};


/**
 * Close All GridRow Details
 * @public
 */
pear.ui.Grid.prototype.closeAllGridRowDetails = function() {
  goog.object.forEach(this.activeGridRow_, function(grow) {
    this.showGridRowDetails(grow, false);
  }, this);

  this.activeGridRow_ = {};
};


/**
 * Restore the highlighted row
 * @private
 */
pear.ui.Grid.prototype.restoreHighlightedRow_ = function() {
  // restore highlighted row
  if (this.highligtedGridrow_.rowIndex > -1 &&
      this.highligtedGridrow_.rowIndex < this.getGridRowsCount_() &&
      this.getGridRowsCount_() > 0) {
    var gridrow = this.getGridRowAt(this.getHighlightedGridRowIndex());
    if (gridrow && gridrow.isInDocument()) {
      this.setHighlighted_(gridrow, true, false);
      this.setHighlightedCellByIndex(this.getHighlightedCellIndex());
    }
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
    if (gridrow) {
      gridrow.setSelect(true);
    }
  },this);
};


/**
 * render the GridRow cells
 * @private
 * @param {pear.ui.GridRow} row
 */
pear.ui.Grid.prototype.renderDataRowCells_ = function(row) {
  var columns = this.getColumns_();
  // TODO : remove children , necessary ?
  if (row.getChildCount() > 0) {
    var childrens = row.removeChildren(true);
    goog.array.forEach(childrens, function(child) {
      child.dispose();
    },this);
  }
  goog.array.forEach(columns, function(datacolumn, index) {
    if (datacolumn.getVisibility()) {
      var c = new pear.ui.GridCell(this.getDomHelper(),
          datacolumn.getGridCellRenderer());
      c.setDataColumn(datacolumn);
      c.setCellIndex(index);
      row.addCell(c, true);
    }
  },this);
  this.registerEventsOnGridRow(row);
};


/**
 * @private
 * @param {number} start
 * @param {number} end
 * @todo - Performance Sucker ....
 */
pear.ui.Grid.prototype.removeRowsFromRowModelCache_ = function(start, end) {
  for (var i in this.renderedGridRowsCache_) {
    if (i < start || i > end) {
      if (this.isActiveEditorGridRow(this.renderedGridRowsCache_[i]) ||
          this.isActiveGridRow(this.renderedGridRowsCache_[i])) {
        // Row is Active Editor or Active
      }else {
        //this.renderedGridRowsCache_[i].removeChildren(true);
        this.bodyCanvas_.removeChild(this.renderedGridRowsCache_[i], true);
        delete this.renderedGridRowsCache_[i];
      }
    }
  }
};


/**
 * [debugRendering_ description]
 * @param  {number} start [description]
 * @param  {number} end   [description]
 * @private
 */
pear.ui.Grid.prototype.debugRendering_ = function(start, end) {
  //logger.info ('Rendering Rows '+start+ ' To '+end);
  //if (document.activeElement){
  //  logger.info ('Focus Element '+document.activeElement.id);
  //}
};


/**
 * get size of Viewport
 * @return {goog.math.Size}
 */
pear.ui.Grid.prototype.getViewportSize = function() {
  this.viewportSize_ = this.viewportSize_ ||
      goog.style.getSize(this.viewport_.getElement());
  return this.viewportSize_;
};


/**
 * get size of Body Canvas
 * @param { boolean=} opt_refresh Recalculate size
 * @return {goog.math.Size}
 */
pear.ui.Grid.prototype.getBodyCanvasSize = function(opt_refresh) {
  if (opt_refresh) {
    this.bodyCanvasSize_ = goog.style.getSize(this.bodyCanvas_.getElement());
  }else {
    this.bodyCanvasSize_ = this.bodyCanvasSize_ ||
        goog.style.getSize(this.bodyCanvas_.getElement());
  }
  return this.bodyCanvasSize_;
};


/**
 * Find the Index of gridrow - for the value of scrolltop
 * @param  {number} scrolltop [description]
 * @param  {number} low       [description]
 * @param  {number} high      [description]
 * @return {number}           [description]
 * @private
 */
pear.ui.Grid.prototype.findGridRowIndexByViewport_ =
    function(scrolltop, low, high) {
  var med = Math.floor((low + high) / 2);
  var gridrowlow = this.getGridRowAt(low);
  var gridrowhigh = this.getGridRowAt(high);
  var gridrowmed = this.getGridRowAt(med);


  if (med <= low) {
    return med;
  }else if (scrolltop >= gridrowlow.getLocationTop() &&
          scrolltop < gridrowmed.getLocationTop()) {
    return this.findGridRowIndexByViewport_(scrolltop, low, med);
  }else if (scrolltop >= gridrowmed.getLocationTop() &&
      scrolltop <= gridrowhigh.getLocationTop()) {
    return this.findGridRowIndexByViewport_(scrolltop, med, high);
  }else {
    throw new Error('failed to find index for scrolltop:' + scrolltop);
  }
};


/**
 * Calculates number of rows needed for virtual rendering
 * @param  {boolean=} opt_reset  if true, recalculates
 * @protected
 * @return {number} [description]
 */
pear.ui.Grid.prototype.getMaxAllowableRowsVirtualRender = function(opt_reset) {
  if (opt_reset || !this.maxVirtualRenderCount_) {
    var size = this.getViewportSize();
    var rowheight = this.getComputedRowHeight();
    this.maxVirtualRenderCount_ = Math.ceil(size.height / rowheight);
    this.maxVirtualRenderCount_ = this.maxVirtualRenderCount_ * 2;
  }
  return this.maxVirtualRenderCount_;
};


/**
 * calculate Start and End Row index - depends on viewport within BodyCanvas
 * @return {Object} [description]
 * @private
 * @todo  - in case of subgrid this calculation of start and end index
 * needs to be optimized. otherwise there are edge cases which will not
 * render properly . for instance if you subgrid is open for couple bottom
 * most rows , then virtual rendering might fail
 */
pear.ui.Grid.prototype.calculateViewRange_ = function() {
  var rowCount = this.getDataViewRowCount();
  var scrollTop = this.viewport_.getElement().scrollTop;
  var vRenderRowcount = this.getMaxAllowableRowsVirtualRender();


  var index = this.findGridRowIndexByViewport_(scrollTop, 0,
      this.getGridRowsCount_() - 1);

  var startIndex = 0;
  startIndex = ((index - vRenderRowcount) < 0) ?
      0 : (index - vRenderRowcount);

  var endIndex = 0;
  endIndex = ((index + vRenderRowcount) > rowCount) ?
      rowCount : (index + vRenderRowcount);

  // Add debug info in Focus element
  var comment = document.createComment(
      'ScrollTop:' + scrollTop +
      ', Rendering Start:' + startIndex +
      ' End:' + endIndex +
      ', vRenderMaxRows:' + vRenderRowcount +
      ', Total Rows:' + (endIndex - startIndex) +
      ', MidpointIndex: ' + index);
  goog.dom.removeChildren(this.focusElem_);
  this.focusElem_.appendChild(comment);
  return { 'startRowIndex': startIndex, 'endRowIndex': endIndex};
};


/**
 * Calculatre Viewport Area and then Cache GridRows to be rendered ,
 * in ViewPort.
 *
 * @todo  height of Body Canvas will be different for more than 50K rows in
 * IE and Google Chrome
 * @param {number} startIndex
 * @param {number} endIndex
 * @private
 */
pear.ui.Grid.prototype.cacheGridRowsReadyForViewport_ =
    function(startIndex, endIndex) {
  var i = 0;

  var gridrows = this.getGridRows();
  for (i = startIndex; (i < endIndex && i < gridrows.length); i++) {
    if (!this.renderedGridRowsCache_[i]) {
      var gridrow = this.getGridRowAt(i);
      if (this.isActiveEditorGridRow(gridrow) ||
          this.isActiveGridRow(gridrow)) {
        // Gridrow should already exists in Cache
      }else {
        this.renderReadyGridRows_[i] = gridrow;
      }

    }
  }
};


/**
 * Render Cached GridRows for Viewport in BodyCanvas Element
 * @param  {boolean=} opt_redraw [description]
 * @private
 * @todo Performance Sucker ....
 */
pear.ui.Grid.prototype.renderCachedGridRowsInBodyCanvas_ =
    function(opt_redraw) {
  // var dv = this.getDataView();
  if (opt_redraw && this.bodyCanvas_.getChildCount() > 0) {
    this.bodyCanvas_.removeChildren(true);
  }

  goog.array.forEach(this.renderReadyGridRows_, function(gridrow, index) {
    // Render Cell on Canvas on demand for Performance
    this.bodyCanvas_.addChild(gridrow, true);
    this.renderDataRowCells_(gridrow);

    // LastRow - needs bottom border
    if (this.isLastRowInGrid(gridrow)) {
      gridrow.applyBottomBorder(true);
    }

    this.renderedGridRowsCache_[index] = gridrow;
  },this);
  this.renderReadyGridRows_ = [];
};


/**
 * refresh CSS Styles
 * @param  {boolean=} opt_redraw [description]
 */
pear.ui.Grid.prototype.refreshCssStyle = function(opt_redraw) {
  if (opt_redraw) {
    this.buildCSSRules();
  }
  this.setCSSRulesInDocument_();
};


/**
 * refresh header row
 */
pear.ui.Grid.prototype.refreshHeader = function() {
  this.headerRow_.removeChildren(true);
  this.createHeaderCells_();
};


/**
 * refresh footer row
 */
pear.ui.Grid.prototype.refreshFooterRow = function() {
  this.footerRow_.removeChildren(true);
  this.createFooterCells_();
};


/**
 * On columns width changed
 */
pear.ui.Grid.prototype.refreshOnColumnResize = function() {
  var rowWidth = this.buildColumnCSSRules_();
  this.refreshCssStyle();
  this.dispatchGridEvent_(pear.ui.Grid.EventType.ON_COLUMN_RESIZE);
};


/**
 * Throttle for Viewport Update
 * @private
 */
pear.ui.Grid.prototype.createViewportThrottle_ = function() {
  // Get rid of an old one, if it exists.
  if (this.viewportthrottle_) {
    this.viewportthrottle_.dispose();
  }
  // Create the throttle object for the given time.
  this.viewportthrottle_ = new goog.async.Throttle(
      this.updateViewport_,
      pear.ui.Grid.THROTTLE_DELAY,
      this);
};


/**
 * Fire Viewport Update Throttle
 * @private
 */
pear.ui.Grid.prototype.fireViewportThrottle_ = function() {
  if (this.viewportthrottle_) {
    this.viewportthrottle_.fire();
  }else {
    this.createViewportThrottle_();
    this.viewportthrottle_.fire();
  }
};


/**
 * update the Viewable area of the Body Canvas element
 *
 * @private
 * @param  {boolean=} opt_redrawCanvas  optional parameter
 * if true - redraw Canvas remove each gridrow from canvas
 */
pear.ui.Grid.prototype.updateViewport_ = function(opt_redrawCanvas) {

  var self = this;var viewportRange;
  viewportRange = self.calculateViewRange_();
  self.cacheGridRowsReadyForViewport_(viewportRange.startRowIndex,
                                      viewportRange.endRowIndex);
  self.renderCachedGridRowsInBodyCanvas_(opt_redrawCanvas);
  self.removeRowsFromRowModelCache_(viewportRange.startRowIndex,
      viewportRange.endRowIndex);

  this.restoreHighlightedRow_();
  logger.info('finished restoreHighlightedRow_');
  this.restoreSelectedRows_();
  logger.info('finished restoreSelectedRows_');

};


/**
 * refresh grid , Just the Body of Grid
 * Clear the Rendered Grid Row Cache , Clear the Rendered Grid
 * Active Editor - will rollback
 * Prepare Grid Rows from the DataSource
 * Set the height of canvas and cache Rendered Rows
 * Restore Highlight Rows and Restore Selected Rows
 * @private
 * @param  {boolean=} opt_keepeditoralive
 */
pear.ui.Grid.prototype.refreshBody_ = function(opt_keepeditoralive) {
  if (opt_keepeditoralive) {
    this.closeActiveEditor();
  }
  this.closeAllGridRowDetails();
  this.cachedDataRowsViews_ = null;
  this.transformDataRowsToGridRows_();
  this.refreshCanvasView_(true);
  // Focus
  if (!this.isFocusOnGrid()) {
    this.setFocusOnGrid();
  }
};


/**
 * Clear Row Cache
 * @param  {Array.<pear.ui.GridRow>} cache_gridrows
 * @private
 */
pear.ui.Grid.prototype.clearRowCache_ = function(cache_gridrows) {
  goog.array.forEach(cache_gridrows, function(gridrow) {
    if (this.isActiveEditorGridRow(gridrow) ||
        this.isActiveGridRow(gridrow)) {
    // Gridrow should already exists in Cache
    }else {
      gridrow.dispose();
    }
  },this);
};


/**
 * Refresh Canvas
 * @param  {boolean=} opt_refresh  , if true clears cache
 * @private
 */
pear.ui.Grid.prototype.refreshCanvasView_ = function(opt_refresh) {
  if (opt_refresh) {
    this.clearRowCache_(this.renderedGridRowsCache_);
    this.renderedGridRowsCache_ = [];
    this.clearRowCache_(this.renderReadyGridRows_);
    this.renderReadyGridRows_ = [];
  }
  this.updateBodyCanvasHeight_();
  this.updateViewport_(opt_refresh);
};


/**
 * Entire Body of Grid is refreshed - header , footer , body and CSS Style
 * @param  {boolean=} opt_redrawStyle  if true , rebuild CSS Styles
 * @public
 */
pear.ui.Grid.prototype.refreshAll = function(opt_redrawStyle) {
  this.refreshCssStyle(opt_redrawStyle);
  this.refreshHeader();
  this.refreshBody_();
  if (this.getConfiguration().showFooter_) {
    this.refreshFooterRow();
  }
};


/**
 * refresh grid , Just the Body of Grid
 * Clear the Rendered Grid Row Cache , Clear the Rendered Grid
 * Prepare Grid Rows from the DataSource
 * Set the height of canvas and cache Rendered Rows
 * Restore Highlight Rows and Restore Selected Rows
 * @public
 */
pear.ui.Grid.prototype.refresh = function() {
  this.refreshBody_();
};


/**
 * Get Top visible row in the Viewport
 * @return {number} Index of GridRow
 */
pear.ui.Grid.prototype.getViewportTopRowIndex = function() {
  var scrollTopViewport = this.getViewport().getElement().scrollTop;
  var height = this.getComputedRowHeight();

  var index = Math.floor(scrollTopViewport / height);
  return index;
};


/**
 * Whether Body has Vertical Scroll Visible
 * @return {boolean} true , if visible
 */
pear.ui.Grid.prototype.isBodyHasVScroll = function() {
  // Since Canvas height is determined by DataRows
  var rowCount = this.getDataView().getDataRows().length;
  var rowHeight = this.getComputedRowHeight();

  return (this.height_ < rowCount * rowHeight);
};


/**
 * Whether body has Horizontal Scroll Visible
 * @return {boolean} true , if visible
 */
pear.ui.Grid.prototype.isBodyHasHScroll = function() {
  var bound = goog.style.getBounds(this.getBodyCanvas().getElement());
  return (bound.width > this.width_);
};


/**
 * Bring Cell into View , If getHighlighted Cell of Gridrow is
 * @param {pear.ui.GridRow} gridrow
 * @param {pear.ui.GridCell=} opt_gridcell [description]
 */
pear.ui.Grid.prototype.scrollCellIntoView = function(gridrow, opt_gridcell) {
  if (!this.getGridRowsCount_()
  ) {
    return;
  }
  var scrollTopViewport = this.getViewport().getElement().scrollTop;
  var scrollLeftViewport = this.getViewport().getElement().scrollLeft;
  var positionRow = goog.style.getPosition(gridrow.getElement());
  var boundViewport = goog.style.getBounds(this.getViewport().getElement());
  var boundRow = goog.style.getBorderBoxSize(gridrow.getElement());
  var cell = opt_gridcell || gridrow.getChildAt(this.getHighlightedCellIndex());
  var positionCell = goog.style.getPosition(cell.getElement());
  var boundCell = goog.style.getBorderBoxSize(cell.getElement());
  var scrollVWidth = this.isBodyHasVScroll() ? this.getScrollbarWidth() : 0;
  var scrollHWidth = this.isBodyHasHScroll() ? this.getScrollbarWidth() : 0;


  if ((positionRow.y + boundRow.height) >=
      (boundViewport.height + scrollTopViewport - scrollHWidth)) {
    scrollTopViewport = positionRow.y +
                        boundRow.height +
                        scrollHWidth -
                        boundViewport.height;
  }else if (positionRow.y <= scrollTopViewport) {
    scrollTopViewport = positionRow.y;
  }

  if ((positionCell.x + boundCell.width) >=
      (boundViewport.width + scrollLeftViewport - scrollVWidth)) {
    // Right
    scrollLeftViewport = positionCell.x +
                         boundCell.width -
                         boundViewport.width +
                         scrollVWidth;
  }else if (positionCell.x <= scrollLeftViewport) {
    // Left
    scrollLeftViewport = positionCell.x;
  }

  this.viewport_.getElement().scrollTop = scrollTopViewport;
  this.viewport_.getElement().scrollLeft = scrollLeftViewport;

  if (this.frozenColumnsIndex_ > 0 &&
      cell.getCellIndex() > this.frozenColumnsIndex_) {
    scrollLeftViewport = scrollLeftViewport + this.getfrozenColumnsWidth_();
    if (positionCell.x <= scrollLeftViewport) {
      // Left
      scrollLeftViewport = positionCell.x;
      this.viewport_.getElement().scrollLeft = scrollLeftViewport -
          this.getfrozenColumnsWidth_();
    }
  }
};


// Active Row Container
/**
 * Is GridRow currently Active ?
 * @param  {pear.ui.GridRow}  gridrow
 * @return {boolean}
 */
pear.ui.Grid.prototype.isActiveGridRow = function(gridrow) {
  var result = this.activeGridRow_[gridrow.getId()] &&
      gridrow.isInDocument();

  return !!result;
};

// Editor


/**
 * Get Active Editor Grid Row
 * @return {pear.ui.GridRow?} Instance of gridrow beign edited
 */
pear.ui.Grid.prototype.getActiveEditorGridRow = function() {
  if (this.editorMediator_ && this.editorMediator_.isActive()) {
    return this.editorMediator_.getGridRow();
  }
  return null;
};


/**
 * Is GridRow currently hosting Active Editor
 * @param  {pear.ui.GridRow}  gridrow
 * @return {boolean}
 */
pear.ui.Grid.prototype.isActiveEditorGridRow = function(gridrow) {
  var result = this.getActiveEditorGridRow() &&
      this.getActiveEditorGridRow().getId() === gridrow.getId() &&
      gridrow.isInDocument();
  return !!result;
};


/**
 * Close Editor
 */
pear.ui.Grid.prototype.closeActiveEditor = function() {
  if (this.editorMediator_) {
    this.editorMediator_.dispose();
  }
};


/**
 * Get Editor Mediator
 * @return {pear.ui.editor.CellEditorMediator} [description]
 */
pear.ui.Grid.prototype.getEditorMediator = function() {
  if (this.editorMediator_) {
    this.editorMediator_.dispose();
  }
  this.editorMediator_ = new pear.ui.editor.CellEditorMediator(this);
  return this.editorMediator_;
};


/**
 * Show Cell Editor
 * @param  {pear.ui.GridCell} gridcell
 */
pear.ui.Grid.prototype.showCellEditor = function(gridcell) {
  if (this.getEditor(gridcell.getDataColumn())) {
    var cellEditorMediator = this.getEditorMediator();
    cellEditorMediator.ActivateCellEditor(gridcell);
  }
};



// Row Selection


/**
 * Is Selection Mode is On
 * @return {boolean} true , if selection mode is on
 */
pear.ui.Grid.prototype.isSelectionModeOn = function() {
  return !(this.getConfiguration().SelectionMode ===
      pear.ui.Grid.SelectionMode.NONE);
};


/**
 * Select highlighted GridRow
 */
pear.ui.Grid.prototype.selectGridRow = function() {
  var gridrow = this.getHighlightedGridRow();
  if (gridrow.isSelected()) {
    if (this.getConfiguration().SelectionMode ===
        pear.ui.Grid.SelectionMode.ROW ||
        this.getConfiguration().SelectionMode ===
        pear.ui.Grid.SelectionMode.MULTIPLE_ROW) {

      var rowview = ( /** @type {pear.data.RowView} */(gridrow.getModel()));
      this.getDataView().selectRowView(rowview, false);

      gridrow.setSelect(false);
      goog.array.remove(this.selectedGridRowsIds_, gridrow.getId());
      this.dispatchGridRowEvent_(gridrow,
                                 pear.ui.Grid.EventType.GRIDROW_UNSELECT);
    }
  }else {
    if (this.getConfiguration().SelectionMode ===
        pear.ui.Grid.SelectionMode.ROW) {
      this.clearSelectedGridRows();
    }
    var rowview = ( /** @type {pear.data.RowView} */(gridrow.getModel()));
    this.getDataView().selectRowView(rowview, true);
    gridrow.setSelect(true);

    this.selectedGridRowsIds_ = this.selectedGridRowsIds_ || [];
    this.selectedGridRowsIds_.push(gridrow.getId());

    this.dispatchGridRowEvent_(gridrow, pear.ui.Grid.EventType.GRIDROW_SELECT);
  }
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

// Key Handling - Highlight Management


/**
 * get current highlighted Row
 * @return {pear.ui.GridRow}
 * @public
 */
pear.ui.Grid.prototype.getHighlightedGridRow = function() {
  var row = this.getGridRowAt(this.getHighlightedGridRowIndex());
  return row;
};


/**
 * get current highlighted Cell
 * @return {pear.ui.GridCell}
 * @public
 */
pear.ui.Grid.prototype.getHighlightedCell = function() {
  var cellIndex = this.getHighlightedCellIndex();
  var highlightedRow = this.getHighlightedGridRow();

  var cell = ( /** @type {pear.ui.GridCell} */
      (highlightedRow.getChildAt(cellIndex)));
  return cell;
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
pear.ui.Grid.prototype.getHighlightedGridRowIndex = function() {
  return this.highligtedGridrow_.rowIndex =
      this.highligtedGridrow_.rowIndex < 0 ? 0 :
      this.highligtedGridrow_.rowIndex;
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @return {number} Index of the currently highlighted item.
 */
pear.ui.Grid.prototype.getHighlightedCellIndex = function() {
  return this.highligtedGridrow_.cellIndex =
      this.highligtedGridrow_.cellIndex < 0 ? 0 :
      this.highligtedGridrow_.cellIndex;
};


/**
 * Reset Highlighted Index
 */
pear.ui.Grid.prototype.resetHighlightedIndex = function() {
  this.highligtedGridrow_.rowIndex = -1;
  this.highligtedGridrow_.cellIndex = -1;
  this.clearHighlightedRow();
};


/**
 * Clear Highlighted Row
 */
pear.ui.Grid.prototype.clearHighlightedRow = function() {
  var gridrow = this.getHighlightedGridRow();
  gridrow.clearHighlight();
};


/**
 * Highlight GridRow and Set Highlighted Index
 * @param {pear.ui.GridRow} gridrow [description]
 */
pear.ui.Grid.prototype.highlightGridRow = function(gridrow) {
  this.clearHighlightedRow();
  var highlightIndex = this.indexOfGridRow(gridrow);
  this.setHighlightedGridRowByIndex(highlightIndex);
};


/**
 * Highlight GridCell
 * @param {pear.ui.GridCell} gridcell [description]
 */
pear.ui.Grid.prototype.highlightGridCell = function(gridcell) {
  this.clearHighlightedRow();
  var gridrow = (/** @type {pear.ui.GridRow} */ (gridcell.getParent()));
  var cellIndex = gridrow.indexOfChild(gridcell);
  var rowIndex = this.indexOfGridRow(gridrow);
  this.setHighlightedCellByIndex(cellIndex);
  this.setHighlightedGridRowByIndex(rowIndex);
};


/**
 * Returns the index of the currently highlighted item (-1 if none).
 * @param {number} index of the currently highlighted item.
 */
pear.ui.Grid.prototype.setHighlightedCellByIndex = function(index) {
  var gridrow = (/** @type {goog.ui.Component} */
      (this.getHighlightedGridRow()));
  index = index < 0 ? 0 : index;
  gridrow.highlightChildAt(index, true);
  this.highligtedGridrow_.cellIndex = index;
};


/**
 * Highlights the item at the given 0-based index (if any).  If another item
 * was previously highlighted, it is un-highlighted.
 * @param {number} index Index of item to highlight (-1 removes the current
 *     highlight).
 */
pear.ui.Grid.prototype.setHighlightedGridRowByIndex = function(index) {
  if (this.highligtedGridrow_.rowIndex > -1 &&
      this.highligtedGridrow_.rowIndex < this.getGridRowsCount_() &&
      this.getGridRowsCount_() > 0) {
    this.setHighlighted_(this.getHighlightedGridRow(), false, true);
  }

  var gridrow = this.getGridRowAt(index);
  this.highligtedGridrow_.rowIndex = index;
  if (gridrow) {
    gridrow.highlightChildAt(this.getHighlightedCellIndex());
    this.setHighlighted_(gridrow, true, true);
  }
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
 * Highlights/UnHihighlight the GridRow and dispatch events
 * @param {pear.ui.GridRow} gridrow Item to highlight.
 * @param {boolean} highlight
 * @param {boolean} dispatch  if true, will dispatch event
 * @private
 */
pear.ui.Grid.prototype.setHighlighted_ =
    function(gridrow, highlight, dispatch) {
  var evt;
  gridrow.setHighlight(highlight);

  var index = this.indexOfGridRow(gridrow);
  if (highlight) {
    evt = new pear.ui.Grid.GridRowEvent(
        pear.ui.Grid.EventType.GRIDROW_HIGHLIGHT,
        this,
        gridrow,
        index);
  }else {
    evt = new pear.ui.Grid.GridRowEvent(
        pear.ui.Grid.EventType.GRIDROW_UNHIGHLIGHT,
        this,
        gridrow,
        index);
  }
  if (dispatch) {
    this.dispatchEvent(evt);
  }
};


/**
 * Set Focus on Grid
 */
pear.ui.Grid.prototype.setFocusOnGrid = function() {
  this.focusElem_.focus();
};


/**
 * Check whether Grid is in Focus
 * @return {?boolean} true, if grid is in focus
 */
pear.ui.Grid.prototype.isFocusOnGrid = function() {
  return (
      goog.dom.getActiveElement(goog.dom.getOwnerDocument(this.focusElem_)) ==
      this.focusElem_);
};


/**
 * Highlights the first highlightable item in the container
 */
pear.ui.Grid.prototype.highlightFirstCell = function() {
  this.cellHighlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.getGridRowsCount_() - 1);
};


/**
 * Highlights the last highlightable item in the container.
 */
pear.ui.Grid.prototype.highlightLastCell = function() {
  this.cellHighlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, 0);
};


/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 * @param  {boolean=} opt_gotonextrow if true , highlight next row first cell
 */
pear.ui.Grid.prototype.highlightNextCell = function(opt_gotonextrow) {
  this.cellHighlightHelper(function(index, max) {

    if (((index + 1) % max) === 0) {
      if (opt_gotonextrow) {
        this.highlightNextRow();
      }
      index = 0;
      return index;
    }else {
      return (index + 1);
    }

  }, this.getHighlightedCellIndex());
};


/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 * @param  {boolean=} opt_gotonextrow if true , highlight previous row last cell
 */
pear.ui.Grid.prototype.highlightPreviousCell = function(opt_gotonextrow) {
  this.cellHighlightHelper(function(index, max) {
    index--;
    if (index < 0) {
      if (opt_gotonextrow) {
        this.highlightPreviousRow();
      }
      index = max - 1;
    }
    return index;
  }, this.getHighlightedCellIndex());
};


/**
 * Helper function that manages the details of moving the highlight among
 * child controls in response to keyboard events.
 * @param {function(number, number) : number} fn Function that accepts the
 *     current and maximum indices, and returns the next index to check.
 * @param {number} startCellIndex Start index.
 * @protected
 */
pear.ui.Grid.prototype.cellHighlightHelper = function(fn, startCellIndex) {
  var curIndex = startCellIndex < 0 ? 0 : startCellIndex;
  var numItems = this.getHighlightedGridRow().getChildCount();
  curIndex = fn.call(this, curIndex, numItems);
  this.setHighlightedCellByIndex(curIndex);
};


/**
 * Highlights the first highlightable item in the container
 */
pear.ui.Grid.prototype.highlightFirstRow = function() {
  this.rowHighlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.getGridRowsCount_() - 1);
};


/**
 * Highlights the last highlightable item in the container.
 */
pear.ui.Grid.prototype.highlightLastRow = function() {
  this.rowHighlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, 0);
};


/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 */
pear.ui.Grid.prototype.highlightNextRow = function() {
  this.rowHighlightHelper(function(index, max) {
    return ((index + 1) % max) === 0 ? index : ((index + 1) % max);
  }, this.getHighlightedGridRowIndex());
};


/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 */
pear.ui.Grid.prototype.highlightPreviousRow = function() {
  this.rowHighlightHelper(function(index, max) {
    index--;
    return index < 0 ? 0 : index;
  }, this.getHighlightedGridRowIndex());
};


/**
 * Helper function that manages the details of moving the highlight among
 * child controls in response to keyboard events.
 * @param {function(number, number) : number} fn Function that accepts the
 *     current and maximum indices, and returns the next index to check.
 * @param {number} startRowIndex Start index.
 * @return {boolean} Whether the highlight has changed.
 * @protected
 */
pear.ui.Grid.prototype.rowHighlightHelper = function(fn, startRowIndex) {
  var curIndex = startRowIndex < 0 ? 0 : startRowIndex;
  var numItems = this.getGridRowsCount_();
  curIndex = fn.call(this, curIndex, numItems);
  this.highligtedCellIndex_ = this.getHighlightedCellIndex();
  this.highligtedCellIndex_ = this.highligtedCellIndex_ < 0 ?
      0 : this.highligtedCellIndex_;
  var gridrow = this.getGridRowAt(curIndex);
  if (gridrow && this.canHighlightGridRow(gridrow)) {
    this.setHighlightedIndexFromKeyEvent(curIndex);
    this.setHighlightedCellByIndex(this.highligtedCellIndex_);
    return true;
  }
  return false;
};


/**
 * Returns whether the given gridrow can be highlighted.
 * @param {pear.ui.GridRow?} gridrow The item to check.
 * @return {boolean} Whether the item can be highlighted.
 * @public
 */
pear.ui.Grid.prototype.canHighlightGridRow = function(gridrow) {
  if (gridrow) {
    return gridrow.isVisible() && gridrow.isEnabled();
  }
  return false;
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
  this.setHighlightedGridRowByIndex(index);
};


/**
 * Returns the GridRow that owns the given DOM node, or null if no such
 * GridRow is found.
 * @param {Node} node DOM node whose owner is to be returned.
 * @return {?pear.ui.GridRow} GridRow Container
 * @protected
 */
pear.ui.Grid.prototype.getOwnerGridRow = function(node) {
  var elem = this.getElement();
  while (node && node !== elem) {
    var id = node.id;
    var row = this.bodyCanvas_.getChild(id);
    if (row) {
      return (/** @type {pear.ui.GridRow} */ (row));
    }
    node = node.parentNode;
  }
  return null;
};


/**
 * Returns the GridCell that owns the given DOM node, or null if no such
 * GridCell is found.
 * @param {Node} node DOM node whose owner is to be returned.
 * @return {?pear.ui.GridCell} GridCell Control
 * @protected
 */
pear.ui.Grid.prototype.getOwnerGridCell = function(node) {
  var elem = this.getElement();
  var row = this.getOwnerGridRow(node);
  if (row) {
    return (/** @type {pear.ui.GridCell} */ (row.getNodeOwnerControl(node)));
  }else {
    return null;
  }
};


/**
 * Dispatch GridRow Event
 * @param  {pear.ui.GridRow} gridrow
 * @param  {string} eventName [description]
 * @private
 */
pear.ui.Grid.prototype.dispatchGridRowEvent_ = function(gridrow, eventName) {
  var index = this.indexOfGridRow(gridrow);
  var evt = new pear.ui.Grid.GridRowEvent(eventName, this, gridrow, index);
  this.dispatchEvent(evt);
};


/**
 * Dispatch Grid Events
 * @param  {string} eventName [description]
 * @private
 */
pear.ui.Grid.prototype.dispatchGridEvent_ = function(eventName) {
  var evt = new goog.events.Event(eventName, this);
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
 * Returns the keyboard event handler for this grid, lazily created the
 * first time this method is called.  The keyboard event handler listens for
 * keyboard events on the grid canvas
 * @return {goog.events.KeyHandler} Keyboard event handler for this container.
 */
pear.ui.Grid.prototype.getFocusHandler = function() {
  return this.focusHandler_ ||
      (this.focusHandler_ =
         new goog.events.FocusHandler(this.getFocusEventTarget()));
};


/**
 * Register events on Grid - Mainly Focus and Blur Events
 * @protected
 */
pear.ui.Grid.prototype.registerEventsOnGrid = function() {
  var handler = this.getHandler();
  var fh = this.getFocusHandler();

  this.getHandler().
      listenWithScope(fh, goog.events.FocusHandler.EventType.FOCUSOUT,
      this.handleBlur, false, this).
      listenWithScope(fh, goog.events.FocusHandler.EventType.FOCUSIN,
          this.handleFocus, false, this).
      listenOnce(
      this.getElement(), goog.events.EventType.CLICK,
          this.handleFocus, false, this);
};


/**
 * Register Event on Grid Header Row
 * @protected
 */
pear.ui.Grid.prototype.registerEventsOnHeaderRow = function() {
  this.headerRow_.forEachChild(function(cell) {
    if (this.Configuration_.AllowSorting) {
      this.getHandler().
          listenWithScope(cell, goog.ui.Component.EventType.ACTION,
          this.handleHeaderCellClick, false, this);
    }
    this.getHandler().
        listenWithScope(cell, pear.ui.Cell.EventType.OPTION_CLICK,
        this.handleHeaderCellOptionClick, false, this);
  }, this);
};


/**
 * Register Event on Grid Row - Avoid this
 * this can bring performance down
 * @param  {pear.ui.GridRow} row
 * @protected
 */
pear.ui.Grid.prototype.registerEventsOnGridRow = function(row) {
  var self = this;

  // Avoid Events on GridRow
};


/**
 * Register events on Event Body - Mainly Scroll Event
 * @protected
 */
pear.ui.Grid.prototype.registerEventsOnViewport = function() {
  // Capture Scroll Event on the Body Canvas Element for Virtualization
  this.getHandler().
      listenWithScope(this.viewport_.getElement(), goog.events.EventType.SCROLL,
          this.handleBodyCanvasScroll, false, this);
};


/**
 * Register events on Event Body
 * @protected
 */
pear.ui.Grid.prototype.registerEventsOnBodyCanvas = function() {
  var self = this;
  this.getHandler().
      listenWithScope(this.getKeyHandler(),
          goog.events.KeyHandler.EventType.KEY,
      this.handleKeyEventOnBodyCanvas, false, this).
      listenWithScope(this.bodyCanvas_.getElement(),
          'click',
      this.handleAction, false, self).
      listenWithScope(this.bodyCanvas_.getElement(),
          goog.events.EventType.DBLCLICK,
      this.handleDoubleClick, false, self);
};


/**
 * [description]
 * @param  {goog.events.BrowserEvent} be [description]
 * @protected
 */
pear.ui.Grid.prototype.handleBlur = function(be) {
  logger.info('handleBlur - Received event ' + be.type);
};


/**
 * Handles focus events raised when the key event target receives
 * keyboard focus.
 * @param {goog.events.BrowserEvent} be Focus event to handle.
 * @protected
 */
pear.ui.Grid.prototype.handleFocus = function(be) {
  logger.info('handleFocus - Received event ' + be.type);
  //this.debugRendering_();
  if (be.defaultPrevented) return;

  var gridrow = this.getHighlightedGridRow();
  if (gridrow && gridrow.isInDocument()) {
    this.setHighlighted_(gridrow, true, false);
    this.setHighlightedCellByIndex(this.getHighlightedCellIndex());
    this.scrollCellIntoView(gridrow);
  }
};


/**
 * @protected
 * @param {goog.events.BrowserEvent} e
 */
pear.ui.Grid.prototype.handleBodyCanvasScroll = function(e) {
  logger.info('handleBodyCanvasScroll Received event ' + e.type);

  if (e.defaultPrevented) {
    return;
  }

  if (this.previousScrollTop_ <= this.viewport_.getElement().scrollTop) {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.DOWN;
  }else {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.UP;
  }

  if (this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.DOWN ||
      this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.UP
  ) {
    this.fireViewportThrottle_();
  }

  if (this.previousScrollLeft_ <= this.viewport_.getElement().scrollLeft) {
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
  this.previousScrollTop_ = this.viewport_.getElement().scrollTop;

  e.preventDefault();
};


/**
 * Handle Header Cell Action ( Click) Event
 * this will dispatch BEFORE_HEADER_CELL_CLICK,SORT,AFTER_HEADER_CELL_CLICK
 * @param  {goog.events.Event} ge [description]
 * @protected
 */
pear.ui.Grid.prototype.handleHeaderCellClick = function(ge) {
  logger.info('handleHeaderCellClick Received event ' + ge.type);

  if (ge.defaultPrevented) {return; }

  var headerCell = ( /** @type {pear.ui.GridHeaderCell} */ (ge.target));
  var grid = ge.currentTarget;
  var prevSortedCell = this.getSortedHeaderCell();
  var evt;
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
      pear.ui.Grid.EventType.HEADER_CELL_ON_CLICK, this, headerCell);
  this.dispatchEvent(evt);

  ge.preventDefault();
};


/**
 * On Header Cell Option {Menu Container} Click
 * @param  {goog.events.Event} ge [description]
 * @protected
 */
pear.ui.Grid.prototype.handleHeaderCellOptionClick = function(ge) {
  logger.info('handleHeaderCellOptionClick Received event ' + ge.type);
  if (ge.defaultPrevented) {return;}

  var headerCell = ( /** @type {pear.ui.GridHeaderCell} */ (ge.target));
  var evt = new pear.ui.Grid.GridHeaderCellEvent(
      pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK, this, headerCell);
  this.dispatchEvent(evt);

  ge.preventDefault();
};


/**
 * Handle Action on Body - Mainly to Capture Action on GridCell
 * @param  {goog.events.BrowserEvent} be [description]
 * @protected
 */
pear.ui.Grid.prototype.handleAction = function(be) {
  logger.info('handleAction - ' + be.type);
  if (be.defaultPrevented) {return; }
  var gridcell = this.getOwnerGridCell(be.target);
  var gridrow = this.getOwnerGridRow(be.target);

  if (gridcell) {
    this.handleDataCellAction(gridcell);
  }
  be.preventDefault();
};


/**
 * Handle Double Click
 * @param  {goog.events.BrowserEvent} be [description]
 * @protected
 */
pear.ui.Grid.prototype.handleDoubleClick = function(be) {
  logger.info('handleDoubleClick -  ' + be.type);

  var gridcell = this.getOwnerGridCell(be.target);
  var gridrow = this.getOwnerGridRow(be.target);
  if (gridcell && gridrow) {
    this.showCellEditor(gridcell);
  }
  be.preventDefault();
};


/**
 * Handle action events on GridCell
 * Highlight Row , Select Row . Also dispatch DATACELL_BEFORE/AFTER Action
 * Event
 * @param  {pear.ui.GridCell} cell
 * @protected
 */
pear.ui.Grid.prototype.handleDataCellAction = function(cell) {
  var gridrow = ( /** @type {pear.ui.GridRow} */ (cell.getParent()));
  var evt;

  // Highlight
  this.setHighlightedCellByIndex(gridrow.indexOfChild(cell));
  this.highlightGridRow(gridrow);


  // Focus
  if (!this.isFocusOnGrid()) {
    this.setFocusOnGrid();
  }

  // Select Row or Cell - depend on Selection Mode
  if (this.isSelectionModeOn()) {
    this.selectGridRow();
  }

  // close Active Editor
  this.closeActiveEditor();

  evt = new pear.ui.Grid.GridDataCellEvent(
      pear.ui.Grid.EventType.DATACELL_ON_ACTION, this, cell);
  this.dispatchEvent(evt);
};


/**
 * handle Keys events on Grid
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean}   [description]
 * @protected
 */
pear.ui.Grid.prototype.handleKeyEventOnBodyCanvas = function(e) {
  logger.info('Received event ' + e.type);
  return this.handleKeyEvent(e);
};


/**
 * [handleKeyEvent description]
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 * @protected
 */
pear.ui.Grid.prototype.handleKeyEvent = function(e) {
  logger.info('Received event ' + e.type);

  if (this.isEnabled() &&
      this.getGridRowsCount_() != 0 &&
      this.handleKeyEventInternal(e))
  {
    e.preventDefault();

    var gridrow = this.getHighlightedGridRow();
    if (gridrow.isInDocument()) {
      // Good
    }else {
      this.setHighlightedGridRowByIndex(this.getViewportTopRowIndex());
      gridrow = this.getHighlightedGridRow();
    }
    this.updateViewport_();
    this.scrollCellIntoView(gridrow);
    return true;
  }
  return false;
};


/**
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 * @protected
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
    case goog.events.KeyCodes.TAB:
      this.highlightNextCell(true);
      break;
    case goog.events.KeyCodes.RIGHT:
      this.highlightNextCell();
      break;
    case goog.events.KeyCodes.LEFT:
      this.highlightPreviousCell();
      break;
    case goog.events.KeyCodes.ENTER:
      this.handleDataCellAction(this.getHighlightedCell());
      break;
    case goog.events.KeyCodes.F2:
      this.showCellEditor(this.getHighlightedCell());
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
  var i = 0;

  for (var classId in this.plugins_) {
    var plugin = this.plugins_[classId];
    plugin.dispose();
  }
  delete(this.plugins_);
  //TODO
  this.plugins_ = {};

  if (this.headerRow_) {
    this.headerRow_.dispose();
  }

  this.headerRow_ = null;

  goog.array.forEach(this.getGridRows() , function(value) {
    value.dispose();
  });
  this.gridRows_ = null;

  this.activeGridRow_ = null;

  if (this.viewport_) {
    this.viewport_.dispose();
  }
  this.viewport_ = null;

  if (this.bodyCanvas_) {
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

  delete this.maxVirtualRenderCount_;
  // goog.math.Box does not inherit goog.disposable
  this.contentCellPaddingBox_ = null;
  this.cellBorderBox_ = null;

  if (this.focusElem_) {
    goog.dom.removeNode(this.focusElem_);
  }
  this.focusElem_ = null;

  if (this.styleElem_) {
    goog.dom.removeNode(this.styleElem_);
  }
  this.styleElem_ = null;

  if (this.keyHandler_) {
    this.keyHandler_.dispose();
  }
  this.keyHandler_ = null;

  if (this.focusHandler_) {
    this.focusHandler_.dispose();
  }
  this.focusHandler_ = null;

  if (this.viewportthrottle_) {
    this.viewportthrottle_.dispose();
  }
  this.viewportthrottle_ = null;

  delete this.width_;
  delete this.height_;
  delete this.sortColumnId_;
  delete this.currentPageIndex_;
  this.cachedDataRowsViews_ = null;
  this.viewportSize_ = null;
  this.bodyCanvasSize_ = null;


  this.bodyScrollTriggerDirection_ = null;
  this.previousScrollLeft_ = null;

  delete(this.previousScrollTop_);
  delete(this.renderReadyGridRows_);
  delete(this.renderedGridRowsCache_);
  delete(this.scrollbarWidth_);


  if (this.cssStyleSheet_) {
    var rules = this.cssStyleSheet_.cssRules || this.cssStyleSheet_.rules;
    var length = rules.length;
    for (i = length - 1; i >= 0; i--) {
      goog.cssom.removeCssRule(this.cssStyleSheet_, i);
    }
  }
  this.cssInternalRules_ = null;
  this.cssStyleSheet_ = null;

  pear.ui.Grid.superClass_.disposeInternal.call(this);

};



/**
 * Object representing GridRowEvent
 *
 * @param {string} type Event type.
 * @param {pear.ui.Grid} target
 * @param {pear.ui.GridRow} gridrow
 * @param {number} index
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
pear.ui.Grid.GridSortCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {pear.ui.GridHeaderCell}
   */
  this.sortCell = cell;
  this.sortDirection = cell.getSortDirection();
};
goog.inherits(pear.ui.Grid.GridSortCellEvent, goog.events.Event);
