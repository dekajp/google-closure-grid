goog.provide('pear.ui.GridFooterCell');

goog.require('pear.ui.Cell');



/**
 * grid footer cell
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {pear.ui.Cell}
 */
pear.ui.GridFooterCell = function(opt_domHelper) {
  pear.ui.Cell.call(this, opt_domHelper);
};
goog.inherits(pear.ui.GridFooterCell, pear.ui.Cell);


/**
 * Element to hold content
 * @type {Element}
 */
pear.ui.GridFooterCell.prototype.contentElement_;


/**
 * Default CSS class to be applied to the root element of cell
 * @type {string}
 */
pear.ui.GridFooterCell.CSS_CLASS =
    goog.getCssName('pear-grid-cell-footer');


/**
 * set Content Element
 * @param {Element} element [description]
 */
pear.ui.GridFooterCell.prototype.setContentElement = function(element) {
  this.contentElement_ = element;
};


/**
 * get Content Element
 * @return {Element}         [description]
 */
pear.ui.GridFooterCell.prototype.getContentElement = function() {
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
 * @return {string}
 * @public
 */
pear.ui.GridFooterCell.prototype.applyFooterAggregrates = function() {
  var columnObject = this.getDataColumn();
  var fnAggregate = columnObject.getColumnFooterAggregatesFn();
  if (fnAggregate) {
    return fnAggregate.call(this, columnObject, this.getGrid().getDataView());
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


  var cellElement = this.getDomHelper().createDom(
      'div',
      ' ' +
      goog.getCssName(pear.ui.GridFooterCell.CSS_CLASS, 'content') +
      '  overflowhidden',
      this.getContent());

  var align = this.getDataColumn().getAlign();
  var aligncss = (align === pear.data.Column.Align.LEFT) ?
      goog.getCssName(pear.ui.GridCell.CSS_CLASS, 'left') :
      goog.getCssName(pear.ui.GridCell.CSS_CLASS, 'right');
  goog.dom.classes.add(cellElement, aligncss);

  this.setContentElement(cellElement);
  this.getDomHelper().appendChild(this.getElement(), cellElement);
  // Set Size of Content Element
  this.applyFormatting();
};


/**
 *
 * @protected
 */
pear.ui.GridFooterCell.prototype.decorateElementWithClasses = function() {
  goog.dom.classes.add(this.getElement(), pear.ui.GridFooterCell.CSS_CLASS);
  goog.dom.classes.add(this.getElement(), 'col' + this.getCellIndex());
};


/**
 * Returns the text caption or DOM structure displayed in the component.
 * @public
 */
pear.ui.GridFooterCell.prototype.applyFormatting = function() {
  var columnObject = this.getDataColumn();
  var formatter = columnObject.getColumnFormatter();
  var handler = formatter.handler || this;
  if (formatter && formatter.fn) {
    formatter.fn.call(handler, this);
  }
};


/**
 * [disposeInternal description]
 * @inheritDoc
 */
pear.ui.GridFooterCell.prototype.disposeInternal = function() {
  pear.ui.GridFooterCell.superClass_.disposeInternal.call(this);
};
