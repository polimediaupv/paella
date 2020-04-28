/* base.js: some utility functions to complement jQuery library
	Copyright (c) 2012 Fernando Serrano Carpena
	fernando@vitaminew.com
	http://www.vitaminew.com/basejs
*/

/*
  Part 1:
  Class, version 2.7
  Copyright (c) 2006, 2007, 2008, Alex Arnell <alex@twologic.com>

  Redistribution and use in source and binary forms, with or without modification, are
  permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this list
	of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice, this
	list of conditions and the following disclaimer in the documentation and/or other
	materials provided with the distribution.
  * Neither the name of typicalnoise.com nor the names of its contributors may be
	used to endorse or promote products derived from this software without specific prior
	written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
  THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
  OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
  HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
  TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/*
	Class definition improved by Fernando Serrano Carpena to support C++ typed dynamic casting.
	// Default method, defined by Alex Arnell:
	var MyClass = Class.extend.apply(parent,{ class definition })

	// New method:
	Class.create("MyClass",parent,{ class definition })

	// Improvements
	// 	- automatic namespace creation:
	Class.create("myns.MyClass",myns.Parent, { class definition })

	//	- Dynamic casting:
	var instance = dynamic_cast("myns.MyClass",anObject);

	// You can also use:
	var MyClass = Class.create({ class definition })
	// or
	var MyClass = Class.create(parent, { class definition })
*/

var ClassBase = (function() {
  var __extending = {};

  return {
	extend: function(parent, def) {
	  if (arguments.length == 1) { def = parent; parent = null; }
	  var func = function() {
		if (arguments[0] ==  __extending) { return; }
		if (!this.initialize) {
			this.initialize = function() {}
		}
		this.initialize.apply(this, arguments);
	  };
	  if (typeof(parent) == 'function') {
		func.prototype = new parent( __extending);
	  }
	  var mixins = [];
	  if (def && def.include) {
		if (def.include.reverse) {
		  // methods defined in later mixins should override prior
		  mixins = mixins.concat(def.include.reverse());
		} else {
		  mixins.push(def.include);
		}
		delete def.include; // clean syntax sugar
	  }
	  if (def) ClassBase.inherit(func.prototype, def);
	  for (var i = 0; (mixin = mixins[i]); i++) {
		ClassBase.mixin(func.prototype, mixin);
	  }
	  return func;
	},
	mixin: function (dest, src, clobber) {
	  clobber = clobber || false;
	  if (typeof(src) != 'undefined' && src !== null) {
		for (var prop in src) {
		  if (clobber || (!dest[prop] && typeof(src[prop]) == 'function')) {
			dest[prop] = src[prop];
		  }
		}
	  }
	  return dest;
	},
	inherit: function(dest, src, fname) {
	  if (arguments.length == 3) {
		var ancestor = dest[fname], descendent = src[fname], method = descendent;
		descendent = function() {
		  var ref = this.parent; this.parent = ancestor;
		  var result = method.apply(this, arguments);
		  ref ? this.parent = ref : delete this.parent;
		  return result;
		};
		// mask the underlying method
		descendent.valueOf = function() { return method; };
		descendent.toString = function() { return method.toString(); };
		dest[fname] = descendent;
	  } else {
		for (var prop in src) {
		  if (dest[prop] && typeof(src[prop]) == 'function') {
			ClassBase.inherit(dest, src, prop);
		  } else {
			dest[prop] = src[prop];
		  }
		}
	  }
	  return dest;
	},
	singleton: function() {
	  var args = arguments;
	  if (args.length == 2 && args[0].getInstance) {
		var klass = args[0].getInstance(__extending);
		// we're extending a singleton swap it out for it's class
		if (klass) { args[0] = klass; }
	  }

	  return (function(args){
		// store instance and class in private variables
		var instance = false;
		var klass = ClassBase.extend.apply(args.callee, args);
		return {
		  getInstance: function () {
			if (arguments[0] == __extending) return klass;
			if (instance) return instance;
			return (instance = new klass());
		  }
		};
	  })(args);
	}
  };
})();

// New method
ClassBase.create = function() {
  return ClassBase.extend.apply(this, arguments);
};

function Class_createNamespace(nsAndClass) {
	var nsArray = nsAndClass.split(".");
	nsArray.pop();	// Remove the class name
	var ns = null;
	if (nsArray.length>0) {
		for (var i=0;i<nsArray.length;++i) {
			var name = nsArray[i];
			if (ns) {
				if (ns[name]==undefined) {
					ns[name] = {}
					ns = ns[name];
				}
				else {
					ns = ns[name];
				}
			}
			else {
				if (window[name]==undefined) {
					window[name] = {}
					ns = window[name];
				}
				else {
					ns = window[name];
				}
			}
		}
	}

	if (ns) {
		return ns;
	}
	else {
		return window;
	}
}

