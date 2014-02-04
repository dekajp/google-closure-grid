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

  this.setSupportedState(goog.ui.Component.State.HOVER,
                                    grid.getConfiguration().AllowRowSelection);
};
goog.inherits(pear.ui.GridCell, pear.ui.Cell);


/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.GridCell.prototype.getContent = function() {
  var columnObject = this.getColumnObject();
  if (columnObject.formatter) {
    return String(columnObject.formatter(this.getModel()));
  }
  return String(this.getModel());
};


pear.ui.GridCell.prototype.disposeInternal = function() {
  pear.ui.GridCell.superClass_.disposeInternal.call(this);
};


pear.ui.GridCell.prototype.handleMouseOver = function(e) {
  // no-op
  // No Cell needs to be highlighted
};
pear.ui.GridCell.prototype.handleMouseOut = function(e) {
  if (!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) && this.dispatchEvent(goog.ui.Component.EventType.LEAVE)) {
    if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      this.setActive(false);
    }
    //if (this.isAutoState(goog.ui.Component.State.HOVER)) {
    //  this.setHighlighted(false);
    //}
  }
};