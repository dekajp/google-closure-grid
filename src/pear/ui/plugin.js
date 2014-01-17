
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



pear.ui.Plugin.prototype.grid_ = null;


pear.ui.Plugin.prototype.getGrid = function() {
  return this.gridObject;
};


pear.ui.Plugin.prototype.setGrid = function(grid) {
  this.gridObject = grid;
};

pear.ui.Plugin.prototype.registerGrid = function(grid) {
  this.setGrid(grid);
};

pear.ui.Plugin.prototype.unregisterGrid = function(grid) {
  if (this.getGrid()) {
    this.disable(this.getGrid());
    this.setGrid(null);
  }
};



pear.ui.Plugin.prototype.enable = function(grid) {
  if (this.getGrid() == grid) {
    this.enabled_ = true;
  } else {
    goog.log.error(this.logger, 'Trying to enable an unregistered grid with ' +
        'this plugin.');
  }
};


pear.ui.Plugin.prototype.disable = function(grid) {
  if (this.getGrid() == grid) {
    this.enabled_ = false;
  } else {
    goog.log.error(this.logger, 'Trying to disable an unregistered grid ' +
        'with this plugin.');
  }
};


pear.ui.Plugin.prototype.isEnabled = function(fieldObject) {
  return this.getGrid() == fieldObject ? this.enabled_ : false;
};


pear.ui.Plugin.prototype.setAutoDispose = function(autoDispose) {
  this.autoDispose_ = autoDispose;
};


pear.ui.Plugin.prototype.isAutoDispose = function() {
  return this.autoDispose_;
};


/** @override */
pear.ui.Plugin.prototype.disposeInternal = function() {
  if (this.getGrid()) {
    this.unregisterGrid(this.getGrid());
  }

  pear.ui.Plugin.superClass_.disposeInternal.call(this);
};



pear.ui.Plugin.prototype.getClassId;

pear.ui.Plugin.prototype.init;

