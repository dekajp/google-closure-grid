goog.provide('pear.plugin.FooterStatus');
goog.provide('pear.plugin.FooterStatusRenderer');

goog.require('goog.ui.Component');
goog.require('goog.events.Event');
goog.require('goog.ui.ComboBox');
goog.require('pear.ui.Plugable');



/**
 * Pager - Pager Navigation and Pager Dropdown Plugin
 *
 * @constructor
 * @extends {goog.ui.Container}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.plugin.FooterStatus = function(grid,opt_renderer,opt_domHelper) {
  goog.ui.Component.call(this,opt_renderer || pear.ui.RowRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(pear.plugin.FooterStatus, goog.ui.Component);
pear.ui.Plugable.addImplementation(pear.plugin.FooterStatus);



pear.plugin.FooterStatus.prototype.getGrid = function() {
  return this.grid_;
};

pear.plugin.FooterStatus.prototype.show = function(grid){
  this.grid_ = grid;
  var parentElem = grid.getElement();
  var footer = goog.dom.getNextElementSibling(grid.getElement());
  if ( footer && goog.dom.classes.has(footer, 'pear-grid-footer')){

  }else{
    footer = goog.dom.createDom('div', 'pear-grid-footer');
    goog.dom.insertSiblingAfter(footer,parentElem);
  }
  this.render(footer);
}

/**
 * @override
 */
pear.plugin.FooterStatus.prototype.createDom = function() {
  this.element_ = goog.dom.createDom('div', 'pear-grid-footer-status');
};

pear.plugin.FooterStatus.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.footerStatus_.dispose();
  pear.plugin.FooterStatus.superClass_.disposeInternal.call(this);
};


/**
 * @override
 *
 */
pear.plugin.FooterStatus.prototype.enterDocument = function() {
  pear.plugin.FooterStatus.superClass_.enterDocument.call(this);
  
  this.footerStatus_ = new goog.ui.Control(
        goog.dom.createDom('div'),
        pear.plugin.FooterStatusRenderer.getInstance());
  
  this.footerStatus_.render(this.getElement());
  this.updateMsg_();
  
  goog.events.listen(this.grid_,pear.ui.Grid.EventType.AFTER_PAGING,this.updateMsg_,false,this);
};

pear.plugin.FooterStatus.prototype.updateMsg_ = function(){
  var grid = this.grid_;
  var startIndex = 1;
  var rowCount = grid.getRowCount();
  var endIndex = grid.getDataView().getRowViews().length;
  var configuration = grid.getConfiguration();
  var currentPageIndex = grid.getCurrentPageIndex();

  if (configuration.AllowPaging){
    startIndex = ( currentPageIndex - 1 )* configuration.PageSize;
    endIndex = (currentPageIndex * configuration.PageSize ) > rowCount  ? rowCount : ( currentPageIndex * configuration.PageSize );
  }
  startIndex = startIndex ? startIndex : 1;
  this.footerStatus_.setContent("["+startIndex+" - "+endIndex+"]");
};




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



