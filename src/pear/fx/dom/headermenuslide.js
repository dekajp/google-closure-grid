
goog.provide('pear.fx.dom.HeaderMenuSlide');

goog.require('goog.fx.dom.PredefinedEffect');



/**
 * Creates an animation object that will slide an element from A to B.  (This
 * in effect automatically sets up the onanimate event for an Animation object)
 *
 * Start and End should be 2 dimensional arrays
 *
 * @param {Element} element Dom Node to be used in the animation.
 * @param {Array.<number>} start 2D array for start coordinates (X, Y).
 * @param {Array.<number>} end 2D array for end coordinates (X, Y).
 * @param {number} time Length of animation in milliseconds.
 * @param {Function=} opt_acc Acceleration function, returns 0-1 for inputs 0-1.
 * @extends {goog.fx.dom.PredefinedEffect}
 * @constructor
 */
pear.fx.dom.HeaderMenuSlide = function(element, start, end, time, opt_acc) {
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(pear.fx.dom.HeaderMenuSlide, goog.fx.dom.PredefinedEffect);


/** @override */
pear.fx.dom.HeaderMenuSlide.prototype.updateStyle = function() {

  var marginX = (this.isRightPositioningForRtlEnabled() &&
      this.isRightToLeft()) ? 'marginRight' : 'marginLeft';
  var y = this.coords[0];
  this.element.style[marginX] = y + 'px';
};
