goog.provide('pear.ui.editor.EditorBase');

goog.require('goog.events.EventTarget');



/**
 * @class  pear.ui.editor.EditorBase
 * @classdesc
 * Base class for All Gridcell Editors , All editors must inherit this class
 * @constructor
 * @extends {goog.Disposable}
 * @implements {pear.ui.editor.IEditor}
 */
pear.ui.editor.EditorBase = function() {
  goog.Disposable.call(this);
};
goog.inherits(pear.ui.editor.EditorBase, goog.Disposable);


/**
 * @type {Element}
 */
pear.ui.editor.EditorBase.prototype.rootElement_;


/**
 * flag , set to true if editor is open
 * @type {?boolean}
 * @private
 */
pear.ui.editor.EditorBase.prototype.open_ = false;


/**
 * New Value
 * @type {*}
 * @private
 */
pear.ui.editor.EditorBase.prototype.newValue_ = null;


/**
 * Mediator
 * @type {pear.ui.editor.CellEditorMediator}
 * @private
 */
pear.ui.editor.EditorBase.prototype.mediator_ = null;


/**
 * set Mediator
 * @param {pear.ui.editor.CellEditorMediator} mediator
 * @public
 */
pear.ui.editor.EditorBase.prototype.setMediator = function(mediator) {
  this.mediator_ = mediator;
};


/**
 * get Mediator
 * @return {pear.ui.editor.CellEditorMediator}
 * @public
 */
pear.ui.editor.EditorBase.prototype.getMediator = function() {
  return this.mediator_;
};


/**
 * Get Old Value
 * @return {*} [description]
 * @public
 */
pear.ui.editor.EditorBase.prototype.getGridCellData = function() {
  return this.getMediator().getGridCell().getCellData();
};


/**
 * Editor Element
 * @return {Element} [description]
 */
pear.ui.editor.EditorBase.prototype.getEditorElement = function() {
  return this.rootElement_;
};


/**
 * Get New Value
 * @return {*} [description]
 * @protected
 */
pear.ui.editor.EditorBase.prototype.getNewValue = function() {
  return this.newValue_;
};


/**
 * set new Value
 * @param {*} value [description]
 * @protected
 */
pear.ui.editor.EditorBase.prototype.setNewValue = function(value) {
  this.newValue_ = value;
};


/**
 * remove content from GridCell
 * @private
 */
pear.ui.editor.EditorBase.prototype.removeContent_ = function() {
  this.getMediator().getGridCell().removeContent();
};


/**
 * create Editor Dom
 * @protected
 */
pear.ui.editor.EditorBase.prototype.createDom = function() {
  this.createEditorRootDom();
  this.createEditorDom();
};


/**
 * validateInternal
 * @param  {*} oldrowdata [description]
 * @param  {*} newrowdata [description]
 * @return {boolean} true , if pass
 */
pear.ui.editor.EditorBase.prototype.validateInternal =
    function(oldrowdata, newrowdata) {
  if (this.validateFn) {
    return this.validateFn.call(this, oldrowdata, newrowdata);
  }else {
    return true;
  }
};


/**
 * set Validator Function
 * @param {Function} fn [description]
 */
pear.ui.editor.EditorBase.prototype.setValidateCallback = function(fn) {
  this.validateFn = fn;
};


/**
 * set Focus on Editor
 * @protected
 */
pear.ui.editor.EditorBase.prototype.setFocus = function() {
};


/**
 * Is Editor Open ?
 * @return {boolean} [description]
 *
 */
pear.ui.editor.EditorBase.prototype.isOpen = function() {
  return !!this.open_;
};


/**
 * Open Editor
 * @protected
 */
pear.ui.editor.EditorBase.prototype.open = function() {
  this.open_ = true;
  this.removeContent_();

  this.createEditorRootDom();
  this.createEditorDom();

  this.setFocus();
};


/**
 * Commit
 * @protected
 */
pear.ui.editor.EditorBase.prototype.commit = function() {
  this.getMediator().commit();
};


/**
 * Rollback
 * @protected
 */
pear.ui.editor.EditorBase.prototype.rollback = function() {
  this.getMediator().rollback();
};


/**
 * Close Editor
 */
pear.ui.editor.EditorBase.prototype.close = function() {
  this.open_ = false;
};


/**
 * Get Event Target
 * @protected
 * @return {Element} [description]
 */
pear.ui.editor.EditorBase.prototype.getEventTarget = function() {
  return this.rootElement_;
};


/**
 * Get Key Handler
 * @return {Element}
 * @protected
 */
pear.ui.editor.EditorBase.prototype.getKeyHandler = function() {
  return this.keyHandler_ ||
      (this.keyHandler_ = new goog.events.KeyHandler(this.getEventTarget()));
};


/**
 * Root DOM of Editor
 */
pear.ui.editor.EditorBase.prototype.createEditorRootDom = function() {
  this.rootElement_ = goog.dom.createDom(
      'div', 'pear-grid-cell-data-content pear-grid-cell-editor');
  goog.dom.appendChild(this.getMediator().getGridCell().getElement(),
      this.rootElement_);

  goog.events.listen(this.getKeyHandler(),
      goog.events.KeyHandler.EventType.KEY,
      this.handleKeyEvent, false, this);
  goog.events.listen(this.getEventTarget(),
      goog.events.EventType.CLICK, this.handleMouseEvent);
  goog.events.listen(this.getEventTarget(),
      goog.events.EventType.MOUSEDOWN, this.handleMouseEvent);
  goog.events.listen(this.getEventTarget(),
      goog.events.EventType.MOUSEUP, this.handleMouseEvent);
};


/**
 * handle Key event on Editor
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @protected
 * @return {boolean}
 */
pear.ui.editor.EditorBase.prototype.handleKeyEvent = function(e) {

  // Do not handle the key event if any modifier key is pressed.
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return false;
  }

  // Either nothing is highlighted, or the highlighted control didn't handle
  // the key event, so attempt to handle it here.
  switch (e.keyCode) {
    case goog.events.KeyCodes.ESC:
    case goog.events.KeyCodes.TAB:
      this.rollback();
      break;
    case goog.events.KeyCodes.ENTER:
      this.setValueFromEditor();
      this.commit();
      break;
    default:
      return false;
  }
  return true;
};


/**
 * create Editor DOM
 * @protected
 */
pear.ui.editor.EditorBase.prototype.createEditorDom = function() {};


/**
 * handleMouseEvent
 * @param {goog.events.BrowserEvent} be Key event to handle.
 * @protected
 */
pear.ui.editor.EditorBase.prototype.handleMouseEvent = function(be) {
  be.preventDefault();
};


/**
 * [detachEvents_ description]
 * @private
 */
pear.ui.editor.EditorBase.prototype.detachEvents_ = function() {
  goog.events.unlisten(this.getEventTarget(),
      goog.events.EventType.CLICK, this.handleMouseEvent);
  goog.events.unlisten(this.getEventTarget(),
      goog.events.EventType.MOUSEDOWN, this.handleMouseEvent);
  goog.events.unlisten(this.getEventTarget(),
      goog.events.EventType.MOUSEUP, this.handleMouseEvent);

  goog.dom.removeNode(this.getEventTarget());
  this.rootElement_ = null;
};


/**
 * @inheritDoc
 * @protected
 */
pear.ui.editor.EditorBase.prototype.disposeInternal = function() {
  this.oldValue_ = null;
  this.newValue_ = null;
  this.mediator_ = null;
  this.open_ = null;
  this.detachEvents_();
  pear.ui.editor.EditorBase.superClass_.disposeInternal.call(this);
};

