goog.provide('pear.ui.GridCellRenderer');

goog.require('pear.ui.CellRenderer');



/**
 * @constructor
 * @extends {pear.ui.CellRenderer}
*/
pear.ui.GridCellRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.GridCellRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.GridCellRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridCellRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-data');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.ui.GridCellRenderer.prototype.getCssClass = function() {
  return pear.ui.GridCellRenderer.CSS_CLASS;
};

/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} cellControl Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.ui.GridCellRenderer.prototype.createDom = function(cellControl) {
  // Create and return DIV wrapping contents.
  
  cellControl.addClassName(pear.ui.CellRenderer.CSS_CLASS);
  cellControl.addClassName('col'+cellControl.getCellIndex());

  var element = cellControl.getDomHelper().createDom(
      'div', this.getClassNames(cellControl).join(' '));

  var cellElement = cellControl.getDomHelper().createDom(
      'div', 'pear-grid-cell-data-content', cellControl.getContent());

  var align = cellControl.getDataColumn().getAlign();
  var aligncss = (align === pear.data.Align.LEFT)? 'pear-grid-align-left':'pear-grid-align-right';
  goog.dom.classes.add(cellElement, aligncss);

  cellControl.setContentElement(cellElement);

  cellControl.getDomHelper().appendChild(element,cellElement);
  this.setAriaStates(cellControl, element);
  return element;
};
