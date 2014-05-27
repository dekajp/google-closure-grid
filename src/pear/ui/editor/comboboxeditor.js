goog.provide('pear.ui.editor.ComboBoxEditor');

goog.require('goog.ui.LabelInput');
goog.require('pear.ui.editor.EditorBase');



/**
 * Class that provides the basic dropdown list , implements
 * (defined in @link {goog.pear.ui.editor.IEditor}.
 * @constructor
 * @extends {pear.ui.editor.EditorBase}
 */
pear.ui.editor.ComboBoxEditor = function() {
  pear.ui.editor.EditorBase.call(this);

};
goog.inherits(pear.ui.editor.ComboBoxEditor, pear.ui.editor.EditorBase);


/**
 * set Focus on Editor
 * @inheritDoc
 */
pear.ui.editor.ComboBoxEditor.prototype.setFocus = function() {
  this.input_.getElement().focus();
};


/**
 * Set new Value
 */
pear.ui.editor.ComboBoxEditor.prototype.setValueFromEditor = function() {
  this.setNewValue(this.input_.getValue());
  if (!!this.fnCallbackToGetValueFromEditor_) {
    this.fnCallbackToGetValueFromEditor_.call(this);
  }
};


/**
 * Close this editor
 * @protected
 */
pear.ui.editor.ComboBoxEditor.prototype.close = function() {
  pear.ui.editor.ComboBoxEditor.superClass_.close.call(this);
};


/**
 * [getComboxBox description]
 * @return {goog.ui.ComboBox} [description]
 */
pear.ui.editor.ComboBoxEditor.prototype.getComboxBox = function() {
  return this.input_;
};


/**
 * [setAfterEditorDom description]
 * @param {Function} fn [description]
 */
pear.ui.editor.ComboBoxEditor.prototype.setAfterEditorDom = function(fn) {
  this.fnCallbackAfterEditorDom_ = fn;
};


/**
 * Callback to get Value from Editor
 * @param {Function} fn [description]
 */
pear.ui.editor.ComboBoxEditor.prototype.setCallbackToGetValueFromEditor =
    function(fn) {
  this.fnCallbackToGetValueFromEditor_ = fn;
};


/**
 * Create DOM for Editor
 * @protected
 */
pear.ui.editor.ComboBoxEditor.prototype.createEditorDom = function() {
  this.input_ = new goog.ui.ComboBox();
  this.input_.setUseDropdownArrow(true);
  this.input_.render(this.getEditorElement());

  this.input_.setValue(/** @type {string} */ (this.getGridCellData()));

  if (!!this.fnCallbackAfterEditorDom_) {
    this.fnCallbackAfterEditorDom_.call(this);
  }

  goog.events.listen(this.input_, 'change', function(ge) {
    this.setValueFromEditor();
    this.commit();
    ge.preventDefault();
  },false, this);
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects
 * @protected
 */
pear.ui.editor.ComboBoxEditor.prototype.disposeInternal = function() {
  this.input_.dispose();
  pear.ui.editor.ComboBoxEditor.superClass_.disposeInternal.call(this);
};
