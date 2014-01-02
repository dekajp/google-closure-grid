goog.provide('pear.ui.FooterRow');

goog.require('pear.ui.FooterRowRenderer');
goog.require('pear.ui.FooterStatusRenderer');
goog.require('pear.ui.Row');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarSelect');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('pear.ui.Pager');

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
pear.ui.FooterRow = function(grid,height, opt_orientation, opt_renderer, opt_domHelper) {

  pear.ui.Row.call(this, grid,height, goog.ui.Container.Orientation.HORIZONTAL,
      pear.ui.FooterRowRenderer.getInstance(),
      opt_domHelper);
   this.setFocusable(false);
};
goog.inherits(pear.ui.FooterRow, pear.ui.Row);

pear.ui.FooterRow.prototype.pager_ = null;

pear.ui.FooterRow.prototype.getPager = function(){
  return this.pager_;
};

/**
 * @override
 *
 */
pear.ui.FooterRow.prototype.enterDocument = function() {
  pear.ui.FooterRow.superClass_.enterDocument.call(this);
  var config = this.getGrid().getConfiguration();
  var elem = this.getElement();
  this.setPosition_();
  goog.style.setSize(elem, this.getGrid().getWidth(),
      config.RowHeight);
  if (config.AllowPaging){
    this.createPager_();
  }
  this.createFooterStatus_();
};

/**
 * @private
 *
 */
pear.ui.FooterRow.prototype.createPager_ = function() {
  var elem = this.getElement();
  this.pager_ = new pear.ui.Pager(this.getGrid(),
                                this.getHeight());
  this.pager_.render(elem);
};

/**
 * @private
 *
 */
pear.ui.FooterRow.prototype.createFooterStatus_ = function() {
  var elem = this.getElement();
  var footerStatus = new goog.ui.Control('',
                                    pear.ui.FooterStatusRenderer.getInstance());
  footerStatus.render(elem);
  this.footerMsgElem = goog.dom.createDom("span",
                              'pear-grid-footer-status-msg');
  goog.dom.appendChild(footerStatus.getElement(),this.footerMsgElem);
  
};


pear.ui.FooterRow.prototype.setFooterMsg = function(msg) {
  goog.dom.setTextContent(this.footerMsgElem,msg);
};