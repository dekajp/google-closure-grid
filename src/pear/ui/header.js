goog.provide('pear.ui.Header');

goog.require('goog.ui.Component');



/**
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Header = function(opt_domHelper, opt_renderer) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
};
goog.inherits(pear.ui.Header, goog.ui.Component);


/**
 * @override
 */
pear.ui.Header.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();

  goog.dom.classes.set(elem, 'pear-grid-header');
};

