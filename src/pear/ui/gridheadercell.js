goog.provide('pear.ui.GridHeaderCell');

goog.require('pear.fx.dom.HeaderMenuSlide');
goog.require('pear.ui.Cell');
goog.require('pear.ui.GridHeaderCellContentRenderer');
goog.require('pear.ui.GridHeaderCellMenuRenderer');
goog.require('pear.ui.GridHeaderCellRenderer');
goog.require('pear.ui.Resizable');

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
pear.ui.GridHeaderCell = function(opt_renderer, opt_domHelper) {
  pear.ui.Cell.call(this,
                    opt_renderer ||
      pear.ui.GridHeaderCellRenderer.getInstance(),
                    opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
};
goog.inherits(pear.ui.GridHeaderCell, pear.ui.Cell);


/**
 * @private
 * @type {goog.ui.Control}
 */
pear.ui.GridHeaderCell.prototype.headerMenuContainer_ = null;


/**
 * @private
 * @type {?Element}
 */
pear.ui.GridHeaderCell.prototype.sortIndicator_ = null;
/**
 * @private
 * @type {?Element}
 */
pear.ui.GridHeaderCell.prototype.sortAscIndicator_ = null;
/**
 * @private
 * @type {?Element}
 */
pear.ui.GridHeaderCell.prototype.sortDescIndicator_ = null;
/**
 * @private
 * @type {?Element}
 */
pear.ui.GridHeaderCell.prototype.contentCell_ = null;

/**
 * @private
 * @type {?Element}
 */
pear.ui.GridHeaderCell.prototype.contentIndicator_ =null;

/**
 * @private
 * @type {pear.ui.Grid.SortDirection | number}
 */
pear.ui.GridHeaderCell.prototype.sortDirection_ = 0;


/**
 * [resizable_ description]
 * @type {pear.ui.Resizable}
 * @private
 */
pear.ui.GridHeaderCell.prototype.resizable_ = null;

/**
 * get Resizable Control
 * @return {pear.ui.Resizable}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getResizable = function() {
  return this.resizable_;
};

/**
 * get Sort Direction {@link pear.ui.Grid.SortDirection}
 * @return {pear.ui.Grid.SortDirection}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getSortDirection = function() {
  this.sortDirection_ = this.sortDirection_ || pear.ui.Grid.SortDirection.NONE;
  return (/** @type {pear.ui.Grid.SortDirection} */ (this.sortDirection_));
};


/**
 * setSortDirection of Column
 * @param  {?pear.ui.Grid.SortDirection} value
 * @private
 */
pear.ui.GridHeaderCell.prototype.setsortDirection = function(value) {
  this.sortDirection_ = value || pear.ui.Grid.SortDirection.NONE;

  if (value === pear.ui.Grid.SortDirection.ASC){
    goog.style.setElementShown(this.sortAscIndicator_,true);
    goog.style.setElementShown(this.sortDescIndicator_,false);
  }else if (value === pear.ui.Grid.SortDirection.DESC){
    goog.style.setElementShown(this.sortAscIndicator_,false);
    goog.style.setElementShown(this.sortDescIndicator_,true);
  }else{
    goog.style.setElementShown(this.sortAscIndicator_,false);
    goog.style.setElementShown(this.sortDescIndicator_,false);
  }
  this.adjustContentCellWidth();
};


/**
 * Get Menu Control Container
 * @return {goog.ui.Control}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getMenuControl = function() {
  return this.headerMenuContainer_;
};


/**
 * set state of Sliding Menu Container 
 * @param {boolean} open , true is visible
 * @public
 */
pear.ui.GridHeaderCell.prototype.setMenuState = function(open) {
  this.keepSlideMenuOpen_ = open;
};



/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.GridHeaderCell.prototype.getContent = function() {
  //return this.getModel()['headerText'];
  return '';
};


/**
 * Get the Content Cell
 * @return {?Element}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getContentCell = function() {
  return this.contentCell_;
};


/**
 * Get Content Text - Header Text
 * @return {string}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getContentText = function() {
  return this.getDataColumn().getHeaderText();
};



/**
 * Get Column Id 
 * @return {string}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getColumnId = function() {
  return this.getDataColumn().getId();
};


/**
 * Get Indicator Element Container - this suppose to hold indicators
 * for sort , filter .
 * @return {Element}
 * @public
 */
pear.ui.GridHeaderCell.prototype.getContentIndicatorElement = function() {
  return this.contentIndicator_;
};

/**
 * clear header cell content
 * @public
 *
 */
