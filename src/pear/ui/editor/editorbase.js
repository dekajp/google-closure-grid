goog.provide('pear.ui.editor.EditorBase');

goog.require('goog.events.EventTarget');


/**
 * @class  pear.ui.editor.EditorBase
 * @classdesc
 * Base class for All Gridcell Editors , All editors must inherit this class
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pear.ui.editor.EditorBase = function() {
  goog.events.EventTarget.call(this);
 
};
goog.inherits(pear.ui.editor.EditorBase, goog.events.EventTarget);



/**
 * @inheritDoc
 * @protected
 */
pear.ui.editor.EditorBase.prototype.disposeInternal = function() {
  
  pear.ui.editor.EditorBase.superClass_.disposeInternal.call(this);
};

