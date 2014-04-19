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
 * Element to hold content
 * @type {Element}
 */
pear.ui.GridFooterCell.prototype.contentElement_ = null;


/**
 * set Content Element 
 * @param {Element} element [description]
 */
pear.ui.GridFooterCell.prototype.setContentElement = function(element){
  this.contentElement_=element;
};

/**
 * get Content Element
 * @return {Element}         [description]
 */
pear.ui.GridFooterCell.prototype.getContentElement = function(){
  return this.contentElement_;
};

/**
 * Get Cell Data
 * @return {*} data
 */
pear.ui.GridFooterCell.prototype.getCellContent = function() {
  return this.getModel();
};


/**
 * Set Data
 * @param  {*} data
 */
pear.ui.GridFooterCell.prototype.setCellContent = function(data) {
  this.setModel(data);
};
/**
 * Get Cell Data
 * @return {*} data
 */
pear.ui.GridFooterCell.prototype.getCellData = function() {
  return this.getModel();
};


/**
 * Set Data
 * @param  {*} data
 */
pear.ui.GridFooterCell.prototype.setCellData = function(data) {
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
 * [disposeInternal description]
 * @inheritDoc
 */
pear.ui.GridFooterCell.prototype.disposeInternal = function() {
  pear.ui.GridFooterCell.superClass_.disposeInternal.call(this);
};