function Class_getClassName(nsAndClass) {
	return nsAndClass.split(".").pop();
}

function Class(a,b,c) {
	if (typeof(a)=='object' && !b) {
		return ClassBase.create(a);
	}
	else if (typeof(a)=='function' && typeof(b)=='object' && !c) {
		return ClassBase.create(a,b);
	}
	else if (typeof(a)=='string' && typeof(b)=='object' && !c) {
		// a es el nombre de la clase con su NS, y b es la definición
		var ns = Class_createNamespace(a);
		var cn = Class_getClassName(a);
		b[a] = true;
		ns[cn] = ClassBase.create(b);
		return ns[cn];
	}
	else if (typeof(a)=='string' && typeof(b)=='function' && typeof(c)=='object') {
		// a es el nombre de la clase con su NS, b es el padre y c es la definición
		var ns = Class_createNamespace(a);
		var cn = Class_getClassName(a);
		c[a] = true;
		ns[cn] = ClassBase.create(b,c);
		return ns[cn];
	}
}

Class.create = function() {
	return ClassBase.extend.apply(this, arguments);
}

function dynamic_cast(type,object) {
	return (object && object[type]) ? object:null;
}

Class.fromString = function(str) {
  var arr = str.split(".");

  var fn = (window || this);
  for (var i = 0, len = arr.length; i < len; i++) {
    fn = fn[arr[i]];
  }

  if (typeof fn !== "function") {
    throw new Error("function not found");
  }

  return fn;
};


/* Part 2: javascript extension */
Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] == obj) {
			return true;
		}
	}
	return false;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

String.prototype.trim = function () {
	return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

/* Part 3: base.js library */
var base = {};

base.require = function(libraryName) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = libraryName;
    document.getElementsByTagName('head')[0].appendChild(script);
}

base.importStylesheet = function(stylesheetFile) {
	var link = document.createElement('link');
	link.setAttribute("rel","stylesheet");
	link.setAttribute("href",stylesheetFile);
	link.setAttribute("type","text/css");
	link.setAttribute("media","screen");
	document.getElementsByTagName('head')[0].appendChild(link);
}

// Deprecated
base.dom = {
	createElement: function(type,params,attributes) {
		if (!params) params = {};
		var elem = document.createElement(type);
		if (params.className) elem.className = params.className;
		if (params.id) elem.id = params.id;
		if (params.style) $(elem).css(params.style);
		if (params.innerHTML) elem.innerHTML = params.innerHTML;

		if (attributes) {
			for (var key in attributes) {
				var value = attributes[key];
				if (value===undefined) { value = "" }
				if (typeof(value)=='string') {
					value.trim();
				}

				elem.setAttribute(key,value);
			}
		}

		return elem;
	},

	fontSize:function(domElement) {
		var size = {size:0,units:'px'}
		var measure = $(domElement).css('font-size');
		if (/(\d+\.*\d*)(\D+)/.test(measure)) {
			size.size = RegExp.$1;
			size.units = RegExp.$2;
		}
		return size;
	},

	// Convert all measures in px into %, inside domNode.
	toPercent:function(domNode) {
		var baseSize = {w:$(domNode).width(),h:$(domNode).height()};

		for (var i=0;i<domNode.children.length;++i) {
			var child = domNode.children[i];
			var nodeSize = {x:$(child).position().left,y:$(child).position().top,w:$(child).width(),h:$(child).height()};

			child.originalSize = {fontSize:this.fontSize(child)}
			child.originalSize.x = nodeSize.x;
			child.originalSize.y = nodeSize.y;
			child.originalSize.w = nodeSize.w;
			child.originalSize.h = nodeSize.h;

			nodeSize.x = nodeSize.x * 100 / baseSize.w;
			nodeSize.y = nodeSize.y * 100 / baseSize.h;
			nodeSize.w = nodeSize.w * 100 / baseSize.w;
			nodeSize.h = nodeSize.h * 100 / baseSize.h;
			child.style.left	= nodeSize.x + '%';
			child.style.top		= nodeSize.y + '%';
			child.style.width	= nodeSize.w + '%';
			child.style.height	= nodeSize.h + '%';
			//console.log(nodeSize);
		}
	},

	prepareToScaleTexts:function(domNode) {
		for (var i=0;i<domNode.children.length;++i) {
			var child = domNode.children[i];
			var nodeSize = {x:$(child).position().left,y:$(child).position().top,w:$(child).width(),h:$(child).height()};

			child.originalSize = {fontSize:this.fontSize(child)}
			child.originalSize.x = nodeSize.x;
			child.originalSize.y = nodeSize.y;
			child.originalSize.w = nodeSize.w;
			child.originalSize.h = nodeSize.h;
		}
	},

	scaleTexts:function(domNode) {
		for (var i=0;i<domNode.children.length;++i) {
			var child = domNode.children[i];
			var nodeSize = {x:$(child).position().left,
							y:$(child).position().top,
							w:$(child).width(),
							h:$(child).height()};

			var originalSize = child.originalSize;

			if (!originalSize) {
				paella.log.debug("base.dom.scaleTexts(): domNode could not be scaled. Original element size not found.");
				return;
			}

			var scaleFactor = nodeSize.w / originalSize.w;
			var fontSize = originalSize.fontSize.size * scaleFactor;
			child.style.fontSize = fontSize + originalSize.fontSize.units;
		}
	},

	proportionalSize: function(domElement,width,height,animate) {
		var parent = domElement.parentNode;
		var parentSize = {w:$(parent).width(),h:$(parent).height()};
		var parentRatio = parentSize.w/parentSize.h;
		var childRatio = width / height;
		var finalWidth = parentSize.w;
		var finalHeight = parentSize.h;
		var marginTop = "";

		// DEBUG: coloreamos el fondo para ver que pasa
		//domElement.style.backgroundColor = "blue";
		if (parentRatio>childRatio) {
			finalWidth = finalHeight * childRatio;
		}
		else {
		 	finalHeight = finalWidth / childRatio;
		 	var margin = (parentSize.h - finalHeight) / 2;
		 	marginTop = margin + "px";
		}

		if (animate) {
			$(domElement).animate({'width':finalWidth + 'px','height':finalHeight + 'px',marginTop:marginTop});
		}
		else {
			$(domElement).css({'width':finalWidth + 'px','height':finalHeight + 'px',marginTop:marginTop});
		}
	}
}

