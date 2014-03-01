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
 */
pear.plugin.ColumnMove = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.ColumnMove, pear.ui.Plugin);


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
  this.makeColumnsDraggable();

  goog.events.listen(grid, pear.ui.Grid.EventType.HEADERCELLS_RENDERED, this.makeColumnsDraggable, false, this);
};


/**
 * enabling all header columns cells draggable
 * @private
 */
pear.plugin.ColumnMove.prototype.makeColumnsDraggable = function() {

  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();

  var dlg = new goog.fx.DragListGroup();
  dlg.setDragItemHoverClass('cursor_move');
  dlg.setDraggerElClass('cursor_move opacity_40');

  dlg.addDragList(headerRow.getElement(), goog.fx.DragListDirection.RIGHT);
  dlg.init();

  goog.events.listen(dlg, goog.fx.DragListGroup.EventType.DRAGEND, this.handleDragEvent_, false, this);
  goog.events.listen(dlg, goog.fx.DragListGroup.EventType.DRAGMOVE, this.handleDragMove_, false, this);
};

/**
 * handle drag move event
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.plugin.ColumnMove.prototype.handleDragMove_ = function(ge) {
  // no-op
};

/**
 * Handle Drag End Event
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.plugin.ColumnMove.prototype.handleDragEvent_ = function(ge) {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  var columns =grid.getColumns();// grid.getColumns_();
  var newColumns = [];
  var columnsNodes = goog.dom.getChildren(headerRow.getElement());
  goog.array.forEach(columnsNodes, function(node, index) {
    var id = node.getAttribute('id');
    newColumns[index] = headerRow.getChild(id).getCellData();
  },this);

  grid.setColumns(newColumns);
  grid.refreshHeader();
  grid.refresh();
};

/**
 * @inheritDoc
 */
pear.plugin.ColumnMove.prototype.disposeInternal = function() {
  this.setGrid(null);

  pear.plugin.ColumnMove.superClass_.disposeInternal.call(this);
};