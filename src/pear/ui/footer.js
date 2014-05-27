goog.provide('pear.ui.Footer');

goog.require('goog.ui.Component');



/**
 * @class
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Footer = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(pear.ui.Footer, goog.ui.Component);


/**
 * @override
 */
pear.ui.Footer.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();

  goog.dom.classes.set(elem, 'pear-grid-footer');
};