pear.ui.GridHeaderCell.prototype.clearContent = function() {
  // Header Cell Content
  this.contentCell_.innerHTML = "";
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.GridHeaderCell.prototype.enterDocument = function() {
  pear.ui.GridHeaderCell.superClass_.enterDocument.call(this);
  this.splitHeaderCell_();
  this.registerEvent_();
};


/**
 * @private
 */
pear.ui.GridHeaderCell.prototype.registerEvent_ = function() {
  this.getHandler().
      listenWithScope(this, goog.ui.Component.EventType.ENTER,
          this.handleEnter_, false, this).
      listenWithScope(this, goog.ui.Component.EventType.LEAVE,
          this.handleLeave_, false, this).
      listenWithScope(this.getElement(), goog.events.EventType.CLICK,
          this.handleActive_, false, this);
};


/**
 * Header cell is divided into 3 content , indicators and sliding menu
 * @private
 *
 */
pear.ui.GridHeaderCell.prototype.splitHeaderCell_ = function() {
  var grid = this.getGrid();
  var align = this.getDataColumn().getAlign();

  // Indicators
  this.createHeaderCellIndicatorPlaceHolder_();

  // Header Menu
  if (grid.getConfiguration().AllowColumnHeaderMenu) {
    this.createHeaderCellMenu_();
  }

  // Sort Indicators
  if (grid.getConfiguration().AllowSorting) {
    this.createSortIndicators_();
  }

  // Resize Handles
  if (grid.getConfiguration().AllowColumnResize) {
    this.createResizeHandle_();
  }

  this.createHeaderCellContent_();
  

  this.adjustContentCellWidth();
};

/**
 * create content cell
 * @private
 */
pear.ui.GridHeaderCell.prototype.createHeaderCellContent_ = function(){
  // Header Cell Content
  var contentElem = goog.dom.createDom('div',
        'pear-grid-cell-header-content',
        this.getContentText()
        );
  var align = this.getDataColumn().getAlign();
  var aligncss = (align === pear.data.Column.Align.LEFT)? 'pear-grid-align-left':'pear-grid-align-right';
  goog.dom.classes.add(contentElem, aligncss);

  if(align === pear.data.Column.Align.RIGHT ){
    this.contentCell_= (/**@type {Element} */ ( this.getElement().appendChild(contentElem))); 
  }else if (align === pear.data.Column.Align.LEFT ){
    this.contentCell_ = (/**@type {Element} */(this.getElement().insertBefore(contentElem,
      this.contentIndicator_))); 
  }else{
    // no-op
  }

  
};

/**
 * @private
 */
pear.ui.GridHeaderCell.prototype.createHeaderCellIndicatorPlaceHolder_
                                                              = function() {
  // Header Menu Control
  this.contentIndicator_ = goog.dom.createDom('div',
      'pear-grid-cell-header-indicators'
      );
  goog.dom.appendChild(this.getElement(), this.contentIndicator_);

};


/**
 * [createHeaderCellMenu_ description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.createHeaderCellMenu_ = function() {
  // Header Menu Control
  this.headerMenuContainer_ =
      new goog.ui.Control(null, pear.ui.GridHeaderCellMenuRenderer.getInstance());
  this.headerMenuContainer_.
      setSupportedState(goog.ui.Component.State.ALL, false);
  this.headerMenuContainer_.render(this.getElement());
};


/**
 * [createResizeHandle_ description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.createResizeHandle_ = function() {
  var resizeData = {
    handles: pear.ui.Resizable.Position.RIGHT
  };

  this.resizable_ = new pear.ui.Resizable(this.getElement(), resizeData);
  this.getHandler().
      listenWithScope(this.resizable_, pear.ui.Resizable.EventType.RESIZE,
          this.handleResize_, false, this).
      listenWithScope(this.resizable_, pear.ui.Resizable.EventType.END_RESIZE,
          this.handleResizeEnd_, false, this);
};

/**
 * create sort indicators
 * @private
 */
pear.ui.GridHeaderCell.prototype.createSortIndicators_ = function(){
  var contentIndicatorElem = this.getContentIndicatorElement();

  this.sortIndicator_ = goog.dom.createDom('div',
                                            'pear-grid-cell-header-sort'
                                          );
  goog.dom.appendChild(contentIndicatorElem, this.sortIndicator_);

  this.sortAscIndicator_ = goog.dom.createDom('div',{'class' : 'fa fa-arrow-circle-down' ,style:'display:none' });
  goog.dom.appendChild(this.sortIndicator_,this.sortAscIndicator_);
  this.sortDescIndicator_ = goog.dom.createDom('div',{'class' : 'fa fa-arrow-circle-up' ,style:'display:none' });
  goog.dom.appendChild(this.sortIndicator_,this.sortDescIndicator_);
}


/**
 * Adjust Contnet cell width
 */
pear.ui.GridHeaderCell.prototype.adjustContentCellWidth = function() {
  this.syncContentCellOnResize_();
};


/**
 * Synchronize Cells on Resize Event
 * @private
 */
pear.ui.GridHeaderCell.prototype.syncContentCellOnResize_ = function() {
  var bound = goog.style.getBounds(this.getElement());
  var boundContent = goog.style.getContentBoxSize(this.getElement());

  var boundIndicator = goog.style.getBounds(this.getContentIndicatorElement());
  var boundSlideMenu, marginBox,paddingBox;
  var lessWidth = 0;
  var grid = this.getGrid();
  if (grid.getConfiguration().AllowColumnHeaderMenu) {
    boundSlideMenu = goog.style.getBounds(
        this.headerMenuContainer_.getElement());
    marginBox = goog.style.getMarginBox(
        this.headerMenuContainer_.getElement());
    if (marginBox.left < 0) {
      lessWidth = lessWidth + boundSlideMenu.width;
    }
  }

  if (grid.getConfiguration().AllowColumnResize) {
    var resizeHandle = goog.style.getBounds(
        this.resizable_.getHandle(pear.ui.Resizable.Position.RIGHT));
    if (resizeHandle.width > 0) {
      lessWidth = lessWidth + resizeHandle.width;
    }
    this.resizable_.setMinWidth(lessWidth + 10);
  }

  paddingBox = goog.style.getPaddingBox(this.getContentIndicatorElement());

  lessWidth = lessWidth + boundIndicator.width +
      ( bound.width - boundContent.width )+
      paddingBox.right+paddingBox.left;
  goog.style.setWidth(this.contentCell_, bound.width - lessWidth);
};


/**
 * [getHeaderMenuContainerWidth description]
 * @return {number}
 */
pear.ui.GridHeaderCell.prototype.getHeaderMenuContainerWidth = function() {
  // TODO
  var bounds = goog.style.getBounds(this.headerMenuContainer_.getElement());
  return bounds.width;
};


/**
 * [slideMenuOpen description]
 * @param  {boolean} display
 */
pear.ui.GridHeaderCell.prototype.slideMenuOpen = function(display) {
  var marginleft = 0;
  var left = 0;
  var width = this.getHeaderMenuContainerWidth();
  if (this.headerMenuContainer_ && display) {
    marginleft = marginleft + width;
  }else {
    marginleft = marginleft + 0;
  }
  marginleft = marginleft * -1;
  this.handleMenuSlide_(this.headerMenuContainer_.getElement(), [marginleft]);
  this.adjustContentCellWidth();
};


/**
 * @override
 * Header and Footer row - Postion is Relative 
 */
pear.ui.GridHeaderCell.prototype.setPosition = function() {
  var left, top;
  left = 0;
  top = 0;
  left = 0;
  top = 0;
  var i = 0;
  ////for (;i<this.getCellIndex();i++ ){
  //  left = left + this.getRow().getCellWidth(i);
  //}

  goog.style.setPosition(this.getElement(), left, top);
};


/**
 * [handleMenuSlide_ description]
 * @param  {Element} el
 * @param  {Array.<number>} value
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleMenuSlide_ = function(el, value) {
  var anim = new pear.fx.dom.HeaderMenuSlide(el, [0], value, 300);
  goog.events.listen(anim, goog.fx.Animation.EventType.ANIMATE,
      this.adjustContentCellWidth, false, this);
  anim.play();
};


/**
 * [handleChildMouseEvents_ description]
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleChildMouseEvents_ = function(ge) {
  ge.stopPropagation();
};

/**
 * [handleActive_ description]
 * @param  {goog.events.Event} ge [description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleActive_ = function(ge) {
  ge.stopPropagation();
  if (this.resizable_ && 
      this.resizable_.getResizehandle(pear.ui.Resizable.Position.RIGHT) ===
      ge.target) {
    // Ignore

  }else {
    if (this.getGrid().getConfiguration().AllowSorting) {
      var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.CLICK,
          this);
      this.dispatchEvent(clickEvent);
    }
  }
};


/**
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleEnter_ = function() {
  if (this.getGrid().getConfiguration().AllowColumnHeaderMenu) {
    this.slideMenuOpen(true);
  }
};


/**
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleLeave_ = function() {
  if (this.getGrid().getConfiguration().AllowColumnHeaderMenu && !this.keepSlideMenuOpen_) {
    this.slideMenuOpen(false);
  }
};

/**
 * @private
 */
//pear.ui.GridHeaderCell.prototype.handleOptionClick_ = function(be){
//  be.stopPropagation();
//  var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.OPTION_CLICK,
//      this);
// this.dispatchEvent(clickEvent);
//};


/**
 * [handleResize_ description]
 * @param  {pear.ui.ResizableEvent} ge [description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleResize_ = function(ge) {
  ge.stopPropagation();
  var pos = this.getCellIndex();
  var grid = this.getGrid();
  grid.setColumnWidth(pos, ge.size.width);
  this.adjustContentCellWidth();
  // Give more realtime - resize
  grid.refreshOnColumnResize();
};


/**
 * [handleResizeEnd_ description]
 * @param  {pear.ui.ResizableEvent} ge [description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleResizeEnd_ = function(ge) {
  ge.stopPropagation();
  var grid = this.getGrid();
  // clear style
  goog.style.setSize(this.getElement(), '','');
  goog.style.setPosition(this.getElement(), '','');
  // grid.refreshOnColumnResize();
};


/**
 * @public
 */
pear.ui.GridHeaderCell.prototype.resetSortDirection = function() {
  this.setsortDirection(pear.ui.Grid.SortDirection.NONE);
};


/**
 * @public
 */
pear.ui.GridHeaderCell.prototype.toggleSortDirection = function() {
  if (this.getSortDirection() === pear.ui.Grid.SortDirection.ASC) {
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);

  }else if (this.getSortDirection() === pear.ui.Grid.SortDirection.DESC) {
    this.setsortDirection(pear.ui.Grid.SortDirection.ASC);
  }else {
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
  }
};

