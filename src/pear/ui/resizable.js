goog.provide('pear.ui.Resizable');
goog.provide('pear.ui.Resizable.EventType');

goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');   
goog.require('goog.math.Coordinate');
goog.require('goog.string');

//Code adapted Bottom and Right resizing from - https://groups.google.com/forum/#!topic/closure-library-discuss/p5Xq8_CLxIs
pear.ui.Resizable = function(element, opt_data, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  opt_data = opt_data || {};

  this.element_ = goog.dom.$(element);

  this.minWidth_ = goog.isNumber(opt_data.minWidth) ? opt_data.minWidth : 0;
  this.maxWidth_ = goog.isNumber(opt_data.maxWidth) ? opt_data.maxWidth : 0;
  this.minHeight_ = goog.isNumber(opt_data.minHeight) ? opt_data.minHeight : 0;
  this.maxHeight_ = goog.isNumber(opt_data.maxHeight) ? opt_data.maxHeight : 0;
 
  this.handles_ = opt_data.handles || pear.ui.Resizable.Position.ALL;

  this.handleDraggers_ = {};
  this.handlers_ = {};

  this.setupResizableHandler_();

};
goog.inherits(pear.ui.Resizable, goog.ui.Component);


pear.ui.Resizable.EventType = {
  RESIZE: 'resize',
  START_RESIZE: 'start_resize',
  END_RESIZE: 'end_resize'
};


pear.ui.Resizable.Position = {
  RIGHT: 2, //E
  BOTTOM: 4, //S
  LEFT: 8, //W
  TOP:16,  //N
  TOP_LEFT: 32, //NW
  TOP_RIGHT: 64, //NE
  BOTTOM_RIGHT: 128, //SE
  BOTTOM_LEFT: 256, //SW
  ALL: 511
};

pear.ui.Resizable.prototype.getResizehandle = function (position){
  return this.handlers_[position] ;
};

