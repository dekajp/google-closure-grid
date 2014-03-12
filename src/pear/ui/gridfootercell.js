goog.provide('pear.ui.GridFooterCell');

goog.require('pear.ui.Cell');
goog.require('pear.ui.GridFooterCellRenderer');



/**
 * grid footer cell
 *
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {pear.ui.Cell}
 */
pear.ui.GridFooterCell = function(opt_domHelper, opt_renderer) {
  pear.ui.Cell.call(this, pear.ui.GridFooterCellRenderer.getInstance(),
      opt_domHelper);

  // Allow Row Highlight on MouseOver and Keyboard navigation
  this.setSupportedState(goog.ui.Component.State.HOVER, true);
  this.setSupportedState(goog.ui.Component.State.SELECTED, true);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
};
goog.inherits(pear.ui.GridFooterCell, pear.ui.Cell);

/**
 * Get Cell Data
 * @return {*} data
 */
pear.ui.Cell.prototype.getCellData = function() {
  return this.getModel();
};


/**
 * Set Data
 * @param  {*} data
 */
pear.ui.Cell.prototype.setCellData = function(data) {
  this.setModel(data);
};

/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.GridFooterCell.prototype.getContent = function() {
  return String(this.applyFooterAggregrates());
};

/**
 * Returns the text caption or DOM structure displayed in the component.
 * @public
 */
pear.ui.GridFooterCell.prototype.applyFooterAggregrates = function() {
  var columnObject = this.getDataColumn();
  var fnAggregate = columnObject.getColumnFooterAggregatesFn();
  if (fnAggregate){
    return fnAggregate.call(this,columnObject,this.getGrid().getDataView());
  }
  return '';
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.GridFooterCell.prototype.enterDocument = function() {
  /* if (this.getGrid().getConfiguration().SelectionMode ===
    pear.ui.Grid.SelectionMode.CELL){
    this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
  }else{
    this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  }
  */
  pear.ui.GridFooterCell.superClass_.enterDocument.call(this);
};


/**
 * @override
 */
pear.ui.GridFooterCell.prototype.performActionInternal = function(e) {
  if (this.isAutoState(goog.ui.Component.State.CHECKED)) {
    this.setChecked(!this.isChecked());
  }
  if (this.isAutoState(goog.ui.Component.State.SELECTED) &&
      this.getGrid().getConfiguration().SelectionMode ===
      pear.ui.Grid.SelectionMode.CELL) {
    this.setSelected(true);
  }
  if (this.isAutoState(goog.ui.Component.State.OPENED)) {
    this.setOpen(!this.isOpen());
  }

  var actionEvent = new goog.events.Event(goog.ui.Component.EventType.ACTION,
      this);
  if (e) {
    actionEvent.altKey = e.altKey;
    actionEvent.ctrlKey = e.ctrlKey;
    actionEvent.metaKey = e.metaKey;
    actionEvent.shiftKey = e.shiftKey;
    actionEvent.platformModifierKey = e.platformModifierKey;
  }
  return this.dispatchEvent(actionEvent);
};

/**
 * Checks if a mouse event (mouseover or mouseout) occured below an element.
 * @param {goog.events.BrowserEvent} e Mouse event (should be mouseover or
 *     mouseout).
 * @param {Element} elem The ancestor element.
 * @return {boolean} Whether the event has a relatedTarget (the element the
 *     mouse is coming from) and it's a descendent of elem.
 * 
 * @private
 */
pear.ui.GridFooterCell.prototype.isMouseEventWithinElement_ = function(e, elem) {
  // If relatedTarget is null, it means there was no previous element (e.g.
  // the mouse moved out of the window).  Assume this means that the mouse
  // event was not within the element.
  return !!e.relatedTarget && goog.dom.contains(elem, e.relatedTarget);
};

/**
 * @override
 * Header and Footer row - Postion is Relative 
 */
pear.ui.GridFooterCell.prototype.setPosition = function() {
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
 * @private
 *
 */
pear.ui.GridFooterCell.prototype.setSize_ = function() {
  pear.ui.GridFooterCell.superClass_.setSize_.call(this);
  var height;
  height = this.getCellHeightOffset_();
  goog.style.setStyle(this.getElement(),"line-height",height+'px');
};

/**
 * @inheritDoc
 */
pear.ui.GridFooterCell.prototype.handleMouseOver = function(be) {
  if (!this.isMouseEventWithinElement_(be, this.getElement()) &&
      (this.dispatchEvent(goog.ui.Component.EventType.ENTER) &&
      (this.isEnabled() &&
          this.isAutoState(goog.ui.Component.State.HOVER))
      )
  ) {
    // Cell Highlight
    this.setHighlighted(true);
  }
};

/**
 * @inheritDoc
 */
pear.ui.GridFooterCell.prototype.handleMouseOut = function(be) {
  if (!this.isMouseEventWithinElement_(be, this.getElement()) &&
       this.dispatchEvent(goog.ui.Component.EventType.LEAVE)) {
    if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      // Cell Active
      this.setActive(false);
    }
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      // Cell Highlight
      this.setHighlighted(false);
    }
  }
};

/**
 * [disposeInternal description]
 * @inheritDoc
 */
pear.ui.GridFooterCell.prototype.disposeInternal = function() {
  pear.ui.GridFooterCell.superClass_.disposeInternal.call(this);
};
