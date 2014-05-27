goog.provide('pear.ui.Resizable');
goog.provide('pear.ui.Resizable.EventType');

goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');



/**
 * Column Resizable
 * Code Adapted from : http://goo.gl/VA43nv
 * @param {Element} element
 * @param {?Object=} opt_data
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
pear.ui.Resizable = function(element, opt_data, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  opt_data = opt_data || {};

  /**
   * Root Element
   * @type {Element}
   * @private
   */
  this.rootElement_ = goog.dom.getElement(element);

  /**
   * @type {number}
   * @private
   */
  this.minWidth_ = goog.isNumber(opt_data.minWidth) ? opt_data.minWidth : 0;
  /**
   * @type {number}
   * @private
   */
  this.maxWidth_ = goog.isNumber(opt_data.maxWidth) ? opt_data.maxWidth : 0;
  /**
   * @type {number}
   * @private
   */
  this.minHeight_ = goog.isNumber(opt_data.minHeight) ? opt_data.minHeight : 0;
  /**
   * @type {number}
   * @private
   */
  this.maxHeight_ = goog.isNumber(opt_data.maxHeight) ? opt_data.maxHeight : 0;

  /**
   * @type {number}
   * @private
   */
  this.handles_ = opt_data['handles'] || pear.ui.Resizable.Position.ALL;

  /**
   * List of resizable handle draggers
   * @type {Object.<number,goog.fx.Dragger>}
   * @private
   */
  this.handleDraggers_ = {};

  /**
   * List of resizable handles
   * @type {Object.<number,Element>}
   * @private
   */
  this.handlers_ = {};

  this.setupResizableHandler_();

  /**
   * @private
   * @type {goog.math.Coordinate?}
   */
  this.handlerOffsetCoord_ = null;
  /**
   * @private
   * @type {goog.math.Coordinate?}
   */
  this.elementCoord_ = null;
  /**
   * @private
   * @type {goog.math.Size?}
   */
  this.elementSize_ = null;

};
goog.inherits(pear.ui.Resizable, goog.ui.Component);


/**
 * @enum {string}
 *
 */
pear.ui.Resizable.EventType = {
  RESIZE: 'resize',
  START_RESIZE: 'start_resize',
  END_RESIZE: 'end_resize'
};


/**
 * Resizable Handle postion
 * @enum {number}
 */
pear.ui.Resizable.Position = {
  RIGHT: 2, //E
  BOTTOM: 4, //S
  LEFT: 8, //W
  TOP: 16,  //N
  TOP_LEFT: 32, //NW
  TOP_RIGHT: 64, //NE
  BOTTOM_RIGHT: 128, //SE
  BOTTOM_LEFT: 256, //SW
  ALL: 511,
  NONE: 0
};


/**
 * Get Resizable Handle by Position
 * @param  {pear.ui.Resizable.Position} position handle position
 * @return {Element} Resizable Handle
 */
pear.ui.Resizable.prototype.getResizehandle = function(position) {
  return this.handlers_[position];
};


/**
 *
 * Setup all handles
 * @private
 */
