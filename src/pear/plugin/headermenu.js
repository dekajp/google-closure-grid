goog.provide('pear.plugin.HeaderMenu');

goog.require('pear.ui.Plugin');
goog.require('goog.events.Event');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.ui.Menu');
goog.require('goog.ui.ToolbarMenuButton');



pear.plugin.HeaderMenu = function() {
  pear.ui.Plugin.call(this);
};
goog.inherits(pear.plugin.HeaderMenu, pear.ui.Plugin);


pear.plugin.HeaderMenu.prototype.getClassId = function() {
  return 'HeaderMenu';
};

pear.plugin.HeaderMenu.prototype.init = function(){
  var grid = this.getGrid();
  this.createHeaderMenuDom();
};

pear.plugin.HeaderMenu.prototype.disposeInternal = function() {
  goog.array.forEach(this.headerMenuBtns_,function(mb){
    mb.dispose();
  })
  pear.plugin.HeaderMenu.superClass_.disposeInternal.call(this);
};


//pear.plugin.HeaderMenu.prototype.getElement = function (){
//  return this.element_;
//}

/**
 * @private
 *
 */
pear.plugin.HeaderMenu.prototype.createHeaderMenuDom = function() {
  var grid = this.getGrid();
  var headerRow = grid.getHeaderRow();
  this.headerMenuBtns_ = [];
  headerRow.forEachChild (function (headercell){

    var m1 = new goog.ui.Menu();
    m1.setId('menudemo');
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
      m1.addItem(item);
    });

    var mb = new pear.plugin.HeaderMenuButton('',m1);
    mb.render(headercell.getMenuControl().getElement());
    mb.setHeaderCell(headercell);
    this.headerMenuBtns_.push(mb);

    goog.events.listen(m1, goog.ui.Component.EventType.SHOW, this.handleMenuShow_,false,this);
    goog.events.listen(m1, goog.ui.Component.EventType.HIDE, this.handleMenuHide_,false,this);

  },this);

  goog.array.forEach(this.headerMenuBtns_,function (mb){
    goog.events.listen(mb, goog.ui.Component.EventType.ACTION, this.handleMenuEvent_,false,this);
  },this);
};

pear.plugin.HeaderMenu.prototype.close_ = function(){
  goog.style.showElement(this.getElement(),'');
}

pear.plugin.HeaderMenu.prototype.getCSSClassName = function(){
  return 'pear-grid-header-cell-menu';
}

pear.plugin.HeaderMenu.prototype.handleMenuEvent_ = function(be){
  var menuBtn = be.currentTarget;
  var headercell = menuBtn.getHeaderCell();
  var headercellTitle = headercell.getCellData().headerText;
  alert(be.target.getContent()+' clicked on '+headercellTitle+ ' column.');
};

pear.plugin.HeaderMenu.prototype.handleMenuShow_ = function(be){
  var menu = be.currentTarget;
  var menuBtn = menu.getParent();
  var headercell = menuBtn.getHeaderCell();
  headercell.setMenuState(true);
};

pear.plugin.HeaderMenu.prototype.handleMenuHide_ = function(be){
  var menu = be.currentTarget;
  var menuBtn = menu.getParent();
  var headercell = menuBtn.getHeaderCell();
  headercell.setMenuState(false);
  headercell.slideMenuOpen(false);
};

goog.provide('pear.plugin.HeaderMenuButton');

goog.require('goog.ui.MenuButton');

pear.plugin.HeaderMenuButton = function(
    content, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.MenuButton.call(this, content, opt_menu, opt_renderer );
};
goog.inherits(pear.plugin.HeaderMenuButton, goog.ui.MenuButton);

//pear.plugin.HeaderMenuButton.prototype.cell_ = null;

pear.plugin.HeaderMenuButton.prototype.setHeaderCell = function(cell){
  this.cell_= cell;
}

pear.plugin.HeaderMenuButton.prototype.getHeaderCell = function(){
  return this.cell_;
}