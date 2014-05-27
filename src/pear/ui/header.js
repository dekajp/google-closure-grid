goog.provide('pear.ui.Header');

goog.require('goog.ui.Component');



/**
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Header = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
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

