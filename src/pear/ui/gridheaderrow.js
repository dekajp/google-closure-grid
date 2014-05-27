goog.provide('pear.ui.GridHeaderRow');

goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SplitBehavior');
goog.require('pear.ui.Row');



/**
 * HeaderRow
 *
 * @constructor
 * @extends {pear.ui.Row}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.GridHeaderRow = function(grid, height, opt_domHelper) {

  pear.ui.Row.call(this, grid, height, opt_domHelper);
};
goog.inherits(pear.ui.GridHeaderRow, pear.ui.Row);


/**
 * Default CSS class to be applied to the root element of containers rendered
 * by this renderer.
 * @type {string}
 */
pear.ui.GridHeaderRow.CSS_CLASS =
    goog.getCssName('pear-grid-row-header');


/**
 * @inheritDoc
 */
pear.ui.GridHeaderRow.prototype.addCell = function(cell, opt_render) {
  pear.ui.GridHeaderRow.superClass_.addCell.call(this, cell, true);
};


/**
 * Get Header Cell
 * @param  {string} id Column Id
 * @return {pear.ui.GridHeaderCell}
 */
pear.ui.Row.prototype.getHeaderCellByColumnId = function(id) {
  var cell;
  this.forEachChild(function(child) {
    if (!cell && id === child.getColumnId()) {
      cell = child;
    }
  });
  return cell;
};


/**
 * Get Header Cell By Data Field
 * @param  {string} fieldName
 * @return {pear.ui.GridHeaderCell}
 */
pear.ui.Row.prototype.getHeaderCellByDataField = function(fieldName) {
  var cell;
  this.forEachChild(function(child) {
    if (!cell && fieldName === child.getDataField()) {
      cell = child;
    }
  });
  return cell;
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.GridHeaderRow.prototype.enterDocument = function() {
  pear.ui.GridHeaderRow.superClass_.enterDocument.call(this);
  goog.dom.classes.add(this.getElement(), pear.ui.GridHeaderRow.CSS_CLASS);
};


/**
 *
 * @inheritDoc
 */
pear.ui.GridHeaderRow.prototype.disposeInternal = function() {
  pear.ui.GridHeaderRow.superClass_.disposeInternal.call(this);
};





