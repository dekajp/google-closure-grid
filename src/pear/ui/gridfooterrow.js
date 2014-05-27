goog.provide('pear.ui.GridFooterRow');

goog.require('pear.ui.Row');



/**
 * FooterRow
 *
 * @constructor
 * @extends {pear.ui.Row}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.GridFooterRow = function(grid, height, opt_domHelper) {
  pear.ui.Row.call(this, grid, height, opt_domHelper);
};
goog.inherits(pear.ui.GridFooterRow, pear.ui.Row);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridFooterRow.CSS_CLASS =
    goog.getCssName('pear-grid-row-footer');


/**
 * @inheritDoc
 */
pear.ui.GridFooterRow.prototype.addCell = function(cell, opt_render) {
  pear.ui.GridFooterRow.superClass_.addCell.call(this, cell, true);
};


/**
 * For each child @link {pear.ui.GridFooterCell} update size
 * @public
 */
pear.ui.GridFooterRow.prototype.repositionCells = function() {
  this.forEachChild(function(child) {
    //    child.updateSizeAndPosition();
  },this);
};


/**
 * @inheritDoc
 */
pear.ui.GridFooterRow.prototype.disposeInternal = function() {
  if (this.pager_) {
    this.pager_.dispose();
    this.pager_ = null;
  }
  pear.ui.GridFooterRow.superClass_.disposeInternal.call(this);
};


/**
 * @override
 *
 */
pear.ui.GridFooterRow.prototype.enterDocument = function() {
  pear.ui.GridFooterRow.superClass_.enterDocument.call(this);

  var elem = this.getElement();
  var baseClass = pear.ui.GridFooterRow.CSS_CLASS;

  goog.dom.classes.add(elem, pear.ui.GridFooterRow.CSS_CLASS);
};

