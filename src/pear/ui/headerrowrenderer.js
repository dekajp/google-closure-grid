goog.provide('pear.ui.HeaderRowRenderer');

goog.require('pear.ui.RowRenderer');



/**
  @constructor
  @extends {pear.ui.RowRenderer}
*/
pear.ui.HeaderRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.HeaderRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.HeaderRowRenderer);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.HeaderRowRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-row-header');


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.HeaderRowRenderer.prototype.getCssClass = function() {
  return pear.ui.HeaderRowRenderer.CSS_CLASS;
};

