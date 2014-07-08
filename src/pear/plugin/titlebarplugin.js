goog.provide('pear.plugin.TitleBar');


goog.require('goog.ui.CheckBoxMenuItem');
goog.require('goog.ui.FilteredMenu');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.TriStateMenuItem');
goog.require('pear.ui.Plugin');



/**
 * @class TitleBar
 * @classdesc
 * TitleBar plugin is full featured plugin - Just add this
 * plugin to add Title bar in Grid
 *
 * @constructor
 * @extends {pear.ui.Plugin}
 */
pear.plugin.TitleBar = function() {
  pear.ui.Plugin.call(this);

};
goog.inherits(pear.plugin.TitleBar, pear.ui.Plugin);


/**
 * @inheritDoc
 */
pear.plugin.TitleBar.prototype.getClassId = function() {
  return 'titlebar';
};


/**
 * init
 */
pear.plugin.TitleBar.prototype.init = function() {
  var grid = this.getGrid();
  this.createTitleBar_();
};


/**
 * Get Element
 * @return {Element}
 */
pear.plugin.TitleBar.prototype.getElement = function() {
  this.element_ = this.element_ ||
      goog.dom.createDom('div', {
        'class': 'pear-grid-titlebar floatLeft',
        'style': 'width:' + this.getGrid().getWidth() + 'px'
      });
  return this.element_;
};


/**
 * @private
 *
 */
pear.plugin.TitleBar.prototype.createTitleBar_ = function() {
  var grid = this.getGrid();
  var element = this.getElement();
  goog.dom.insertSiblingBefore(element, grid.getElement());

  var title = goog.dom.createDom('span',
      'pear-grid-titlebar-title' ,
      grid.getTitle());
  goog.dom.appendChild(element, title);

  this.command_ = goog.dom.createDom('div',
      'pear-grid-titlebar-command');
  goog.dom.appendChild(element, this.command_);

  this.setting_ = new goog.ui.Control(
      goog.dom.createDom('span',
      'fa fa-cog fa-lg'
      ),
      pear.plugin.TitleBarCellRenderer.getInstance());
  this.setting_.render(this.command_);

  this.createMenu();
  this.menu_.setVisible(false);
  goog.events.listen(this.command_, goog.events.EventType.CLICK, function(ge) {
    if (this.menu_ && this.menu_.isVisible()) {
      this.menu_.setVisible(false);
    }else {
      this.menu_.setVisible(true);
    }
  },false, this);

};


/**
 * Create menu
 */
pear.plugin.TitleBar.prototype.createMenu = function() {
  this.menu_ = new goog.ui.FilteredMenu();
  this.menu_.setFilterLabel('Search');
  this.menu_.setAllowMultiple(true);
  var grid = this.getGrid();
  var columns = grid.getColumns();
  var lm;
  goog.array.forEach(columns, function(col, index) {
    this.menu_.addItem(lm = new goog.ui.CheckBoxMenuItem(col.getId()));
    if (col.getVisibility()) {
      lm.setChecked(true);
    }else {
      lm.setChecked(false);
    }
  },this);

  this.menu_.render(this.command_);

  var menuPosition = goog.style.getRelativePosition(
      this.setting_,
      this.menu_.getElement());

  goog.events.listen(this.menu_, 'action', function(e) {
    var item = e.target;
    grid.setColumnVisibility(item.getCaption(), item.isChecked());
    e.preventDefault();
  },false, this);

  goog.events.listen(this.menu_.getElement(),
      goog.events.EventType.CLICK,
      function(e) {
        e.preventDefault();
      },false, this);
};


/**
 * @inheritDoc
 */
pear.plugin.TitleBar.prototype.disposeInternal = function() {

  pear.plugin.TitleBar.superClass_.disposeInternal.call(this);
};



/**
  @constructor
  @extends {goog.ui.ControlRenderer}
*/
pear.plugin.TitleBarCellRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.plugin.TitleBarCellRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.plugin.TitleBarCellRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pear.plugin.TitleBarCellRenderer.CSS_CLASS =
    goog.getCssName('pear-grid-titlebar-cell');


/**
 * Returns the CSS class name to be applied to the root element of all
 * components rendered or decorated using this renderer.  The class name
 * is expected to uniquely identify the renderer class, i.e. no two
 * renderer classes are expected to share the same CSS class name.
 * @return {string} Renderer-specific CSS class name.
 */
pear.plugin.TitleBarCellRenderer.prototype.getCssClass = function() {
  return pear.plugin.TitleBarCellRenderer.CSS_CLASS;
};


/**
 * Returns the control's contents wrapped in a DIV, with the renderer's own
 * CSS class and additional state-specific classes applied to it.
 * @param {goog.ui.Control} cellControl Control to render.
 * @return {Element} Root element for the cell control.
 */
pear.plugin.TitleBarCellRenderer.prototype.createDom = function(cellControl) {
  // Create and return DIV wrapping contents.
  var element = cellControl.getDomHelper().createDom(
      'div',
      this.getClassNames(cellControl).join(' '),
      cellControl.getContent());

  this.setAriaStates(cellControl, element);
  return element;
};
