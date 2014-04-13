goog.provide('pear.ui.GridHeaderCellRenderer');

goog.require('pear.ui.CellRenderer');



/**
 * @constructor
 * @extends {pear.ui.CellRenderer}
 */
pear.ui.GridHeaderCellRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.GridHeaderCellRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.GridHeaderCellRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridHeaderCellRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-header');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.ui.GridHeaderCellRenderer.prototype.getCssClass = function() {
  return pear.ui.CellRenderer.CSS_CLASS;
};


/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} cellControl Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.ui.GridHeaderCellRenderer.prototype.createDom = function(cellControl) {
  // Create and return DIV wrapping contents.
  
  cellControl.addClassName(pear.ui.GridHeaderCellRenderer.CSS_CLASS);
  cellControl.addClassName('col'+cellControl.getCellIndex());

  var element = cellControl.getDomHelper().createDom(
      'div', this.getClassNames(cellControl).join(' '), cellControl.getContent());

  this.setAriaStates(cellControl, element);
  return element;
};