goog.provide('pear.ui.editor.IEditor');



/**
 *
 * @interface
 */
pear.ui.editor.IEditor = function() {};


/**
 * flag , set to true if editor is open
 * @type {boolean}
 * @private
 */
pear.ui.editor.IEditor.prototype.open_;


/**
 * New Value
 * @type {*}
 * @private
 */
pear.ui.editor.IEditor.prototype.newValue_;


/**
 * Mediator
 * @type {pear.ui.editor.CellEditorMediator}
 * @private
 */
pear.ui.editor.IEditor.prototype.mediator_;


/**
 * set Mediator
 * @param {pear.ui.editor.CellEditorMediator} mediator
 * @public
 */
pear.ui.editor.IEditor.prototype.setMediator;


/**
 * get Mediator
 * @return {pear.ui.editor.CellEditorMediator}
 * @public
 */
pear.ui.editor.IEditor.prototype.getMediator;


/**
 * Get Old Value
 * @return {*} [description]
 * @public
 */
pear.ui.editor.IEditor.prototype.getGridCellData;


/**
 * Editor Element
 * @return { Element} [description]
 */
pear.ui.editor.IEditor.prototype.getEditorElement;


/**
 * Get New Value
 * @return {*} [description]
 * @protected
 */
pear.ui.editor.IEditor.prototype.getNewValue;


/**
 * set new Value
 * @param {*} value [description]
 * @protected
 */
pear.ui.editor.IEditor.prototype.setNewValue;


/**
 * create Editor Dom
 * @protected
 */
pear.ui.editor.IEditor.prototype.createDom;


/**
 * validateInternal
 * @param  {*} oldrowdata [description]
 * @param  {*} newrowdata [description]
 *
 */
pear.ui.editor.IEditor.prototype.validateInternal;


/**
 * set Validator Function
 * @param {Function} fn [description]
 */
pear.ui.editor.IEditor.prototype.setValidateCallback;


/**
 * set Focus on Editor
 * @protected
 */
pear.ui.editor.IEditor.prototype.setFocus;


/**
 * Is Editor Open ?
 * @return {boolean} [description]
 *
 */
pear.ui.editor.IEditor.prototype.isOpen;


/**
 * Open Editor
 *
 */
pear.ui.editor.IEditor.prototype.open;


/**
 * Commit
 * @protected
 */
pear.ui.editor.IEditor.prototype.commit;


/**
 * Rollback
 * @protected
 */
pear.ui.editor.IEditor.prototype.rollback;


/**
 * Close Editor
 */
pear.ui.editor.IEditor.prototype.close;


/**
 * Root DOM of Editor
 */
pear.ui.editor.IEditor.prototype.createEditorRootDom;


/**
 * Craete Editor DOM
 * @protected
 */
pear.ui.editor.IEditor.prototype.createEditorDom;


/**
 * @inheritDoc
 * @protected
 */
pear.ui.editor.IEditor.prototype.disposeInternal;
