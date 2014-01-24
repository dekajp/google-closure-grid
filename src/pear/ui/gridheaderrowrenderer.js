goog.provide('pear.ui.GridHeaderRowRenderer');

goog.require('pear.ui.RowRenderer');



/**
  @constructor
  @extends {pear.ui.RowRenderer}
*/
pear.ui.GridHeaderRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.GridHeaderRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.GridHeaderRowRenderer);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridHeaderRowRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-row-header');


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.GridHeaderRowRenderer.prototype.getCssClass = function() {
  return pear.ui.GridHeaderRowRenderer.CSS_CLASS;
};

