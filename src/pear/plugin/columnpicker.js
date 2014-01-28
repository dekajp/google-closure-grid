goog.provide('pear.plugin.ColumnPicker');

goog.require('pear.ui.Plugin');
goog.require('goog.fx.DragDropGroup');
goog.require('goog.fx.DragDrop');
goog.require('goog.fx.DragListGroup');





pear.plugin.ColumnPicker = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.ColumnPicker, pear.ui.Plugin);


pear.plugin.ColumnPicker.prototype.getClassId = function() {
  return 'ColumnPicker';
};

pear.plugin.ColumnPicker.prototype.init = function(){
  var grid = this.getGrid();
  this.makeColumnsDraggable();

  goog.events.listen(grid,pear.ui.Grid.EventType.HEADERCELLS_RENDERED,this.makeColumnsDraggable,false,this);
}

pear.plugin.ColumnPicker.prototype.disposeInternal = function() {
  this.grid_ = null;
  
  pear.plugin.ColumnPicker.superClass_.disposeInternal.call(this);
};



pear.plugin.ColumnPicker.prototype.makeColumnsDraggable = function() {

  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  
  /*var dlg = new goog.fx.DragDropGroup();
  headerRow.forEachChild (function (headercell){
    dlg.addItem(headercell.getElement(), headercell.getElement().firstChild.nodeValue);
  });
  
  headerRow.forEachChild (function (headercell){
    dlg.addTarget(new goog.fx.DragDrop (headercell.getElement()));
  });
  dlg.setDragClass('drag-class');
  //dlg.setSourceClass('source-class');
  dlg.setTargetClass('target-class');
  dlg.init();

  goog.events.listen(dlg,goog.fx.AbstractDragDrop.EventType.DRAGEND ,this.handleDragEvent_,false,this);
  goog.events.listen(dlg,goog.fx.AbstractDragDrop.EventType.DRAG ,this.handleDragMove_,false,this);
  */

   var dlg = new goog.fx.DragListGroup();
   dlg.setDragItemHoverClass('cursor_move');
   dlg.setDraggerElClass('cursor_move opacity_40');

   dlg.addDragList(headerRow.getElement(),goog.fx.DragListDirection.RIGHT);
   dlg.init();

   goog.events.listen(dlg,goog.fx.DragListGroup.EventType.DRAGEND ,this.handleDragEvent_,false,this);
   goog.events.listen(dlg,goog.fx.DragListGroup.EventType.DRAGMOVE ,this.handleDragMove_,false,this);
};

pear.plugin.ColumnPicker.prototype.handleDragMove_ = function(ge) {
  
};

pear.plugin.ColumnPicker.prototype.handleDragEvent_ = function(ge) {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  var columns = grid.getColumns_();
  var newColumns = [];
  var columnsNodes = goog.dom.getChildren(headerRow.getElement());
  goog.array.forEach(columnsNodes,function(node,index){
    var id = node.getAttribute('id');
    newColumns[index] = headerRow.getChild(id).getCellData();
  },this);

  grid.setColumns(newColumns);
  grid.refreshHeader();
  grid.refresh();

};




goog.provide('pear.plugin.ColumnPickerRenderer');

goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');

/**
  @constructor
  @extends {goog.ui.ControlRenderer}
*/
pear.plugin.ColumnPickerRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.plugin.ColumnPickerRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.plugin.ColumnPickerRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.plugin.ColumnPickerRenderer.CSS_CLASS = 
                                  goog.getCssName('pear-grid-footer-status');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.plugin.ColumnPickerRenderer.prototype.getCssClass = function() {
  return pear.plugin.ColumnPickerRenderer.CSS_CLASS;
};


/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} control Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.plugin.ColumnPickerRenderer.prototype.createDom = function(control) {
  // Create and return DIV wrapping contents.
  var element = control.getDomHelper().createDom(
      'div', this.getClassNames(control).join(' '), control.getContent());

  this.setAriaStates(control, element);
  return element;
};



