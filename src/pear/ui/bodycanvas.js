goog.provide('pear.ui.BodyCanvas');

goog.require('goog.ui.Component');
goog.require('goog.ui.ContainerRenderer');



/**
 * Body Canvas
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.BodyCanvas = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(pear.ui.BodyCanvas, goog.ui.Component);


/**
 * @override
 */
pear.ui.BodyCanvas.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();

  goog.dom.classes.set(elem, 'pear-grid-body-canvas');
};

pear.ui.BodyCanvas.prototype.disposeInternal = function() {
  this.enableFocusHandling_(false);
  pear.ui.BodyCanvas.superClass_.disposeInternal.call(this);
};

/**
  @override
*/
pear.ui.BodyCanvas.prototype.enterDocument = function() {
  pear.ui.BodyCanvas.superClass_.enterDocument.call(this);
  
  this.enableFocusHandling_(true);
};

pear.ui.BodyCanvas.prototype.getKeyEventTarget = function() {
  return this.getElement();
};


/**
 * Returns the keyboard event handler for this grid, lazily created the
 * first time this method is called.  The keyboard event handler listens for
 * keyboard events on the grid canvas
 * @return {goog.events.KeyHandler} Keyboard event handler for this container.
 */
pear.ui.BodyCanvas.prototype.getKeyHandler = function() {
  return this.keyHandler_ ||
      (this.keyHandler_ = new goog.events.KeyHandler(this.getKeyEventTarget()));
};

/**
 * Sets up listening for events applicable to focusable grid.
 * @param {boolean} enable Whether to enable or disable focus handling.
 * @private
 */
pear.ui.BodyCanvas.prototype.enableFocusHandling_ = function(enable) {
  var handler = this.getHandler();
  var keyTarget = this.getKeyEventTarget();
  if (enable) {
    handler.
        listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus,false,this).
        listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur,false,this).
        listen(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
            this.handleKeyEvent,false,this);
  } else {
    handler.
        unlisten(keyTarget, goog.events.EventType.FOCUS, this.handleFocus,false,this).
        unlisten(keyTarget, goog.events.EventType.BLUR, this.handleBlur,false,this).
        unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY,
            this.handleKeyEvent,false,this);
  }
};



/**
 * Handles focus events raised when the key event target receives
 * keyboard focus.
 * @param {goog.events.BrowserEvent} e Focus event to handle.
 */
pear.ui.BodyCanvas.prototype.handleFocus = function(e) {
  // No-op 
};


/**
 * Handles blur events raised when grid  loses keyboard focus. 
 * @param {goog.events.BrowserEvent} e Blur event to handle.
 */
pear.ui.BodyCanvas.prototype.handleBlur = function(e) {
  // No-op
};


/**
 * Handle Keyboard Events
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 */
pear.ui.BodyCanvas.prototype.handleKeyEvent = function(e) {
  // No-op
};

