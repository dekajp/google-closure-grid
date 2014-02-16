goog.provide('pear.ui.GridHeaderRow');

goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SplitBehavior');
goog.require('pear.ui.GridHeaderRowRenderer');
goog.require('pear.ui.Row');



/**
 * HeaderRow
 *
 * @constructor
 * @extends {pear.ui.Row}
 * @param {pear.ui.Grid} grid
 * @param {number} height
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 */
pear.ui.GridHeaderRow = function(grid, height, opt_orientation, opt_renderer, opt_domHelper) {

  pear.ui.Row.call(this, grid, height, goog.ui.Container.Orientation.HORIZONTAL,
      pear.ui.GridHeaderRowRenderer.getInstance(),
      opt_domHelper);
};
goog.inherits(pear.ui.GridHeaderRow, pear.ui.Row);

/**
 * @inheritDoc
 */
pear.ui.GridHeaderRow.prototype.addCell = function(cell, opt_render) {
  pear.ui.GridHeaderRow.superClass_.addCell.call(this, cell, true);
};


/**
  @public
  @param {string} id
*/
pear.ui.Row.prototype.getHeaderCellById = function(id) {
  var cell;
  this.forEachChild(function(child) {
    if (!cell && id === child.getColumnId()) {
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
};

/**
 * 
 * @inheritDoc
 */
pear.ui.GridHeaderRow.prototype.disposeInternal = function() {
  pear.ui.GridHeaderRow.superClass_.disposeInternal.call(this);
};





