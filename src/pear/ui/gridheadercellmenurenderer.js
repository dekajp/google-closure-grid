goog.provide('pear.ui.GridHeaderCellMenuRenderer');

goog.require('pear.ui.CellRenderer');



/**
 * @constructor
 * @extends {pear.ui.CellRenderer}
 */
pear.ui.GridHeaderCellMenuRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.GridHeaderCellMenuRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.GridHeaderCellMenuRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridHeaderCellMenuRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-header-slidemenu');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.ui.GridHeaderCellMenuRenderer.prototype.getCssClass = function() {
  return pear.ui.GridHeaderCellMenuRenderer.CSS_CLASS;
};
