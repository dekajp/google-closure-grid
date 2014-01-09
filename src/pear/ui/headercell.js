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
pear.ui.HeaderCell.prototype.headerMenu_ = null;


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
  this.sortDirection_ = null;
  pear.ui.HeaderCell.superClass_.disposeInternal.call(this);
};

/**
 * @private
 * @type {enum}
 */
pear.ui.HeaderCell.prototype.sortDirection_ = null;
pear.ui.HeaderCell.prototype.resizable_ = null;

pear.ui.HeaderCell.prototype.getsortDirection = function() {
  this.sortDirection_ = this.sortDirection_ || pear.ui.Grid.SortDirection.NONE;
  return this.sortDirection_;
};

pear.ui.HeaderCell.prototype.setsortDirection = function(value) {
  this.sortDirection_ = value || pear.ui.Grid.SortDirection.NONE;
}

/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.HeaderCell.prototype.getContent = function() {
  //return this.getModel()['headerText'];
  return '';
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.HeaderCell.prototype.enterDocument = function() {
  pear.ui.HeaderCell.superClass_.
      enterDocument.call(this);
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
 */
pear.ui.HeaderCell.prototype.splitHeaderCell_ = function(){
  var grid = this.getGrid();

  // Header Cell Content
  this.contentCell_ = goog.dom.createDom('div',
                                        'pear-grid-cell-header-content',
                                        this.getModel()['headerText']
                                        );
  goog.dom.appendChild(this.getElement(),this.contentCell_);
  
  this.syncContentCellOnResize_();

  this.contentIndicator_ = goog.dom.createDom('div',
                                        'pear-grid-cell-header-indicators'
                                        );
  goog.dom.appendChild(this.getElement(),this.contentIndicator_);

  this.sortIndicator_ = goog.dom.createDom('div',
                                            'pear-grid-cell-header-sort'
                                          );
  goog.dom.appendChild(this.contentIndicator_, this.sortIndicator_);

  // Header Menu Control
  this.headerMenu_ = goog.dom.createDom('div',
                                        'pear-grid-cell-header-slidemenu',
                                          goog.dom.createDom('div',
                                            'fa fa-caret-square-o-down'
                                          )
                                        );
  goog.dom.appendChild(this.contentIndicator_,this.headerMenu_);
  
  this.getHandler().
        listen(this.headerMenu_, goog.events.EventType.CLICK,
          this.handleOptionClick_,false,this);
  this.registerEvents_()

  
  if (grid.getConfiguration().AllowColumnResize){
    this.createResizeHandle_();
  }
  
};

pear.ui.HeaderCell.prototype.syncContentCellOnResize_ = function(){
  var bound = goog.style.getContentBoxSize(this.getElement());
  goog.style.setWidth(this.contentCell_,bound.width);
};

pear.ui.HeaderCell.prototype.syncContentIndicatorLocation_ = function(){
  var marginleft = 0;
  if (this.getsortDirection()){
    marginleft = marginleft + 16;
  }
  if (goog.style.isElementShown(this.headerMenu_)){
    marginleft = marginleft + 16;
  }
  marginleft = marginleft * -1;
  this.handleMenuSlide_(this.contentIndicator_,[marginleft]);
  //goog.style.setStyle(this.contentIndicator_, 'margin-left', marginleft+'px');
};

pear.ui.HeaderCell.prototype.handleMenuSlide_ = function(el,value) {
  
  var anim = new pear.fx.dom.Slide (el, [0], value, 300);
  //goog.events.listen(anim, goog.fx.Transition.EventType.BEGIN,disableButtons);
  //goog.events.listen(anim, goog.fx.Transition.EventType.END, enableButtons);
  anim.play();
}

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
}

/**
 * @private
 */
pear.ui.HeaderCell.prototype.registerEvents_ = function(){
  // Handle mouse events on behalf of controls in the container.
  this.getHandler().
      listen(this.headerMenu_, [
        goog.events.EventType.MOUSEDOWN,
        goog.events.EventType.MOUSEUP,
        goog.events.EventType.MOUSEOVER,
        goog.events.EventType.MOUSEOUT,
        goog.events.EventType.CONTEXTMENU
      ], this.handleChildMouseEvents_);
};

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
  goog.style.setStyle(this.headerMenu_,"display","inline-block");
  this.syncContentIndicatorLocation_();
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleLeave_ = function(){
  goog.style.setStyle(this.headerMenu_,'display','none');
  this.syncContentIndicatorLocation_();
};

/**
 * @private
 */
pear.ui.HeaderCell.prototype.handleOptionClick_ = function(be){
  be.stopPropagation();
  var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.OPTION_CLICK,
      this);
  this.dispatchEvent(clickEvent);
};

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
  goog.dom.removeChildren(this.sortIndicator_);
  this.syncContentIndicatorLocation_();
};

/**
 * @public
 */
pear.ui.HeaderCell.prototype.toggleSortDirection = function(be){
  var sortNode;
  goog.dom.removeChildren(this.sortIndicator_);
  if (this.getsortDirection() === pear.ui.Grid.SortDirection.ASC){
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
    sortNode = goog.dom.createDom('div',
                                  'fa fa-arrow-circle-down'
                                  );
  }else if (this.getsortDirection() === pear.ui.Grid.SortDirection.DESC){
    this.setsortDirection(pear.ui.Grid.SortDirection.ASC);
    sortNode = goog.dom.createDom('div',
                                  'fa fa-arrow-circle-up'
                                  );
  }else{
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
    sortNode = goog.dom.createDom('div',
                                  'fa fa-arrow-circle-down'
                                  );
  }
  goog.dom.appendChild(this.sortIndicator_,sortNode);  
  this.syncContentIndicatorLocation_();                                      
};

