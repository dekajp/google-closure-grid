goog.provide('pear.ui.FooterStatusRenderer');

goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');



/**
  @constructor
  @extends {goog.ui.ControlRenderer}
*/
pear.ui.FooterStatusRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.ui.FooterStatusRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.ui.FooterStatusRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.FooterStatusRenderer.CSS_CLASS = 
                                  goog.getCssName('pear-grid-footer-status');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.ui.FooterStatusRenderer.prototype.getCssClass = function() {
  return pear.ui.FooterStatusRenderer.CSS_CLASS;
};


/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} control Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.ui.FooterStatusRenderer.prototype.createDom = function(control) {
  // Create and return DIV wrapping contents.
  var element = control.getDomHelper().createDom(
      'div', this.getClassNames(control).join(' '), control.getContent());

  this.setAriaStates(control, element);
  return element;
};



