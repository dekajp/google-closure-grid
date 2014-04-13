goog.provide('pear.ui.GridCell');

goog.require('pear.ui.Cell');
goog.require('pear.ui.GridCellRenderer');



/**
 * DataCell
 *
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {pear.ui.Cell}
 */
pear.ui.GridCell = function(opt_domHelper, opt_renderer) {
  pear.ui.Cell.call(this, pear.ui.GridCellRenderer.getInstance(),
      opt_domHelper);

  // Allow Row Highlight on MouseOver and Keyboard navigation
  this.setSupportedState(goog.ui.Component.State.HOVER, true);
  this.setSupportedState(goog.ui.Component.State.SELECTED, true);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
};
goog.inherits(pear.ui.GridCell, pear.ui.Cell);


/**
 * Element to hold content
 * @type {Element}
 */
pear.ui.Cell.prototype.contentElement_ = null;


/**
 * set Content Element 
 * @param {Element} element [description]
 */
pear.ui.Cell.prototype.setContentElement = function(element){
  this.contentElement_=element;
};

/**
 * get Content Element
 * @return {Element}         [description]
 */
pear.ui.Cell.prototype.getContentElement = function(){
  return this.contentElement_;
};

/**
 * Get Cell Data
 * @return {*} data
 */
pear.ui.Cell.prototype.getCellContent = function() {
  return this.getModel();
};


/**
 * Set Data
 * @param  {*} data
 */
pear.ui.Cell.prototype.setCellContent = function(data) {
  this.setModel(data);
};

/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.GridCell.prototype.getContent = function() {
  
  return String(this.getCellContent());
};

/**
 * Returns the text caption or DOM structure displayed in the component.
 * @public
 */
pear.ui.GridCell.prototype.applyFormatting = function() {
  var columnObject = this.getDataColumn();
  var formatter = columnObject.getColumnFormatter();
  var handler = formatter.handler || this;
  if (formatter && formatter.fn){
    formatter.fn.call(handler,this);
  }
};

/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.GridCell.prototype.enterDocument = function() {
  pear.ui.GridCell.superClass_.enterDocument.call(this);

  // Set Size of Content Element
  this.applyFormatting();
};


/**
 * @override
 */
pear.ui.GridCell.prototype.performActionInternal = function(e) {
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
pear.ui.GridCell.prototype.isMouseEventWithinElement_ = function(e, elem) {
  // If relatedTarget is null, it means there was no previous element (e.g.
  // the mouse moved out of the window).  Assume this means that the mouse
  // event was not within the element.
  return !!e.relatedTarget && goog.dom.contains(elem, e.relatedTarget);
};

/**
 * @inheritDoc
 */
pear.ui.GridCell.prototype.handleMouseOver = function(be) {
  if (!this.isMouseEventWithinElement_(be, this.getElement()) &&
      (this.dispatchEvent(goog.ui.Component.EventType.ENTER) &&
      (this.isEnabled() &&
          this.isAutoState(goog.ui.Component.State.HOVER))
      ) 
  ) {
    // Cell Highlight
    // this.setHighlighted(true);
  }
};

/**
 * @inheritDoc
 */
pear.ui.GridCell.prototype.handleMouseOut = function(be) {
  if (!this.isMouseEventWithinElement_(be, this.getElement()) &&
       this.dispatchEvent(goog.ui.Component.EventType.LEAVE) ) {
    if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      // Cell Active
      this.setActive(false);
    }
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      // Cell Highlight
      // this.setHighlighted(false);
    }
  }
};

/**
 * [disposeInternal description]
 * @inheritDoc
 */
pear.ui.GridCell.prototype.disposeInternal = function() {
  pear.ui.GridCell.superClass_.disposeInternal.call(this);
};
