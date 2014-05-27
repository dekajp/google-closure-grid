
goog.provide('pear.ui.editor.CellEditorMediator');


goog.require('goog.Disposable');
goog.require('pear.ui.GridCell');
goog.require('pear.ui.editor.IEditor');



/**
 * Mediator class for Cell Editing - All editors commands are mediated by
 * this class
 * @constructor
 * @param {pear.ui.Grid} grid
 * @extends { goog.Disposable}
 */
pear.ui.editor.CellEditorMediator = function(grid) {
  goog.Disposable.call(this);
  this.grid_ = grid;
};
goog.inherits(pear.ui.editor.CellEditorMediator, goog.Disposable);


/**
 * Whether Mediator is Active - if a gridcell is hosting a editor ,
 *  in open state then Mediator is suppose to be active
 * @return {boolean}
 */
pear.ui.editor.CellEditorMediator.prototype.isActive = function() {
  return this.gridcell_ ? true : false;
};


/**
 * Get Grid Cell
 * @return {pear.ui.GridCell}
 */
pear.ui.editor.CellEditorMediator.prototype.getGridCell = function() {
  return this.gridcell_;
};


/**
 * Get Grid Row
 * @return {pear.ui.GridRow}
 */
pear.ui.editor.CellEditorMediator.prototype.getGridRow = function() {
  return this.gridcell_.getParent();
};


/**
 * Get Instance of Grid
 * @return {pear.ui.Grid}
 */
pear.ui.editor.CellEditorMediator.prototype.getGrid = function() {
  return this.grid_;
};


/**
 * Rollback Editor
 */
pear.ui.editor.CellEditorMediator.prototype.rollback = function() {
  this.ieditor_.close();
  this.ieditor_.dispose();
  this.getGridCell().createContentElement();
  this.grid_.setFocusOnGrid();
  this.destroyGridCell();
};


/**
 * Commit
 */
pear.ui.editor.CellEditorMediator.prototype.commit = function() {
  var cell = this.gridcell_;
  var columnid = cell.getDataColumn().getId();
  var rowid = cell.getParent().getDataRowId();
  var oldrowdata = this.grid_.getDataView().getDataRowById(rowid);
  var newrowdata = (/** @type {Object.<string,*>} */
      (goog.object.unsafeClone(oldrowdata)));
  var newValue = this.ieditor_.getNewValue();

  newrowdata[columnid] = newValue;

  if (this.ieditor_.validateInternal(oldrowdata, newrowdata)) {
    this.grid_.updateDataRow(rowid, newrowdata);
    this.ieditor_.close();
    this.grid_.refresh();
    this.grid_.setFocusOnGrid();
    this.destroyGridCell();
  }else {
    this.ieditor_.setFocus();
  }
};


/**
 * Activate Editor - this will open the Editor on Target GridCell
 * @param {pear.ui.GridCell} gridcell  on which editor will open
 */
pear.ui.editor.CellEditorMediator.prototype.ActivateCellEditor =
    function(gridcell) {
  this.gridcell_ = gridcell;
  this.ieditor_ = this.grid_.getEditor(gridcell.getDataColumn());
  if (this.ieditor_) {
    this.ieditor_.setMediator(this);
    this.ieditor_.open();
  }
};


/**
 * GridCell Ref null out
 * @protected
 */
pear.ui.editor.CellEditorMediator.prototype.destroyGridCell = function() {
  this.gridcell_ = null;
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects
 * @protected
 */
pear.ui.editor.CellEditorMediator.prototype.disposeInternal = function() {
  if (this.gridcell_ && this.ieditor_) {
    this.rollback();
  }
  this.gridcell_ = null;
  if (this.ieditor_) {
    this.ieditor_.dispose();
  }
  this.ieditor_ = null;

  pear.ui.editor.CellEditorMediator.superClass_.disposeInternal.call(this);
};
