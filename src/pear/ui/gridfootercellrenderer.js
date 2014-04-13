goog.provide('pear.ui.GridFooterCellRenderer');

goog.require('pear.ui.CellRenderer');



/**
 * @constructor
 * @extends {pear.ui.CellRenderer}
*/
pear.ui.GridFooterCellRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.GridFooterCellRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.GridFooterCellRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridFooterCellRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-footer');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.ui.GridFooterCellRenderer.prototype.getCssClass = function() {
  return pear.ui.CellRenderer.CSS_CLASS;
};

/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} cellControl Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.ui.GridFooterCellRenderer.prototype.createDom = function(cellControl) {
  // Create and return DIV wrapping contents.

  cellControl.addClassName(pear.ui.GridFooterCellRenderer.CSS_CLASS);
  cellControl.addClassName('col'+cellControl.getCellIndex());

  var element = cellControl.getDomHelper().createDom(
      'div', this.getClassNames(cellControl).join(' '));

  var cellElement = cellControl.getDomHelper().createDom(
      'div', 'pear-grid-cell-data-content', cellControl.getContent());

  cellControl.setContentElement(cellElement);

  cellControl.getDomHelper().appendChild(element,cellElement);
  this.setAriaStates(cellControl, element);
  return element;
};