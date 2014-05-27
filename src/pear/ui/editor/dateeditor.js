goog.provide('pear.ui.editor.DatePickerEditor');

goog.require('goog.dom');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.ui.InputDatePicker');
goog.require('goog.ui.LabelInput');
goog.require('pear.ui.editor.EditorBase');



/**
 * Class that provides the basic text editor , implements
 * (defined in @link {goog.pear.ui.editor.IEditor}.
 * @constructor
 * @extends { pear.ui.editor.EditorBase }
 */
pear.ui.editor.DatePickerEditor = function() {
  pear.ui.editor.EditorBase.call(this);

};
goog.inherits(pear.ui.editor.DatePickerEditor, pear.ui.editor.EditorBase);


/**
 * set Focus on Editor
 * @inheritDoc
 */
pear.ui.editor.DatePickerEditor.prototype.setFocus = function() {
  this.input_.getElement().focus();
};


/**
 * Set new Value
 */
pear.ui.editor.DatePickerEditor.prototype.setValueFromEditor = function() {
  var datatype = this.getMediator().getGridCell().getDataColumn().getDataType();
  if (datatype === pear.data.Column.DataType.NUMBER) {
    this.setNewValue(parseInt(this.input_.getValue(), 10));
  }else {
    this.setNewValue(this.input_.getValue());
  }
};


/**
 * Close this editor
 * @protected
 */
pear.ui.editor.DatePickerEditor.prototype.close = function() {
  this.input_.dispose();
  pear.ui.editor.DatePickerEditor.superClass_.close.call(this);
};


/**
 * Create DOM for Editor
 * @protected
 */
pear.ui.editor.DatePickerEditor.prototype.createEditorDom = function() {
  var PATTERN = "MM'/'dd'/'yyyy";
  var formatter = new goog.i18n.DateTimeFormat(PATTERN);
  var parser = new goog.i18n.DateTimeParse(PATTERN);

  this.input_ = new goog.ui.LabelInput('MM/DD/YYYY');
  this.input_.render(this.getEditorElement());
  this.input_.setValue(/** @type {string} */ (this.getGridCellData()));

  this.idatepicker_ = new goog.ui.InputDatePicker(formatter, parser);
  this.idatepicker_.decorate(this.input_.getElement());
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects
 * @protected
 */
pear.ui.editor.DatePickerEditor.prototype.disposeInternal = function() {
  this.input_.dispose();
  this.idatepicker_.dispose();

  pear.ui.editor.DatePickerEditor.superClass_.disposeInternal.call(this);
};


/**
 * Sets the value of the input element.  This can be overridden to support
 * alternative types of input setting.
 *
 * @param {string} value The value to set.
 */
goog.ui.InputDatePicker.prototype.setInputValue = function(value) {
  var el = this.getElement();
  if (el.labelInput_) {
    var labelInput = /** @type {goog.ui.LabelInput} */ (el.labelInput_);
    labelInput.setValue(value);
    // restore focus
    labelInput.getElement().focus();
  } else {
    el.value = value;
  }
};
