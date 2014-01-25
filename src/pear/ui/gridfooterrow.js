goog.provide('pear.ui.GridFooterRow');

goog.require('pear.ui.GridFooterRowRenderer');
goog.require('pear.ui.Row');



/**
 * FooterRow
 *
 * @constructor
 * @extends {pear.ui.Row}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.GridFooterRow = function(grid,height, opt_orientation, opt_renderer, opt_domHelper) {

  pear.ui.Row.call(this, grid,height, goog.ui.Container.Orientation.HORIZONTAL,
      pear.ui.GridFooterRowRenderer.getInstance(),
      opt_domHelper);
   this.setFocusable(false);
};
goog.inherits(pear.ui.GridFooterRow, pear.ui.Row);

pear.ui.GridFooterRow.prototype.pager_ = null;

pear.ui.GridFooterRow.prototype.getPager = function(){
  return this.pager_;
};


pear.ui.GridFooterRow.prototype.disposeInternal = function() {
  if (this.pager_){
    this.pager_.dispose();
    this.pager_=null;
  }
  pear.ui.GridFooterRow.superClass_.disposeInternal.call(this);
};

/**
 * @override
 *
 */
pear.ui.GridFooterRow.prototype.enterDocument = function() {
  pear.ui.GridFooterRow.superClass_.enterDocument.call(this);
  var config = this.getGrid().getConfiguration();
  this.setHeight(5);
  var elem = this.getElement();
  this.setPosition_();
  goog.style.setSize(elem, this.getGrid().getWidth(),
      this.getHeight());
  
};
