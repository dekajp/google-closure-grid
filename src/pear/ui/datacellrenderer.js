goog.provide('pear.ui.DataCellRenderer');

goog.require('pear.ui.CellRenderer');



/**
 * @constructor
 * @extends {pear.ui.CellRenderer}
*/
pear.ui.DataCellRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.DataCellRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.DataCellRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.DataCellRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-data');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.ui.DataCellRenderer.prototype.getCssClass = function() {
  return pear.ui.DataCellRenderer.CSS_CLASS;
};

