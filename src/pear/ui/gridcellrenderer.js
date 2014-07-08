goog.provide('pear.ui.GridCellRenderer');



/**
 * [GridCellRenderer description]
 * @constructor
 */
pear.ui.GridCellRenderer = function() {

};
goog.addSingletonGetter(pear.ui.GridCellRenderer);


/**
 * [createDom description]
 * @param  {pear.ui.GridCell} gridcell [description]
 * @return {Element|Node} [description]
 * @public
 */
pear.ui.GridCellRenderer.prototype.createDom = function(gridcell) {
  var cellElement = gridcell.getDomHelper().createDom(
      'div',
      ' ' +
      goog.getCssName(pear.ui.GridCell.CSS_CLASS, 'content') +
      '  overflowhidden',
      gridcell.getContent());
  return cellElement;
};