pear.ui.GridHeaderCell.prototype.disposeEvents = function(){
  goog.events.unlisten(this.getElement(), goog.events.EventType.CLICK,
          this.handleActive_);
};
  

/**
 * @override
 */
pear.ui.GridHeaderCell.prototype.disposeInternal = function() {
  this.disposeEvents();

  if (this.resizable_) {
    this.resizable_.dispose();
  }
  this.resizable_ = null;

  if (this.sortIndicator_){
    goog.dom.removeNode(this.sortIndicator_);
  }
  this.sortIndicator_ = null;

  if (this.sortAscIndicator_){
    goog.dom.removeNode(this.sortAscIndicator_);
  }
  this.sortAscIndicator_ = null;

  if (this.sortDescIndicator_){
    goog.dom.removeNode(this.sortDescIndicator_);
  }
  this.sortDescIndicator_ = null;

  if(this.headerMenuContainer_){
    this.headerMenuContainer_.dispose();
  }
  this.headerMenuContainer_ = null;
  
  if (this.contentIndicator_){
    goog.dom.removeNode(this.contentIndicator_);
  }
  this.contentIndicator_=null;;

  if (this.contentCell_){
    goog.dom.removeNode(this.contentCell_);
  }
  this.contentCell_=null;;

 
  delete this.sortDirection_;
  pear.ui.GridHeaderCell.superClass_.disposeInternal.call(this);
};



