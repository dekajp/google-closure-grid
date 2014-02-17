  goog.provide('pear.plugin.HeaderMenu');

goog.require('goog.events.Event');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.ui.Menu');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('pear.ui.Plugin');


/**
 * [HeaderMenu description]
 * @constructor
 * @extends {pear.ui.Plugin} 
 */
pear.plugin.HeaderMenu = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.HeaderMenu, pear.ui.Plugin);

/**
 * @inheritDoc
 */
pear.plugin.HeaderMenu.prototype.getClassId = function() {
  return 'HeaderMenu';
};

/**
 * [init description]
 */
pear.plugin.HeaderMenu.prototype.init = function() {
  var grid = this.getGrid();
  this.createHeaderMenuDom();
};

/**
 * [disposeInternal description]
 */
pear.plugin.HeaderMenu.prototype.disposeInternal = function() {
  goog.array.forEach(this.headerMenuBtns_, function(mb) {
    mb.dispose();
  });
  pear.plugin.HeaderMenu.superClass_.disposeInternal.call(this);
};

/**
 * @private
 *
 */
pear.plugin.HeaderMenu.prototype.createHeaderMenuDom = function() {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  this.headerMenuBtns_ = [];
  headerRow.forEachChild(function(headercell) {

    var m1 = new goog.ui.Menu();
    m1.setId('menudemo'+headercell.getCellIndex());
    goog.array.forEach(['Menu Option-1', 'Menu Option-2', 'Menu Option-3', 'Menu Option-4', null, 'Menu Option-5'],
        function(label) {
          var item;
          if (label) {
            item = new goog.ui.MenuItem(label + '...');
            item.setId(label);
            item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
          } else {
            item = new goog.ui.MenuSeparator();
          }
          m1.addChild(item,true);
        });

    var mb = new pear.plugin.HeaderMenuButton('', m1);
    mb.render(headercell.getMenuControl().getElement());
    mb.setHeaderCell(headercell);
    this.headerMenuBtns_.push(mb);

    goog.events.listen(m1, goog.ui.Component.EventType.SHOW, this.handleMenuShow_, false, this);
    goog.events.listen(m1, goog.ui.Component.EventType.HIDE, this.handleMenuHide_, false, this);

  },this);

  goog.array.forEach(this.headerMenuBtns_, function(mb) {
    goog.events.listen(mb, goog.ui.Component.EventType.ACTION, this.handleMenuEvent_, false, this);
  },this);
};

/**
 * [close_ description]
 */
pear.plugin.HeaderMenu.prototype.close_ = function() {
  // goog.style.showElement(this.getElement(), '');
};

/**
 * [getCSSClassName description]
 * @return {string} [description]
 */
pear.plugin.HeaderMenu.prototype.getCSSClassName = function() {
  return 'pear-grid-header-cell-menu';
};

/**
 * [handleMenuEvent_ description]
 * @param  {goog.events.Event} ge [description]
 */
pear.plugin.HeaderMenu.prototype.handleMenuEvent_ = function(ge) {
  var menuBtn = (/** @type {pear.plugin.HeaderMenuButton} */ (ge.currentTarget));
  var headercell = menuBtn.getHeaderCell();
  var headercellTitle = headercell.getCellData()['headerText'];
  // alert(be.target.getContent() + ' clicked on ' + headercellTitle + ' column.');
  alert(' clicked on ' + headercellTitle + ' column.');
};

/**
 * [handleMenuShow_ description]
 * @param  {goog.events.Event} ge [description]
 */
pear.plugin.HeaderMenu.prototype.handleMenuShow_ = function(ge) {
  var menu = (/** @type {goog.ui.Menu} */ (ge.currentTarget));
  var menuBtn = menu.getParent();
  var headercell = menuBtn.getHeaderCell();
  headercell.setMenuState(true);
};

/**
 * [handleMenuHide_ description]
 * @param  {goog.events.Event} ge [description]
 */
pear.plugin.HeaderMenu.prototype.handleMenuHide_ = function(ge) {
  var menu = (/** @type {goog.ui.Menu} */ (ge.currentTarget));
  var menuBtn = menu.getParent();
  var headercell = menuBtn.getHeaderCell();
  headercell.setMenuState(false);
  headercell.slideMenuOpen(false);
};




goog.provide('pear.plugin.HeaderMenuButton');

goog.require('goog.ui.MenuButton');

/**
 * [HeaderMenuButton description]
 * @param {string|Node|Array.<Node>|NodeList} content Text caption 
 * or DOM structure to display as the content of the control (if any).
 * @constructor
 * @extends {goog.ui.MenuButton}
 */
pear.plugin.HeaderMenuButton = function(content, opt_menu) {
  goog.ui.MenuButton.call(this, content, opt_menu);
};
goog.inherits(pear.plugin.HeaderMenuButton, goog.ui.MenuButton);

/**
 * [cell_ description]
 * @type {pear.ui.GridHeaderCell}
 */
pear.plugin.HeaderMenuButton.prototype.cell_ = null;

/**
 * [setHeaderCell description]
 * @param {pear.ui.GridHeaderCell} cell [description]
 */
pear.plugin.HeaderMenuButton.prototype.setHeaderCell = function(cell) {
  this.cell_ = cell;
};

/**
 * [getHeaderCell description]
 * @return {pear.ui.GridHeaderCell} [description]
 */
pear.plugin.HeaderMenuButton.prototype.getHeaderCell = function() {
  return this.cell_;
};
