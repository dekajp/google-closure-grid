goog.provide('pear.ui.Cell');

goog.require('goog.ui.Component');



/**
 * @classdesc Represent a Cell of Grid , this is a base class for All different
 * types of cells e.g GridHeaderCell , GridCell
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Cell = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

};
goog.inherits(pear.ui.Cell, goog.ui.Component);


/**
 * @enum {string}
 */
pear.ui.Cell.EventType = {
  OPTION_CLICK: 'evt-pear-grid-cell-options-click'
};


/**
 * @type {number}
 * @private
 */
pear.ui.Cell.prototype.columnIndex_ = -1;


/**
 * @type {pear.data.Column?}
 * @private
 */
pear.ui.Cell.prototype.datacolumn_ = null;


/**
 * @type {pear.ui.Row?}
 * @private
 */
pear.ui.Cell.prototype.row_ = null;


/**
 * @type {pear.ui.Grid?}
 * @private
 */
pear.ui.Cell.prototype.grid_ = null;


/**
 * Default CSS class to be applied to the root element of cell
 * @type {string}
 */
pear.ui.Cell.CSS_CLASS = goog.getCssName('pear-grid-cell');


/**
 * @inheritDoc
 */
pear.ui.Cell.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.row_ = null;
  this.datacolumn_ = null;

  pear.ui.Cell.superClass_.disposeInternal.call(this);
};


/**
 * Configures the component after its DOM has been rendered, and sets up event
 * handling.  Overrides {@link goog.ui.Component#enterDocument}.
 * @override
 */
pear.ui.Cell.prototype.enterDocument = function() {
  goog.dom.classes.add(this.getElement(), pear.ui.Cell.CSS_CLASS);
  pear.ui.Cell.superClass_.
      enterDocument.call(this);

  // Frozen Column
  if (this.getDataColumn().isFrozen()) {
    goog.dom.classes.add(this.getElement(),
        goog.getCssName(pear.ui.Cell.CSS_CLASS, 'frozen'));
  }

  this.decorateElementWithClasses();

  var classes = this.getDataColumn().getExtraCSSClasses();
  if (classes) {
    goog.array.forEach(classes, function(value) {
      goog.dom.classes.add(this.getElement(), value);
    },this);
  }

  var id = this.getId();
  this.getElement().id = id;
};


/**
 *
 * @protected
 */
pear.ui.Cell.prototype.decorateElementWithClasses = function() {
  // nothing in base class
};


/**
 * Returns the component's parent, if any.
 * @return {pear.ui.Row?} The Row Container.
 */
pear.ui.Cell.prototype.getRow = function() {
  // RowContainer
  this.row_ = this.row_ || /** @type {pear.ui.Row} */ (this.getParent());
  return this.row_;
};


/**
 * Get Instance of Grid , which owns this Cell
 * @return {pear.ui.Grid?}
 */
pear.ui.Cell.prototype.getGrid = function() {
  // RowContainer
  this.grid_ = this.grid_ || this.getRow().getGrid();
  return this.grid_;
};


/**
 * @param {number} index
 */
pear.ui.Cell.prototype.setCellIndex = function(index) {
  this.columnIndex_ = index;
};


/**
 * @return  {number}
 */
pear.ui.Cell.prototype.getCellIndex = function() {
  return this.columnIndex_;
};


/**
 * Get Data Column Associated with the Cell
 * @return {pear.data.Column} Data Column
 */
pear.ui.Cell.prototype.getDataColumn = function() {
  return this.datacolumn_;
};


/**
 * Set Data Column
 * @param  {pear.data.Column} datacolumn
 */
pear.ui.Cell.prototype.setDataColumn = function(datacolumn) {
  this.datacolumn_ = datacolumn;
};


/**
 * @return  {number}
 */
pear.ui.Cell.prototype.getRowPosition = function() {
  return this.getRow().getRowPosition();
};


/**
 * @private
 * @return  {number}
 */
//pear.ui.Cell.prototype.getCellWidth = function() {
//  return this.getDataColumn().getWidth();
//};
