goog.provide('pear.ui.editor.TextEditor');

goog.require('goog.ui.LabelInput');
goog.require('pear.ui.editor.EditorBase');



/**
 * Class that provides the basic text editor , implements
 * (defined in @link {goog.pear.ui.editor.IEditor}.
 * @constructor
 * @extends {pear.ui.editor.EditorBase}
 */
pear.ui.editor.TextEditor = function() {
  pear.ui.editor.EditorBase.call(this);

};
goog.inherits(pear.ui.editor.TextEditor, pear.ui.editor.EditorBase);


/**
 * set Focus on Editor
 * @inheritDoc
 */
pear.ui.editor.TextEditor.prototype.setFocus = function() {
  this.input_.getElement().focus();
};


/**
 * Set new Value
 */
pear.ui.editor.TextEditor.prototype.setValueFromEditor = function() {
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
pear.ui.editor.TextEditor.prototype.close = function() {
  this.input_.dispose();
  pear.ui.editor.TextEditor.superClass_.close.call(this);
};


/**
 * Create DOM for Editor
 * @protected
 */
pear.ui.editor.TextEditor.prototype.createEditorDom = function() {
  this.input_ = new goog.ui.LabelInput();
  this.input_.render(this.getEditorElement());

  this.input_.setValue(/** @type {string} */ (this.getGridCellData()));

  goog.events.listen(this.input_, goog.ui.Component.EventType.ACTION,
      function(ge) {
        ge.preventDefault();
      });
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects
 * @protected
 */
pear.ui.editor.TextEditor.prototype.disposeInternal = function() {
  this.input_.dispose();
  pear.ui.editor.TextEditor.superClass_.disposeInternal.call(this);
};
