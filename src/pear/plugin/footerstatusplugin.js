goog.provide('pear.plugin.FooterStatus');

goog.require('pear.ui.Plugin');




pear.plugin.FooterStatus = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.FooterStatus, pear.ui.Plugin);


pear.plugin.FooterStatus.prototype.getClassId = function() {
  return 'FooterStatus';
};

pear.plugin.FooterStatus.prototype.init = function(){
  var grid = this.getGrid();
  this.createFooterStatus()
}

pear.plugin.FooterStatus.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.footerStatus_.dispose();
  if (this.footer_){
    this.footer_.remove();
    this.footer_ = null;
  }
  pear.plugin.FooterStatus.superClass_.disposeInternal.call(this);
};


/**
 * @override
 *
 */
pear.plugin.FooterStatus.prototype.createFooterStatus = function() {

  var grid = this.getGrid();
  var parentElem = grid.getElement();
  this.footer_ = goog.dom.getNextElementSibling(grid.getElement());
  if ( this.footer_ && goog.dom.classes.has(this.footer_, 'pear-grid-footer')){

  }else{
    this.footer_ = goog.dom.createDom('div', 'pear-grid-footer');
    goog.dom.insertSiblingAfter(this.footer_,parentElem);
  }

  this.footerStatus_ = new goog.ui.Control(
        goog.dom.createDom('div'),
        pear.plugin.FooterStatusRenderer.getInstance());
  
  this.footerStatus_.render(this.footer_);
  this.updateMsg_();
  
  goog.events.listen(grid.getDataView(),pear.data.DataView.EventType.PAGE_INDEX_CHANGED,this.updateMsg_,false,this);
  goog.events.listen(grid.getDataView(),pear.data.DataView.EventType.PAGE_SIZE_CHANGED,this.updateMsg_,false,this);
  goog.events.listen(grid.getDataView(),pear.data.DataView.EventType.ROWCOUNT_CHANGED,this.updateMsg_,false,this);
};

pear.plugin.FooterStatus.prototype.updateMsg_ = function(){
  var grid = this.getGrid();
  var startIndex = 1;
  var rowCount = grid.getRowCount();
  var endIndex = grid.getDataView().getRowViews().length;
  var configuration = grid.getConfiguration();
  var currentPageIndex = grid.getCurrentPageIndex();

  if (configuration.AllowPaging){
    startIndex = ( currentPageIndex  )* configuration.PageSize;
    endIndex = (startIndex + configuration.PageSize) > rowCount  ? rowCount : (startIndex + configuration.PageSize);
  }
  startIndex = startIndex ? startIndex : 1;
  this.footerStatus_.setContent("["+startIndex+" - "+endIndex+"]");
};



goog.provide('pear.plugin.FooterStatusRenderer');

goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');

/**
  @constructor
  @extends {goog.ui.ControlRenderer}
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
                                  goog.getCssName('pear-grid-footer-status');


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