// This class requires jquery
base.ajax = {
	// onSuccess/onFail(data,type,returnCode,rawData)
	send:function(type,params,onSuccess,onFail) {
		this.assertParams(params);

		var ajaxObj = jQuery.ajax({
			url:params.url,
			data:params.params,
			type:type
		});

		if (typeof(onSuccess)=='function') {
			ajaxObj.done(function(data,textStatus,jqXHR) {
				var contentType = jqXHR.getResponseHeader('content-type')
				onSuccess(data,contentType,jqXHR.status,jqXHR.responseText);
			});
		}

		if (typeof(onFail)=='function') {
			ajaxObj.fail(function(jqXHR,textStatus,error) {
				onFail(textStatus + ' : ' + error,'text/plain',jqXHR.status,jqXHR.responseText);
			});
		}
	},

	assertParams:function(params) {
		if (!params.url) throw new Error("base.ajax.send: url parameter not found");
		if (!params.params) params.params = {}
	}
}

base.ajax["get"] = function(params,onSuccess,onFail) {
	base.ajax.send('get',params,onSuccess,onFail);
}

base.ajax["post"] = function(params,onSuccess,onFail) {
	base.ajax.send('post',params,onSuccess,onFail);
}

base.ajax["put"] = function(params,onSuccess,onFail) {
	base.ajax.send('put',params,onSuccess,onFail);
}

base.ajax["delete"] = function(params,onSuccess,onFail) {
	base.ajax.send('delete',params,onSuccess,onFail);
}

Class ("base.AsyncLoaderCallback", {
	name:"",
	prevCb:null,
	nextCb:null,
	loader:null,

	initialize:function(name) {
		this.name = name;
	},

	load:function(onSuccess,onError) {
		onSuccess();
		// If error: onError()
	}
});

Class ("base.AjaxCallback", base.AsyncLoaderCallback,{
	params:null,
	type:'get',

	data:null,
	mimeType:null,
	statusCode:null,
	rawData:null,

	getParams:function() {
		return this.params;
	},

	willLoad:function(callback) {

	},

	didLoadSuccess:function(callback) {
		return true;
	},

	didLoadFail:function(callback) {
		return false;
	},

	initialize:function(params,type) {
		this.name = "ajaxCallback";
		if (type) this.type = type;
		if (typeof(params)=='string') this.params = {url:params}
		else if (typeof(params)=='object') this.params = params;
		else this.params = {}
	},

	load:function(onSuccess,onError) {
		var This = this;
		if (typeof(this.willLoad)=='function') this.willLoad(this);
		base.ajax.send(this.type,this.getParams(),
			function(data,type,code,rawData) {
				var status = true;
				This.data = data;
				This.mimeType = type;
				This.statusCode = code;
				This.rawData = rawData;
				if (typeof(This.didLoadSuccess)=='function') status = This.didLoadSuccess(This);
				if (status) onSuccess();
				else onError();
			},
			function(data,type,code,rawData) {
				var status = false;
				This.data = data;
				This.mimeType = type;
				This.statusCode = code;
				This.rawData = rawData;
				if (typeof(This.didLoadFail)=='function') status = This.didLoadFail(This);
				if (status) onSuccess();
				else onError();
			});
	}
});

