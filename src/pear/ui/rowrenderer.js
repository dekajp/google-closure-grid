
goog.provide('pear.ui.RowRenderer');

goog.require('goog.ui.ContainerRenderer');



/**
  @constructor
  @extends {goog.ui.ContainerRenderer}
*/
pear.ui.RowRenderer = function() {
  goog.ui.ContainerRenderer.call(this);
};
goog.inherits(pear.ui.RowRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(pear.ui.RowRenderer);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.RowRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-row');


/**
 * Returns the CSS class to be applied to the root element of containers
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.RowRenderer.prototype.getCssClass = function() {
  return pear.ui.RowRenderer.CSS_CLASS;
};


/**
 * Returns the default orientation of containers rendered or decorated by this
 * renderer.  The base class implementation returns {@code HORIZONTAL}.
 * @return {goog.ui.Container.Orientation} Default orientation for containers
 *     created or decorated by this renderer.
 */
pear.ui.RowRenderer.prototype.getDefaultOrientation = function() {
  return goog.ui.Container.Orientation.HORIZONTAL;
};
