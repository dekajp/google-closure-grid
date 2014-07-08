goog.provide('pear.plugin.FooterStatus');

goog.require('pear.ui.Plugin');



/**
 * @class  pear.plugin.FooterStatus
 * @classdesc
 * FooterStatus Plugin - very basic plugin to show total rows as
 * footer row
 * @constructor
 * @extends {pear.ui.Plugin}
 */
pear.plugin.FooterStatus = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.FooterStatus, pear.ui.Plugin);


/**
 * class id
 * @return {string} [description]
 */
pear.plugin.FooterStatus.prototype.getClassId = function() {
  return 'FooterStatus';
};


/**
 * Init plugin
 */
pear.plugin.FooterStatus.prototype.init = function() {
  var grid = this.getGrid();
  this.createFooterStatus_();
};


/**
 * @override
 */
pear.plugin.FooterStatus.prototype.disposeInternal = function() {
  this.footerStatus_.dispose();
  if (this.footer_) {
    goog.dom.removeNode(this.footer_);
    this.footer_ = null;
  }
  pear.plugin.FooterStatus.superClass_.disposeInternal.call(this);
};


/**
 * create plugin UI DOM
 * @private
 *
 */
pear.plugin.FooterStatus.prototype.createFooterStatus_ = function() {

  var grid = this.getGrid();
  var parentElem = grid.getElement();
  this.footer_ = goog.dom.getNextElementSibling(grid.getElement());
  if (this.footer_ &&
      goog.dom.classes.has(this.footer_, 'pear-grid-footer-panel')) {

  }else {
    this.footer_ = goog.dom.createDom('div', 'pear-grid-footer-panel');
    goog.dom.insertSiblingAfter(this.footer_, parentElem);

    // Set Width
    goog.style.setWidth(this.footer_, grid.getWidth());
  }

  this.footerStatus_ = new goog.ui.Control(
      goog.dom.createDom('div'),
      pear.plugin.FooterStatusRenderer.getInstance());

  this.footerStatus_.render(this.footer_);
  this.handleDataSourceChange_();

  goog.events.listen(grid, pear.ui.Grid.EventType.DATAROWS_CHANGED,
      this.handleDataSourceChange_, false, this);
};


/**
 * Update Footer Status
 * @private
 */
pear.plugin.FooterStatus.prototype.handleDataSourceChange_ = function() {
  var grid = this.getGrid();
  var startIndex = 1;
  var rowCount = grid.getDataViewRowCount();
  startIndex = startIndex ? startIndex : 1;
  this.footerStatus_.setContent('[' + startIndex + ' - ' + rowCount + ']');
};



goog.provide('pear.plugin.FooterStatusRenderer');

goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');



/**
 * @class pear.plugin.FooterStatusRenderer
 * @classdesc {@link pear.plugin.FooterStatus} Renderer
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
pear.plugin.FooterStatusRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.plugin.FooterStatusRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.plugin.FooterStatusRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.plugin.FooterStatusRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-footer-panel-status');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.plugin.FooterStatusRenderer.prototype.getCssClass = function() {
  return pear.plugin.FooterStatusRenderer.CSS_CLASS;
};


/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} control Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.plugin.FooterStatusRenderer.prototype.createDom = function(control) {
  // Create and return DIV wrapping contents.
  var element = control.getDomHelper().createDom(
      'div', this.getClassNames(control).join(' '), control.getContent());

  this.setAriaStates(control, element);
  return element;
};



