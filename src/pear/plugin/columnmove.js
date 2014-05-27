goog.provide('pear.plugin.ColumnMove');

goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragDropGroup');
goog.require('goog.fx.DragListGroup');
goog.require('pear.ui.Plugin');



/**
 * @classdesc ColumnMove plugin - to move column position , Activate this plugin
 * to make columns movable .
 * @constructor
 * @extends {pear.ui.Plugin}
 *
 */
pear.plugin.ColumnMove = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.ColumnMove, pear.ui.Plugin);


/**
 * Events on Plugin
 * @enum {string}
 * @public
 * @todo  Add Before Column Change and After Change event - this will require to
 * pass column which is subject to change it's position as an event parameter
 */
pear.plugin.ColumnMove.EventType = {
  /**
   * On Column Position Change
   * @type {string}
   */
  ON_COLUMN_POSITION_CHANGE: 'on-column-position-change'
};


/**
 * Dragged Header Cell
 * @type {pear.ui.GridHeaderCell}
 * @private
 */
pear.plugin.ColumnMove.prototype.currentDragCell_ = null;


/**
 * @inheritDoc
 */
pear.plugin.ColumnMove.prototype.getClassId = function() {
  return 'ColumnMove';
};


/**
 * init plugin
 */
pear.plugin.ColumnMove.prototype.init = function() {
  var grid = this.getGrid();
  this.makeColumnsDraggable_();

  goog.events.listen(grid,
      pear.ui.Grid.EventType.HEADERCELLS_RENDERED,
      this.makeColumnsDraggable_,
      false,
      this);
};


/**
 * enabling all header columns cells draggable
 * @private
 */
pear.plugin.ColumnMove.prototype.makeColumnsDraggable_ = function() {

  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();

  var dlg = new goog.fx.DragListGroup();
  dlg.setDragItemHoverClass('cursor_move');
  dlg.setDraggerElClass('cursor_move opacity_40');

  dlg.addDragList(headerRow.getElement(), goog.fx.DragListDirection.RIGHT);
  dlg.init();

  goog.events.listen(dlg, goog.fx.DragListGroup.EventType.DRAGSTART,
      this.handleDragStartEvent_, false, this);
  goog.events.listen(dlg, goog.fx.DragListGroup.EventType.DRAGEND,
      this.handleDragEvent_, false, this);
  goog.events.listen(dlg, goog.fx.DragListGroup.EventType.DRAGMOVE,
      this.handleDragMove_, false, this);
};


/**
 * handle drag start event
 * @param  {goog.fx.DragListGroupEvent} ge [description]
 * @private
 */
pear.plugin.ColumnMove.prototype.handleDragStartEvent_ = function(ge) {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  var currentDragItem = ge.currDragItem;
  var id = currentDragItem.getAttribute('id');
  this.dragColumnId_ = headerRow.getChild(id).getColumnId();
};


/**
 * handle drag move event
 * @param  {goog.fx.DragListGroupEvent} ge [description]
 * @private
 */
pear.plugin.ColumnMove.prototype.handleDragMove_ = function(ge) {
  // no-op
};


/**
 * Handle Drag End Event
 * @param  {goog.fx.DragListGroupEvent} ge [description]
 * @private
 */
pear.plugin.ColumnMove.prototype.handleDragEvent_ = function(ge) {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  var columns = grid.getColumns();// grid.getColumns_();
  var newColumns = [];
  var columnsNodes = goog.dom.getChildren(headerRow.getElement());
  goog.array.forEach(columnsNodes, function(node, index) {
    var id = node.getAttribute('id');
    newColumns[index] = headerRow.getChild(id).getDataColumn();
  },this);

  grid.setColumns(newColumns);
  // Refresh Header, Body,Footer
  grid.refreshAll();

  var dragCell = headerRow.getHeaderCellByColumnId(this.dragColumnId_);
  var evt = new pear.plugin.ColumnMoveEvent(
      pear.plugin.ColumnMove.EventType.ON_COLUMN_POSITION_CHANGE,
      this.getGrid(),
      dragCell);
  this.dispatchEvent(evt);
};


/**
 * @inheritDoc
 */
pear.plugin.ColumnMove.prototype.disposeInternal = function() {
  pear.plugin.ColumnMove.superClass_.disposeInternal.call(this);
};



/**
 * @classdesc ColumnMoveEvent for {@link pear.plugin.ColumnMove}
 * @param {string} type       Event Type
 * @param {pear.ui.Grid} target     Grid
 * @param {pear.ui.GridHeaderCell} cell dragged GridHeaderCell  cell
 * @constructor
 * @extends {goog.events.Event}
 */
pear.plugin.ColumnMoveEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);

  /**
   * Header Cell which is dragged
   * @type {pear.ui.GridHeaderCell}
   */
  this.dragCell = cell;

};
goog.inherits(pear.plugin.ColumnMoveEvent, goog.events.Event);
