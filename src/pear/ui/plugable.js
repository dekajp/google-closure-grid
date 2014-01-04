goog.provide('pear.ui.Plugable');


pear.ui.Plugable = function() {};


/**
 * An expando property to indicate that an object implements
 * pear.ui.Pluggable.
 *
 * See addImplementation/isImplementedBy.
 *
 * @type {string}
 * @const
 */
pear.ui.Plugable.IMPLEMENTED_BY_PROP =
    'pear_plugable_' + ((Math.random() * 1e6) | 0);



pear.ui.Plugable.addImplementation = function(cls) {
  cls.prototype[pear.ui.Plugable.IMPLEMENTED_BY_PROP] = true;
};


/**
 * @param {Object} obj The object to check.
 * @return {boolean} Whether a given instance implements
 *     Listenable. The class/superclass of the instance must call
 *     addImplementation.
 */
pear.ui.Plugable.isImplementedBy = function(obj) {
  try {
    return !!(obj && obj[pear.ui.Plugable.IMPLEMENTED_BY_PROP]);
  } catch (e) {
    return false;
  }
};

// TODO: show is typically called after EnterDocument of Grid
pear.ui.Plugable.prototype.show ;

// TODO:All plugins must have destroy or dispose method