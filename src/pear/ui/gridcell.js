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
};
goog.inherits(pear.ui.GridCell, pear.ui.Cell);



/**
 * Returns the text caption or DOM structure displayed in the component.
 * @return {goog.ui.ControlContent} Text caption or DOM structure
 *     comprising the component's contents.
 */
pear.ui.GridCell.prototype.getContent = function() {
  var columnObject = this.getColumnObject();
  if (columnObject.formatter){
    return String(columnObject.formatter(this.getModel()));
  }
  return String(this.getModel());
};


pear.ui.GridCell.prototype.disposeInternal = function() {
  pear.ui.GridCell.superClass_.disposeInternal.call(this);
};