pear.ui.Resizable.prototype.setupResizableHandler_ = function() {
  if (this.handles_ & pear.ui.Resizable.Position.RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.RIGHT,
        ['e', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM,
        ['s', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.LEFT,
        ['w', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP,
        ['n', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP_LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP_LEFT,
        ['nw', 'corner', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP_RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP_RIGHT,
        ['ne', 'corner', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM_RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM_RIGHT,
        ['se', 'corner', 'handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM_LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM_LEFT,
        ['sw', 'corner', 'handle']);
  }
};


/**
 *
 * Add handle
 * @param {pear.ui.Resizable.Position} position
 * @param {Array} classNames
 * @private
 */
pear.ui.Resizable.prototype.addResizableHandler_ =
    function(position, classNames) {
  var dom = this.getDomHelper();
  var handle = dom.createDom('div');
  goog.array.forEach(classNames, function(value) {
    goog.dom.classes.add(handle, this.getCSSClassName() + '-' + value);
  },this);
  this.rootElement_.appendChild(handle);

  var dragger = new goog.fx.Dragger(handle);
  dragger.defaultAction = function() {};

  this.getHandler().
      listen(dragger, goog.fx.Dragger.EventType.START,
          this.handleDragStart_).
      listen(dragger, goog.fx.Dragger.EventType.DRAG,
          this.handleDrag_).
      listen(dragger, goog.fx.Dragger.EventType.END,
          this.handleDragEnd_);

  this.handleDraggers_[position] = dragger;
  this.handlers_[position] = handle;

  // Supress MouseMove,MouseOver  Events on these Handles

  this.getHandler().
      listen(handle, goog.events.EventType.MOUSEDOWN,
          this.handleEvents_);
};


/**
 *
 * Setup Limits
 * @param {goog.math.Coordinate} coord
 * @param {goog.math.Size} size
 * @param {pear.ui.Resizable.Position} position
 * @private
 */
pear.ui.Resizable.prototype.setupMinAndMaxCoord_ =
    function(coord, size, position) {

  this.leftX_ = 0;
  this.rightX_ = 0;
  this.topY_ = 0;
  this.bottomY_ = 0;

  if (position & 64) {
    this.leftX_ = coord.x;
    this.rightX_ = coord.x;
  }else {
    this.leftX_ = coord.x - (this.maxWidth_ - size.width);
    this.rightX_ = coord.x + (size.width - this.minWidth_);
  }

  if (position & 256) {
    this.topY_ = coord.y;
    this.bottomY_ = coord.y;
  }else {
    this.topY_ = coord.y - (this.maxHeight_ - size.height);
    this.bottomY_ = coord.y + (size.height - this.minHeight_);
  }

};


/**
 * Root Class name
 * @return {string}
 */
pear.ui.Resizable.prototype.getCSSClassName = function() {
  return 'pear-ui-resizable';
};


/**
 * Retrieves the computed value of the position CSS attribute.
 * @param {Element} el  Element
 * @return {string}
 * @private
 */
pear.ui.Resizable.prototype.getComputedPosition_ = function(el) {
  var positionStyle = goog.style.getComputedPosition(el);
  return positionStyle;
};


/**
 * @param {Element} el
 * @return {goog.math.Coordinate}
 * @private
 */
pear.ui.Resizable.prototype.getPosition_ = function(el) {
  var coord;
  var positionStyle = this.getComputedPosition_(el);
  //if (positionStyle === 'absolute') {
  coord = goog.style.getPosition(this.rootElement_);
  // }else if (positionStyle === 'relative') {
  //  coord = goog.style.getRelativePosition(this.rootElement_);
  //}
  return coord;
};


/**
 * @param {Element} el
 * @return {goog.math.Size}
 * @private
 */
pear.ui.Resizable.prototype.getSize_ = function(el) {
  //var size = goog.style.getSize(el);
  // Expensive - clousre getSize returns the border box size
  // and setHeight actually set the
  // style attribute height
  var size = goog.style.getContentBoxSize(el);
  return size;
};


/**
 * @param {goog.events.BrowserEvent} e
 * @private
 */
pear.ui.Resizable.prototype.handleEvents_ = function(e) {
  e.preventDefault();
};


/**
 * @param {goog.events.Event} ge
 * @private
 */
pear.ui.Resizable.prototype.handleDragStart_ = function(ge) {

  var dragger = (/** @type {?goog.fx.Dragger} */ (ge.currentTarget));
  var position = this.getDraggerPosition_(dragger);
  var targetPos = goog.style.getPosition(dragger.target);

  var size = this.getSize_(this.rootElement_);
  var coord = this.getPosition_(this.rootElement_);
  var coordBorder = goog.style.getBorderBox(this.rootElement_);

  this.setupMinAndMaxCoord_(coord, size, position);

  this.handlerOffsetCoord_ = new goog.math.Coordinate(targetPos.x, targetPos.y);
  this.elementCoord_ = coord;
  this.elementSize_ = new goog.math.Size(size.width, size.height);

  // TODO : Calculate final size here
  this.dispatchResizableEvent_(pear.ui.Resizable.EventType.START_RESIZE, null);
};


/**
 * @param {goog.events.Event} ge
 * @private
 * @return {boolean}
 */
pear.ui.Resizable.prototype.handleDrag_ = function(ge) {
  var deltaWidth = 0, deltaHeight = 0, newX = 0, newY = 0;
  var dragger = (/** @type {?goog.fx.Dragger} */ (ge.currentTarget));
  var position = this.getDraggerPosition_(dragger);

  var el = this.rootElement_;
  var size = this.getSize_(el);
  var coord = this.getPosition_(el);


  // this.debug('DRAG', dragger);

  if (position & 194) { /* RIGHT, TOP_RIGHT, BOTTOM_RIGHT */
    size.width = this.elementSize_.width +
        dragger.deltaX -
        this.handlerOffsetCoord_.x;
  }

  if (position & 388) { /* BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT */
    size.height = this.elementSize_.height +
        dragger.deltaY -
                      this.handlerOffsetCoord_.y;
  }

  if (position & 296) {/* LEFT, TOP_LEFT, BOTTOM_LEFT */
    size.width = this.elementSize_.width -
        dragger.deltaX +
        this.handlerOffsetCoord_.x;
    coord.x = this.elementCoord_.x +
        dragger.deltaX -
                this.handlerOffsetCoord_.x;
  }

  if (position & 112) {/* TOP, TOP_LEFT, TOP_RIGHT */
    size.height = this.elementSize_.height -
        dragger.deltaY +
        this.handlerOffsetCoord_.y;
    coord.y = this.elementCoord_.y +
        dragger.deltaY -
                this.handlerOffsetCoord_.y;
  }


  // Now size the containers.
  this.resize_(el, size, coord, position);

  if (goog.isFunction(el.resize)) {
    el.resize(size);
  }

  ge.preventDefault();
  return false;
};


/**
 * @param {goog.events.Event} ge
 * @private
 */
pear.ui.Resizable.prototype.handleDragEnd_ = function(ge) {
  ge.preventDefault();
  // TODO : Calculate final size here
  this.dispatchResizableEvent_(pear.ui.Resizable.EventType.END_RESIZE, null);
};


/**
 * @param {Element} element
 * @param {goog.math.Size} size
 * @param {goog.math.Coordinate} coord
 * @param {pear.ui.Resizable.Position} position
 * @private
 */
pear.ui.Resizable.prototype.resize_ = function(element, size, coord, position) {
  var newSize = new goog.math.Size(Math.max(size.width, 0),
      Math.max(size.height, 0));
  //376 = LEFT, TOP_LEFT, BOTTOM_LEFT, TOP, TOP_RIGHT
  if (this.minWidth_ > 0) {
    newSize.width = Math.max(newSize.width, this.minWidth_);
    coord.x = ((position & 376) && newSize.width === this.minWidth_) ?
        this.rightX_ : coord.x;
  }
  if (this.maxWidth_ > 0) {
    newSize.width = Math.min(newSize.width, this.maxWidth_);
    coord.x = ((position & 376) && newSize.width === this.maxWidth_) ?
        this.leftX_ : coord.x;
  }
  if (this.minHeight_ > 0) {
    newSize.height = Math.max(newSize.height, this.minHeight_);
    coord.y = ((position & 376) && newSize.height === this.minHeight_) ?
                  this.bottomY_ : coord.y;
  }
  if (this.maxHeight_ > 0) {
    newSize.height = Math.min(newSize.height, this.maxHeight_);
    coord.y = ((position & 376) && newSize.height === this.maxHeight_) ?
        this.topY_ : coord.y;
  }

  this.dispatchResizableEvent_(pear.ui.Resizable.EventType.RESIZE,
      newSize.clone());

  // TODO: this needs to be fixed
  //goog.style.setBorderBoxSize(element, newSize);
  goog.style.setWidth(element, newSize.width);
  goog.style.setHeight(element, newSize.height);

  // 2px are causing issue - i think it's margin , certainly it's not border
  //http://msdn.microsoft.com/en-us/library/hh781509(v=vs.85).aspx
  var marginbox = goog.style.getMarginBox(element);
  coord.x = coord.x - marginbox.left;
  coord.y = coord.y - marginbox.top;

  if (this.getComputedPosition_(element) === 'absolute') {
    goog.style.setPosition(element, coord);
  }
};


/**
 * @param {goog.fx.Dragger} dragger
 * @return {pear.ui.Resizable.Position}
 * @private
 */
pear.ui.Resizable.prototype.getDraggerPosition_ = function(dragger) {
  for (var position in this.handleDraggers_) {
    var p = goog.string.toNumber(position);
    if (this.handleDraggers_[p] === dragger) {
      return (/** @type {pear.ui.Resizable.Position} */(p));
    }
  }
  return pear.ui.Resizable.Position.NONE;
};


/**
 * @return {number}
 */
pear.ui.Resizable.prototype.getMinWidth = function() {
  return this.minWidth_;
};


/**
 * @param {number} width
 */
pear.ui.Resizable.prototype.setMinWidth = function(width) {
  this.minWidth_ = width;
};


/**
 * @return {number}
 */
pear.ui.Resizable.prototype.getMaxWidth = function() {
  return this.maxWidth_;
};


/**
 * @param {number} width
 */
pear.ui.Resizable.prototype.setMaxWidth = function(width) {
  this.maxWidth_ = width;
};


/**
 * @return {number}
 */
pear.ui.Resizable.prototype.getMinHeight = function() {
  return this.minHeight_;
};


/**
 * @param {number} height
 */
pear.ui.Resizable.prototype.setMinHeight = function(height) {
  this.minHeight_ = height;
};


/**
 * @return {number}
 */
pear.ui.Resizable.prototype.getMaxHeight = function() {
  return this.maxHeight_;
};


/**
 * @param {number} height
 */
pear.ui.Resizable.prototype.setMaxHeight = function(height) {
  this.maxHeight_ = height;
};


/**
 * get handle instance
 * @param {pear.ui.Resizable.Position} position
 * @return {Element}
 */
pear.ui.Resizable.prototype.getHandle = function(position) {
  return this.handlers_[position];
};


/**
 * [dispatchResizableEvent description]
 * @param  {string} type [description]
 * @param  {?goog.math.Size} size [description]
 * @private
 */
pear.ui.Resizable.prototype.dispatchResizableEvent_ = function(type, size) {
  var evt = new pear.ui.ResizableEvent(type, this, size);
  this.dispatchEvent(evt);
};


/** @inheritDoc */
pear.ui.Resizable.prototype.disposeInternal = function() {
  pear.ui.Resizable.superClass_.disposeInternal.call(this);

  for (var position in this.handleDraggers_) {
    var p = goog.string.toNumber(position);
    this.handleDraggers_[p].dispose();
  }
  this.handleDraggers_ = {};
  for (var position in this.handlers_) {
    var p = goog.string.toNumber(position);
    goog.events.unlisten(this.handlers_[p], goog.events.EventType.MOUSEDOWN,
        this.handleEvents_);
    goog.dom.removeNode(this.handlers_[p]);
  }
  this.handlers_ = {};
};



/**
 * Object representing GridHeaderCellEvent.
 *
 * @param {string} type Event type.
 * @param {pear.ui.Resizable} target
 * @param {?goog.math.Size} size
 * @extends {goog.events.Event}
 * @constructor
 */
pear.ui.ResizableEvent = function(type, target, size) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {?goog.math.Size}
   */
  this.size = size;
};
goog.inherits(pear.ui.ResizableEvent, goog.events.Event);