pear.ui.Resizable.prototype.setupResizableHandler_ = function (){
  if (this.handles_ & pear.ui.Resizable.Position.RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.RIGHT,
        ['e','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM,
        ['s','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.LEFT,
        ['w','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP,
        ['n','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP_LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP_LEFT,
        ['nw','corner','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP_RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP_RIGHT,
        ['ne','corner','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM_RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM_RIGHT,
        ['se','corner','handle']);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM_LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM_LEFT,
        ['sw','corner','handle']);
  }
};

pear.ui.Resizable.prototype.addResizableHandler_ = function(position, classNames) {
  var dom = this.getDomHelper();
  var handle = dom.createDom('div');
  goog.array.forEach(classNames,function(value){
    goog.dom.classes.add(handle, this.getCSSClassName()+'-'+value); 
  },this) ;   
  this.element_.appendChild(handle);

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
};

pear.ui.Resizable.prototype.setupMinAndMaxCoord_ = function ( coord, size, position ){  
  
  this.leftX_ = 0;
  this.rightX_ = 0;
  this.topY_ = 0;
  this.bottomY_ = 0;

  if (position & 64){
    this.leftX_ =   coord.x;
    this.rightX_ =  coord.x;
  }else{
    this.leftX_ =   coord.x - ( this.maxWidth_ - size.width );
    this.rightX_ =  coord.x + ( size.width - this.minWidth_ ) ;
  }

  if ( position & 256 ){
    this.topY_ = coord.y ;
    this.bottomY_ = coord.y;
  }else{
    this.topY_ = coord.y - (  this.maxHeight_ - size.height );
    this.bottomY_ = coord.y + ( size.height - this.minHeight_ ) ;  
  }
  
};

pear.ui.Resizable.prototype.getCSSClassName = function (){
  return 'pear-ui-resizable';
};

pear.ui.Resizable.prototype.handleDragStart_ = function(e) {
  
  var dragger = e.currentTarget;
  var position = this.getDraggerPosition_(dragger);
  var targetPos = goog.style.getPosition(dragger.target);
  
  var size = this.getSize_(this.element_);
  var coord = this.getPosition_(this.element_);
  var coordBorder = goog.style.getBorderBox(this.element_);

  this.setupMinAndMaxCoord_( coord, size, position );

  this.handlerOffsetCoord_ = new goog.math.Coordinate( targetPos.x, targetPos.y );
  this.elementCoord_ = coord;  
  this.elementSize_ = new goog.math.Size(size.width , size.height);  
  
  //Setup the Min and Max , Left and Top

  this.dispatchEvent({
    type: pear.ui.Resizable.EventType.START_RESIZE
  });
};

pear.ui.Resizable.prototype.getPosition_ = function( el ) {
  var coord = goog.style.getPosition(el);  
  return coord;
}
pear.ui.Resizable.prototype.getSize_ = function( el ) {
  var size = goog.style.getSize(el);  
  return size;
}

pear.ui.Resizable.prototype.handleDrag_ = function(e) {
  var deltaWidth = 0, deltaHeight = 0, newX = 0, newY = 0;
  var dragger = e.currentTarget;
  var position = this.getDraggerPosition_(dragger);

  var el = this.element_  ;
  var size = this.getSize_(this.element_);
  var coord = this.getPosition_(this.element_);
  
 // this.debug('DRAG', dragger);

  if (position & 194){ /* RIGHT, TOP_RIGHT, BOTTOM_RIGHT */
    size.width = this.elementSize_.width + dragger.deltaX - this.handlerOffsetCoord_.x;  
  }

  if (position & 388){ /* BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT */
    size.height = this.elementSize_.height + dragger.deltaY - this.handlerOffsetCoord_.y;  
  }

  if ( position & 296 ){/* LEFT, TOP_LEFT, BOTTOM_LEFT */
    size.width = this.elementSize_.width - dragger.deltaX + this.handlerOffsetCoord_.x;
    coord.x = this.elementCoord_.x + dragger.deltaX - this.handlerOffsetCoord_.x;
  }
 
  if ( position & 112 ){/* TOP, TOP_LEFT, TOP_RIGHT */
    size.height = this.elementSize_.height - dragger.deltaY + this.handlerOffsetCoord_.y;   
    coord.y = this.elementCoord_.y + dragger.deltaY - this.handlerOffsetCoord_.y;    
  }
 
  // Now size the containers.
  this.resize_(el, size, coord, position);

  if (goog.isFunction(el.resize)) {
    el.resize(size);
  }
  return false;
};



pear.ui.Resizable.prototype.handleDragEnd_ = function(e) {
  this.dispatchEvent({
    type: pear.ui.Resizable.EventType.END_RESIZE
  });
};


pear.ui.Resizable.prototype.resize_ = function(element, size, coord, position) {
  var newSize = new goog.math.Size(Math.max(size.width, 0), Math.max(size.height, 0));
  //376 = LEFT, TOP_LEFT, BOTTOM_LEFT, TOP, TOP_RIGHT
  if (this.minWidth_ > 0) {    
    newSize.width = Math.max(newSize.width, this.minWidth_);
    coord.x = ( (position & 376) && newSize.width === this.minWidth_ ) ? this.rightX_ : coord.x ;
  }
  if (this.maxWidth_ > 0){
    newSize.width = Math.min(newSize.width, this.maxWidth_);
    coord.x = ( (position & 376) && newSize.width === this.maxWidth_ ) ? this.leftX_ : coord.x ;
  }
  if (this.minHeight_ > 0) {
    newSize.height = Math.max(newSize.height, this.minHeight_);
    coord.y = ( (position & 376) && newSize.height === this.minHeight_ ) ? this.bottomY_ : coord.y ;
  }
  if (this.maxHeight_ > 0) {
    newSize.height = Math.min(newSize.height, this.maxHeight_);
    coord.y = ( (position & 376) && newSize.height === this.maxHeight_ ) ? this.topY_ : coord.y ;
  }

 
  this.dispatchEvent({
    type: pear.ui.Resizable.EventType.RESIZE,
    size: newSize.clone()
  });
  

  // TODO: Add a goog.math.Size.max call for below.
  goog.style.setBorderBoxSize(element, newSize);

  // 2px are causing issue - i think it's margin , certainly it's not border
  //http://msdn.microsoft.com/en-us/library/hh781509(v=vs.85).aspx
  var marginbox = goog.style.getMarginBox(this.element_);
  coord.x = coord.x - marginbox.left;
  coord.y = coord.y - marginbox.top;

  goog.style.setPosition(element,coord);

};


pear.ui.Resizable.prototype.getDraggerPosition_ = function(dragger) {
  for (var position in this.handleDraggers_) {
    if (this.handleDraggers_[position] === dragger) {
      return goog.string.toNumber(position);
    }
  }
  return null;
};


pear.ui.Resizable.prototype.getMinWidth = function() {
  return this.minWidth_;
};


pear.ui.Resizable.prototype.setMinWidth = function(width) {
  this.minWidth_ = width;
};


pear.ui.Resizable.prototype.getMaxWidth = function() {
  return this.maxWidth_;
};


pear.ui.Resizable.prototype.setMaxWidth = function(width) {
  this.maxWidth_ = width;
};


pear.ui.Resizable.prototype.getMinHeight = function() {
  return this.minHeight_;
};


pear.ui.Resizable.prototype.setMinHeight = function(height) {
  this.minHeight_ = height;
};


pear.ui.Resizable.prototype.getMaxHeight = function() {
  return this.maxHeight_;
};


pear.ui.Resizable.prototype.setMaxHeight = function(height) {
  this.maxHeight_ = height;
};




/** @inheritDoc */
pear.ui.Resizable.prototype.disposeInternal = function() {
  pear.ui.Resizable.superClass_.disposeInternal.call(this);

  for (var position in this.handleDraggers_) {
    this.handleDraggers_[position].dispose();
  }
  this.handleDraggers_ = {};
  for (var position in this.handlers_) {
    goog.dom.removeNode(this.handlers_[position]);
  }
  this.handlers_ = {};
};
