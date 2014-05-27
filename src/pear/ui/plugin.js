
goog.provide('pear.ui.Plugin');



/**
 * Abstract API for grid plugins.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.ui.Plugin = function() {
  goog.events.EventTarget.call(this);

};
goog.inherits(pear.ui.Plugin, goog.events.EventTarget);


/**
 *
 * @type {pear.ui.Grid}
 * @private
 */
pear.ui.Plugin.prototype.grid_ = null;


/**
 * Whether plugin is enabled or not
 * @type {boolean}
 * @private
 */
pear.ui.Plugin.prototype.enabled_ = true;


/**
 * Get Instance of Grid , on which this plugin is registered
 * @return {pear.ui.Grid}
 * @public
 */
pear.ui.Plugin.prototype.getGrid = function() {
  return this.grid_;
};


/**
 * @param {pear.ui.Grid} grid
 * @private
 */
pear.ui.Plugin.prototype.setGrid_ = function(grid) {
  this.grid_ = grid;
};


/**
 * @param {pear.ui.Grid} grid
 * @public
 */
pear.ui.Plugin.prototype.registerGrid = function(grid) {
  this.setGrid_(grid);
};


/**
 * disabling the plugin from the grid , this will call disable on the Plugin
 * @param {pear.ui.Grid} grid
 *
 * @public
 */
pear.ui.Plugin.prototype.unregisterGrid = function(grid) {
  if (this.getGrid()) {
    this.disable(this.getGrid());
    this.setGrid_(null);
  }
};


/**
 * enable the plugin
 * @param {pear.ui.Grid} grid
 * @public
 */
pear.ui.Plugin.prototype.enable = function(grid) {
  if (this.getGrid() == grid) {
    this.enabled_ = true;
  } else {
    // 'Trying to enable an unregistered grid with this plugin.'
  }
};


/**
 * disable the plugin
 * @param {pear.ui.Grid} grid
 */
pear.ui.Plugin.prototype.disable = function(grid) {
  if (this.getGrid() == grid) {
    this.enabled_ = false;
  } else {
    // 'Trying to enable an unregistered grid with this plugin.'
  }
};


/**
 * Is plugin enabled ?
 * @param  {pear.ui.Grid}  gridObject
 * @return {boolean}
 * @public
 */
pear.ui.Plugin.prototype.isEnabled = function(gridObject) {
  return this.getGrid() == gridObject ? this.enabled_ : false;
};


/** @override */
pear.ui.Plugin.prototype.disposeInternal = function() {
  if (this.getGrid()) {
    this.unregisterGrid(this.getGrid());
  }
  delete this.enabled_;
  pear.ui.Plugin.superClass_.disposeInternal.call(this);
};


/**
 * return id.
 * @return {string}
 */
pear.ui.Plugin.prototype.getClassId;


/**
 * init method
 */
pear.ui.Plugin.prototype.init;

