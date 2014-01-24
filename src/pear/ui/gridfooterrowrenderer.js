goog.provide('pear.ui.GridFooterRowRenderer');

goog.require('pear.ui.RowRenderer');



/**
  @constructor
  @extends {pear.ui.RowRenderer}
*/
pear.ui.GridFooterRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.GridFooterRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.GridFooterRowRenderer);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridFooterRowRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-row-footer');


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.GridFooterRowRenderer.prototype.getCssClass = function() {
  return pear.ui.GridFooterRowRenderer.CSS_CLASS;
};

