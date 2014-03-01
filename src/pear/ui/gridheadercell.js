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
 */
pear.ui.GridHeaderCell.prototype.getSortDirection = function() {
  this.sortDirection_ = this.sortDirection_ || pear.ui.Grid.SortDirection.NONE;
  return this.sortDirection_;
};


/**
 * [setsortDirection description]
 * @param  {?pear.ui.Grid.SortDirection} value
 */
pear.ui.GridHeaderCell.prototype.setsortDirection = function(value) {
  this.sortDirection_ = value || pear.ui.Grid.SortDirection.NONE;
};


/**
 * [getMenuControl description]
 * @return {goog.ui.Control}
 */
pear.ui.GridHeaderCell.prototype.getMenuControl = function() {
  return this.headerMenuContainer_;
};


/**
 * [setMenuState description]
 * @param {boolean} open
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
 * [getContentCell description]
 * @return {?Element}
 */
pear.ui.GridHeaderCell.prototype.getContentCell = function() {
  return this.contentCell_;
};


/**
 * [getContentText description]
 * @return {string}
 */
pear.ui.GridHeaderCell.prototype.getContentText = function() {
  return this.getModel()['headerText'];
};


/**
 * [getCellData description]
 * @return {Object}
 */
pear.ui.GridHeaderCell.prototype.getCellData = function() {
  var columnData = (/** @type {Object} */ (this.getModel()));
  return columnData;
};


/**
 * [getColumnId description]
 * @return {string}
 */
pear.ui.GridHeaderCell.prototype.getColumnId = function() {
  return this.getCellData()['id'];
};


/**
 * [getContentIndicatorElement description]
 * @return {Element}
 */
pear.ui.GridHeaderCell.prototype.getContentIndicatorElement = function() {
  return this.contentIndicator_;
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

  // Header Cell Content
  this.contentCell_ = goog.dom.createDom('div',
      'pear-grid-cell-header-content',
      this.getContentText()
      );
  goog.dom.appendChild(this.getElement(), this.contentCell_);

  // Indicators
  this.createHeaderCellIndicatorPlaceHolder_();

  if (grid.getConfiguration().AllowColumnHeaderMenu) {
    // Header Menu
    this.createHeaderCellMenu_();
  }
  if (grid.getConfiguration().AllowColumnResize) {
    this.createResizeHandle_();
  }

  this.adjustContentCellWidth();
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
 * [adjustContentCellWidth description]
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
  var boundSlideMenu, marginBox;
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

  lessWidth = lessWidth + boundIndicator.width +
      (bound.width - boundContent.width);
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
 */
pear.ui.GridHeaderCell.prototype.handleChildMouseEvents_ = function(ge) {
  ge.stopPropagation();
};

/**
 * [handleActive_ description]
 * @param  {goog.events.Event} ge [description]
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
};


/**
 * [handleResizeEnd_ description]
 * @param  {pear.ui.ResizableEvent} ge [description]
 * @private
 */
pear.ui.GridHeaderCell.prototype.handleResizeEnd_ = function(ge) {
  ge.stopPropagation();
  var grid = this.getGrid();
  grid.refresh();
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


/**
 * @override
 */
pear.ui.GridHeaderCell.prototype.disposeInternal = function() {
  if (this.resizable_) {
    this.resizable_.dispose();
    this.resizable_ = null;
  }
  this.headerMenuContainer_ = null;
  //if (this.contentIndicator_){
   // this.contentIndicator_.removeAll();
  //}
  //if (this.contentCell_){
   // this.contentCell_.removeAll();
  //}
  delete this.contentIndicator_;
  delete this.contentCell_;
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


