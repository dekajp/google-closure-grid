var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.global.CLOSURE_DEFINES;
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0]);
  }
  for (var part;parts.length && (part = parts.shift());) {
    if (!parts.length && opt_object !== undefined) {
      cur[part] = opt_object;
    } else {
      if (cur[part]) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
  }
};
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};
goog.DEBUG = true;
goog.define("goog.LOCALE", "en");
goog.define("goog.TRUSTED_SITE", true);
goog.provide = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while (namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }
  goog.exportPath_(name);
};
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if (!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };
  goog.implicitNamespaces_ = {};
}
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for (var part;part = parts.shift();) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for (var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0;require = requires[j];j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};
goog.define("goog.ENABLE_DEBUG_LOADER", true);
goog.require = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }
    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if (goog.global.console) {
      goog.global.console["error"](errorMessage);
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
if (goog.DEPENDENCIES_ENABLED) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc;
  };
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else {
      if (!goog.inHtmlDocument_()) {
        return;
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for (var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if (doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true;
    } else {
      return false;
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }
      deps.visited[path] = true;
      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }
    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }
    for (var i = 0;i < scripts.length;i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };
  goog.findBasePath_();
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js");
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == "object") {
    if (value) {
      if (value instanceof Array) {
        return "array";
      } else {
        if (value instanceof Object) {
          return s;
        }
      }
      var className = Object.prototype.toString.call((value));
      if (className == "[object Window]") {
        return "object";
      }
      if (className == "[object Array]" || typeof value.length == "number" && (typeof value.splice != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")))) {
        return "array";
      }
      if (className == "[object Function]" || typeof value.call != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call"))) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if (s == "function" && typeof value.call == "undefined") {
      return "object";
    }
  }
  return s;
};
goog.isDef = function(val) {
  return val !== undefined;
};
goog.isNull = function(val) {
  return val === null;
};
goog.isDefAndNotNull = function(val) {
  return val != null;
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array";
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number";
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function";
};
goog.isString = function(val) {
  return typeof val == "string";
};
goog.isBoolean = function(val) {
  return typeof val == "boolean";
};
goog.isNumber = function(val) {
  return typeof val == "number";
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function";
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function";
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.hasUid = function(obj) {
  return!!obj[goog.UID_PROPERTY_];
};
goog.removeUid = function(obj) {
  if ("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == "object" || type == "array") {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == "array" ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments));
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error;
  }
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date;
};
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if (typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true;
        } else {
          goog.evalWorksForGlobals_ = false;
        }
      }
      if (goog.evalWorksForGlobals_) {
        goog.global.eval(script);
      } else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for (var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join("-");
  };
  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }
  if (opt_modifier) {
    return className + "-" + rename(opt_modifier);
  } else {
    return rename(className);
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value);
  }
  return str;
};
goog.getMsgWithFallback = function(a, b) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);
    return parentCtor.prototype[methodName].apply(me, args);
  };
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (goog.DEBUG) {
    if (!caller) {
      throw Error("arguments.caller not defined.  goog.base() expects not " + "to be running in strict mode. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    }
  }
  if (caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1));
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else {
      if (foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args);
      }
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global);
};
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose;
goog.disposable.IDisposable.prototype.isDisposed;
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.provide("goog.disposeAll");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    if (goog.Disposable.INCLUDE_STACK_ON_CREATION) {
      this.creationStack = (new Error).stack;
    }
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
};
goog.Disposable.MonitoringMode = {OFF:0, PERMANENT:1, INTERACTIVE:2};
goog.define("goog.Disposable.MONITORING_MODE", 0);
goog.define("goog.Disposable.INCLUDE_STACK_ON_CREATION", true);
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {};
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.onDisposeCallbacks_;
goog.Disposable.prototype.creationStack;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if (goog.Disposable.MONITORING_MODE == goog.Disposable.MonitoringMode.PERMANENT && !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable));
};
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if (!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = [];
  }
  this.onDisposeCallbacks_.push(goog.bind(callback, opt_scope));
};
goog.Disposable.prototype.disposeInternal = function() {
  if (this.onDisposeCallbacks_) {
    while (this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()();
    }
  }
};
goog.Disposable.isDisposed = function(obj) {
  if (obj && typeof obj.isDisposed == "function") {
    return obj.isDisposed();
  }
  return false;
};
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == "function") {
    obj.dispose();
  }
};
goog.disposeAll = function(var_args) {
  for (var i = 0, len = arguments.length;i < len;++i) {
    var disposable = arguments[i];
    if (goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable);
    } else {
      goog.dispose(disposable);
    }
  }
};
goog.provide("pear.data.DataModel");
goog.require("goog.Disposable");
pear.data.DataModel = function(columns, rows) {
  goog.Disposable.call(this);
  this.columns_ = columns || [];
  this.rows_ = rows || [];
};
goog.inherits(pear.data.DataModel, goog.Disposable);
pear.data.DataModel.DataType = {NUMBER:"number", TEXT:"text", BOOLEAN:"boolean", DATETIME:"datetime"};
pear.data.DataModel.prototype.columns_ = [];
pear.data.DataModel.prototype.rows_ = [];
pear.data.DataModel.prototype.getColumns = function() {
  return this.columns_;
};
pear.data.DataModel.prototype.getRows = function() {
  return this.rows_;
};
pear.data.DataModel.prototype.disposeInternal = function() {
  this.columns_ = null;
  this.rows_ = null;
  pear.data.DataModel.superClass_.disposeInternal.call(this);
};
goog.provide("goog.dom.NodeType");
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    this.stack = (new Error).stack || "";
  }
  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0;
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};
goog.string.subs = function(str, var_args) {
  var splitParts = str.split("%s");
  var returnString = "";
  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length && splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }
  return returnString + splitParts.join("%s");
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str);
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str);
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str);
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str);
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str);
};
goog.string.isSpace = function(ch) {
  return ch == " ";
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && (ch >= " " && ch <= "~") || ch >= "\u0080" && ch <= "\ufffd";
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ");
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n");
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ");
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ");
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "");
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "");
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if (test1 < test2) {
    return-1;
  } else {
    if (test1 == test2) {
      return 0;
    } else {
      return 1;
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return-1;
  }
  if (!str2) {
    return 1;
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for (var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if (a != b) {
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }
  return str1 < str2 ? -1 : 1;
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "));
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>");
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;").replace(goog.string.singleQuoteRe_, "&#39;");
  } else {
    if (!goog.string.allRe_.test(str)) {
      return str;
    }
    if (str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;");
    }
    if (str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;");
    }
    if (str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;");
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;");
    }
    if (str.indexOf("'") != -1) {
      str = str.replace(goog.string.singleQuoteRe_, "&#39;");
    }
    return str;
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /"/g;
goog.string.singleQuoteRe_ = /'/g;
goog.string.allRe_ = /[&<>"']/;
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, "&")) {
    if ("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, "&")) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement("div");
  } else {
    div = document.createElement("div");
  }
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if (value) {
      return value;
    }
    if (entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    if (!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    return seen[s] = value;
  });
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return'"';
      default:
        if (entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        return s;
    }
  });
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml);
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (str.length > chars) {
    str = str.substring(0, chars - 3) + "...";
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint);
  } else {
    if (str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos);
    }
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join("");
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join("");
};
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }
  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    if (cc < 256) {
      rv = "\\x";
      if (cc < 16 || cc > 256) {
        rv += "0";
      }
    } else {
      rv = "\\u";
      if (cc < 4096) {
        rv += "0";
      }
    }
    rv += cc.toString(16).toUpperCase();
  }
  return goog.string.jsEscapeCache_[c] = rv;
};
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if (index >= 0 && (index < s.length && stringLength > 0)) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "");
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "");
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string);
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s;
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj);
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "");
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for (var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || (goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2]));
    } while (order == 0);
  }
  return order;
};
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return-1;
  } else {
    if (left > right) {
      return 1;
    }
  }
  return 0;
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return "goog_" + goog.string.uniqueStringCounter_++;
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};
goog.string.isLowerCamelCase = function(str) {
  return/^[a-z]+([A-Z][a-z]*)*$/.test(str);
};
goog.string.isUpperCamelCase = function(str) {
  return/^([A-Z][a-z]*)+$/.test(str);
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase();
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};
goog.string.parseInt = function(value) {
  if (isFinite(value)) {
    value = String(value);
  }
  if (goog.isString(value)) {
    return/^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10);
  }
  return NaN;
};
goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }
  return returnVal;
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.dom.NodeType");
goog.require("goog.string");
goog.define("goog.asserts.ENABLE_ASSERTS", goog.DEBUG);
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if (givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs;
  } else {
    if (defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs;
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return(value);
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + " should not be enumerable in Object.prototype.");
  }
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for (var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }
  return obj;
};
goog.object.containsKey = function(obj, key) {
  return key in obj;
};
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if (rv = key in obj) {
    delete obj[key];
  }
  return rv;
};
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value;
};
goog.object.clone = function(obj) {
  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == "object" || type == "array") {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == "array" ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }
    for (var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }
  if (argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for (var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }
  var rv = {};
  for (var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};
goog.object.isImmutableView = function(obj) {
  return!!Object.isFrozen && Object.isFrozen(obj);
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.define("goog.NATIVE_ARRAY_PROTOTYPES", goog.TRUSTED_SITE);
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1];
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if (goog.isString(arr)) {
    if (!goog.isString(obj) || obj.length != 1) {
      return-1;
    }
    return arr.indexOf(obj, fromIndex);
  }
  for (var i = fromIndex;i < arr.length;i++) {
    if (i in arr && arr[i] === obj) {
      return i;
    }
  }
  return-1;
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if (fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex);
  }
  if (goog.isString(arr)) {
    if (!goog.isString(obj) || obj.length != 1) {
      return-1;
    }
    return arr.lastIndexOf(obj, fromIndex);
  }
  for (var i = fromIndex;i >= 0;i--) {
    if (i in arr && arr[i] === obj) {
      return i;
    }
  }
  return-1;
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = l - 1;i >= 0;--i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2) {
      var val = arr2[i];
      if (f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val;
      }
    }
  }
  return res;
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr);
    }
  }
  return res;
};
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.reduce ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if (opt_obj) {
    f = goog.bind(f, opt_obj);
  }
  return goog.array.ARRAY_PROTOTYPE_.reduce.call(arr, f, val);
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.reduceRight ? function(arr, f, val, opt_obj) {
  goog.asserts.assert(arr.length != null);
  if (opt_obj) {
    f = goog.bind(f, opt_obj);
  }
  return goog.array.ARRAY_PROTOTYPE_.reduceRight.call(arr, f, val);
} : function(arr, f, val, opt_obj) {
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true;
    }
  }
  return false;
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false;
    }
  }
  return true;
};
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if (f.call(opt_obj, element, index, arr)) {
      ++count;
    }
  }, opt_obj);
  return count;
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = 0;i < l;i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return-1;
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for (var i = l - 1;i >= 0;i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return-1;
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};
goog.array.clear = function(arr) {
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1;i >= 0;i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if (rv = i >= 0) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments);
};
goog.array.toArray = function(object) {
  var length = object.length;
  if (length > 0) {
    var rv = new Array(length);
    for (var i = 0;i < length;i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return[];
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for (var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if (goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && Object.prototype.hasOwnProperty.call(arr2, "callee")) {
      arr1.push.apply(arr1, arr2);
    } else {
      if (isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for (var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j];
        }
      } else {
        arr1.push(arr2);
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1));
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    return goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
  };
  var hashFn = opt_hashFn || defaultHashFn;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = hashFn(current);
    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target);
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj);
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while (left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      found = !compareResult;
    }
  }
  return found ? left : ~left;
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare);
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  }
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value;
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || (!goog.isArrayLike(arr2) || arr1.length != arr2.length)) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0;i < l;i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false;
};
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};
  for (var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter.call(opt_obj, value, i, array);
    if (goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }
  return buckets;
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element;
  });
  return ret;
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if (opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end;
  }
  if (step * (end - start) < 0) {
    return[];
  }
  if (step > 0) {
    for (var i = start;i < end;i += step) {
      array.push(i);
    }
  } else {
    for (var i = start;i > end;i += step) {
      array.push(i);
    }
  }
  return array;
};
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0;i < n;i++) {
    array[i] = value;
  }
  return array;
};
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else {
      if (n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
      }
    }
  }
  return array;
};
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  var removedItems = goog.array.ARRAY_PROTOTYPE_.splice.call(arr, fromIndex, 1);
  goog.array.ARRAY_PROTOTYPE_.splice.call(arr, toIndex, 0, removedItems[0]);
};
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return[];
  }
  var result = [];
  for (var i = 0;true;i++) {
    var value = [];
    for (var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for (var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};
goog.provide("goog.math");
goog.require("goog.array");
goog.require("goog.asserts");
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a);
};
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a);
};
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};
goog.math.modulo = function(a, b) {
  var r = a % b;
  return r * b < 0 ? r + b : r;
};
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a);
};
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 1E-6);
};
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360);
};
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};
goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees));
};
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees));
};
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1, x2 - x1)));
};
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) - goog.math.standardAngle(startAngle);
  if (d > 180) {
    d = d - 360;
  } else {
    if (d <= -180) {
      d = 360 + d;
    }
  }
  return d;
};
goog.math.sign = function(x) {
  return x == 0 ? 0 : x < 0 ? -1 : 1;
};
goog.math.longestCommonSubsequence = function(array1, array2, opt_compareFn, opt_collectorFn) {
  var compare = opt_compareFn || function(a, b) {
    return a == b;
  };
  var collect = opt_collectorFn || function(i1, i2) {
    return array1[i1];
  };
  var length1 = array1.length;
  var length2 = array2.length;
  var arr = [];
  for (var i = 0;i < length1 + 1;i++) {
    arr[i] = [];
    arr[i][0] = 0;
  }
  for (var j = 0;j < length2 + 1;j++) {
    arr[0][j] = 0;
  }
  for (i = 1;i <= length1;i++) {
    for (j = 1;j <= length2;j++) {
      if (compare(array1[i - 1], array2[j - 1])) {
        arr[i][j] = arr[i - 1][j - 1] + 1;
      } else {
        arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
      }
    }
  }
  var result = [];
  var i = length1, j = length2;
  while (i > 0 && j > 0) {
    if (compare(array1[i - 1], array2[j - 1])) {
      result.unshift(collect(i - 1, j - 1));
      i--;
      j--;
    } else {
      if (arr[i - 1][j] > arr[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
  }
  return result;
};
goog.math.sum = function(var_args) {
  return(goog.array.reduce(arguments, function(sum, value) {
    return sum + value;
  }, 0));
};
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length;
};
goog.math.sampleVariance = function(var_args) {
  var sampleSize = arguments.length;
  if (sampleSize < 2) {
    return 0;
  }
  var mean = goog.math.average.apply(null, arguments);
  var variance = goog.math.sum.apply(null, goog.array.map(arguments, function(val) {
    return Math.pow(val - mean, 2);
  })) / (sampleSize - 1);
  return variance;
};
goog.math.standardDeviation = function(var_args) {
  return Math.sqrt(goog.math.sampleVariance.apply(null, arguments));
};
goog.math.isInt = function(num) {
  return isFinite(num) && num % 1 == 0;
};
goog.math.isFiniteNumber = function(num) {
  return isFinite(num) && !isNaN(num);
};
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.floor(num + (opt_epsilon || 2E-15));
};
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.ceil(num - (opt_epsilon || 2E-15));
};
goog.provide("goog.math.Coordinate");
goog.require("goog.math");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};
if (goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
  };
}
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};
goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};
goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y);
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};
goog.math.Coordinate.prototype.ceil = function() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  return this;
};
goog.math.Coordinate.prototype.floor = function() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  return this;
};
goog.math.Coordinate.prototype.round = function() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  return this;
};
goog.math.Coordinate.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.x += tx.x;
    this.y += tx.y;
  } else {
    this.x += tx;
    if (goog.isNumber(opt_ty)) {
      this.y += opt_ty;
    }
  }
  return this;
};
goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.x *= sx;
  this.y *= sy;
  return this;
};
goog.provide("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.math.Box = function(top, right, bottom, left) {
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left;
};
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x);
  for (var i = 1;i < arguments.length;i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x);
  }
  return box;
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left);
};
if (goog.DEBUG) {
  goog.math.Box.prototype.toString = function() {
    return "(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)";
  };
}
goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other);
};
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if (goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left;
  } else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left;
  }
  return this;
};
goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom);
};
goog.math.Box.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.top == b.top && (a.right == b.right && (a.bottom == b.bottom && a.left == b.left));
};
goog.math.Box.contains = function(box, other) {
  if (!box || !other) {
    return false;
  }
  if (other instanceof goog.math.Box) {
    return other.left >= box.left && (other.right <= box.right && (other.top >= box.top && other.bottom <= box.bottom));
  }
  return other.x >= box.left && (other.x <= box.right && (other.y >= box.top && other.y <= box.bottom));
};
goog.math.Box.relativePositionX = function(box, coord) {
  if (coord.x < box.left) {
    return coord.x - box.left;
  } else {
    if (coord.x > box.right) {
      return coord.x - box.right;
    }
  }
  return 0;
};
goog.math.Box.relativePositionY = function(box, coord) {
  if (coord.y < box.top) {
    return coord.y - box.top;
  } else {
    if (coord.y > box.bottom) {
      return coord.y - box.bottom;
    }
  }
  return 0;
};
goog.math.Box.distance = function(box, coord) {
  var x = goog.math.Box.relativePositionX(box, coord);
  var y = goog.math.Box.relativePositionY(box, coord);
  return Math.sqrt(x * x + y * y);
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && (b.left <= a.right && (a.top <= b.bottom && b.top <= a.bottom));
};
goog.math.Box.intersectsWithPadding = function(a, b, padding) {
  return a.left <= b.right + padding && (b.left <= a.right + padding && (a.top <= b.bottom + padding && b.top <= a.bottom + padding));
};
goog.math.Box.prototype.ceil = function() {
  this.top = Math.ceil(this.top);
  this.right = Math.ceil(this.right);
  this.bottom = Math.ceil(this.bottom);
  this.left = Math.ceil(this.left);
  return this;
};
goog.math.Box.prototype.floor = function() {
  this.top = Math.floor(this.top);
  this.right = Math.floor(this.right);
  this.bottom = Math.floor(this.bottom);
  this.left = Math.floor(this.left);
  return this;
};
goog.math.Box.prototype.round = function() {
  this.top = Math.round(this.top);
  this.right = Math.round(this.right);
  this.bottom = Math.round(this.bottom);
  this.left = Math.round(this.left);
  return this;
};
goog.math.Box.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.right += tx.x;
    this.top += tx.y;
    this.bottom += tx.y;
  } else {
    this.left += tx;
    this.right += tx;
    if (goog.isNumber(opt_ty)) {
      this.top += opt_ty;
      this.bottom += opt_ty;
    }
  }
  return this;
};
goog.math.Box.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.right *= sx;
  this.top *= sy;
  this.bottom *= sy;
  return this;
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.define("goog.userAgent.ASSUME_IE", false);
goog.define("goog.userAgent.ASSUME_GECKO", false);
goog.define("goog.userAgent.ASSUME_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_MOBILE_WEBKIT", false);
goog.define("goog.userAgent.ASSUME_OPERA", false);
goog.define("goog.userAgent.ASSUME_ANY_VERSION", false);
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || (goog.userAgent.ASSUME_GECKO || (goog.userAgent.ASSUME_MOBILE_WEBKIT || (goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA)));
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null;
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"];
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = goog.string.startsWith(ua, "Opera");
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && (goog.string.contains(ua, "MSIE") || goog.string.contains(ua, "Trident"));
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && goog.string.contains(ua, "WebKit");
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && goog.string.contains(ua, "Mobile");
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && (!goog.userAgent.detectedWebkit_ && (!goog.userAgent.detectedIe_ && navigator.product == "Gecko"));
  }
};
if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || "";
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.define("goog.userAgent.ASSUME_MAC", false);
goog.define("goog.userAgent.ASSUME_WINDOWS", false);
goog.define("goog.userAgent.ASSUME_LINUX", false);
goog.define("goog.userAgent.ASSUME_X11", false);
goog.define("goog.userAgent.ASSUME_ANDROID", false);
goog.define("goog.userAgent.ASSUME_IPHONE", false);
goog.define("goog.userAgent.ASSUME_IPAD", false);
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || (goog.userAgent.ASSUME_WINDOWS || (goog.userAgent.ASSUME_LINUX || (goog.userAgent.ASSUME_X11 || (goog.userAgent.ASSUME_ANDROID || (goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD)))));
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11");
  var ua = goog.userAgent.getUserAgentString();
  goog.userAgent.detectedAndroid_ = !!ua && goog.string.contains(ua, "Android");
  goog.userAgent.detectedIPhone_ = !!ua && goog.string.contains(ua, "iPhone");
  goog.userAgent.detectedIPad_ = !!ua && goog.string.contains(ua, "iPad");
};
if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if (goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else {
      if (goog.userAgent.IE) {
        re = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/;
      } else {
        if (goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/;
        }
      }
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : "";
    }
  }
  if (goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined;
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};
goog.userAgent.isVersionOrHigherCache_ = {};
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || (goog.userAgent.isVersionOrHigherCache_[version] || (goog.userAgent.isVersionOrHigherCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0));
};
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode;
};
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
goog.userAgent.DOCUMENT_MODE = function() {
  var doc = goog.global["document"];
  if (!doc || !goog.userAgent.IE) {
    return undefined;
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5);
}();
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height;
};
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};
if (goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return "(" + this.width + " x " + this.height + ")";
  };
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2;
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area();
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this;
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s);
};
goog.provide("goog.math.Rect");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h;
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height);
};
goog.math.Rect.prototype.toBox = function() {
  var right = this.left + this.width;
  var bottom = this.top + this.height;
  return new goog.math.Box(this.top, right, bottom, this.left);
};
goog.math.Rect.createFromBox = function(box) {
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top);
};
if (goog.DEBUG) {
  goog.math.Rect.prototype.toString = function() {
    return "(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)";
  };
}
goog.math.Rect.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.left == b.left && (a.width == b.width && (a.top == b.top && a.height == b.height));
};
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);
  if (x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);
    if (y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;
      return true;
    }
  }
  return false;
};
goog.math.Rect.intersection = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);
  if (x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);
    if (y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0);
    }
  }
  return null;
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && (b.left <= a.left + a.width && (a.top <= b.top + b.height && b.top <= a.top + a.height));
};
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect);
};
goog.math.Rect.difference = function(a, b) {
  var intersection = goog.math.Rect.intersection(a, b);
  if (!intersection || (!intersection.height || !intersection.width)) {
    return[a.clone()];
  }
  var result = [];
  var top = a.top;
  var height = a.height;
  var ar = a.left + a.width;
  var ab = a.top + a.height;
  var br = b.left + b.width;
  var bb = b.top + b.height;
  if (b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
    height -= b.top - a.top;
  }
  if (bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top;
  }
  if (b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height));
  }
  if (br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height));
  }
  return result;
};
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect);
};
goog.math.Rect.prototype.boundingRect = function(rect) {
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);
  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);
  this.width = right - this.left;
  this.height = bottom - this.top;
};
goog.math.Rect.boundingRect = function(a, b) {
  if (!a || !b) {
    return null;
  }
  var clone = a.clone();
  clone.boundingRect(b);
  return clone;
};
goog.math.Rect.prototype.contains = function(another) {
  if (another instanceof goog.math.Rect) {
    return this.left <= another.left && (this.left + this.width >= another.left + another.width && (this.top <= another.top && this.top + this.height >= another.top + another.height));
  } else {
    return another.x >= this.left && (another.x <= this.left + this.width && (another.y >= this.top && another.y <= this.top + this.height));
  }
};
goog.math.Rect.prototype.squaredDistance = function(point) {
  var dx = point.x < this.left ? this.left - point.x : Math.max(point.x - (this.left + this.width), 0);
  var dy = point.y < this.top ? this.top - point.y : Math.max(point.y - (this.top + this.height), 0);
  return dx * dx + dy * dy;
};
goog.math.Rect.prototype.distance = function(point) {
  return Math.sqrt(this.squaredDistance(point));
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height);
};
goog.math.Rect.prototype.getTopLeft = function() {
  return new goog.math.Coordinate(this.left, this.top);
};
goog.math.Rect.prototype.getCenter = function() {
  return new goog.math.Coordinate(this.left + this.width / 2, this.top + this.height / 2);
};
goog.math.Rect.prototype.getBottomRight = function() {
  return new goog.math.Coordinate(this.left + this.width, this.top + this.height);
};
goog.math.Rect.prototype.ceil = function() {
  this.left = Math.ceil(this.left);
  this.top = Math.ceil(this.top);
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};
goog.math.Rect.prototype.floor = function() {
  this.left = Math.floor(this.left);
  this.top = Math.floor(this.top);
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};
goog.math.Rect.prototype.round = function() {
  this.left = Math.round(this.left);
  this.top = Math.round(this.top);
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};
goog.math.Rect.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.top += tx.y;
  } else {
    this.left += tx;
    if (goog.isNumber(opt_ty)) {
      this.top += opt_ty;
    }
  }
  return this;
};
goog.math.Rect.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.width *= sx;
  this.top *= sy;
  this.height *= sy;
  return this;
};
goog.provide("goog.dom.vendor");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.vendor.getVendorJsPrefix = function() {
  if (goog.userAgent.WEBKIT) {
    return "Webkit";
  } else {
    if (goog.userAgent.GECKO) {
      return "Moz";
    } else {
      if (goog.userAgent.IE) {
        return "ms";
      } else {
        if (goog.userAgent.OPERA) {
          return "O";
        }
      }
    }
  }
  return null;
};
goog.dom.vendor.getVendorPrefix = function() {
  if (goog.userAgent.WEBKIT) {
    return "-webkit";
  } else {
    if (goog.userAgent.GECKO) {
      return "-moz";
    } else {
      if (goog.userAgent.IE) {
        return "-ms";
      } else {
        if (goog.userAgent.OPERA) {
          return "-o";
        }
      }
    }
  }
  return null;
};
goog.dom.vendor.getPrefixedPropertyName = function(propertyName, opt_object) {
  if (opt_object && propertyName in opt_object) {
    return propertyName;
  }
  var prefix = goog.dom.vendor.getVendorJsPrefix();
  if (prefix) {
    prefix = prefix.toLowerCase();
    var prefixedPropertyName = prefix + goog.string.toTitleCase(propertyName);
    return!goog.isDef(opt_object) || prefixedPropertyName in opt_object ? prefixedPropertyName : null;
  }
  return null;
};
goog.dom.vendor.getPrefixedEventType = function(eventType) {
  var prefix = goog.dom.vendor.getVendorJsPrefix() || "";
  return(prefix + eventType).toLowerCase();
};
goog.provide("goog.dom.classes");
goog.require("goog.array");
goog.dom.classes.set = function(element, className) {
  element.className = className;
};
goog.dom.classes.get = function(element) {
  var className = element.className;
  return goog.isString(className) && className.match(/\S+/g) || [];
};
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var expectedCount = classes.length + args.length;
  goog.dom.classes.add_(classes, args);
  goog.dom.classes.set(element, classes.join(" "));
  return classes.length == expectedCount;
};
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var newClasses = goog.dom.classes.getDifference_(classes, args);
  goog.dom.classes.set(element, newClasses.join(" "));
  return newClasses.length == classes.length - args.length;
};
goog.dom.classes.add_ = function(classes, args) {
  for (var i = 0;i < args.length;i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
    }
  }
};
goog.dom.classes.getDifference_ = function(arr1, arr2) {
  return goog.array.filter(arr1, function(item) {
    return!goog.array.contains(arr2, item);
  });
};
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);
  var removed = false;
  for (var i = 0;i < classes.length;i++) {
    if (classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true;
    }
  }
  if (removed) {
    classes.push(toClass);
    goog.dom.classes.set(element, classes.join(" "));
  }
  return removed;
};
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if (goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove);
  } else {
    if (goog.isArray(classesToRemove)) {
      classes = goog.dom.classes.getDifference_(classes, classesToRemove);
    }
  }
  if (goog.isString(classesToAdd) && !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd);
  } else {
    if (goog.isArray(classesToAdd)) {
      goog.dom.classes.add_(classes, classesToAdd);
    }
  }
  goog.dom.classes.set(element, classes.join(" "));
};
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className);
};
goog.dom.classes.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classes.add(element, className);
  } else {
    goog.dom.classes.remove(element, className);
  }
};
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add;
};
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", ARTICLE:"ARTICLE", ASIDE:"ASIDE", AUDIO:"AUDIO", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDI:"BDI", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", COMMAND:"COMMAND", DATA:"DATA", DATALIST:"DATALIST", DD:"DD", DEL:"DEL", DETAILS:"DETAILS", DFN:"DFN", 
DIALOG:"DIALOG", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", EMBED:"EMBED", FIELDSET:"FIELDSET", FIGCAPTION:"FIGCAPTION", FIGURE:"FIGURE", FONT:"FONT", FOOTER:"FOOTER", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HEADER:"HEADER", HGROUP:"HGROUP", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", KEYGEN:"KEYGEN", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", 
MAP:"MAP", MARK:"MARK", MATH:"MATH", MENU:"MENU", META:"META", METER:"METER", NAV:"NAV", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", OUTPUT:"OUTPUT", P:"P", PARAM:"PARAM", PRE:"PRE", PROGRESS:"PROGRESS", Q:"Q", RP:"RP", RT:"RT", RUBY:"RUBY", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SECTION:"SECTION", SELECT:"SELECT", SMALL:"SMALL", SOURCE:"SOURCE", SPAN:"SPAN", STRIKE:"STRIKE", STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUMMARY:"SUMMARY", 
SUP:"SUP", SVG:"SVG", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TIME:"TIME", TITLE:"TITLE", TR:"TR", TRACK:"TRACK", TT:"TT", U:"U", UL:"UL", VAR:"VAR", VIDEO:"VIDEO", WBR:"WBR"};
goog.provide("goog.functions");
goog.functions.constant = function(retValue) {
  return function() {
    return retValue;
  };
};
goog.functions.FALSE = goog.functions.constant(false);
goog.functions.TRUE = goog.functions.constant(true);
goog.functions.NULL = goog.functions.constant(null);
goog.functions.identity = function(opt_returnValue, var_args) {
  return opt_returnValue;
};
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  };
};
goog.functions.fail = function(err) {
  return function() {
    throw err;
  };
};
goog.functions.lock = function(f, opt_numArgs) {
  opt_numArgs = opt_numArgs || 0;
  return function() {
    return f.apply(this, Array.prototype.slice.call(arguments, 0, opt_numArgs));
  };
};
goog.functions.nth = function(n) {
  return function() {
    return arguments[n];
  };
};
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue));
};
goog.functions.compose = function(fn, var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if (length) {
      result = functions[length - 1].apply(this, arguments);
    }
    for (var i = length - 2;i >= 0;i--) {
      result = functions[i].call(this, result);
    }
    return result;
  };
};
goog.functions.sequence = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    for (var i = 0;i < length;i++) {
      result = functions[i].apply(this, arguments);
    }
    return result;
  };
};
goog.functions.and = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for (var i = 0;i < length;i++) {
      if (!functions[i].apply(this, arguments)) {
        return false;
      }
    }
    return true;
  };
};
goog.functions.or = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for (var i = 0;i < length;i++) {
      if (functions[i].apply(this, arguments)) {
        return true;
      }
    }
    return false;
  };
};
goog.functions.not = function(f) {
  return function() {
    return!f.apply(this, arguments);
  };
};
goog.functions.create = function(constructor, var_args) {
  var temp = function() {
  };
  temp.prototype = constructor.prototype;
  var obj = new temp;
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj;
};
goog.define("goog.functions.CACHE_RETURN_VALUE", true);
goog.functions.cacheReturnValue = function(fn) {
  var called = false;
  var value;
  return function() {
    if (!goog.functions.CACHE_RETURN_VALUE) {
      return fn();
    }
    if (!called) {
      value = fn();
      called = true;
    }
    return value;
  };
};
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9) || goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9.1")), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), CAN_USE_PARENT_ELEMENT_PROPERTY:goog.userAgent.IE || (goog.userAgent.OPERA || goog.userAgent.WEBKIT), 
INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
goog.provide("goog.dom");
goog.provide("goog.dom.Appendable");
goog.provide("goog.dom.DomHelper");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classes");
goog.require("goog.functions");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.define("goog.dom.ASSUME_QUIRKS_MODE", false);
goog.define("goog.dom.ASSUME_STANDARDS_MODE", false);
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper);
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document;
};
goog.dom.getElement = function(element) {
  return goog.dom.getElementHelper_(document, element);
};
goog.dom.getElementHelper_ = function(doc, element) {
  return goog.isString(element) ? doc.getElementById(element) : element;
};
goog.dom.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(document, id);
};
goog.dom.getRequiredElementHelper_ = function(doc, id) {
  goog.asserts.assertString(id);
  var element = goog.dom.getElementHelper_(doc, id);
  element = goog.asserts.assertElement(element, "No element found with id: " + id);
  return element;
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el);
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className);
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el);
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if (goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector("." + className);
  } else {
    retVal = goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)[0];
  }
  return retVal || null;
};
goog.dom.getRequiredElementByClass = function(className, opt_root) {
  var retValue = goog.dom.getElementByClass(className, opt_root);
  return goog.asserts.assert(retValue, "No element found with className: " + className);
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return!!(parent.querySelectorAll && parent.querySelector);
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if (goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query);
  }
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if (tagName) {
      var arrayLike = {};
      var len = 0;
      for (var i = 0, el;el = els[i];i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;
      return arrayLike;
    } else {
      return els;
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if (typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == "style") {
      element.style.cssText = val;
    } else {
      if (key == "class") {
        element.className = val;
      } else {
        if (key == "for") {
          element.htmlFor = val;
        } else {
          if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
          } else {
            if (goog.string.startsWith(key, "aria-") || goog.string.startsWith(key, "data-")) {
              element.setAttribute(key, val);
            } else {
              element[key] = val;
            }
          }
        }
      }
    }
  });
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "frameborder":"frameBorder", "height":"height", "maxlength":"maxLength", "role":"role", "rowspan":"rowSpan", "type":"type", "usemap":"useMap", "valign":"vAlign", "width":"width"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window);
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight);
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if (doc) {
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight;
    } else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }
      if (sh > vh) {
        height = sh > oh ? sh : oh;
      } else {
        height = sh < oh ? sh : oh;
      }
    }
  }
  return height;
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || (goog.global || window);
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  if (goog.userAgent.IE && (goog.userAgent.isVersionOrHigher("10") && win.pageYOffset != el.scrollTop)) {
    return new goog.math.Coordinate(el.scrollLeft, el.scrollTop);
  }
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop);
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  if (!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc)) {
    return doc.documentElement;
  }
  return doc.body || doc.documentElement;
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && (attributes && (attributes.name || attributes.type))) {
    var tagNameArr = ["<", tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      delete clone["type"];
      attributes = clone;
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("");
  }
  var element = doc.createElement(tagName);
  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else {
      if (goog.isArray(attributes)) {
        goog.dom.classes.add.apply(null, [element].concat(attributes));
      } else {
        goog.dom.setProperties(element, attributes);
      }
    }
  }
  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }
  return element;
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if (child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child);
    }
  }
  for (var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.toArray(arg) : arg, childHandler);
    } else {
      childHandler(arg);
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name);
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(String(content));
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ["<tr>"];
  for (var i = 0;i < columns;i++) {
    rowHtml.push(fillWithNbsp ? "<td>&nbsp;</td>" : "<td></td>");
  }
  rowHtml.push("</tr>");
  rowHtml = rowHtml.join("");
  var totalHtml = ["<table>"];
  for (i = 0;i < rows;i++) {
    totalHtml.push(rowHtml);
  }
  totalHtml.push("</table>");
  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join("");
  return(elem.removeChild(elem.firstChild));
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement("div");
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    tempDiv.innerHTML = htmlString;
  }
  if (tempDiv.childNodes.length == 1) {
    return(tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = doc.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }
  return doc.compatMode == "CSS1Compat";
};
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  switch(node.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.COMMAND:
    ;
    case goog.dom.TagName.EMBED:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.KEYGEN:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.SOURCE:
    ;
    case goog.dom.TagName.STYLE:
    ;
    case goog.dom.TagName.TRACK:
    ;
    case goog.dom.TagName.WBR:
      return false;
  }
  return true;
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};
goog.dom.removeChildren = function(node) {
  var child;
  while (child = node.firstChild) {
    node.removeChild(child);
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null);
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if (element.removeNode) {
      return(element.removeNode(false));
    } else {
      while (child = element.firstChild) {
        parent.insertBefore(child, element);
      }
      return(goog.dom.removeNode(element));
    }
  }
};
goog.dom.getChildren = function(element) {
  if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children;
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT;
  });
};
goog.dom.getFirstElementChild = function(node) {
  if (node.firstElementChild != undefined) {
    return(node).firstElementChild;
  }
  return goog.dom.getNextElementNode_(node.firstChild, true);
};
goog.dom.getLastElementChild = function(node) {
  if (node.lastElementChild != undefined) {
    return(node).lastElementChild;
  }
  return goog.dom.getNextElementNode_(node.lastChild, false);
};
goog.dom.getNextElementSibling = function(node) {
  if (node.nextElementSibling != undefined) {
    return(node).nextElementSibling;
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};
goog.dom.getPreviousElementSibling = function(node) {
  if (node.previousElementSibling != undefined) {
    return(node).previousElementSibling;
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }
  return(node);
};
goog.dom.getNextNode = function(node) {
  if (!node) {
    return null;
  }
  if (node.firstChild) {
    return node.firstChild;
  }
  while (node && !node.nextSibling) {
    node = node.parentNode;
  }
  return node ? node.nextSibling : null;
};
goog.dom.getPreviousNode = function(node) {
  if (!node) {
    return null;
  }
  if (!node.previousSibling) {
    return node.parentNode;
  }
  node = node.previousSibling;
  while (node && node.lastChild) {
    node = node.lastChild;
  }
  return node;
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj;
};
goog.dom.getParentElement = function(element) {
  if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    var isIe9 = goog.userAgent.IE && (goog.userAgent.isVersionOrHigher("9") && !goog.userAgent.isVersionOrHigher("10"));
    if (!(isIe9 && (goog.global["SVGElement"] && element instanceof goog.global["SVGElement"]))) {
      return element.parentElement;
    }
  }
  var parent = element.parentNode;
  return goog.dom.isElement(parent) ? (parent) : null;
};
goog.dom.contains = function(parent, descendant) {
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }
  if (typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16);
  }
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if (node1 == node2) {
    return 0;
  }
  if (node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    if (node1.nodeType == goog.dom.NodeType.DOCUMENT) {
      return-1;
    }
    if (node2.nodeType == goog.dom.NodeType.DOCUMENT) {
      return 1;
    }
  }
  if ("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }
      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return-1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }
      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }
      return(isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2);
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    return-1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while (s = s.previousSibling) {
    if (s == node1) {
      return-1;
    }
  }
  return 1;
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return null;
  } else {
    if (count == 1) {
      return arguments[0];
    }
  }
  var paths = [];
  var minLength = Infinity;
  for (i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = null;
  for (i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for (var j = 1;j < count;j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};
goog.dom.getOwnerDocument = function(node) {
  return(node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document);
};
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc;
};
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow || goog.dom.getWindow(goog.dom.getFrameContentDocument(frame));
};
goog.dom.setTextContent = function(node, text) {
  goog.asserts.assert(node != null, "goog.dom.setTextContent expects a non-null value for node");
  if ("textContent" in node) {
    node.textContent = text;
  } else {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      node.data = text;
    } else {
      if (node.firstChild && node.firstChild.nodeType == goog.dom.NodeType.TEXT) {
        while (node.lastChild != node.firstChild) {
          node.removeChild(node.lastChild);
        }
        node.firstChild.data = text;
      } else {
        goog.dom.removeChildren(node);
        var doc = goog.dom.getOwnerDocument(node);
        node.appendChild(doc.createTextNode(String(text)));
      }
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  if ("outerHTML" in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement("div");
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    var child = root.firstChild;
    while (child) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return true;
        }
      }
      if (goog.dom.findNodes_(child, p, rv, findOne)) {
        return true;
      }
      child = child.nextSibling;
    }
  }
  return false;
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  return goog.dom.hasSpecifiedTabIndex_(element) && goog.dom.isTabIndexFocusable_(element);
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    element.tabIndex = -1;
    element.removeAttribute("tabIndex");
  }
};
goog.dom.isFocusable = function(element) {
  var focusable;
  if (goog.dom.nativelySupportsFocus_(element)) {
    focusable = !element.disabled && (!goog.dom.hasSpecifiedTabIndex_(element) || goog.dom.isTabIndexFocusable_(element));
  } else {
    focusable = goog.dom.isFocusableTabIndex(element);
  }
  return focusable && goog.userAgent.IE ? goog.dom.hasNonZeroBoundingRect_(element) : focusable;
};
goog.dom.hasSpecifiedTabIndex_ = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  return goog.isDefAndNotNull(attrNode) && attrNode.specified;
};
goog.dom.isTabIndexFocusable_ = function(element) {
  var index = element.tabIndex;
  return goog.isNumber(index) && (index >= 0 && index < 32768);
};
goog.dom.nativelySupportsFocus_ = function(element) {
  return element.tagName == goog.dom.TagName.A || (element.tagName == goog.dom.TagName.INPUT || (element.tagName == goog.dom.TagName.TEXTAREA || (element.tagName == goog.dom.TagName.SELECT || element.tagName == goog.dom.TagName.BUTTON)));
};
goog.dom.hasNonZeroBoundingRect_ = function(element) {
  var rect = goog.isFunction(element["getBoundingClientRect"]) ? element.getBoundingClientRect() : {"height":element.offsetHeight, "width":element.offsetWidth};
  return goog.isDefAndNotNull(rect) && (rect.height > 0 && rect.width > 0);
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("");
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, " ");
  }
  if (textContent != " ") {
    textContent = textContent.replace(/^\s*/, "");
  }
  return textContent;
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("");
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  } else {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      if (normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""));
      } else {
        buf.push(node.nodeValue);
      }
    } else {
      if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
      } else {
        var child = node.firstChild;
        while (child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling;
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while (cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length;
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur = null;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    } else {
      if (cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length;
      } else {
        if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
        } else {
          for (var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i]);
          }
        }
      }
    }
  }
  if (goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur;
  }
  return cur;
};
goog.dom.isNodeList = function(val) {
  if (val && typeof val.length == "number") {
    if (goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string";
    } else {
      if (goog.isFunction(val)) {
        return typeof val.item == "function";
      }
    }
  }
  return false;
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  if (!opt_tag && !opt_class) {
    return null;
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return(goog.dom.getAncestor(element, function(node) {
    return(!tagName || node.nodeName == tagName) && (!opt_class || goog.dom.classes.has(node, opt_class));
  }, true));
};
goog.dom.getAncestorByClass = function(element, className) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className);
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  return null;
};
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement;
  } catch (e) {
  }
  return null;
};
goog.dom.devicePixelRatio_;
goog.dom.getPixelRatio = goog.functions.cacheReturnValue(function() {
  var win = goog.dom.getWindow();
  var isFirefoxMobile = goog.userAgent.GECKO && goog.userAgent.MOBILE;
  if (goog.isDef(win.devicePixelRatio) && !isFirefoxMobile) {
    return win.devicePixelRatio;
  } else {
    if (win.matchMedia) {
      return goog.dom.matchesPixelRatio_(0.75) || (goog.dom.matchesPixelRatio_(1.5) || (goog.dom.matchesPixelRatio_(2) || (goog.dom.matchesPixelRatio_(3) || 1)));
    }
  }
  return 1;
});
goog.dom.matchesPixelRatio_ = function(pixelRatio) {
  var win = goog.dom.getWindow();
  var query = "(-webkit-min-device-pixel-ratio: " + pixelRatio + ")," + "(min--moz-device-pixel-ratio: " + pixelRatio + ")," + "(min-resolution: " + pixelRatio + "dppx)";
  return win.matchMedia(query).matches ? pixelRatio : 0;
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || (goog.global.document || document);
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  return goog.dom.getElementHelper_(this.document_, element);
};
goog.dom.DomHelper.prototype.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(this.document_, id);
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el);
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};
goog.dom.DomHelper.prototype.getRequiredElementByClass = function(className, opt_root) {
  var root = opt_root || this.document_;
  return goog.dom.getRequiredElementByClass(className, root);
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(String(content));
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp);
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};
goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
  return goog.dom.getActiveElement(opt_doc || this.document_);
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;
goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;
goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;
goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;
goog.dom.DomHelper.prototype.setFocusableTabIndex = goog.dom.setFocusableTabIndex;
goog.dom.DomHelper.prototype.isFocusable = goog.dom.isFocusable;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;
goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
goog.provide("goog.style");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.vendor");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.define("goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS", false);
goog.style.setStyle = function(element, style, opt_value) {
  if (goog.isString(style)) {
    goog.style.setStyle_(element, opt_value, style);
  } else {
    goog.object.forEach(style, goog.partial(goog.style.setStyle_, element));
  }
};
goog.style.setStyle_ = function(element, value, style) {
  var propertyName = goog.style.getVendorJsStyleName_(element, style);
  if (propertyName) {
    element.style[propertyName] = value;
  }
};
goog.style.getVendorJsStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if (element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(style);
    if (element.style[prefixedStyle] !== undefined) {
      return prefixedStyle;
    }
  }
  return camelStyle;
};
goog.style.getVendorStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if (element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(style);
    if (element.style[prefixedStyle] !== undefined) {
      return goog.dom.vendor.getVendorPrefix() + "-" + style;
    }
  }
  return style;
};
goog.style.getStyle = function(element, property) {
  var styleValue = element.style[goog.string.toCamelCase(property)];
  if (typeof styleValue !== "undefined") {
    return styleValue;
  }
  return element.style[goog.style.getVendorJsStyleName_(element, property)] || "";
};
goog.style.getComputedStyle = function(element, property) {
  var doc = goog.dom.getOwnerDocument(element);
  if (doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, null);
    if (styles) {
      return styles[property] || (styles.getPropertyValue(property) || "");
    }
  }
  return "";
};
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null;
};
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) || (goog.style.getCascadedStyle(element, style) || element.style && element.style[style]);
};
goog.style.getComputedBoxSizing = function(element) {
  return goog.style.getStyle_(element, "boxSizing") || (goog.style.getStyle_(element, "MozBoxSizing") || (goog.style.getStyle_(element, "WebkitBoxSizing") || null));
};
goog.style.getComputedPosition = function(element) {
  return goog.style.getStyle_(element, "position");
};
goog.style.getBackgroundColor = function(element) {
  return goog.style.getStyle_(element, "backgroundColor");
};
goog.style.getComputedOverflowX = function(element) {
  return goog.style.getStyle_(element, "overflowX");
};
goog.style.getComputedOverflowY = function(element) {
  return goog.style.getStyle_(element, "overflowY");
};
goog.style.getComputedZIndex = function(element) {
  return goog.style.getStyle_(element, "zIndex");
};
goog.style.getComputedTextAlign = function(element) {
  return goog.style.getStyle_(element, "textAlign");
};
goog.style.getComputedCursor = function(element) {
  return goog.style.getStyle_(element, "cursor");
};
goog.style.setPosition = function(el, arg1, opt_arg2) {
  var x, y;
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO && ((goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersionOrHigher("1.9"));
  if (arg1 instanceof goog.math.Coordinate) {
    x = arg1.x;
    y = arg1.y;
  } else {
    x = arg1;
    y = opt_arg2;
  }
  el.style.left = goog.style.getPixelStyleValue_((x), buggyGeckoSubPixelPos);
  el.style.top = goog.style.getPixelStyleValue_((y), buggyGeckoSubPixelPos);
};
goog.style.getPosition = function(element) {
  return new goog.math.Coordinate(element.offsetLeft, element.offsetTop);
};
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if (opt_node) {
    doc = goog.dom.getOwnerDocument(opt_node);
  } else {
    doc = goog.dom.getDocument();
  }
  if (goog.userAgent.IE && (!goog.userAgent.isDocumentModeOrHigher(9) && !goog.dom.getDomHelper(doc).isCss1CompatMode())) {
    return doc.body;
  }
  return doc.documentElement;
};
goog.style.getViewportPageOffset = function(doc) {
  var body = doc.body;
  var documentElement = doc.documentElement;
  var scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  var scrollTop = body.scrollTop || documentElement.scrollTop;
  return new goog.math.Coordinate(scrollLeft, scrollTop);
};
goog.style.getBoundingClientRect_ = function(el) {
  var rect;
  try {
    rect = el.getBoundingClientRect();
  } catch (e) {
    return{"left":0, "top":0, "right":0, "bottom":0};
  }
  if (goog.userAgent.IE && el.ownerDocument.body) {
    var doc = el.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop;
  }
  return(rect);
};
goog.style.getOffsetParent = function(element) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(8)) {
    return element.offsetParent;
  }
  var doc = goog.dom.getOwnerDocument(element);
  var positionStyle = goog.style.getStyle_(element, "position");
  var skipStatic = positionStyle == "fixed" || positionStyle == "absolute";
  for (var parent = element.parentNode;parent && parent != doc;parent = parent.parentNode) {
    positionStyle = goog.style.getStyle_((parent), "position");
    skipStatic = skipStatic && (positionStyle == "static" && (parent != doc.documentElement && parent != doc.body));
    if (!skipStatic && (parent.scrollWidth > parent.clientWidth || (parent.scrollHeight > parent.clientHeight || (positionStyle == "fixed" || (positionStyle == "absolute" || positionStyle == "relative"))))) {
      return(parent);
    }
  }
  return null;
};
goog.style.getVisibleRectForElement = function(element) {
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0);
  var dom = goog.dom.getDomHelper(element);
  var body = dom.getDocument().body;
  var documentElement = dom.getDocument().documentElement;
  var scrollEl = dom.getDocumentScrollElement();
  for (var el = element;el = goog.style.getOffsetParent(el);) {
    if ((!goog.userAgent.IE || el.clientWidth != 0) && ((!goog.userAgent.WEBKIT || (el.clientHeight != 0 || el != body)) && (el != body && (el != documentElement && goog.style.getStyle_(el, "overflow") != "visible")))) {
      var pos = goog.style.getPageOffset(el);
      var client = goog.style.getClientLeftTop(el);
      pos.x += client.x;
      pos.y += client.y;
      visibleRect.top = Math.max(visibleRect.top, pos.y);
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.x);
    }
  }
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop;
  visibleRect.left = Math.max(visibleRect.left, scrollX);
  visibleRect.top = Math.max(visibleRect.top, scrollY);
  var winSize = dom.getViewportSize();
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && (visibleRect.left >= 0 && (visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left)) ? visibleRect : null;
};
goog.style.getContainerOffsetToScrollInto = function(element, container, opt_center) {
  var elementPos = goog.style.getPageOffset(element);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);
  var relX = elementPos.x - containerPos.x - containerBorder.left;
  var relY = elementPos.y - containerPos.y - containerBorder.top;
  var spaceX = container.clientWidth - element.offsetWidth;
  var spaceY = container.clientHeight - element.offsetHeight;
  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;
  if (opt_center) {
    scrollLeft += relX - spaceX / 2;
    scrollTop += relY - spaceY / 2;
  } else {
    scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    scrollTop += Math.min(relY, Math.max(relY - spaceY, 0));
  }
  return new goog.math.Coordinate(scrollLeft, scrollTop);
};
goog.style.scrollIntoContainerView = function(element, container, opt_center) {
  var offset = goog.style.getContainerOffsetToScrollInto(element, container, opt_center);
  container.scrollLeft = offset.x;
  container.scrollTop = offset.y;
};
goog.style.getClientLeftTop = function(el) {
  if (goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher("1.9")) {
    var left = parseFloat(goog.style.getComputedStyle(el, "borderLeftWidth"));
    if (goog.style.isRightToLeft(el)) {
      var scrollbarWidth = el.offsetWidth - el.clientWidth - left - parseFloat(goog.style.getComputedStyle(el, "borderRightWidth"));
      left += scrollbarWidth;
    }
    return new goog.math.Coordinate(left, parseFloat(goog.style.getComputedStyle(el, "borderTopWidth")));
  }
  return new goog.math.Coordinate(el.clientLeft, el.clientTop);
};
goog.style.getPageOffset = function(el) {
  var box, doc = goog.dom.getOwnerDocument(el);
  var positionStyle = goog.style.getStyle_(el, "position");
  goog.asserts.assertObject(el, "Parameter is required");
  var BUGGY_GECKO_BOX_OBJECT = !goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS && (goog.userAgent.GECKO && (doc.getBoxObjectFor && (!el.getBoundingClientRect && (positionStyle == "absolute" && ((box = doc.getBoxObjectFor(el)) && (box.screenX < 0 || box.screenY < 0))))));
  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if (el == viewportElement) {
    return pos;
  }
  if (goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS || el.getBoundingClientRect) {
    box = goog.style.getBoundingClientRect_(el);
    var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll();
    pos.x = box.left + scrollCoord.x;
    pos.y = box.top + scrollCoord.y;
  } else {
    if (doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) {
      box = doc.getBoxObjectFor(el);
      var vpBox = doc.getBoxObjectFor(viewportElement);
      pos.x = box.screenX - vpBox.screenX;
      pos.y = box.screenY - vpBox.screenY;
    } else {
      var parent = el;
      do {
        pos.x += parent.offsetLeft;
        pos.y += parent.offsetTop;
        if (parent != el) {
          pos.x += parent.clientLeft || 0;
          pos.y += parent.clientTop || 0;
        }
        if (goog.userAgent.WEBKIT && goog.style.getComputedPosition(parent) == "fixed") {
          pos.x += doc.body.scrollLeft;
          pos.y += doc.body.scrollTop;
          break;
        }
        parent = parent.offsetParent;
      } while (parent && parent != el);
      if (goog.userAgent.OPERA || goog.userAgent.WEBKIT && positionStyle == "absolute") {
        pos.y -= doc.body.offsetTop;
      }
      for (parent = el;(parent = goog.style.getOffsetParent(parent)) && (parent != doc.body && parent != viewportElement);) {
        pos.x -= parent.scrollLeft;
        if (!goog.userAgent.OPERA || parent.tagName != "TR") {
          pos.y -= parent.scrollTop;
        }
      }
    }
  }
  return pos;
};
goog.style.getPageOffsetLeft = function(el) {
  return goog.style.getPageOffset(el).x;
};
goog.style.getPageOffsetTop = function(el) {
  return goog.style.getPageOffset(el).y;
};
goog.style.getFramedPageOffset = function(el, relativeWin) {
  var position = new goog.math.Coordinate(0, 0);
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el));
  var currentEl = el;
  do {
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl) : goog.style.getClientPositionForElement_(goog.asserts.assert(currentEl));
    position.x += offset.x;
    position.y += offset.y;
  } while (currentWin && (currentWin != relativeWin && ((currentEl = currentWin.frameElement) && (currentWin = currentWin.parent))));
  return position;
};
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) {
  if (origBase.getDocument() != newBase.getDocument()) {
    var body = origBase.getDocument().body;
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow());
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body));
    if (goog.userAgent.IE && !origBase.isCss1CompatMode()) {
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll());
    }
    rect.left += pos.x;
    rect.top += pos.y;
  }
};
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y);
};
goog.style.getClientPositionForElement_ = function(el) {
  var pos;
  if (goog.style.GET_BOUNDING_CLIENT_RECT_ALWAYS_EXISTS || el.getBoundingClientRect) {
    var box = goog.style.getBoundingClientRect_(el);
    pos = new goog.math.Coordinate(box.left, box.top);
  } else {
    var scrollCoord = goog.dom.getDomHelper(el).getDocumentScroll();
    var pageCoord = goog.style.getPageOffset(el);
    pos = new goog.math.Coordinate(pageCoord.x - scrollCoord.x, pageCoord.y - scrollCoord.y);
  }
  if (goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher(12)) {
    return goog.math.Coordinate.sum(pos, goog.style.getCssTranslation(el));
  } else {
    return pos;
  }
};
goog.style.getClientPosition = function(el) {
  goog.asserts.assert(el);
  if (el.nodeType == goog.dom.NodeType.ELEMENT) {
    return goog.style.getClientPositionForElement_((el));
  } else {
    var isAbstractedEvent = goog.isFunction(el.getBrowserEvent);
    var be = (el);
    var targetEvent = el;
    if (el.targetTouches) {
      targetEvent = el.targetTouches[0];
    } else {
      if (isAbstractedEvent && be.getBrowserEvent().targetTouches) {
        targetEvent = be.getBrowserEvent().targetTouches[0];
      }
    }
    return new goog.math.Coordinate(targetEvent.clientX, targetEvent.clientY);
  }
};
goog.style.setPageOffset = function(el, x, opt_y) {
  var cur = goog.style.getPageOffset(el);
  if (x instanceof goog.math.Coordinate) {
    opt_y = x.y;
    x = x.x;
  }
  var dx = x - cur.x;
  var dy = opt_y - cur.y;
  goog.style.setPosition(el, el.offsetLeft + dx, el.offsetTop + dy);
};
goog.style.setSize = function(element, w, opt_h) {
  var h;
  if (w instanceof goog.math.Size) {
    h = w.height;
    w = w.width;
  } else {
    if (opt_h == undefined) {
      throw Error("missing height argument");
    }
    h = opt_h;
  }
  goog.style.setWidth(element, (w));
  goog.style.setHeight(element, (h));
};
goog.style.getPixelStyleValue_ = function(value, round) {
  if (typeof value == "number") {
    value = (round ? Math.round(value) : value) + "px";
  }
  return value;
};
goog.style.setHeight = function(element, height) {
  element.style.height = goog.style.getPixelStyleValue_(height, true);
};
goog.style.setWidth = function(element, width) {
  element.style.width = goog.style.getPixelStyleValue_(width, true);
};
goog.style.getSize = function(element) {
  return goog.style.evaluateWithTemporaryDisplay_(goog.style.getSizeWithDisplay_, (element));
};
goog.style.evaluateWithTemporaryDisplay_ = function(fn, element) {
  if (goog.style.getStyle_(element, "display") != "none") {
    return fn(element);
  }
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;
  style.visibility = "hidden";
  style.position = "absolute";
  style.display = "inline";
  var retVal = fn(element);
  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;
  return retVal;
};
goog.style.getSizeWithDisplay_ = function(element) {
  var offsetWidth = element.offsetWidth;
  var offsetHeight = element.offsetHeight;
  var webkitOffsetsZero = goog.userAgent.WEBKIT && (!offsetWidth && !offsetHeight);
  if ((!goog.isDef(offsetWidth) || webkitOffsetsZero) && element.getBoundingClientRect) {
    var clientRect = goog.style.getBoundingClientRect_(element);
    return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top);
  }
  return new goog.math.Size(offsetWidth, offsetHeight);
};
goog.style.getTransformedSize = function(element) {
  if (!element.getBoundingClientRect) {
    return null;
  }
  var clientRect = goog.style.evaluateWithTemporaryDisplay_(goog.style.getBoundingClientRect_, element);
  return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top);
};
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height);
};
goog.style.toCamelCase = function(selector) {
  return goog.string.toCamelCase(String(selector));
};
goog.style.toSelectorCase = function(selector) {
  return goog.string.toSelectorCase(selector);
};
goog.style.getOpacity = function(el) {
  var style = el.style;
  var result = "";
  if ("opacity" in style) {
    result = style.opacity;
  } else {
    if ("MozOpacity" in style) {
      result = style.MozOpacity;
    } else {
      if ("filter" in style) {
        var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/);
        if (match) {
          result = String(match[1] / 100);
        }
      }
    }
  }
  return result == "" ? result : Number(result);
};
goog.style.setOpacity = function(el, alpha) {
  var style = el.style;
  if ("opacity" in style) {
    style.opacity = alpha;
  } else {
    if ("MozOpacity" in style) {
      style.MozOpacity = alpha;
    } else {
      if ("filter" in style) {
        if (alpha === "") {
          style.filter = "";
        } else {
          style.filter = "alpha(opacity=" + alpha * 100 + ")";
        }
      }
    }
  }
};
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + 'src="' + src + '", sizingMethod="crop")';
  } else {
    style.backgroundImage = "url(" + src + ")";
    style.backgroundPosition = "top left";
    style.backgroundRepeat = "no-repeat";
  }
};
goog.style.clearTransparentBackgroundImage = function(el) {
  var style = el.style;
  if ("filter" in style) {
    style.filter = "";
  } else {
    style.backgroundImage = "none";
  }
};
goog.style.showElement = function(el, display) {
  goog.style.setElementShown(el, display);
};
goog.style.setElementShown = function(el, isShown) {
  el.style.display = isShown ? "" : "none";
};
goog.style.isElementShown = function(el) {
  return el.style.display != "none";
};
goog.style.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;
  var doc = dh.getDocument();
  if (goog.userAgent.IE && doc.createStyleSheet) {
    styleSheet = doc.createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString);
  } else {
    var head = dh.getElementsByTagNameAndClass("head")[0];
    if (!head) {
      var body = dh.getElementsByTagNameAndClass("body")[0];
      head = dh.createDom("head");
      body.parentNode.insertBefore(head, body);
    }
    styleSheet = dh.createDom("style");
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet);
  }
  return styleSheet;
};
goog.style.uninstallStyles = function(styleSheet) {
  var node = styleSheet.ownerNode || (styleSheet.owningElement || (styleSheet));
  goog.dom.removeNode(node);
};
goog.style.setStyles = function(element, stylesString) {
  if (goog.userAgent.IE && goog.isDef(element.cssText)) {
    element.cssText = stylesString;
  } else {
    element.innerHTML = stylesString;
  }
};
goog.style.setPreWrap = function(el) {
  var style = el.style;
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.whiteSpace = "pre";
    style.wordWrap = "break-word";
  } else {
    if (goog.userAgent.GECKO) {
      style.whiteSpace = "-moz-pre-wrap";
    } else {
      style.whiteSpace = "pre-wrap";
    }
  }
};
goog.style.setInlineBlock = function(el) {
  var style = el.style;
  style.position = "relative";
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("8")) {
    style.zoom = "1";
    style.display = "inline";
  } else {
    if (goog.userAgent.GECKO) {
      style.display = goog.userAgent.isVersionOrHigher("1.9a") ? "inline-block" : "-moz-inline-box";
    } else {
      style.display = "inline-block";
    }
  }
};
goog.style.isRightToLeft = function(el) {
  return "rtl" == goog.style.getStyle_(el, "direction");
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(el) {
  if (goog.style.unselectableStyle_) {
    return el.style[goog.style.unselectableStyle_].toLowerCase() == "none";
  } else {
    if (goog.userAgent.IE || goog.userAgent.OPERA) {
      return el.getAttribute("unselectable") == "on";
    }
  }
  return false;
};
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) {
  var descendants = !opt_noRecurse ? el.getElementsByTagName("*") : null;
  var name = goog.style.unselectableStyle_;
  if (name) {
    var value = unselectable ? "none" : "";
    el.style[name] = value;
    if (descendants) {
      for (var i = 0, descendant;descendant = descendants[i];i++) {
        descendant.style[name] = value;
      }
    }
  } else {
    if (goog.userAgent.IE || goog.userAgent.OPERA) {
      var value = unselectable ? "on" : "";
      el.setAttribute("unselectable", value);
      if (descendants) {
        for (var i = 0, descendant;descendant = descendants[i];i++) {
          descendant.setAttribute("unselectable", value);
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(element) {
  return new goog.math.Size(element.offsetWidth, element.offsetHeight);
};
goog.style.setBorderBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if (goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersionOrHigher("8"))) {
    var style = element.style;
    if (isCss1CompatMode) {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right;
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom;
    } else {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height;
    }
  } else {
    goog.style.setBoxSizingSize_(element, size, "border-box");
  }
};
goog.style.getContentBoxSize = function(element) {
  var doc = goog.dom.getOwnerDocument(element);
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle;
  if (ieCurrentStyle && (goog.dom.getDomHelper(doc).isCss1CompatMode() && (ieCurrentStyle.width != "auto" && (ieCurrentStyle.height != "auto" && !ieCurrentStyle.boxSizing)))) {
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, "width", "pixelWidth");
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, "height", "pixelHeight");
    return new goog.math.Size(width, height);
  } else {
    var borderBoxSize = goog.style.getBorderBoxSize(element);
    var paddingBox = goog.style.getPaddingBox(element);
    var borderBox = goog.style.getBorderBox(element);
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom);
  }
};
goog.style.setContentBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if (goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersionOrHigher("8"))) {
    var style = element.style;
    if (isCss1CompatMode) {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height;
    } else {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right;
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom;
    }
  } else {
    goog.style.setBoxSizingSize_(element, size, "content-box");
  }
};
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) {
  var style = element.style;
  if (goog.userAgent.GECKO) {
    style.MozBoxSizing = boxSizing;
  } else {
    if (goog.userAgent.WEBKIT) {
      style.WebkitBoxSizing = boxSizing;
    } else {
      style.boxSizing = boxSizing;
    }
  }
  style.width = Math.max(size.width, 0) + "px";
  style.height = Math.max(size.height, 0) + "px";
};
goog.style.getIePixelValue_ = function(element, value, name, pixelName) {
  if (/^\d+px?$/.test(value)) {
    return parseInt(value, 10);
  } else {
    var oldStyleValue = element.style[name];
    var oldRuntimeValue = element.runtimeStyle[name];
    element.runtimeStyle[name] = element.currentStyle[name];
    element.style[name] = value;
    var pixelValue = element.style[pixelName];
    element.style[name] = oldStyleValue;
    element.runtimeStyle[name] = oldRuntimeValue;
    return pixelValue;
  }
};
goog.style.getIePixelDistance_ = function(element, propName) {
  var value = goog.style.getCascadedStyle(element, propName);
  return value ? goog.style.getIePixelValue_(element, value, "left", "pixelLeft") : 0;
};
goog.style.getBox_ = function(element, stylePrefix) {
  if (goog.userAgent.IE) {
    var left = goog.style.getIePixelDistance_(element, stylePrefix + "Left");
    var right = goog.style.getIePixelDistance_(element, stylePrefix + "Right");
    var top = goog.style.getIePixelDistance_(element, stylePrefix + "Top");
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + "Bottom");
    return new goog.math.Box(top, right, bottom, left);
  } else {
    var left = (goog.style.getComputedStyle(element, stylePrefix + "Left"));
    var right = (goog.style.getComputedStyle(element, stylePrefix + "Right"));
    var top = (goog.style.getComputedStyle(element, stylePrefix + "Top"));
    var bottom = (goog.style.getComputedStyle(element, stylePrefix + "Bottom"));
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left));
  }
};
goog.style.getPaddingBox = function(element) {
  return goog.style.getBox_(element, "padding");
};
goog.style.getMarginBox = function(element) {
  return goog.style.getBox_(element, "margin");
};
goog.style.ieBorderWidthKeywords_ = {"thin":2, "medium":4, "thick":6};
goog.style.getIePixelBorder_ = function(element, prop) {
  if (goog.style.getCascadedStyle(element, prop + "Style") == "none") {
    return 0;
  }
  var width = goog.style.getCascadedStyle(element, prop + "Width");
  if (width in goog.style.ieBorderWidthKeywords_) {
    return goog.style.ieBorderWidthKeywords_[width];
  }
  return goog.style.getIePixelValue_(element, width, "left", "pixelLeft");
};
goog.style.getBorderBox = function(element) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    var left = goog.style.getIePixelBorder_(element, "borderLeft");
    var right = goog.style.getIePixelBorder_(element, "borderRight");
    var top = goog.style.getIePixelBorder_(element, "borderTop");
    var bottom = goog.style.getIePixelBorder_(element, "borderBottom");
    return new goog.math.Box(top, right, bottom, left);
  } else {
    var left = (goog.style.getComputedStyle(element, "borderLeftWidth"));
    var right = (goog.style.getComputedStyle(element, "borderRightWidth"));
    var top = (goog.style.getComputedStyle(element, "borderTopWidth"));
    var bottom = (goog.style.getComputedStyle(element, "borderBottomWidth"));
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left));
  }
};
goog.style.getFontFamily = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  var font = "";
  if (doc.body.createTextRange) {
    var range = doc.body.createTextRange();
    range.moveToElementText(el);
    try {
      font = range.queryCommandValue("FontName");
    } catch (e) {
      font = "";
    }
  }
  if (!font) {
    font = goog.style.getStyle_(el, "fontFamily");
  }
  var fontsArray = font.split(",");
  if (fontsArray.length > 1) {
    font = fontsArray[0];
  }
  return goog.string.stripQuotes(font, "\"'");
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(value) {
  var units = value.match(goog.style.lengthUnitRegex_);
  return units && units[0] || null;
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {"cm":1, "in":1, "mm":1, "pc":1, "pt":1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {"em":1, "ex":1};
goog.style.getFontSize = function(el) {
  var fontSize = goog.style.getStyle_(el, "fontSize");
  var sizeUnits = goog.style.getLengthUnits(fontSize);
  if (fontSize && "px" == sizeUnits) {
    return parseInt(fontSize, 10);
  }
  if (goog.userAgent.IE) {
    if (sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(el, fontSize, "left", "pixelLeft");
    } else {
      if (el.parentNode && (el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_)) {
        var parentElement = (el.parentNode);
        var parentSize = goog.style.getStyle_(parentElement, "fontSize");
        return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? "1em" : fontSize, "left", "pixelLeft");
      }
    }
  }
  var sizeElement = goog.dom.createDom("span", {"style":"visibility:hidden;position:absolute;" + "line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(el, sizeElement);
  fontSize = sizeElement.offsetHeight;
  goog.dom.removeNode(sizeElement);
  return fontSize;
};
goog.style.parseStyleAttribute = function(value) {
  var result = {};
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) {
    var keyValue = pair.split(/\s*:\s*/);
    if (keyValue.length == 2) {
      result[goog.string.toCamelCase(keyValue[0].toLowerCase())] = keyValue[1];
    }
  });
  return result;
};
goog.style.toStyleAttribute = function(obj) {
  var buffer = [];
  goog.object.forEach(obj, function(value, key) {
    buffer.push(goog.string.toSelectorCase(key), ":", value, ";");
  });
  return buffer.join("");
};
goog.style.setFloat = function(el, value) {
  el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = value;
};
goog.style.getFloat = function(el) {
  return el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || "";
};
goog.style.getScrollbarWidth = function(opt_className) {
  var outerDiv = goog.dom.createElement("div");
  if (opt_className) {
    outerDiv.className = opt_className;
  }
  outerDiv.style.cssText = "overflow:auto;" + "position:absolute;top:0;width:100px;height:100px";
  var innerDiv = goog.dom.createElement("div");
  goog.style.setSize(innerDiv, "200px", "200px");
  outerDiv.appendChild(innerDiv);
  goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);
  var width = outerDiv.offsetWidth - outerDiv.clientWidth;
  goog.dom.removeNode(outerDiv);
  return width;
};
goog.style.MATRIX_TRANSLATION_REGEX_ = new RegExp("matrix\\([0-9\\.\\-]+, [0-9\\.\\-]+, " + "[0-9\\.\\-]+, [0-9\\.\\-]+, " + "([0-9\\.\\-]+)p?x?, ([0-9\\.\\-]+)p?x?\\)");
goog.style.getCssTranslation = function(element) {
  var property;
  if (goog.userAgent.IE) {
    property = "-ms-transform";
  } else {
    if (goog.userAgent.WEBKIT) {
      property = "-webkit-transform";
    } else {
      if (goog.userAgent.OPERA) {
        property = "-o-transform";
      } else {
        if (goog.userAgent.GECKO) {
          property = "-moz-transform";
        }
      }
    }
  }
  var transform;
  if (property) {
    transform = goog.style.getStyle_(element, property);
  }
  if (!transform) {
    transform = goog.style.getStyle_(element, "transform");
  }
  if (!transform) {
    return new goog.math.Coordinate(0, 0);
  }
  var matches = transform.match(goog.style.MATRIX_TRANSLATION_REGEX_);
  if (!matches) {
    return new goog.math.Coordinate(0, 0);
  }
  return new goog.math.Coordinate(parseFloat(matches[1]), parseFloat(matches[2]));
};
goog.provide("goog.events.EventId");
goog.events.EventId = function(eventId) {
  this.id = eventId;
};
goog.events.EventId.prototype.toString = function() {
  return this.id;
};
goog.provide("goog.events.Listenable");
goog.provide("goog.events.ListenableKey");
goog.require("goog.events.EventId");
goog.events.Listenable = function() {
};
goog.events.Listenable.IMPLEMENTED_BY_PROP = "closure_listenable_" + (Math.random() * 1E6 | 0);
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true;
};
goog.events.Listenable.isImplementedBy = function(obj) {
  try {
    return!!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP]);
  } catch (e) {
    return false;
  }
};
goog.events.Listenable.prototype.listen;
goog.events.Listenable.prototype.listenOnce;
goog.events.Listenable.prototype.unlisten;
goog.events.Listenable.prototype.unlistenByKey;
goog.events.Listenable.prototype.dispatchEvent;
goog.events.Listenable.prototype.removeAllListeners;
goog.events.Listenable.prototype.getParentEventTarget;
goog.events.Listenable.prototype.fireListeners;
goog.events.Listenable.prototype.getListeners;
goog.events.Listenable.prototype.getListener;
goog.events.Listenable.prototype.hasListener;
goog.events.ListenableKey = function() {
};
goog.events.ListenableKey.counter_ = 0;
goog.events.ListenableKey.reserveKey = function() {
  return++goog.events.ListenableKey.counter_;
};
goog.events.ListenableKey.prototype.src;
goog.events.ListenableKey.prototype.type;
goog.events.ListenableKey.prototype.listener;
goog.events.ListenableKey.prototype.capture;
goog.events.ListenableKey.prototype.handler;
goog.events.ListenableKey.prototype.key;
goog.provide("goog.events.Listener");
goog.require("goog.events.ListenableKey");
goog.events.Listener = function(listener, proxy, src, type, capture, opt_handler) {
  if (goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = (new Error).stack;
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.key = goog.events.ListenableKey.reserveKey();
  this.callOnce = false;
  this.removed = false;
};
goog.define("goog.events.Listener.ENABLE_MONITORING", false);
goog.events.Listener.prototype.creationStack;
goog.events.Listener.prototype.markAsRemoved = function() {
  this.removed = true;
  this.listener = null;
  this.proxy = null;
  this.src = null;
  this.handler = null;
};
goog.provide("goog.events.ListenerMap");
goog.require("goog.array");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.events.ListenerMap = function(src) {
  this.src = src;
  this.listeners = {};
  this.typeCount_ = 0;
};
goog.events.ListenerMap.prototype.getTypeCount = function() {
  return this.typeCount_;
};
goog.events.ListenerMap.prototype.getListenerCount = function() {
  var count = 0;
  for (var type in this.listeners) {
    count += this.listeners[type].length;
  }
  return count;
};
goog.events.ListenerMap.prototype.add = function(type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  var listenerArray = this.listeners[type];
  if (!listenerArray) {
    listenerArray = this.listeners[type] = [];
    this.typeCount_++;
  }
  var listenerObj;
  var index = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    listenerObj = listenerArray[index];
    if (!callOnce) {
      listenerObj.callOnce = false;
    }
  } else {
    listenerObj = new goog.events.Listener(listener, null, this.src, type, !!opt_useCapture, opt_listenerScope);
    listenerObj.callOnce = callOnce;
    listenerArray.push(listenerObj);
  }
  return listenerObj;
};
goog.events.ListenerMap.prototype.remove = function(type, listener, opt_useCapture, opt_listenerScope) {
  if (!(type in this.listeners)) {
    return false;
  }
  var listenerArray = this.listeners[type];
  var index = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    var listenerObj = listenerArray[index];
    listenerObj.markAsRemoved();
    goog.array.removeAt(listenerArray, index);
    if (listenerArray.length == 0) {
      delete this.listeners[type];
      this.typeCount_--;
    }
    return true;
  }
  return false;
};
goog.events.ListenerMap.prototype.removeByKey = function(listener) {
  var type = listener.type;
  if (!(type in this.listeners)) {
    return false;
  }
  var removed = goog.array.remove(this.listeners[type], listener);
  if (removed) {
    listener.markAsRemoved();
    if (this.listeners[type].length == 0) {
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return removed;
};
goog.events.ListenerMap.prototype.removeAll = function(opt_type) {
  var count = 0;
  for (var type in this.listeners) {
    if (!opt_type || type == opt_type) {
      var listenerArray = this.listeners[type];
      for (var i = 0;i < listenerArray.length;i++) {
        ++count;
        listenerArray[i].markAsRemoved();
      }
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return count;
};
goog.events.ListenerMap.prototype.getListeners = function(type, capture) {
  var listenerArray = this.listeners[type];
  var rv = [];
  if (listenerArray) {
    for (var i = 0;i < listenerArray.length;++i) {
      var listenerObj = listenerArray[i];
      if (listenerObj.capture == capture) {
        rv.push(listenerObj);
      }
    }
  }
  return rv;
};
goog.events.ListenerMap.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  var listenerArray = this.listeners[type];
  var i = -1;
  if (listenerArray) {
    i = goog.events.ListenerMap.findListenerIndex_(listenerArray, listener, capture, opt_listenerScope);
  }
  return i > -1 ? listenerArray[i] : null;
};
goog.events.ListenerMap.prototype.hasListener = function(opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var hasCapture = goog.isDef(opt_capture);
  return goog.object.some(this.listeners, function(listenerArray, type) {
    for (var i = 0;i < listenerArray.length;++i) {
      if ((!hasType || listenerArray[i].type == opt_type) && (!hasCapture || listenerArray[i].capture == opt_capture)) {
        return true;
      }
    }
    return false;
  });
};
goog.events.ListenerMap.findListenerIndex_ = function(listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for (var i = 0;i < listenerArray.length;++i) {
    var listenerObj = listenerArray[i];
    if (!listenerObj.removed && (listenerObj.listener == listener && (listenerObj.capture == !!opt_useCapture && listenerObj.handler == opt_listenerScope))) {
      return i;
    }
  }
  return-1;
};
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), HAS_W3C_EVENT_SUPPORT:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), HAS_NAVIGATOR_ONLINE_PROPERTY:!goog.userAgent.WEBKIT || goog.userAgent.isVersionOrHigher("528"), HAS_HTML5_NETWORK_EVENT_SUPPORT:goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9b") || (goog.userAgent.IE && 
goog.userAgent.isVersionOrHigher("8") || (goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher("9.5") || goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("528"))), HTML5_NETWORK_EVENTS_FIRE_ON_BODY:goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher("8") || goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), TOUCH_ENABLED:"ontouchstart" in goog.global || (!!(goog.global["document"] && (document.documentElement && "ontouchstart" in document.documentElement)) || !!(goog.global["navigator"] && 
goog.global["navigator"]["msMaxTouchPoints"]))};
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.require("goog.asserts");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.monitors_ = [];
goog.debug.entryPointRegistry.monitorsMayExist_ = false;
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback;
  if (goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for (var i = 0;i < monitors.length;i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]));
    }
  }
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for (var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor);
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1], "Only the most recent monitor can be unwrapped.");
  var transformer = goog.bind(monitor.unwrap, monitor);
  for (var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  monitors.length--;
};
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.getVendorPrefixedName_ = function(eventName) {
  return goog.userAgent.WEBKIT ? "webkit" + eventName : goog.userAgent.OPERA ? "o" + eventName.toLowerCase() : eventName.toLowerCase();
};
goog.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", MOUSEENTER:"mouseenter", MOUSELEAVE:"mouseleave", SELECTSTART:"selectstart", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", CHANGE:"change", SELECT:"select", SUBMIT:"submit", 
INPUT:"input", PROPERTYCHANGE:"propertychange", DRAGSTART:"dragstart", DRAG:"drag", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", DRAGEND:"dragend", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", BEFOREUNLOAD:"beforeunload", CONSOLEMESSAGE:"consolemessage", CONTEXTMENU:"contextmenu", DOMCONTENTLOADED:"DOMContentLoaded", ERROR:"error", HELP:"help", LOAD:"load", LOSECAPTURE:"losecapture", ORIENTATIONCHANGE:"orientationchange", 
READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", BEFORECOPY:"beforecopy", BEFORECUT:"beforecut", BEFOREPASTE:"beforepaste", ONLINE:"online", OFFLINE:"offline", MESSAGE:"message", CONNECT:"connect", ANIMATIONSTART:goog.events.getVendorPrefixedName_("AnimationStart"), ANIMATIONEND:goog.events.getVendorPrefixedName_("AnimationEnd"), ANIMATIONITERATION:goog.events.getVendorPrefixedName_("AnimationIteration"), 
TRANSITIONEND:goog.events.getVendorPrefixedName_("TransitionEnd"), POINTERDOWN:"pointerdown", POINTERUP:"pointerup", POINTERCANCEL:"pointercancel", POINTERMOVE:"pointermove", POINTEROVER:"pointerover", POINTEROUT:"pointerout", POINTERENTER:"pointerenter", POINTERLEAVE:"pointerleave", GOTPOINTERCAPTURE:"gotpointercapture", LOSTPOINTERCAPTURE:"lostpointercapture", MSGESTURECHANGE:"MSGestureChange", MSGESTUREEND:"MSGestureEnd", MSGESTUREHOLD:"MSGestureHold", MSGESTURESTART:"MSGestureStart", MSGESTURETAP:"MSGestureTap", 
MSGOTPOINTERCAPTURE:"MSGotPointerCapture", MSINERTIASTART:"MSInertiaStart", MSLOSTPOINTERCAPTURE:"MSLostPointerCapture", MSPOINTERCANCEL:"MSPointerCancel", MSPOINTERDOWN:"MSPointerDown", MSPOINTERENTER:"MSPointerEnter", MSPOINTERHOVER:"MSPointerHover", MSPOINTERLEAVE:"MSPointerLeave", MSPOINTERMOVE:"MSPointerMove", MSPOINTEROUT:"MSPointerOut", MSPOINTEROVER:"MSPointerOver", MSPOINTERUP:"MSPointerUp", TEXTINPUT:"textinput", COMPOSITIONSTART:"compositionstart", COMPOSITIONUPDATE:"compositionupdate", 
COMPOSITIONEND:"compositionend", EXIT:"exit", LOADABORT:"loadabort", LOADCOMMIT:"loadcommit", LOADREDIRECT:"loadredirect", LOADSTART:"loadstart", LOADSTOP:"loadstop", RESPONSIVE:"responsive", SIZECHANGED:"sizechanged", UNRESPONSIVE:"unresponsive", VISIBILITYCHANGE:"visibilitychange"};
goog.provide("goog.events.Event");
goog.provide("goog.events.EventLike");
goog.require("goog.Disposable");
goog.require("goog.events.EventId");
goog.events.EventLike;
goog.events.Event = function(type, opt_target) {
  this.type = type instanceof goog.events.EventId ? String(type) : type;
  this.target = opt_target;
  this.currentTarget = this.target;
  this.propagationStopped_ = false;
  this.defaultPrevented = false;
  this.returnValue_ = true;
};
goog.events.Event.prototype.disposeInternal = function() {
};
goog.events.Event.prototype.dispose = function() {
};
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false;
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object;
};
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[" "](x);
  return x;
};
goog.reflect.sinkValue[" "] = goog.nullFunction;
goog.reflect.canAccessProperty = function(obj, prop) {
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {
  }
  return false;
};
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  goog.base(this, opt_e ? opt_e.type : "");
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null;
  this.offsetX = 0;
  this.offsetY = 0;
  this.clientX = 0;
  this.clientY = 0;
  this.screenX = 0;
  this.screenY = 0;
  this.button = 0;
  this.keyCode = 0;
  this.charCode = 0;
  this.ctrlKey = false;
  this.altKey = false;
  this.shiftKey = false;
  this.metaKey = false;
  this.state = null;
  this.platformModifierKey = false;
  this.event_ = null;
  if (opt_e) {
    this.init(opt_e, opt_currentTarget);
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  this.target = (e.target) || e.srcElement;
  this.currentTarget = (opt_currentTarget);
  var relatedTarget = (e.relatedTarget);
  if (relatedTarget) {
    if (goog.userAgent.GECKO) {
      if (!goog.reflect.canAccessProperty(relatedTarget, "nodeName")) {
        relatedTarget = null;
      }
    }
  } else {
    if (type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement;
    } else {
      if (type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement;
      }
    }
  }
  this.relatedTarget = relatedTarget;
  this.offsetX = goog.userAgent.WEBKIT || e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = goog.userAgent.WEBKIT || e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if (e.defaultPrevented) {
    this.preventDefault();
  }
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if (this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return!!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button]);
    }
  } else {
    return this.event_.button == button;
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && (goog.userAgent.MAC && this.ctrlKey));
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
      }
    }
  } else {
    be.preventDefault();
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};
goog.events.BrowserEvent.prototype.disposeInternal = function() {
};
goog.provide("goog.events");
goog.provide("goog.events.CaptureSimulationMode");
goog.provide("goog.events.Key");
goog.provide("goog.events.ListenableType");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Listenable");
goog.require("goog.events.ListenerMap");
goog.events.Key;
goog.events.ListenableType;
goog.events.listeners_ = {};
goog.events.LISTENER_MAP_PROP_ = "closure_lm_" + (Math.random() * 1E6 | 0);
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.CaptureSimulationMode = {OFF_AND_FAIL:0, OFF_AND_SILENT:1, ON:2};
goog.define("goog.events.CAPTURE_SIMULATION_MODE", 2);
goog.events.listenerCountEstimate_ = 0;
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }
  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listen((type), listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_((src), type, listener, false, opt_capt, opt_handler);
  }
};
goog.events.listen_ = function(src, type, listener, callOnce, opt_capt, opt_handler) {
  if (!type) {
    throw Error("Invalid event type");
  }
  var capture = !!opt_capt;
  if (capture && !goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    if (goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.OFF_AND_FAIL) {
      goog.asserts.fail("Can not register capture listener in IE8-.");
      return null;
    } else {
      if (goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.OFF_AND_SILENT) {
        return null;
      }
    }
  }
  var listenerMap = goog.events.getListenerMap_(src);
  if (!listenerMap) {
    src[goog.events.LISTENER_MAP_PROP_] = listenerMap = new goog.events.ListenerMap(src);
  }
  var listenerObj = listenerMap.add(type, listener, callOnce, opt_capt, opt_handler);
  if (listenerObj.proxy) {
    return listenerObj;
  }
  var proxy = goog.events.getProxy();
  listenerObj.proxy = proxy;
  proxy.src = src;
  proxy.listener = listenerObj;
  if (src.addEventListener) {
    src.addEventListener(type, proxy, capture);
  } else {
    src.attachEvent(goog.events.getOnString_(type), proxy);
  }
  goog.events.listenerCountEstimate_++;
  return listenerObj;
};
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ? function(eventObject) {
    return proxyCallbackFunction.call(f.src, f.listener, eventObject);
  } : function(eventObject) {
    var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
    if (!v) {
      return v;
    }
  };
  return f;
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }
  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listenOnce((type), listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_((src), type, listener, true, opt_capt, opt_handler);
  }
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }
  listener = goog.events.wrapListener_(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten((type), listener, opt_capt, opt_handler);
  }
  if (!src) {
    return false;
  }
  var capture = !!opt_capt;
  var listenerMap = goog.events.getListenerMap_((src));
  if (listenerMap) {
    var listenerObj = listenerMap.getListener((type), listener, capture, opt_handler);
    if (listenerObj) {
      return goog.events.unlistenByKey(listenerObj);
    }
  }
  return false;
};
goog.events.unlistenByKey = function(key) {
  if (goog.isNumber(key)) {
    return false;
  }
  var listener = (key);
  if (!listener || listener.removed) {
    return false;
  }
  var src = listener.src;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener);
  }
  var type = listener.type;
  var proxy = listener.proxy;
  if (src.removeEventListener) {
    src.removeEventListener(type, proxy, listener.capture);
  } else {
    if (src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy);
    }
  }
  goog.events.listenerCountEstimate_--;
  var listenerMap = goog.events.getListenerMap_((src));
  if (listenerMap) {
    listenerMap.removeByKey(listener);
    if (listenerMap.getTypeCount() == 0) {
      listenerMap.src = null;
      src[goog.events.LISTENER_MAP_PROP_] = null;
    }
  } else {
    listener.markAsRemoved();
  }
  return true;
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};
goog.events.removeAll = function(opt_obj, opt_type) {
  if (!opt_obj) {
    return 0;
  }
  if (goog.events.Listenable.isImplementedBy(opt_obj)) {
    return opt_obj.removeAllListeners(opt_type);
  }
  var listenerMap = goog.events.getListenerMap_((opt_obj));
  if (!listenerMap) {
    return 0;
  }
  var count = 0;
  for (var type in listenerMap.listeners) {
    if (!opt_type || type == opt_type) {
      var listeners = goog.array.clone(listenerMap.listeners[type]);
      for (var i = 0;i < listeners.length;++i) {
        if (goog.events.unlistenByKey(listeners[i])) {
          ++count;
        }
      }
    }
  }
  return count;
};
goog.events.removeAllNativeListeners = function() {
  goog.events.listenerCountEstimate_ = 0;
  return 0;
};
goog.events.getListeners = function(obj, type, capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture);
  } else {
    if (!obj) {
      return[];
    }
    var listenerMap = goog.events.getListenerMap_((obj));
    return listenerMap ? listenerMap.getListeners(type, capture) : [];
  }
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  type = (type);
  listener = goog.events.wrapListener_(listener);
  var capture = !!opt_capt;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(type, listener, capture, opt_handler);
  }
  if (!src) {
    return null;
  }
  var listenerMap = goog.events.getListenerMap_((src));
  if (listenerMap) {
    return listenerMap.getListener(type, listener, capture, opt_handler);
  }
  return null;
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture);
  }
  var listenerMap = goog.events.getListenerMap_((obj));
  return!!listenerMap && listenerMap.hasListener(opt_type, opt_capture);
};
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")");
    } else {
      str.push(key + " = " + e[key]);
    }
  }
  return str.join("\n");
};
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject);
  }
  return goog.events.fireListeners_(obj, type, capture, eventObject);
};
goog.events.fireListeners_ = function(obj, type, capture, eventObject) {
  var retval = 1;
  var listenerMap = goog.events.getListenerMap_((obj));
  if (listenerMap) {
    var listenerArray = listenerMap.listeners[type];
    if (listenerArray) {
      listenerArray = goog.array.clone(listenerArray);
      for (var i = 0;i < listenerArray.length;i++) {
        var listener = listenerArray[i];
        if (listener && (listener.capture == capture && !listener.removed)) {
          retval &= goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    }
  }
  return Boolean(retval);
};
goog.events.fireListener = function(listener, eventObject) {
  var listenerFn = listener.listener;
  var listenerHandler = listener.handler || listener.src;
  if (listener.callOnce) {
    goog.events.unlistenByKey(listener);
  }
  return listenerFn.call(listenerHandler, eventObject);
};
goog.events.getTotalListenerCount = function() {
  return goog.events.listenerCountEstimate_;
};
goog.events.dispatchEvent = function(src, e) {
  goog.asserts.assert(goog.events.Listenable.isImplementedBy(src), "Can not use goog.events.dispatchEvent with " + "non-goog.events.Listenable instance.");
  return src.dispatchEvent(e);
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_);
};
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if (listener.removed) {
    return true;
  }
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt || (goog.getObjectByName("window.event"));
    var evt = new goog.events.BrowserEvent(ieEvent, this);
    var retval = true;
    if (goog.events.CAPTURE_SIMULATION_MODE == goog.events.CaptureSimulationMode.ON) {
      if (!goog.events.isMarkedIeEvent_(ieEvent)) {
        goog.events.markIeEvent_(ieEvent);
        var ancestors = [];
        for (var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent);
        }
        var type = listener.type;
        for (var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0;i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, true, evt);
        }
        for (var i = 0;!evt.propagationStopped_ && i < ancestors.length;i++) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, false, evt);
        }
      }
    } else {
      retval = goog.events.fireListener(listener, evt);
    }
    return retval;
  }
  return goog.events.fireListener(listener, new goog.events.BrowserEvent(opt_evt, this));
};
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if (e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }
  if (useReturnValue || (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++;
};
goog.events.getListenerMap_ = function(src) {
  var listenerMap = src[goog.events.LISTENER_MAP_PROP_];
  return listenerMap instanceof goog.events.ListenerMap ? listenerMap : null;
};
goog.events.LISTENER_WRAPPER_PROP_ = "__closure_events_fn_" + (Math.random() * 1E9 >>> 0);
goog.events.wrapListener_ = function(listener) {
  goog.asserts.assert(listener, "Listener can not be null.");
  if (goog.isFunction(listener)) {
    return listener;
  }
  goog.asserts.assert(listener.handleEvent, "An object listener must have handleEvent method.");
  return listener[goog.events.LISTENER_WRAPPER_PROP_] || (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
    return listener.handleEvent(e);
  });
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_);
});
goog.provide("goog.events.EventHandler");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.require("goog.object");
goog.events.EventHandler = function(opt_scope) {
  goog.Disposable.call(this);
  this.handler_ = opt_scope;
  this.keys_ = {};
};
goog.inherits(goog.events.EventHandler, goog.Disposable);
goog.events.EventHandler.typeArray_ = [];
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn, opt_capture) {
  return this.listen_(src, type, opt_fn, opt_capture);
};
goog.events.EventHandler.prototype.listenWithScope = function(src, type, fn, capture, scope) {
  return this.listen_(src, type, fn, capture, scope);
};
goog.events.EventHandler.prototype.listen_ = function(src, type, opt_fn, opt_capture, opt_scope) {
  if (!goog.isArray(type)) {
    goog.events.EventHandler.typeArray_[0] = (type);
    type = goog.events.EventHandler.typeArray_;
  }
  for (var i = 0;i < type.length;i++) {
    var listenerObj = goog.events.listen(src, type[i], opt_fn || this.handleEvent, opt_capture || false, opt_scope || (this.handler_ || this));
    if (!listenerObj) {
      return this;
    }
    var key = listenerObj.key;
    this.keys_[key] = listenerObj;
  }
  return this;
};
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn, opt_capture) {
  return this.listenOnce_(src, type, opt_fn, opt_capture);
};
goog.events.EventHandler.prototype.listenOnceWithScope = function(src, type, fn, capture, scope) {
  return this.listenOnce_(src, type, fn, capture, scope);
};
goog.events.EventHandler.prototype.listenOnce_ = function(src, type, opt_fn, opt_capture, opt_scope) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      this.listenOnce_(src, type[i], opt_fn, opt_capture, opt_scope);
    }
  } else {
    var listenerObj = goog.events.listenOnce(src, type, opt_fn || this.handleEvent, opt_capture, opt_scope || (this.handler_ || this));
    if (!listenerObj) {
      return this;
    }
    var key = listenerObj.key;
    this.keys_[key] = listenerObj;
  }
  return this;
};
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper, listener, opt_capt) {
  return this.listenWithWrapper_(src, wrapper, listener, opt_capt);
};
goog.events.EventHandler.prototype.listenWithWrapperAndScope = function(src, wrapper, listener, capture, scope) {
  return this.listenWithWrapper_(src, wrapper, listener, capture, scope);
};
goog.events.EventHandler.prototype.listenWithWrapper_ = function(src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.listen(src, listener, opt_capt, opt_scope || (this.handler_ || this), this);
  return this;
};
goog.events.EventHandler.prototype.getListenerCount = function() {
  var count = 0;
  for (var key in this.keys_) {
    if (Object.prototype.hasOwnProperty.call(this.keys_, key)) {
      count++;
    }
  }
  return count;
};
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn, opt_capture, opt_scope) {
  if (goog.isArray(type)) {
    for (var i = 0;i < type.length;i++) {
      this.unlisten(src, type[i], opt_fn, opt_capture, opt_scope);
    }
  } else {
    var listener = goog.events.getListener(src, type, opt_fn || this.handleEvent, opt_capture, opt_scope || (this.handler_ || this));
    if (listener) {
      goog.events.unlistenByKey(listener);
      delete this.keys_[listener.key];
    }
  }
  return this;
};
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_scope) {
  wrapper.unlisten(src, listener, opt_capt, opt_scope || (this.handler_ || this), this);
  return this;
};
goog.events.EventHandler.prototype.removeAll = function() {
  goog.object.forEach(this.keys_, goog.events.unlistenByKey);
  this.keys_ = {};
};
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll();
};
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error("EventHandler.handleEvent not implemented");
};
goog.provide("goog.ui.IdGenerator");
goog.ui.IdGenerator = function() {
};
goog.addSingletonGetter(goog.ui.IdGenerator);
goog.ui.IdGenerator.prototype.nextId_ = 0;
goog.ui.IdGenerator.prototype.getNextUniqueId = function() {
  return ":" + (this.nextId_++).toString(36);
};
goog.provide("goog.events.EventTarget");
goog.require("goog.Disposable");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.Listenable");
goog.require("goog.events.ListenerMap");
goog.require("goog.object");
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
  this.eventTargetListeners_ = new goog.events.ListenerMap(this);
  this.actualEventTarget_ = this;
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.Listenable.addImplementation(goog.events.EventTarget);
goog.events.EventTarget.MAX_ANCESTORS_ = 1E3;
goog.events.EventTarget.prototype.parentEventTarget_ = null;
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_;
};
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent;
};
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  this.assertInitialized_();
  var ancestorsTree, ancestor = this.getParentEventTarget();
  if (ancestor) {
    ancestorsTree = [];
    var ancestorCount = 1;
    for (;ancestor;ancestor = ancestor.getParentEventTarget()) {
      ancestorsTree.push(ancestor);
      goog.asserts.assert(++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_, "infinite loop");
    }
  }
  return goog.events.EventTarget.dispatchEventInternal_(this.actualEventTarget_, e, ancestorsTree);
};
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  this.removeAllListeners();
  this.parentEventTarget_ = null;
};
goog.events.EventTarget.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  this.assertInitialized_();
  return this.eventTargetListeners_.add(String(type), listener, false, opt_useCapture, opt_listenerScope);
};
goog.events.EventTarget.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.add(String(type), listener, true, opt_useCapture, opt_listenerScope);
};
goog.events.EventTarget.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.remove(String(type), listener, opt_useCapture, opt_listenerScope);
};
goog.events.EventTarget.prototype.unlistenByKey = function(key) {
  return this.eventTargetListeners_.removeByKey(key);
};
goog.events.EventTarget.prototype.removeAllListeners = function(opt_type) {
  if (!this.eventTargetListeners_) {
    return 0;
  }
  return this.eventTargetListeners_.removeAll(opt_type);
};
goog.events.EventTarget.prototype.fireListeners = function(type, capture, eventObject) {
  var listenerArray = this.eventTargetListeners_.listeners[String(type)];
  if (!listenerArray) {
    return true;
  }
  listenerArray = goog.array.clone(listenerArray);
  var rv = true;
  for (var i = 0;i < listenerArray.length;++i) {
    var listener = listenerArray[i];
    if (listener && (!listener.removed && listener.capture == capture)) {
      var listenerFn = listener.listener;
      var listenerHandler = listener.handler || listener.src;
      if (listener.callOnce) {
        this.unlistenByKey(listener);
      }
      rv = listenerFn.call(listenerHandler, eventObject) !== false && rv;
    }
  }
  return rv && eventObject.returnValue_ != false;
};
goog.events.EventTarget.prototype.getListeners = function(type, capture) {
  return this.eventTargetListeners_.getListeners(String(type), capture);
};
goog.events.EventTarget.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  return this.eventTargetListeners_.getListener(String(type), listener, capture, opt_listenerScope);
};
goog.events.EventTarget.prototype.hasListener = function(opt_type, opt_capture) {
  var id = goog.isDef(opt_type) ? String(opt_type) : undefined;
  return this.eventTargetListeners_.hasListener(id, opt_capture);
};
goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
  this.actualEventTarget_ = target;
};
goog.events.EventTarget.prototype.assertInitialized_ = function() {
  goog.asserts.assert(this.eventTargetListeners_, "Event target is not initialized. Did you call the superclass " + "(goog.events.EventTarget) constructor?");
};
goog.events.EventTarget.dispatchEventInternal_ = function(target, e, opt_ancestorsTree) {
  var type = e.type || (e);
  if (goog.isString(e)) {
    e = new goog.events.Event(e, target);
  } else {
    if (!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event(type, target);
      goog.object.extend(e, oldEvent);
    } else {
      e.target = e.target || target;
    }
  }
  var rv = true, currentTarget;
  if (opt_ancestorsTree) {
    for (var i = opt_ancestorsTree.length - 1;!e.propagationStopped_ && i >= 0;i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv;
    }
  }
  if (!e.propagationStopped_) {
    currentTarget = e.currentTarget = target;
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if (!e.propagationStopped_) {
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }
  if (opt_ancestorsTree) {
    for (i = 0;!e.propagationStopped_ && i < opt_ancestorsTree.length;i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }
  return rv;
};
goog.provide("goog.ui.Component");
goog.provide("goog.ui.Component.Error");
goog.provide("goog.ui.Component.EventType");
goog.provide("goog.ui.Component.State");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.object");
goog.require("goog.style");
goog.require("goog.ui.IdGenerator");
goog.ui.Component = function(opt_domHelper) {
  goog.events.EventTarget.call(this);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  this.rightToLeft_ = goog.ui.Component.defaultRightToLeft_;
};
goog.inherits(goog.ui.Component, goog.events.EventTarget);
goog.define("goog.ui.Component.ALLOW_DETACHED_DECORATION", false);
goog.ui.Component.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();
goog.define("goog.ui.Component.DEFAULT_BIDI_DIR", 0);
goog.ui.Component.defaultRightToLeft_ = goog.ui.Component.DEFAULT_BIDI_DIR == 1 ? false : goog.ui.Component.DEFAULT_BIDI_DIR == -1 ? true : null;
goog.ui.Component.EventType = {BEFORE_SHOW:"beforeshow", SHOW:"show", HIDE:"hide", DISABLE:"disable", ENABLE:"enable", HIGHLIGHT:"highlight", UNHIGHLIGHT:"unhighlight", ACTIVATE:"activate", DEACTIVATE:"deactivate", SELECT:"select", UNSELECT:"unselect", CHECK:"check", UNCHECK:"uncheck", FOCUS:"focus", BLUR:"blur", OPEN:"open", CLOSE:"close", ENTER:"enter", LEAVE:"leave", ACTION:"action", CHANGE:"change"};
goog.ui.Component.Error = {NOT_SUPPORTED:"Method not supported", DECORATE_INVALID:"Invalid element to decorate", ALREADY_RENDERED:"Component already rendered", PARENT_UNABLE_TO_BE_SET:"Unable to set parent component", CHILD_INDEX_OUT_OF_BOUNDS:"Child component index out of bounds", NOT_OUR_CHILD:"Child is not in parent component", NOT_IN_DOCUMENT:"Operation not supported while component is not in document", STATE_INVALID:"Invalid component state"};
goog.ui.Component.State = {ALL:255, DISABLED:1, HOVER:2, ACTIVE:4, SELECTED:8, CHECKED:16, FOCUSED:32, OPENED:64};
goog.ui.Component.getStateTransitionEvent = function(state, isEntering) {
  switch(state) {
    case goog.ui.Component.State.DISABLED:
      return isEntering ? goog.ui.Component.EventType.DISABLE : goog.ui.Component.EventType.ENABLE;
    case goog.ui.Component.State.HOVER:
      return isEntering ? goog.ui.Component.EventType.HIGHLIGHT : goog.ui.Component.EventType.UNHIGHLIGHT;
    case goog.ui.Component.State.ACTIVE:
      return isEntering ? goog.ui.Component.EventType.ACTIVATE : goog.ui.Component.EventType.DEACTIVATE;
    case goog.ui.Component.State.SELECTED:
      return isEntering ? goog.ui.Component.EventType.SELECT : goog.ui.Component.EventType.UNSELECT;
    case goog.ui.Component.State.CHECKED:
      return isEntering ? goog.ui.Component.EventType.CHECK : goog.ui.Component.EventType.UNCHECK;
    case goog.ui.Component.State.FOCUSED:
      return isEntering ? goog.ui.Component.EventType.FOCUS : goog.ui.Component.EventType.BLUR;
    case goog.ui.Component.State.OPENED:
      return isEntering ? goog.ui.Component.EventType.OPEN : goog.ui.Component.EventType.CLOSE;
    default:
    ;
  }
  throw Error(goog.ui.Component.Error.STATE_INVALID);
};
goog.ui.Component.setDefaultRightToLeft = function(rightToLeft) {
  goog.ui.Component.defaultRightToLeft_ = rightToLeft;
};
goog.ui.Component.prototype.id_ = null;
goog.ui.Component.prototype.dom_;
goog.ui.Component.prototype.inDocument_ = false;
goog.ui.Component.prototype.element_ = null;
goog.ui.Component.prototype.googUiComponentHandler_;
goog.ui.Component.prototype.rightToLeft_ = null;
goog.ui.Component.prototype.model_ = null;
goog.ui.Component.prototype.parent_ = null;
goog.ui.Component.prototype.children_ = null;
goog.ui.Component.prototype.childIndex_ = null;
goog.ui.Component.prototype.wasDecorated_ = false;
goog.ui.Component.prototype.getId = function() {
  return this.id_ || (this.id_ = this.idGenerator_.getNextUniqueId());
};
goog.ui.Component.prototype.setId = function(id) {
  if (this.parent_ && this.parent_.childIndex_) {
    goog.object.remove(this.parent_.childIndex_, this.id_);
    goog.object.add(this.parent_.childIndex_, id, this);
  }
  this.id_ = id;
};
goog.ui.Component.prototype.getElement = function() {
  return this.element_;
};
goog.ui.Component.prototype.getElementStrict = function() {
  var el = this.element_;
  goog.asserts.assert(el, "Can not call getElementStrict before rendering/decorating.");
  return el;
};
goog.ui.Component.prototype.setElementInternal = function(element) {
  this.element_ = element;
};
goog.ui.Component.prototype.getElementsByClass = function(className) {
  return this.element_ ? this.dom_.getElementsByClass(className, this.element_) : [];
};
goog.ui.Component.prototype.getElementByClass = function(className) {
  return this.element_ ? this.dom_.getElementByClass(className, this.element_) : null;
};
goog.ui.Component.prototype.getRequiredElementByClass = function(className) {
  var el = this.getElementByClass(className);
  goog.asserts.assert(el, "Expected element in component with class: %s", className);
  return el;
};
goog.ui.Component.prototype.getHandler = function() {
  if (!this.googUiComponentHandler_) {
    this.googUiComponentHandler_ = new goog.events.EventHandler(this);
  }
  return this.googUiComponentHandler_;
};
goog.ui.Component.prototype.setParent = function(parent) {
  if (this == parent) {
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }
  if (parent && (this.parent_ && (this.id_ && (this.parent_.getChild(this.id_) && this.parent_ != parent)))) {
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }
  this.parent_ = parent;
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent);
};
goog.ui.Component.prototype.getParent = function() {
  return this.parent_;
};
goog.ui.Component.prototype.setParentEventTarget = function(parent) {
  if (this.parent_ && this.parent_ != parent) {
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED);
  }
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent);
};
goog.ui.Component.prototype.getDomHelper = function() {
  return this.dom_;
};
goog.ui.Component.prototype.isInDocument = function() {
  return this.inDocument_;
};
goog.ui.Component.prototype.createDom = function() {
  this.element_ = this.dom_.createElement("div");
};
goog.ui.Component.prototype.render = function(opt_parentElement) {
  this.render_(opt_parentElement);
};
goog.ui.Component.prototype.renderBefore = function(sibling) {
  this.render_((sibling.parentNode), sibling);
};
goog.ui.Component.prototype.render_ = function(opt_parentElement, opt_beforeNode) {
  if (this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if (!this.element_) {
    this.createDom();
  }
  if (opt_parentElement) {
    opt_parentElement.insertBefore(this.element_, opt_beforeNode || null);
  } else {
    this.dom_.getDocument().body.appendChild(this.element_);
  }
  if (!this.parent_ || this.parent_.isInDocument()) {
    this.enterDocument();
  }
};
goog.ui.Component.prototype.decorate = function(element) {
  if (this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  } else {
    if (element && this.canDecorate(element)) {
      this.wasDecorated_ = true;
      var doc = goog.dom.getOwnerDocument(element);
      if (!this.dom_ || this.dom_.getDocument() != doc) {
        this.dom_ = goog.dom.getDomHelper(element);
      }
      this.decorateInternal(element);
      if (!goog.ui.Component.ALLOW_DETACHED_DECORATION || goog.dom.contains(doc, element)) {
        this.enterDocument();
      }
    } else {
      throw Error(goog.ui.Component.Error.DECORATE_INVALID);
    }
  }
};
goog.ui.Component.prototype.canDecorate = function(element) {
  return true;
};
goog.ui.Component.prototype.wasDecorated = function() {
  return this.wasDecorated_;
};
goog.ui.Component.prototype.decorateInternal = function(element) {
  this.element_ = element;
};
goog.ui.Component.prototype.enterDocument = function() {
  this.inDocument_ = true;
  this.forEachChild(function(child) {
    if (!child.isInDocument() && child.getElement()) {
      child.enterDocument();
    }
  });
};
goog.ui.Component.prototype.exitDocument = function() {
  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      child.exitDocument();
    }
  });
  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.removeAll();
  }
  this.inDocument_ = false;
};
goog.ui.Component.prototype.disposeInternal = function() {
  if (this.inDocument_) {
    this.exitDocument();
  }
  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.dispose();
    delete this.googUiComponentHandler_;
  }
  this.forEachChild(function(child) {
    child.dispose();
  });
  if (!this.wasDecorated_ && this.element_) {
    goog.dom.removeNode(this.element_);
  }
  this.children_ = null;
  this.childIndex_ = null;
  this.element_ = null;
  this.model_ = null;
  this.parent_ = null;
  goog.ui.Component.superClass_.disposeInternal.call(this);
};
goog.ui.Component.prototype.makeId = function(idFragment) {
  return this.getId() + "." + idFragment;
};
goog.ui.Component.prototype.makeIds = function(object) {
  var ids = {};
  for (var key in object) {
    ids[key] = this.makeId(object[key]);
  }
  return ids;
};
goog.ui.Component.prototype.getModel = function() {
  return this.model_;
};
goog.ui.Component.prototype.setModel = function(obj) {
  this.model_ = obj;
};
goog.ui.Component.prototype.getFragmentFromId = function(id) {
  return id.substring(this.getId().length + 1);
};
goog.ui.Component.prototype.getElementByFragment = function(idFragment) {
  if (!this.inDocument_) {
    throw Error(goog.ui.Component.Error.NOT_IN_DOCUMENT);
  }
  return this.dom_.getElement(this.makeId(idFragment));
};
goog.ui.Component.prototype.addChild = function(child, opt_render) {
  this.addChildAt(child, this.getChildCount(), opt_render);
};
goog.ui.Component.prototype.addChildAt = function(child, index, opt_render) {
  goog.asserts.assert(!!child, "Provided element must not be null.");
  if (child.inDocument_ && (opt_render || !this.inDocument_)) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if (index < 0 || index > this.getChildCount()) {
    throw Error(goog.ui.Component.Error.CHILD_INDEX_OUT_OF_BOUNDS);
  }
  if (!this.childIndex_ || !this.children_) {
    this.childIndex_ = {};
    this.children_ = [];
  }
  if (child.getParent() == this) {
    goog.object.set(this.childIndex_, child.getId(), child);
    goog.array.remove(this.children_, child);
  } else {
    goog.object.add(this.childIndex_, child.getId(), child);
  }
  child.setParent(this);
  goog.array.insertAt(this.children_, child, index);
  if (child.inDocument_ && (this.inDocument_ && child.getParent() == this)) {
    var contentElement = this.getContentElement();
    contentElement.insertBefore(child.getElement(), contentElement.childNodes[index] || null);
  } else {
    if (opt_render) {
      if (!this.element_) {
        this.createDom();
      }
      var sibling = this.getChildAt(index + 1);
      child.render_(this.getContentElement(), sibling ? sibling.element_ : null);
    } else {
      if (this.inDocument_ && (!child.inDocument_ && (child.element_ && (child.element_.parentNode && child.element_.parentNode.nodeType == goog.dom.NodeType.ELEMENT)))) {
        child.enterDocument();
      }
    }
  }
};
goog.ui.Component.prototype.getContentElement = function() {
  return this.element_;
};
goog.ui.Component.prototype.isRightToLeft = function() {
  if (this.rightToLeft_ == null) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.inDocument_ ? this.element_ : this.dom_.getDocument().body);
  }
  return(this.rightToLeft_);
};
goog.ui.Component.prototype.setRightToLeft = function(rightToLeft) {
  if (this.inDocument_) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.rightToLeft_ = rightToLeft;
};
goog.ui.Component.prototype.hasChildren = function() {
  return!!this.children_ && this.children_.length != 0;
};
goog.ui.Component.prototype.getChildCount = function() {
  return this.children_ ? this.children_.length : 0;
};
goog.ui.Component.prototype.getChildIds = function() {
  var ids = [];
  this.forEachChild(function(child) {
    ids.push(child.getId());
  });
  return ids;
};
goog.ui.Component.prototype.getChild = function(id) {
  return this.childIndex_ && id ? (goog.object.get(this.childIndex_, id)) || null : null;
};
goog.ui.Component.prototype.getChildAt = function(index) {
  return this.children_ ? this.children_[index] || null : null;
};
goog.ui.Component.prototype.forEachChild = function(f, opt_obj) {
  if (this.children_) {
    goog.array.forEach(this.children_, f, opt_obj);
  }
};
goog.ui.Component.prototype.indexOfChild = function(child) {
  return this.children_ && child ? goog.array.indexOf(this.children_, child) : -1;
};
goog.ui.Component.prototype.removeChild = function(child, opt_unrender) {
  if (child) {
    var id = goog.isString(child) ? child : child.getId();
    child = this.getChild(id);
    if (id && child) {
      goog.object.remove(this.childIndex_, id);
      goog.array.remove(this.children_, child);
      if (opt_unrender) {
        child.exitDocument();
        if (child.element_) {
          goog.dom.removeNode(child.element_);
        }
      }
      child.setParent(null);
    }
  }
  if (!child) {
    throw Error(goog.ui.Component.Error.NOT_OUR_CHILD);
  }
  return(child);
};
goog.ui.Component.prototype.removeChildAt = function(index, opt_unrender) {
  return this.removeChild(this.getChildAt(index), opt_unrender);
};
goog.ui.Component.prototype.removeChildren = function(opt_unrender) {
  var removedChildren = [];
  while (this.hasChildren()) {
    removedChildren.push(this.removeChildAt(0, opt_unrender));
  }
  return removedChildren;
};
goog.provide("goog.a11y.aria.AutoCompleteValues");
goog.provide("goog.a11y.aria.CheckedValues");
goog.provide("goog.a11y.aria.DropEffectValues");
goog.provide("goog.a11y.aria.ExpandedValues");
goog.provide("goog.a11y.aria.GrabbedValues");
goog.provide("goog.a11y.aria.InvalidValues");
goog.provide("goog.a11y.aria.LivePriority");
goog.provide("goog.a11y.aria.OrientationValues");
goog.provide("goog.a11y.aria.PressedValues");
goog.provide("goog.a11y.aria.RelevantValues");
goog.provide("goog.a11y.aria.SelectedValues");
goog.provide("goog.a11y.aria.SortValues");
goog.provide("goog.a11y.aria.State");
goog.a11y.aria.State = {ACTIVEDESCENDANT:"activedescendant", ATOMIC:"atomic", AUTOCOMPLETE:"autocomplete", BUSY:"busy", CHECKED:"checked", CONTROLS:"controls", DESCRIBEDBY:"describedby", DISABLED:"disabled", DROPEFFECT:"dropeffect", EXPANDED:"expanded", FLOWTO:"flowto", GRABBED:"grabbed", HASPOPUP:"haspopup", HIDDEN:"hidden", INVALID:"invalid", LABEL:"label", LABELLEDBY:"labelledby", LEVEL:"level", LIVE:"live", MULTILINE:"multiline", MULTISELECTABLE:"multiselectable", ORIENTATION:"orientation", OWNS:"owns", 
POSINSET:"posinset", PRESSED:"pressed", READONLY:"readonly", RELEVANT:"relevant", REQUIRED:"required", SELECTED:"selected", SETSIZE:"setsize", SORT:"sort", VALUEMAX:"valuemax", VALUEMIN:"valuemin", VALUENOW:"valuenow", VALUETEXT:"valuetext"};
goog.a11y.aria.AutoCompleteValues = {INLINE:"inline", LIST:"list", BOTH:"both", NONE:"none"};
goog.a11y.aria.DropEffectValues = {COPY:"copy", MOVE:"move", LINK:"link", EXECUTE:"execute", POPUP:"popup", NONE:"none"};
goog.a11y.aria.LivePriority = {OFF:"off", POLITE:"polite", ASSERTIVE:"assertive"};
goog.a11y.aria.OrientationValues = {VERTICAL:"vertical", HORIZONTAL:"horizontal"};
goog.a11y.aria.RelevantValues = {ADDITIONS:"additions", REMOVALS:"removals", TEXT:"text", ALL:"all"};
goog.a11y.aria.SortValues = {ASCENDING:"ascending", DESCENDING:"descending", NONE:"none", OTHER:"other"};
goog.a11y.aria.CheckedValues = {TRUE:"true", FALSE:"false", MIXED:"mixed", UNDEFINED:"undefined"};
goog.a11y.aria.ExpandedValues = {TRUE:"true", FALSE:"false", UNDEFINED:"undefined"};
goog.a11y.aria.GrabbedValues = {TRUE:"true", FALSE:"false", UNDEFINED:"undefined"};
goog.a11y.aria.InvalidValues = {FALSE:"false", TRUE:"true", GRAMMAR:"grammar", SPELLING:"spelling"};
goog.a11y.aria.PressedValues = {TRUE:"true", FALSE:"false", MIXED:"mixed", UNDEFINED:"undefined"};
goog.a11y.aria.SelectedValues = {TRUE:"true", FALSE:"false", UNDEFINED:"undefined"};
goog.provide("goog.a11y.aria.datatables");
goog.require("goog.a11y.aria.State");
goog.require("goog.object");
goog.a11y.aria.DefaultStateValueMap_;
goog.a11y.aria.datatables.getDefaultValuesMap = function() {
  if (!goog.a11y.aria.DefaultStateValueMap_) {
    goog.a11y.aria.DefaultStateValueMap_ = goog.object.create(goog.a11y.aria.State.ATOMIC, false, goog.a11y.aria.State.AUTOCOMPLETE, "none", goog.a11y.aria.State.DROPEFFECT, "none", goog.a11y.aria.State.HASPOPUP, false, goog.a11y.aria.State.LIVE, "off", goog.a11y.aria.State.MULTILINE, false, goog.a11y.aria.State.MULTISELECTABLE, false, goog.a11y.aria.State.ORIENTATION, "vertical", goog.a11y.aria.State.READONLY, false, goog.a11y.aria.State.RELEVANT, "additions text", goog.a11y.aria.State.REQUIRED, 
    false, goog.a11y.aria.State.SORT, "none", goog.a11y.aria.State.BUSY, false, goog.a11y.aria.State.DISABLED, false, goog.a11y.aria.State.HIDDEN, false, goog.a11y.aria.State.INVALID, "false");
  }
  return goog.a11y.aria.DefaultStateValueMap_;
};
goog.provide("goog.a11y.aria.Role");
goog.a11y.aria.Role = {ALERT:"alert", ALERTDIALOG:"alertdialog", APPLICATION:"application", ARTICLE:"article", BANNER:"banner", BUTTON:"button", CHECKBOX:"checkbox", COLUMNHEADER:"columnheader", COMBOBOX:"combobox", COMPLEMENTARY:"complementary", CONTENTINFO:"contentinfo", DEFINITION:"definition", DIALOG:"dialog", DIRECTORY:"directory", DOCUMENT:"document", FORM:"form", GRID:"grid", GRIDCELL:"gridcell", GROUP:"group", HEADING:"heading", IMG:"img", LINK:"link", LIST:"list", LISTBOX:"listbox", LISTITEM:"listitem", 
LOG:"log", MAIN:"main", MARQUEE:"marquee", MATH:"math", MENU:"menu", MENUBAR:"menubar", MENU_ITEM:"menuitem", MENU_ITEM_CHECKBOX:"menuitemcheckbox", MENU_ITEM_RADIO:"menuitemradio", NAVIGATION:"navigation", NOTE:"note", OPTION:"option", PRESENTATION:"presentation", PROGRESSBAR:"progressbar", RADIO:"radio", RADIOGROUP:"radiogroup", REGION:"region", ROW:"row", ROWGROUP:"rowgroup", ROWHEADER:"rowheader", SCROLLBAR:"scrollbar", SEARCH:"search", SEPARATOR:"separator", SLIDER:"slider", SPINBUTTON:"spinbutton", 
STATUS:"status", TAB:"tab", TAB_LIST:"tablist", TAB_PANEL:"tabpanel", TEXTBOX:"textbox", TIMER:"timer", TOOLBAR:"toolbar", TOOLTIP:"tooltip", TREE:"tree", TREEGRID:"treegrid", TREEITEM:"treeitem"};
goog.provide("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.a11y.aria.State");
goog.require("goog.a11y.aria.datatables");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.TagName");
goog.require("goog.object");
goog.a11y.aria.ARIA_PREFIX_ = "aria-";
goog.a11y.aria.ROLE_ATTRIBUTE_ = "role";
goog.a11y.aria.TAGS_WITH_ASSUMED_ROLES_ = [goog.dom.TagName.A, goog.dom.TagName.AREA, goog.dom.TagName.BUTTON, goog.dom.TagName.HEAD, goog.dom.TagName.INPUT, goog.dom.TagName.LINK, goog.dom.TagName.MENU, goog.dom.TagName.META, goog.dom.TagName.OPTGROUP, goog.dom.TagName.OPTION, goog.dom.TagName.PROGRESS, goog.dom.TagName.STYLE, goog.dom.TagName.SELECT, goog.dom.TagName.SOURCE, goog.dom.TagName.TEXTAREA, goog.dom.TagName.TITLE, goog.dom.TagName.TRACK];
goog.a11y.aria.setRole = function(element, roleName) {
  if (!roleName) {
    goog.a11y.aria.removeRole(element);
  } else {
    if (goog.asserts.ENABLE_ASSERTS) {
      goog.asserts.assert(goog.object.containsValue(goog.a11y.aria.Role, roleName), "No such ARIA role " + roleName);
    }
    element.setAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_, roleName);
  }
};
goog.a11y.aria.getRole = function(element) {
  var role = element.getAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_);
  return(role) || null;
};
goog.a11y.aria.removeRole = function(element) {
  element.removeAttribute(goog.a11y.aria.ROLE_ATTRIBUTE_);
};
goog.a11y.aria.setState = function(element, stateName, value) {
  if (goog.isArrayLike(value)) {
    var array = (value);
    value = array.join(" ");
  }
  var attrStateName = goog.a11y.aria.getAriaAttributeName_(stateName);
  if (value === "" || value == undefined) {
    var defaultValueMap = goog.a11y.aria.datatables.getDefaultValuesMap();
    if (stateName in defaultValueMap) {
      element.setAttribute(attrStateName, defaultValueMap[stateName]);
    } else {
      element.removeAttribute(attrStateName);
    }
  } else {
    element.setAttribute(attrStateName, value);
  }
};
goog.a11y.aria.removeState = function(element, stateName) {
  element.removeAttribute(goog.a11y.aria.getAriaAttributeName_(stateName));
};
goog.a11y.aria.getState = function(element, stateName) {
  var attr = (element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName)));
  var isNullOrUndefined = attr == null || attr == undefined;
  return isNullOrUndefined ? "" : String(attr);
};
goog.a11y.aria.getActiveDescendant = function(element) {
  var id = goog.a11y.aria.getState(element, goog.a11y.aria.State.ACTIVEDESCENDANT);
  return goog.dom.getOwnerDocument(element).getElementById(id);
};
goog.a11y.aria.setActiveDescendant = function(element, activeElement) {
  var id = "";
  if (activeElement) {
    id = activeElement.id;
    goog.asserts.assert(id, "The active element should have an id.");
  }
  goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, id);
};
goog.a11y.aria.getLabel = function(element) {
  return goog.a11y.aria.getState(element, goog.a11y.aria.State.LABEL);
};
goog.a11y.aria.setLabel = function(element, label) {
  goog.a11y.aria.setState(element, goog.a11y.aria.State.LABEL, label);
};
goog.a11y.aria.assertRoleIsSetInternalUtil = function(element, allowedRoles) {
  if (goog.array.contains(goog.a11y.aria.TAGS_WITH_ASSUMED_ROLES_, element.tagName)) {
    return;
  }
  var elementRole = (goog.a11y.aria.getRole(element));
  goog.asserts.assert(elementRole != null, "The element ARIA role cannot be null.");
  goog.asserts.assert(goog.array.contains(allowedRoles, elementRole), "Non existing or incorrect role set for element." + 'The role set is "' + elementRole + '". The role should be any of "' + allowedRoles + '". Check the ARIA specification for more details ' + "http://www.w3.org/TR/wai-aria/roles.");
};
goog.a11y.aria.getStateBoolean = function(element, stateName) {
  var attr = (element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName)));
  goog.asserts.assert(goog.isBoolean(attr) || (attr == null || (attr == "true" || attr == "false")));
  if (attr == null) {
    return attr;
  }
  return goog.isBoolean(attr) ? attr : attr == "true";
};
goog.a11y.aria.getStateNumber = function(element, stateName) {
  var attr = (element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName)));
  goog.asserts.assert((attr == null || !isNaN(Number(attr))) && !goog.isBoolean(attr));
  return attr == null ? null : Number(attr);
};
goog.a11y.aria.getStateString = function(element, stateName) {
  var attr = element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName));
  goog.asserts.assert((attr == null || goog.isString(attr)) && (isNaN(Number(attr)) && (attr != "true" && attr != "false")));
  return attr == null ? null : attr;
};
goog.a11y.aria.getStringArrayStateInternalUtil = function(element, stateName) {
  var attrValue = element.getAttribute(goog.a11y.aria.getAriaAttributeName_(stateName));
  return goog.a11y.aria.splitStringOnWhitespace_(attrValue);
};
goog.a11y.aria.splitStringOnWhitespace_ = function(stringValue) {
  return stringValue ? stringValue.split(/\s+/) : [];
};
goog.a11y.aria.getAriaAttributeName_ = function(ariaName) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.assert(ariaName, "ARIA attribute cannot be empty.");
    goog.asserts.assert(goog.object.containsValue(goog.a11y.aria.State, ariaName), "No such ARIA attribute " + ariaName);
  }
  return goog.a11y.aria.ARIA_PREFIX_ + ariaName;
};
goog.provide("goog.ui.ControlRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.classes");
goog.require("goog.object");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.userAgent");
goog.ui.ControlRenderer = function() {
};
goog.addSingletonGetter(goog.ui.ControlRenderer);
goog.ui.ControlRenderer.getCustomRenderer = function(ctor, cssClassName) {
  var renderer = new ctor;
  renderer.getCssClass = function() {
    return cssClassName;
  };
  return renderer;
};
goog.ui.ControlRenderer.CSS_CLASS = goog.getCssName("goog-control");
goog.ui.ControlRenderer.IE6_CLASS_COMBINATIONS = [];
goog.ui.ControlRenderer.ARIA_STATE_MAP_;
goog.ui.ControlRenderer.prototype.getAriaRole = function() {
  return undefined;
};
goog.ui.ControlRenderer.prototype.createDom = function(control) {
  var element = control.getDomHelper().createDom("div", this.getClassNames(control).join(" "), control.getContent());
  this.setAriaStates(control, element);
  return element;
};
goog.ui.ControlRenderer.prototype.getContentElement = function(element) {
  return element;
};
goog.ui.ControlRenderer.prototype.enableClassName = function(control, className, enable) {
  var element = (control.getElement ? control.getElement() : control);
  if (element) {
    if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("7")) {
      var combinedClasses = this.getAppliedCombinedClassNames_(goog.dom.classes.get(element), className);
      combinedClasses.push(className);
      var f = enable ? goog.dom.classes.add : goog.dom.classes.remove;
      goog.partial(f, element).apply(null, combinedClasses);
    } else {
      goog.dom.classes.enable(element, className, enable);
    }
  }
};
goog.ui.ControlRenderer.prototype.enableExtraClassName = function(control, className, enable) {
  this.enableClassName(control, className, enable);
};
goog.ui.ControlRenderer.prototype.canDecorate = function(element) {
  return true;
};
goog.ui.ControlRenderer.prototype.decorate = function(control, element) {
  if (element.id) {
    control.setId(element.id);
  }
  var contentElem = this.getContentElement(element);
  if (contentElem && contentElem.firstChild) {
    control.setContentInternal(contentElem.firstChild.nextSibling ? goog.array.clone(contentElem.childNodes) : contentElem.firstChild);
  } else {
    control.setContentInternal(null);
  }
  var state = 0;
  var rendererClassName = this.getCssClass();
  var structuralClassName = this.getStructuralCssClass();
  var hasRendererClassName = false;
  var hasStructuralClassName = false;
  var hasCombinedClassName = false;
  var classNames = goog.dom.classes.get(element);
  goog.array.forEach(classNames, function(className) {
    if (!hasRendererClassName && className == rendererClassName) {
      hasRendererClassName = true;
      if (structuralClassName == rendererClassName) {
        hasStructuralClassName = true;
      }
    } else {
      if (!hasStructuralClassName && className == structuralClassName) {
        hasStructuralClassName = true;
      } else {
        state |= this.getStateFromClass(className);
      }
    }
  }, this);
  control.setStateInternal(state);
  if (!hasRendererClassName) {
    classNames.push(rendererClassName);
    if (structuralClassName == rendererClassName) {
      hasStructuralClassName = true;
    }
  }
  if (!hasStructuralClassName) {
    classNames.push(structuralClassName);
  }
  var extraClassNames = control.getExtraClassNames();
  if (extraClassNames) {
    classNames.push.apply(classNames, extraClassNames);
  }
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("7")) {
    var combinedClasses = this.getAppliedCombinedClassNames_(classNames);
    if (combinedClasses.length > 0) {
      classNames.push.apply(classNames, combinedClasses);
      hasCombinedClassName = true;
    }
  }
  if (!hasRendererClassName || (!hasStructuralClassName || (extraClassNames || hasCombinedClassName))) {
    goog.dom.classes.set(element, classNames.join(" "));
  }
  this.setAriaStates(control, element);
  return element;
};
goog.ui.ControlRenderer.prototype.initializeDom = function(control) {
  if (control.isRightToLeft()) {
    this.setRightToLeft(control.getElement(), true);
  }
  if (control.isEnabled()) {
    this.setFocusable(control, control.isVisible());
  }
};
goog.ui.ControlRenderer.prototype.setAriaRole = function(element, opt_preferredRole) {
  var ariaRole = opt_preferredRole || this.getAriaRole();
  if (ariaRole) {
    goog.asserts.assert(element, "The element passed as a first parameter cannot be null.");
    goog.a11y.aria.setRole(element, ariaRole);
  }
};
goog.ui.ControlRenderer.prototype.setAriaStates = function(control, element) {
  goog.asserts.assert(control);
  goog.asserts.assert(element);
  if (!control.isVisible()) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.HIDDEN, !control.isVisible());
  }
  if (!control.isEnabled()) {
    this.updateAriaState(element, goog.ui.Component.State.DISABLED, !control.isEnabled());
  }
  if (control.isSupportedState(goog.ui.Component.State.SELECTED)) {
    this.updateAriaState(element, goog.ui.Component.State.SELECTED, control.isSelected());
  }
  if (control.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED, control.isChecked());
  }
  if (control.isSupportedState(goog.ui.Component.State.OPENED)) {
    this.updateAriaState(element, goog.ui.Component.State.OPENED, control.isOpen());
  }
};
goog.ui.ControlRenderer.prototype.setAllowTextSelection = function(element, allow) {
  goog.style.setUnselectable(element, !allow, !goog.userAgent.IE && !goog.userAgent.OPERA);
};
goog.ui.ControlRenderer.prototype.setRightToLeft = function(element, rightToLeft) {
  this.enableClassName(element, goog.getCssName(this.getStructuralCssClass(), "rtl"), rightToLeft);
};
goog.ui.ControlRenderer.prototype.isFocusable = function(control) {
  var keyTarget;
  if (control.isSupportedState(goog.ui.Component.State.FOCUSED) && (keyTarget = control.getKeyEventTarget())) {
    return goog.dom.isFocusableTabIndex(keyTarget);
  }
  return false;
};
goog.ui.ControlRenderer.prototype.setFocusable = function(control, focusable) {
  var keyTarget;
  if (control.isSupportedState(goog.ui.Component.State.FOCUSED) && (keyTarget = control.getKeyEventTarget())) {
    if (!focusable && control.isFocused()) {
      try {
        keyTarget.blur();
      } catch (e) {
      }
      if (control.isFocused()) {
        control.handleBlur(null);
      }
    }
    if (goog.dom.isFocusableTabIndex(keyTarget) != focusable) {
      goog.dom.setFocusableTabIndex(keyTarget, focusable);
    }
  }
};
goog.ui.ControlRenderer.prototype.setVisible = function(element, visible) {
  goog.style.setElementShown(element, visible);
  if (element) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.HIDDEN, !visible);
  }
};
goog.ui.ControlRenderer.prototype.setState = function(control, state, enable) {
  var element = control.getElement();
  if (element) {
    var className = this.getClassForState(state);
    if (className) {
      this.enableClassName(control, className, enable);
    }
    this.updateAriaState(element, state, enable);
  }
};
goog.ui.ControlRenderer.prototype.updateAriaState = function(element, state, enable) {
  if (!goog.ui.ControlRenderer.ARIA_STATE_MAP_) {
    goog.ui.ControlRenderer.ARIA_STATE_MAP_ = goog.object.create(goog.ui.Component.State.DISABLED, goog.a11y.aria.State.DISABLED, goog.ui.Component.State.SELECTED, goog.a11y.aria.State.SELECTED, goog.ui.Component.State.CHECKED, goog.a11y.aria.State.CHECKED, goog.ui.Component.State.OPENED, goog.a11y.aria.State.EXPANDED);
  }
  var ariaState = goog.ui.ControlRenderer.ARIA_STATE_MAP_[state];
  if (ariaState) {
    goog.asserts.assert(element, "The element passed as a first parameter cannot be null.");
    goog.a11y.aria.setState(element, ariaState, enable);
  }
};
goog.ui.ControlRenderer.prototype.setContent = function(element, content) {
  var contentElem = this.getContentElement(element);
  if (contentElem) {
    goog.dom.removeChildren(contentElem);
    if (content) {
      if (goog.isString(content)) {
        goog.dom.setTextContent(contentElem, content);
      } else {
        var childHandler = function(child) {
          if (child) {
            var doc = goog.dom.getOwnerDocument(contentElem);
            contentElem.appendChild(goog.isString(child) ? doc.createTextNode(child) : child);
          }
        };
        if (goog.isArray(content)) {
          goog.array.forEach(content, childHandler);
        } else {
          if (goog.isArrayLike(content) && !("nodeType" in content)) {
            goog.array.forEach(goog.array.clone((content)), childHandler);
          } else {
            childHandler(content);
          }
        }
      }
    }
  }
};
goog.ui.ControlRenderer.prototype.getKeyEventTarget = function(control) {
  return control.getElement();
};
goog.ui.ControlRenderer.prototype.getCssClass = function() {
  return goog.ui.ControlRenderer.CSS_CLASS;
};
goog.ui.ControlRenderer.prototype.getIe6ClassCombinations = function() {
  return[];
};
goog.ui.ControlRenderer.prototype.getStructuralCssClass = function() {
  return this.getCssClass();
};
goog.ui.ControlRenderer.prototype.getClassNames = function(control) {
  var cssClass = this.getCssClass();
  var classNames = [cssClass];
  var structuralCssClass = this.getStructuralCssClass();
  if (structuralCssClass != cssClass) {
    classNames.push(structuralCssClass);
  }
  var classNamesForState = this.getClassNamesForState(control.getState());
  classNames.push.apply(classNames, classNamesForState);
  var extraClassNames = control.getExtraClassNames();
  if (extraClassNames) {
    classNames.push.apply(classNames, extraClassNames);
  }
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("7")) {
    classNames.push.apply(classNames, this.getAppliedCombinedClassNames_(classNames));
  }
  return classNames;
};
goog.ui.ControlRenderer.prototype.getAppliedCombinedClassNames_ = function(classes, opt_includedClass) {
  var toAdd = [];
  if (opt_includedClass) {
    classes = classes.concat([opt_includedClass]);
  }
  goog.array.forEach(this.getIe6ClassCombinations(), function(combo) {
    if (goog.array.every(combo, goog.partial(goog.array.contains, classes)) && (!opt_includedClass || goog.array.contains(combo, opt_includedClass))) {
      toAdd.push(combo.join("_"));
    }
  });
  return toAdd;
};
goog.ui.ControlRenderer.prototype.getClassNamesForState = function(state) {
  var classNames = [];
  while (state) {
    var mask = state & -state;
    classNames.push(this.getClassForState((mask)));
    state &= ~mask;
  }
  return classNames;
};
goog.ui.ControlRenderer.prototype.getClassForState = function(state) {
  if (!this.classByState_) {
    this.createClassByStateMap_();
  }
  return this.classByState_[state];
};
goog.ui.ControlRenderer.prototype.getStateFromClass = function(className) {
  if (!this.stateByClass_) {
    this.createStateByClassMap_();
  }
  var state = parseInt(this.stateByClass_[className], 10);
  return(isNaN(state) ? 0 : state);
};
goog.ui.ControlRenderer.prototype.createClassByStateMap_ = function() {
  var baseClass = this.getStructuralCssClass();
  this.classByState_ = goog.object.create(goog.ui.Component.State.DISABLED, goog.getCssName(baseClass, "disabled"), goog.ui.Component.State.HOVER, goog.getCssName(baseClass, "hover"), goog.ui.Component.State.ACTIVE, goog.getCssName(baseClass, "active"), goog.ui.Component.State.SELECTED, goog.getCssName(baseClass, "selected"), goog.ui.Component.State.CHECKED, goog.getCssName(baseClass, "checked"), goog.ui.Component.State.FOCUSED, goog.getCssName(baseClass, "focused"), goog.ui.Component.State.OPENED, 
  goog.getCssName(baseClass, "open"));
};
goog.ui.ControlRenderer.prototype.createStateByClassMap_ = function() {
  if (!this.classByState_) {
    this.createClassByStateMap_();
  }
  this.stateByClass_ = goog.object.transpose(this.classByState_);
};
goog.provide("pear.ui.CellRenderer");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlRenderer");
pear.ui.CellRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.ui.CellRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.ui.CellRenderer);
pear.ui.CellRenderer.CSS_CLASS = goog.getCssName("pear-grid-cell");
pear.ui.CellRenderer.prototype.getCssClass = function() {
  return pear.ui.CellRenderer.CSS_CLASS;
};
pear.ui.CellRenderer.prototype.createDom = function(cellControl) {
  var element = cellControl.getDomHelper().createDom("div", this.getClassNames(cellControl).join(" "), cellControl.getContent());
  this.setAriaStates(cellControl, element);
  return element;
};
goog.provide("pear.ui.HeaderCellContentRenderer");
goog.require("pear.ui.CellRenderer");
pear.ui.HeaderCellContentRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.HeaderCellContentRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.HeaderCellContentRenderer);
pear.ui.HeaderCellContentRenderer.CSS_CLASS = goog.getCssName("pear-grid-cell-header-content");
pear.ui.HeaderCellContentRenderer.prototype.getCssClass = function() {
  return pear.ui.HeaderCellContentRenderer.CSS_CLASS;
};
goog.provide("goog.style.bidi");
goog.require("goog.dom");
goog.require("goog.style");
goog.require("goog.userAgent");
goog.style.bidi.getScrollLeft = function(element) {
  var isRtl = goog.style.isRightToLeft(element);
  if (isRtl && goog.userAgent.GECKO) {
    return-element.scrollLeft;
  } else {
    if (isRtl && !(goog.userAgent.IE && goog.userAgent.isVersionOrHigher("8"))) {
      var overflowX = goog.style.getComputedOverflowX(element);
      if (overflowX == "visible") {
        return element.scrollLeft;
      } else {
        return element.scrollWidth - element.clientWidth - element.scrollLeft;
      }
    }
  }
  return element.scrollLeft;
};
goog.style.bidi.getOffsetStart = function(element) {
  var offsetLeftForReal = element.offsetLeft;
  var bestParent = element.offsetParent;
  if (!bestParent && goog.style.getComputedPosition(element) == "fixed") {
    bestParent = goog.dom.getOwnerDocument(element).documentElement;
  }
  if (!bestParent) {
    return offsetLeftForReal;
  }
  if (goog.userAgent.GECKO) {
    var borderWidths = goog.style.getBorderBox(bestParent);
    offsetLeftForReal += borderWidths.left;
  } else {
    if (goog.userAgent.isDocumentModeOrHigher(8)) {
      var borderWidths = goog.style.getBorderBox(bestParent);
      offsetLeftForReal -= borderWidths.left;
    }
  }
  if (goog.style.isRightToLeft(bestParent)) {
    var elementRightOffset = offsetLeftForReal + element.offsetWidth;
    return bestParent.clientWidth - elementRightOffset;
  }
  return offsetLeftForReal;
};
goog.style.bidi.setScrollOffset = function(element, offsetStart) {
  offsetStart = Math.max(offsetStart, 0);
  if (!goog.style.isRightToLeft(element)) {
    element.scrollLeft = offsetStart;
  } else {
    if (goog.userAgent.GECKO) {
      element.scrollLeft = -offsetStart;
    } else {
      if (!(goog.userAgent.IE && goog.userAgent.isVersionOrHigher("8"))) {
        element.scrollLeft = element.scrollWidth - offsetStart - element.clientWidth;
      } else {
        element.scrollLeft = offsetStart;
      }
    }
  }
};
goog.style.bidi.setPosition = function(elem, left, top, isRtl) {
  if (!goog.isNull(top)) {
    elem.style.top = top + "px";
  }
  if (isRtl) {
    elem.style.right = left + "px";
    elem.style.left = "";
  } else {
    elem.style.left = left + "px";
    elem.style.right = "";
  }
};
goog.provide("goog.fx.DragEvent");
goog.provide("goog.fx.Dragger");
goog.provide("goog.fx.Dragger.EventType");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.style");
goog.require("goog.style.bidi");
goog.require("goog.userAgent");
goog.fx.Dragger = function(target, opt_handle, opt_limits) {
  goog.events.EventTarget.call(this);
  this.target = target;
  this.handle = opt_handle || target;
  this.limits = opt_limits || new goog.math.Rect(NaN, NaN, NaN, NaN);
  this.document_ = goog.dom.getOwnerDocument(target);
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);
  goog.events.listen(this.handle, [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN], this.startDrag, false, this);
};
goog.inherits(goog.fx.Dragger, goog.events.EventTarget);
goog.fx.Dragger.HAS_SET_CAPTURE_ = goog.userAgent.IE || goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9.3");
goog.fx.Dragger.cloneNode = function(sourceEl) {
  var clonedEl = (sourceEl.cloneNode(true)), origTexts = sourceEl.getElementsByTagName("textarea"), dragTexts = clonedEl.getElementsByTagName("textarea");
  for (var i = 0;i < origTexts.length;i++) {
    dragTexts[i].value = origTexts[i].value;
  }
  switch(sourceEl.tagName.toLowerCase()) {
    case "tr":
      return goog.dom.createDom("table", null, goog.dom.createDom("tbody", null, clonedEl));
    case "td":
    ;
    case "th":
      return goog.dom.createDom("table", null, goog.dom.createDom("tbody", null, goog.dom.createDom("tr", null, clonedEl)));
    case "textarea":
      clonedEl.value = sourceEl.value;
    default:
      return clonedEl;
  }
};
goog.fx.Dragger.EventType = {EARLY_CANCEL:"earlycancel", START:"start", BEFOREDRAG:"beforedrag", DRAG:"drag", END:"end"};
goog.fx.Dragger.prototype.target;
goog.fx.Dragger.prototype.handle;
goog.fx.Dragger.prototype.limits;
goog.fx.Dragger.prototype.rightToLeft_;
goog.fx.Dragger.prototype.clientX = 0;
goog.fx.Dragger.prototype.clientY = 0;
goog.fx.Dragger.prototype.screenX = 0;
goog.fx.Dragger.prototype.screenY = 0;
goog.fx.Dragger.prototype.startX = 0;
goog.fx.Dragger.prototype.startY = 0;
goog.fx.Dragger.prototype.deltaX = 0;
goog.fx.Dragger.prototype.deltaY = 0;
goog.fx.Dragger.prototype.pageScroll;
goog.fx.Dragger.prototype.enabled_ = true;
goog.fx.Dragger.prototype.dragging_ = false;
goog.fx.Dragger.prototype.hysteresisDistanceSquared_ = 0;
goog.fx.Dragger.prototype.mouseDownTime_ = 0;
goog.fx.Dragger.prototype.document_;
goog.fx.Dragger.prototype.scrollTarget_;
goog.fx.Dragger.prototype.ieDragStartCancellingOn_ = false;
goog.fx.Dragger.prototype.useRightPositioningForRtl_ = false;
goog.fx.Dragger.prototype.enableRightPositioningForRtl = function(useRightPositioningForRtl) {
  this.useRightPositioningForRtl_ = useRightPositioningForRtl;
};
goog.fx.Dragger.prototype.getHandler = function() {
  return this.eventHandler_;
};
goog.fx.Dragger.prototype.setLimits = function(limits) {
  this.limits = limits || new goog.math.Rect(NaN, NaN, NaN, NaN);
};
goog.fx.Dragger.prototype.setHysteresis = function(distance) {
  this.hysteresisDistanceSquared_ = Math.pow(distance, 2);
};
goog.fx.Dragger.prototype.getHysteresis = function() {
  return Math.sqrt(this.hysteresisDistanceSquared_);
};
goog.fx.Dragger.prototype.setScrollTarget = function(scrollTarget) {
  this.scrollTarget_ = scrollTarget;
};
goog.fx.Dragger.prototype.setCancelIeDragStart = function(cancelIeDragStart) {
  this.ieDragStartCancellingOn_ = cancelIeDragStart;
};
goog.fx.Dragger.prototype.getEnabled = function() {
  return this.enabled_;
};
goog.fx.Dragger.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
};
goog.fx.Dragger.prototype.disposeInternal = function() {
  goog.fx.Dragger.superClass_.disposeInternal.call(this);
  goog.events.unlisten(this.handle, [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN], this.startDrag, false, this);
  this.cleanUpAfterDragging_();
  this.target = null;
  this.handle = null;
};
goog.fx.Dragger.prototype.isRightToLeft_ = function() {
  if (!goog.isDef(this.rightToLeft_)) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.target);
  }
  return this.rightToLeft_;
};
goog.fx.Dragger.prototype.startDrag = function(e) {
  var isMouseDown = e.type == goog.events.EventType.MOUSEDOWN;
  if (this.enabled_ && (!this.dragging_ && (!isMouseDown || e.isMouseActionButton()))) {
    this.maybeReinitTouchEvent_(e);
    if (this.hysteresisDistanceSquared_ == 0) {
      if (this.fireDragStart_(e)) {
        this.dragging_ = true;
        e.preventDefault();
      } else {
        return;
      }
    } else {
      e.preventDefault();
    }
    this.setupDragHandlers();
    this.clientX = this.startX = e.clientX;
    this.clientY = this.startY = e.clientY;
    this.screenX = e.screenX;
    this.screenY = e.screenY;
    this.computeInitialPosition();
    this.pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
    this.mouseDownTime_ = goog.now();
  } else {
    this.dispatchEvent(goog.fx.Dragger.EventType.EARLY_CANCEL);
  }
};
goog.fx.Dragger.prototype.setupDragHandlers = function() {
  var doc = this.document_;
  var docEl = doc.documentElement;
  var useCapture = !goog.fx.Dragger.HAS_SET_CAPTURE_;
  this.eventHandler_.listen(doc, [goog.events.EventType.TOUCHMOVE, goog.events.EventType.MOUSEMOVE], this.handleMove_, useCapture);
  this.eventHandler_.listen(doc, [goog.events.EventType.TOUCHEND, goog.events.EventType.MOUSEUP], this.endDrag, useCapture);
  if (goog.fx.Dragger.HAS_SET_CAPTURE_) {
    docEl.setCapture(false);
    this.eventHandler_.listen(docEl, goog.events.EventType.LOSECAPTURE, this.endDrag);
  } else {
    this.eventHandler_.listen(goog.dom.getWindow(doc), goog.events.EventType.BLUR, this.endDrag);
  }
  if (goog.userAgent.IE && this.ieDragStartCancellingOn_) {
    this.eventHandler_.listen(doc, goog.events.EventType.DRAGSTART, goog.events.Event.preventDefault);
  }
  if (this.scrollTarget_) {
    this.eventHandler_.listen(this.scrollTarget_, goog.events.EventType.SCROLL, this.onScroll_, useCapture);
  }
};
goog.fx.Dragger.prototype.fireDragStart_ = function(e) {
  return this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.START, this, e.clientX, e.clientY, e));
};
goog.fx.Dragger.prototype.cleanUpAfterDragging_ = function() {
  this.eventHandler_.removeAll();
  if (goog.fx.Dragger.HAS_SET_CAPTURE_) {
    this.document_.releaseCapture();
  }
};
goog.fx.Dragger.prototype.endDrag = function(e, opt_dragCanceled) {
  this.cleanUpAfterDragging_();
  if (this.dragging_) {
    this.maybeReinitTouchEvent_(e);
    this.dragging_ = false;
    var x = this.limitX(this.deltaX);
    var y = this.limitY(this.deltaY);
    var dragCanceled = opt_dragCanceled || e.type == goog.events.EventType.TOUCHCANCEL;
    this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.END, this, e.clientX, e.clientY, e, x, y, dragCanceled));
  } else {
    this.dispatchEvent(goog.fx.Dragger.EventType.EARLY_CANCEL);
  }
};
goog.fx.Dragger.prototype.endDragCancel = function(e) {
  this.endDrag(e, true);
};
goog.fx.Dragger.prototype.maybeReinitTouchEvent_ = function(e) {
  var type = e.type;
  if (type == goog.events.EventType.TOUCHSTART || type == goog.events.EventType.TOUCHMOVE) {
    e.init(e.getBrowserEvent().targetTouches[0], e.currentTarget);
  } else {
    if (type == goog.events.EventType.TOUCHEND || type == goog.events.EventType.TOUCHCANCEL) {
      e.init(e.getBrowserEvent().changedTouches[0], e.currentTarget);
    }
  }
};
goog.fx.Dragger.prototype.handleMove_ = function(e) {
  if (this.enabled_) {
    this.maybeReinitTouchEvent_(e);
    var sign = this.useRightPositioningForRtl_ && this.isRightToLeft_() ? -1 : 1;
    var dx = sign * (e.clientX - this.clientX);
    var dy = e.clientY - this.clientY;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.screenX = e.screenX;
    this.screenY = e.screenY;
    if (!this.dragging_) {
      var diffX = this.startX - this.clientX;
      var diffY = this.startY - this.clientY;
      var distance = diffX * diffX + diffY * diffY;
      if (distance > this.hysteresisDistanceSquared_) {
        if (this.fireDragStart_(e)) {
          this.dragging_ = true;
        } else {
          if (!this.isDisposed()) {
            this.endDrag(e);
          }
          return;
        }
      }
    }
    var pos = this.calculatePosition_(dx, dy);
    var x = pos.x;
    var y = pos.y;
    if (this.dragging_) {
      var rv = this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.BEFOREDRAG, this, e.clientX, e.clientY, e, x, y));
      if (rv) {
        this.doDrag(e, x, y, false);
        e.preventDefault();
      }
    }
  }
};
goog.fx.Dragger.prototype.calculatePosition_ = function(dx, dy) {
  var pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
  dx += pageScroll.x - this.pageScroll.x;
  dy += pageScroll.y - this.pageScroll.y;
  this.pageScroll = pageScroll;
  this.deltaX += dx;
  this.deltaY += dy;
  var x = this.limitX(this.deltaX);
  var y = this.limitY(this.deltaY);
  return new goog.math.Coordinate(x, y);
};
goog.fx.Dragger.prototype.onScroll_ = function(e) {
  var pos = this.calculatePosition_(0, 0);
  e.clientX = this.clientX;
  e.clientY = this.clientY;
  this.doDrag(e, pos.x, pos.y, true);
};
goog.fx.Dragger.prototype.doDrag = function(e, x, y, dragFromScroll) {
  this.defaultAction(x, y);
  this.dispatchEvent(new goog.fx.DragEvent(goog.fx.Dragger.EventType.DRAG, this, e.clientX, e.clientY, e, x, y));
};
goog.fx.Dragger.prototype.limitX = function(x) {
  var rect = this.limits;
  var left = !isNaN(rect.left) ? rect.left : null;
  var width = !isNaN(rect.width) ? rect.width : 0;
  var maxX = left != null ? left + width : Infinity;
  var minX = left != null ? left : -Infinity;
  return Math.min(maxX, Math.max(minX, x));
};
goog.fx.Dragger.prototype.limitY = function(y) {
  var rect = this.limits;
  var top = !isNaN(rect.top) ? rect.top : null;
  var height = !isNaN(rect.height) ? rect.height : 0;
  var maxY = top != null ? top + height : Infinity;
  var minY = top != null ? top : -Infinity;
  return Math.min(maxY, Math.max(minY, y));
};
goog.fx.Dragger.prototype.computeInitialPosition = function() {
  this.deltaX = this.useRightPositioningForRtl_ ? goog.style.bidi.getOffsetStart(this.target) : this.target.offsetLeft;
  this.deltaY = this.target.offsetTop;
};
goog.fx.Dragger.prototype.defaultAction = function(x, y) {
  if (this.useRightPositioningForRtl_ && this.isRightToLeft_()) {
    this.target.style.right = x + "px";
  } else {
    this.target.style.left = x + "px";
  }
  this.target.style.top = y + "px";
};
goog.fx.Dragger.prototype.isDragging = function() {
  return this.dragging_;
};
goog.fx.DragEvent = function(type, dragobj, clientX, clientY, browserEvent, opt_actX, opt_actY, opt_dragCanceled) {
  goog.events.Event.call(this, type);
  this.clientX = clientX;
  this.clientY = clientY;
  this.browserEvent = browserEvent;
  this.left = goog.isDef(opt_actX) ? opt_actX : dragobj.deltaX;
  this.top = goog.isDef(opt_actY) ? opt_actY : dragobj.deltaY;
  this.dragger = dragobj;
  this.dragCanceled = !!opt_dragCanceled;
};
goog.inherits(goog.fx.DragEvent, goog.events.Event);
goog.provide("pear.ui.Resizable");
goog.provide("pear.ui.Resizable.EventType");
goog.require("goog.fx.Dragger");
goog.require("goog.fx.Dragger.EventType");
goog.require("goog.math.Size");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.ui.Component.EventType");
goog.require("goog.math.Coordinate");
goog.require("goog.string");
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
pear.ui.Resizable.EventType = {RESIZE:"resize", START_RESIZE:"start_resize", END_RESIZE:"end_resize"};
pear.ui.Resizable.Position = {RIGHT:2, BOTTOM:4, LEFT:8, TOP:16, TOP_LEFT:32, TOP_RIGHT:64, BOTTOM_RIGHT:128, BOTTOM_LEFT:256, ALL:511};
pear.ui.Resizable.prototype.getResizehandle = function(position) {
  return this.handlers_[position];
};
pear.ui.Resizable.prototype.setupResizableHandler_ = function() {
  if (this.handles_ & pear.ui.Resizable.Position.RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.RIGHT, ["e", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM, ["s", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.LEFT, ["w", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP, ["n", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP_LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP_LEFT, ["nw", "corner", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.TOP_RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.TOP_RIGHT, ["ne", "corner", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM_RIGHT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM_RIGHT, ["se", "corner", "handle"]);
  }
  if (this.handles_ & pear.ui.Resizable.Position.BOTTOM_LEFT) {
    this.addResizableHandler_(pear.ui.Resizable.Position.BOTTOM_LEFT, ["sw", "corner", "handle"]);
  }
};
pear.ui.Resizable.prototype.addResizableHandler_ = function(position, classNames) {
  var dom = this.getDomHelper();
  var handle = dom.createDom("div");
  goog.array.forEach(classNames, function(value) {
    goog.dom.classes.add(handle, this.getCSSClassName() + "-" + value);
  }, this);
  this.element_.appendChild(handle);
  var dragger = new goog.fx.Dragger(handle);
  dragger.defaultAction = function() {
  };
  this.getHandler().listen(dragger, goog.fx.Dragger.EventType.START, this.handleDragStart_).listen(dragger, goog.fx.Dragger.EventType.DRAG, this.handleDrag_).listen(dragger, goog.fx.Dragger.EventType.END, this.handleDragEnd_);
  this.handleDraggers_[position] = dragger;
  this.handlers_[position] = handle;
};
pear.ui.Resizable.prototype.setupMinAndMaxCoord_ = function(coord, size, position) {
  this.leftX_ = 0;
  this.rightX_ = 0;
  this.topY_ = 0;
  this.bottomY_ = 0;
  if (position & 64) {
    this.leftX_ = coord.x;
    this.rightX_ = coord.x;
  } else {
    this.leftX_ = coord.x - (this.maxWidth_ - size.width);
    this.rightX_ = coord.x + (size.width - this.minWidth_);
  }
  if (position & 256) {
    this.topY_ = coord.y;
    this.bottomY_ = coord.y;
  } else {
    this.topY_ = coord.y - (this.maxHeight_ - size.height);
    this.bottomY_ = coord.y + (size.height - this.minHeight_);
  }
};
pear.ui.Resizable.prototype.getCSSClassName = function() {
  return "pear-ui-resizable";
};
pear.ui.Resizable.prototype.handleDragStart_ = function(e) {
  var dragger = e.currentTarget;
  var position = this.getDraggerPosition_(dragger);
  var targetPos = goog.style.getPosition(dragger.target);
  var size = this.getSize_(this.element_);
  var coord = this.getPosition_(this.element_);
  var coordBorder = goog.style.getBorderBox(this.element_);
  this.setupMinAndMaxCoord_(coord, size, position);
  this.handlerOffsetCoord_ = new goog.math.Coordinate(targetPos.x, targetPos.y);
  this.elementCoord_ = coord;
  this.elementSize_ = new goog.math.Size(size.width, size.height);
  this.dispatchEvent({type:pear.ui.Resizable.EventType.START_RESIZE});
};
pear.ui.Resizable.prototype.getPosition_ = function(el) {
  var coord = goog.style.getPosition(el);
  return coord;
};
pear.ui.Resizable.prototype.getSize_ = function(el) {
  var size = goog.style.getSize(el);
  return size;
};
pear.ui.Resizable.prototype.handleDrag_ = function(e) {
  var deltaWidth = 0, deltaHeight = 0, newX = 0, newY = 0;
  var dragger = e.currentTarget;
  var position = this.getDraggerPosition_(dragger);
  var el = this.element_;
  var size = this.getSize_(this.element_);
  var coord = this.getPosition_(this.element_);
  if (position & 194) {
    size.width = this.elementSize_.width + dragger.deltaX - this.handlerOffsetCoord_.x;
  }
  if (position & 388) {
    size.height = this.elementSize_.height + dragger.deltaY - this.handlerOffsetCoord_.y;
  }
  if (position & 296) {
    size.width = this.elementSize_.width - dragger.deltaX + this.handlerOffsetCoord_.x;
    coord.x = this.elementCoord_.x + dragger.deltaX - this.handlerOffsetCoord_.x;
  }
  if (position & 112) {
    size.height = this.elementSize_.height - dragger.deltaY + this.handlerOffsetCoord_.y;
    coord.y = this.elementCoord_.y + dragger.deltaY - this.handlerOffsetCoord_.y;
  }
  this.resize_(el, size, coord, position);
  if (goog.isFunction(el.resize)) {
    el.resize(size);
  }
  return false;
};
pear.ui.Resizable.prototype.handleDragEnd_ = function(e) {
  this.dispatchEvent({type:pear.ui.Resizable.EventType.END_RESIZE});
};
pear.ui.Resizable.prototype.resize_ = function(element, size, coord, position) {
  var newSize = new goog.math.Size(Math.max(size.width, 0), Math.max(size.height, 0));
  if (this.minWidth_ > 0) {
    newSize.width = Math.max(newSize.width, this.minWidth_);
    coord.x = position & 376 && newSize.width === this.minWidth_ ? this.rightX_ : coord.x;
  }
  if (this.maxWidth_ > 0) {
    newSize.width = Math.min(newSize.width, this.maxWidth_);
    coord.x = position & 376 && newSize.width === this.maxWidth_ ? this.leftX_ : coord.x;
  }
  if (this.minHeight_ > 0) {
    newSize.height = Math.max(newSize.height, this.minHeight_);
    coord.y = position & 376 && newSize.height === this.minHeight_ ? this.bottomY_ : coord.y;
  }
  if (this.maxHeight_ > 0) {
    newSize.height = Math.min(newSize.height, this.maxHeight_);
    coord.y = position & 376 && newSize.height === this.maxHeight_ ? this.topY_ : coord.y;
  }
  this.dispatchEvent({type:pear.ui.Resizable.EventType.RESIZE, size:newSize.clone()});
  goog.style.setBorderBoxSize(element, newSize);
  var marginbox = goog.style.getMarginBox(this.element_);
  coord.x = coord.x - marginbox.left;
  coord.y = coord.y - marginbox.top;
  goog.style.setPosition(element, coord);
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
goog.provide("pear.ui.HeaderCellRenderer");
goog.require("pear.ui.CellRenderer");
pear.ui.HeaderCellRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.HeaderCellRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.HeaderCellRenderer);
pear.ui.HeaderCellRenderer.CSS_CLASS = goog.getCssName("pear-grid-cell-header");
pear.ui.HeaderCellRenderer.prototype.getCssClass = function() {
  return pear.ui.HeaderCellRenderer.CSS_CLASS;
};
goog.provide("goog.Timer");
goog.require("goog.events.EventTarget");
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);
  this.interval_ = opt_interval || 1;
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;
  this.boundTick_ = goog.bind(this.tick_, this);
  this.last_ = goog.now();
};
goog.inherits(goog.Timer, goog.events.EventTarget);
goog.Timer.MAX_TIMEOUT_ = 2147483647;
goog.Timer.prototype.enabled = false;
goog.Timer.defaultTimerObject = goog.global;
goog.Timer.intervalScale = 0.8;
goog.Timer.prototype.timer_ = null;
goog.Timer.prototype.getInterval = function() {
  return this.interval_;
};
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if (this.timer_ && this.enabled) {
    this.stop();
    this.start();
  } else {
    if (this.timer_) {
      this.stop();
    }
  }
};
goog.Timer.prototype.tick_ = function() {
  if (this.enabled) {
    var elapsed = goog.now() - this.last_;
    if (elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed);
      return;
    }
    if (this.timer_) {
      this.timerObject_.clearTimeout(this.timer_);
      this.timer_ = null;
    }
    this.dispatchTick();
    if (this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
      this.last_ = goog.now();
    }
  }
};
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK);
};
goog.Timer.prototype.start = function() {
  this.enabled = true;
  if (!this.timer_) {
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
    this.last_ = goog.now();
  }
};
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if (this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null;
  }
};
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_;
};
goog.Timer.TICK = "tick";
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if (goog.isFunction(listener)) {
    if (opt_handler) {
      listener = goog.bind(listener, opt_handler);
    }
  } else {
    if (listener && typeof listener.handleEvent == "function") {
      listener = goog.bind(listener.handleEvent, listener);
    } else {
      throw Error("Invalid listener argument");
    }
  }
  if (opt_delay > goog.Timer.MAX_TIMEOUT_) {
    return-1;
  } else {
    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0);
  }
};
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId);
};
goog.provide("goog.Delay");
goog.provide("goog.async.Delay");
goog.require("goog.Disposable");
goog.require("goog.Timer");
goog.async.Delay = function(listener, opt_interval, opt_handler) {
  goog.Disposable.call(this);
  this.listener_ = listener;
  this.interval_ = opt_interval || 0;
  this.handler_ = opt_handler;
  this.callback_ = goog.bind(this.doAction_, this);
};
goog.inherits(goog.async.Delay, goog.Disposable);
goog.Delay = goog.async.Delay;
goog.async.Delay.prototype.id_ = 0;
goog.async.Delay.prototype.disposeInternal = function() {
  goog.async.Delay.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.listener_;
  delete this.handler_;
};
goog.async.Delay.prototype.start = function(opt_interval) {
  this.stop();
  this.id_ = goog.Timer.callOnce(this.callback_, goog.isDef(opt_interval) ? opt_interval : this.interval_);
};
goog.async.Delay.prototype.stop = function() {
  if (this.isActive()) {
    goog.Timer.clear(this.id_);
  }
  this.id_ = 0;
};
goog.async.Delay.prototype.fire = function() {
  this.stop();
  this.doAction_();
};
goog.async.Delay.prototype.fireIfActive = function() {
  if (this.isActive()) {
    this.fire();
  }
};
goog.async.Delay.prototype.isActive = function() {
  return this.id_ != 0;
};
goog.async.Delay.prototype.doAction_ = function() {
  this.id_ = 0;
  if (this.listener_) {
    this.listener_.call(this.handler_);
  }
};
goog.provide("goog.async.AnimationDelay");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.require("goog.functions");
goog.async.AnimationDelay = function(listener, opt_window, opt_handler) {
  goog.base(this);
  this.listener_ = listener;
  this.handler_ = opt_handler;
  this.win_ = opt_window || window;
  this.callback_ = goog.bind(this.doAction_, this);
};
goog.inherits(goog.async.AnimationDelay, goog.Disposable);
goog.async.AnimationDelay.prototype.id_ = null;
goog.async.AnimationDelay.prototype.usingListeners_ = false;
goog.async.AnimationDelay.TIMEOUT = 20;
goog.async.AnimationDelay.MOZ_BEFORE_PAINT_EVENT_ = "MozBeforePaint";
goog.async.AnimationDelay.prototype.start = function() {
  this.stop();
  this.usingListeners_ = false;
  var raf = this.getRaf_();
  var cancelRaf = this.getCancelRaf_();
  if (raf && (!cancelRaf && this.win_.mozRequestAnimationFrame)) {
    this.id_ = goog.events.listen(this.win_, goog.async.AnimationDelay.MOZ_BEFORE_PAINT_EVENT_, this.callback_);
    this.win_.mozRequestAnimationFrame(null);
    this.usingListeners_ = true;
  } else {
    if (raf && cancelRaf) {
      this.id_ = raf.call(this.win_, this.callback_);
    } else {
      this.id_ = this.win_.setTimeout(goog.functions.lock(this.callback_), goog.async.AnimationDelay.TIMEOUT);
    }
  }
};
goog.async.AnimationDelay.prototype.stop = function() {
  if (this.isActive()) {
    var raf = this.getRaf_();
    var cancelRaf = this.getCancelRaf_();
    if (raf && (!cancelRaf && this.win_.mozRequestAnimationFrame)) {
      goog.events.unlistenByKey(this.id_);
    } else {
      if (raf && cancelRaf) {
        cancelRaf.call(this.win_, (this.id_));
      } else {
        this.win_.clearTimeout((this.id_));
      }
    }
  }
  this.id_ = null;
};
goog.async.AnimationDelay.prototype.fire = function() {
  this.stop();
  this.doAction_();
};
goog.async.AnimationDelay.prototype.fireIfActive = function() {
  if (this.isActive()) {
    this.fire();
  }
};
goog.async.AnimationDelay.prototype.isActive = function() {
  return this.id_ != null;
};
goog.async.AnimationDelay.prototype.doAction_ = function() {
  if (this.usingListeners_ && this.id_) {
    goog.events.unlistenByKey(this.id_);
  }
  this.id_ = null;
  this.listener_.call(this.handler_, goog.now());
};
goog.async.AnimationDelay.prototype.disposeInternal = function() {
  this.stop();
  goog.base(this, "disposeInternal");
};
goog.async.AnimationDelay.prototype.getRaf_ = function() {
  var win = this.win_;
  return win.requestAnimationFrame || (win.webkitRequestAnimationFrame || (win.mozRequestAnimationFrame || (win.oRequestAnimationFrame || (win.msRequestAnimationFrame || null))));
};
goog.async.AnimationDelay.prototype.getCancelRaf_ = function() {
  var win = this.win_;
  return win.cancelRequestAnimationFrame || (win.webkitCancelRequestAnimationFrame || (win.mozCancelRequestAnimationFrame || (win.oCancelRequestAnimationFrame || (win.msCancelRequestAnimationFrame || null))));
};
goog.provide("goog.fx.anim");
goog.provide("goog.fx.anim.Animated");
goog.require("goog.async.AnimationDelay");
goog.require("goog.async.Delay");
goog.require("goog.object");
goog.fx.anim.Animated = function() {
};
goog.fx.anim.Animated.prototype.onAnimationFrame;
goog.fx.anim.TIMEOUT = goog.async.AnimationDelay.TIMEOUT;
goog.fx.anim.activeAnimations_ = {};
goog.fx.anim.animationWindow_ = null;
goog.fx.anim.animationDelay_ = null;
goog.fx.anim.registerAnimation = function(animation) {
  var uid = goog.getUid(animation);
  if (!(uid in goog.fx.anim.activeAnimations_)) {
    goog.fx.anim.activeAnimations_[uid] = animation;
  }
  goog.fx.anim.requestAnimationFrame_();
};
goog.fx.anim.unregisterAnimation = function(animation) {
  var uid = goog.getUid(animation);
  delete goog.fx.anim.activeAnimations_[uid];
  if (goog.object.isEmpty(goog.fx.anim.activeAnimations_)) {
    goog.fx.anim.cancelAnimationFrame_();
  }
};
goog.fx.anim.tearDown = function() {
  goog.fx.anim.animationWindow_ = null;
  goog.dispose(goog.fx.anim.animationDelay_);
  goog.fx.anim.animationDelay_ = null;
  goog.fx.anim.activeAnimations_ = {};
};
goog.fx.anim.setAnimationWindow = function(animationWindow) {
  var hasTimer = goog.fx.anim.animationDelay_ && goog.fx.anim.animationDelay_.isActive();
  goog.dispose(goog.fx.anim.animationDelay_);
  goog.fx.anim.animationDelay_ = null;
  goog.fx.anim.animationWindow_ = animationWindow;
  if (hasTimer) {
    goog.fx.anim.requestAnimationFrame_();
  }
};
goog.fx.anim.requestAnimationFrame_ = function() {
  if (!goog.fx.anim.animationDelay_) {
    if (goog.fx.anim.animationWindow_) {
      goog.fx.anim.animationDelay_ = new goog.async.AnimationDelay(function(now) {
        goog.fx.anim.cycleAnimations_(now);
      }, goog.fx.anim.animationWindow_);
    } else {
      goog.fx.anim.animationDelay_ = new goog.async.Delay(function() {
        goog.fx.anim.cycleAnimations_(goog.now());
      }, goog.fx.anim.TIMEOUT);
    }
  }
  var delay = goog.fx.anim.animationDelay_;
  if (!delay.isActive()) {
    delay.start();
  }
};
goog.fx.anim.cancelAnimationFrame_ = function() {
  if (goog.fx.anim.animationDelay_) {
    goog.fx.anim.animationDelay_.stop();
  }
};
goog.fx.anim.cycleAnimations_ = function(now) {
  goog.object.forEach(goog.fx.anim.activeAnimations_, function(anim) {
    anim.onAnimationFrame(now);
  });
  if (!goog.object.isEmpty(goog.fx.anim.activeAnimations_)) {
    goog.fx.anim.requestAnimationFrame_();
  }
};
goog.provide("goog.fx.Transition");
goog.provide("goog.fx.Transition.EventType");
goog.fx.Transition = function() {
};
goog.fx.Transition.EventType = {PLAY:"play", BEGIN:"begin", RESUME:"resume", END:"end", STOP:"stop", FINISH:"finish", PAUSE:"pause"};
goog.fx.Transition.prototype.play;
goog.fx.Transition.prototype.stop;
goog.provide("goog.fx.TransitionBase");
goog.provide("goog.fx.TransitionBase.State");
goog.require("goog.events.EventTarget");
goog.require("goog.fx.Transition");
goog.require("goog.fx.Transition.EventType");
goog.fx.TransitionBase = function() {
  goog.base(this);
  this.state_ = goog.fx.TransitionBase.State.STOPPED;
  this.startTime = null;
  this.endTime = null;
};
goog.inherits(goog.fx.TransitionBase, goog.events.EventTarget);
goog.fx.TransitionBase.State = {STOPPED:0, PAUSED:-1, PLAYING:1};
goog.fx.TransitionBase.prototype.play = goog.abstractMethod;
goog.fx.TransitionBase.prototype.stop = goog.abstractMethod;
goog.fx.TransitionBase.prototype.pause = goog.abstractMethod;
goog.fx.TransitionBase.prototype.getStateInternal = function() {
  return this.state_;
};
goog.fx.TransitionBase.prototype.setStatePlaying = function() {
  this.state_ = goog.fx.TransitionBase.State.PLAYING;
};
goog.fx.TransitionBase.prototype.setStatePaused = function() {
  this.state_ = goog.fx.TransitionBase.State.PAUSED;
};
goog.fx.TransitionBase.prototype.setStateStopped = function() {
  this.state_ = goog.fx.TransitionBase.State.STOPPED;
};
goog.fx.TransitionBase.prototype.isPlaying = function() {
  return this.state_ == goog.fx.TransitionBase.State.PLAYING;
};
goog.fx.TransitionBase.prototype.isPaused = function() {
  return this.state_ == goog.fx.TransitionBase.State.PAUSED;
};
goog.fx.TransitionBase.prototype.isStopped = function() {
  return this.state_ == goog.fx.TransitionBase.State.STOPPED;
};
goog.fx.TransitionBase.prototype.onBegin = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.BEGIN);
};
goog.fx.TransitionBase.prototype.onEnd = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.END);
};
goog.fx.TransitionBase.prototype.onFinish = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.FINISH);
};
goog.fx.TransitionBase.prototype.onPause = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.PAUSE);
};
goog.fx.TransitionBase.prototype.onPlay = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.PLAY);
};
goog.fx.TransitionBase.prototype.onResume = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.RESUME);
};
goog.fx.TransitionBase.prototype.onStop = function() {
  this.dispatchAnimationEvent(goog.fx.Transition.EventType.STOP);
};
goog.fx.TransitionBase.prototype.dispatchAnimationEvent = function(type) {
  this.dispatchEvent(type);
};
goog.provide("goog.fx.Animation");
goog.provide("goog.fx.Animation.EventType");
goog.provide("goog.fx.Animation.State");
goog.provide("goog.fx.AnimationEvent");
goog.require("goog.array");
goog.require("goog.events.Event");
goog.require("goog.fx.Transition");
goog.require("goog.fx.Transition.EventType");
goog.require("goog.fx.TransitionBase.State");
goog.require("goog.fx.anim");
goog.require("goog.fx.anim.Animated");
goog.fx.Animation = function(start, end, duration, opt_acc) {
  goog.base(this);
  if (!goog.isArray(start) || !goog.isArray(end)) {
    throw Error("Start and end parameters must be arrays");
  }
  if (start.length != end.length) {
    throw Error("Start and end points must be the same length");
  }
  this.startPoint = start;
  this.endPoint = end;
  this.duration = duration;
  this.accel_ = opt_acc;
  this.coords = [];
  this.useRightPositioningForRtl_ = false;
};
goog.inherits(goog.fx.Animation, goog.fx.TransitionBase);
goog.fx.Animation.prototype.enableRightPositioningForRtl = function(useRightPositioningForRtl) {
  this.useRightPositioningForRtl_ = useRightPositioningForRtl;
};
goog.fx.Animation.prototype.isRightPositioningForRtlEnabled = function() {
  return this.useRightPositioningForRtl_;
};
goog.fx.Animation.EventType = {PLAY:goog.fx.Transition.EventType.PLAY, BEGIN:goog.fx.Transition.EventType.BEGIN, RESUME:goog.fx.Transition.EventType.RESUME, END:goog.fx.Transition.EventType.END, STOP:goog.fx.Transition.EventType.STOP, FINISH:goog.fx.Transition.EventType.FINISH, PAUSE:goog.fx.Transition.EventType.PAUSE, ANIMATE:"animate", DESTROY:"destroy"};
goog.fx.Animation.TIMEOUT = goog.fx.anim.TIMEOUT;
goog.fx.Animation.State = goog.fx.TransitionBase.State;
goog.fx.Animation.setAnimationWindow = function(animationWindow) {
  goog.fx.anim.setAnimationWindow(animationWindow);
};
goog.fx.Animation.prototype.fps_ = 0;
goog.fx.Animation.prototype.progress = 0;
goog.fx.Animation.prototype.lastFrame = null;
goog.fx.Animation.prototype.play = function(opt_restart) {
  if (opt_restart || this.isStopped()) {
    this.progress = 0;
    this.coords = this.startPoint;
  } else {
    if (this.isPlaying()) {
      return false;
    }
  }
  goog.fx.anim.unregisterAnimation(this);
  var now = (goog.now());
  this.startTime = now;
  if (this.isPaused()) {
    this.startTime -= this.duration * this.progress;
  }
  this.endTime = this.startTime + this.duration;
  this.lastFrame = this.startTime;
  if (!this.progress) {
    this.onBegin();
  }
  this.onPlay();
  if (this.isPaused()) {
    this.onResume();
  }
  this.setStatePlaying();
  goog.fx.anim.registerAnimation(this);
  this.cycle(now);
  return true;
};
goog.fx.Animation.prototype.stop = function(opt_gotoEnd) {
  goog.fx.anim.unregisterAnimation(this);
  this.setStateStopped();
  if (!!opt_gotoEnd) {
    this.progress = 1;
  }
  this.updateCoords_(this.progress);
  this.onStop();
  this.onEnd();
};
goog.fx.Animation.prototype.pause = function() {
  if (this.isPlaying()) {
    goog.fx.anim.unregisterAnimation(this);
    this.setStatePaused();
    this.onPause();
  }
};
goog.fx.Animation.prototype.getProgress = function() {
  return this.progress;
};
goog.fx.Animation.prototype.setProgress = function(progress) {
  this.progress = progress;
  if (this.isPlaying()) {
    var now = goog.now();
    this.startTime = now - this.duration * this.progress;
    this.endTime = this.startTime + this.duration;
  }
};
goog.fx.Animation.prototype.disposeInternal = function() {
  if (!this.isStopped()) {
    this.stop(false);
  }
  this.onDestroy();
  goog.base(this, "disposeInternal");
};
goog.fx.Animation.prototype.destroy = function() {
  this.dispose();
};
goog.fx.Animation.prototype.onAnimationFrame = function(now) {
  this.cycle(now);
};
goog.fx.Animation.prototype.cycle = function(now) {
  this.progress = (now - this.startTime) / (this.endTime - this.startTime);
  if (this.progress >= 1) {
    this.progress = 1;
  }
  this.fps_ = 1E3 / (now - this.lastFrame);
  this.lastFrame = now;
  this.updateCoords_(this.progress);
  if (this.progress == 1) {
    this.setStateStopped();
    goog.fx.anim.unregisterAnimation(this);
    this.onFinish();
    this.onEnd();
  } else {
    if (this.isPlaying()) {
      this.onAnimate();
    }
  }
};
goog.fx.Animation.prototype.updateCoords_ = function(t) {
  if (goog.isFunction(this.accel_)) {
    t = this.accel_(t);
  }
  this.coords = new Array(this.startPoint.length);
  for (var i = 0;i < this.startPoint.length;i++) {
    this.coords[i] = (this.endPoint[i] - this.startPoint[i]) * t + this.startPoint[i];
  }
};
goog.fx.Animation.prototype.onAnimate = function() {
  this.dispatchAnimationEvent(goog.fx.Animation.EventType.ANIMATE);
};
goog.fx.Animation.prototype.onDestroy = function() {
  this.dispatchAnimationEvent(goog.fx.Animation.EventType.DESTROY);
};
goog.fx.Animation.prototype.dispatchAnimationEvent = function(type) {
  this.dispatchEvent(new goog.fx.AnimationEvent(type, this));
};
goog.fx.AnimationEvent = function(type, anim) {
  goog.base(this, type);
  this.coords = anim.coords;
  this.x = anim.coords[0];
  this.y = anim.coords[1];
  this.z = anim.coords[2];
  this.duration = anim.duration;
  this.progress = anim.getProgress();
  this.fps = anim.fps_;
  this.state = anim.getStateInternal();
  this.anim = anim;
};
goog.inherits(goog.fx.AnimationEvent, goog.events.Event);
goog.fx.AnimationEvent.prototype.coordsAsInts = function() {
  return goog.array.map(this.coords, Math.round);
};
goog.provide("goog.color.names");
goog.color.names = {"aliceblue":"#f0f8ff", "antiquewhite":"#faebd7", "aqua":"#00ffff", "aquamarine":"#7fffd4", "azure":"#f0ffff", "beige":"#f5f5dc", "bisque":"#ffe4c4", "black":"#000000", "blanchedalmond":"#ffebcd", "blue":"#0000ff", "blueviolet":"#8a2be2", "brown":"#a52a2a", "burlywood":"#deb887", "cadetblue":"#5f9ea0", "chartreuse":"#7fff00", "chocolate":"#d2691e", "coral":"#ff7f50", "cornflowerblue":"#6495ed", "cornsilk":"#fff8dc", "crimson":"#dc143c", "cyan":"#00ffff", "darkblue":"#00008b", "darkcyan":"#008b8b", 
"darkgoldenrod":"#b8860b", "darkgray":"#a9a9a9", "darkgreen":"#006400", "darkgrey":"#a9a9a9", "darkkhaki":"#bdb76b", "darkmagenta":"#8b008b", "darkolivegreen":"#556b2f", "darkorange":"#ff8c00", "darkorchid":"#9932cc", "darkred":"#8b0000", "darksalmon":"#e9967a", "darkseagreen":"#8fbc8f", "darkslateblue":"#483d8b", "darkslategray":"#2f4f4f", "darkslategrey":"#2f4f4f", "darkturquoise":"#00ced1", "darkviolet":"#9400d3", "deeppink":"#ff1493", "deepskyblue":"#00bfff", "dimgray":"#696969", "dimgrey":"#696969", 
"dodgerblue":"#1e90ff", "firebrick":"#b22222", "floralwhite":"#fffaf0", "forestgreen":"#228b22", "fuchsia":"#ff00ff", "gainsboro":"#dcdcdc", "ghostwhite":"#f8f8ff", "gold":"#ffd700", "goldenrod":"#daa520", "gray":"#808080", "green":"#008000", "greenyellow":"#adff2f", "grey":"#808080", "honeydew":"#f0fff0", "hotpink":"#ff69b4", "indianred":"#cd5c5c", "indigo":"#4b0082", "ivory":"#fffff0", "khaki":"#f0e68c", "lavender":"#e6e6fa", "lavenderblush":"#fff0f5", "lawngreen":"#7cfc00", "lemonchiffon":"#fffacd", 
"lightblue":"#add8e6", "lightcoral":"#f08080", "lightcyan":"#e0ffff", "lightgoldenrodyellow":"#fafad2", "lightgray":"#d3d3d3", "lightgreen":"#90ee90", "lightgrey":"#d3d3d3", "lightpink":"#ffb6c1", "lightsalmon":"#ffa07a", "lightseagreen":"#20b2aa", "lightskyblue":"#87cefa", "lightslategray":"#778899", "lightslategrey":"#778899", "lightsteelblue":"#b0c4de", "lightyellow":"#ffffe0", "lime":"#00ff00", "limegreen":"#32cd32", "linen":"#faf0e6", "magenta":"#ff00ff", "maroon":"#800000", "mediumaquamarine":"#66cdaa", 
"mediumblue":"#0000cd", "mediumorchid":"#ba55d3", "mediumpurple":"#9370db", "mediumseagreen":"#3cb371", "mediumslateblue":"#7b68ee", "mediumspringgreen":"#00fa9a", "mediumturquoise":"#48d1cc", "mediumvioletred":"#c71585", "midnightblue":"#191970", "mintcream":"#f5fffa", "mistyrose":"#ffe4e1", "moccasin":"#ffe4b5", "navajowhite":"#ffdead", "navy":"#000080", "oldlace":"#fdf5e6", "olive":"#808000", "olivedrab":"#6b8e23", "orange":"#ffa500", "orangered":"#ff4500", "orchid":"#da70d6", "palegoldenrod":"#eee8aa", 
"palegreen":"#98fb98", "paleturquoise":"#afeeee", "palevioletred":"#db7093", "papayawhip":"#ffefd5", "peachpuff":"#ffdab9", "peru":"#cd853f", "pink":"#ffc0cb", "plum":"#dda0dd", "powderblue":"#b0e0e6", "purple":"#800080", "red":"#ff0000", "rosybrown":"#bc8f8f", "royalblue":"#4169e1", "saddlebrown":"#8b4513", "salmon":"#fa8072", "sandybrown":"#f4a460", "seagreen":"#2e8b57", "seashell":"#fff5ee", "sienna":"#a0522d", "silver":"#c0c0c0", "skyblue":"#87ceeb", "slateblue":"#6a5acd", "slategray":"#708090", 
"slategrey":"#708090", "snow":"#fffafa", "springgreen":"#00ff7f", "steelblue":"#4682b4", "tan":"#d2b48c", "teal":"#008080", "thistle":"#d8bfd8", "tomato":"#ff6347", "turquoise":"#40e0d0", "violet":"#ee82ee", "wheat":"#f5deb3", "white":"#ffffff", "whitesmoke":"#f5f5f5", "yellow":"#ffff00", "yellowgreen":"#9acd32"};
goog.provide("goog.color");
goog.require("goog.color.names");
goog.require("goog.math");
goog.color.Rgb;
goog.color.Hsv;
goog.color.Hsl;
goog.color.parse = function(str) {
  var result = {};
  str = String(str);
  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  if (goog.color.isValidHexColor_(maybeHex)) {
    result.hex = goog.color.normalizeHex(maybeHex);
    result.type = "hex";
    return result;
  } else {
    var rgb = goog.color.isValidRgbColor_(str);
    if (rgb.length) {
      result.hex = goog.color.rgbArrayToHex(rgb);
      result.type = "rgb";
      return result;
    } else {
      if (goog.color.names) {
        var hex = goog.color.names[str.toLowerCase()];
        if (hex) {
          result.hex = hex;
          result.type = "named";
          return result;
        }
      }
    }
  }
  throw Error(str + " is not a valid color string");
};
goog.color.isValidColor = function(str) {
  var maybeHex = goog.color.prependHashIfNecessaryHelper(str);
  return!!(goog.color.isValidHexColor_(maybeHex) || (goog.color.isValidRgbColor_(str).length || goog.color.names && goog.color.names[str.toLowerCase()]));
};
goog.color.parseRgb = function(str) {
  var rgb = goog.color.isValidRgbColor_(str);
  if (!rgb.length) {
    throw Error(str + " is not a valid RGB color");
  }
  return rgb;
};
goog.color.hexToRgbStyle = function(hexColor) {
  return goog.color.rgbStyle_(goog.color.hexToRgb(hexColor));
};
goog.color.hexTripletRe_ = /#(.)(.)(.)/;
goog.color.normalizeHex = function(hexColor) {
  if (!goog.color.isValidHexColor_(hexColor)) {
    throw Error("'" + hexColor + "' is not a valid hex color");
  }
  if (hexColor.length == 4) {
    hexColor = hexColor.replace(goog.color.hexTripletRe_, "#$1$1$2$2$3$3");
  }
  return hexColor.toLowerCase();
};
goog.color.hexToRgb = function(hexColor) {
  hexColor = goog.color.normalizeHex(hexColor);
  var r = parseInt(hexColor.substr(1, 2), 16);
  var g = parseInt(hexColor.substr(3, 2), 16);
  var b = parseInt(hexColor.substr(5, 2), 16);
  return[r, g, b];
};
goog.color.rgbToHex = function(r, g, b) {
  r = Number(r);
  g = Number(g);
  b = Number(b);
  if (isNaN(r) || (r < 0 || (r > 255 || (isNaN(g) || (g < 0 || (g > 255 || (isNaN(b) || (b < 0 || b > 255)))))))) {
    throw Error('"(' + r + "," + g + "," + b + '") is not a valid RGB color');
  }
  var hexR = goog.color.prependZeroIfNecessaryHelper(r.toString(16));
  var hexG = goog.color.prependZeroIfNecessaryHelper(g.toString(16));
  var hexB = goog.color.prependZeroIfNecessaryHelper(b.toString(16));
  return "#" + hexR + hexG + hexB;
};
goog.color.rgbArrayToHex = function(rgb) {
  return goog.color.rgbToHex(rgb[0], rgb[1], rgb[2]);
};
goog.color.rgbToHsl = function(r, g, b) {
  var normR = r / 255;
  var normG = g / 255;
  var normB = b / 255;
  var max = Math.max(normR, normG, normB);
  var min = Math.min(normR, normG, normB);
  var h = 0;
  var s = 0;
  var l = 0.5 * (max + min);
  if (max != min) {
    if (max == normR) {
      h = 60 * (normG - normB) / (max - min);
    } else {
      if (max == normG) {
        h = 60 * (normB - normR) / (max - min) + 120;
      } else {
        if (max == normB) {
          h = 60 * (normR - normG) / (max - min) + 240;
        }
      }
    }
    if (0 < l && l <= 0.5) {
      s = (max - min) / (2 * l);
    } else {
      s = (max - min) / (2 - 2 * l);
    }
  }
  return[Math.round(h + 360) % 360, s, l];
};
goog.color.rgbArrayToHsl = function(rgb) {
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
goog.color.hueToRgb_ = function(v1, v2, vH) {
  if (vH < 0) {
    vH += 1;
  } else {
    if (vH > 1) {
      vH -= 1;
    }
  }
  if (6 * vH < 1) {
    return v1 + (v2 - v1) * 6 * vH;
  } else {
    if (2 * vH < 1) {
      return v2;
    } else {
      if (3 * vH < 2) {
        return v1 + (v2 - v1) * (2 / 3 - vH) * 6;
      }
    }
  }
  return v1;
};
goog.color.hslToRgb = function(h, s, l) {
  var r = 0;
  var g = 0;
  var b = 0;
  var normH = h / 360;
  if (s == 0) {
    r = g = b = l * 255;
  } else {
    var temp1 = 0;
    var temp2 = 0;
    if (l < 0.5) {
      temp2 = l * (1 + s);
    } else {
      temp2 = l + s - s * l;
    }
    temp1 = 2 * l - temp2;
    r = 255 * goog.color.hueToRgb_(temp1, temp2, normH + 1 / 3);
    g = 255 * goog.color.hueToRgb_(temp1, temp2, normH);
    b = 255 * goog.color.hueToRgb_(temp1, temp2, normH - 1 / 3);
  }
  return[Math.round(r), Math.round(g), Math.round(b)];
};
goog.color.hslArrayToRgb = function(hsl) {
  return goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]);
};
goog.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i;
goog.color.isValidHexColor_ = function(str) {
  return goog.color.validHexColorRe_.test(str);
};
goog.color.normalizedHexColorRe_ = /^#[0-9a-f]{6}$/;
goog.color.isNormalizedHexColor_ = function(str) {
  return goog.color.normalizedHexColorRe_.test(str);
};
goog.color.rgbColorRe_ = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;
goog.color.isValidRgbColor_ = function(str) {
  var regExpResultArray = str.match(goog.color.rgbColorRe_);
  if (regExpResultArray) {
    var r = Number(regExpResultArray[1]);
    var g = Number(regExpResultArray[2]);
    var b = Number(regExpResultArray[3]);
    if (r >= 0 && (r <= 255 && (g >= 0 && (g <= 255 && (b >= 0 && b <= 255))))) {
      return[r, g, b];
    }
  }
  return[];
};
goog.color.prependZeroIfNecessaryHelper = function(hex) {
  return hex.length == 1 ? "0" + hex : hex;
};
goog.color.prependHashIfNecessaryHelper = function(str) {
  return str.charAt(0) == "#" ? str : "#" + str;
};
goog.color.rgbStyle_ = function(rgb) {
  return "rgb(" + rgb.join(",") + ")";
};
goog.color.hsvToRgb = function(h, s, brightness) {
  var red = 0;
  var green = 0;
  var blue = 0;
  if (s == 0) {
    red = brightness;
    green = brightness;
    blue = brightness;
  } else {
    var sextant = Math.floor(h / 60);
    var remainder = h / 60 - sextant;
    var val1 = brightness * (1 - s);
    var val2 = brightness * (1 - s * remainder);
    var val3 = brightness * (1 - s * (1 - remainder));
    switch(sextant) {
      case 1:
        red = val2;
        green = brightness;
        blue = val1;
        break;
      case 2:
        red = val1;
        green = brightness;
        blue = val3;
        break;
      case 3:
        red = val1;
        green = val2;
        blue = brightness;
        break;
      case 4:
        red = val3;
        green = val1;
        blue = brightness;
        break;
      case 5:
        red = brightness;
        green = val1;
        blue = val2;
        break;
      case 6:
      ;
      case 0:
        red = brightness;
        green = val3;
        blue = val1;
        break;
    }
  }
  return[Math.floor(red), Math.floor(green), Math.floor(blue)];
};
goog.color.rgbToHsv = function(red, green, blue) {
  var max = Math.max(Math.max(red, green), blue);
  var min = Math.min(Math.min(red, green), blue);
  var hue;
  var saturation;
  var value = max;
  if (min == max) {
    hue = 0;
    saturation = 0;
  } else {
    var delta = max - min;
    saturation = delta / max;
    if (red == max) {
      hue = (green - blue) / delta;
    } else {
      if (green == max) {
        hue = 2 + (blue - red) / delta;
      } else {
        hue = 4 + (red - green) / delta;
      }
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
    if (hue > 360) {
      hue -= 360;
    }
  }
  return[hue, saturation, value];
};
goog.color.rgbArrayToHsv = function(rgb) {
  return goog.color.rgbToHsv(rgb[0], rgb[1], rgb[2]);
};
goog.color.hsvArrayToRgb = function(hsv) {
  return goog.color.hsvToRgb(hsv[0], hsv[1], hsv[2]);
};
goog.color.hexToHsl = function(hex) {
  var rgb = goog.color.hexToRgb(hex);
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
goog.color.hslToHex = function(h, s, l) {
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(h, s, l));
};
goog.color.hslArrayToHex = function(hsl) {
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]));
};
goog.color.hexToHsv = function(hex) {
  return goog.color.rgbArrayToHsv(goog.color.hexToRgb(hex));
};
goog.color.hsvToHex = function(h, s, v) {
  return goog.color.rgbArrayToHex(goog.color.hsvToRgb(h, s, v));
};
goog.color.hsvArrayToHex = function(hsv) {
  return goog.color.hsvToHex(hsv[0], hsv[1], hsv[2]);
};
goog.color.hslDistance = function(hsl1, hsl2) {
  var sl1, sl2;
  if (hsl1[2] <= 0.5) {
    sl1 = hsl1[1] * hsl1[2];
  } else {
    sl1 = hsl1[1] * (1 - hsl1[2]);
  }
  if (hsl2[2] <= 0.5) {
    sl2 = hsl2[1] * hsl2[2];
  } else {
    sl2 = hsl2[1] * (1 - hsl2[2]);
  }
  var h1 = hsl1[0] / 360;
  var h2 = hsl2[0] / 360;
  var dh = (h1 - h2) * 2 * Math.PI;
  return(hsl1[2] - hsl2[2]) * (hsl1[2] - hsl2[2]) + sl1 * sl1 + sl2 * sl2 - 2 * sl1 * sl2 * Math.cos(dh);
};
goog.color.blend = function(rgb1, rgb2, factor) {
  factor = goog.math.clamp(factor, 0, 1);
  return[Math.round(factor * rgb1[0] + (1 - factor) * rgb2[0]), Math.round(factor * rgb1[1] + (1 - factor) * rgb2[1]), Math.round(factor * rgb1[2] + (1 - factor) * rgb2[2])];
};
goog.color.darken = function(rgb, factor) {
  var black = [0, 0, 0];
  return goog.color.blend(black, rgb, factor);
};
goog.color.lighten = function(rgb, factor) {
  var white = [255, 255, 255];
  return goog.color.blend(white, rgb, factor);
};
goog.color.highContrast = function(prime, suggestions) {
  var suggestionsWithDiff = [];
  for (var i = 0;i < suggestions.length;i++) {
    suggestionsWithDiff.push({color:suggestions[i], diff:goog.color.yiqBrightnessDiff_(suggestions[i], prime) + goog.color.colorDiff_(suggestions[i], prime)});
  }
  suggestionsWithDiff.sort(function(a, b) {
    return b.diff - a.diff;
  });
  return suggestionsWithDiff[0].color;
};
goog.color.yiqBrightness_ = function(rgb) {
  return Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1E3);
};
goog.color.yiqBrightnessDiff_ = function(rgb1, rgb2) {
  return Math.abs(goog.color.yiqBrightness_(rgb1) - goog.color.yiqBrightness_(rgb2));
};
goog.color.colorDiff_ = function(rgb1, rgb2) {
  return Math.abs(rgb1[0] - rgb2[0]) + Math.abs(rgb1[1] - rgb2[1]) + Math.abs(rgb1[2] - rgb2[2]);
};
goog.provide("goog.fx.dom");
goog.provide("goog.fx.dom.BgColorTransform");
goog.provide("goog.fx.dom.ColorTransform");
goog.provide("goog.fx.dom.Fade");
goog.provide("goog.fx.dom.FadeIn");
goog.provide("goog.fx.dom.FadeInAndShow");
goog.provide("goog.fx.dom.FadeOut");
goog.provide("goog.fx.dom.FadeOutAndHide");
goog.provide("goog.fx.dom.PredefinedEffect");
goog.provide("goog.fx.dom.Resize");
goog.provide("goog.fx.dom.ResizeHeight");
goog.provide("goog.fx.dom.ResizeWidth");
goog.provide("goog.fx.dom.Scroll");
goog.provide("goog.fx.dom.Slide");
goog.provide("goog.fx.dom.SlideFrom");
goog.provide("goog.fx.dom.Swipe");
goog.require("goog.color");
goog.require("goog.events");
goog.require("goog.fx.Animation");
goog.require("goog.fx.Transition.EventType");
goog.require("goog.style");
goog.require("goog.style.bidi");
goog.fx.dom.PredefinedEffect = function(element, start, end, time, opt_acc) {
  goog.fx.Animation.call(this, start, end, time, opt_acc);
  this.element = element;
  this.rightToLeft_;
};
goog.inherits(goog.fx.dom.PredefinedEffect, goog.fx.Animation);
goog.fx.dom.PredefinedEffect.prototype.updateStyle = goog.nullFunction;
goog.fx.dom.PredefinedEffect.prototype.rightToLeft_;
goog.fx.dom.PredefinedEffect.prototype.isRightToLeft = function() {
  if (!goog.isDef(this.rightToLeft_)) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.element);
  }
  return this.rightToLeft_;
};
goog.fx.dom.PredefinedEffect.prototype.onAnimate = function() {
  this.updateStyle();
  goog.fx.dom.PredefinedEffect.superClass_.onAnimate.call(this);
};
goog.fx.dom.PredefinedEffect.prototype.onEnd = function() {
  this.updateStyle();
  goog.fx.dom.PredefinedEffect.superClass_.onEnd.call(this);
};
goog.fx.dom.PredefinedEffect.prototype.onBegin = function() {
  this.updateStyle();
  goog.fx.dom.PredefinedEffect.superClass_.onBegin.call(this);
};
goog.fx.dom.Slide = function(element, start, end, time, opt_acc) {
  if (start.length != 2 || end.length != 2) {
    throw Error("Start and end points must be 2D");
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.Slide, goog.fx.dom.PredefinedEffect);
goog.fx.dom.Slide.prototype.updateStyle = function() {
  var pos = this.isRightPositioningForRtlEnabled() && this.isRightToLeft() ? "right" : "left";
  this.element.style[pos] = Math.round(this.coords[0]) + "px";
  this.element.style.top = Math.round(this.coords[1]) + "px";
};
goog.fx.dom.SlideFrom = function(element, end, time, opt_acc) {
  var offsetLeft = this.isRightPositioningForRtlEnabled() ? goog.style.bidi.getOffsetStart(element) : element.offsetLeft;
  var start = [offsetLeft, element.offsetTop];
  goog.fx.dom.Slide.call(this, element, start, end, time, opt_acc);
};
goog.inherits(goog.fx.dom.SlideFrom, goog.fx.dom.Slide);
goog.fx.dom.SlideFrom.prototype.onBegin = function() {
  var offsetLeft = this.isRightPositioningForRtlEnabled() ? goog.style.bidi.getOffsetStart(this.element) : this.element.offsetLeft;
  this.startPoint = [offsetLeft, this.element.offsetTop];
  goog.fx.dom.SlideFrom.superClass_.onBegin.call(this);
};
goog.fx.dom.Swipe = function(element, start, end, time, opt_acc) {
  if (start.length != 2 || end.length != 2) {
    throw Error("Start and end points must be 2D");
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
  this.maxWidth_ = Math.max(this.endPoint[0], this.startPoint[0]);
  this.maxHeight_ = Math.max(this.endPoint[1], this.startPoint[1]);
};
goog.inherits(goog.fx.dom.Swipe, goog.fx.dom.PredefinedEffect);
goog.fx.dom.Swipe.prototype.updateStyle = function() {
  var x = this.coords[0];
  var y = this.coords[1];
  this.clip_(Math.round(x), Math.round(y), this.maxWidth_, this.maxHeight_);
  this.element.style.width = Math.round(x) + "px";
  var marginX = this.isRightPositioningForRtlEnabled() && this.isRightToLeft() ? "marginRight" : "marginLeft";
  this.element.style[marginX] = Math.round(x) - this.maxWidth_ + "px";
  this.element.style.marginTop = Math.round(y) - this.maxHeight_ + "px";
};
goog.fx.dom.Swipe.prototype.clip_ = function(x, y, w, h) {
  this.element.style.clip = "rect(" + (h - y) + "px " + w + "px " + h + "px " + (w - x) + "px)";
};
goog.fx.dom.Scroll = function(element, start, end, time, opt_acc) {
  if (start.length != 2 || end.length != 2) {
    throw Error("Start and end points must be 2D");
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.Scroll, goog.fx.dom.PredefinedEffect);
goog.fx.dom.Scroll.prototype.updateStyle = function() {
  if (this.isRightPositioningForRtlEnabled()) {
    goog.style.bidi.setScrollOffset(this.element, Math.round(this.coords[0]));
  } else {
    this.element.scrollLeft = Math.round(this.coords[0]);
  }
  this.element.scrollTop = Math.round(this.coords[1]);
};
goog.fx.dom.Resize = function(element, start, end, time, opt_acc) {
  if (start.length != 2 || end.length != 2) {
    throw Error("Start and end points must be 2D");
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.Resize, goog.fx.dom.PredefinedEffect);
goog.fx.dom.Resize.prototype.updateStyle = function() {
  this.element.style.width = Math.round(this.coords[0]) + "px";
  this.element.style.height = Math.round(this.coords[1]) + "px";
};
goog.fx.dom.ResizeWidth = function(element, start, end, time, opt_acc) {
  goog.fx.dom.PredefinedEffect.call(this, element, [start], [end], time, opt_acc);
};
goog.inherits(goog.fx.dom.ResizeWidth, goog.fx.dom.PredefinedEffect);
goog.fx.dom.ResizeWidth.prototype.updateStyle = function() {
  this.element.style.width = Math.round(this.coords[0]) + "px";
};
goog.fx.dom.ResizeHeight = function(element, start, end, time, opt_acc) {
  goog.fx.dom.PredefinedEffect.call(this, element, [start], [end], time, opt_acc);
};
goog.inherits(goog.fx.dom.ResizeHeight, goog.fx.dom.PredefinedEffect);
goog.fx.dom.ResizeHeight.prototype.updateStyle = function() {
  this.element.style.height = Math.round(this.coords[0]) + "px";
};
goog.fx.dom.Fade = function(element, start, end, time, opt_acc) {
  if (goog.isNumber(start)) {
    start = [start];
  }
  if (goog.isNumber(end)) {
    end = [end];
  }
  goog.fx.dom.PredefinedEffect.call(this, element, start, end, time, opt_acc);
  if (start.length != 1 || end.length != 1) {
    throw Error("Start and end points must be 1D");
  }
};
goog.inherits(goog.fx.dom.Fade, goog.fx.dom.PredefinedEffect);
goog.fx.dom.Fade.prototype.updateStyle = function() {
  goog.style.setOpacity(this.element, this.coords[0]);
};
goog.fx.dom.Fade.prototype.show = function() {
  this.element.style.display = "";
};
goog.fx.dom.Fade.prototype.hide = function() {
  this.element.style.display = "none";
};
goog.fx.dom.FadeOut = function(element, time, opt_acc) {
  goog.fx.dom.Fade.call(this, element, 1, 0, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeOut, goog.fx.dom.Fade);
goog.fx.dom.FadeIn = function(element, time, opt_acc) {
  goog.fx.dom.Fade.call(this, element, 0, 1, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeIn, goog.fx.dom.Fade);
goog.fx.dom.FadeOutAndHide = function(element, time, opt_acc) {
  goog.fx.dom.Fade.call(this, element, 1, 0, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeOutAndHide, goog.fx.dom.Fade);
goog.fx.dom.FadeOutAndHide.prototype.onBegin = function() {
  this.show();
  goog.fx.dom.FadeOutAndHide.superClass_.onBegin.call(this);
};
goog.fx.dom.FadeOutAndHide.prototype.onEnd = function() {
  this.hide();
  goog.fx.dom.FadeOutAndHide.superClass_.onEnd.call(this);
};
goog.fx.dom.FadeInAndShow = function(element, time, opt_acc) {
  goog.fx.dom.Fade.call(this, element, 0, 1, time, opt_acc);
};
goog.inherits(goog.fx.dom.FadeInAndShow, goog.fx.dom.Fade);
goog.fx.dom.FadeInAndShow.prototype.onBegin = function() {
  this.show();
  goog.fx.dom.FadeInAndShow.superClass_.onBegin.call(this);
};
goog.fx.dom.BgColorTransform = function(element, start, end, time, opt_acc) {
  if (start.length != 3 || end.length != 3) {
    throw Error("Start and end points must be 3D");
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.BgColorTransform, goog.fx.dom.PredefinedEffect);
goog.fx.dom.BgColorTransform.prototype.setColor = function() {
  var coordsAsInts = [];
  for (var i = 0;i < this.coords.length;i++) {
    coordsAsInts[i] = Math.round(this.coords[i]);
  }
  var color = "rgb(" + coordsAsInts.join(",") + ")";
  this.element.style.backgroundColor = color;
};
goog.fx.dom.BgColorTransform.prototype.updateStyle = function() {
  this.setColor();
};
goog.fx.dom.bgColorFadeIn = function(element, start, time, opt_eventHandler) {
  var initialBgColor = element.style.backgroundColor || "";
  var computedBgColor = goog.style.getBackgroundColor(element);
  var end;
  if (computedBgColor && (computedBgColor != "transparent" && computedBgColor != "rgba(0, 0, 0, 0)")) {
    end = goog.color.hexToRgb(goog.color.parse(computedBgColor).hex);
  } else {
    end = [255, 255, 255];
  }
  var anim = new goog.fx.dom.BgColorTransform(element, start, end, time);
  function setBgColor() {
    element.style.backgroundColor = initialBgColor;
  }
  if (opt_eventHandler) {
    opt_eventHandler.listen(anim, goog.fx.Transition.EventType.END, setBgColor);
  } else {
    goog.events.listen(anim, goog.fx.Transition.EventType.END, setBgColor);
  }
  anim.play();
};
goog.fx.dom.ColorTransform = function(element, start, end, time, opt_acc) {
  if (start.length != 3 || end.length != 3) {
    throw Error("Start and end points must be 3D");
  }
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(goog.fx.dom.ColorTransform, goog.fx.dom.PredefinedEffect);
goog.fx.dom.ColorTransform.prototype.updateStyle = function() {
  var coordsAsInts = [];
  for (var i = 0;i < this.coords.length;i++) {
    coordsAsInts[i] = Math.round(this.coords[i]);
  }
  var color = "rgb(" + coordsAsInts.join(",") + ")";
  this.element.style.color = color;
};
goog.provide("pear.fx.dom.Slide");
goog.require("goog.fx.dom.PredefinedEffect");
pear.fx.dom.Slide = function(element, start, end, time, opt_acc) {
  goog.fx.dom.PredefinedEffect.apply(this, arguments);
};
goog.inherits(pear.fx.dom.Slide, goog.fx.dom.PredefinedEffect);
pear.fx.dom.Slide.prototype.updateStyle = function() {
  var marginX = this.isRightPositioningForRtlEnabled() && this.isRightToLeft() ? "marginRight" : "marginLeft";
  var y = this.coords[0];
  this.element.style[marginX] = y + "px";
};
goog.provide("goog.dom.classlist");
goog.require("goog.array");
goog.require("goog.asserts");
goog.define("goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST", false);
goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ = goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || !!goog.global["DOMTokenList"];
goog.dom.classlist.get = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ? function(element) {
  return element.classList;
} : function(element) {
  var className = element.className;
  return goog.isString(className) && className.match(/\S+/g) || [];
};
goog.dom.classlist.set = function(element, className) {
  element.className = className;
};
goog.dom.classlist.contains = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ? function(element, className) {
  goog.asserts.assert(!!element.classList);
  return element.classList.contains(className);
} : function(element, className) {
  return goog.array.contains(goog.dom.classlist.get(element), className);
};
goog.dom.classlist.add = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ? function(element, className) {
  element.classList.add(className);
} : function(element, className) {
  if (!goog.dom.classlist.contains(element, className)) {
    element.className += element.className.length > 0 ? " " + className : className;
  }
};
goog.dom.classlist.addAll = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ? function(element, classesToAdd) {
  goog.array.forEach(classesToAdd, function(className) {
    goog.dom.classlist.add(element, className);
  });
} : function(element, classesToAdd) {
  var classMap = {};
  goog.array.forEach(goog.dom.classlist.get(element), function(className) {
    classMap[className] = true;
  });
  goog.array.forEach(classesToAdd, function(className) {
    classMap[className] = true;
  });
  element.className = "";
  for (var className in classMap) {
    element.className += element.className.length > 0 ? " " + className : className;
  }
};
goog.dom.classlist.remove = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ? function(element, className) {
  element.classList.remove(className);
} : function(element, className) {
  if (goog.dom.classlist.contains(element, className)) {
    element.className = goog.array.filter(goog.dom.classlist.get(element), function(c) {
      return c != className;
    }).join(" ");
  }
};
goog.dom.classlist.removeAll = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ? function(element, classesToRemove) {
  goog.array.forEach(classesToRemove, function(className) {
    goog.dom.classlist.remove(element, className);
  });
} : function(element, classesToRemove) {
  element.className = goog.array.filter(goog.dom.classlist.get(element), function(className) {
    return!goog.array.contains(classesToRemove, className);
  }).join(" ");
};
goog.dom.classlist.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classlist.add(element, className);
  } else {
    goog.dom.classlist.remove(element, className);
  }
};
goog.dom.classlist.swap = function(element, fromClass, toClass) {
  if (goog.dom.classlist.contains(element, fromClass)) {
    goog.dom.classlist.remove(element, fromClass);
    goog.dom.classlist.add(element, toClass);
    return true;
  }
  return false;
};
goog.dom.classlist.toggle = function(element, className) {
  var add = !goog.dom.classlist.contains(element, className);
  goog.dom.classlist.enable(element, className, add);
  return add;
};
goog.dom.classlist.addRemove = function(element, classToRemove, classToAdd) {
  goog.dom.classlist.remove(element, classToRemove);
  goog.dom.classlist.add(element, classToAdd);
};
goog.provide("goog.ui.registry");
goog.require("goog.dom.classlist");
goog.ui.registry.getDefaultRenderer = function(componentCtor) {
  var key;
  var rendererCtor;
  while (componentCtor) {
    key = goog.getUid(componentCtor);
    if (rendererCtor = goog.ui.registry.defaultRenderers_[key]) {
      break;
    }
    componentCtor = componentCtor.superClass_ ? componentCtor.superClass_.constructor : null;
  }
  if (rendererCtor) {
    return goog.isFunction(rendererCtor.getInstance) ? rendererCtor.getInstance() : new rendererCtor;
  }
  return null;
};
goog.ui.registry.setDefaultRenderer = function(componentCtor, rendererCtor) {
  if (!goog.isFunction(componentCtor)) {
    throw Error("Invalid component class " + componentCtor);
  }
  if (!goog.isFunction(rendererCtor)) {
    throw Error("Invalid renderer class " + rendererCtor);
  }
  var key = goog.getUid(componentCtor);
  goog.ui.registry.defaultRenderers_[key] = rendererCtor;
};
goog.ui.registry.getDecoratorByClassName = function(className) {
  return className in goog.ui.registry.decoratorFunctions_ ? goog.ui.registry.decoratorFunctions_[className]() : null;
};
goog.ui.registry.setDecoratorByClassName = function(className, decoratorFn) {
  if (!className) {
    throw Error("Invalid class name " + className);
  }
  if (!goog.isFunction(decoratorFn)) {
    throw Error("Invalid decorator function " + decoratorFn);
  }
  goog.ui.registry.decoratorFunctions_[className] = decoratorFn;
};
goog.ui.registry.getDecorator = function(element) {
  var decorator;
  var classNames = goog.dom.classlist.get(element);
  for (var i = 0, len = classNames.length;i < len;i++) {
    if (decorator = goog.ui.registry.getDecoratorByClassName(classNames[i])) {
      return decorator;
    }
  }
  return null;
};
goog.ui.registry.reset = function() {
  goog.ui.registry.defaultRenderers_ = {};
  goog.ui.registry.decoratorFunctions_ = {};
};
goog.ui.registry.defaultRenderers_ = {};
goog.ui.registry.decoratorFunctions_ = {};
goog.provide("goog.ui.decorate");
goog.require("goog.ui.registry");
goog.ui.decorate = function(element) {
  var decorator = goog.ui.registry.getDecorator(element);
  if (decorator) {
    decorator.decorate(element);
  }
  return decorator;
};
goog.provide("goog.ui.ControlContent");
goog.ui.ControlContent;
goog.provide("goog.events.KeyCodes");
goog.require("goog.userAgent");
goog.events.KeyCodes = {WIN_KEY_FF_LINUX:0, MAC_ENTER:3, BACKSPACE:8, TAB:9, NUM_CENTER:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, PAUSE:19, CAPS_LOCK:20, ESC:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, PRINT_SCREEN:44, INSERT:45, DELETE:46, ZERO:48, ONE:49, TWO:50, THREE:51, FOUR:52, FIVE:53, SIX:54, SEVEN:55, EIGHT:56, NINE:57, FF_SEMICOLON:59, FF_EQUALS:61, FF_DASH:173, QUESTION_MARK:63, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, 
L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, META:91, WIN_KEY_RIGHT:92, CONTEXT_MENU:93, NUM_ZERO:96, NUM_ONE:97, NUM_TWO:98, NUM_THREE:99, NUM_FOUR:100, NUM_FIVE:101, NUM_SIX:102, NUM_SEVEN:103, NUM_EIGHT:104, NUM_NINE:105, NUM_MULTIPLY:106, NUM_PLUS:107, NUM_MINUS:109, NUM_PERIOD:110, NUM_DIVISION:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, NUMLOCK:144, SCROLL_LOCK:145, FIRST_MEDIA_KEY:166, 
LAST_MEDIA_KEY:183, SEMICOLON:186, DASH:189, EQUALS:187, COMMA:188, PERIOD:190, SLASH:191, APOSTROPHE:192, TILDE:192, SINGLE_QUOTE:222, OPEN_SQUARE_BRACKET:219, BACKSLASH:220, CLOSE_SQUARE_BRACKET:221, WIN_KEY:224, MAC_FF_META:224, MAC_WK_CMD_LEFT:91, MAC_WK_CMD_RIGHT:93, WIN_IME:229, PHANTOM:255};
goog.events.KeyCodes.isTextModifyingKeyEvent = function(e) {
  if (e.altKey && !e.ctrlKey || (e.metaKey || e.keyCode >= goog.events.KeyCodes.F1 && e.keyCode <= goog.events.KeyCodes.F12)) {
    return false;
  }
  switch(e.keyCode) {
    case goog.events.KeyCodes.ALT:
    ;
    case goog.events.KeyCodes.CAPS_LOCK:
    ;
    case goog.events.KeyCodes.CONTEXT_MENU:
    ;
    case goog.events.KeyCodes.CTRL:
    ;
    case goog.events.KeyCodes.DOWN:
    ;
    case goog.events.KeyCodes.END:
    ;
    case goog.events.KeyCodes.ESC:
    ;
    case goog.events.KeyCodes.HOME:
    ;
    case goog.events.KeyCodes.INSERT:
    ;
    case goog.events.KeyCodes.LEFT:
    ;
    case goog.events.KeyCodes.MAC_FF_META:
    ;
    case goog.events.KeyCodes.META:
    ;
    case goog.events.KeyCodes.NUMLOCK:
    ;
    case goog.events.KeyCodes.NUM_CENTER:
    ;
    case goog.events.KeyCodes.PAGE_DOWN:
    ;
    case goog.events.KeyCodes.PAGE_UP:
    ;
    case goog.events.KeyCodes.PAUSE:
    ;
    case goog.events.KeyCodes.PHANTOM:
    ;
    case goog.events.KeyCodes.PRINT_SCREEN:
    ;
    case goog.events.KeyCodes.RIGHT:
    ;
    case goog.events.KeyCodes.SCROLL_LOCK:
    ;
    case goog.events.KeyCodes.SHIFT:
    ;
    case goog.events.KeyCodes.UP:
    ;
    case goog.events.KeyCodes.WIN_KEY:
    ;
    case goog.events.KeyCodes.WIN_KEY_RIGHT:
      return false;
    case goog.events.KeyCodes.WIN_KEY_FF_LINUX:
      return!goog.userAgent.GECKO;
    default:
      return e.keyCode < goog.events.KeyCodes.FIRST_MEDIA_KEY || e.keyCode > goog.events.KeyCodes.LAST_MEDIA_KEY;
  }
};
goog.events.KeyCodes.firesKeyPressEvent = function(keyCode, opt_heldKeyCode, opt_shiftKey, opt_ctrlKey, opt_altKey) {
  if (!goog.userAgent.IE && !(goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("525"))) {
    return true;
  }
  if (goog.userAgent.MAC && opt_altKey) {
    return goog.events.KeyCodes.isCharacterKey(keyCode);
  }
  if (opt_altKey && !opt_ctrlKey) {
    return false;
  }
  if (goog.isNumber(opt_heldKeyCode)) {
    opt_heldKeyCode = goog.events.KeyCodes.normalizeKeyCode(opt_heldKeyCode);
  }
  if (!opt_shiftKey && (opt_heldKeyCode == goog.events.KeyCodes.CTRL || (opt_heldKeyCode == goog.events.KeyCodes.ALT || goog.userAgent.MAC && opt_heldKeyCode == goog.events.KeyCodes.META))) {
    return false;
  }
  if (goog.userAgent.WEBKIT && (opt_ctrlKey && opt_shiftKey)) {
    switch(keyCode) {
      case goog.events.KeyCodes.BACKSLASH:
      ;
      case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
      ;
      case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      ;
      case goog.events.KeyCodes.TILDE:
      ;
      case goog.events.KeyCodes.SEMICOLON:
      ;
      case goog.events.KeyCodes.DASH:
      ;
      case goog.events.KeyCodes.EQUALS:
      ;
      case goog.events.KeyCodes.COMMA:
      ;
      case goog.events.KeyCodes.PERIOD:
      ;
      case goog.events.KeyCodes.SLASH:
      ;
      case goog.events.KeyCodes.APOSTROPHE:
      ;
      case goog.events.KeyCodes.SINGLE_QUOTE:
        return false;
    }
  }
  if (goog.userAgent.IE && (opt_ctrlKey && opt_heldKeyCode == keyCode)) {
    return false;
  }
  switch(keyCode) {
    case goog.events.KeyCodes.ENTER:
      return!(goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9));
    case goog.events.KeyCodes.ESC:
      return!goog.userAgent.WEBKIT;
  }
  return goog.events.KeyCodes.isCharacterKey(keyCode);
};
goog.events.KeyCodes.isCharacterKey = function(keyCode) {
  if (keyCode >= goog.events.KeyCodes.ZERO && keyCode <= goog.events.KeyCodes.NINE) {
    return true;
  }
  if (keyCode >= goog.events.KeyCodes.NUM_ZERO && keyCode <= goog.events.KeyCodes.NUM_MULTIPLY) {
    return true;
  }
  if (keyCode >= goog.events.KeyCodes.A && keyCode <= goog.events.KeyCodes.Z) {
    return true;
  }
  if (goog.userAgent.WEBKIT && keyCode == 0) {
    return true;
  }
  switch(keyCode) {
    case goog.events.KeyCodes.SPACE:
    ;
    case goog.events.KeyCodes.QUESTION_MARK:
    ;
    case goog.events.KeyCodes.NUM_PLUS:
    ;
    case goog.events.KeyCodes.NUM_MINUS:
    ;
    case goog.events.KeyCodes.NUM_PERIOD:
    ;
    case goog.events.KeyCodes.NUM_DIVISION:
    ;
    case goog.events.KeyCodes.SEMICOLON:
    ;
    case goog.events.KeyCodes.FF_SEMICOLON:
    ;
    case goog.events.KeyCodes.DASH:
    ;
    case goog.events.KeyCodes.EQUALS:
    ;
    case goog.events.KeyCodes.FF_EQUALS:
    ;
    case goog.events.KeyCodes.COMMA:
    ;
    case goog.events.KeyCodes.PERIOD:
    ;
    case goog.events.KeyCodes.SLASH:
    ;
    case goog.events.KeyCodes.APOSTROPHE:
    ;
    case goog.events.KeyCodes.SINGLE_QUOTE:
    ;
    case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
    ;
    case goog.events.KeyCodes.BACKSLASH:
    ;
    case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      return true;
    default:
      return false;
  }
};
goog.events.KeyCodes.normalizeKeyCode = function(keyCode) {
  if (goog.userAgent.GECKO) {
    return goog.events.KeyCodes.normalizeGeckoKeyCode(keyCode);
  } else {
    if (goog.userAgent.MAC && goog.userAgent.WEBKIT) {
      return goog.events.KeyCodes.normalizeMacWebKitKeyCode(keyCode);
    } else {
      return keyCode;
    }
  }
};
goog.events.KeyCodes.normalizeGeckoKeyCode = function(keyCode) {
  switch(keyCode) {
    case goog.events.KeyCodes.FF_EQUALS:
      return goog.events.KeyCodes.EQUALS;
    case goog.events.KeyCodes.FF_SEMICOLON:
      return goog.events.KeyCodes.SEMICOLON;
    case goog.events.KeyCodes.FF_DASH:
      return goog.events.KeyCodes.DASH;
    case goog.events.KeyCodes.MAC_FF_META:
      return goog.events.KeyCodes.META;
    case goog.events.KeyCodes.WIN_KEY_FF_LINUX:
      return goog.events.KeyCodes.WIN_KEY;
    default:
      return keyCode;
  }
};
goog.events.KeyCodes.normalizeMacWebKitKeyCode = function(keyCode) {
  switch(keyCode) {
    case goog.events.KeyCodes.MAC_WK_CMD_RIGHT:
      return goog.events.KeyCodes.META;
    default:
      return keyCode;
  }
};
goog.provide("goog.events.KeyEvent");
goog.provide("goog.events.KeyHandler");
goog.provide("goog.events.KeyHandler.EventType");
goog.require("goog.events");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.userAgent");
goog.events.KeyHandler = function(opt_element, opt_capture) {
  goog.events.EventTarget.call(this);
  if (opt_element) {
    this.attach(opt_element, opt_capture);
  }
};
goog.inherits(goog.events.KeyHandler, goog.events.EventTarget);
goog.events.KeyHandler.prototype.element_ = null;
goog.events.KeyHandler.prototype.keyPressKey_ = null;
goog.events.KeyHandler.prototype.keyDownKey_ = null;
goog.events.KeyHandler.prototype.keyUpKey_ = null;
goog.events.KeyHandler.prototype.lastKey_ = -1;
goog.events.KeyHandler.prototype.keyCode_ = -1;
goog.events.KeyHandler.prototype.altKey_ = false;
goog.events.KeyHandler.EventType = {KEY:"key"};
goog.events.KeyHandler.safariKey_ = {3:goog.events.KeyCodes.ENTER, 12:goog.events.KeyCodes.NUMLOCK, 63232:goog.events.KeyCodes.UP, 63233:goog.events.KeyCodes.DOWN, 63234:goog.events.KeyCodes.LEFT, 63235:goog.events.KeyCodes.RIGHT, 63236:goog.events.KeyCodes.F1, 63237:goog.events.KeyCodes.F2, 63238:goog.events.KeyCodes.F3, 63239:goog.events.KeyCodes.F4, 63240:goog.events.KeyCodes.F5, 63241:goog.events.KeyCodes.F6, 63242:goog.events.KeyCodes.F7, 63243:goog.events.KeyCodes.F8, 63244:goog.events.KeyCodes.F9, 
63245:goog.events.KeyCodes.F10, 63246:goog.events.KeyCodes.F11, 63247:goog.events.KeyCodes.F12, 63248:goog.events.KeyCodes.PRINT_SCREEN, 63272:goog.events.KeyCodes.DELETE, 63273:goog.events.KeyCodes.HOME, 63275:goog.events.KeyCodes.END, 63276:goog.events.KeyCodes.PAGE_UP, 63277:goog.events.KeyCodes.PAGE_DOWN, 63289:goog.events.KeyCodes.NUMLOCK, 63302:goog.events.KeyCodes.INSERT};
goog.events.KeyHandler.keyIdentifier_ = {"Up":goog.events.KeyCodes.UP, "Down":goog.events.KeyCodes.DOWN, "Left":goog.events.KeyCodes.LEFT, "Right":goog.events.KeyCodes.RIGHT, "Enter":goog.events.KeyCodes.ENTER, "F1":goog.events.KeyCodes.F1, "F2":goog.events.KeyCodes.F2, "F3":goog.events.KeyCodes.F3, "F4":goog.events.KeyCodes.F4, "F5":goog.events.KeyCodes.F5, "F6":goog.events.KeyCodes.F6, "F7":goog.events.KeyCodes.F7, "F8":goog.events.KeyCodes.F8, "F9":goog.events.KeyCodes.F9, "F10":goog.events.KeyCodes.F10, 
"F11":goog.events.KeyCodes.F11, "F12":goog.events.KeyCodes.F12, "U+007F":goog.events.KeyCodes.DELETE, "Home":goog.events.KeyCodes.HOME, "End":goog.events.KeyCodes.END, "PageUp":goog.events.KeyCodes.PAGE_UP, "PageDown":goog.events.KeyCodes.PAGE_DOWN, "Insert":goog.events.KeyCodes.INSERT};
goog.events.KeyHandler.USES_KEYDOWN_ = goog.userAgent.IE || goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("525");
goog.events.KeyHandler.SAVE_ALT_FOR_KEYPRESS_ = goog.userAgent.MAC && goog.userAgent.GECKO;
goog.events.KeyHandler.prototype.handleKeyDown_ = function(e) {
  if (goog.userAgent.WEBKIT) {
    if (this.lastKey_ == goog.events.KeyCodes.CTRL && !e.ctrlKey || (this.lastKey_ == goog.events.KeyCodes.ALT && !e.altKey || goog.userAgent.MAC && (this.lastKey_ == goog.events.KeyCodes.META && !e.metaKey))) {
      this.lastKey_ = -1;
      this.keyCode_ = -1;
    }
  }
  if (this.lastKey_ == -1) {
    if (e.ctrlKey && e.keyCode != goog.events.KeyCodes.CTRL) {
      this.lastKey_ = goog.events.KeyCodes.CTRL;
    } else {
      if (e.altKey && e.keyCode != goog.events.KeyCodes.ALT) {
        this.lastKey_ = goog.events.KeyCodes.ALT;
      } else {
        if (e.metaKey && e.keyCode != goog.events.KeyCodes.META) {
          this.lastKey_ = goog.events.KeyCodes.META;
        }
      }
    }
  }
  if (goog.events.KeyHandler.USES_KEYDOWN_ && !goog.events.KeyCodes.firesKeyPressEvent(e.keyCode, this.lastKey_, e.shiftKey, e.ctrlKey, e.altKey)) {
    this.handleEvent(e);
  } else {
    this.keyCode_ = goog.events.KeyCodes.normalizeKeyCode(e.keyCode);
    if (goog.events.KeyHandler.SAVE_ALT_FOR_KEYPRESS_) {
      this.altKey_ = e.altKey;
    }
  }
};
goog.events.KeyHandler.prototype.resetState = function() {
  this.lastKey_ = -1;
  this.keyCode_ = -1;
};
goog.events.KeyHandler.prototype.handleKeyup_ = function(e) {
  this.resetState();
  this.altKey_ = e.altKey;
};
goog.events.KeyHandler.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  var keyCode, charCode;
  var altKey = be.altKey;
  if (goog.userAgent.IE && e.type == goog.events.EventType.KEYPRESS) {
    keyCode = this.keyCode_;
    charCode = keyCode != goog.events.KeyCodes.ENTER && keyCode != goog.events.KeyCodes.ESC ? be.keyCode : 0;
  } else {
    if (goog.userAgent.WEBKIT && e.type == goog.events.EventType.KEYPRESS) {
      keyCode = this.keyCode_;
      charCode = be.charCode >= 0 && (be.charCode < 63232 && goog.events.KeyCodes.isCharacterKey(keyCode)) ? be.charCode : 0;
    } else {
      if (goog.userAgent.OPERA) {
        keyCode = this.keyCode_;
        charCode = goog.events.KeyCodes.isCharacterKey(keyCode) ? be.keyCode : 0;
      } else {
        keyCode = be.keyCode || this.keyCode_;
        charCode = be.charCode || 0;
        if (goog.events.KeyHandler.SAVE_ALT_FOR_KEYPRESS_) {
          altKey = this.altKey_;
        }
        if (goog.userAgent.MAC && (charCode == goog.events.KeyCodes.QUESTION_MARK && keyCode == goog.events.KeyCodes.WIN_KEY)) {
          keyCode = goog.events.KeyCodes.SLASH;
        }
      }
    }
  }
  keyCode = goog.events.KeyCodes.normalizeKeyCode(keyCode);
  var key = keyCode;
  var keyIdentifier = be.keyIdentifier;
  if (keyCode) {
    if (keyCode >= 63232 && keyCode in goog.events.KeyHandler.safariKey_) {
      key = goog.events.KeyHandler.safariKey_[keyCode];
    } else {
      if (keyCode == 25 && e.shiftKey) {
        key = 9;
      }
    }
  } else {
    if (keyIdentifier && keyIdentifier in goog.events.KeyHandler.keyIdentifier_) {
      key = goog.events.KeyHandler.keyIdentifier_[keyIdentifier];
    }
  }
  var repeat = key == this.lastKey_;
  this.lastKey_ = key;
  var event = new goog.events.KeyEvent(key, charCode, repeat, be);
  event.altKey = altKey;
  this.dispatchEvent(event);
};
goog.events.KeyHandler.prototype.getElement = function() {
  return this.element_;
};
goog.events.KeyHandler.prototype.attach = function(element, opt_capture) {
  if (this.keyUpKey_) {
    this.detach();
  }
  this.element_ = element;
  this.keyPressKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYPRESS, this, opt_capture);
  this.keyDownKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYDOWN, this.handleKeyDown_, opt_capture, this);
  this.keyUpKey_ = goog.events.listen(this.element_, goog.events.EventType.KEYUP, this.handleKeyup_, opt_capture, this);
};
goog.events.KeyHandler.prototype.detach = function() {
  if (this.keyPressKey_) {
    goog.events.unlistenByKey(this.keyPressKey_);
    goog.events.unlistenByKey(this.keyDownKey_);
    goog.events.unlistenByKey(this.keyUpKey_);
    this.keyPressKey_ = null;
    this.keyDownKey_ = null;
    this.keyUpKey_ = null;
  }
  this.element_ = null;
  this.lastKey_ = -1;
  this.keyCode_ = -1;
};
goog.events.KeyHandler.prototype.disposeInternal = function() {
  goog.events.KeyHandler.superClass_.disposeInternal.call(this);
  this.detach();
};
goog.events.KeyEvent = function(keyCode, charCode, repeat, browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent);
  this.type = goog.events.KeyHandler.EventType.KEY;
  this.keyCode = keyCode;
  this.charCode = charCode;
  this.repeat = repeat;
};
goog.inherits(goog.events.KeyEvent, goog.events.BrowserEvent);
goog.provide("goog.ui.Control");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.string");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlContent");
goog.require("goog.ui.ControlRenderer");
goog.require("goog.ui.decorate");
goog.require("goog.ui.registry");
goog.require("goog.userAgent");
goog.ui.Control = function(opt_content, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.registry.getDefaultRenderer(this.constructor);
  this.setContentInternal(goog.isDef(opt_content) ? opt_content : null);
};
goog.inherits(goog.ui.Control, goog.ui.Component);
goog.ui.Control.registerDecorator = goog.ui.registry.setDecoratorByClassName;
goog.ui.Control.getDecorator = (goog.ui.registry.getDecorator);
goog.ui.Control.decorate = (goog.ui.decorate);
goog.ui.Control.prototype.renderer_;
goog.ui.Control.prototype.content_ = null;
goog.ui.Control.prototype.state_ = 0;
goog.ui.Control.prototype.supportedStates_ = goog.ui.Component.State.DISABLED | goog.ui.Component.State.HOVER | goog.ui.Component.State.ACTIVE | goog.ui.Component.State.FOCUSED;
goog.ui.Control.prototype.autoStates_ = goog.ui.Component.State.ALL;
goog.ui.Control.prototype.statesWithTransitionEvents_ = 0;
goog.ui.Control.prototype.visible_ = true;
goog.ui.Control.prototype.keyHandler_;
goog.ui.Control.prototype.extraClassNames_ = null;
goog.ui.Control.prototype.handleMouseEvents_ = true;
goog.ui.Control.prototype.allowTextSelection_ = false;
goog.ui.Control.prototype.preferredAriaRole_ = null;
goog.ui.Control.prototype.isHandleMouseEvents = function() {
  return this.handleMouseEvents_;
};
goog.ui.Control.prototype.setHandleMouseEvents = function(enable) {
  if (this.isInDocument() && enable != this.handleMouseEvents_) {
    this.enableMouseEventHandling_(enable);
  }
  this.handleMouseEvents_ = enable;
};
goog.ui.Control.prototype.getKeyEventTarget = function() {
  return this.renderer_.getKeyEventTarget(this);
};
goog.ui.Control.prototype.getKeyHandler = function() {
  return this.keyHandler_ || (this.keyHandler_ = new goog.events.KeyHandler);
};
goog.ui.Control.prototype.getRenderer = function() {
  return this.renderer_;
};
goog.ui.Control.prototype.setRenderer = function(renderer) {
  if (this.isInDocument()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if (this.getElement()) {
    this.setElementInternal(null);
  }
  this.renderer_ = renderer;
};
goog.ui.Control.prototype.getExtraClassNames = function() {
  return this.extraClassNames_;
};
goog.ui.Control.prototype.addClassName = function(className) {
  if (className) {
    if (this.extraClassNames_) {
      if (!goog.array.contains(this.extraClassNames_, className)) {
        this.extraClassNames_.push(className);
      }
    } else {
      this.extraClassNames_ = [className];
    }
    this.renderer_.enableExtraClassName(this, className, true);
  }
};
goog.ui.Control.prototype.removeClassName = function(className) {
  if (className && (this.extraClassNames_ && goog.array.remove(this.extraClassNames_, className))) {
    if (this.extraClassNames_.length == 0) {
      this.extraClassNames_ = null;
    }
    this.renderer_.enableExtraClassName(this, className, false);
  }
};
goog.ui.Control.prototype.enableClassName = function(className, enable) {
  if (enable) {
    this.addClassName(className);
  } else {
    this.removeClassName(className);
  }
};
goog.ui.Control.prototype.createDom = function() {
  var element = this.renderer_.createDom(this);
  this.setElementInternal(element);
  this.renderer_.setAriaRole(element, this.getPreferredAriaRole());
  if (!this.isAllowTextSelection()) {
    this.renderer_.setAllowTextSelection(element, false);
  }
  if (!this.isVisible()) {
    this.renderer_.setVisible(element, false);
  }
};
goog.ui.Control.prototype.getPreferredAriaRole = function() {
  return this.preferredAriaRole_;
};
goog.ui.Control.prototype.setPreferredAriaRole = function(role) {
  this.preferredAriaRole_ = role;
};
goog.ui.Control.prototype.getContentElement = function() {
  return this.renderer_.getContentElement(this.getElement());
};
goog.ui.Control.prototype.canDecorate = function(element) {
  return this.renderer_.canDecorate(element);
};
goog.ui.Control.prototype.decorateInternal = function(element) {
  element = this.renderer_.decorate(this, element);
  this.setElementInternal(element);
  this.renderer_.setAriaRole(element, this.getPreferredAriaRole());
  if (!this.isAllowTextSelection()) {
    this.renderer_.setAllowTextSelection(element, false);
  }
  this.visible_ = element.style.display != "none";
};
goog.ui.Control.prototype.enterDocument = function() {
  goog.ui.Control.superClass_.enterDocument.call(this);
  this.renderer_.initializeDom(this);
  if (this.supportedStates_ & ~goog.ui.Component.State.DISABLED) {
    if (this.isHandleMouseEvents()) {
      this.enableMouseEventHandling_(true);
    }
    if (this.isSupportedState(goog.ui.Component.State.FOCUSED)) {
      var keyTarget = this.getKeyEventTarget();
      if (keyTarget) {
        var keyHandler = this.getKeyHandler();
        keyHandler.attach(keyTarget);
        this.getHandler().listen(keyHandler, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent).listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur);
      }
    }
  }
};
goog.ui.Control.prototype.enableMouseEventHandling_ = function(enable) {
  var handler = this.getHandler();
  var element = this.getElement();
  if (enable) {
    handler.listen(element, goog.events.EventType.MOUSEOVER, this.handleMouseOver).listen(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).listen(element, goog.events.EventType.MOUSEUP, this.handleMouseUp).listen(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    if (this.handleContextMenu != goog.nullFunction) {
      handler.listen(element, goog.events.EventType.CONTEXTMENU, this.handleContextMenu);
    }
    if (goog.userAgent.IE) {
      handler.listen(element, goog.events.EventType.DBLCLICK, this.handleDblClick);
    }
  } else {
    handler.unlisten(element, goog.events.EventType.MOUSEOVER, this.handleMouseOver).unlisten(element, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).unlisten(element, goog.events.EventType.MOUSEUP, this.handleMouseUp).unlisten(element, goog.events.EventType.MOUSEOUT, this.handleMouseOut);
    if (this.handleContextMenu != goog.nullFunction) {
      handler.unlisten(element, goog.events.EventType.CONTEXTMENU, this.handleContextMenu);
    }
    if (goog.userAgent.IE) {
      handler.unlisten(element, goog.events.EventType.DBLCLICK, this.handleDblClick);
    }
  }
};
goog.ui.Control.prototype.exitDocument = function() {
  goog.ui.Control.superClass_.exitDocument.call(this);
  if (this.keyHandler_) {
    this.keyHandler_.detach();
  }
  if (this.isVisible() && this.isEnabled()) {
    this.renderer_.setFocusable(this, false);
  }
};
goog.ui.Control.prototype.disposeInternal = function() {
  goog.ui.Control.superClass_.disposeInternal.call(this);
  if (this.keyHandler_) {
    this.keyHandler_.dispose();
    delete this.keyHandler_;
  }
  delete this.renderer_;
  this.content_ = null;
  this.extraClassNames_ = null;
};
goog.ui.Control.prototype.getContent = function() {
  return this.content_;
};
goog.ui.Control.prototype.setContent = function(content) {
  this.renderer_.setContent(this.getElement(), content);
  this.setContentInternal(content);
};
goog.ui.Control.prototype.setContentInternal = function(content) {
  this.content_ = content;
};
goog.ui.Control.prototype.getCaption = function() {
  var content = this.getContent();
  if (!content) {
    return "";
  }
  var caption = goog.isString(content) ? content : goog.isArray(content) ? goog.array.map(content, goog.dom.getRawTextContent).join("") : goog.dom.getTextContent((content));
  return goog.string.collapseBreakingSpaces(caption);
};
goog.ui.Control.prototype.setCaption = function(caption) {
  this.setContent(caption);
};
goog.ui.Control.prototype.setRightToLeft = function(rightToLeft) {
  goog.ui.Control.superClass_.setRightToLeft.call(this, rightToLeft);
  var element = this.getElement();
  if (element) {
    this.renderer_.setRightToLeft(element, rightToLeft);
  }
};
goog.ui.Control.prototype.isAllowTextSelection = function() {
  return this.allowTextSelection_;
};
goog.ui.Control.prototype.setAllowTextSelection = function(allow) {
  this.allowTextSelection_ = allow;
  var element = this.getElement();
  if (element) {
    this.renderer_.setAllowTextSelection(element, allow);
  }
};
goog.ui.Control.prototype.isVisible = function() {
  return this.visible_;
};
goog.ui.Control.prototype.setVisible = function(visible, opt_force) {
  if (opt_force || this.visible_ != visible && this.dispatchEvent(visible ? goog.ui.Component.EventType.SHOW : goog.ui.Component.EventType.HIDE)) {
    var element = this.getElement();
    if (element) {
      this.renderer_.setVisible(element, visible);
    }
    if (this.isEnabled()) {
      this.renderer_.setFocusable(this, visible);
    }
    this.visible_ = visible;
    return true;
  }
  return false;
};
goog.ui.Control.prototype.isEnabled = function() {
  return!this.hasState(goog.ui.Component.State.DISABLED);
};
goog.ui.Control.prototype.isParentDisabled_ = function() {
  var parent = this.getParent();
  return!!parent && (typeof parent.isEnabled == "function" && !parent.isEnabled());
};
goog.ui.Control.prototype.setEnabled = function(enable) {
  if (!this.isParentDisabled_() && this.isTransitionAllowed(goog.ui.Component.State.DISABLED, !enable)) {
    if (!enable) {
      this.setActive(false);
      this.setHighlighted(false);
    }
    if (this.isVisible()) {
      this.renderer_.setFocusable(this, enable);
    }
    this.setState(goog.ui.Component.State.DISABLED, !enable);
  }
};
goog.ui.Control.prototype.isHighlighted = function() {
  return this.hasState(goog.ui.Component.State.HOVER);
};
goog.ui.Control.prototype.setHighlighted = function(highlight) {
  if (this.isTransitionAllowed(goog.ui.Component.State.HOVER, highlight)) {
    this.setState(goog.ui.Component.State.HOVER, highlight);
  }
};
goog.ui.Control.prototype.isActive = function() {
  return this.hasState(goog.ui.Component.State.ACTIVE);
};
goog.ui.Control.prototype.setActive = function(active) {
  if (this.isTransitionAllowed(goog.ui.Component.State.ACTIVE, active)) {
    this.setState(goog.ui.Component.State.ACTIVE, active);
  }
};
goog.ui.Control.prototype.isSelected = function() {
  return this.hasState(goog.ui.Component.State.SELECTED);
};
goog.ui.Control.prototype.setSelected = function(select) {
  if (this.isTransitionAllowed(goog.ui.Component.State.SELECTED, select)) {
    this.setState(goog.ui.Component.State.SELECTED, select);
  }
};
goog.ui.Control.prototype.isChecked = function() {
  return this.hasState(goog.ui.Component.State.CHECKED);
};
goog.ui.Control.prototype.setChecked = function(check) {
  if (this.isTransitionAllowed(goog.ui.Component.State.CHECKED, check)) {
    this.setState(goog.ui.Component.State.CHECKED, check);
  }
};
goog.ui.Control.prototype.isFocused = function() {
  return this.hasState(goog.ui.Component.State.FOCUSED);
};
goog.ui.Control.prototype.setFocused = function(focused) {
  if (this.isTransitionAllowed(goog.ui.Component.State.FOCUSED, focused)) {
    this.setState(goog.ui.Component.State.FOCUSED, focused);
  }
};
goog.ui.Control.prototype.isOpen = function() {
  return this.hasState(goog.ui.Component.State.OPENED);
};
goog.ui.Control.prototype.setOpen = function(open) {
  if (this.isTransitionAllowed(goog.ui.Component.State.OPENED, open)) {
    this.setState(goog.ui.Component.State.OPENED, open);
  }
};
goog.ui.Control.prototype.getState = function() {
  return this.state_;
};
goog.ui.Control.prototype.hasState = function(state) {
  return!!(this.state_ & state);
};
goog.ui.Control.prototype.setState = function(state, enable) {
  if (this.isSupportedState(state) && enable != this.hasState(state)) {
    this.renderer_.setState(this, state, enable);
    this.state_ = enable ? this.state_ | state : this.state_ & ~state;
  }
};
goog.ui.Control.prototype.setStateInternal = function(state) {
  this.state_ = state;
};
goog.ui.Control.prototype.isSupportedState = function(state) {
  return!!(this.supportedStates_ & state);
};
goog.ui.Control.prototype.setSupportedState = function(state, support) {
  if (this.isInDocument() && (this.hasState(state) && !support)) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  if (!support && this.hasState(state)) {
    this.setState(state, false);
  }
  this.supportedStates_ = support ? this.supportedStates_ | state : this.supportedStates_ & ~state;
};
goog.ui.Control.prototype.isAutoState = function(state) {
  return!!(this.autoStates_ & state) && this.isSupportedState(state);
};
goog.ui.Control.prototype.setAutoStates = function(states, enable) {
  this.autoStates_ = enable ? this.autoStates_ | states : this.autoStates_ & ~states;
};
goog.ui.Control.prototype.isDispatchTransitionEvents = function(state) {
  return!!(this.statesWithTransitionEvents_ & state) && this.isSupportedState(state);
};
goog.ui.Control.prototype.setDispatchTransitionEvents = function(states, enable) {
  this.statesWithTransitionEvents_ = enable ? this.statesWithTransitionEvents_ | states : this.statesWithTransitionEvents_ & ~states;
};
goog.ui.Control.prototype.isTransitionAllowed = function(state, enable) {
  return this.isSupportedState(state) && (this.hasState(state) != enable && ((!(this.statesWithTransitionEvents_ & state) || this.dispatchEvent(goog.ui.Component.getStateTransitionEvent(state, enable))) && !this.isDisposed()));
};
goog.ui.Control.prototype.handleMouseOver = function(e) {
  if (!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) && (this.dispatchEvent(goog.ui.Component.EventType.ENTER) && (this.isEnabled() && this.isAutoState(goog.ui.Component.State.HOVER)))) {
    this.setHighlighted(true);
  }
};
goog.ui.Control.prototype.handleMouseOut = function(e) {
  if (!goog.ui.Control.isMouseEventWithinElement_(e, this.getElement()) && this.dispatchEvent(goog.ui.Component.EventType.LEAVE)) {
    if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
      this.setActive(false);
    }
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(false);
    }
  }
};
goog.ui.Control.prototype.handleContextMenu = goog.nullFunction;
goog.ui.Control.isMouseEventWithinElement_ = function(e, elem) {
  return!!e.relatedTarget && goog.dom.contains(elem, e.relatedTarget);
};
goog.ui.Control.prototype.handleMouseDown = function(e) {
  if (this.isEnabled()) {
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(true);
    }
    if (e.isMouseActionButton()) {
      if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
        this.setActive(true);
      }
      if (this.renderer_.isFocusable(this)) {
        this.getKeyEventTarget().focus();
      }
    }
  }
  if (!this.isAllowTextSelection() && e.isMouseActionButton()) {
    e.preventDefault();
  }
};
goog.ui.Control.prototype.handleMouseUp = function(e) {
  if (this.isEnabled()) {
    if (this.isAutoState(goog.ui.Component.State.HOVER)) {
      this.setHighlighted(true);
    }
    if (this.isActive() && (this.performActionInternal(e) && this.isAutoState(goog.ui.Component.State.ACTIVE))) {
      this.setActive(false);
    }
  }
};
goog.ui.Control.prototype.handleDblClick = function(e) {
  if (this.isEnabled()) {
    this.performActionInternal(e);
  }
};
goog.ui.Control.prototype.performActionInternal = function(e) {
  if (this.isAutoState(goog.ui.Component.State.CHECKED)) {
    this.setChecked(!this.isChecked());
  }
  if (this.isAutoState(goog.ui.Component.State.SELECTED)) {
    this.setSelected(true);
  }
  if (this.isAutoState(goog.ui.Component.State.OPENED)) {
    this.setOpen(!this.isOpen());
  }
  var actionEvent = new goog.events.Event(goog.ui.Component.EventType.ACTION, this);
  if (e) {
    actionEvent.altKey = e.altKey;
    actionEvent.ctrlKey = e.ctrlKey;
    actionEvent.metaKey = e.metaKey;
    actionEvent.shiftKey = e.shiftKey;
    actionEvent.platformModifierKey = e.platformModifierKey;
  }
  return this.dispatchEvent(actionEvent);
};
goog.ui.Control.prototype.handleFocus = function(e) {
  if (this.isAutoState(goog.ui.Component.State.FOCUSED)) {
    this.setFocused(true);
  }
};
goog.ui.Control.prototype.handleBlur = function(e) {
  if (this.isAutoState(goog.ui.Component.State.ACTIVE)) {
    this.setActive(false);
  }
  if (this.isAutoState(goog.ui.Component.State.FOCUSED)) {
    this.setFocused(false);
  }
};
goog.ui.Control.prototype.handleKeyEvent = function(e) {
  if (this.isVisible() && (this.isEnabled() && this.handleKeyEventInternal(e))) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
};
goog.ui.Control.prototype.handleKeyEventInternal = function(e) {
  return e.keyCode == goog.events.KeyCodes.ENTER && this.performActionInternal(e);
};
goog.ui.registry.setDefaultRenderer(goog.ui.Control, goog.ui.ControlRenderer);
goog.ui.registry.setDecoratorByClassName(goog.ui.ControlRenderer.CSS_CLASS, function() {
  return new goog.ui.Control(null);
});
goog.provide("pear.ui.Cell");
goog.require("goog.ui.Control");
goog.require("pear.ui.CellRenderer");
pear.ui.Cell = function(opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, "", opt_renderer || pear.ui.CellRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.SELECTED, false);
  this.setSupportedState(goog.ui.Component.State.CHECKED, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  this.setAllowTextSelection(true);
};
goog.inherits(pear.ui.Cell, goog.ui.Control);
pear.ui.Cell.EventType = {CLICK:"evt-pear-grid-cell-click", OPTION_CLICK:"evt-pear-grid-cell-options-click"};
goog.ui.Component.prototype.columnIndex_ = -1;
goog.ui.Component.prototype.columnWidth_ = 0;
goog.ui.Component.prototype.row_ = null;
goog.ui.Component.prototype.grid_ = null;
pear.ui.Cell.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.row_ = null;
  pear.ui.Cell.superClass_.disposeInternal.call(this);
};
pear.ui.Cell.prototype.enterDocument = function() {
  this.addClassName("pear-grid-cell");
  pear.ui.Cell.superClass_.enterDocument.call(this);
  this.draw();
};
pear.ui.Cell.prototype.getRow = function() {
  this.row_ = this.row_ || (this.getParent());
  return this.row_;
};
pear.ui.Cell.prototype.getGrid = function() {
  this.grid_ = this.grid_ || this.getRow().getGrid();
  return this.grid_;
};
pear.ui.Cell.prototype.setCellIndex = function(index) {
  this.columnIndex_ = index;
};
pear.ui.Cell.prototype.getCellIndex = function() {
  return this.columnIndex_;
};
pear.ui.Cell.prototype.getColumnObject = function() {
  var grid = this.getGrid();
  var dv = grid.getDataView();
  var columns = dv.getColumns();
  return columns[this.getCellIndex()];
};
pear.ui.Cell.prototype.getRowPosition = function() {
  return this.getRow().getRowPosition();
};
pear.ui.Cell.prototype.setCellWidth = function(width, opt_render) {
  this.columnWidth_ = width;
  if (opt_render) {
    this.draw();
  }
};
pear.ui.Cell.prototype.getCellWidth = function() {
  this.columnWidth_ = this.columnWidth_ || (this.getGrid().getColumnWidth(this.getCellIndex()) || this.getGrid().getConfiguration().ColumnWidth);
  return this.columnWidth_;
};
pear.ui.Cell.prototype.getCellHeight_ = function() {
  return this.getRow().getHeight();
};
pear.ui.Cell.prototype.getCellWidthOffset_ = function() {
  var width = this.getCellWidth();
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());
  return width - paddingBox.left - paddingBox.right - borderBox.left - borderBox.right;
};
pear.ui.Cell.prototype.getCellHeightOffset_ = function() {
  var height = this.getCellHeight_();
  var paddingBox = goog.style.getPaddingBox(this.getElement());
  var borderBox = goog.style.getBorderBox(this.getElement());
  return height - paddingBox.top - paddingBox.bottom - borderBox.top - borderBox.bottom;
};
pear.ui.Cell.prototype.setPosition_ = function() {
  var left, top;
  left = 0;
  top = 0;
  left = 0;
  top = 0;
  var i = 0;
  for (;i < this.getCellIndex();i++) {
    left = left + this.getRow().getCellWidth(i);
  }
  goog.style.setPosition(this.getElement(), left, top);
};
pear.ui.Cell.prototype.setSize_ = function() {
  var width, height;
  width = this.getCellWidthOffset_();
  height = this.getCellHeightOffset_();
  goog.style.setSize(this.getElement(), width, height);
};
pear.ui.Cell.prototype.draw = function() {
  this.setSize_();
  this.setPosition_();
};
goog.provide("pear.ui.HeaderCellMenuRenderer");
goog.require("pear.ui.CellRenderer");
pear.ui.HeaderCellMenuRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.HeaderCellMenuRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.HeaderCellMenuRenderer);
pear.ui.HeaderCellMenuRenderer.CSS_CLASS = goog.getCssName("pear-grid-cell-header-slidemenu");
pear.ui.HeaderCellMenuRenderer.prototype.getCssClass = function() {
  return pear.ui.HeaderCellMenuRenderer.CSS_CLASS;
};
goog.provide("pear.ui.HeaderCell");
goog.require("pear.ui.Cell");
goog.require("pear.ui.HeaderCellRenderer");
goog.require("pear.ui.HeaderCellContentRenderer");
goog.require("pear.ui.HeaderCellMenuRenderer");
goog.require("pear.ui.Resizable");
goog.require("pear.fx.dom.Slide");
pear.ui.HeaderCell = function(opt_renderer, opt_domHelper) {
  pear.ui.Cell.call(this, opt_renderer || pear.ui.HeaderCellRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, true);
};
goog.inherits(pear.ui.HeaderCell, pear.ui.Cell);
pear.ui.HeaderCell.prototype.headerMenu_ = null;
pear.ui.HeaderCell.prototype.contentCell_ = null;
pear.ui.HeaderCell.prototype.disposeInternal = function() {
  if (this.resizable_) {
    this.resizable_.dispose();
    this.resizable_ = null;
  }
  this.sortDirection_ = null;
  pear.ui.HeaderCell.superClass_.disposeInternal.call(this);
};
pear.ui.HeaderCell.prototype.sortDirection_ = null;
pear.ui.HeaderCell.prototype.resizable_ = null;
pear.ui.HeaderCell.prototype.getsortDirection = function() {
  this.sortDirection_ = this.sortDirection_ || pear.ui.Grid.SortDirection.NONE;
  return this.sortDirection_;
};
pear.ui.HeaderCell.prototype.setsortDirection = function(value) {
  this.sortDirection_ = value || pear.ui.Grid.SortDirection.NONE;
};
pear.ui.HeaderCell.prototype.getMenuElement = function() {
  return this.headerMenu_;
};
pear.ui.HeaderCell.prototype.getContent = function() {
  return "";
};
pear.ui.HeaderCell.prototype.enterDocument = function() {
  pear.ui.HeaderCell.superClass_.enterDocument.call(this);
  this.splitHeaderCell_();
  this.registerEvent_();
};
pear.ui.HeaderCell.prototype.registerEvent_ = function() {
  this.getHandler().listen(this, goog.ui.Component.EventType.ENTER, this.handleEnter_, false, this).listen(this, goog.ui.Component.EventType.LEAVE, this.handleLeave_, false, this).listen(this.getElement(), goog.events.EventType.CLICK, this.handleActive_, false, this);
};
pear.ui.HeaderCell.prototype.splitHeaderCell_ = function() {
  var grid = this.getGrid();
  this.contentCell_ = goog.dom.createDom("div", "pear-grid-cell-header-content", this.getModel()["headerText"]);
  goog.dom.appendChild(this.getElement(), this.contentCell_);
  this.syncContentCellOnResize_();
  this.contentIndicator_ = goog.dom.createDom("div", "pear-grid-cell-header-indicators");
  goog.dom.appendChild(this.getElement(), this.contentIndicator_);
  goog.style.setWidth(this.contentIndicator_, 32);
  this.sortIndicator_ = goog.dom.createDom("div", "pear-grid-cell-header-sort");
  goog.dom.appendChild(this.contentIndicator_, this.sortIndicator_);
  this.headerMenu_ = goog.dom.createDom("div", "pear-grid-cell-header-slidemenu", goog.dom.createDom("div", "fa fa-caret-square-o-down"));
  goog.dom.appendChild(this.contentIndicator_, this.headerMenu_);
  this.getHandler().listen(this.headerMenu_, goog.events.EventType.CLICK, this.handleOptionClick_, false, this);
  this.registerEvents_();
  if (grid.getConfiguration().AllowColumnResize) {
    this.createResizeHandle_();
  }
};
pear.ui.HeaderCell.prototype.syncContentCellOnResize_ = function() {
  var bound = goog.style.getContentBoxSize(this.getElement());
  goog.style.setWidth(this.contentCell_, bound.width);
};
pear.ui.HeaderCell.prototype.syncContentIndicatorLocation_ = function() {
  var marginleft = 0;
  var left = 0;
  if (this.getsortDirection() && goog.style.isElementShown(this.headerMenu_)) {
    goog.dom.appendChild(this.contentIndicator_, this.sortIndicator_);
    marginleft = marginleft + 16;
    goog.dom.appendChild(this.contentIndicator_, this.headerMenu_);
    marginleft = marginleft + 16;
  } else {
    if (this.getsortDirection()) {
      goog.dom.appendChild(this.contentIndicator_, this.sortIndicator_);
      marginleft = marginleft + 16;
      goog.dom.removeNode(this.headerMenu_);
    } else {
      if (goog.style.isElementShown(this.headerMenu_)) {
        goog.dom.appendChild(this.contentIndicator_, this.headerMenu_);
        marginleft = marginleft + 16;
        goog.dom.removeNode(this.sortIndicator_);
      } else {
        goog.dom.removeNode(this.sortIndicator_);
        goog.dom.removeNode(this.headerMenu_);
      }
    }
  }
  marginleft = marginleft * -1;
  this.handleMenuSlide_(this.contentIndicator_, [marginleft]);
};
pear.ui.HeaderCell.prototype.handleMenuSlide_ = function(el, value) {
  var anim = new pear.fx.dom.Slide(el, [0], value, 300);
  anim.play();
};
pear.ui.HeaderCell.prototype.createResizeHandle_ = function() {
  var resizeData = {handles:pear.ui.Resizable.Position.RIGHT};
  this.resizable_ = new pear.ui.Resizable(this.getElement(), resizeData);
  this.getHandler().listen(this.resizable_, pear.ui.Resizable.EventType.RESIZE, this.handleResize_, false, this).listen(this.resizable_, pear.ui.Resizable.EventType.END_RESIZE, this.handleResizeEnd_, false, this);
};
pear.ui.HeaderCell.prototype.registerEvents_ = function() {
  this.getHandler().listen(this.headerMenu_, [goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEUP, goog.events.EventType.MOUSEOVER, goog.events.EventType.MOUSEOUT, goog.events.EventType.CONTEXTMENU], this.handleChildMouseEvents_);
};
pear.ui.HeaderCell.prototype.handleChildMouseEvents_ = function(ge) {
  ge.stopPropagation();
};
pear.ui.HeaderCell.prototype.handleActive_ = function(ge) {
  ge.stopPropagation();
  if (this.resizable_ && this.resizable_.getResizehandle(pear.ui.Resizable.Position.RIGHT) === ge.target) {
  } else {
    if (this.getGrid().getConfiguration().AllowSorting) {
      var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.CLICK, this);
      this.dispatchEvent(clickEvent);
    }
  }
};
pear.ui.HeaderCell.prototype.handleEnter_ = function() {
  goog.style.setStyle(this.headerMenu_, "display", "inline-block");
  this.syncContentIndicatorLocation_();
};
pear.ui.HeaderCell.prototype.handleLeave_ = function() {
  goog.style.setStyle(this.headerMenu_, "display", "none");
  this.syncContentIndicatorLocation_();
};
pear.ui.HeaderCell.prototype.handleOptionClick_ = function(be) {
  be.stopPropagation();
  var clickEvent = new goog.events.Event(pear.ui.Cell.EventType.OPTION_CLICK, this);
  this.dispatchEvent(clickEvent);
};
pear.ui.HeaderCell.prototype.handleResize_ = function(be) {
  be.stopPropagation();
  var pos = this.getCellIndex();
  grid.setColumnResize(pos, be.size.width);
  this.syncContentCellOnResize_();
};
pear.ui.HeaderCell.prototype.handleResizeEnd_ = function(be) {
  be.stopPropagation();
  var grid = this.getGrid();
  grid.refresh();
};
pear.ui.HeaderCell.prototype.resetSortDirection = function(be) {
  this.setsortDirection(null);
  goog.dom.removeChildren(this.sortIndicator_);
  this.syncContentIndicatorLocation_();
};
pear.ui.HeaderCell.prototype.toggleSortDirection = function(be) {
  var sortNode;
  goog.dom.removeChildren(this.sortIndicator_);
  if (this.getsortDirection() === pear.ui.Grid.SortDirection.ASC) {
    this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
    sortNode = goog.dom.createDom("div", "fa fa-arrow-circle-down");
  } else {
    if (this.getsortDirection() === pear.ui.Grid.SortDirection.DESC) {
      this.setsortDirection(pear.ui.Grid.SortDirection.ASC);
      sortNode = goog.dom.createDom("div", "fa fa-arrow-circle-up");
    } else {
      this.setsortDirection(pear.ui.Grid.SortDirection.DESC);
      sortNode = goog.dom.createDom("div", "fa fa-arrow-circle-down");
    }
  }
  goog.dom.appendChild(this.sortIndicator_, sortNode);
  this.syncContentIndicatorLocation_();
};
goog.provide("pear.data.RowView");
goog.require("goog.Disposable");
goog.require("goog.ui.IdGenerator");
pear.data.RowView = function(rowdata, dv) {
  goog.Disposable.call(this);
  this.rowdata_ = rowdata;
  this.dataview_ = dv;
  this.rowId_ = this.idGenerator_.getNextUniqueId();
};
goog.inherits(pear.data.RowView, goog.Disposable);
pear.data.RowView.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance();
pear.data.RowView.prototype.rowId_ = null;
pear.data.RowView.prototype.getRowData = function() {
  return this.rowdata_;
};
pear.data.RowView.prototype.getDataView = function() {
  return this.dataview_;
};
pear.data.RowView.prototype.getRowId = function() {
  return this.rowId_;
};
goog.provide("pear.data.DataView");
goog.require("pear.data.DataModel");
goog.require("pear.data.RowView");
goog.require("goog.Disposable");
pear.data.DataView = function(datamodel) {
  goog.Disposable.call(this);
  this.datamodel_ = datamodel;
  this.init_();
};
goog.inherits(pear.data.DataView, goog.Disposable);
pear.data.DataView.prototype.datamodel_ = null;
pear.data.DataView.prototype.grid_ = null;
pear.data.DataView.prototype.rowViews_ = [];
pear.data.DataView.prototype.sortField_ = null;
pear.data.DataView.prototype.sortDirection_ = null;
pear.data.DataView.prototype.rowidx_ = [];
pear.data.DataView.prototype.viewrange_ = {start:0, end:0};
pear.data.DataView.prototype.disposeInternal = function() {
  this.rowidx_ = null;
  this.rowViews_ = null;
  this.grid_ = null;
  this.datamodel_.dispose();
  this.datamodel_ = null;
  pear.data.DataView.superClass_.disposeInternal.call(this);
};
pear.data.DataView.prototype.getSortField = function() {
  return this.sortField_;
};
pear.data.DataView.prototype.getSortDirection = function() {
  return this.sortDirection_;
};
pear.data.DataView.prototype.getColumns = function() {
  return this.datamodel_.getColumns();
};
pear.data.DataView.prototype.setGrid = function(grid) {
  this.grid_ = grid;
};
pear.data.DataView.prototype.setPageIndex = function(pageIndex) {
  this.pageIndex_ = pageIndex;
  this.refresh_();
};
pear.data.DataView.prototype.getPageIndex = function() {
  var index = this.pageSize_ && this.pageSize_ > 0 ? this.pageIndex_ ? this.pageIndex_ : 1 : 0;
  return index;
};
pear.data.DataView.prototype.setPageSize = function(pageSize) {
  this.pageSize_ = pageSize;
  this.refresh_();
};
pear.data.DataView.prototype.getPageSize = function() {
  var pageSize = this.pageSize_ || 0;
  return this.pageSize_;
};
pear.data.DataView.prototype.init_ = function() {
  this.rowViews_ = [];
  this.rowidx_ = [];
  this.transformToRowViews_(this.datamodel_.getRows());
  goog.array.forEach(this.rowViews_, function(value, index) {
    this.rowidx_.push(index);
  }, this);
  this.refresh_();
};
pear.data.DataView.prototype.getRowViewByRowId = function(rowId) {
  var rv = null;
  rv = this.rowViews_[rowId] || [];
  return rv;
};
pear.data.DataView.prototype.transformToRowViews_ = function(rows) {
  goog.array.forEach(rows, function(value) {
    this.addRowView_(value);
  }, this);
};
pear.data.DataView.prototype.addRowView_ = function(row) {
  var rv = new pear.data.RowView(row, this);
  this.rowViews_.push(rv);
};
pear.data.DataView.prototype.getRowViews = function() {
  var rows = [];
  var i;
  for (i = this.viewrange_.start - 1;i < this.viewrange_.end;i++) {
    rows.push(this.rowViews_[this.rowidx_[i]]);
  }
  return rows;
};
pear.data.DataView.prototype.getRowCount = function() {
  return this.rowViews_.length;
};
pear.data.DataView.prototype.updateRowsIdx = function() {
  this.rowidx_ = [];
  goog.array.forEach(this.rowViews_, function(value, index) {
    this.rowidx_.push(index);
  }, this);
};
pear.data.DataView.prototype.sort = function(model) {
  if (this.sortField_ === model.id) {
    this.sortDirection_ = !this.sortDirection_;
  }
  this.sortField_ = model.id;
  if (model.type === "number") {
    this.rowViews_.sort(this.numberCompare);
  } else {
    if (model.type === "datetime") {
      this.rowViews_.sort(this.dateCompare);
    } else {
      if (model.type === "booleam") {
        this.rowViews_.sort(this.defaultCompare);
      } else {
        this.rowViews_.sort(this.defaultCompare);
      }
    }
  }
  this.updateRowsIdx();
  this.refresh_();
};
pear.data.DataView.prototype.defaultCompare = function(value1, value2) {
  var dv = value1.getDataView();
  var sortfield = dv.getSortField();
  var temp;
  if (dv.getSortDirection()) {
    temp = value1;
    value1 = value2;
    value2 = temp;
  }
  if (value1.getRowData()[sortfield] > value2.getRowData()[sortfield]) {
    return 1;
  }
  if (value1.getRowData()[sortfield] < value2.getRowData()[sortfield]) {
    return-1;
  }
  return 0;
};
pear.data.DataView.prototype.numberCompare = function(value1, value2) {
  var dv = value1.getDataView();
  var sortfield = dv.getSortField();
  var temp;
  if (dv.getSortDirection()) {
    temp = value1;
    value1 = value2;
    value2 = temp;
  }
  return value1.getRowData()[sortfield] - value2.getRowData()[sortfield];
};
pear.data.DataView.prototype.dateCompare = function(value1, value2) {
  var dv = value1.getDataView();
  var sortfield = dv.getSortField();
  var temp;
  if (dv.getSortDirection()) {
    temp = value1;
    value1 = value2;
    value2 = temp;
  }
  var dateA = new Date(value1.getRowData()[sortfield]), dateB = new Date(value2.getRowData()[sortfield]);
  return dateA - dateB;
};
pear.data.DataView.prototype.refresh_ = function() {
  var pageSize = this.getPageSize();
  var pageIndex = this.getPageIndex() - 1;
  this.viewrange_.start = 1, this.viewrange_.end = this.rowidx_.length;
  if (pageSize > 0 && pageIndex > 0) {
    this.viewrange_.start = pageIndex * pageSize + 1;
    this.viewrange_.start = this.viewrange_.start < 1 ? 1 : this.viewrange_.start;
    this.viewrange_.end = this.viewrange_.start + pageSize;
  }
};
goog.provide("pear.ui.Plugable");
pear.ui.Plugable = function() {
};
pear.ui.Plugable.IMPLEMENTED_BY_PROP = "pear_plugable_" + (Math.random() * 1E6 | 0);
pear.ui.Plugable.addImplementation = function(cls) {
  cls.prototype[pear.ui.Plugable.IMPLEMENTED_BY_PROP] = true;
};
pear.ui.Plugable.isImplementedBy = function(obj) {
  try {
    return!!(obj && obj[pear.ui.Plugable.IMPLEMENTED_BY_PROP]);
  } catch (e) {
    return false;
  }
};
pear.ui.Plugable.prototype.show;
goog.provide("goog.positioning");
goog.provide("goog.positioning.Corner");
goog.provide("goog.positioning.CornerBit");
goog.provide("goog.positioning.Overflow");
goog.provide("goog.positioning.OverflowStatus");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.TagName");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.style");
goog.require("goog.style.bidi");
goog.positioning.Corner = {TOP_LEFT:0, TOP_RIGHT:2, BOTTOM_LEFT:1, BOTTOM_RIGHT:3, TOP_START:4, TOP_END:6, BOTTOM_START:5, BOTTOM_END:7};
goog.positioning.CornerBit = {BOTTOM:1, RIGHT:2, FLIP_RTL:4};
goog.positioning.Overflow = {IGNORE:0, ADJUST_X:1, FAIL_X:2, ADJUST_Y:4, FAIL_Y:8, RESIZE_WIDTH:16, RESIZE_HEIGHT:32, ADJUST_X_EXCEPT_OFFSCREEN:64 | 1, ADJUST_Y_EXCEPT_OFFSCREEN:128 | 4};
goog.positioning.OverflowStatus = {NONE:0, ADJUSTED_X:1, ADJUSTED_Y:2, WIDTH_ADJUSTED:4, HEIGHT_ADJUSTED:8, FAILED_LEFT:16, FAILED_RIGHT:32, FAILED_TOP:64, FAILED_BOTTOM:128, FAILED_OUTSIDE_VIEWPORT:256};
goog.positioning.OverflowStatus.FAILED = goog.positioning.OverflowStatus.FAILED_LEFT | goog.positioning.OverflowStatus.FAILED_RIGHT | goog.positioning.OverflowStatus.FAILED_TOP | goog.positioning.OverflowStatus.FAILED_BOTTOM | goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT;
goog.positioning.OverflowStatus.FAILED_HORIZONTAL = goog.positioning.OverflowStatus.FAILED_LEFT | goog.positioning.OverflowStatus.FAILED_RIGHT;
goog.positioning.OverflowStatus.FAILED_VERTICAL = goog.positioning.OverflowStatus.FAILED_TOP | goog.positioning.OverflowStatus.FAILED_BOTTOM;
goog.positioning.positionAtAnchor = function(anchorElement, anchorElementCorner, movableElement, movableElementCorner, opt_offset, opt_margin, opt_overflow, opt_preferredSize, opt_viewport) {
  goog.asserts.assert(movableElement);
  var movableParentTopLeft = goog.positioning.getOffsetParentPageOffset(movableElement);
  var anchorRect = goog.positioning.getVisiblePart_(anchorElement);
  goog.style.translateRectForAnotherFrame(anchorRect, goog.dom.getDomHelper(anchorElement), goog.dom.getDomHelper(movableElement));
  var corner = goog.positioning.getEffectiveCorner(anchorElement, anchorElementCorner);
  var absolutePos = new goog.math.Coordinate(corner & goog.positioning.CornerBit.RIGHT ? anchorRect.left + anchorRect.width : anchorRect.left, corner & goog.positioning.CornerBit.BOTTOM ? anchorRect.top + anchorRect.height : anchorRect.top);
  absolutePos = goog.math.Coordinate.difference(absolutePos, movableParentTopLeft);
  if (opt_offset) {
    absolutePos.x += (corner & goog.positioning.CornerBit.RIGHT ? -1 : 1) * opt_offset.x;
    absolutePos.y += (corner & goog.positioning.CornerBit.BOTTOM ? -1 : 1) * opt_offset.y;
  }
  var viewport;
  if (opt_overflow) {
    if (opt_viewport) {
      viewport = opt_viewport;
    } else {
      viewport = goog.style.getVisibleRectForElement(movableElement);
      if (viewport) {
        viewport.top -= movableParentTopLeft.y;
        viewport.right -= movableParentTopLeft.x;
        viewport.bottom -= movableParentTopLeft.y;
        viewport.left -= movableParentTopLeft.x;
      }
    }
  }
  return goog.positioning.positionAtCoordinate(absolutePos, movableElement, movableElementCorner, opt_margin, viewport, opt_overflow, opt_preferredSize);
};
goog.positioning.getOffsetParentPageOffset = function(movableElement) {
  var movableParentTopLeft;
  var parent = movableElement.offsetParent;
  if (parent) {
    var isBody = parent.tagName == goog.dom.TagName.HTML || parent.tagName == goog.dom.TagName.BODY;
    if (!isBody || goog.style.getComputedPosition(parent) != "static") {
      movableParentTopLeft = goog.style.getPageOffset(parent);
      if (!isBody) {
        movableParentTopLeft = goog.math.Coordinate.difference(movableParentTopLeft, new goog.math.Coordinate(goog.style.bidi.getScrollLeft(parent), parent.scrollTop));
      }
    }
  }
  return movableParentTopLeft || new goog.math.Coordinate;
};
goog.positioning.getVisiblePart_ = function(el) {
  var rect = goog.style.getBounds(el);
  var visibleBox = goog.style.getVisibleRectForElement(el);
  if (visibleBox) {
    rect.intersection(goog.math.Rect.createFromBox(visibleBox));
  }
  return rect;
};
goog.positioning.positionAtCoordinate = function(absolutePos, movableElement, movableElementCorner, opt_margin, opt_viewport, opt_overflow, opt_preferredSize) {
  absolutePos = absolutePos.clone();
  var status = goog.positioning.OverflowStatus.NONE;
  var corner = goog.positioning.getEffectiveCorner(movableElement, movableElementCorner);
  var elementSize = goog.style.getSize(movableElement);
  var size = opt_preferredSize ? opt_preferredSize.clone() : elementSize.clone();
  if (opt_margin || corner != goog.positioning.Corner.TOP_LEFT) {
    if (corner & goog.positioning.CornerBit.RIGHT) {
      absolutePos.x -= size.width + (opt_margin ? opt_margin.right : 0);
    } else {
      if (opt_margin) {
        absolutePos.x += opt_margin.left;
      }
    }
    if (corner & goog.positioning.CornerBit.BOTTOM) {
      absolutePos.y -= size.height + (opt_margin ? opt_margin.bottom : 0);
    } else {
      if (opt_margin) {
        absolutePos.y += opt_margin.top;
      }
    }
  }
  if (opt_overflow) {
    status = opt_viewport ? goog.positioning.adjustForViewport_(absolutePos, size, opt_viewport, opt_overflow) : goog.positioning.OverflowStatus.FAILED_OUTSIDE_VIEWPORT;
    if (status & goog.positioning.OverflowStatus.FAILED) {
      return status;
    }
  }
  goog.style.setPosition(movableElement, absolutePos);
  if (!goog.math.Size.equals(elementSize, size)) {
    goog.style.setBorderBoxSize(movableElement, size);
  }
  return status;
};
goog.positioning.adjustForViewport_ = function(pos, size, viewport, overflow) {
  var status = goog.positioning.OverflowStatus.NONE;
  var ADJUST_X_EXCEPT_OFFSCREEN = goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN;
  var ADJUST_Y_EXCEPT_OFFSCREEN = goog.positioning.Overflow.ADJUST_Y_EXCEPT_OFFSCREEN;
  if ((overflow & ADJUST_X_EXCEPT_OFFSCREEN) == ADJUST_X_EXCEPT_OFFSCREEN && (pos.x < viewport.left || pos.x >= viewport.right)) {
    overflow &= ~goog.positioning.Overflow.ADJUST_X;
  }
  if ((overflow & ADJUST_Y_EXCEPT_OFFSCREEN) == ADJUST_Y_EXCEPT_OFFSCREEN && (pos.y < viewport.top || pos.y >= viewport.bottom)) {
    overflow &= ~goog.positioning.Overflow.ADJUST_Y;
  }
  if (pos.x < viewport.left && overflow & goog.positioning.Overflow.ADJUST_X) {
    pos.x = viewport.left;
    status |= goog.positioning.OverflowStatus.ADJUSTED_X;
  }
  if (pos.x < viewport.left && (pos.x + size.width > viewport.right && overflow & goog.positioning.Overflow.RESIZE_WIDTH)) {
    size.width = Math.max(size.width - (pos.x + size.width - viewport.right), 0);
    status |= goog.positioning.OverflowStatus.WIDTH_ADJUSTED;
  }
  if (pos.x + size.width > viewport.right && overflow & goog.positioning.Overflow.ADJUST_X) {
    pos.x = Math.max(viewport.right - size.width, viewport.left);
    status |= goog.positioning.OverflowStatus.ADJUSTED_X;
  }
  if (overflow & goog.positioning.Overflow.FAIL_X) {
    status |= (pos.x < viewport.left ? goog.positioning.OverflowStatus.FAILED_LEFT : 0) | (pos.x + size.width > viewport.right ? goog.positioning.OverflowStatus.FAILED_RIGHT : 0);
  }
  if (pos.y < viewport.top && overflow & goog.positioning.Overflow.ADJUST_Y) {
    pos.y = viewport.top;
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y;
  }
  if (pos.y <= viewport.top && (pos.y + size.height < viewport.bottom && overflow & goog.positioning.Overflow.RESIZE_HEIGHT)) {
    size.height = Math.max(size.height - (viewport.top - pos.y), 0);
    pos.y = viewport.top;
    status |= goog.positioning.OverflowStatus.HEIGHT_ADJUSTED;
  }
  if (pos.y >= viewport.top && (pos.y + size.height > viewport.bottom && overflow & goog.positioning.Overflow.RESIZE_HEIGHT)) {
    size.height = Math.max(size.height - (pos.y + size.height - viewport.bottom), 0);
    status |= goog.positioning.OverflowStatus.HEIGHT_ADJUSTED;
  }
  if (pos.y + size.height > viewport.bottom && overflow & goog.positioning.Overflow.ADJUST_Y) {
    pos.y = Math.max(viewport.bottom - size.height, viewport.top);
    status |= goog.positioning.OverflowStatus.ADJUSTED_Y;
  }
  if (overflow & goog.positioning.Overflow.FAIL_Y) {
    status |= (pos.y < viewport.top ? goog.positioning.OverflowStatus.FAILED_TOP : 0) | (pos.y + size.height > viewport.bottom ? goog.positioning.OverflowStatus.FAILED_BOTTOM : 0);
  }
  return status;
};
goog.positioning.getEffectiveCorner = function(element, corner) {
  return((corner & goog.positioning.CornerBit.FLIP_RTL && goog.style.isRightToLeft(element) ? corner ^ goog.positioning.CornerBit.RIGHT : corner) & ~goog.positioning.CornerBit.FLIP_RTL);
};
goog.positioning.flipCornerHorizontal = function(corner) {
  return(corner ^ goog.positioning.CornerBit.RIGHT);
};
goog.positioning.flipCornerVertical = function(corner) {
  return(corner ^ goog.positioning.CornerBit.BOTTOM);
};
goog.positioning.flipCorner = function(corner) {
  return(corner ^ goog.positioning.CornerBit.BOTTOM ^ goog.positioning.CornerBit.RIGHT);
};
goog.provide("goog.positioning.AbstractPosition");
goog.require("goog.math.Box");
goog.require("goog.math.Size");
goog.require("goog.positioning.Corner");
goog.positioning.AbstractPosition = function() {
};
goog.positioning.AbstractPosition.prototype.reposition = function(movableElement, corner, opt_margin, opt_preferredSize) {
};
goog.provide("goog.positioning.AnchoredPosition");
goog.require("goog.math.Box");
goog.require("goog.positioning");
goog.require("goog.positioning.AbstractPosition");
goog.positioning.AnchoredPosition = function(anchorElement, corner, opt_overflow) {
  this.element = anchorElement;
  this.corner = corner;
  this.overflow_ = opt_overflow;
};
goog.inherits(goog.positioning.AnchoredPosition, goog.positioning.AbstractPosition);
goog.positioning.AnchoredPosition.prototype.reposition = function(movableElement, movableCorner, opt_margin, opt_preferredSize) {
  goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, undefined, opt_margin, this.overflow_);
};
goog.provide("goog.positioning.AnchoredViewportPosition");
goog.require("goog.math.Box");
goog.require("goog.positioning");
goog.require("goog.positioning.AnchoredPosition");
goog.require("goog.positioning.Corner");
goog.require("goog.positioning.Overflow");
goog.require("goog.positioning.OverflowStatus");
goog.positioning.AnchoredViewportPosition = function(anchorElement, corner, opt_adjust, opt_overflowConstraint) {
  goog.positioning.AnchoredPosition.call(this, anchorElement, corner);
  this.lastResortOverflow_ = opt_adjust ? goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.ADJUST_Y : goog.positioning.Overflow.IGNORE;
  this.overflowConstraint_ = opt_overflowConstraint || undefined;
};
goog.inherits(goog.positioning.AnchoredViewportPosition, goog.positioning.AnchoredPosition);
goog.positioning.AnchoredViewportPosition.prototype.getOverflowConstraint = function() {
  return this.overflowConstraint_;
};
goog.positioning.AnchoredViewportPosition.prototype.setOverflowConstraint = function(overflowConstraint) {
  this.overflowConstraint_ = overflowConstraint;
};
goog.positioning.AnchoredViewportPosition.prototype.getLastResortOverflow = function() {
  return this.lastResortOverflow_;
};
goog.positioning.AnchoredViewportPosition.prototype.setLastResortOverflow = function(lastResortOverflow) {
  this.lastResortOverflow_ = lastResortOverflow;
};
goog.positioning.AnchoredViewportPosition.prototype.reposition = function(movableElement, movableCorner, opt_margin, opt_preferredSize) {
  var status = goog.positioning.positionAtAnchor(this.element, this.corner, movableElement, movableCorner, null, opt_margin, goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y, opt_preferredSize, this.overflowConstraint_);
  if (status & goog.positioning.OverflowStatus.FAILED) {
    var cornerFallback = this.adjustCorner(status, this.corner);
    var movableCornerFallback = this.adjustCorner(status, movableCorner);
    status = goog.positioning.positionAtAnchor(this.element, cornerFallback, movableElement, movableCornerFallback, null, opt_margin, goog.positioning.Overflow.FAIL_X | goog.positioning.Overflow.FAIL_Y, opt_preferredSize, this.overflowConstraint_);
    if (status & goog.positioning.OverflowStatus.FAILED) {
      cornerFallback = this.adjustCorner(status, cornerFallback);
      movableCornerFallback = this.adjustCorner(status, movableCornerFallback);
      goog.positioning.positionAtAnchor(this.element, cornerFallback, movableElement, movableCornerFallback, null, opt_margin, this.getLastResortOverflow(), opt_preferredSize, this.overflowConstraint_);
    }
  }
};
goog.positioning.AnchoredViewportPosition.prototype.adjustCorner = function(status, corner) {
  if (status & goog.positioning.OverflowStatus.FAILED_HORIZONTAL) {
    corner = goog.positioning.flipCornerHorizontal(corner);
  }
  if (status & goog.positioning.OverflowStatus.FAILED_VERTICAL) {
    corner = goog.positioning.flipCornerVertical(corner);
  }
  return corner;
};
goog.provide("goog.positioning.MenuAnchoredPosition");
goog.require("goog.math.Box");
goog.require("goog.math.Size");
goog.require("goog.positioning");
goog.require("goog.positioning.AnchoredViewportPosition");
goog.require("goog.positioning.Corner");
goog.require("goog.positioning.Overflow");
goog.positioning.MenuAnchoredPosition = function(anchorElement, corner, opt_adjust, opt_resize) {
  goog.positioning.AnchoredViewportPosition.call(this, anchorElement, corner, opt_adjust || opt_resize);
  if (opt_adjust || opt_resize) {
    var overflowX = goog.positioning.Overflow.ADJUST_X_EXCEPT_OFFSCREEN;
    var overflowY = opt_resize ? goog.positioning.Overflow.RESIZE_HEIGHT : goog.positioning.Overflow.ADJUST_Y_EXCEPT_OFFSCREEN;
    this.setLastResortOverflow(overflowX | overflowY);
  }
};
goog.inherits(goog.positioning.MenuAnchoredPosition, goog.positioning.AnchoredViewportPosition);
goog.provide("goog.ui.ItemEvent");
goog.require("goog.events.Event");
goog.ui.ItemEvent = function(type, target, item) {
  goog.events.Event.call(this, type, target);
  this.item = item;
};
goog.inherits(goog.ui.ItemEvent, goog.events.Event);
goog.provide("goog.structs.Collection");
goog.structs.Collection = function() {
};
goog.structs.Collection.prototype.add;
goog.structs.Collection.prototype.remove;
goog.structs.Collection.prototype.contains;
goog.structs.Collection.prototype.getCount;
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if (typeof col.getCount == "function") {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};
goog.structs.getValues = function(col) {
  if (typeof col.getValues == "function") {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split("");
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0;i < l;i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == "function") {
    return col.getKeys();
  }
  if (typeof col.getValues == "function") {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0;i < l;i++) {
      rv.push(i);
    }
    return rv;
  }
  return goog.object.getKeys(col);
};
goog.structs.contains = function(col, val) {
  if (typeof col.contains == "function") {
    return col.contains(val);
  }
  if (typeof col.containsValue == "function") {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains((col), val);
  }
  return goog.object.containsValue(col, val);
};
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == "function") {
    return col.isEmpty();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty((col));
  }
  return goog.object.isEmpty(col);
};
goog.structs.clear = function(col) {
  if (typeof col.clear == "function") {
    col.clear();
  } else {
    if (goog.isArrayLike(col)) {
      goog.array.clear((col));
    } else {
      goog.object.clear(col);
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == "function") {
    col.forEach(f, opt_obj);
  } else {
    if (goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach((col), f, opt_obj);
    } else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for (var i = 0;i < l;i++) {
        f.call(opt_obj, values[i], keys && keys[i], col);
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == "function") {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter((col), f, opt_obj);
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0;i < l;i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    rv = [];
    for (var i = 0;i < l;i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == "function") {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map((col), f, opt_obj);
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0;i < l;i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    rv = [];
    for (var i = 0;i < l;i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col);
    }
  }
  return rv;
};
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == "function") {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some((col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == "function") {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every((col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};
goog.provide("goog.iter");
goog.provide("goog.iter.Iterable");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.functions");
goog.require("goog.math");
goog.iter.Iterable;
if ("StopIteration" in goog.global) {
  goog.iter.StopIteration = goog.global["StopIteration"];
} else {
  goog.iter.StopIteration = Error("StopIteration");
}
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach((iterable), f, opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      if (f.call(opt_obj, val, undefined, iterator)) {
        return val;
      }
    }
  };
  return newIter;
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};
goog.iter.map = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      return f.call(opt_obj, val, undefined, iterator);
    }
  };
  return newIter;
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};
goog.iter.chain = function(var_args) {
  var iterator = goog.iter.toIterator(arguments);
  var iter = new goog.iter.Iterator;
  var current = null;
  iter.next = function() {
    while (true) {
      if (current == null) {
        var it = iterator.next();
        current = goog.iter.toIterator(it);
      }
      try {
        return current.next();
      } catch (ex) {
        if (ex !== goog.iter.StopIteration) {
          throw ex;
        }
        current = null;
      }
    }
  };
  return iter;
};
goog.iter.chainFromIterable = function(iterable) {
  return goog.iter.chain.apply(undefined, iterable);
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      if (dropping && f.call(opt_obj, val, undefined, iterator)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while (true) {
      if (taking) {
        var val = iterator.next();
        if (f.call(opt_obj, val, undefined, iterator)) {
          return val;
        } else {
          taking = false;
        }
      } else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter;
};
goog.iter.toArray = function(iterable) {
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};
goog.iter.equals = function(iterable1, iterable2) {
  var fillValue = {};
  var pairs = goog.iter.zipLongest(fillValue, iterable1, iterable2);
  return goog.iter.every(pairs, function(pair) {
    return pair[0] == pair[1];
  });
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return!arr.length;
  });
  if (someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator;
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if (indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      });
      for (var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }
        if (i == 0) {
          indicies = null;
          break;
        }
        indicies[i] = 0;
      }
      return retVal;
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable);
  var cache = [];
  var cacheIndex = 0;
  var iter = new goog.iter.Iterator;
  var useCache = false;
  iter.next = function() {
    var returnElement = null;
    if (!useCache) {
      try {
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement;
      } catch (e) {
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = true;
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement;
  };
  return iter;
};
goog.iter.count = function(opt_start, opt_step) {
  var counter = opt_start || 0;
  var step = goog.isDef(opt_step) ? opt_step : 1;
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    var returnValue = counter;
    counter += step;
    return returnValue;
  };
  return iter;
};
goog.iter.repeat = function(value) {
  var iter = new goog.iter.Iterator;
  iter.next = goog.functions.constant(value);
  return iter;
};
goog.iter.accumulate = function(iterable) {
  var iterator = goog.iter.toIterator(iterable);
  var total = 0;
  var iter = new goog.iter.Iterator;
  iter.next = function() {
    total += iterator.next();
    return total;
  };
  return iter;
};
goog.iter.zip = function(var_args) {
  var args = arguments;
  var iter = new goog.iter.Iterator;
  if (args.length > 0) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var arr = goog.array.map(iterators, function(it) {
        return it.next();
      });
      return arr;
    };
  }
  return iter;
};
goog.iter.zipLongest = function(fillValue, var_args) {
  var args = goog.array.slice(arguments, 1);
  var iter = new goog.iter.Iterator;
  if (args.length > 0) {
    var iterators = goog.array.map(args, goog.iter.toIterator);
    iter.next = function() {
      var iteratorsHaveValues = false;
      var arr = goog.array.map(iterators, function(it) {
        var returnValue;
        try {
          returnValue = it.next();
          iteratorsHaveValues = true;
        } catch (ex) {
          if (ex !== goog.iter.StopIteration) {
            throw ex;
          }
          returnValue = fillValue;
        }
        return returnValue;
      });
      if (!iteratorsHaveValues) {
        throw goog.iter.StopIteration;
      }
      return arr;
    };
  }
  return iter;
};
goog.iter.compress = function(iterable, selectors) {
  var selectorIterator = goog.iter.toIterator(selectors);
  return goog.iter.filter(iterable, function() {
    return!!selectorIterator.next();
  });
};
goog.iter.GroupByIterator_ = function(iterable, opt_keyFunc) {
  this.iterator = goog.iter.toIterator(iterable);
  this.keyFunc = opt_keyFunc || goog.functions.identity;
  this.targetKey;
  this.currentKey;
  this.currentValue;
};
goog.inherits(goog.iter.GroupByIterator_, goog.iter.Iterator);
goog.iter.GroupByIterator_.prototype.next = function() {
  while (this.currentKey == this.targetKey) {
    this.currentValue = this.iterator.next();
    this.currentKey = this.keyFunc(this.currentValue);
  }
  this.targetKey = this.currentKey;
  return[this.currentKey, this.groupItems_(this.targetKey)];
};
goog.iter.GroupByIterator_.prototype.groupItems_ = function(targetKey) {
  var arr = [];
  while (this.currentKey == targetKey) {
    arr.push(this.currentValue);
    try {
      this.currentValue = this.iterator.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
      break;
    }
    this.currentKey = this.keyFunc(this.currentValue);
  }
  return arr;
};
goog.iter.groupBy = function(iterable, opt_keyFunc) {
  return new goog.iter.GroupByIterator_(iterable, opt_keyFunc);
};
goog.iter.tee = function(iterable, opt_num) {
  var iterator = goog.iter.toIterator(iterable);
  var num = goog.isNumber(opt_num) ? opt_num : 2;
  var buffers = goog.array.map(goog.array.range(num), function() {
    return[];
  });
  var addNextIteratorValueToBuffers = function() {
    var val = iterator.next();
    goog.array.forEach(buffers, function(buffer) {
      buffer.push(val);
    });
  };
  var createIterator = function(buffer) {
    var iter = new goog.iter.Iterator;
    iter.next = function() {
      if (goog.array.isEmpty(buffer)) {
        addNextIteratorValueToBuffers();
      }
      goog.asserts.assert(!goog.array.isEmpty(buffer));
      return buffer.shift();
    };
    return iter;
  };
  return goog.array.map(buffers, createIterator);
};
goog.iter.enumerate = function(iterable, opt_start) {
  return goog.iter.zip(goog.iter.count(opt_start), iterable);
};
goog.iter.limit = function(iterable, limitSize) {
  goog.asserts.assert(goog.math.isInt(limitSize) && limitSize >= 0);
  var iterator = goog.iter.toIterator(iterable);
  var iter = new goog.iter.Iterator;
  var remaining = limitSize;
  iter.next = function() {
    if (remaining-- > 0) {
      return iterator.next();
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.consume = function(iterable, count) {
  goog.asserts.assert(goog.math.isInt(count) && count >= 0);
  var iterator = goog.iter.toIterator(iterable);
  while (count-- > 0) {
    goog.iter.nextOrValue(iterator, null);
  }
  return iterator;
};
goog.iter.slice = function(iterable, start, opt_end) {
  goog.asserts.assert(goog.math.isInt(start) && start >= 0);
  var iterator = goog.iter.consume(iterable, start);
  if (goog.isNumber(opt_end)) {
    goog.asserts.assert(goog.math.isInt((opt_end)) && opt_end >= start);
    iterator = goog.iter.limit(iterator, opt_end - start);
  }
  return iterator;
};
goog.iter.hasDuplicates_ = function(arr) {
  var deduped = [];
  goog.array.removeDuplicates(arr, deduped);
  return arr.length != deduped.length;
};
goog.iter.permutations = function(iterable, opt_length) {
  var elements = goog.iter.toArray(iterable);
  var length = goog.isNumber(opt_length) ? opt_length : elements.length;
  var sets = goog.array.repeat(elements, length);
  var product = goog.iter.product.apply(undefined, sets);
  return goog.iter.filter(product, function(arr) {
    return!goog.iter.hasDuplicates_(arr);
  });
};
goog.iter.combinations = function(iterable, length) {
  var elements = goog.iter.toArray(iterable);
  var indexes = goog.iter.range(elements.length);
  var indexIterator = goog.iter.permutations(indexes, length);
  var sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr);
  });
  var iter = new goog.iter.Iterator;
  function getIndexFromElements(index) {
    return elements[index];
  }
  iter.next = function() {
    return goog.array.map((sortedIndexIterator.next()), getIndexFromElements);
  };
  return iter;
};
goog.iter.combinationsWithReplacement = function(iterable, length) {
  var elements = goog.iter.toArray(iterable);
  var indexes = goog.array.range(elements.length);
  var sets = goog.array.repeat(indexes, length);
  var indexIterator = goog.iter.product.apply(undefined, sets);
  var sortedIndexIterator = goog.iter.filter(indexIterator, function(arr) {
    return goog.array.isSorted(arr);
  });
  var iter = new goog.iter.Iterator;
  function getIndexFromElements(index) {
    return elements[index];
  }
  iter.next = function() {
    return goog.array.map((sortedIndexIterator.next()), getIndexFromElements);
  };
  return iter;
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  this.count_ = 0;
  this.version_ = 0;
  var argLength = arguments.length;
  if (argLength > 1) {
    if (argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for (var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else {
    if (opt_map) {
      this.addAll((opt_map));
    }
  }
};
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return(this.keys_.concat());
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }
  if (this.count_ != otherMap.getCount()) {
    return false;
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for (var key, i = 0;key = this.keys_[i];i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }
  return true;
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }
    return true;
  }
  return false;
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
  if (this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};
goog.structs.Map.prototype.set = function(key, value) {
  if (!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push(key);
    this.version_++;
  }
  this.map_[key] = value;
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  for (var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i]);
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }
  return transposed;
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
goog.provide("goog.structs.Set");
goog.require("goog.structs");
goog.require("goog.structs.Collection");
goog.require("goog.structs.Map");
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == "object" && val || type == "function") {
    return "o" + goog.getUid((val));
  } else {
    return type.substr(0, 1) + val;
  }
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    this.add(values[i]);
  }
};
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0;i < l;i++) {
    this.remove(values[i]);
  }
};
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set;
  var values = goog.structs.getValues(col);
  for (var i = 0;i < values.length;i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }
  return result;
};
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result;
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
goog.provide("goog.debug");
goog.require("goog.array");
goog.require("goog.string");
goog.require("goog.structs.Set");
goog.require("goog.userAgent");
goog.define("goog.debug.LOGGING_ENABLED", goog.DEBUG);
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher("535.3")) {
    retVal = !retVal;
  }
  target.onerror = function(message, url, line, opt_col, opt_error) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line, opt_col, opt_error);
    }
    logFunc({message:message, fileName:url, line:line, col:opt_col, error:opt_error});
    return retVal;
  };
};
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == "undefined") {
    return "undefined";
  }
  if (obj == null) {
    return "NULL";
  }
  var str = [];
  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + " = ";
    try {
      s += obj[x];
    } catch (e) {
      s += "*** " + e + " ***";
    }
    str.push(s);
  }
  return str.join("\n");
};
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set;
  var str = [];
  var helper = function(obj, space) {
    var nestspace = space + "  ";
    var indentMultiline = function(str) {
      return str.replace(/\n/g, "\n" + space);
    };
    try {
      if (!goog.isDef(obj)) {
        str.push("undefined");
      } else {
        if (goog.isNull(obj)) {
          str.push("NULL");
        } else {
          if (goog.isString(obj)) {
            str.push('"' + indentMultiline(obj) + '"');
          } else {
            if (goog.isFunction(obj)) {
              str.push(indentMultiline(String(obj)));
            } else {
              if (goog.isObject(obj)) {
                if (previous.contains(obj)) {
                  str.push("*** reference loop detected ***");
                } else {
                  previous.add(obj);
                  str.push("{");
                  for (var x in obj) {
                    if (!opt_showFn && goog.isFunction(obj[x])) {
                      continue;
                    }
                    str.push("\n");
                    str.push(nestspace);
                    str.push(x + " = ");
                    helper(obj[x], nestspace);
                  }
                  str.push("\n" + space + "}");
                }
              } else {
                str.push(obj);
              }
            }
          }
        }
      }
    } catch (e) {
      str.push("*** " + e + " ***");
    }
  };
  helper(obj, "");
  return str.join("");
};
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0;i < arr.length;i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return "[ " + str.join(", ") + " ]";
};
goog.debug.exposeException = function(err, opt_fn) {
  try {
    var e = goog.debug.normalizeErrorObject(err);
    var error = "Message: " + goog.string.htmlEscape(e.message) + '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' + e.fileName + "</a>\nLine: " + e.lineNumber + "\n\nBrowser stack:\n" + goog.string.htmlEscape(e.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + goog.string.htmlEscape(goog.debug.getStacktrace(opt_fn) + "-> ");
    return error;
  } catch (e2) {
    return "Exception trying to expose exception! You win, we lose. " + e2;
  }
};
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName("window.location.href");
  if (goog.isString(err)) {
    return{"message":err, "name":"Unknown error", "lineNumber":"Not available", "fileName":href, "stack":"Not available"};
  }
  var lineNumber, fileName;
  var threwError = false;
  try {
    lineNumber = err.lineNumber || (err.line || "Not available");
  } catch (e) {
    lineNumber = "Not available";
    threwError = true;
  }
  try {
    fileName = err.fileName || (err.filename || (err.sourceURL || (goog.global["$googDebugFname"] || href)));
  } catch (e) {
    fileName = "Not available";
    threwError = true;
  }
  if (threwError || (!err.lineNumber || (!err.fileName || (!err.stack || (!err.message || !err.name))))) {
    return{"message":err.message || "Not available", "name":err.name || "UnknownError", "lineNumber":lineNumber, "fileName":fileName, "stack":err.stack || "Not available"};
  }
  return err;
};
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == "string" ? Error(err) : err;
  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller);
  }
  if (opt_message) {
    var x = 0;
    while (error["message" + x]) {
      ++x;
    }
    error["message" + x] = String(opt_message);
  }
  return error;
};
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;
  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push("()\n");
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push("[exception trying to get caller]\n");
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push("[...long stack...]");
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push("[...reached max depth limit...]");
  } else {
    sb.push("[end]");
  }
  return sb.join("");
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, []);
};
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];
  if (goog.array.contains(visited, fn)) {
    sb.push("[...circular reference...]");
  } else {
    if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
      sb.push(goog.debug.getFunctionName(fn) + "(");
      var args = fn.arguments;
      for (var i = 0;i < args.length;i++) {
        if (i > 0) {
          sb.push(", ");
        }
        var argDesc;
        var arg = args[i];
        switch(typeof arg) {
          case "object":
            argDesc = arg ? "object" : "null";
            break;
          case "string":
            argDesc = arg;
            break;
          case "number":
            argDesc = String(arg);
            break;
          case "boolean":
            argDesc = arg ? "true" : "false";
            break;
          case "function":
            argDesc = goog.debug.getFunctionName(arg);
            argDesc = argDesc ? argDesc : "[fn]";
            break;
          case "undefined":
          ;
          default:
            argDesc = typeof arg;
            break;
        }
        if (argDesc.length > 40) {
          argDesc = argDesc.substr(0, 40) + "...";
        }
        sb.push(argDesc);
      }
      visited.push(fn);
      sb.push(")\n");
      try {
        sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
      } catch (e) {
        sb.push("[exception trying to get caller]\n");
      }
    } else {
      if (fn) {
        sb.push("[...long stack...]");
      } else {
        sb.push("[end]");
      }
    }
  }
  return sb.join("");
};
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver;
};
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }
  if (goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if (name) {
      goog.debug.fnNameCache_[fn] = name;
      return name;
    }
  }
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = "[Anonymous]";
    }
  }
  return goog.debug.fnNameCache_[functionSource];
};
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]");
};
goog.debug.fnNameCache_ = {};
goog.debug.fnNameResolver_;
goog.provide("goog.debug.LogRecord");
goog.debug.LogRecord = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber);
};
goog.debug.LogRecord.prototype.time_;
goog.debug.LogRecord.prototype.level_;
goog.debug.LogRecord.prototype.msg_;
goog.debug.LogRecord.prototype.loggerName_;
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;
goog.debug.LogRecord.prototype.exception_ = null;
goog.debug.LogRecord.prototype.exceptionText_ = null;
goog.define("goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS", true);
goog.debug.LogRecord.nextSequenceNumber_ = 0;
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  if (goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == "number" ? opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++;
  }
  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_;
};
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_;
};
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_;
};
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception;
};
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_;
};
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text;
};
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName;
};
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_;
};
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level;
};
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_;
};
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg;
};
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_;
};
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time;
};
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_;
};
goog.provide("goog.debug.LogBuffer");
goog.require("goog.asserts");
goog.require("goog.debug.LogRecord");
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(), "Cannot use goog.debug.LogBuffer without defining " + "goog.debug.LogBuffer.CAPACITY.");
  this.clear();
};
goog.debug.LogBuffer.getInstance = function() {
  if (!goog.debug.LogBuffer.instance_) {
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer;
  }
  return goog.debug.LogBuffer.instance_;
};
goog.define("goog.debug.LogBuffer.CAPACITY", 0);
goog.debug.LogBuffer.prototype.buffer_;
goog.debug.LogBuffer.prototype.curIndex_;
goog.debug.LogBuffer.prototype.isFull_;
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if (this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret;
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] = new goog.debug.LogRecord(level, msg, loggerName);
};
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0;
};
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false;
};
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  if (!buffer[0]) {
    return;
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func((buffer[i]));
  } while (i != curIndex);
};
goog.provide("goog.debug.LogManager");
goog.provide("goog.debug.Loggable");
goog.provide("goog.debug.Logger");
goog.provide("goog.debug.Logger.Level");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug");
goog.require("goog.debug.LogBuffer");
goog.require("goog.debug.LogRecord");
goog.debug.Loggable;
goog.debug.Logger = function(name) {
  this.name_ = name;
};
goog.debug.Logger.prototype.parent_ = null;
goog.debug.Logger.prototype.level_ = null;
goog.debug.Logger.prototype.children_ = null;
goog.debug.Logger.prototype.handlers_ = null;
goog.define("goog.debug.Logger.ENABLE_HIERARCHY", true);
if (!goog.debug.Logger.ENABLE_HIERARCHY) {
  goog.debug.Logger.rootHandlers_ = [];
  goog.debug.Logger.rootLevel_;
}
goog.debug.Logger.Level = function(name, value) {
  this.name = name;
  this.value = value;
};
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name;
};
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level("OFF", Infinity);
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level("SHOUT", 1200);
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level("SEVERE", 1E3);
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level("WARNING", 900);
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level("INFO", 800);
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level("CONFIG", 700);
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level("FINE", 500);
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level("FINER", 400);
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level("FINEST", 300);
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level("ALL", 0);
goog.debug.Logger.Level.PREDEFINED_LEVELS = [goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL];
goog.debug.Logger.Level.predefinedLevelsCache_ = null;
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for (var i = 0, level;level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level;
  }
};
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }
  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null;
};
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }
  if (value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value];
  }
  for (var i = 0;i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length;++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name);
};
goog.debug.Logger.logToProfilers = function(msg) {
  if (goog.global["console"]) {
    if (goog.global["console"]["timeStamp"]) {
      goog.global["console"]["timeStamp"](msg);
    } else {
      if (goog.global["console"]["markTimeline"]) {
        goog.global["console"]["markTimeline"](msg);
      }
    }
  }
  if (goog.global["msWriteProfilerMark"]) {
    goog.global["msWriteProfilerMark"](msg);
  }
};
goog.debug.Logger.prototype.getName = function() {
  return this.name_;
};
goog.debug.Logger.prototype.addHandler = function(handler) {
  if (goog.debug.LOGGING_ENABLED) {
    if (goog.debug.Logger.ENABLE_HIERARCHY) {
      if (!this.handlers_) {
        this.handlers_ = [];
      }
      this.handlers_.push(handler);
    } else {
      goog.asserts.assert(!this.name_, "Cannot call addHandler on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootHandlers_.push(handler);
    }
  }
};
goog.debug.Logger.prototype.removeHandler = function(handler) {
  if (goog.debug.LOGGING_ENABLED) {
    var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ : goog.debug.Logger.rootHandlers_;
    return!!handlers && goog.array.remove(handlers, handler);
  } else {
    return false;
  }
};
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_;
};
goog.debug.Logger.prototype.getChildren = function() {
  if (!this.children_) {
    this.children_ = {};
  }
  return this.children_;
};
goog.debug.Logger.prototype.setLevel = function(level) {
  if (goog.debug.LOGGING_ENABLED) {
    if (goog.debug.Logger.ENABLE_HIERARCHY) {
      this.level_ = level;
    } else {
      goog.asserts.assert(!this.name_, "Cannot call setLevel() on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootLevel_ = level;
    }
  }
};
goog.debug.Logger.prototype.getLevel = function() {
  return goog.debug.LOGGING_ENABLED ? this.level_ : goog.debug.Logger.Level.OFF;
};
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if (!goog.debug.LOGGING_ENABLED) {
    return goog.debug.Logger.Level.OFF;
  }
  if (!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_;
  }
  if (this.level_) {
    return this.level_;
  }
  if (this.parent_) {
    return this.parent_.getEffectiveLevel();
  }
  goog.asserts.fail("Root logger has no level set.");
  return null;
};
goog.debug.Logger.prototype.isLoggable = function(level) {
  return goog.debug.LOGGING_ENABLED && level.value >= this.getEffectiveLevel().value;
};
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED && this.isLoggable(level)) {
    if (goog.isFunction(msg)) {
      msg = msg();
    }
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception));
  }
};
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if (goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord = goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_)
  } else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_);
  }
  if (opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(goog.debug.exposeException(opt_exception, arguments.callee.caller));
  }
  return logRecord;
};
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.INFO, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINE, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINER, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  if (goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception);
  }
};
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if (goog.debug.LOGGING_ENABLED && this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord);
  }
};
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers("log:" + logRecord.getMessage());
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while (target) {
      target.callPublish_(logRecord);
      target = target.getParent();
    }
  } else {
    for (var i = 0, handler;handler = goog.debug.Logger.rootHandlers_[i++];) {
      handler(logRecord);
    }
  }
};
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if (this.handlers_) {
    for (var i = 0, handler;handler = this.handlers_[i];i++) {
      handler(logRecord);
    }
  }
};
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent;
};
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger;
};
goog.debug.LogManager = {};
goog.debug.LogManager.loggers_ = {};
goog.debug.LogManager.rootLogger_ = null;
goog.debug.LogManager.initialize = function() {
  if (!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger("");
    goog.debug.LogManager.loggers_[""] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG);
  }
};
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_;
};
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return(goog.debug.LogManager.rootLogger_);
};
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name);
};
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe("Error: " + info.message + " (" + info.fileName + " @ Line: " + info.line + ")");
  };
};
goog.debug.LogManager.createLogger_ = function(name) {
  var logger = new goog.debug.Logger(name);
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf(".");
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger);
  }
  goog.debug.LogManager.loggers_[name] = logger;
  return logger;
};
goog.provide("goog.log");
goog.provide("goog.log.Level");
goog.provide("goog.log.LogRecord");
goog.provide("goog.log.Logger");
goog.require("goog.debug");
goog.require("goog.debug.LogRecord");
goog.require("goog.debug.Logger");
goog.define("goog.log.ENABLED", goog.debug.LOGGING_ENABLED);
goog.log.Logger = goog.debug.Logger;
goog.log.Level = goog.debug.Logger.Level;
goog.log.LogRecord = goog.debug.LogRecord;
goog.log.getLogger = function(name, opt_level) {
  if (goog.log.ENABLED) {
    var logger = goog.debug.Logger.getLogger(name);
    if (opt_level && logger) {
      logger.setLevel(opt_level);
    }
    return logger;
  } else {
    return null;
  }
};
goog.log.addHandler = function(logger, handler) {
  if (goog.log.ENABLED && logger) {
    logger.addHandler(handler);
  }
};
goog.log.removeHandler = function(logger, handler) {
  if (goog.log.ENABLED && logger) {
    return logger.removeHandler(handler);
  } else {
    return false;
  }
};
goog.log.log = function(logger, level, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.log(level, msg, opt_exception);
  }
};
goog.log.error = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.severe(msg, opt_exception);
  }
};
goog.log.warning = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.warning(msg, opt_exception);
  }
};
goog.log.info = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.info(msg, opt_exception);
  }
};
goog.log.fine = function(logger, msg, opt_exception) {
  if (goog.log.ENABLED && logger) {
    logger.fine(msg, opt_exception);
  }
};
goog.provide("goog.ui.ContainerRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.classlist");
goog.require("goog.string");
goog.require("goog.style");
goog.require("goog.ui.registry");
goog.require("goog.userAgent");
goog.ui.ContainerRenderer = function() {
};
goog.addSingletonGetter(goog.ui.ContainerRenderer);
goog.ui.ContainerRenderer.getCustomRenderer = function(ctor, cssClassName) {
  var renderer = new ctor;
  renderer.getCssClass = function() {
    return cssClassName;
  };
  return renderer;
};
goog.ui.ContainerRenderer.CSS_CLASS = goog.getCssName("goog-container");
goog.ui.ContainerRenderer.prototype.getAriaRole = function() {
  return undefined;
};
goog.ui.ContainerRenderer.prototype.enableTabIndex = function(element, enable) {
  if (element) {
    element.tabIndex = enable ? 0 : -1;
  }
};
goog.ui.ContainerRenderer.prototype.createDom = function(container) {
  return container.getDomHelper().createDom("div", this.getClassNames(container).join(" "));
};
goog.ui.ContainerRenderer.prototype.getContentElement = function(element) {
  return element;
};
goog.ui.ContainerRenderer.prototype.canDecorate = function(element) {
  return element.tagName == "DIV";
};
goog.ui.ContainerRenderer.prototype.decorate = function(container, element) {
  if (element.id) {
    container.setId(element.id);
  }
  var baseClass = this.getCssClass();
  var hasBaseClass = false;
  var classNames = goog.dom.classlist.get(element);
  if (classNames) {
    goog.array.forEach(classNames, function(className) {
      if (className == baseClass) {
        hasBaseClass = true;
      } else {
        if (className) {
          this.setStateFromClassName(container, className, baseClass);
        }
      }
    }, this);
  }
  if (!hasBaseClass) {
    goog.dom.classlist.add(element, baseClass);
  }
  this.decorateChildren(container, this.getContentElement(element));
  return element;
};
goog.ui.ContainerRenderer.prototype.setStateFromClassName = function(container, className, baseClass) {
  if (className == goog.getCssName(baseClass, "disabled")) {
    container.setEnabled(false);
  } else {
    if (className == goog.getCssName(baseClass, "horizontal")) {
      container.setOrientation(goog.ui.Container.Orientation.HORIZONTAL);
    } else {
      if (className == goog.getCssName(baseClass, "vertical")) {
        container.setOrientation(goog.ui.Container.Orientation.VERTICAL);
      }
    }
  }
};
goog.ui.ContainerRenderer.prototype.decorateChildren = function(container, element, opt_firstChild) {
  if (element) {
    var node = opt_firstChild || element.firstChild, next;
    while (node && node.parentNode == element) {
      next = node.nextSibling;
      if (node.nodeType == goog.dom.NodeType.ELEMENT) {
        var child = this.getDecoratorForChild((node));
        if (child) {
          child.setElementInternal((node));
          if (!container.isEnabled()) {
            child.setEnabled(false);
          }
          container.addChild(child);
          child.decorate((node));
        }
      } else {
        if (!node.nodeValue || goog.string.trim(node.nodeValue) == "") {
          element.removeChild(node);
        }
      }
      node = next;
    }
  }
};
goog.ui.ContainerRenderer.prototype.getDecoratorForChild = function(element) {
  return(goog.ui.registry.getDecorator(element));
};
goog.ui.ContainerRenderer.prototype.initializeDom = function(container) {
  var elem = container.getElement();
  goog.asserts.assert(elem, "The container DOM element cannot be null.");
  goog.style.setUnselectable(elem, true, goog.userAgent.GECKO);
  if (goog.userAgent.IE) {
    elem.hideFocus = true;
  }
  var ariaRole = this.getAriaRole();
  if (ariaRole) {
    goog.a11y.aria.setRole(elem, ariaRole);
  }
};
goog.ui.ContainerRenderer.prototype.getKeyEventTarget = function(container) {
  return container.getElement();
};
goog.ui.ContainerRenderer.prototype.getCssClass = function() {
  return goog.ui.ContainerRenderer.CSS_CLASS;
};
goog.ui.ContainerRenderer.prototype.getClassNames = function(container) {
  var baseClass = this.getCssClass();
  var isHorizontal = container.getOrientation() == goog.ui.Container.Orientation.HORIZONTAL;
  var classNames = [baseClass, isHorizontal ? goog.getCssName(baseClass, "horizontal") : goog.getCssName(baseClass, "vertical")];
  if (!container.isEnabled()) {
    classNames.push(goog.getCssName(baseClass, "disabled"));
  }
  return classNames;
};
goog.ui.ContainerRenderer.prototype.getDefaultOrientation = function() {
  return goog.ui.Container.Orientation.VERTICAL;
};
goog.provide("goog.ui.MenuSeparatorRenderer");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.ui.ControlContent");
goog.require("goog.ui.ControlRenderer");
goog.ui.MenuSeparatorRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.MenuSeparatorRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuSeparatorRenderer);
goog.ui.MenuSeparatorRenderer.CSS_CLASS = goog.getCssName("goog-menuseparator");
goog.ui.MenuSeparatorRenderer.prototype.createDom = function(separator) {
  return separator.getDomHelper().createDom("div", this.getCssClass());
};
goog.ui.MenuSeparatorRenderer.prototype.decorate = function(separator, element) {
  if (element.id) {
    separator.setId(element.id);
  }
  if (element.tagName == "HR") {
    var hr = element;
    element = this.createDom(separator);
    goog.dom.insertSiblingBefore(element, hr);
    goog.dom.removeNode(hr);
  } else {
    goog.dom.classlist.add(element, this.getCssClass());
  }
  return element;
};
goog.ui.MenuSeparatorRenderer.prototype.setContent = function(separator, content) {
};
goog.ui.MenuSeparatorRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuSeparatorRenderer.CSS_CLASS;
};
goog.provide("goog.ui.Separator");
goog.require("goog.a11y.aria");
goog.require("goog.asserts");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.MenuSeparatorRenderer");
goog.require("goog.ui.registry");
goog.ui.Separator = function(opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, null, opt_renderer || goog.ui.MenuSeparatorRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  this.setStateInternal(goog.ui.Component.State.DISABLED);
};
goog.inherits(goog.ui.Separator, goog.ui.Control);
goog.ui.Separator.prototype.enterDocument = function() {
  goog.ui.Separator.superClass_.enterDocument.call(this);
  var element = this.getElement();
  goog.asserts.assert(element, "The DOM element for the separator cannot be null.");
  goog.a11y.aria.setRole(element, "separator");
};
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() {
  return new goog.ui.Separator;
});
goog.provide("goog.ui.MenuRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.ui.ContainerRenderer");
goog.require("goog.ui.Separator");
goog.ui.MenuRenderer = function() {
  goog.ui.ContainerRenderer.call(this);
};
goog.inherits(goog.ui.MenuRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(goog.ui.MenuRenderer);
goog.ui.MenuRenderer.CSS_CLASS = goog.getCssName("goog-menu");
goog.ui.MenuRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.MENU;
};
goog.ui.MenuRenderer.prototype.canDecorate = function(element) {
  return element.tagName == "UL" || goog.ui.MenuRenderer.superClass_.canDecorate.call(this, element);
};
goog.ui.MenuRenderer.prototype.getDecoratorForChild = function(element) {
  return element.tagName == "HR" ? new goog.ui.Separator : goog.ui.MenuRenderer.superClass_.getDecoratorForChild.call(this, element);
};
goog.ui.MenuRenderer.prototype.containsElement = function(menu, element) {
  return goog.dom.contains(menu.getElement(), element);
};
goog.ui.MenuRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuRenderer.CSS_CLASS;
};
goog.ui.MenuRenderer.prototype.initializeDom = function(container) {
  goog.ui.MenuRenderer.superClass_.initializeDom.call(this, container);
  var element = container.getElement();
  goog.asserts.assert(element, "The menu DOM element cannot be null.");
  goog.a11y.aria.setState(element, goog.a11y.aria.State.HASPOPUP, "true");
};
goog.provide("goog.ui.MenuSeparator");
goog.require("goog.ui.MenuSeparatorRenderer");
goog.require("goog.ui.Separator");
goog.require("goog.ui.registry");
goog.ui.MenuSeparator = function(opt_domHelper) {
  goog.ui.Separator.call(this, goog.ui.MenuSeparatorRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.MenuSeparator, goog.ui.Separator);
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuSeparatorRenderer.CSS_CLASS, function() {
  return new goog.ui.Separator;
});
goog.provide("goog.ui.MenuItemRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlRenderer");
goog.ui.MenuItemRenderer = function() {
  goog.ui.ControlRenderer.call(this);
  this.classNameCache_ = [];
};
goog.inherits(goog.ui.MenuItemRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuItemRenderer);
goog.ui.MenuItemRenderer.CSS_CLASS = goog.getCssName("goog-menuitem");
goog.ui.MenuItemRenderer.CompositeCssClassIndex_ = {HOVER:0, CHECKBOX:1, CONTENT:2};
goog.ui.MenuItemRenderer.prototype.getCompositeCssClass_ = function(index) {
  var result = this.classNameCache_[index];
  if (!result) {
    switch(index) {
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER:
        result = goog.getCssName(this.getStructuralCssClass(), "highlight");
        break;
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX:
        result = goog.getCssName(this.getStructuralCssClass(), "checkbox");
        break;
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT:
        result = goog.getCssName(this.getStructuralCssClass(), "content");
        break;
    }
    this.classNameCache_[index] = result;
  }
  return result;
};
goog.ui.MenuItemRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.MENU_ITEM;
};
goog.ui.MenuItemRenderer.prototype.createDom = function(item) {
  var element = item.getDomHelper().createDom("div", this.getClassNames(item).join(" "), this.createContent(item.getContent(), item.getDomHelper()));
  this.setEnableCheckBoxStructure(item, element, item.isSupportedState(goog.ui.Component.State.SELECTED) || item.isSupportedState(goog.ui.Component.State.CHECKED));
  this.setAriaStates(item, element);
  return element;
};
goog.ui.MenuItemRenderer.prototype.getContentElement = function(element) {
  return(element && element.firstChild);
};
goog.ui.MenuItemRenderer.prototype.decorate = function(item, element) {
  if (!this.hasContentStructure(element)) {
    element.appendChild(this.createContent(element.childNodes, item.getDomHelper()));
  }
  if (goog.dom.classlist.contains(element, goog.getCssName("goog-option"))) {
    (item).setCheckable(true);
    this.setCheckable(item, element, true);
  }
  return goog.ui.MenuItemRenderer.superClass_.decorate.call(this, item, element);
};
goog.ui.MenuItemRenderer.prototype.setContent = function(element, content) {
  var contentElement = this.getContentElement(element);
  var checkBoxElement = this.hasCheckBoxStructure(element) ? contentElement.firstChild : null;
  goog.ui.MenuItemRenderer.superClass_.setContent.call(this, element, content);
  if (checkBoxElement && !this.hasCheckBoxStructure(element)) {
    contentElement.insertBefore(checkBoxElement, contentElement.firstChild || null);
  }
};
goog.ui.MenuItemRenderer.prototype.hasContentStructure = function(element) {
  var child = goog.dom.getFirstElementChild(element);
  var contentClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return!!child && goog.dom.classlist.contains(child, contentClassName);
};
goog.ui.MenuItemRenderer.prototype.createContent = function(content, dom) {
  var contentClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT);
  return dom.createDom("div", contentClassName, content);
};
goog.ui.MenuItemRenderer.prototype.setSelectable = function(item, element, selectable) {
  if (element) {
    goog.a11y.aria.setRole(element, selectable ? goog.a11y.aria.Role.MENU_ITEM_RADIO : (this.getAriaRole()));
    this.setEnableCheckBoxStructure(item, element, selectable);
  }
};
goog.ui.MenuItemRenderer.prototype.setCheckable = function(item, element, checkable) {
  if (element) {
    goog.a11y.aria.setRole(element, checkable ? goog.a11y.aria.Role.MENU_ITEM_CHECKBOX : (this.getAriaRole()));
    this.setEnableCheckBoxStructure(item, element, checkable);
  }
};
goog.ui.MenuItemRenderer.prototype.hasCheckBoxStructure = function(element) {
  var contentElement = this.getContentElement(element);
  if (contentElement) {
    var child = contentElement.firstChild;
    var checkboxClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
    return!!child && (goog.dom.isElement(child) && goog.dom.classlist.contains((child), checkboxClassName));
  }
  return false;
};
goog.ui.MenuItemRenderer.prototype.setEnableCheckBoxStructure = function(item, element, enable) {
  if (enable != this.hasCheckBoxStructure(element)) {
    goog.dom.classlist.enable(element, goog.getCssName("goog-option"), enable);
    var contentElement = this.getContentElement(element);
    if (enable) {
      var checkboxClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX);
      contentElement.insertBefore(item.getDomHelper().createDom("div", checkboxClassName), contentElement.firstChild || null);
    } else {
      contentElement.removeChild(contentElement.firstChild);
    }
  }
};
goog.ui.MenuItemRenderer.prototype.getClassForState = function(state) {
  switch(state) {
    case goog.ui.Component.State.HOVER:
      return this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER);
    case goog.ui.Component.State.CHECKED:
    ;
    case goog.ui.Component.State.SELECTED:
      return goog.getCssName("goog-option-selected");
    default:
      return goog.ui.MenuItemRenderer.superClass_.getClassForState.call(this, state);
  }
};
goog.ui.MenuItemRenderer.prototype.getStateFromClass = function(className) {
  var hoverClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER);
  switch(className) {
    case goog.getCssName("goog-option-selected"):
      return goog.ui.Component.State.CHECKED;
    case hoverClassName:
      return goog.ui.Component.State.HOVER;
    default:
      return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(this, className);
  }
};
goog.ui.MenuItemRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuItemRenderer.CSS_CLASS;
};
goog.provide("goog.ui.MenuItem");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.math.Coordinate");
goog.require("goog.string");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.MenuItemRenderer");
goog.require("goog.ui.registry");
goog.ui.MenuItem = function(content, opt_model, opt_domHelper, opt_renderer) {
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.MenuItemRenderer.getInstance(), opt_domHelper);
  this.setValue(opt_model);
};
goog.inherits(goog.ui.MenuItem, goog.ui.Control);
goog.ui.MenuItem.mnemonicKey_;
goog.ui.MenuItem.MNEMONIC_WRAPPER_CLASS_ = goog.getCssName("goog-menuitem-mnemonic-separator");
goog.ui.MenuItem.ACCELERATOR_CLASS_ = goog.getCssName("goog-menuitem-accel");
goog.ui.MenuItem.prototype.getValue = function() {
  var model = this.getModel();
  return model != null ? model : this.getCaption();
};
goog.ui.MenuItem.prototype.setValue = function(value) {
  this.setModel(value);
};
goog.ui.MenuItem.prototype.setSelectable = function(selectable) {
  this.setSupportedState(goog.ui.Component.State.SELECTED, selectable);
  if (this.isChecked() && !selectable) {
    this.setChecked(false);
  }
  var element = this.getElement();
  if (element) {
    this.getRenderer().setSelectable(this, element, selectable);
  }
};
goog.ui.MenuItem.prototype.setCheckable = function(checkable) {
  this.setSupportedState(goog.ui.Component.State.CHECKED, checkable);
  var element = this.getElement();
  if (element) {
    this.getRenderer().setCheckable(this, element, checkable);
  }
};
goog.ui.MenuItem.prototype.getCaption = function() {
  var content = this.getContent();
  if (goog.isArray(content)) {
    var acceleratorClass = goog.ui.MenuItem.ACCELERATOR_CLASS_;
    var mnemonicWrapClass = goog.ui.MenuItem.MNEMONIC_WRAPPER_CLASS_;
    var caption = goog.array.map(content, function(node) {
      if (goog.dom.isElement(node) && (goog.dom.classlist.contains((node), acceleratorClass) || goog.dom.classlist.contains((node), mnemonicWrapClass))) {
        return "";
      } else {
        return goog.dom.getRawTextContent(node);
      }
    }).join("");
    return goog.string.collapseBreakingSpaces(caption);
  }
  return goog.ui.MenuItem.superClass_.getCaption.call(this);
};
goog.ui.MenuItem.prototype.handleMouseUp = function(e) {
  var parentMenu = (this.getParent());
  if (parentMenu) {
    var oldCoords = parentMenu.openingCoords;
    parentMenu.openingCoords = null;
    if (oldCoords && goog.isNumber(e.clientX)) {
      var newCoords = new goog.math.Coordinate(e.clientX, e.clientY);
      if (goog.math.Coordinate.equals(oldCoords, newCoords)) {
        return;
      }
    }
  }
  goog.base(this, "handleMouseUp", e);
};
goog.ui.MenuItem.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == this.getMnemonic() && this.performActionInternal(e)) {
    return true;
  } else {
    return goog.base(this, "handleKeyEventInternal", e);
  }
};
goog.ui.MenuItem.prototype.setMnemonic = function(key) {
  this.mnemonicKey_ = key;
};
goog.ui.MenuItem.prototype.getMnemonic = function() {
  return this.mnemonicKey_;
};
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuItemRenderer.CSS_CLASS, function() {
  return new goog.ui.MenuItem(null);
});
goog.provide("goog.ui.Container");
goog.provide("goog.ui.Container.EventType");
goog.provide("goog.ui.Container.Orientation");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.object");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.ui.ContainerRenderer");
goog.require("goog.ui.Control");
goog.ui.Container = function(opt_orientation, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
  this.orientation_ = opt_orientation || this.renderer_.getDefaultOrientation();
};
goog.inherits(goog.ui.Container, goog.ui.Component);
goog.ui.Container.EventType = {AFTER_SHOW:"aftershow", AFTER_HIDE:"afterhide"};
goog.ui.Container.Orientation = {HORIZONTAL:"horizontal", VERTICAL:"vertical"};
goog.ui.Container.prototype.keyEventTarget_ = null;
goog.ui.Container.prototype.keyHandler_ = null;
goog.ui.Container.prototype.renderer_ = null;
goog.ui.Container.prototype.orientation_ = null;
goog.ui.Container.prototype.visible_ = true;
goog.ui.Container.prototype.enabled_ = true;
goog.ui.Container.prototype.focusable_ = true;
goog.ui.Container.prototype.highlightedIndex_ = -1;
goog.ui.Container.prototype.openItem_ = null;
goog.ui.Container.prototype.mouseButtonPressed_ = false;
goog.ui.Container.prototype.allowFocusableChildren_ = false;
goog.ui.Container.prototype.openFollowsHighlight_ = true;
goog.ui.Container.prototype.childElementIdMap_ = null;
goog.ui.Container.prototype.getKeyEventTarget = function() {
  return this.keyEventTarget_ || this.renderer_.getKeyEventTarget(this);
};
goog.ui.Container.prototype.setKeyEventTarget = function(element) {
  if (this.focusable_) {
    var oldTarget = this.getKeyEventTarget();
    var inDocument = this.isInDocument();
    this.keyEventTarget_ = element;
    var newTarget = this.getKeyEventTarget();
    if (inDocument) {
      this.keyEventTarget_ = oldTarget;
      this.enableFocusHandling_(false);
      this.keyEventTarget_ = element;
      this.getKeyHandler().attach(newTarget);
      this.enableFocusHandling_(true);
    }
  } else {
    throw Error("Can't set key event target for container " + "that doesn't support keyboard focus!");
  }
};
goog.ui.Container.prototype.getKeyHandler = function() {
  return this.keyHandler_ || (this.keyHandler_ = new goog.events.KeyHandler(this.getKeyEventTarget()));
};
goog.ui.Container.prototype.getRenderer = function() {
  return this.renderer_;
};
goog.ui.Container.prototype.setRenderer = function(renderer) {
  if (this.getElement()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.renderer_ = renderer;
};
goog.ui.Container.prototype.createDom = function() {
  this.setElementInternal(this.renderer_.createDom(this));
};
goog.ui.Container.prototype.getContentElement = function() {
  return this.renderer_.getContentElement(this.getElement());
};
goog.ui.Container.prototype.canDecorate = function(element) {
  return this.renderer_.canDecorate(element);
};
goog.ui.Container.prototype.decorateInternal = function(element) {
  this.setElementInternal(this.renderer_.decorate(this, element));
  if (element.style.display == "none") {
    this.visible_ = false;
  }
};
goog.ui.Container.prototype.enterDocument = function() {
  goog.ui.Container.superClass_.enterDocument.call(this);
  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      this.registerChildId_(child);
    }
  }, this);
  var elem = this.getElement();
  this.renderer_.initializeDom(this);
  this.setVisible(this.visible_, true);
  this.getHandler().listen(this, goog.ui.Component.EventType.ENTER, this.handleEnterItem).listen(this, goog.ui.Component.EventType.HIGHLIGHT, this.handleHighlightItem).listen(this, goog.ui.Component.EventType.UNHIGHLIGHT, this.handleUnHighlightItem).listen(this, goog.ui.Component.EventType.OPEN, this.handleOpenItem).listen(this, goog.ui.Component.EventType.CLOSE, this.handleCloseItem).listen(elem, goog.events.EventType.MOUSEDOWN, this.handleMouseDown).listen(goog.dom.getOwnerDocument(elem), goog.events.EventType.MOUSEUP, 
  this.handleDocumentMouseUp).listen(elem, [goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEUP, goog.events.EventType.MOUSEOVER, goog.events.EventType.MOUSEOUT, goog.events.EventType.CONTEXTMENU], this.handleChildMouseEvents);
  if (this.isFocusable()) {
    this.enableFocusHandling_(true);
  }
};
goog.ui.Container.prototype.enableFocusHandling_ = function(enable) {
  var handler = this.getHandler();
  var keyTarget = this.getKeyEventTarget();
  if (enable) {
    handler.listen(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).listen(keyTarget, goog.events.EventType.BLUR, this.handleBlur).listen(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent);
  } else {
    handler.unlisten(keyTarget, goog.events.EventType.FOCUS, this.handleFocus).unlisten(keyTarget, goog.events.EventType.BLUR, this.handleBlur).unlisten(this.getKeyHandler(), goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent);
  }
};
goog.ui.Container.prototype.exitDocument = function() {
  this.setHighlightedIndex(-1);
  if (this.openItem_) {
    this.openItem_.setOpen(false);
  }
  this.mouseButtonPressed_ = false;
  goog.ui.Container.superClass_.exitDocument.call(this);
};
goog.ui.Container.prototype.disposeInternal = function() {
  goog.ui.Container.superClass_.disposeInternal.call(this);
  if (this.keyHandler_) {
    this.keyHandler_.dispose();
    this.keyHandler_ = null;
  }
  this.keyEventTarget_ = null;
  this.childElementIdMap_ = null;
  this.openItem_ = null;
  this.renderer_ = null;
};
goog.ui.Container.prototype.handleEnterItem = function(e) {
  return true;
};
goog.ui.Container.prototype.handleHighlightItem = function(e) {
  var index = this.indexOfChild((e.target));
  if (index > -1 && index != this.highlightedIndex_) {
    var item = this.getHighlighted();
    if (item) {
      item.setHighlighted(false);
    }
    this.highlightedIndex_ = index;
    item = this.getHighlighted();
    if (this.isMouseButtonPressed()) {
      item.setActive(true);
    }
    if (this.openFollowsHighlight_ && (this.openItem_ && item != this.openItem_)) {
      if (item.isSupportedState(goog.ui.Component.State.OPENED)) {
        item.setOpen(true);
      } else {
        this.openItem_.setOpen(false);
      }
    }
  }
  var element = this.getElement();
  goog.asserts.assert(element, "The DOM element for the container cannot be null.");
  if (e.target.getElement() != null) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, e.target.getElement().id);
  }
};
goog.ui.Container.prototype.handleUnHighlightItem = function(e) {
  if (e.target == this.getHighlighted()) {
    this.highlightedIndex_ = -1;
  }
  var element = this.getElement();
  goog.asserts.assert(element, "The DOM element for the container cannot be null.");
  goog.a11y.aria.removeState(element, goog.a11y.aria.State.ACTIVEDESCENDANT);
};
goog.ui.Container.prototype.handleOpenItem = function(e) {
  var item = (e.target);
  if (item && (item != this.openItem_ && item.getParent() == this)) {
    if (this.openItem_) {
      this.openItem_.setOpen(false);
    }
    this.openItem_ = item;
  }
};
goog.ui.Container.prototype.handleCloseItem = function(e) {
  if (e.target == this.openItem_) {
    this.openItem_ = null;
  }
};
goog.ui.Container.prototype.handleMouseDown = function(e) {
  if (this.enabled_) {
    this.setMouseButtonPressed(true);
  }
  var keyTarget = this.getKeyEventTarget();
  if (keyTarget && goog.dom.isFocusableTabIndex(keyTarget)) {
    keyTarget.focus();
  } else {
    e.preventDefault();
  }
};
goog.ui.Container.prototype.handleDocumentMouseUp = function(e) {
  this.setMouseButtonPressed(false);
};
goog.ui.Container.prototype.handleChildMouseEvents = function(e) {
  var control = this.getOwnerControl((e.target));
  if (control) {
    switch(e.type) {
      case goog.events.EventType.MOUSEDOWN:
        control.handleMouseDown(e);
        break;
      case goog.events.EventType.MOUSEUP:
        control.handleMouseUp(e);
        break;
      case goog.events.EventType.MOUSEOVER:
        control.handleMouseOver(e);
        break;
      case goog.events.EventType.MOUSEOUT:
        control.handleMouseOut(e);
        break;
      case goog.events.EventType.CONTEXTMENU:
        control.handleContextMenu(e);
        break;
    }
  }
};
goog.ui.Container.prototype.getOwnerControl = function(node) {
  if (this.childElementIdMap_) {
    var elem = this.getElement();
    while (node && node !== elem) {
      var id = node.id;
      if (id in this.childElementIdMap_) {
        return this.childElementIdMap_[id];
      }
      node = node.parentNode;
    }
  }
  return null;
};
goog.ui.Container.prototype.handleFocus = function(e) {
};
goog.ui.Container.prototype.handleBlur = function(e) {
  this.setHighlightedIndex(-1);
  this.setMouseButtonPressed(false);
  if (this.openItem_) {
    this.openItem_.setOpen(false);
  }
};
goog.ui.Container.prototype.handleKeyEvent = function(e) {
  if (this.isEnabled() && (this.isVisible() && ((this.getChildCount() != 0 || this.keyEventTarget_) && this.handleKeyEventInternal(e)))) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
};
goog.ui.Container.prototype.handleKeyEventInternal = function(e) {
  var highlighted = this.getHighlighted();
  if (highlighted && (typeof highlighted.handleKeyEvent == "function" && highlighted.handleKeyEvent(e))) {
    return true;
  }
  if (this.openItem_ && (this.openItem_ != highlighted && (typeof this.openItem_.handleKeyEvent == "function" && this.openItem_.handleKeyEvent(e)))) {
    return true;
  }
  if (e.shiftKey || (e.ctrlKey || (e.metaKey || e.altKey))) {
    return false;
  }
  switch(e.keyCode) {
    case goog.events.KeyCodes.ESC:
      if (this.isFocusable()) {
        this.getKeyEventTarget().blur();
      } else {
        return false;
      }
      break;
    case goog.events.KeyCodes.HOME:
      this.highlightFirst();
      break;
    case goog.events.KeyCodes.END:
      this.highlightLast();
      break;
    case goog.events.KeyCodes.UP:
      if (this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
        this.highlightPrevious();
      } else {
        return false;
      }
      break;
    case goog.events.KeyCodes.LEFT:
      if (this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
        if (this.isRightToLeft()) {
          this.highlightNext();
        } else {
          this.highlightPrevious();
        }
      } else {
        return false;
      }
      break;
    case goog.events.KeyCodes.DOWN:
      if (this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
        this.highlightNext();
      } else {
        return false;
      }
      break;
    case goog.events.KeyCodes.RIGHT:
      if (this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
        if (this.isRightToLeft()) {
          this.highlightPrevious();
        } else {
          this.highlightNext();
        }
      } else {
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
};
goog.ui.Container.prototype.registerChildId_ = function(child) {
  var childElem = child.getElement();
  var id = childElem.id || (childElem.id = child.getId());
  if (!this.childElementIdMap_) {
    this.childElementIdMap_ = {};
  }
  this.childElementIdMap_[id] = child;
};
goog.ui.Container.prototype.addChild = function(child, opt_render) {
  goog.asserts.assertInstanceof(child, goog.ui.Control, "The child of a container must be a control");
  goog.ui.Container.superClass_.addChild.call(this, child, opt_render);
};
goog.ui.Container.prototype.getChild;
goog.ui.Container.prototype.getChildAt;
goog.ui.Container.prototype.addChildAt = function(control, index, opt_render) {
  control.setDispatchTransitionEvents(goog.ui.Component.State.HOVER, true);
  control.setDispatchTransitionEvents(goog.ui.Component.State.OPENED, true);
  if (this.isFocusable() || !this.isFocusableChildrenAllowed()) {
    control.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  }
  control.setHandleMouseEvents(false);
  goog.ui.Container.superClass_.addChildAt.call(this, control, index, opt_render);
  if (control.isInDocument() && this.isInDocument()) {
    this.registerChildId_(control);
  }
  if (index <= this.highlightedIndex_) {
    this.highlightedIndex_++;
  }
};
goog.ui.Container.prototype.removeChild = function(control, opt_unrender) {
  control = goog.isString(control) ? this.getChild(control) : control;
  if (control) {
    var index = this.indexOfChild(control);
    if (index != -1) {
      if (index == this.highlightedIndex_) {
        control.setHighlighted(false);
        this.highlightedIndex_ = -1;
      } else {
        if (index < this.highlightedIndex_) {
          this.highlightedIndex_--;
        }
      }
    }
    var childElem = control.getElement();
    if (childElem && (childElem.id && this.childElementIdMap_)) {
      goog.object.remove(this.childElementIdMap_, childElem.id);
    }
  }
  control = (goog.ui.Container.superClass_.removeChild.call(this, control, opt_unrender));
  control.setHandleMouseEvents(true);
  return control;
};
goog.ui.Container.prototype.getOrientation = function() {
  return this.orientation_;
};
goog.ui.Container.prototype.setOrientation = function(orientation) {
  if (this.getElement()) {
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
  }
  this.orientation_ = orientation;
};
goog.ui.Container.prototype.isVisible = function() {
  return this.visible_;
};
goog.ui.Container.prototype.setVisible = function(visible, opt_force) {
  if (opt_force || this.visible_ != visible && this.dispatchEvent(visible ? goog.ui.Component.EventType.SHOW : goog.ui.Component.EventType.HIDE)) {
    this.visible_ = visible;
    var elem = this.getElement();
    if (elem) {
      goog.style.setElementShown(elem, visible);
      if (this.isFocusable()) {
        this.renderer_.enableTabIndex(this.getKeyEventTarget(), this.enabled_ && this.visible_);
      }
      if (!opt_force) {
        this.dispatchEvent(this.visible_ ? goog.ui.Container.EventType.AFTER_SHOW : goog.ui.Container.EventType.AFTER_HIDE);
      }
    }
    return true;
  }
  return false;
};
goog.ui.Container.prototype.isEnabled = function() {
  return this.enabled_;
};
goog.ui.Container.prototype.setEnabled = function(enable) {
  if (this.enabled_ != enable && this.dispatchEvent(enable ? goog.ui.Component.EventType.ENABLE : goog.ui.Component.EventType.DISABLE)) {
    if (enable) {
      this.enabled_ = true;
      this.forEachChild(function(child) {
        if (child.wasDisabled) {
          delete child.wasDisabled;
        } else {
          child.setEnabled(true);
        }
      });
    } else {
      this.forEachChild(function(child) {
        if (child.isEnabled()) {
          child.setEnabled(false);
        } else {
          child.wasDisabled = true;
        }
      });
      this.enabled_ = false;
      this.setMouseButtonPressed(false);
    }
    if (this.isFocusable()) {
      this.renderer_.enableTabIndex(this.getKeyEventTarget(), enable && this.visible_);
    }
  }
};
goog.ui.Container.prototype.isFocusable = function() {
  return this.focusable_;
};
goog.ui.Container.prototype.setFocusable = function(focusable) {
  if (focusable != this.focusable_ && this.isInDocument()) {
    this.enableFocusHandling_(focusable);
  }
  this.focusable_ = focusable;
  if (this.enabled_ && this.visible_) {
    this.renderer_.enableTabIndex(this.getKeyEventTarget(), focusable);
  }
};
goog.ui.Container.prototype.isFocusableChildrenAllowed = function() {
  return this.allowFocusableChildren_;
};
goog.ui.Container.prototype.setFocusableChildrenAllowed = function(focusable) {
  this.allowFocusableChildren_ = focusable;
};
goog.ui.Container.prototype.isOpenFollowsHighlight = function() {
  return this.openFollowsHighlight_;
};
goog.ui.Container.prototype.setOpenFollowsHighlight = function(follow) {
  this.openFollowsHighlight_ = follow;
};
goog.ui.Container.prototype.getHighlightedIndex = function() {
  return this.highlightedIndex_;
};
goog.ui.Container.prototype.setHighlightedIndex = function(index) {
  var child = this.getChildAt(index);
  if (child) {
    child.setHighlighted(true);
  } else {
    if (this.highlightedIndex_ > -1) {
      this.getHighlighted().setHighlighted(false);
    }
  }
};
goog.ui.Container.prototype.setHighlighted = function(item) {
  this.setHighlightedIndex(this.indexOfChild(item));
};
goog.ui.Container.prototype.getHighlighted = function() {
  return this.getChildAt(this.highlightedIndex_);
};
goog.ui.Container.prototype.highlightFirst = function() {
  this.highlightHelper(function(index, max) {
    return(index + 1) % max;
  }, this.getChildCount() - 1);
};
goog.ui.Container.prototype.highlightLast = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, 0);
};
goog.ui.Container.prototype.highlightNext = function() {
  this.highlightHelper(function(index, max) {
    return(index + 1) % max;
  }, this.highlightedIndex_);
};
goog.ui.Container.prototype.highlightPrevious = function() {
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, this.highlightedIndex_);
};
goog.ui.Container.prototype.highlightHelper = function(fn, startIndex) {
  var curIndex = startIndex < 0 ? this.indexOfChild(this.openItem_) : startIndex;
  var numItems = this.getChildCount();
  curIndex = fn.call(this, curIndex, numItems);
  var visited = 0;
  while (visited <= numItems) {
    var control = this.getChildAt(curIndex);
    if (control && this.canHighlightItem(control)) {
      this.setHighlightedIndexFromKeyEvent(curIndex);
      return true;
    }
    visited++;
    curIndex = fn.call(this, curIndex, numItems);
  }
  return false;
};
goog.ui.Container.prototype.canHighlightItem = function(item) {
  return item.isVisible() && (item.isEnabled() && item.isSupportedState(goog.ui.Component.State.HOVER));
};
goog.ui.Container.prototype.setHighlightedIndexFromKeyEvent = function(index) {
  this.setHighlightedIndex(index);
};
goog.ui.Container.prototype.getOpenItem = function() {
  return this.openItem_;
};
goog.ui.Container.prototype.isMouseButtonPressed = function() {
  return this.mouseButtonPressed_;
};
goog.ui.Container.prototype.setMouseButtonPressed = function(pressed) {
  this.mouseButtonPressed_ = pressed;
};
goog.provide("goog.ui.MenuHeaderRenderer");
goog.require("goog.ui.ControlRenderer");
goog.ui.MenuHeaderRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.MenuHeaderRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.MenuHeaderRenderer);
goog.ui.MenuHeaderRenderer.CSS_CLASS = goog.getCssName("goog-menuheader");
goog.ui.MenuHeaderRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuHeaderRenderer.CSS_CLASS;
};
goog.provide("goog.ui.MenuHeader");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.MenuHeaderRenderer");
goog.require("goog.ui.registry");
goog.ui.MenuHeader = function(content, opt_domHelper, opt_renderer) {
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.MenuHeaderRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.DISABLED, false);
  this.setSupportedState(goog.ui.Component.State.HOVER, false);
  this.setSupportedState(goog.ui.Component.State.ACTIVE, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);
  this.setStateInternal(goog.ui.Component.State.DISABLED);
};
goog.inherits(goog.ui.MenuHeader, goog.ui.Control);
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuHeaderRenderer.CSS_CLASS, function() {
  return new goog.ui.MenuHeader(null);
});
goog.provide("goog.ui.Menu");
goog.provide("goog.ui.Menu.EventType");
goog.require("goog.math.Coordinate");
goog.require("goog.string");
goog.require("goog.style");
goog.require("goog.ui.Component.EventType");
goog.require("goog.ui.Component.State");
goog.require("goog.ui.Container");
goog.require("goog.ui.Container.Orientation");
goog.require("goog.ui.MenuHeader");
goog.require("goog.ui.MenuItem");
goog.require("goog.ui.MenuRenderer");
goog.require("goog.ui.MenuSeparator");
goog.ui.Menu = function(opt_domHelper, opt_renderer) {
  goog.ui.Container.call(this, goog.ui.Container.Orientation.VERTICAL, opt_renderer || goog.ui.MenuRenderer.getInstance(), opt_domHelper);
  this.setFocusable(false);
};
goog.inherits(goog.ui.Menu, goog.ui.Container);
goog.ui.Menu.EventType = {BEFORE_SHOW:goog.ui.Component.EventType.BEFORE_SHOW, SHOW:goog.ui.Component.EventType.SHOW, BEFORE_HIDE:goog.ui.Component.EventType.HIDE, HIDE:goog.ui.Component.EventType.HIDE};
goog.ui.Menu.CSS_CLASS = goog.ui.MenuRenderer.CSS_CLASS;
goog.ui.Menu.prototype.openingCoords;
goog.ui.Menu.prototype.allowAutoFocus_ = true;
goog.ui.Menu.prototype.allowHighlightDisabled_ = false;
goog.ui.Menu.prototype.getCssClass = function() {
  return this.getRenderer().getCssClass();
};
goog.ui.Menu.prototype.containsElement = function(element) {
  if (this.getRenderer().containsElement(this, element)) {
    return true;
  }
  for (var i = 0, count = this.getChildCount();i < count;i++) {
    var child = this.getChildAt(i);
    if (typeof child.containsElement == "function" && child.containsElement(element)) {
      return true;
    }
  }
  return false;
};
goog.ui.Menu.prototype.addItem = function(item) {
  this.addChild(item, true);
};
goog.ui.Menu.prototype.addItemAt = function(item, n) {
  this.addChildAt(item, n, true);
};
goog.ui.Menu.prototype.removeItem = function(item) {
  var removedChild = this.removeChild(item, true);
  if (removedChild) {
    removedChild.dispose();
  }
};
goog.ui.Menu.prototype.removeItemAt = function(n) {
  var removedChild = this.removeChildAt(n, true);
  if (removedChild) {
    removedChild.dispose();
  }
};
goog.ui.Menu.prototype.getItemAt = function(n) {
  return(this.getChildAt(n));
};
goog.ui.Menu.prototype.getItemCount = function() {
  return this.getChildCount();
};
goog.ui.Menu.prototype.getItems = function() {
  var children = [];
  this.forEachChild(function(child) {
    children.push(child);
  });
  return children;
};
goog.ui.Menu.prototype.setPosition = function(x, opt_y) {
  var visible = this.isVisible();
  if (!visible) {
    goog.style.setElementShown(this.getElement(), true);
  }
  goog.style.setPageOffset(this.getElement(), x, opt_y);
  if (!visible) {
    goog.style.setElementShown(this.getElement(), false);
  }
};
goog.ui.Menu.prototype.getPosition = function() {
  return this.isVisible() ? goog.style.getPageOffset(this.getElement()) : null;
};
goog.ui.Menu.prototype.setAllowAutoFocus = function(allow) {
  this.allowAutoFocus_ = allow;
  if (allow) {
    this.setFocusable(true);
  }
};
goog.ui.Menu.prototype.getAllowAutoFocus = function() {
  return this.allowAutoFocus_;
};
goog.ui.Menu.prototype.setAllowHighlightDisabled = function(allow) {
  this.allowHighlightDisabled_ = allow;
};
goog.ui.Menu.prototype.getAllowHighlightDisabled = function() {
  return this.allowHighlightDisabled_;
};
goog.ui.Menu.prototype.setVisible = function(show, opt_force, opt_e) {
  var visibilityChanged = goog.ui.Menu.superClass_.setVisible.call(this, show, opt_force);
  if (visibilityChanged && (show && (this.isInDocument() && this.allowAutoFocus_))) {
    this.getKeyEventTarget().focus();
  }
  if (show && (opt_e && goog.isNumber(opt_e.clientX))) {
    this.openingCoords = new goog.math.Coordinate(opt_e.clientX, opt_e.clientY);
  } else {
    this.openingCoords = null;
  }
  return visibilityChanged;
};
goog.ui.Menu.prototype.handleEnterItem = function(e) {
  if (this.allowAutoFocus_) {
    this.getKeyEventTarget().focus();
  }
  return goog.ui.Menu.superClass_.handleEnterItem.call(this, e);
};
goog.ui.Menu.prototype.highlightNextPrefix = function(charStr) {
  var re = new RegExp("^" + goog.string.regExpEscape(charStr), "i");
  return this.highlightHelper(function(index, max) {
    var start = index < 0 ? 0 : index;
    var wrapped = false;
    do {
      ++index;
      if (index == max) {
        index = 0;
        wrapped = true;
      }
      var name = this.getChildAt(index).getCaption();
      if (name && name.match(re)) {
        return index;
      }
    } while (!wrapped || index != start);
    return this.getHighlightedIndex();
  }, this.getHighlightedIndex());
};
goog.ui.Menu.prototype.canHighlightItem = function(item) {
  return(this.allowHighlightDisabled_ || item.isEnabled()) && (item.isVisible() && item.isSupportedState(goog.ui.Component.State.HOVER));
};
goog.ui.Menu.prototype.decorateInternal = function(element) {
  this.decorateContent(element);
  goog.ui.Menu.superClass_.decorateInternal.call(this, element);
};
goog.ui.Menu.prototype.handleKeyEventInternal = function(e) {
  var handled = goog.base(this, "handleKeyEventInternal", e);
  if (!handled) {
    this.forEachChild(function(menuItem) {
      if (!handled && (menuItem.getMnemonic && menuItem.getMnemonic() == e.keyCode)) {
        if (this.isEnabled()) {
          this.setHighlighted(menuItem);
        }
        handled = menuItem.handleKeyEvent(e);
      }
    }, this);
  }
  return handled;
};
goog.ui.Menu.prototype.setHighlightedIndex = function(index) {
  goog.base(this, "setHighlightedIndex", index);
  var child = this.getChildAt(index);
  if (child) {
    goog.style.scrollIntoContainerView(child.getElement(), this.getElement());
  }
};
goog.ui.Menu.prototype.decorateContent = function(element) {
  var renderer = this.getRenderer();
  var contentElements = this.getDomHelper().getElementsByTagNameAndClass("div", goog.getCssName(renderer.getCssClass(), "content"), element);
  var length = contentElements.length;
  for (var i = 0;i < length;i++) {
    renderer.decorateChildren(this, contentElements[i]);
  }
};
goog.provide("goog.ui.LabelInput");
goog.require("goog.Timer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventType");
goog.require("goog.ui.Component");
goog.require("goog.userAgent");
goog.ui.LabelInput = function(opt_label, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.label_ = opt_label || "";
};
goog.inherits(goog.ui.LabelInput, goog.ui.Component);
goog.ui.LabelInput.prototype.ffKeyRestoreValue_ = null;
goog.ui.LabelInput.prototype.labelRestoreDelayMs = 10;
goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_ = "placeholder" in document.createElement("input");
goog.ui.LabelInput.prototype.eventHandler_;
goog.ui.LabelInput.prototype.hasFocus_ = false;
goog.ui.LabelInput.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createDom("input", {"type":"text"}));
};
goog.ui.LabelInput.prototype.decorateInternal = function(element) {
  goog.ui.LabelInput.superClass_.decorateInternal.call(this, element);
  if (!this.label_) {
    this.label_ = element.getAttribute("label") || "";
  }
  if (goog.dom.getActiveElement(goog.dom.getOwnerDocument(element)) == element) {
    this.hasFocus_ = true;
    var el = this.getElement();
    goog.asserts.assert(el);
    goog.dom.classlist.remove(el, this.LABEL_CLASS_NAME);
  }
  if (goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    this.getElement().placeholder = this.label_;
    return;
  }
  var labelInputElement = this.getElement();
  goog.asserts.assert(labelInputElement, "The label input element cannot be null.");
  goog.a11y.aria.setState(labelInputElement, goog.a11y.aria.State.LABEL, this.label_);
};
goog.ui.LabelInput.prototype.enterDocument = function() {
  goog.ui.LabelInput.superClass_.enterDocument.call(this);
  this.attachEvents_();
  this.check_();
  this.getElement().labelInput_ = this;
};
goog.ui.LabelInput.prototype.exitDocument = function() {
  goog.ui.LabelInput.superClass_.exitDocument.call(this);
  this.detachEvents_();
  this.getElement().labelInput_ = null;
};
goog.ui.LabelInput.prototype.attachEvents_ = function() {
  var eh = new goog.events.EventHandler(this);
  eh.listen(this.getElement(), goog.events.EventType.FOCUS, this.handleFocus_);
  eh.listen(this.getElement(), goog.events.EventType.BLUR, this.handleBlur_);
  if (goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    this.eventHandler_ = eh;
    return;
  }
  if (goog.userAgent.GECKO) {
    eh.listen(this.getElement(), [goog.events.EventType.KEYPRESS, goog.events.EventType.KEYDOWN, goog.events.EventType.KEYUP], this.handleEscapeKeys_);
  }
  var d = goog.dom.getOwnerDocument(this.getElement());
  var w = goog.dom.getWindow(d);
  eh.listen(w, goog.events.EventType.LOAD, this.handleWindowLoad_);
  this.eventHandler_ = eh;
  this.attachEventsToForm_();
};
goog.ui.LabelInput.prototype.attachEventsToForm_ = function() {
  if (!this.formAttached_ && (this.eventHandler_ && this.getElement().form)) {
    this.eventHandler_.listen(this.getElement().form, goog.events.EventType.SUBMIT, this.handleFormSubmit_);
    this.formAttached_ = true;
  }
};
goog.ui.LabelInput.prototype.detachEvents_ = function() {
  if (this.eventHandler_) {
    this.eventHandler_.dispose();
    this.eventHandler_ = null;
  }
};
goog.ui.LabelInput.prototype.disposeInternal = function() {
  goog.ui.LabelInput.superClass_.disposeInternal.call(this);
  this.detachEvents_();
};
goog.ui.LabelInput.prototype.LABEL_CLASS_NAME = goog.getCssName("label-input-label");
goog.ui.LabelInput.prototype.handleFocus_ = function(e) {
  this.hasFocus_ = true;
  var el = this.getElement();
  goog.asserts.assert(el);
  goog.dom.classlist.remove(el, this.LABEL_CLASS_NAME);
  if (goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    return;
  }
  if (!this.hasChanged() && !this.inFocusAndSelect_) {
    var me = this;
    var clearValue = function() {
      if (me.getElement()) {
        me.getElement().value = "";
      }
    };
    if (goog.userAgent.IE) {
      goog.Timer.callOnce(clearValue, 10);
    } else {
      clearValue();
    }
  }
};
goog.ui.LabelInput.prototype.handleBlur_ = function(e) {
  if (!goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    this.eventHandler_.unlisten(this.getElement(), goog.events.EventType.CLICK, this.handleFocus_);
    this.ffKeyRestoreValue_ = null;
  }
  this.hasFocus_ = false;
  this.check_();
};
goog.ui.LabelInput.prototype.handleEscapeKeys_ = function(e) {
  if (e.keyCode == 27) {
    if (e.type == goog.events.EventType.KEYDOWN) {
      this.ffKeyRestoreValue_ = this.getElement().value;
    } else {
      if (e.type == goog.events.EventType.KEYPRESS) {
        this.getElement().value = (this.ffKeyRestoreValue_);
      } else {
        if (e.type == goog.events.EventType.KEYUP) {
          this.ffKeyRestoreValue_ = null;
        }
      }
    }
    e.preventDefault();
  }
};
goog.ui.LabelInput.prototype.handleFormSubmit_ = function(e) {
  if (!this.hasChanged()) {
    this.getElement().value = "";
    goog.Timer.callOnce(this.handleAfterSubmit_, 10, this);
  }
};
goog.ui.LabelInput.prototype.handleAfterSubmit_ = function() {
  if (!this.hasChanged()) {
    this.getElement().value = this.label_;
  }
};
goog.ui.LabelInput.prototype.handleWindowLoad_ = function(e) {
  this.check_();
};
goog.ui.LabelInput.prototype.hasFocus = function() {
  return this.hasFocus_;
};
goog.ui.LabelInput.prototype.hasChanged = function() {
  return!!this.getElement() && (this.getElement().value != "" && this.getElement().value != this.label_);
};
goog.ui.LabelInput.prototype.clear = function() {
  this.getElement().value = "";
  if (this.ffKeyRestoreValue_ != null) {
    this.ffKeyRestoreValue_ = "";
  }
};
goog.ui.LabelInput.prototype.reset = function() {
  if (this.hasChanged()) {
    this.clear();
    this.check_();
  }
};
goog.ui.LabelInput.prototype.setValue = function(s) {
  if (this.ffKeyRestoreValue_ != null) {
    this.ffKeyRestoreValue_ = s;
  }
  this.getElement().value = s;
  this.check_();
};
goog.ui.LabelInput.prototype.getValue = function() {
  if (this.ffKeyRestoreValue_ != null) {
    return this.ffKeyRestoreValue_;
  }
  return this.hasChanged() ? (this.getElement().value) : "";
};
goog.ui.LabelInput.prototype.setLabel = function(label) {
  if (goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    this.label_ = label;
    if (this.getElement()) {
      this.getElement().placeholder = this.label_;
    }
    return;
  }
  if (this.getElement() && !this.hasChanged()) {
    this.getElement().value = "";
  }
  this.label_ = label;
  this.restoreLabel_();
  var labelInputElement = this.getElement();
  if (labelInputElement) {
    goog.a11y.aria.setState(labelInputElement, goog.a11y.aria.State.LABEL, this.label_);
  }
};
goog.ui.LabelInput.prototype.getLabel = function() {
  return this.label_;
};
goog.ui.LabelInput.prototype.check_ = function() {
  var labelInputElement = this.getElement();
  goog.asserts.assert(labelInputElement, "The label input element cannot be null.");
  if (!goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    this.attachEventsToForm_();
    goog.a11y.aria.setState(labelInputElement, goog.a11y.aria.State.LABEL, this.label_);
  } else {
    if (this.getElement().placeholder != this.label_) {
      this.getElement().placeholder = this.label_;
    }
  }
  if (!this.hasChanged()) {
    if (!this.inFocusAndSelect_ && !this.hasFocus_) {
      var el = this.getElement();
      goog.asserts.assert(el);
      goog.dom.classlist.add(el, this.LABEL_CLASS_NAME);
    }
    if (!goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
      goog.Timer.callOnce(this.restoreLabel_, this.labelRestoreDelayMs, this);
    }
  } else {
    var el = this.getElement();
    goog.asserts.assert(el);
    goog.dom.classlist.remove(el, this.LABEL_CLASS_NAME);
  }
};
goog.ui.LabelInput.prototype.focusAndSelect = function() {
  var hc = this.hasChanged();
  this.inFocusAndSelect_ = true;
  this.getElement().focus();
  if (!hc && !goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    this.getElement().value = this.label_;
  }
  this.getElement().select();
  if (goog.ui.LabelInput.SUPPORTS_PLACEHOLDER_) {
    return;
  }
  if (this.eventHandler_) {
    this.eventHandler_.listenOnce(this.getElement(), goog.events.EventType.CLICK, this.handleFocus_);
  }
  goog.Timer.callOnce(this.focusAndSelect_, 10, this);
};
goog.ui.LabelInput.prototype.setEnabled = function(enabled) {
  this.getElement().disabled = !enabled;
  var el = this.getElement();
  goog.asserts.assert(el);
  goog.dom.classlist.enable(el, goog.getCssName(this.LABEL_CLASS_NAME, "disabled"), !enabled);
};
goog.ui.LabelInput.prototype.isEnabled = function() {
  return!this.getElement().disabled;
};
goog.ui.LabelInput.prototype.focusAndSelect_ = function() {
  this.inFocusAndSelect_ = false;
};
goog.ui.LabelInput.prototype.restoreLabel_ = function() {
  if (this.getElement() && (!this.hasChanged() && !this.hasFocus_)) {
    this.getElement().value = this.label_;
  }
};
goog.provide("goog.events.InputHandler");
goog.provide("goog.events.InputHandler.EventType");
goog.require("goog.Timer");
goog.require("goog.dom");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.events.KeyCodes");
goog.require("goog.userAgent");
goog.events.InputHandler = function(element) {
  goog.base(this);
  this.element_ = element;
  var emulateInputEvents = goog.userAgent.IE || goog.userAgent.WEBKIT && (!goog.userAgent.isVersionOrHigher("531") && element.tagName == "TEXTAREA");
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.eventHandler_.listen(this.element_, emulateInputEvents ? ["keydown", "paste", "cut", "drop", "input"] : "input", this);
};
goog.inherits(goog.events.InputHandler, goog.events.EventTarget);
goog.events.InputHandler.EventType = {INPUT:"input"};
goog.events.InputHandler.prototype.timer_ = null;
goog.events.InputHandler.prototype.handleEvent = function(e) {
  if (e.type == "input") {
    if (goog.userAgent.IE && (goog.userAgent.isVersionOrHigher(10) && (e.keyCode == 0 && e.charCode == 0))) {
      return;
    }
    this.cancelTimerIfSet_();
    if (!goog.userAgent.OPERA || this.element_ == goog.dom.getOwnerDocument(this.element_).activeElement) {
      this.dispatchEvent(this.createInputEvent_(e));
    }
  } else {
    if (e.type == "keydown" && !goog.events.KeyCodes.isTextModifyingKeyEvent(e)) {
      return;
    }
    var valueBeforeKey = e.type == "keydown" ? this.element_.value : null;
    if (goog.userAgent.IE && e.keyCode == goog.events.KeyCodes.WIN_IME) {
      valueBeforeKey = null;
    }
    var inputEvent = this.createInputEvent_(e);
    this.cancelTimerIfSet_();
    this.timer_ = goog.Timer.callOnce(function() {
      this.timer_ = null;
      if (this.element_.value != valueBeforeKey) {
        this.dispatchEvent(inputEvent);
      }
    }, 0, this);
  }
};
goog.events.InputHandler.prototype.cancelTimerIfSet_ = function() {
  if (this.timer_ != null) {
    goog.Timer.clear(this.timer_);
    this.timer_ = null;
  }
};
goog.events.InputHandler.prototype.createInputEvent_ = function(be) {
  var e = new goog.events.BrowserEvent(be.getBrowserEvent());
  e.type = goog.events.InputHandler.EventType.INPUT;
  return e;
};
goog.events.InputHandler.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  this.eventHandler_.dispose();
  this.cancelTimerIfSet_();
  delete this.element_;
};
goog.provide("goog.ui.ComboBox");
goog.provide("goog.ui.ComboBoxItem");
goog.require("goog.Timer");
goog.require("goog.dom");
goog.require("goog.dom.classlist");
goog.require("goog.events.EventType");
goog.require("goog.events.InputHandler");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.log");
goog.require("goog.positioning.Corner");
goog.require("goog.positioning.MenuAnchoredPosition");
goog.require("goog.string");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.ui.ItemEvent");
goog.require("goog.ui.LabelInput");
goog.require("goog.ui.Menu");
goog.require("goog.ui.MenuItem");
goog.require("goog.ui.MenuSeparator");
goog.require("goog.ui.registry");
goog.require("goog.userAgent");
goog.ui.ComboBox = function(opt_domHelper, opt_menu) {
  goog.ui.Component.call(this, opt_domHelper);
  this.labelInput_ = new goog.ui.LabelInput;
  this.enabled_ = true;
  this.menu_ = opt_menu || new goog.ui.Menu(this.getDomHelper());
  this.setupMenu_();
};
goog.inherits(goog.ui.ComboBox, goog.ui.Component);
goog.ui.ComboBox.BLUR_DISMISS_TIMER_MS = 250;
goog.ui.ComboBox.prototype.logger_ = goog.log.getLogger("goog.ui.ComboBox");
goog.ui.ComboBox.prototype.enabled_;
goog.ui.ComboBox.prototype.keyHandler_;
goog.ui.ComboBox.prototype.inputHandler_ = null;
goog.ui.ComboBox.prototype.lastToken_ = null;
goog.ui.ComboBox.prototype.labelInput_ = null;
goog.ui.ComboBox.prototype.menu_ = null;
goog.ui.ComboBox.prototype.visibleCount_ = -1;
goog.ui.ComboBox.prototype.input_ = null;
goog.ui.ComboBox.prototype.matchFunction_ = goog.string.startsWith;
goog.ui.ComboBox.prototype.button_ = null;
goog.ui.ComboBox.prototype.defaultText_ = "";
goog.ui.ComboBox.prototype.fieldName_ = "";
goog.ui.ComboBox.prototype.dismissTimer_ = null;
goog.ui.ComboBox.prototype.useDropdownArrow_ = false;
goog.ui.ComboBox.prototype.createDom = function() {
  this.input_ = this.getDomHelper().createDom("input", {name:this.fieldName_, type:"text", autocomplete:"off"});
  this.button_ = this.getDomHelper().createDom("span", goog.getCssName("goog-combobox-button"));
  this.setElementInternal(this.getDomHelper().createDom("span", goog.getCssName("goog-combobox"), this.input_, this.button_));
  if (this.useDropdownArrow_) {
    this.button_.innerHTML = "&#x25BC;";
    goog.style.setUnselectable(this.button_, true);
  }
  this.input_.setAttribute("label", this.defaultText_);
  this.labelInput_.decorate(this.input_);
  this.menu_.setFocusable(false);
  if (!this.menu_.isInDocument()) {
    this.addChild(this.menu_, true);
  }
};
goog.ui.ComboBox.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
  this.labelInput_.setEnabled(enabled);
  goog.dom.classlist.enable(this.getElement(), goog.getCssName("goog-combobox-disabled"), !enabled);
};
goog.ui.ComboBox.prototype.enterDocument = function() {
  goog.ui.ComboBox.superClass_.enterDocument.call(this);
  var handler = this.getHandler();
  handler.listen(this.getElement(), goog.events.EventType.MOUSEDOWN, this.onComboMouseDown_);
  handler.listen(this.getDomHelper().getDocument(), goog.events.EventType.MOUSEDOWN, this.onDocClicked_);
  handler.listen(this.input_, goog.events.EventType.BLUR, this.onInputBlur_);
  this.keyHandler_ = new goog.events.KeyHandler(this.input_);
  handler.listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent);
  this.inputHandler_ = new goog.events.InputHandler(this.input_);
  handler.listen(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.onInputEvent_);
  handler.listen(this.menu_, goog.ui.Component.EventType.ACTION, this.onMenuSelected_);
};
goog.ui.ComboBox.prototype.exitDocument = function() {
  this.keyHandler_.dispose();
  delete this.keyHandler_;
  this.inputHandler_.dispose();
  this.inputHandler_ = null;
  goog.ui.ComboBox.superClass_.exitDocument.call(this);
};
goog.ui.ComboBox.prototype.canDecorate = function() {
  return false;
};
goog.ui.ComboBox.prototype.disposeInternal = function() {
  goog.ui.ComboBox.superClass_.disposeInternal.call(this);
  this.clearDismissTimer_();
  this.labelInput_.dispose();
  this.menu_.dispose();
  this.labelInput_ = null;
  this.menu_ = null;
  this.input_ = null;
  this.button_ = null;
};
goog.ui.ComboBox.prototype.dismiss = function() {
  this.clearDismissTimer_();
  this.hideMenu_();
  this.menu_.setHighlightedIndex(-1);
};
goog.ui.ComboBox.prototype.addItem = function(item) {
  this.menu_.addChild(item, true);
  this.visibleCount_ = -1;
};
goog.ui.ComboBox.prototype.addItemAt = function(item, n) {
  this.menu_.addChildAt(item, n, true);
  this.visibleCount_ = -1;
};
goog.ui.ComboBox.prototype.removeItem = function(item) {
  var child = this.menu_.removeChild(item, true);
  if (child) {
    child.dispose();
    this.visibleCount_ = -1;
  }
};
goog.ui.ComboBox.prototype.removeAllItems = function() {
  for (var i = this.getItemCount() - 1;i >= 0;--i) {
    this.removeItem(this.getItemAt(i));
  }
};
goog.ui.ComboBox.prototype.removeItemAt = function(n) {
  var child = this.menu_.removeChildAt(n, true);
  if (child) {
    child.dispose();
    this.visibleCount_ = -1;
  }
};
goog.ui.ComboBox.prototype.getItemAt = function(n) {
  return(this.menu_.getChildAt(n));
};
goog.ui.ComboBox.prototype.getItemCount = function() {
  return this.menu_.getChildCount();
};
goog.ui.ComboBox.prototype.getMenu = function() {
  return this.menu_;
};
goog.ui.ComboBox.prototype.getInputElement = function() {
  return this.input_;
};
goog.ui.ComboBox.prototype.getLabelInput = function() {
  return this.labelInput_;
};
goog.ui.ComboBox.prototype.getNumberOfVisibleItems_ = function() {
  if (this.visibleCount_ == -1) {
    var count = 0;
    for (var i = 0, n = this.menu_.getChildCount();i < n;i++) {
      var item = this.menu_.getChildAt(i);
      if (!(item instanceof goog.ui.MenuSeparator) && item.isVisible()) {
        count++;
      }
    }
    this.visibleCount_ = count;
  }
  goog.log.info(this.logger_, "getNumberOfVisibleItems() - " + this.visibleCount_);
  return this.visibleCount_;
};
goog.ui.ComboBox.prototype.setMatchFunction = function(matchFunction) {
  this.matchFunction_ = matchFunction;
};
goog.ui.ComboBox.prototype.getMatchFunction = function() {
  return this.matchFunction_;
};
goog.ui.ComboBox.prototype.setDefaultText = function(text) {
  this.defaultText_ = text;
  if (this.labelInput_) {
    this.labelInput_.setLabel(this.defaultText_);
  }
};
goog.ui.ComboBox.prototype.getDefaultText = function() {
  return this.defaultText_;
};
goog.ui.ComboBox.prototype.setFieldName = function(fieldName) {
  this.fieldName_ = fieldName;
};
goog.ui.ComboBox.prototype.getFieldName = function() {
  return this.fieldName_;
};
goog.ui.ComboBox.prototype.setUseDropdownArrow = function(useDropdownArrow) {
  this.useDropdownArrow_ = !!useDropdownArrow;
};
goog.ui.ComboBox.prototype.setValue = function(value) {
  goog.log.info(this.logger_, "setValue() - " + value);
  if (this.labelInput_.getValue() != value) {
    this.labelInput_.setValue(value);
    this.handleInputChange_();
  }
};
goog.ui.ComboBox.prototype.getValue = function() {
  return this.labelInput_.getValue();
};
goog.ui.ComboBox.prototype.getToken = function() {
  return goog.string.htmlEscape(this.getTokenText_());
};
goog.ui.ComboBox.prototype.getTokenText_ = function() {
  return goog.string.trim(this.labelInput_.getValue().toLowerCase());
};
goog.ui.ComboBox.prototype.setupMenu_ = function() {
  var sm = this.menu_;
  sm.setVisible(false);
  sm.setAllowAutoFocus(false);
  sm.setAllowHighlightDisabled(true);
};
goog.ui.ComboBox.prototype.maybeShowMenu_ = function(showAll) {
  var isVisible = this.menu_.isVisible();
  var numVisibleItems = this.getNumberOfVisibleItems_();
  if (isVisible && numVisibleItems == 0) {
    goog.log.fine(this.logger_, "no matching items, hiding");
    this.hideMenu_();
  } else {
    if (!isVisible && numVisibleItems > 0) {
      if (showAll) {
        goog.log.fine(this.logger_, "showing menu");
        this.setItemVisibilityFromToken_("");
        this.setItemHighlightFromToken_(this.getTokenText_());
      }
      goog.Timer.callOnce(this.clearDismissTimer_, 1, this);
      this.showMenu_();
    }
  }
  this.positionMenu();
};
goog.ui.ComboBox.prototype.positionMenu = function() {
  if (this.menu_ && this.menu_.isVisible()) {
    var position = new goog.positioning.MenuAnchoredPosition(this.getElement(), goog.positioning.Corner.BOTTOM_START, true);
    position.reposition(this.menu_.getElement(), goog.positioning.Corner.TOP_START);
  }
};
goog.ui.ComboBox.prototype.showMenu_ = function() {
  this.menu_.setVisible(true);
  goog.dom.classlist.add(this.getElement(), goog.getCssName("goog-combobox-active"));
};
goog.ui.ComboBox.prototype.hideMenu_ = function() {
  this.menu_.setVisible(false);
  goog.dom.classlist.remove(this.getElement(), goog.getCssName("goog-combobox-active"));
};
goog.ui.ComboBox.prototype.clearDismissTimer_ = function() {
  if (this.dismissTimer_) {
    goog.Timer.clear(this.dismissTimer_);
    this.dismissTimer_ = null;
  }
};
goog.ui.ComboBox.prototype.onComboMouseDown_ = function(e) {
  if (this.enabled_ && (e.target == this.getElement() || (e.target == this.input_ || goog.dom.contains(this.button_, (e.target))))) {
    if (this.menu_.isVisible()) {
      goog.log.fine(this.logger_, "Menu is visible, dismissing");
      this.dismiss();
    } else {
      goog.log.fine(this.logger_, "Opening dropdown");
      this.maybeShowMenu_(true);
      if (goog.userAgent.OPERA) {
        this.input_.focus();
      }
      this.input_.select();
      this.menu_.setMouseButtonPressed(true);
      e.preventDefault();
    }
  }
  e.stopPropagation();
};
goog.ui.ComboBox.prototype.onDocClicked_ = function(e) {
  if (!goog.dom.contains(this.menu_.getElement(), (e.target))) {
    goog.log.info(this.logger_, "onDocClicked_() - dismissing immediately");
    this.dismiss();
  }
};
goog.ui.ComboBox.prototype.onMenuSelected_ = function(e) {
  goog.log.info(this.logger_, "onMenuSelected_()");
  var item = (e.target);
  if (this.dispatchEvent(new goog.ui.ItemEvent(goog.ui.Component.EventType.ACTION, this, item))) {
    var caption = item.getCaption();
    goog.log.fine(this.logger_, "Menu selection: " + caption + ". Dismissing menu");
    if (this.labelInput_.getValue() != caption) {
      this.labelInput_.setValue(caption);
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
    }
    this.dismiss();
  }
  e.stopPropagation();
};
goog.ui.ComboBox.prototype.onInputBlur_ = function(e) {
  goog.log.info(this.logger_, "onInputBlur_() - delayed dismiss");
  this.clearDismissTimer_();
  this.dismissTimer_ = goog.Timer.callOnce(this.dismiss, goog.ui.ComboBox.BLUR_DISMISS_TIMER_MS, this);
};
goog.ui.ComboBox.prototype.handleKeyEvent = function(e) {
  var isMenuVisible = this.menu_.isVisible();
  if (isMenuVisible && this.menu_.handleKeyEvent(e)) {
    return true;
  }
  var handled = false;
  switch(e.keyCode) {
    case goog.events.KeyCodes.ESC:
      if (isMenuVisible) {
        goog.log.fine(this.logger_, "Dismiss on Esc: " + this.labelInput_.getValue());
        this.dismiss();
        handled = true;
      }
      break;
    case goog.events.KeyCodes.TAB:
      if (isMenuVisible) {
        var highlighted = this.menu_.getHighlighted();
        if (highlighted) {
          goog.log.fine(this.logger_, "Select on Tab: " + this.labelInput_.getValue());
          highlighted.performActionInternal(e);
          handled = true;
        }
      }
      break;
    case goog.events.KeyCodes.UP:
    ;
    case goog.events.KeyCodes.DOWN:
      if (!isMenuVisible) {
        goog.log.fine(this.logger_, "Up/Down - maybe show menu");
        this.maybeShowMenu_(true);
        handled = true;
      }
      break;
  }
  if (handled) {
    e.preventDefault();
  }
  return handled;
};
goog.ui.ComboBox.prototype.onInputEvent_ = function(e) {
  goog.log.fine(this.logger_, "Key is modifying: " + this.labelInput_.getValue());
  this.handleInputChange_();
};
goog.ui.ComboBox.prototype.handleInputChange_ = function() {
  var token = this.getTokenText_();
  this.setItemVisibilityFromToken_(token);
  if (goog.dom.getActiveElement(this.getDomHelper().getDocument()) == this.input_) {
    this.maybeShowMenu_(false);
  }
  var highlighted = this.menu_.getHighlighted();
  if (token == "" || (!highlighted || !highlighted.isVisible())) {
    this.setItemHighlightFromToken_(token);
  }
  this.lastToken_ = token;
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};
goog.ui.ComboBox.prototype.setItemVisibilityFromToken_ = function(token) {
  goog.log.info(this.logger_, "setItemVisibilityFromToken_() - " + token);
  var isVisibleItem = false;
  var count = 0;
  var recheckHidden = !this.matchFunction_(token, this.lastToken_);
  for (var i = 0, n = this.menu_.getChildCount();i < n;i++) {
    var item = this.menu_.getChildAt(i);
    if (item instanceof goog.ui.MenuSeparator) {
      item.setVisible(isVisibleItem);
      isVisibleItem = false;
    } else {
      if (item instanceof goog.ui.MenuItem) {
        if (!item.isVisible() && !recheckHidden) {
          continue;
        }
        var caption = item.getCaption();
        var visible = this.isItemSticky_(item) || caption && this.matchFunction_(caption.toLowerCase(), token);
        if (typeof item.setFormatFromToken == "function") {
          item.setFormatFromToken(token);
        }
        item.setVisible(!!visible);
        isVisibleItem = visible || isVisibleItem;
      } else {
        isVisibleItem = item.isVisible() || isVisibleItem;
      }
    }
    if (!(item instanceof goog.ui.MenuSeparator) && item.isVisible()) {
      count++;
    }
  }
  this.visibleCount_ = count;
};
goog.ui.ComboBox.prototype.setItemHighlightFromToken_ = function(token) {
  goog.log.info(this.logger_, "setItemHighlightFromToken_() - " + token);
  if (token == "") {
    this.menu_.setHighlightedIndex(-1);
    return;
  }
  for (var i = 0, n = this.menu_.getChildCount();i < n;i++) {
    var item = this.menu_.getChildAt(i);
    var caption = item.getCaption();
    if (caption && this.matchFunction_(caption.toLowerCase(), token)) {
      this.menu_.setHighlightedIndex(i);
      if (item.setFormatFromToken) {
        item.setFormatFromToken(token);
      }
      return;
    }
  }
  this.menu_.setHighlightedIndex(-1);
};
goog.ui.ComboBox.prototype.isItemSticky_ = function(item) {
  return typeof item.isSticky == "function" && item.isSticky();
};
goog.ui.ComboBoxItem = function(content, opt_data, opt_domHelper, opt_renderer) {
  goog.ui.MenuItem.call(this, content, opt_data, opt_domHelper, opt_renderer);
};
goog.inherits(goog.ui.ComboBoxItem, goog.ui.MenuItem);
goog.ui.registry.setDecoratorByClassName(goog.getCssName("goog-combobox-item"), function() {
  return new goog.ui.ComboBoxItem(null);
});
goog.ui.ComboBoxItem.prototype.isSticky_ = false;
goog.ui.ComboBoxItem.prototype.setSticky = function(sticky) {
  this.isSticky_ = sticky;
};
goog.ui.ComboBoxItem.prototype.isSticky = function() {
  return this.isSticky_;
};
goog.ui.ComboBoxItem.prototype.setFormatFromToken = function(token) {
  if (this.isEnabled()) {
    var caption = this.getCaption();
    var index = caption.toLowerCase().indexOf(token);
    if (index >= 0) {
      var domHelper = this.getDomHelper();
      this.setContent([domHelper.createTextNode(caption.substr(0, index)), domHelper.createDom("b", null, caption.substr(index, token.length)), domHelper.createTextNode(caption.substr(index + token.length))]);
    }
  }
};
goog.provide("pear.plugin.FooterStatus");
goog.provide("pear.plugin.FooterStatusRenderer");
goog.require("goog.ui.Component");
goog.require("goog.events.Event");
goog.require("goog.ui.ComboBox");
goog.require("pear.ui.Plugable");
pear.plugin.FooterStatus = function(grid, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_renderer || pear.ui.RowRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.plugin.FooterStatus, goog.ui.Component);
pear.ui.Plugable.addImplementation(pear.plugin.FooterStatus);
pear.plugin.FooterStatus.prototype.getGrid = function() {
  return this.grid_;
};
pear.plugin.FooterStatus.prototype.show = function(grid) {
  this.grid_ = grid;
  var parentElem = grid.getElement();
  var footer = goog.dom.getNextElementSibling(grid.getElement());
  if (footer && goog.dom.classes.has(footer, "pear-grid-footer")) {
  } else {
    footer = goog.dom.createDom("div", "pear-grid-footer");
    goog.dom.insertSiblingAfter(footer, parentElem);
  }
  this.render(footer);
};
pear.plugin.FooterStatus.prototype.createDom = function() {
  this.element_ = goog.dom.createDom("div", "pear-grid-footer-status");
};
pear.plugin.FooterStatus.prototype.disposeInternal = function() {
  this.grid_ = null;
  this.footerStatus_.dispose();
  pear.plugin.FooterStatus.superClass_.disposeInternal.call(this);
};
pear.plugin.FooterStatus.prototype.enterDocument = function() {
  pear.plugin.FooterStatus.superClass_.enterDocument.call(this);
  this.footerStatus_ = new goog.ui.Control(goog.dom.createDom("div"), pear.plugin.FooterStatusRenderer.getInstance());
  this.footerStatus_.render(this.getElement());
  this.updateMsg_();
  goog.events.listen(this.grid_, pear.ui.Grid.EventType.AFTER_PAGING, this.updateMsg_, false, this);
};
pear.plugin.FooterStatus.prototype.updateMsg_ = function() {
  var grid = this.grid_;
  var startIndex = 1;
  var rowCount = grid.getRowCount();
  var endIndex = grid.getDataView().getRowViews().length;
  var configuration = grid.getConfiguration();
  var currentPageIndex = grid.getCurrentPageIndex();
  if (configuration.AllowPaging) {
    startIndex = (currentPageIndex - 1) * configuration.PageSize;
    endIndex = currentPageIndex * configuration.PageSize > rowCount ? rowCount : currentPageIndex * configuration.PageSize;
  }
  startIndex = startIndex ? startIndex : 1;
  this.footerStatus_.setContent("[" + startIndex + " - " + endIndex + "]");
};
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlRenderer");
pear.plugin.FooterStatusRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.plugin.FooterStatusRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.plugin.FooterStatusRenderer);
pear.plugin.FooterStatusRenderer.CSS_CLASS = goog.getCssName("pear-grid-footer-status");
pear.plugin.FooterStatusRenderer.prototype.getCssClass = function() {
  return pear.plugin.FooterStatusRenderer.CSS_CLASS;
};
pear.plugin.FooterStatusRenderer.prototype.createDom = function(control) {
  var element = control.getDomHelper().createDom("div", this.getClassNames(control).join(" "), control.getContent());
  this.setAriaStates(control, element);
  return element;
};
goog.provide("pear.plugin.Pager");
goog.require("goog.ui.Component");
goog.require("goog.events.Event");
goog.require("goog.ui.ComboBox");
goog.require("pear.ui.Plugable");
pear.plugin.Pager = function(grid, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_renderer || pear.ui.RowRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.plugin.Pager, goog.ui.Component);
pear.ui.Plugable.addImplementation(pear.plugin.Pager);
pear.plugin.Pager.prototype.getPageIndex = function() {
  return this.getGrid().getPageIndex();
};
pear.plugin.Pager.prototype.getGrid = function() {
  return this.grid_;
};
pear.plugin.Pager.prototype.show = function(grid) {
  this.grid_ = grid;
  var parentElem = grid.getElement();
  if (this.grid_.getConfiguration().AllowPaging) {
    var footer = goog.dom.getNextElementSibling(grid.getElement());
    if (footer && goog.dom.classes.has(footer, "pear-grid-footer")) {
    } else {
      footer = goog.dom.createDom("div", "pear-grid-footer");
      goog.dom.insertSiblingAfter(footer, parentElem);
    }
    this.render(footer);
  }
};
pear.plugin.Pager.prototype.createDom = function() {
  this.element_ = goog.dom.createDom("div", "pear-grid-pager");
};
pear.plugin.Pager.prototype.disposeInternal = function() {
  if (this.grid_.getConfiguration().AllowPaging) {
    this.pagerComboBox_.dispose();
    this.pagerComboBox_ = null;
  }
  this.grid_ = null;
  pear.plugin.Pager.superClass_.disposeInternal.call(this);
};
pear.plugin.Pager.prototype.enterDocument = function() {
  pear.plugin.Pager.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  this.createPager_();
};
pear.plugin.Pager.prototype.createPager_ = function() {
  this.createPagerNavControls_();
  this.createPagerDropDown_();
};
pear.plugin.Pager.prototype.createPagerDropDown_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();
  this.pagerComboBox_ = new goog.ui.ComboBox;
  this.pagerComboBox_.setUseDropdownArrow(true);
  this.pagerComboBox_.setDefaultText("Page");
  var caption = new goog.ui.ComboBoxItem("Page");
  caption.setSticky(true);
  caption.setEnabled(false);
  this.pagerComboBox_.addItem(caption);
  var i = 0;
  do {
    this.pagerComboBox_.addItem(new goog.ui.ComboBoxItem(goog.string.buildString(i + 1)));
    i++;
  } while (i * rowsPerPage < totalRows);
  this.pagerComboBox_.render(this.getElement());
  goog.style.setWidth(this.pagerComboBox_.getInputElement(), 30);
  goog.style.setHeight(this.pagerComboBox_.getMenu().getElement(), 150);
  this.pagerComboBox_.getMenu().getElement().style.overflowY = "auto";
  this.getHandler().listen(this.pagerComboBox_, goog.ui.Component.EventType.CHANGE, this.handleChange_, false, this);
};
pear.plugin.Pager.prototype.createPagerNavControls_ = function() {
  var elem = this.getElement();
  var grid = this.getGrid();
  var rowsPerPage = grid.getConfiguration().PageSize;
  var totalRows = grid.getRowCount();
  var prev = new goog.ui.Control(goog.dom.createDom("span", "fa fa-chevron-left"), pear.plugin.PagerCellRenderer.getInstance());
  prev.render(elem);
  var next = new goog.ui.Control(goog.dom.createDom("span", "fa fa-chevron-right"), pear.plugin.PagerCellRenderer.getInstance());
  next.render(elem);
  this.navControl_ = [prev, next];
  goog.array.forEach(this.navControl_, function(value) {
    value.setHandleMouseEvents(true);
    this.getHandler().listen(value, goog.ui.Component.EventType.ACTION, this.handleAction_, false, this);
  }, this);
};
pear.plugin.Pager.prototype.handleAction_ = function(ge) {
  var pageIndex = this.getPageIndex();
  if (ge.target === this.navControl_[0]) {
    pageIndex--;
    this.changePageIndex_(pageIndex);
  } else {
    if (ge.target === this.navControl_[1]) {
      pageIndex++;
      this.changePageIndex_(pageIndex);
    }
  }
  ge.stopPropagation();
};
pear.plugin.Pager.prototype.changePageIndex_ = function(index) {
  this.pagerComboBox_.setValue(index);
};
pear.plugin.Pager.prototype.handleChange_ = function(ge) {
  var grid = this.getGrid();
  grid.setPageIndex(parseInt(this.pagerComboBox_.getValue()));
};
goog.provide("pear.plugin.PagerCellRenderer");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlRenderer");
pear.plugin.PagerCellRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(pear.plugin.PagerCellRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(pear.plugin.PagerCellRenderer);
pear.plugin.PagerCellRenderer.CSS_CLASS = goog.getCssName("pear-grid-pager-cell");
pear.plugin.PagerCellRenderer.prototype.getCssClass = function() {
  return pear.plugin.PagerCellRenderer.CSS_CLASS;
};
pear.plugin.PagerCellRenderer.prototype.createDom = function(cellControl) {
  var element = cellControl.getDomHelper().createDom("div", this.getClassNames(cellControl).join(" "), cellControl.getContent());
  this.setAriaStates(cellControl, element);
  return element;
};
goog.provide("pear.ui.Body");
goog.require("goog.ui.Component");
pear.ui.Body = function(opt_domHelper, opt_renderer) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
};
goog.inherits(pear.ui.Body, goog.ui.Component);
pear.ui.Body.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();
  goog.dom.classes.set(elem, "pear-grid-body");
};
goog.provide("pear.ui.RowRenderer");
goog.require("goog.ui.ContainerRenderer");
pear.ui.RowRenderer = function() {
  goog.ui.ContainerRenderer.call(this);
};
goog.inherits(pear.ui.RowRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(pear.ui.RowRenderer);
pear.ui.RowRenderer.CSS_CLASS = goog.getCssName("pear-grid-row");
pear.ui.RowRenderer.prototype.getCssClass = function() {
  return pear.ui.RowRenderer.CSS_CLASS;
};
pear.ui.RowRenderer.prototype.getDefaultOrientation = function() {
  return goog.ui.Container.Orientation.HORIZONTAL;
};
goog.provide("pear.ui.FooterRowRenderer");
goog.require("pear.ui.RowRenderer");
pear.ui.FooterRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.FooterRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.FooterRowRenderer);
pear.ui.FooterRowRenderer.CSS_CLASS = goog.getCssName("pear-grid-row-footer");
pear.ui.FooterRowRenderer.prototype.getCssClass = function() {
  return pear.ui.FooterRowRenderer.CSS_CLASS;
};
goog.provide("pear.ui.Row");
goog.require("goog.ui.Container");
goog.require("pear.data.RowView");
goog.require("pear.ui.RowRenderer");
pear.ui.Row = function(grid, height, opt_orientation, opt_renderer, opt_domHelper) {
  goog.ui.Container.call(this, goog.ui.Container.Orientation.HORIZONTAL, opt_renderer || pear.ui.RowRenderer.getInstance(), opt_domHelper);
  this.setFocusable(false);
  this.grid_ = grid;
  this.height_ = height || 25;
};
goog.inherits(pear.ui.Row, goog.ui.Container);
pear.ui.Row.prototype.grid_ = null;
pear.ui.Row.prototype.height_ = 25;
pear.ui.Row.prototype.rowPosition_ = -1;
pear.ui.Row.prototype.disposeInternal = function() {
  this.grid_ = null;
  pear.ui.Row.superClass_.disposeInternal.call(this);
};
pear.ui.Row.prototype.enterDocument = function() {
  pear.ui.Row.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  this.setPosition_();
};
pear.ui.Row.prototype.handleScroll_ = function(be) {
  var cell = this.getChild(be.target.id);
  console.dir(cell);
  be.stopPropagation();
  be.preventDefault();
};
pear.ui.Row.prototype.handleClickEvent_ = function(be) {
  var cell = this.getChild(be.target.id);
  console.dir(cell);
  if (cell) {
    cell.setSelected(true);
  }
};
pear.ui.Row.prototype.setRowView = function(model) {
  pear.ui.Row.superClass_.setModel.call(this, model);
  model.setRowContainer(this);
};
pear.ui.Row.prototype.getRowView = function() {
  return this.getModel();
};
pear.ui.Row.prototype.addCell = function(cell, opt_render) {
  this.addChild(cell, opt_render);
};
pear.ui.Row.prototype.getGrid = function() {
  return this.grid_;
};
pear.ui.Row.prototype.setHeight = function(height) {
  this.height_ = height;
};
pear.ui.Row.prototype.getWidth = function() {
  var width = 0;
  this.forEachChild(function(child) {
    width = width + child.getCellWidth();
  });
  return width;
};
pear.ui.Row.prototype.getHeight = function() {
  return this.height_;
};
pear.ui.Row.prototype.getComputedHeight = function() {
  return this.getHeight();
};
pear.ui.Row.prototype.setRowPosition = function(pos) {
  this.rowPosition_ = pos;
};
pear.ui.Row.prototype.getRowPosition = function() {
  return this.rowPosition_;
};
pear.ui.Row.prototype.getLocationTop = function() {
  return 0;
};
pear.ui.Row.prototype.getCellWidth = function(index) {
  var child = this.getChildAt(index);
  return child.getCellWidth();
};
pear.ui.Row.prototype.setPosition_ = function() {
  var left, top;
  left = 0;
  top = 0;
  left = 0;
  top = this.getLocationTop();
  goog.style.setPosition(this.getElement(), left, top);
};
goog.provide("pear.ui.FooterRow");
goog.require("pear.ui.FooterRowRenderer");
goog.require("pear.ui.Row");
pear.ui.FooterRow = function(grid, height, opt_orientation, opt_renderer, opt_domHelper) {
  pear.ui.Row.call(this, grid, height, goog.ui.Container.Orientation.HORIZONTAL, pear.ui.FooterRowRenderer.getInstance(), opt_domHelper);
  this.setFocusable(false);
};
goog.inherits(pear.ui.FooterRow, pear.ui.Row);
pear.ui.FooterRow.prototype.pager_ = null;
pear.ui.FooterRow.prototype.getPager = function() {
  return this.pager_;
};
pear.ui.FooterRow.prototype.disposeInternal = function() {
  if (this.pager_) {
    this.pager_.dispose();
    this.pager_ = null;
  }
  pear.ui.FooterRow.superClass_.disposeInternal.call(this);
};
pear.ui.FooterRow.prototype.enterDocument = function() {
  pear.ui.FooterRow.superClass_.enterDocument.call(this);
  var config = this.getGrid().getConfiguration();
  this.setHeight(5);
  var elem = this.getElement();
  this.setPosition_();
  goog.style.setSize(elem, this.getGrid().getWidth(), this.getHeight());
};
goog.provide("pear.ui.BodyCanvas");
goog.require("goog.ui.Component");
goog.require("goog.ui.ContainerRenderer");
pear.ui.BodyCanvas = function(opt_domHelper, opt_renderer) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
};
goog.inherits(pear.ui.BodyCanvas, goog.ui.Component);
pear.ui.BodyCanvas.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();
  goog.dom.classes.set(elem, "pear-grid-body-canvas");
};
goog.provide("pear.ui.DataCellRenderer");
goog.require("pear.ui.CellRenderer");
pear.ui.DataCellRenderer = function() {
  pear.ui.CellRenderer.call(this);
};
goog.inherits(pear.ui.DataCellRenderer, pear.ui.CellRenderer);
goog.addSingletonGetter(pear.ui.DataCellRenderer);
pear.ui.DataCellRenderer.CSS_CLASS = goog.getCssName("pear-grid-cell-data");
pear.ui.DataCellRenderer.prototype.getCssClass = function() {
  return pear.ui.DataCellRenderer.CSS_CLASS;
};
goog.provide("pear.ui.DataCell");
goog.require("pear.ui.Cell");
goog.require("pear.ui.DataCellRenderer");
pear.ui.DataCell = function(opt_domHelper, opt_renderer) {
  pear.ui.Cell.call(this, pear.ui.DataCellRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.ui.DataCell, pear.ui.Cell);
pear.ui.DataCell.prototype.getContent = function() {
  var columnObject = this.getColumnObject();
  if (columnObject.formatter) {
    return String(columnObject.formatter(this.getModel()));
  }
  return String(this.getModel());
};
pear.ui.DataCell.prototype.disposeInternal = function() {
  pear.ui.DataCell.superClass_.disposeInternal.call(this);
};
goog.provide("pear.plugin.HeaderMenu");
goog.require("goog.ui.Component");
goog.require("goog.events.Event");
goog.require("pear.ui.Plugable");
goog.require("goog.positioning.MenuAnchoredPosition");
pear.plugin.HeaderMenu = function(grid, opt_renderer, opt_domHelper) {
  goog.ui.Component.call(this, opt_renderer || pear.ui.RowRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.plugin.HeaderMenu, goog.ui.Component);
pear.ui.Plugable.addImplementation(pear.plugin.HeaderMenu);
pear.plugin.HeaderMenu.prototype.getPageIndex = function() {
  return this.getGrid().getPageIndex();
};
pear.plugin.HeaderMenu.prototype.getGrid = function() {
  return this.grid_;
};
pear.plugin.HeaderMenu.prototype.show = function(grid) {
  this.grid_ = grid;
  var gridElem = this.grid_.getElement();
  var parentElem = goog.dom.getAncestor(gridElem, function() {
    return true;
  });
  this.render(parentElem);
  goog.events.listen(this.grid_, pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK, this.handleGridHeaderMenuOptionClick_, false, this);
  goog.style.showElement(this.getElement(), "");
};
pear.plugin.HeaderMenu.prototype.createDom = function() {
  this.element_ = goog.dom.createDom("div", "pear-grid-header-cell-menu");
};
pear.plugin.HeaderMenu.prototype.disposeInternal = function() {
  this.grid_ = null;
  pear.plugin.HeaderMenu.superClass_.disposeInternal.call(this);
};
pear.plugin.HeaderMenu.prototype.enterDocument = function() {
  pear.plugin.HeaderMenu.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  this.createMenu_();
};
pear.plugin.HeaderMenu.prototype.createMenu_ = function() {
  var closeElement = goog.dom.createDom("div", "fa fa-times");
  goog.dom.appendChild(this.getElement(), closeElement);
  var sampleElement = goog.dom.createDom("span");
  goog.dom.setTextContent(sampleElement, "Header Cell Menu Plugin - placeholder for UI controls - Sorting , Filtering , Other menu options");
  goog.dom.appendChild(this.getElement(), sampleElement);
  goog.events.listen(closeElement, goog.events.EventType.CLICK, function() {
    goog.style.showElement(this.getElement(), "");
  }, false, this);
};
pear.plugin.HeaderMenu.prototype.handleGridHeaderMenuOptionClick_ = function(ge) {
  console.dir(ge);
  var headerCell = ge.cell;
  var menuElement = headerCell.getMenuElement();
  var menuPosition = goog.style.getPosition(menuElement);
  var position = new goog.positioning.MenuAnchoredPosition(menuElement, goog.positioning.Corner.BOTTOM_START, true);
  position.reposition(this.getElement(), goog.positioning.Corner.TOP_START);
  goog.style.showElement(this.getElement(), "inline-block");
};
goog.provide("pear.ui.DataRowRenderer");
goog.require("pear.ui.RowRenderer");
pear.ui.DataRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.DataRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.DataRowRenderer);
pear.ui.DataRowRenderer.CSS_CLASS = goog.getCssName("pear-grid-row-data");
pear.ui.DataRowRenderer.prototype.getCssClass = function() {
  return pear.ui.DataRowRenderer.CSS_CLASS;
};
pear.ui.DataRowRenderer.prototype.getClassNames = function(container) {
  var baseClass = this.getCssClass();
  var isHorizontal = container.getOrientation() == goog.ui.Container.Orientation.HORIZONTAL;
  var even = container.getRowPosition() % 2 == 0;
  var classNames = [baseClass, isHorizontal ? goog.getCssName(baseClass, "horizontal") : goog.getCssName(baseClass, "vertical"), even ? goog.getCssName(baseClass, "even") : goog.getCssName(baseClass, "odd")];
  if (!container.isEnabled()) {
    classNames.push(goog.getCssName(baseClass, "disabled"));
  }
  return classNames;
};
goog.provide("pear.ui.DataRow");
goog.require("pear.ui.DataRowRenderer");
goog.require("pear.ui.Row");
pear.ui.DataRow = function(grid, height, opt_orientation, opt_renderer, opt_domHelper) {
  pear.ui.Row.call(this, grid, height, goog.ui.Container.Orientation.HORIZONTAL, pear.ui.DataRowRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.ui.DataRow, pear.ui.Row);
pear.ui.DataRow.prototype.top_ = 0;
pear.ui.DataRow.prototype.getLocationTop = function() {
  return this.top_;
};
pear.ui.DataRow.prototype.setLocationTop = function(top) {
  this.top_ = top;
};
pear.ui.DataRow.prototype.disposeInternal = function() {
  pear.ui.DataRow.superClass_.disposeInternal.call(this);
};
pear.ui.DataRow.prototype.enterDocument = function() {
  pear.ui.Row.superClass_.enterDocument.call(this);
  var elem = this.getElement();
  this.setPosition_();
  this.getHandler().listen(elem, goog.events.EventType.MOUSEOVER, this.handleMouseOver_, false, this).listen(elem, goog.events.EventType.MOUSEOUT, this.handleMouseOut_, false, this);
};
pear.ui.DataRow.prototype.handleMouseOver_ = function(be) {
  var elem = this.getElement();
  goog.dom.classes.add(elem, "pear-grid-row-over");
  if (this.getRowPosition() % 2 > 0) {
    goog.dom.classes.remove(elem, "pear-grid-row-data-odd");
  }
};
pear.ui.DataRow.prototype.handleMouseOut_ = function(be) {
  var elem = this.getElement();
  goog.dom.classes.remove(elem, "pear-grid-row-over");
  if (this.getRowPosition() % 2 > 0) {
    goog.dom.classes.add(elem, "pear-grid-row-data-odd");
  }
};
goog.provide("pear.ui.Header");
goog.require("goog.ui.Component");
pear.ui.Header = function(opt_domHelper, opt_renderer) {
  goog.ui.Component.call(this, opt_domHelper);
  this.renderer_ = opt_renderer || goog.ui.ContainerRenderer.getInstance();
};
goog.inherits(pear.ui.Header, goog.ui.Component);
pear.ui.Header.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();
  goog.dom.classes.set(elem, "pear-grid-header");
};
goog.provide("goog.userAgent.product");
goog.require("goog.userAgent");
goog.define("goog.userAgent.product.ASSUME_FIREFOX", false);
goog.define("goog.userAgent.product.ASSUME_CAMINO", false);
goog.define("goog.userAgent.product.ASSUME_IPHONE", false);
goog.define("goog.userAgent.product.ASSUME_IPAD", false);
goog.define("goog.userAgent.product.ASSUME_ANDROID", false);
goog.define("goog.userAgent.product.ASSUME_CHROME", false);
goog.define("goog.userAgent.product.ASSUME_SAFARI", false);
goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || (goog.userAgent.ASSUME_OPERA || (goog.userAgent.product.ASSUME_FIREFOX || (goog.userAgent.product.ASSUME_CAMINO || (goog.userAgent.product.ASSUME_IPHONE || (goog.userAgent.product.ASSUME_IPAD || (goog.userAgent.product.ASSUME_ANDROID || (goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI)))))));
goog.userAgent.product.init_ = function() {
  goog.userAgent.product.detectedFirefox_ = false;
  goog.userAgent.product.detectedCamino_ = false;
  goog.userAgent.product.detectedIphone_ = false;
  goog.userAgent.product.detectedIpad_ = false;
  goog.userAgent.product.detectedAndroid_ = false;
  goog.userAgent.product.detectedChrome_ = false;
  goog.userAgent.product.detectedSafari_ = false;
  var ua = goog.userAgent.getUserAgentString();
  if (!ua) {
    return;
  }
  if (ua.indexOf("Firefox") != -1) {
    goog.userAgent.product.detectedFirefox_ = true;
  } else {
    if (ua.indexOf("Camino") != -1) {
      goog.userAgent.product.detectedCamino_ = true;
    } else {
      if (ua.indexOf("iPhone") != -1 || ua.indexOf("iPod") != -1) {
        goog.userAgent.product.detectedIphone_ = true;
      } else {
        if (ua.indexOf("iPad") != -1) {
          goog.userAgent.product.detectedIpad_ = true;
        } else {
          if (ua.indexOf("Chrome") != -1) {
            goog.userAgent.product.detectedChrome_ = true;
          } else {
            if (ua.indexOf("Android") != -1) {
              goog.userAgent.product.detectedAndroid_ = true;
            } else {
              if (ua.indexOf("Safari") != -1) {
                goog.userAgent.product.detectedSafari_ = true;
              }
            }
          }
        }
      }
    }
  }
};
if (!goog.userAgent.product.PRODUCT_KNOWN_) {
  goog.userAgent.product.init_();
}
goog.userAgent.product.OPERA = goog.userAgent.OPERA;
goog.userAgent.product.IE = goog.userAgent.IE;
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : goog.userAgent.product.detectedFirefox_;
goog.userAgent.product.CAMINO = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CAMINO : goog.userAgent.product.detectedCamino_;
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.detectedIphone_;
goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : goog.userAgent.product.detectedIpad_;
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : goog.userAgent.product.detectedAndroid_;
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : goog.userAgent.product.detectedChrome_;
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.detectedSafari_;
goog.provide("goog.ui.ButtonSide");
goog.ui.ButtonSide = {NONE:0, START:1, END:2, BOTH:3};
goog.provide("goog.ui.ButtonRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.Role");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.ui.ButtonSide");
goog.require("goog.ui.Component");
goog.require("goog.ui.ControlRenderer");
goog.ui.ButtonRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.ButtonRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.ButtonRenderer);
goog.ui.ButtonRenderer.CSS_CLASS = goog.getCssName("goog-button");
goog.ui.ButtonRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.BUTTON;
};
goog.ui.ButtonRenderer.prototype.updateAriaState = function(element, state, enable) {
  switch(state) {
    case goog.ui.Component.State.SELECTED:
    ;
    case goog.ui.Component.State.CHECKED:
      goog.asserts.assert(element, "The button DOM element cannot be null.");
      goog.a11y.aria.setState(element, goog.a11y.aria.State.PRESSED, enable);
      break;
    default:
    ;
    case goog.ui.Component.State.OPENED:
    ;
    case goog.ui.Component.State.DISABLED:
      goog.base(this, "updateAriaState", element, state, enable);
      break;
  }
};
goog.ui.ButtonRenderer.prototype.createDom = function(button) {
  var element = goog.base(this, "createDom", button);
  this.setTooltip(element, button.getTooltip());
  var value = button.getValue();
  if (value) {
    this.setValue(element, value);
  }
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED, button.isChecked());
  }
  return element;
};
goog.ui.ButtonRenderer.prototype.decorate = function(button, element) {
  element = goog.ui.ButtonRenderer.superClass_.decorate.call(this, button, element);
  button.setValueInternal(this.getValue(element));
  button.setTooltipInternal(this.getTooltip(element));
  if (button.isSupportedState(goog.ui.Component.State.CHECKED)) {
    this.updateAriaState(element, goog.ui.Component.State.CHECKED, button.isChecked());
  }
  return element;
};
goog.ui.ButtonRenderer.prototype.getValue = goog.nullFunction;
goog.ui.ButtonRenderer.prototype.setValue = goog.nullFunction;
goog.ui.ButtonRenderer.prototype.getTooltip = function(element) {
  return element.title;
};
goog.ui.ButtonRenderer.prototype.setTooltip = function(element, tooltip) {
  if (element && tooltip) {
    element.title = tooltip;
  }
};
goog.ui.ButtonRenderer.prototype.setCollapsed = function(button, sides) {
  var isRtl = button.isRightToLeft();
  var collapseLeftClassName = goog.getCssName(this.getStructuralCssClass(), "collapse-left");
  var collapseRightClassName = goog.getCssName(this.getStructuralCssClass(), "collapse-right");
  button.enableClassName(isRtl ? collapseRightClassName : collapseLeftClassName, !!(sides & goog.ui.ButtonSide.START));
  button.enableClassName(isRtl ? collapseLeftClassName : collapseRightClassName, !!(sides & goog.ui.ButtonSide.END));
};
goog.ui.ButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.ButtonRenderer.CSS_CLASS;
};
goog.provide("goog.ui.NativeButtonRenderer");
goog.require("goog.asserts");
goog.require("goog.dom.classlist");
goog.require("goog.events.EventType");
goog.require("goog.ui.ButtonRenderer");
goog.require("goog.ui.Component");
goog.ui.NativeButtonRenderer = function() {
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.NativeButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(goog.ui.NativeButtonRenderer);
goog.ui.NativeButtonRenderer.prototype.getAriaRole = function() {
  return undefined;
};
goog.ui.NativeButtonRenderer.prototype.createDom = function(button) {
  this.setUpNativeButton_(button);
  return button.getDomHelper().createDom("button", {"class":this.getClassNames(button).join(" "), "disabled":!button.isEnabled(), "title":button.getTooltip() || "", "value":button.getValue() || ""}, button.getCaption() || "");
};
goog.ui.NativeButtonRenderer.prototype.canDecorate = function(element) {
  return element.tagName == "BUTTON" || element.tagName == "INPUT" && (element.type == "button" || (element.type == "submit" || element.type == "reset"));
};
goog.ui.NativeButtonRenderer.prototype.decorate = function(button, element) {
  this.setUpNativeButton_(button);
  if (element.disabled) {
    var disabledClassName = goog.asserts.assertString(this.getClassForState(goog.ui.Component.State.DISABLED));
    goog.dom.classlist.add(element, disabledClassName);
  }
  return goog.ui.NativeButtonRenderer.superClass_.decorate.call(this, button, element);
};
goog.ui.NativeButtonRenderer.prototype.initializeDom = function(button) {
  button.getHandler().listen(button.getElement(), goog.events.EventType.CLICK, button.performActionInternal);
};
goog.ui.NativeButtonRenderer.prototype.setAllowTextSelection = goog.nullFunction;
goog.ui.NativeButtonRenderer.prototype.setRightToLeft = goog.nullFunction;
goog.ui.NativeButtonRenderer.prototype.isFocusable = function(button) {
  return button.isEnabled();
};
goog.ui.NativeButtonRenderer.prototype.setFocusable = goog.nullFunction;
goog.ui.NativeButtonRenderer.prototype.setState = function(button, state, enable) {
  goog.ui.NativeButtonRenderer.superClass_.setState.call(this, button, state, enable);
  var element = button.getElement();
  if (element && state == goog.ui.Component.State.DISABLED) {
    element.disabled = enable;
  }
};
goog.ui.NativeButtonRenderer.prototype.getValue = function(element) {
  return element.value;
};
goog.ui.NativeButtonRenderer.prototype.setValue = function(element, value) {
  if (element) {
    element.value = value;
  }
};
goog.ui.NativeButtonRenderer.prototype.updateAriaState = goog.nullFunction;
goog.ui.NativeButtonRenderer.prototype.setUpNativeButton_ = function(button) {
  button.setHandleMouseEvents(false);
  button.setAutoStates(goog.ui.Component.State.ALL, false);
  button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
};
goog.provide("goog.ui.Button");
goog.provide("goog.ui.Button.Side");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.ui.ButtonRenderer");
goog.require("goog.ui.ButtonSide");
goog.require("goog.ui.Component");
goog.require("goog.ui.Control");
goog.require("goog.ui.NativeButtonRenderer");
goog.require("goog.ui.registry");
goog.ui.Button = function(opt_content, opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, opt_content, opt_renderer || goog.ui.NativeButtonRenderer.getInstance(), opt_domHelper);
};
goog.inherits(goog.ui.Button, goog.ui.Control);
goog.ui.Button.Side = goog.ui.ButtonSide;
goog.ui.Button.prototype.value_;
goog.ui.Button.prototype.tooltip_;
goog.ui.Button.prototype.getValue = function() {
  return this.value_;
};
goog.ui.Button.prototype.setValue = function(value) {
  this.value_ = value;
  var renderer = (this.getRenderer());
  renderer.setValue(this.getElement(), (value));
};
goog.ui.Button.prototype.setValueInternal = function(value) {
  this.value_ = value;
};
goog.ui.Button.prototype.getTooltip = function() {
  return this.tooltip_;
};
goog.ui.Button.prototype.setTooltip = function(tooltip) {
  this.tooltip_ = tooltip;
  this.getRenderer().setTooltip(this.getElement(), tooltip);
};
goog.ui.Button.prototype.setTooltipInternal = function(tooltip) {
  this.tooltip_ = tooltip;
};
goog.ui.Button.prototype.setCollapsed = function(sides) {
  this.getRenderer().setCollapsed(this, sides);
};
goog.ui.Button.prototype.disposeInternal = function() {
  goog.ui.Button.superClass_.disposeInternal.call(this);
  delete this.value_;
  delete this.tooltip_;
};
goog.ui.Button.prototype.enterDocument = function() {
  goog.ui.Button.superClass_.enterDocument.call(this);
  if (this.isSupportedState(goog.ui.Component.State.FOCUSED)) {
    var keyTarget = this.getKeyEventTarget();
    if (keyTarget) {
      this.getHandler().listen(keyTarget, goog.events.EventType.KEYUP, this.handleKeyEventInternal);
    }
  }
};
goog.ui.Button.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER && e.type == goog.events.KeyHandler.EventType.KEY || e.keyCode == goog.events.KeyCodes.SPACE && e.type == goog.events.EventType.KEYUP) {
    return this.performActionInternal(e);
  }
  return e.keyCode == goog.events.KeyCodes.SPACE;
};
goog.ui.registry.setDecoratorByClassName(goog.ui.ButtonRenderer.CSS_CLASS, function() {
  return new goog.ui.Button(null);
});
goog.provide("goog.ui.INLINE_BLOCK_CLASSNAME");
goog.ui.INLINE_BLOCK_CLASSNAME = goog.getCssName("goog-inline-block");
goog.provide("goog.ui.CustomButtonRenderer");
goog.require("goog.a11y.aria.Role");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.classlist");
goog.require("goog.string");
goog.require("goog.ui.ButtonRenderer");
goog.require("goog.ui.INLINE_BLOCK_CLASSNAME");
goog.ui.CustomButtonRenderer = function() {
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.CustomButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(goog.ui.CustomButtonRenderer);
goog.ui.CustomButtonRenderer.CSS_CLASS = goog.getCssName("goog-custom-button");
goog.ui.CustomButtonRenderer.prototype.createDom = function(control) {
  var button = (control);
  var classNames = this.getClassNames(button);
  var attributes = {"class":goog.ui.INLINE_BLOCK_CLASSNAME + " " + classNames.join(" ")};
  var buttonElement = button.getDomHelper().createDom("div", attributes, this.createButton(button.getContent(), button.getDomHelper()));
  this.setTooltip(buttonElement, (button.getTooltip()));
  this.setAriaStates(button, buttonElement);
  return buttonElement;
};
goog.ui.CustomButtonRenderer.prototype.getAriaRole = function() {
  return goog.a11y.aria.Role.BUTTON;
};
goog.ui.CustomButtonRenderer.prototype.getContentElement = function(element) {
  return element && (element.firstChild.firstChild);
};
goog.ui.CustomButtonRenderer.prototype.createButton = function(content, dom) {
  return dom.createDom("div", goog.ui.INLINE_BLOCK_CLASSNAME + " " + goog.getCssName(this.getCssClass(), "outer-box"), dom.createDom("div", goog.ui.INLINE_BLOCK_CLASSNAME + " " + goog.getCssName(this.getCssClass(), "inner-box"), content));
};
goog.ui.CustomButtonRenderer.prototype.canDecorate = function(element) {
  return element.tagName == "DIV";
};
goog.ui.CustomButtonRenderer.prototype.hasBoxStructure = function(button, element) {
  var outer = button.getDomHelper().getFirstElementChild(element);
  var outerClassName = goog.getCssName(this.getCssClass(), "outer-box");
  if (outer && goog.dom.classlist.contains(outer, outerClassName)) {
    var inner = button.getDomHelper().getFirstElementChild(outer);
    var innerClassName = goog.getCssName(this.getCssClass(), "inner-box");
    if (inner && goog.dom.classlist.contains(inner, innerClassName)) {
      return true;
    }
  }
  return false;
};
goog.ui.CustomButtonRenderer.prototype.decorate = function(control, element) {
  var button = (control);
  goog.ui.CustomButtonRenderer.trimTextNodes_(element, true);
  goog.ui.CustomButtonRenderer.trimTextNodes_(element, false);
  if (!this.hasBoxStructure(button, element)) {
    element.appendChild(this.createButton(element.childNodes, button.getDomHelper()));
  }
  goog.dom.classlist.addAll(element, [goog.ui.INLINE_BLOCK_CLASSNAME, this.getCssClass()]);
  return goog.ui.CustomButtonRenderer.superClass_.decorate.call(this, button, element);
};
goog.ui.CustomButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.CustomButtonRenderer.CSS_CLASS;
};
goog.ui.CustomButtonRenderer.trimTextNodes_ = function(element, fromStart) {
  if (element) {
    var node = fromStart ? element.firstChild : element.lastChild, next;
    while (node && node.parentNode == element) {
      next = fromStart ? node.nextSibling : node.previousSibling;
      if (node.nodeType == goog.dom.NodeType.TEXT) {
        var text = node.nodeValue;
        if (goog.string.trim(text) == "") {
          element.removeChild(node);
        } else {
          node.nodeValue = fromStart ? goog.string.trimLeft(text) : goog.string.trimRight(text);
          break;
        }
      } else {
        break;
      }
      node = next;
    }
  }
};
goog.provide("goog.ui.MenuButtonRenderer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.string");
goog.require("goog.style");
goog.require("goog.ui.Component");
goog.require("goog.ui.CustomButtonRenderer");
goog.require("goog.ui.INLINE_BLOCK_CLASSNAME");
goog.require("goog.ui.Menu");
goog.require("goog.ui.MenuRenderer");
goog.require("goog.userAgent");
goog.ui.MenuButtonRenderer = function() {
  goog.ui.CustomButtonRenderer.call(this);
};
goog.inherits(goog.ui.MenuButtonRenderer, goog.ui.CustomButtonRenderer);
goog.addSingletonGetter(goog.ui.MenuButtonRenderer);
goog.ui.MenuButtonRenderer.CSS_CLASS = goog.getCssName("goog-menu-button");
goog.ui.MenuButtonRenderer.WRAPPER_PROP_ = "__goog_wrapper_div";
if (goog.userAgent.GECKO) {
  goog.ui.MenuButtonRenderer.prototype.setContent = function(element, content) {
    var caption = goog.ui.MenuButtonRenderer.superClass_.getContentElement.call(this, (element && element.firstChild));
    if (caption) {
      goog.dom.replaceNode(this.createCaption(content, goog.dom.getDomHelper(element)), caption);
    }
  };
}
goog.ui.MenuButtonRenderer.prototype.getContentElement = function(element) {
  var content = goog.ui.MenuButtonRenderer.superClass_.getContentElement.call(this, (element && element.firstChild));
  if (goog.userAgent.GECKO && (content && content[goog.ui.MenuButtonRenderer.WRAPPER_PROP_])) {
    content = (content.firstChild);
  }
  return content;
};
goog.ui.MenuButtonRenderer.prototype.updateAriaState = function(element, state, enable) {
  goog.asserts.assert(element, "The menu button DOM element cannot be null.");
  goog.asserts.assert(goog.string.isEmpty(goog.a11y.aria.getState(element, goog.a11y.aria.State.EXPANDED)), "Menu buttons do not support the ARIA expanded attribute. " + "Please use ARIA disabled instead." + goog.a11y.aria.getState(element, goog.a11y.aria.State.EXPANDED).length);
  if (state != goog.ui.Component.State.OPENED) {
    goog.base(this, "updateAriaState", element, state, enable);
  }
};
goog.ui.MenuButtonRenderer.prototype.decorate = function(control, element) {
  var button = (control);
  var menuElem = goog.dom.getElementsByTagNameAndClass("*", goog.ui.MenuRenderer.CSS_CLASS, element)[0];
  if (menuElem) {
    goog.style.setElementShown(menuElem, false);
    goog.dom.appendChild(goog.dom.getOwnerDocument(menuElem).body, menuElem);
    var menu = new goog.ui.Menu;
    menu.decorate(menuElem);
    button.setMenu(menu);
  }
  return goog.ui.MenuButtonRenderer.superClass_.decorate.call(this, button, element);
};
goog.ui.MenuButtonRenderer.prototype.createButton = function(content, dom) {
  return goog.ui.MenuButtonRenderer.superClass_.createButton.call(this, [this.createCaption(content, dom), this.createDropdown(dom)], dom);
};
goog.ui.MenuButtonRenderer.prototype.createCaption = function(content, dom) {
  return goog.ui.MenuButtonRenderer.wrapCaption(content, this.getCssClass(), dom);
};
goog.ui.MenuButtonRenderer.wrapCaption = function(content, cssClass, dom) {
  return dom.createDom("div", goog.ui.INLINE_BLOCK_CLASSNAME + " " + goog.getCssName(cssClass, "caption"), content);
};
goog.ui.MenuButtonRenderer.prototype.createDropdown = function(dom) {
  return dom.createDom("div", goog.ui.INLINE_BLOCK_CLASSNAME + " " + goog.getCssName(this.getCssClass(), "dropdown"), "\u00a0");
};
goog.ui.MenuButtonRenderer.prototype.getCssClass = function() {
  return goog.ui.MenuButtonRenderer.CSS_CLASS;
};
goog.provide("goog.ui.MenuButton");
goog.require("goog.Timer");
goog.require("goog.a11y.aria");
goog.require("goog.a11y.aria.State");
goog.require("goog.asserts");
goog.require("goog.dom");
goog.require("goog.events.EventType");
goog.require("goog.events.KeyCodes");
goog.require("goog.events.KeyHandler");
goog.require("goog.math.Box");
goog.require("goog.math.Rect");
goog.require("goog.positioning");
goog.require("goog.positioning.Corner");
goog.require("goog.positioning.MenuAnchoredPosition");
goog.require("goog.positioning.Overflow");
goog.require("goog.style");
goog.require("goog.ui.Button");
goog.require("goog.ui.Component");
goog.require("goog.ui.Menu");
goog.require("goog.ui.MenuButtonRenderer");
goog.require("goog.ui.registry");
goog.require("goog.userAgent");
goog.require("goog.userAgent.product");
goog.ui.MenuButton = function(opt_content, opt_menu, opt_renderer, opt_domHelper) {
  goog.ui.Button.call(this, opt_content, opt_renderer || goog.ui.MenuButtonRenderer.getInstance(), opt_domHelper);
  this.setSupportedState(goog.ui.Component.State.OPENED, true);
  this.menuPosition_ = new goog.positioning.MenuAnchoredPosition(null, goog.positioning.Corner.BOTTOM_START);
  if (opt_menu) {
    this.setMenu(opt_menu);
  }
  this.menuMargin_ = null;
  this.timer_ = new goog.Timer(500);
  if ((goog.userAgent.product.IPHONE || goog.userAgent.product.IPAD) && !goog.userAgent.isVersionOrHigher("533.17.9")) {
    this.setFocusablePopupMenu(true);
  }
};
goog.inherits(goog.ui.MenuButton, goog.ui.Button);
goog.ui.MenuButton.prototype.menu_;
goog.ui.MenuButton.prototype.positionElement_;
goog.ui.MenuButton.prototype.menuMargin_;
goog.ui.MenuButton.prototype.isFocusablePopupMenu_ = false;
goog.ui.MenuButton.prototype.timer_;
goog.ui.MenuButton.prototype.buttonRect_;
goog.ui.MenuButton.prototype.viewportBox_;
goog.ui.MenuButton.prototype.originalSize_;
goog.ui.MenuButton.prototype.renderMenuAsSibling_ = false;
goog.ui.MenuButton.prototype.enterDocument = function() {
  goog.ui.MenuButton.superClass_.enterDocument.call(this);
  if (this.menu_) {
    this.attachMenuEventListeners_(this.menu_, true);
  }
  goog.a11y.aria.setState(this.getElementStrict(), goog.a11y.aria.State.HASPOPUP, !!this.menu_);
};
goog.ui.MenuButton.prototype.exitDocument = function() {
  goog.ui.MenuButton.superClass_.exitDocument.call(this);
  if (this.menu_) {
    this.setOpen(false);
    this.menu_.exitDocument();
    this.attachMenuEventListeners_(this.menu_, false);
    var menuElement = this.menu_.getElement();
    if (menuElement) {
      goog.dom.removeNode(menuElement);
    }
  }
};
goog.ui.MenuButton.prototype.disposeInternal = function() {
  goog.ui.MenuButton.superClass_.disposeInternal.call(this);
  if (this.menu_) {
    this.menu_.dispose();
    delete this.menu_;
  }
  delete this.positionElement_;
  this.timer_.dispose();
};
goog.ui.MenuButton.prototype.handleMouseDown = function(e) {
  goog.ui.MenuButton.superClass_.handleMouseDown.call(this, e);
  if (this.isActive()) {
    this.setOpen(!this.isOpen(), e);
    if (this.menu_) {
      this.menu_.setMouseButtonPressed(this.isOpen());
    }
  }
};
goog.ui.MenuButton.prototype.handleMouseUp = function(e) {
  goog.ui.MenuButton.superClass_.handleMouseUp.call(this, e);
  if (this.menu_ && !this.isActive()) {
    this.menu_.setMouseButtonPressed(false);
  }
};
goog.ui.MenuButton.prototype.performActionInternal = function(e) {
  this.setActive(false);
  return true;
};
goog.ui.MenuButton.prototype.handleDocumentMouseDown = function(e) {
  if (this.menu_ && (this.menu_.isVisible() && !this.containsElement((e.target)))) {
    this.setOpen(false);
  }
};
goog.ui.MenuButton.prototype.containsElement = function(element) {
  return element && goog.dom.contains(this.getElement(), element) || (this.menu_ && this.menu_.containsElement(element) || false);
};
goog.ui.MenuButton.prototype.handleKeyEventInternal = function(e) {
  if (e.keyCode == goog.events.KeyCodes.SPACE) {
    e.preventDefault();
    if (e.type != goog.events.EventType.KEYUP) {
      return true;
    }
  } else {
    if (e.type != goog.events.KeyHandler.EventType.KEY) {
      return false;
    }
  }
  if (this.menu_ && this.menu_.isVisible()) {
    var handledByMenu = this.menu_.handleKeyEvent(e);
    if (e.keyCode == goog.events.KeyCodes.ESC) {
      this.setOpen(false);
      return true;
    }
    return handledByMenu;
  }
  if (e.keyCode == goog.events.KeyCodes.DOWN || (e.keyCode == goog.events.KeyCodes.UP || (e.keyCode == goog.events.KeyCodes.SPACE || e.keyCode == goog.events.KeyCodes.ENTER))) {
    this.setOpen(true);
    return true;
  }
  return false;
};
goog.ui.MenuButton.prototype.handleMenuAction = function(e) {
  this.setOpen(false);
};
goog.ui.MenuButton.prototype.handleMenuBlur = function(e) {
  if (!this.isActive()) {
    this.setOpen(false);
  }
};
goog.ui.MenuButton.prototype.handleBlur = function(e) {
  if (!this.isFocusablePopupMenu()) {
    this.setOpen(false);
  }
  goog.ui.MenuButton.superClass_.handleBlur.call(this, e);
};
goog.ui.MenuButton.prototype.getMenu = function() {
  if (!this.menu_) {
    this.setMenu(new goog.ui.Menu(this.getDomHelper()));
  }
  return this.menu_ || null;
};
goog.ui.MenuButton.prototype.setMenu = function(menu) {
  var oldMenu = this.menu_;
  if (menu != oldMenu) {
    if (oldMenu) {
      this.setOpen(false);
      if (this.isInDocument()) {
        this.attachMenuEventListeners_(oldMenu, false);
      }
      delete this.menu_;
    }
    if (this.isInDocument()) {
      goog.a11y.aria.setState(this.getElementStrict(), goog.a11y.aria.State.HASPOPUP, !!menu);
    }
    if (menu) {
      this.menu_ = menu;
      menu.setParent(this);
      menu.setVisible(false);
      menu.setAllowAutoFocus(this.isFocusablePopupMenu());
      if (this.isInDocument()) {
        this.attachMenuEventListeners_(menu, true);
      }
    }
  }
  return oldMenu;
};
goog.ui.MenuButton.prototype.setMenuPosition = function(position) {
  if (position) {
    this.menuPosition_ = position;
    this.positionElement_ = position.element;
  }
};
goog.ui.MenuButton.prototype.setPositionElement = function(positionElement) {
  this.positionElement_ = positionElement;
  this.positionMenu();
};
goog.ui.MenuButton.prototype.setMenuMargin = function(margin) {
  this.menuMargin_ = margin;
};
goog.ui.MenuButton.prototype.addItem = function(item) {
  this.getMenu().addChild(item, true);
};
goog.ui.MenuButton.prototype.addItemAt = function(item, index) {
  this.getMenu().addChildAt(item, index, true);
};
goog.ui.MenuButton.prototype.removeItem = function(item) {
  var child = this.getMenu().removeChild(item, true);
  if (child) {
    child.dispose();
  }
};
goog.ui.MenuButton.prototype.removeItemAt = function(index) {
  var child = this.getMenu().removeChildAt(index, true);
  if (child) {
    child.dispose();
  }
};
goog.ui.MenuButton.prototype.getItemAt = function(index) {
  return this.menu_ ? (this.menu_.getChildAt(index)) : null;
};
goog.ui.MenuButton.prototype.getItemCount = function() {
  return this.menu_ ? this.menu_.getChildCount() : 0;
};
goog.ui.MenuButton.prototype.setVisible = function(visible, opt_force) {
  var visibilityChanged = goog.ui.MenuButton.superClass_.setVisible.call(this, visible, opt_force);
  if (visibilityChanged && !this.isVisible()) {
    this.setOpen(false);
  }
  return visibilityChanged;
};
goog.ui.MenuButton.prototype.setEnabled = function(enable) {
  goog.ui.MenuButton.superClass_.setEnabled.call(this, enable);
  if (!this.isEnabled()) {
    this.setOpen(false);
  }
};
goog.ui.MenuButton.prototype.isAlignMenuToStart = function() {
  var corner = this.menuPosition_.corner;
  return corner == goog.positioning.Corner.BOTTOM_START || corner == goog.positioning.Corner.TOP_START;
};
goog.ui.MenuButton.prototype.setAlignMenuToStart = function(alignToStart) {
  this.menuPosition_.corner = alignToStart ? goog.positioning.Corner.BOTTOM_START : goog.positioning.Corner.BOTTOM_END;
};
goog.ui.MenuButton.prototype.setScrollOnOverflow = function(scrollOnOverflow) {
  if (this.menuPosition_.setLastResortOverflow) {
    var overflowX = goog.positioning.Overflow.ADJUST_X;
    var overflowY = scrollOnOverflow ? goog.positioning.Overflow.RESIZE_HEIGHT : goog.positioning.Overflow.ADJUST_Y;
    this.menuPosition_.setLastResortOverflow(overflowX | overflowY);
  }
};
goog.ui.MenuButton.prototype.isScrollOnOverflow = function() {
  return this.menuPosition_.getLastResortOverflow && !!(this.menuPosition_.getLastResortOverflow() & goog.positioning.Overflow.RESIZE_HEIGHT);
};
goog.ui.MenuButton.prototype.isFocusablePopupMenu = function() {
  return this.isFocusablePopupMenu_;
};
goog.ui.MenuButton.prototype.setFocusablePopupMenu = function(focusable) {
  this.isFocusablePopupMenu_ = focusable;
};
goog.ui.MenuButton.prototype.setRenderMenuAsSibling = function(renderMenuAsSibling) {
  this.renderMenuAsSibling_ = renderMenuAsSibling;
};
goog.ui.MenuButton.prototype.showMenu = function() {
  this.setOpen(true);
};
goog.ui.MenuButton.prototype.hideMenu = function() {
  this.setOpen(false);
};
goog.ui.MenuButton.prototype.setOpen = function(open, opt_e) {
  goog.ui.MenuButton.superClass_.setOpen.call(this, open);
  if (this.menu_ && this.hasState(goog.ui.Component.State.OPENED) == open) {
    if (open) {
      if (!this.menu_.isInDocument()) {
        if (this.renderMenuAsSibling_) {
          this.menu_.render((this.getElement().parentNode));
        } else {
          this.menu_.render();
        }
      }
      this.viewportBox_ = goog.style.getVisibleRectForElement(this.getElement());
      this.buttonRect_ = goog.style.getBounds(this.getElement());
      this.positionMenu();
      this.menu_.setHighlightedIndex(-1);
    } else {
      this.setActive(false);
      this.menu_.setMouseButtonPressed(false);
      var element = this.getElement();
      if (element) {
        goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, "");
      }
      if (goog.isDefAndNotNull(this.originalSize_)) {
        this.originalSize_ = undefined;
        var elem = this.menu_.getElement();
        if (elem) {
          goog.style.setSize(elem, "", "");
        }
      }
    }
    this.menu_.setVisible(open, false, opt_e);
    if (!this.isDisposed()) {
      this.attachPopupListeners_(open);
    }
  }
};
goog.ui.MenuButton.prototype.invalidateMenuSize = function() {
  this.originalSize_ = undefined;
};
goog.ui.MenuButton.prototype.positionMenu = function() {
  if (!this.menu_.isInDocument()) {
    return;
  }
  var positionElement = this.positionElement_ || this.getElement();
  var position = this.menuPosition_;
  this.menuPosition_.element = positionElement;
  var elem = this.menu_.getElement();
  if (!this.menu_.isVisible()) {
    elem.style.visibility = "hidden";
    goog.style.setElementShown(elem, true);
  }
  if (!this.originalSize_ && this.isScrollOnOverflow()) {
    this.originalSize_ = goog.style.getSize(elem);
  }
  var popupCorner = goog.positioning.flipCornerVertical(position.corner);
  position.reposition(elem, popupCorner, this.menuMargin_, this.originalSize_);
  if (!this.menu_.isVisible()) {
    goog.style.setElementShown(elem, false);
    elem.style.visibility = "visible";
  }
};
goog.ui.MenuButton.prototype.onTick_ = function(e) {
  var currentButtonRect = goog.style.getBounds(this.getElement());
  var currentViewport = goog.style.getVisibleRectForElement(this.getElement());
  if (!goog.math.Rect.equals(this.buttonRect_, currentButtonRect) || !goog.math.Box.equals(this.viewportBox_, currentViewport)) {
    this.buttonRect_ = currentButtonRect;
    this.viewportBox_ = currentViewport;
    this.positionMenu();
  }
};
goog.ui.MenuButton.prototype.attachMenuEventListeners_ = function(menu, attach) {
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;
  method.call(handler, menu, goog.ui.Component.EventType.ACTION, this.handleMenuAction);
  method.call(handler, menu, goog.ui.Component.EventType.HIGHLIGHT, this.handleHighlightItem);
  method.call(handler, menu, goog.ui.Component.EventType.UNHIGHLIGHT, this.handleUnHighlightItem);
};
goog.ui.MenuButton.prototype.handleHighlightItem = function(e) {
  var element = this.getElement();
  goog.asserts.assert(element, "The menu button DOM element cannot be null.");
  if (e.target.getElement() != null) {
    goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, e.target.getElement().id);
  }
};
goog.ui.MenuButton.prototype.handleUnHighlightItem = function(e) {
  if (!this.menu_.getHighlighted()) {
    var element = this.getElement();
    goog.asserts.assert(element, "The menu button DOM element cannot be null.");
    goog.a11y.aria.setState(element, goog.a11y.aria.State.ACTIVEDESCENDANT, "");
  }
};
goog.ui.MenuButton.prototype.attachPopupListeners_ = function(attach) {
  var handler = this.getHandler();
  var method = attach ? handler.listen : handler.unlisten;
  method.call(handler, this.getDomHelper().getDocument(), goog.events.EventType.MOUSEDOWN, this.handleDocumentMouseDown, true);
  if (this.isFocusablePopupMenu()) {
    method.call(handler, (this.menu_), goog.ui.Component.EventType.BLUR, this.handleMenuBlur);
  }
  method.call(handler, this.timer_, goog.Timer.TICK, this.onTick_);
  if (attach) {
    this.timer_.start();
  } else {
    this.timer_.stop();
  }
};
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuButtonRenderer.CSS_CLASS, function() {
  return new goog.ui.MenuButton(null);
});
goog.provide("goog.ui.SplitBehavior");
goog.provide("goog.ui.SplitBehavior.DefaultHandlers");
goog.require("goog.Disposable");
goog.require("goog.dispose");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.require("goog.dom.classlist");
goog.require("goog.events.EventHandler");
goog.require("goog.ui.ButtonSide");
goog.require("goog.ui.Component");
goog.require("goog.ui.decorate");
goog.require("goog.ui.registry");
goog.ui.SplitBehavior = function(first, second, opt_behaviorHandler, opt_eventType, opt_domHelper) {
  goog.Disposable.call(this);
  this.first_ = first;
  this.second_ = second;
  this.behaviorHandler_ = opt_behaviorHandler || goog.ui.SplitBehavior.DefaultHandlers.CAPTION;
  this.eventType_ = opt_eventType || goog.ui.Component.EventType.ACTION;
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  this.isActive_ = false;
  this.eventHandler_ = new goog.events.EventHandler;
  this.disposeFirst_ = true;
  this.disposeSecond_ = true;
};
goog.inherits(goog.ui.SplitBehavior, goog.Disposable);
goog.ui.SplitBehavior.CSS_CLASS = goog.getCssName("goog-split-behavior");
goog.ui.SplitBehavior.DefaultHandlers = {NONE:goog.nullFunction, CAPTION:function(targetControl, e) {
  var item = (e.target);
  var value = (item && item.getValue() || "");
  var button = (targetControl);
  button.setCaption && button.setCaption(value);
  button.setValue && button.setValue(value);
}, VALUE:function(targetControl, e) {
  var item = (e.target);
  var value = (item && item.getValue()) || "";
  var button = (targetControl);
  button.setValue && button.setValue(value);
}};
goog.ui.SplitBehavior.prototype.element_ = null;
goog.ui.SplitBehavior.prototype.getElement = function() {
  return this.element_;
};
goog.ui.SplitBehavior.prototype.getBehaviorHandler = function() {
  return this.behaviorHandler_;
};
goog.ui.SplitBehavior.prototype.getEventType = function() {
  return this.eventType_;
};
goog.ui.SplitBehavior.prototype.setDisposeControls = function(disposeFirst, disposeSecond) {
  this.disposeFirst_ = !!disposeFirst;
  this.disposeSecond_ = !!disposeSecond;
};
goog.ui.SplitBehavior.prototype.setHandler = function(behaviorHandler) {
  this.behaviorHandler_ = behaviorHandler;
  if (this.isActive_) {
    this.setActive(false);
    this.setActive(true);
  }
};
goog.ui.SplitBehavior.prototype.setEventType = function(eventType) {
  this.eventType_ = eventType;
  if (this.isActive_) {
    this.setActive(false);
    this.setActive(true);
  }
};
goog.ui.SplitBehavior.prototype.decorate = function(element, opt_activate) {
  if (this.first_ || this.second_) {
    throw Error("Cannot decorate controls are already set");
  }
  this.decorateChildren_(element);
  var activate = goog.isDefAndNotNull(opt_activate) ? !!opt_activate : true;
  this.element_ = element;
  this.setActive(activate);
  return this;
};
goog.ui.SplitBehavior.prototype.render = function(element, opt_activate) {
  goog.dom.classlist.add(element, goog.ui.SplitBehavior.CSS_CLASS);
  this.first_.render(element);
  this.second_.render(element);
  this.collapseSides_(this.first_, this.second_);
  var activate = goog.isDefAndNotNull(opt_activate) ? !!opt_activate : true;
  this.element_ = element;
  this.setActive(activate);
  return this;
};
goog.ui.SplitBehavior.prototype.setActive = function(activate) {
  if (this.isActive_ == activate) {
    return;
  }
  this.isActive_ = activate;
  if (activate) {
    this.eventHandler_.listen(this.second_, this.eventType_, goog.bind(this.behaviorHandler_, this, this.first_));
  } else {
    this.eventHandler_.removeAll();
  }
};
goog.ui.SplitBehavior.prototype.disposeInternal = function() {
  this.setActive(false);
  goog.dispose(this.eventHandler_);
  if (this.disposeFirst_) {
    goog.dispose(this.first_);
  }
  if (this.disposeSecond_) {
    goog.dispose(this.second_);
  }
  goog.ui.SplitBehavior.superClass_.disposeInternal.call(this);
};
goog.ui.SplitBehavior.prototype.decorateChildren_ = function(element) {
  var childNodes = element.childNodes;
  var len = childNodes.length;
  var finished = false;
  for (var i = 0;i < len && !finished;i++) {
    var child = childNodes[i];
    if (child.nodeType == goog.dom.NodeType.ELEMENT) {
      if (!this.first_) {
        this.first_ = (goog.ui.decorate(child));
      } else {
        if (!this.second_) {
          this.second_ = (goog.ui.decorate(child));
          finished = true;
        }
      }
    }
  }
};
goog.ui.SplitBehavior.prototype.collapseSides_ = function(first, second) {
  if (goog.isFunction(first.setCollapsed) && goog.isFunction(second.setCollapsed)) {
    first.setCollapsed(goog.ui.ButtonSide.END);
    second.setCollapsed(goog.ui.ButtonSide.START);
  }
};
goog.ui.registry.setDecoratorByClassName(goog.ui.SplitBehavior.CSS_CLASS, function() {
  return new goog.ui.SplitBehavior(null, null);
});
goog.provide("pear.ui.HeaderRowRenderer");
goog.require("pear.ui.RowRenderer");
pear.ui.HeaderRowRenderer = function() {
  pear.ui.RowRenderer.call(this);
};
goog.inherits(pear.ui.HeaderRowRenderer, pear.ui.RowRenderer);
goog.addSingletonGetter(pear.ui.HeaderRowRenderer);
pear.ui.HeaderRowRenderer.CSS_CLASS = goog.getCssName("pear-grid-row-header");
pear.ui.HeaderRowRenderer.prototype.getCssClass = function() {
  return pear.ui.HeaderRowRenderer.CSS_CLASS;
};
goog.provide("pear.ui.HeaderRow");
goog.require("pear.ui.HeaderRowRenderer");
goog.require("pear.ui.Row");
goog.require("goog.ui.SplitBehavior");
goog.require("goog.ui.MenuButton");
goog.require("goog.ui.MenuItem");
goog.require("goog.ui.Menu");
pear.ui.HeaderRow = function(grid, height, opt_orientation, opt_renderer, opt_domHelper) {
  pear.ui.Row.call(this, grid, height, goog.ui.Container.Orientation.HORIZONTAL, pear.ui.HeaderRowRenderer.getInstance(), opt_domHelper);
};
goog.inherits(pear.ui.HeaderRow, pear.ui.Row);
pear.ui.HeaderRow.prototype.addCell = function(cell, opt_render) {
  pear.ui.HeaderRow.superClass_.addCell.call(this, cell, true);
};
pear.ui.HeaderRow.prototype.disposeInternal = function() {
  pear.ui.HeaderRow.superClass_.disposeInternal.call(this);
};
pear.ui.HeaderRow.prototype.enterDocument = function() {
  pear.ui.HeaderRow.superClass_.enterDocument.call(this);
};
/*

 Distributed under - The MIT License (MIT).

 Copyright (c) 2014  Jyoti Deka
 dekajp{at}gmail{dot}com
 http://github.com/dekajp/google-closure-grid

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 version 0.1

*/
goog.provide("pear.ui.Grid");
goog.provide("pear.ui.Grid.GridDataCellEvent");
goog.provide("pear.ui.Grid.GridHeaderCellEvent");
goog.require("goog.Timer");
goog.require("pear.data.DataModel");
goog.require("pear.ui.Header");
goog.require("pear.ui.Body");
goog.require("pear.ui.BodyCanvas");
goog.require("pear.ui.DataCell");
goog.require("pear.ui.DataRow");
goog.require("pear.ui.FooterRow");
goog.require("pear.ui.HeaderCell");
goog.require("pear.ui.HeaderRow");
goog.require("pear.data.DataView");
goog.require("pear.ui.Plugable");
goog.require("pear.plugin.Pager");
goog.require("pear.plugin.FooterStatus");
goog.require("pear.plugin.HeaderMenu");
pear.ui.Grid = function(opt_domHelper) {
  goog.ui.Component.call(this);
  this.dom_ = opt_domHelper || goog.dom.getDomHelper();
  this.previousScrollTop_ = 0;
  this.renderedDataRows_ = [];
  this.renderedDataRowsCache_ = [];
  this.scrollbarWidth_ = goog.style.getScrollbarWidth();
};
goog.inherits(pear.ui.Grid, goog.ui.Component);
pear.ui.Grid.ScrollDirection = {UP:1, DOWN:2, LEFT:3, RIGHT:4, NONE:0};
pear.ui.Grid.SortDirection = {NONE:0, ASC:1, DESC:2};
pear.ui.Grid.prototype.Configuration_ = {Width:500, Height:600, RowHeight:25, RowHeaderHeight:30, RowFooterHeight:20, ColumnWidth:125, PageSize:50, AllowSorting:true, AllowPaging:true, AllowColumnResize:true, AllowColumnHeaderMenu:true};
pear.ui.Grid.EventType = {BEFORE_SORT:"before-sort", AFTER_SORT:"after-sort", BEFORE_PAGING:"before-paging", AFTER_PAGING:"after-paging", HEADER_CELL_MENU_CLICK:"headercell-menu-click", DATACELL_BEFORE_CLICK:"datacell-before-click", DATACELL_AFTER_CLICK:"datacell-after-click"};
pear.ui.Grid.prototype.headerRow_ = null;
pear.ui.Grid.prototype.body_ = null;
pear.ui.Grid.prototype.dataRows_ = null;
pear.ui.Grid.prototype.plugins_ = null;
pear.ui.Grid.prototype.width_ = null;
pear.ui.Grid.prototype.height_ = null;
pear.ui.Grid.prototype.sortColumnIndex_ = null;
pear.ui.Grid.prototype.currentPageIndex_ = null;
pear.ui.Grid.prototype.getConfiguration = function() {
  return this.Configuration_;
};
pear.ui.Grid.prototype.getColumnsDataModel = function() {
  var cols;
  var dv = this.getDataView();
  cols = dv.getColumns();
  return cols;
};
pear.ui.Grid.prototype.getBody = function() {
  return this.body_;
};
pear.ui.Grid.prototype.getDataRows = function() {
  this.dataRows_ = this.dataRows_ || [];
  return this.dataRows_;
};
pear.ui.Grid.prototype.getPlugins = function() {
  this.plugins_ = this.plugins_ || [];
  return this.plugins_;
};
pear.ui.Grid.prototype.getWidth = function() {
  this.width_ = this.width_ || this.Configuration_.Width;
  return this.width_;
};
pear.ui.Grid.prototype.getHeight = function() {
  this.height_ = this.height_ || this.Configuration_.Height;
  return this.height_;
};
pear.ui.Grid.prototype.setWidth = function(width) {
  return this.width_ = width;
};
pear.ui.Grid.prototype.setHeight = function(height) {
  return this.height_ = height;
};
pear.ui.Grid.prototype.getColumnWidth = function(index) {
  var coldata = this.getColumnsDataModel();
  coldata[index]["width"] = coldata[index]["width"] || this.Configuration_.ColumnWidth;
  return coldata[index]["width"];
};
pear.ui.Grid.prototype.setColumnWidth = function(index, width, opt_render) {
  var coldata = this.getColumnsDataModel();
  coldata[index]["width"] = width || this.Configuration_.ColumnWidth;
  var headerCell = this.headerRow_.getChildAt(index);
  if (opt_render && headerCell) {
    headerCell.setCellWidth(width);
    headerCell.draw();
  }
};
pear.ui.Grid.prototype.getScrollbarWidth = function() {
  return this.scrollbarWidth_;
};
pear.ui.Grid.prototype.getDataView = function() {
  return this.getModel();
};
pear.ui.Grid.prototype.getRowCount = function() {
  return this.getModel().getRowCount();
};
pear.ui.Grid.prototype.getHeaderRow = function() {
  return this.headerRow_;
};
pear.ui.Grid.prototype.getFooterRow = function() {
  return this.footerRow_;
};
pear.ui.Grid.prototype.getSortColumnIndex = function() {
  this.sortColumnIndex_ = this.sortColumnIndex_ || -1;
  return this.sortColumnIndex_;
};
pear.ui.Grid.prototype.getCurrentPageIndex = function() {
  this.currentPageIndex_ = this.currentPageIndex_ || 0;
  return this.currentPageIndex_;
};
pear.ui.Grid.prototype.setSortColumnIndex = function(n) {
  return this.sortColumnIndex_ = n;
};
pear.ui.Grid.prototype.setPageIndex = function(index) {
  var evt = new goog.events.Event(pear.ui.Grid.EventType.BEFORE_PAGING, this);
  this.dispatchEvent(evt);
  this.currentPageIndex_ = index;
  this.getDataView().setPageIndex(index);
  var evt = new goog.events.Event(pear.ui.Grid.EventType.AFTER_PAGING, this);
  this.dispatchEvent(evt);
  this.refresh();
};
pear.ui.Grid.prototype.getPageIndex = function() {
  return this.currentPageIndex_;
};
pear.ui.Grid.prototype.getSortedHeaderCell = function() {
  return this.getHeaderRow().getChildAt(this.getSortColumnIndex());
};
pear.ui.Grid.prototype.setDataView = function(dv) {
  this.setModel(dv);
  dv.setGrid(this);
  this.prepareControlHierarchy_();
};
pear.ui.Grid.prototype.addPlugin = function(plugin) {
  var plugins = this.getPlugins();
  plugins.push(plugin);
};
pear.ui.Grid.prototype.pluginShow_ = function() {
  goog.array.forEach(this.getPlugins(), function(plugin) {
    plugin.show(this);
  }, this);
};
pear.ui.Grid.prototype.setConfiguration = function(config) {
  goog.object.forEach(config, function(value, key) {
    this.Configuration_[key] = value;
  }, this);
  return this.Configuration_;
};
pear.ui.Grid.prototype.prepareControlHierarchy_ = function() {
  this.createDom();
};
pear.ui.Grid.prototype.createDom = function() {
  pear.ui.Grid.superClass_.createDom.call(this);
  var elem = this.getElement();
  goog.dom.classes.set(elem, "pear-grid");
};
pear.ui.Grid.prototype.enterDocument = function() {
  pear.ui.Grid.superClass_.enterDocument.call(this);
  this.renderGrid_();
  this.pluginShow_();
};
pear.ui.Grid.prototype.disposeInternal = function() {
  this.previousScrollTop_ = null;
  this.renderedDataRows_ = null;
  this.renderedDataRowsCache_ = null;
  goog.array.forEach(this.getPlugins(), function(value) {
    value.dispose();
  });
  this.plugins_ = null;
  this.headerRow_.dispose();
  this.headerRow_ = null;
  goog.array.forEach(this.getDataRows(), function(value) {
    value.dispose();
  });
  this.dataRows_ = null;
  this.body_.dispose();
  this.body_ = null;
  this.bodyCanvas_.dispose();
  this.bodyCanvas_ = null;
  if (this.footerRow_) {
    this.footerRow_.dispose();
  }
  this.footerRow_ = null;
  dv = this.getModel();
  dv.dispose();
  this.width_ = null;
  this.height_ = null;
  this.sortColumnIndex_ = null;
  this.currentPageIndex_ = null;
  this.previousScrollTop_ = null;
  this.bodyScrollTriggerDirection_ = null;
  this.previousScrollLeft_ = null;
  pear.ui.Grid.superClass_.disposeInternal.call(this);
};
pear.ui.Grid.prototype.renderGrid_ = function() {
  goog.style.setHeight(this.getElement(), this.height_);
  goog.style.setWidth(this.getElement(), this.width_);
  this.renderHeader_();
  this.renderBody_();
  if (this.Configuration_.AllowPaging) {
    this.setPageIndex(1);
    this.getDataView().setPageSize(this.Configuration_.PageSize);
  }
  this.prepareDataRows_();
  this.syncWidth_();
  this.draw_();
};
pear.ui.Grid.prototype.renderHeader_ = function() {
  this.header_ = new pear.ui.Header;
  this.addChild(this.header_, true);
  goog.style.setWidth(this.header_.getElement(), this.width_);
  this.createHeader_();
  this.registerEventsOnHeaderRow_();
  goog.style.setWidth(this.headerRow_.getElement(), this.headerRow_.getWidth());
};
pear.ui.Grid.prototype.createHeader_ = function() {
  this.headerRow_ = this.headerRow_ || new pear.ui.HeaderRow(this, this.Configuration_.RowHeaderHeight);
  this.header_.addChild(this.headerRow_, true);
  goog.style.setHeight(this.headerRow_.getElement(), this.Configuration_.RowHeaderHeight);
  this.createHeaderCells_();
};
pear.ui.Grid.prototype.createHeaderCells_ = function() {
  var coldata = this.getColumnsDataModel();
  goog.array.forEach(coldata, function(cell, index) {
    var headerCell = new pear.ui.HeaderCell;
    headerCell.setModel(cell);
    headerCell.setCellIndex(index);
    this.headerRow_.addCell(headerCell, true);
  }, this);
  var model = {id:"__scroll__", headerText:"", width:this.getScrollbarWidth(), datatype:pear.data.DataModel.DataType.NUMBER};
  var filler = goog.dom.createDom("div", "pear-grid-cell-header pear-grid-cell");
  goog.style.setWidth(filler, model.width);
  goog.dom.appendChild(this.headerRow_.getElement(), filler);
};
pear.ui.Grid.prototype.renderfooterRow_ = function() {
  this.footerRow_ = this.footerRow_ || new pear.ui.FooterRow(this, this.Configuration_.RowFooterHeight);
  this.addChild(this.footerRow_, true);
  this.registerEventsOnFooterRow_();
};
pear.ui.Grid.prototype.renderBody_ = function() {
  this.body_ = new pear.ui.Body;
  this.addChild(this.body_, true);
  goog.style.setHeight(this.body_.getElement(), this.height_ - this.headerRow_.getHeight());
  goog.style.setWidth(this.body_.getElement(), this.width_);
  this.bodyCanvas_ = new pear.ui.BodyCanvas;
  this.body_.addChild(this.bodyCanvas_, true);
  this.setCanvasHeight_();
  this.registerEventsOnBody_();
};
pear.ui.Grid.prototype.setCanvasHeight_ = function() {
  var height = 0;
  if (this.Configuration_.AllowPaging) {
    height = this.Configuration_.PageSize * this.Configuration_.RowHeight;
  } else {
    height = this.getRowCount() * this.Configuration_.RowHeight;
  }
  goog.style.setHeight(this.bodyCanvas_.getElement(), height);
};
pear.ui.Grid.prototype.syncWidth_ = function() {
  var width = this.headerRow_.getWidth();
  var bounds = goog.style.getBounds(this.getElement());
  width = width > bounds.width ? width : bounds.width;
  goog.style.setWidth(this.headerRow_.getElement(), width + this.getScrollbarWidth());
  goog.style.setWidth(this.bodyCanvas_.getElement(), width);
};
pear.ui.Grid.prototype.syncHeaderRow_ = function() {
  this.header_.getElement().scrollLeft = this.body_.getElement().scrollLeft;
};
pear.ui.Grid.prototype.prepareDataRows_ = function() {
  var dv = this.getDataView();
  var rows = dv.getRowViews();
  this.dataRows_ = [];
  goog.array.forEach(rows, function(value, index) {
    var row = new pear.ui.DataRow(this, this.Configuration_.RowHeight);
    row.setModel(value);
    row.setRowPosition(index);
    if (this.Configuration_.AllowPaging) {
      row.setLocationTop(index % this.Configuration_.PageSize * this.Configuration_.RowHeight);
    } else {
      row.setLocationTop(index * this.Configuration_.RowHeight);
    }
    this.dataRows_.push(row);
  }, this);
};
pear.ui.Grid.prototype.renderDataRowCells_ = function(row) {
  var model = row.getRowView().getRowData();
  var dv = this.getDataView();
  var columns = dv.getColumns();
  if (row.getChildCount() > 0) {
    row.removeChildren(true);
  }
  goog.array.forEach(columns, function(value, index) {
    var c = new pear.ui.DataCell;
    c.setModel(model[value.id]);
    c.setCellIndex(index);
    row.addCell(c, true);
  }, this);
  this.registerEventsOnDataRow_(row);
};
pear.ui.Grid.prototype.removeRowsFromRowModelCache_ = function(start, end) {
  for (var i in this.renderedDataRowsCache_) {
    if (i < start || i > end) {
      this.renderedDataRowsCache_[i].removeChildren(true);
      this.bodyCanvas_.removeChild(this.renderedDataRowsCache_[i], true);
      delete this.renderedDataRowsCache_[i];
    }
  }
};
pear.ui.Grid.prototype.refreshRenderRows_ = function() {
  var rowCount = this.getRowCount();
  var canvasVisibleBeginPx = this.body_.getElement().scrollTop > this.Configuration_.RowHeight * 10 ? this.body_.getElement().scrollTop - this.Configuration_.RowHeight * 10 : 0;
  var size = goog.style.getSize(this.body_.getElement());
  var canvasSize = goog.style.getSize(this.bodyCanvas_.getElement());
  var modulo = canvasVisibleBeginPx % this.Configuration_.RowHeight;
  canvasVisibleBeginPx = canvasVisibleBeginPx - modulo;
  var canvasVisibleEndPx = canvasVisibleBeginPx + size.height + this.Configuration_.RowHeight * 30;
  canvasVisibleEndPx = canvasVisibleEndPx > canvasSize.height ? canvasSize.height : canvasVisibleEndPx;
  var startIndex = 0, endIndex = 0;
  startIndex = parseInt(canvasVisibleBeginPx / this.Configuration_.RowHeight, 10);
  startIndex = startIndex < 0 ? 0 : startIndex;
  endIndex = parseInt(canvasVisibleEndPx / this.Configuration_.RowHeight, 10);
  endIndex = endIndex > rowCount ? rowCount : endIndex;
  var i = 0;
  for (i = startIndex;i < endIndex;i++) {
    if (!this.renderedDataRowsCache_[i]) {
      this.renderedDataRows_[i] = this.getDataRows()[i];
    }
  }
  this.removeRowsFromRowModelCache_(startIndex, endIndex);
};
pear.ui.Grid.prototype.bodyCanvasRender_ = function(opt_redraw) {
  var dv = this.getDataView();
  if (opt_redraw && this.bodyCanvas_.getChildCount() > 0) {
    this.bodyCanvas_.removeChildren(true);
  }
  goog.array.forEach(this.renderedDataRows_, function(datarow, index) {
    this.renderDataRowCells_(datarow);
    this.bodyCanvas_.addChild(datarow, true);
    this.renderedDataRowsCache_[index] = datarow;
  }, this);
  this.renderedDataRows_ = [];
};
pear.ui.Grid.prototype.draw_ = function() {
  this.refreshRenderRows_();
  this.bodyCanvasRender_();
  this.updateFooterMsg();
};
pear.ui.Grid.prototype.refresh = function() {
  this.renderedDataRowsCache_ = [];
  this.renderedDataRows_ = [];
  this.prepareDataRows_();
  this.refreshRenderRows_();
  this.bodyCanvasRender_(true);
};
pear.ui.Grid.prototype.setColumnResize = function(index, width) {
  var cell = this.headerRow_.getChildAt(index);
  var coldata = grid.getColumnsDataModel();
  var diff = width - coldata[index]["width"];
  this.setColumnWidth(index, coldata[index]["width"] + diff, true);
  goog.array.forEach(coldata, function(data, pos) {
    if (pos > index) {
      var c = this.headerRow_.getChildAt(pos);
      c.draw();
    }
  }, this);
  this.syncWidth_();
};
pear.ui.Grid.prototype.registerEventsOnHeaderRow_ = function() {
  this.forEachChild(function(cell) {
    if (this.Configuration_.AllowSorting) {
      this.getHandler().listen(cell, pear.ui.Cell.EventType.CLICK, this.handleHeaderCellClick_, false, this);
    }
    this.getHandler().listen(cell, pear.ui.Cell.EventType.OPTION_CLICK, this.handleHeaderCellOptionClick_, false, this);
  }, this);
};
pear.ui.Grid.prototype.registerEventsOnDataRow_ = function(row) {
  row.getHandler().listen(row.getElement(), goog.events.EventType.CLICK, this.handleDataCellClick_, false, this);
};
pear.ui.Grid.prototype.registerEventsOnFooterRow_ = function() {
  var pager = this.footerRow_.getPager();
  if (pager) {
    this.getHandler().listen(pager, pear.ui.Pager.EventType.CHANGE, this.handlePageChange_, false, this);
  }
};
pear.ui.Grid.prototype.registerEventsOnBody_ = function() {
  this.getHandler().listen(this.body_.getElement(), goog.events.EventType.SCROLL, this.handleBodyCanvasScroll_);
};
pear.ui.Grid.prototype.handleBodyCanvasScroll_ = function(e) {
  if (this.previousScrollTop_ <= this.body_.getElement().scrollTop) {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.DOWN;
  } else {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.UP;
  }
  if (this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.DOWN || this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.UP) {
    this.draw_();
  }
  if (this.previousScrollLeft_ <= this.body_.getElement().scrollLeft) {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.RIGHT;
  } else {
    this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.LEFT;
  }
  if (this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.LEFT || this.bodyScrollTriggerDirection_ === pear.ui.Grid.ScrollDirection.RIGHT) {
    this.syncHeaderRow_();
  }
  this.bodyScrollTriggerDirection_ = pear.ui.Grid.ScrollDirection.NONE;
  this.previousScrollTop_ = this.body_.getElement().scrollTop;
  if (e) {
    e.stopPropagation();
  }
};
pear.ui.Grid.prototype.handleHeaderCellClick_ = function(ge) {
  ge.stopPropagation();
  var headerCell = ge.target;
  var grid = ge.currentTarget;
  var prevSortedCell = this.getSortedHeaderCell();
  var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.BEFORE_SORT, this, headerCell);
  this.dispatchEvent(evt);
  if (prevSortedCell && prevSortedCell !== headerCell) {
    prevSortedCell.resetSortDirection();
  }
  headerCell.toggleSortDirection();
  var index = this.getHeaderRow().indexOfChild(headerCell);
  this.setSortColumnIndex(index);
  var dv = this.getDataView();
  dv.sort(headerCell.getModel());
  this.refresh();
  evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.AFTER_SORT, this, headerCell);
  this.dispatchEvent(evt);
};
pear.ui.Grid.prototype.handleHeaderCellOptionClick_ = function(ge) {
  ge.stopPropagation();
  var evt = new pear.ui.Grid.GridHeaderCellEvent(pear.ui.Grid.EventType.HEADER_CELL_MENU_CLICK, this, ge.target);
  this.dispatchEvent(evt);
};
pear.ui.Grid.prototype.handleDataCellClick_ = function(be) {
  be.stopPropagation();
  var control = this.getOwnerControl((be.target));
  var evt = new pear.ui.Grid.GridDataCellEvent(pear.ui.Grid.EventType.DATACELL_BEFORE_CLICK, this, control);
  this.dispatchEvent(evt);
  evt = new pear.ui.Grid.GridDataCellEvent(pear.ui.Grid.EventType.DATACELL_AFTER_CLICK, this, control);
  this.dispatchEvent(evt);
};
pear.ui.Grid.prototype.updateFooterMsg = function() {
};
pear.ui.Grid.GridDataCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);
  this.cell = cell;
};
goog.inherits(pear.ui.Grid.GridDataCellEvent, goog.events.Event);
pear.ui.Grid.GridHeaderCellEvent = function(type, target, cell) {
  goog.events.Event.call(this, type, target);
  this.cell = cell;
};
goog.inherits(pear.ui.Grid.GridHeaderCellEvent, goog.events.Event);