goog.provide('pear.ui.GridHeaderCellMenuButton');
goog.require('goog.ui.MenuButton');



/**
 * [GridHeaderCellMenuButton description]
 * @param {string} content
 * @param {goog.ui.Menu=} opt_menu Menu to render under the button when clicked.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the menu button; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
pear.ui.GridHeaderCellMenuButton = function(
    content, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.MenuButton.call(this, content, opt_menu, opt_renderer ||
      pear.ui.GridHeaderCellMenuButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.ui.GridHeaderCellMenuButton, goog.ui.MenuButton);





goog.provide('pear.ui.GridHeaderCellMenuButtonRenderer');

goog.require('goog.ui.MenuButtonRenderer');



/**
 * Toolbar-specific renderer for {@link goog.ui.MenuButton}s, based on {@link
 * goog.ui.MenuButtonRenderer}.
 * @constructor
 * @extends {goog.ui.MenuButtonRenderer}
 */
pear.ui.GridHeaderCellMenuButtonRenderer = function() {
  goog.ui.MenuButtonRenderer.call(this);
};
goog.inherits(pear.ui.GridHeaderCellMenuButtonRenderer, goog.ui.MenuButtonRenderer);
goog.addSingletonGetter(pear.ui.GridHeaderCellMenuButtonRenderer);


/**
 * Default CSS class to be applied to the root element of menu buttons rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridHeaderCellMenuButtonRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-cell-header-slidemenu-menubutton');


/**
 * Returns the CSS class to be applied to the root element of menu buttons
 * rendered using this renderer.
 * @return {string} Renderer-specific CSS class.
 * @override
 */
pear.ui.GridHeaderCellMenuButtonRenderer.prototype.getCssClass = function() {
  return pear.ui.GridHeaderCellMenuButtonRenderer.CSS_CLASS;
};


