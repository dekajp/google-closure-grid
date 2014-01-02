goog.provide('pear.ui.FooterRowRenderer');

goog.require('pear.ui.RowRenderer');



/**
  @constructor
  @extends {pear.ui.RowRenderer}
*/
pear.ui.FooterRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.FooterRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.FooterRowRenderer);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.FooterRowRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-row-footer');


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.FooterRowRenderer.prototype.getCssClass = function() {
  return pear.ui.FooterRowRenderer.CSS_CLASS;
};