Class ("base.JSONCallback", base.AjaxCallback, {
	initialize:function(params,type) { this.parent(params,type); },

	didLoadSuccess:function(callback) {
		if (typeof(callback.data)=='object') return true;

		try {
			callback.data = JSON.parse(callback.data);
			return true;
		}
		catch (e) {
			callback.data = {error:"Unexpected data format",data:callback.data}
			return false;
		}
	}
});

Class ("base.DictionaryCallback", base.AjaxCallback,{
	initialize:function(dictionaryUrl) { this.parent({url:dictionaryUrl}); },

	getParams:function() {
		var lang = base.dictionary.currentLanguage();
		this.params.url = this.params.url + '_' + lang + '.json';
		return this.params;
	},

	didLoadSuccess:function(callback) {
		if (typeof(callback.data)=="string") {
			try {
				callback.data = JSON.parse(callback.data);
			}
			catch (e) {
				return false;
			}
		}
		base.dictionary.addDictionary(callback.data);
		return true;
	},

	didLoadFail:function(callback) {
		return true;
	}
})

Class ("base.AsyncLoader", {
	firstCb:null,
	lastCb:null,
	callbackArray:null,
	generatedId:0,

	continueOnError:false,
	errorCallbacks:null,

	currentCb:null,

	clearError:function() {
		this.errorCallbacks = [];
	},

	initialize:function() {
		this.callbackArray = {};
		this.errorCallbacks = [];
		this.generatedId = 0;
	},

	addCallback:function(cb,name) {
		if (!name) {
			name = "callback_" + this.generatedId++;
		}
		cb.__cbName__ = name;
		this.callbackArray[name] = cb;
		if (!this.firstCb) {
			this.firstCb = cb;
			this.currentCb = cb;
		}
		cb.prevCb = this.lastCb;
		if (this.lastCb) this.lastCb.nextCb = cb;
		this.lastCb = cb;
		cb.loader = this;
		return cb;
	},

	getCallback:function(name) {
		return this.callbackArray[name];
	},

	load:function(onSuccess,onError) {
		var This = this;
		if (this.currentCb) {
			this.currentCb.load(function() {
				This.onComplete(This.currentCb,This.currentCb.__cbName__,true);
				This.currentCb = This.currentCb.nextCb;
				This.load(onSuccess,onError);
			},
			function() {
				This.onComplete(This.currentCb,This.currentCb.__cbName__,false);
				if (This.continueOnError) {
					This.errorCallbacks.push(This.currentCb);
					This.currentCb = This.currentCb.nextCb;
					This.load(onSuccess,onError);
				}
				else if (typeof(onError)=='function') {
					onError();
				}
			});
		}
		else if (typeof(onSuccess)=='function') {
			onSuccess();
		}
	},

	onComplete:function(callback,cbName,status) {

	}
});

Class ("base.Dictionary", {
	dictionary:{},

	initialize:function() {

	},

	addDictionary:function(dict) {
		for (var key in dict) {
			this.dictionary[key] = dict[key];
		}
	},

	translate:function(key) {
		var value = base.dictionary.dictionary[key];
		if (value) return value;
		else return key;
	},

	currentLanguage:function() {
		var lang = navigator.language || window.navigator.userLanguage;
		return lang.substr(0, 2).toLowerCase();
	}
});

base.dictionary = new base.Dictionary();

base.types = {
	parseNumber:function(num) {
		return parseFloat(num);
	},

	parseBoolean:function(num) {
		return /^true$/i.test(num) || /^1$/i.test(num) || /^yes$/.test(num);
	},

	parseDictionary:function(num) {
		try {
			return JSON.parse(num);
		}
		catch (e) {
			return null;
		}
	}
}

base.uuid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
}

base.imgBase64 = function(url) {
	var img = new Image();
	img.onload = function(event) {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = event.srcElement.width;
		canvas.height = event.srcElement.height;
		ctx.drawImage(event.srcElement,0,0);
		var dataUrl = canvas.toDataURL('image/png');
		event.srcElement.onload = null;
		event.srcElement.src = dataUrl;
		canvas = null;
	};
	img.src = url;
	return img;
}
