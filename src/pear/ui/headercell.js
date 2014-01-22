goog.provide('pear.ui.HeaderCell');

goog.require('pear.ui.Cell');
goog.require('pear.ui.HeaderCellRenderer');
goog.require('pear.ui.HeaderCellContentRenderer');
goog.require('pear.ui.HeaderCellMenuRenderer');
goog.require('pear.ui.Resizable');
goog.require('pear.fx.dom.Slide');



/**
 * HeaderCell
 *
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {pear.ui.Cell}
 */
pear.ui.HeaderCell = function(opt_renderer,opt_domHelper) {
  pear.ui.Cell.call(this, 
                    opt_renderer || pear.ui.HeaderCellRenderer.getInstance(),
                    opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
};
goog.inherits(pear.ui.HeaderCell, pear.ui.Cell);

/**
 * @private
 * @type {goog.ui.Control}
 */
pear.ui.HeaderCell.prototype.headerMenuContainer_ = null;


/**
 * @private
 * @type {goog.ui.Control}
 */
pear.ui.HeaderCell.prototype.contentCell_ = null;


pear.ui.HeaderCell.prototype.disposeInternal = function() {
  if (this.resizable_){
    this.resizable_.dispose();
    this.resizable_= null;
  }
  this.headerMenuContainer_=null
  this.sortDirection_ = null;
  pear.ui.HeaderCell.superClass_.disposeInternal.call(this);
};

/**
 * @private
 * @type {enum}
 */
pear.ui.HeaderCell.prototype.sortDirection_ = null;
pear.ui.HeaderCell.prototype.resizable_ = null;

pear.ui.HeaderCell.prototype.getSortDirection = function() {
  this.sortDirection_ = this.sortDirection_ || pear.ui.Grid.SortDirection.NONE;
  return this.sortDirection_;
};

pear.ui.HeaderCell.prototype.setsortDirection = function(value) {
  this.sortDirection_ = value || pear.ui.Grid.SortDirection.NONE;
}


pear.ui.HeaderCell.prototype.getMenuControl = function() {
  return this.headerMenuContainer_;
};


pear.ui.HeaderCell.prototype.setMenuState = function(open) {
  this.keepSlideMenuOpen_=open;
};

/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.HeaderCell.prototype.getContent = function() {
  //return this.getModel()['headerText'];
  return '';
};

pear.ui.HeaderCell.prototype.getContentText = function() {
  return this.getModel()['headerText']
};

pear.ui.HeaderCell.prototype.getCellData = function() {
  return this.getModel();
};

pear.ui.HeaderCell.prototype.getColumnId = function() {
  return this.getCellData()["id"];
};

pear.ui.HeaderCell.prototype.getContentIndicatorElement = function(){
  return this.contentIndicator_;
}
/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.HeaderCell.prototype.enterDocument = function() {
  pear.ui.HeaderCell.superClass_.enterDocument.call(this);
  this.splitHeaderCell_();
  this.registerEvent_();
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.registerEvent_ = function(){
  this.getHandler().
      listen(this, goog.ui.Component.EventType.ENTER,
          this.handleEnter_,false,this).
      listen(this, goog.ui.Component.EventType.LEAVE,
          this.handleLeave_,false,this).
      listen(this.getElement(), goog.events.EventType.CLICK,
          this.handleActive_,false,this);
};

/**
 * @private
 * Header cell is divided into 3 content , indicators and sliding menu
 */
pear.ui.HeaderCell.prototype.splitHeaderCell_ = function(){
  var grid = this.getGrid();

  // Header Cell Content
  this.contentCell_ = goog.dom.createDom('div',
                                        'pear-grid-cell-header-content',
                                        this.getContentText()
                                        );
  goog.dom.appendChild(this.getElement(),this.contentCell_);
  
  //this.syncContentCellOnResize_();

  // Indicators
  this.createHeaderCellIndicatorPlaceHolder_();

  if (grid.getConfiguration().AllowColumnHeaderMenu){
    // Header Menu
    this.createHeaderCellMenu_();
  }
  if (grid.getConfiguration().AllowColumnResize){
    this.createResizeHandle_();
  }
};

pear.ui.HeaderCell.prototype.createHeaderCellIndicatorPlaceHolder_ = function(){
  // Header Menu Control
  this.contentIndicator_ = goog.dom.createDom('div',
                                        'pear-grid-cell-header-indicators'
                                        );
  goog.dom.appendChild(this.getElement(),this.contentIndicator_);
  
};


pear.ui.HeaderCell.prototype.createHeaderCellMenu_ = function(){
  // Header Menu Control
  this.headerMenuContainer_ = new goog.ui.Control(null,pear.ui.HeaderCellMenuRenderer.getInstance());
  this.headerMenuContainer_.setSupportedState(goog.ui.Component.State.ALL, false);
  this.headerMenuContainer_.render(this.getElement());
};

pear.ui.HeaderCell.prototype.createResizeHandle_ = function(){
  var resizeData = {
    handles: pear.ui.Resizable.Position.RIGHT
  };
  
  this.resizable_ = new pear.ui.Resizable(this.getElement(),resizeData);
  this.getHandler().
        listen(this.resizable_, pear.ui.Resizable.EventType.RESIZE,
          this.handleResize_,false,this).
        listen(this.resizable_, pear.ui.Resizable.EventType.END_RESIZE,
          this.handleResizeEnd_,false,this);
};


pear.ui.HeaderCell.prototype.syncContentCellOnResize_ = function(){
  var bound = goog.style.getContentBoxSize(this.getElement());
  goog.style.setWidth(this.contentCell_,bound.width);
};

pear.ui.HeaderCell.prototype.getHeaderMenuContainerWidth = function(){
  // TODO
  var bounds = goog.style.getBounds(this.headerMenuContainer_.getElement());
  return bounds.width;
};

pear.ui.HeaderCell.prototype.slideMenuOpen = function(display){
  var marginleft = 0;
  var left = 0;
  var width = this.getHeaderMenuContainerWidth();
  if (this.headerMenuContainer_ && display ){
    marginleft = marginleft + width;
  }else{
    marginleft = marginleft + 0;
  }
  marginleft = marginleft * -1;
  this.handleMenuSlide_(this.headerMenuContainer_.getElement(),[marginleft]);
};

pear.ui.HeaderCell.prototype.handleMenuSlide_ = function(el,value) {
  
  var anim = new pear.fx.dom.Slide (el, [0], value, 300);
  //goog.events.listen(anim, goog.fx.Transition.EventType.BEGIN,disableButtons);
  //goog.events.listen(anim, goog.fx.Transition.EventType.END, enableButtons);
  anim.play();
}





/**
 * @private
 * @override the events - do not propagate events to container
 */
pear.ui.HeaderCell.prototype.handleChildMouseEvents_ = function(ge){
  ge.stopPropagation();
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleActive_ = function(ge){
  ge.stopPropagation();
  if ( this.resizable_ && this.resizable_.getResizehandle(pear.ui.Resizable.Position.RIGHT) === 
                    ge.target){
    // Ignore
    
  }else{
    if (this.getGrid().getConfiguration().AllowSorting){
      var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.CLICK,
        this);
      this.dispatchEvent(clickEvent);
    }
  }
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleEnter_ = function(){
  if (this.getGrid().getConfiguration().AllowColumnHeaderMenu){
    this.slideMenuOpen(true);
  }
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleLeave_ = function(){
  if (this.getGrid().getConfiguration().AllowColumnHeaderMenu && !this.keepSlideMenuOpen_ ){
    this.slideMenuOpen(false);
  }
};

/**
 * @private
 */
//pear.ui.HeaderCell.prototype.handleOptionClick_ = function(be){
//  be.stopPropagation();
//  var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.OPTION_CLICK,
//      this);
 // this.dispatchEvent(clickEvent);
//};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleResize_ = function(be){
  be.stopPropagation();
  
  var pos = this.getCellIndex();
  grid.setColumnResize(pos,be.size.width);
  this.syncContentCellOnResize_();
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleResizeEnd_ = function(be){
  be.stopPropagation();
  var grid = this.getGrid();
  grid.refresh();
};

/**
 * @public
 */
pear.ui.HeaderCell.prototype.resetSortDirection = function(be){
  this.setsortDirection(null);
};

/**
 * @public
 */
pear.ui.HeaderCell.prototype.toggleSortDirection = function(){
  if (this.getSortDirection() === pear.ui.Grid.SortDirection.ASC){
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
   
  }else if (this.getSortDirection() === pear.ui.Grid.SortDirection.DESC){
    this.setsortDirection(pear.ui.Grid.SortDirection.ASC);
  }else{
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
  }                         
};


goog.provide('pear.ui.HeaderCellMenuButton');
goog.require('goog.ui.MenuButton');

pear.ui.HeaderCellMenuButton = function(
    content, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.MenuButton.call(this, content, opt_menu, opt_renderer ||
      pear.ui.HeaderCellMenuButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.ui.HeaderCellMenuButton, goog.ui.MenuButton);





goog.provide('pear.ui.HeaderCellMenuButtonRenderer');

goog.require('goog.ui.MenuButtonRenderer');



/**
 * Toolbar-specific renderer for {@link goog.ui.MenuButton}s, based on {@link
 * goog.ui.MenuButtonRenderer}.
 * @constructor
 * @extends {goog.ui.MenuButtonRenderer}
 */
pear.ui.HeaderCellMenuButtonRenderer = function() {
  goog.ui.MenuButtonRenderer.call(this);
};
goog.inherits(pear.ui.HeaderCellMenuButtonRenderer, goog.ui.MenuButtonRenderer);
goog.addSingletonGetter(pear.ui.HeaderCellMenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of menu buttons rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.HeaderCellMenuButtonRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-header-slidemenu-menubutton');


/**
 * Returns the CSS class to be applied to the root element of menu buttons
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.HeaderCellMenuButtonRenderer.prototype.getCssClass = function() {
  return pear.ui.HeaderCellMenuButtonRenderer.CSS_CLASS;
};


