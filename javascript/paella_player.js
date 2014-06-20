/*
	Paella HTML 5 Multistream Player
	Copyright (C) 2013  Universitat Politècnica de València

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var GlobalParams = {
	video:{zIndex:1},
	background:{zIndex:0}
};


var paella = {};
paella.player = null;

paella.debug = {
	init:false,
	debug:false,

	log:function(msg) {
		if (!this.init) {
			this.debug = /debug/.test(location.href);
			this.init = true;
		}
		if (this.debug) {
			console.log(msg);
		}
	}
}

paella.pluginList = [
	'usertracking_collector.js',
	'usertracking_googleanalytics_saver.js',
	'framecontrol.js',
	'playbutton.js',
	'viewmode.js',
	'basic_editor_plugins.js',
	'repeatbutton.js',
	'extended_profiles.js',
	'trimming.js',
	'annotations.js',
	'social.js',
	'fullscreenbutton.js',
	'caption_editor.js',
	'break.js',
	'comments.js',
	'description.js',
	'footprints.js',
	'videoload_test.js',
	'qualities.js',
	'show_editor.js',
	'snapshots_editor.js'
];

paella.events = {
	play:"paella:play",
	pause:"paella:pause",
	next:"paella:next",
	previous:"paella:previous",
	seeking:"paella:seeking",
	seeked:"paella:seeked",
	timeupdate:"paella:timeupdate",
	timeUpdate:"paella:timeupdate",
	seekTo:"paella:setseek",
	endVideo:"paella:endvideo",
	seekToFrame:"paella:seektotime",	// deprecated, use seekToTime instead
	seekToTime:"paella:seektotime",
	setTrim:"paella:settrim",
	showEditor:"paella:showeditor",
	hideEditor:"paella:hideeditor",
	setPlaybackRate:"paella:setplaybackrate",
	setVolume:'paella:setVolume',
	setComposition:'paella:setComposition',
	loadStarted:'paella:loadStarted',
	loadComplete:'paella:loadComplete',
	loadPlugins:'paella:loadPlugins',
	error:'paella:error',
	setProfile:'paella:setprofile',
	documentChanged:'paella:documentChanged',
	didSaveChanges:'paella:didsavechanges',
	controlBarWillHide:'paella:controlbarwillhide',
	controlBarDidShow:'paella:controlbardidshow',
	///beforeUnload:'paella:beforeUnload',		This event has been removed because it not work properly in any browser
	hidePopUp:'paella:hidePopUp',
	showPopUp:'paella:showPopUp',
	userTracking:'paella:userTracking',

	trigger:function(event,params) { $(document).trigger(event,params); },
	bind:function(event,callback) { $(document).bind(event,function(event,params) { callback(event,params);}) ;}
};



paella.AsyncLoaderCallback = Class.create({
	name:"",
	prevCb:null,
	nextCb:null,
	loader:null,

	initialize:function(name) {
		this.name = name;
	},

	load:function(onSuccess,onError) {
		paella.debug.log("loading " + this.name);
		onSuccess();
		// If error: onError()
	}
});

paella.AjaxCallback = Class.create(paella.AsyncLoaderCallback,{
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
		paella.ajax.send(this.type,this.getParams(),
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

paella.JSONCallback = Class.create(paella.AjaxCallback,{
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

paella.DictionaryCallback = Class.create(paella.AjaxCallback,{
	initialize:function(dictionaryUrl) { this.parent({url:dictionaryUrl}); },

	getParams:function() {
		var lang = paella.utils.language();
		this.params.url = this.params.url + '_' + lang + '.json';
		return this.params;
	},

	didLoadSuccess:function(callback) {
		paella.dictionary.addDictionary(callback.data);
		return true;
	},

	didLoadFail:function(callback) {
		return true;
	}
})

paella.AsyncLoader = Class.create({
	firstCb:null,
	lastCb:null,
	callbackArray:null,
	generatedId:0,

	currentCb:null,

	initialize:function() {
		this.callbackArray = {};
		this.generatedId = 0;
	},

	addCallback:function(cb,name) {
		if (!name) {
			name = "callback_" + this.generatedId++;
		}
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
				This.currentCb = This.currentCb.nextCb;
				This.load(onSuccess);
			},
			function() {
				if (typeof(onError)=='function') onError();
			});
		}
		else if (typeof(onSuccess)=='function') {
			onSuccess();
		}
	}
});

paella.Dictionary = Class.create({
	dictionary:{},

	initialize:function() {

	},

	addDictionary:function(dict) {
		for (var key in dict) {
			this.dictionary[key] = dict[key];
		}
	},

	translate:function(key) {
		var value = this.dictionary[key];
		if (value) return value;
		else return key;


	}
});

paella.dictionary = new paella.Dictionary();

paella.ajax = base.ajax;

// Deprecated: use paella.ajax.get/post/delete/put...
paella.Ajax = Class.create({
	callback:null,

	// Params:
	//	url:http://...
	//	data:{param1:'param1',param2:'param2'...}
	// 	onSuccess:function(response)
	initialize:function(url,params,onSuccess,proxyUrl,useJsonp,method) {
		paella.debug.log("WARNING: paella.Ajax() is deprecated, use base.ajax.get/paella.ajax.post/paella.ajax.delete/paella.ajax.put instead.");
		var thisClass = this;
		this.callback = onSuccess;
		var thisClass = this;
		if (!method) method = 'get';
		if (useJsonp) {
            jQuery.ajax({url:url,type:method,dataType:'jsonp', jsonp:'jsonp', jsonpCallback:'callback', data:params,cache:false}).always(function(data) {
				//paella.debug.log('using jsonp');
				thisClass.callCallback(data);
			});
		}
		else if (proxyUrl && proxyUrl!="") {
			params.url = url;
			jQuery.ajax({url:proxyUrl,type:method,data:params,cache:false}).always(function(data) {
				//paella.debug.log('using AJAX');
				thisClass.callCallback(data);
			});
		}
		else {
			jQuery.ajax({url:url,type:method,data:params,cache:false}).always(function(data) {
				//paella.debug.log('using AJAX whithout proxy');
				thisClass.callCallback(data);
			});
		}
	},

	callCallback:function(data) {
		if (this.callback && data!=null) {
			if (typeof(data)=="object" && data.responseText) {
				this.callback(data.responseText);
			}
			else {
				this.callback(data);
			}
		}
		else if (this.callback) {
			this.callback('{"result":"ok"}');
		}
	}
});

paella.Timer = Timer;	// base.js Timer

paella.utils = {
	ajax:paella.ajax,

	cookies:{
		set:function(name,value) {
			document.cookie = name + "=" + value;
		},

		get:function(name) {
			var i,x,y,ARRcookies=document.cookie.split(";");
			for (i=0;i<ARRcookies.length;i++) {
				x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
				y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
				x=x.replace(/^\s+|\s+$/g,"");
				if (x==name) {
					return unescape(y);
				}
			}
		}
	},

	parameters:{
		list:null,

		parse:function() {
			if (!this.list) {
				var url = window.location.href;
				if (/https?:\/\/([a-z0-9.\-_\/\~:]*\?)([a-z0-9.\/\-_\%\=\&]*)\#*/i.test(url)) {
					var params = RegExp.$2;
					var paramArray = params.split('&');
					this.list = {}
					for (var i=0; i<paramArray.length;++i) {
						var keyValue = paramArray[i].split('=');
						var key = keyValue[0]
						var value = keyValue.length==2 ? keyValue[1]:'';
						this.list[key] = value;
					}
				}
				else {
					this.list = []
				}
			}
		},

		get:function(parameter) {
			return this.list[parameter];
		}
	},

    require: function(libraryName) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = libraryName;
        document.getElementsByTagName('head')[0].appendChild(script);
    },

    importStylesheet:function(stylesheetFile) {
    	var link = document.createElement('link');
    	link.setAttribute("rel","stylesheet");
    	link.setAttribute("href",stylesheetFile);
    	link.setAttribute("type","text/css");
    	link.setAttribute("media","screen");
    	document.getElementsByTagName('head')[0].appendChild(link);
    },

	// Deprecated. Use paella.Timer instead
	Timer: Class.create({
		timerId:0,
		callback:null,
		params:null,
		jsTimerId:0,
		repeat:false,
		timeout:0,

		initialize:function(callback,time,params) {
			this.callback = callback;
			this.params = params;
			timerManager.setupTimer(this,time);
		},

		cancel:function() {
			clearTimeout(this.jsTimerId);
		}
	}),

	timeParse:{
		secondsToTime:function(seconds) {
			var hrs = ~~ (seconds / 3600);
			if (hrs<10) hrs = '0' + hrs;
			var mins = ~~ ((seconds % 3600) / 60);
			if (mins<10) mins = '0' + mins;
			var secs = Math.floor(seconds % 60);
			if (secs<10) secs = '0' + secs;
			return hrs + ':' + mins + ':' + secs;
		},
		secondsToText:function(secAgo) {
			// Seconds
			if (secAgo <= 1) {
				return paella.dictionary.translate("1 second ago")
			}
			if (secAgo < 60) {
				return paella.dictionary.translate("{0} seconds ago").replace(/\{0\}/g, secAgo);
			}
			// Minutes
			var minAgo = Math.round(secAgo/60);
			if (minAgo <= 1) {
				return paella.dictionary.translate("1 minute ago");
			}
			if (minAgo < 60) {
				return paella.dictionary.translate("{0} minutes ago").replace(/\{0\}/g, minAgo);
			}
			//Hours
			var hourAgo = Math.round(secAgo/(60*60));
			if (hourAgo <= 1) {
				return paella.dictionary.translate("1 hour ago");
			}
			if (hourAgo < 24) {
				return paella.dictionary.translate("{0} hours ago").replace(/\{0\}/g, hourAgo);
			}
			//Days
			var daysAgo = Math.round(secAgo/(60*60*24));
			if (daysAgo <= 1) {
				return paella.dictionary.translate("1 day ago");
			}
			if (daysAgo < 24) {
				return paella.dictionary.translate("{0} days ago").replace(/\{0\}/g, daysAgo);
			}
			//Months
			var monthsAgo = Math.round(secAgo/(60*60*24*30));
			if (monthsAgo <= 1) {
				return paella.dictionary.translate("1 month ago");
			}
			if (monthsAgo < 12) {
				return paella.dictionary.translate("{0} months ago").replace(/\{0\}/g, monthsAgo);
			}
			//Years
			var yearsAgo = Math.round(secAgo/(60*60*24*365));
			if (yearsAgo <= 1) {
				return paella.dictionary.translate("1 year ago");
			}
			return paella.dictionary.translate("{0} years ago").replace(/\{0\}/g, yearsAgo);
		},
		matterhornTextDateToDate: function(mhdate) {
			var d = new Date();
			d.setFullYear(parseInt(mhdate.substring(0, 4), 10));
			d.setMonth(parseInt(mhdate.substring(5, 7), 10) - 1);
			d.setDate(parseInt(mhdate.substring(8, 10), 10));
			d.setHours(parseInt(mhdate.substring(11, 13), 10));
			d.setMinutes(parseInt(mhdate.substring(14, 16), 10));
			d.setSeconds(parseInt(mhdate.substring(17, 19), 10));

			return d;
		}
	},

	language:function() {
		var lang = navigator.language || window.navigator.userLanguage;
		return lang.substr(0, 2).toLowerCase();
	},

	uuid:function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	},

	userAgent:new UserAgent()
}

paella.utils.parameters.parse();

paella.MouseManager = Class.create({
	targetObject:null,

	initialize:function() {
		var thisClass = this;
		paella.events.bind('mouseup',function(event) { thisClass.up(event); });
		paella.events.bind('mousemove',function(event) { thisClass.move(event); });
		paella.events.bind('mouseover',function(event) { thisClass.over(event); });
	},

	down:function(targetObject,event) {
		this.targetObject = targetObject;
		if (this.targetObject && this.targetObject.down) {
			this.targetObject.down(event,event.pageX,event.pageY);
			event.cancelBubble = true;
		}
		return false;
	},

	up:function(event) {
		if (this.targetObject && this.targetObject.up) {
			this.targetObject.up(event,event.pageX,event.pageY);
			event.cancelBubble = true;
		}
		this.targetObject = null;
		return false;
	},

	out:function(event) {
		if (this.targetObject && this.targetObject.out) {
			this.targetObject.out(event,event.pageX,event.pageY);
			event.cancelBubble = true;
		}
		return false;
	},

	move:function(event) {
		if (this.targetObject && this.targetObject.move) {
			this.targetObject.move(event,event.pageX,event.pageY);
			event.cancelBubble = true;
		}
		return false;
	},

	over:function(event) {
		if (this.targetObject && this.targetObject.over) {
			this.targetObject.over(event,event.pageX,event.pageY);
			event.cancelBubble = true;
		}
		return false;
	}
});

paella.utils.mouseManager = new paella.MouseManager();


paella.ui = {}

paella.ui.Container = function(params) {
	var elem = document.createElement('div');
	if (params.id) elem.id = params.id;
	if (params.className) elem.className = params.className;
	if (params.style) $(elem).css(params.style);
	return elem;
};

paella.DataDelegate = Class.create({
	// onSuccess => function(response,readStatus)
	read:function(context,params,onSuccess) {
		// TODO: read key with context
		if (typeof(onSuccess)=='function') {
			onSuccess({},true);
		}
	},

	// onSuccess => function(response,writeStatus)
	write:function(context,params,value,onSuccess) {
		// TODO: write key with context
		if(typeof(onSuccess)=='function') {
			onSuccess({},true);
		}
	},

	remove:function(context,params,onSuccess) {
		// TODO: write key with context
		if(typeof(onSuccess)=='function') {
			onSuccess({},true);
		}
	}
});

paella.dataDelegates = {}

paella.dataDelegates.CookieDataDelegate = Class.create(paella.DataDelegate,{
	initialize:function() {
	},

	serializeKey:function(context,params) {
		if (typeof(params)=='object') params = JSON.stringify(params);
		return context + '|' + params;
	},

	read:function(context,params,onSuccess) {
		var key = this.serializeKey(context,params);
		var value = paella.utils.cookies.get(key);
		try {
			value = unescape(value);
			value = JSON.parse(value);
		}
		catch (e) {}
		if (typeof(onSuccess)=='function') {
			onSuccess(value,true);
		}
	},

	write:function(context,params,value,onSuccess) {
		var key = this.serializeKey(context,params);
		if (typeof(value)=='object') value = JSON.stringify(value);
		value = escape(value);
		paella.utils.cookies.set(key,value);
		if(typeof(onSuccess)=='function') {
			onSuccess({},true);
		}
	},

	remove:function(context,params,onSuccess) {
		var key = this.serializeKey(context,params);
		if (typeof(value)=='object') value = JSON.stringify(value);
		paella.utils.cookies.set(key,'');
		if(typeof(onSuccess)=='function') {
			onSuccess({},true);
		}

	}
});

paella.dataDelegates.DefaultDataDelegate = paella.dataDelegates.CookieDataDelegate;


paella.Data = Class.create({
	enabled:false,
	dataDelegates:{},

	initialize:function(config) {
		this.enabled = config.data.enabled;
		for (var key in config.data.dataDelegates) {
			try {
				var delegateName = config.data.dataDelegates[key];
				var DelegateClass = paella.dataDelegates[delegateName];
				var delegateInstance = new DelegateClass();
				this.dataDelegates[key] = delegateInstance;
			}
			catch (e) {
				paella.debug.log("Warning: delegate not found - " + delegateName);
			}
		}
		if (!this.dataDelegates["default"]) {
			this.dataDelegates["default"] = new paella.dataDelegates.DefaultDataDelegate();
		}
	},

	read:function(context,key,onSuccess) {
		var del = this.getDelegate(context);
		del.read(context,key,onSuccess);
	},

	write:function(context,key,params,onSuccess) {
		var del = this.getDelegate(context);
		del.write(context,key,params,onSuccess);
	},

	remove:function(context,key,onSuccess) {
		var del = this.getDelegate(context);
		del.remove(context,key,onSuccess);
	},

	getDelegate:function(context) {
		if (this.dataDelegates[context]) return this.dataDelegates[context];
		else return this.dataDelegates["default"];
	}
});

// Will be initialized inmediately after loading config.json, in PaellaPlayer.onLoadConfig()
paella.data = null;

paella.MessageBox = Class.create({
	modalContainerClassName:'modalMessageContainer',
	frameClassName:'frameContainer',
	messageClassName:'messageContainer',
	errorClassName:'errorContainer',
	currentMessageBox:null,
	messageContainer:null,
	onClose:null,

	initialize:function() {
		var thisClass = this;
		$(window).resize(function(event) { thisClass.adjustTop(); });
	},

	showFrame:function(src,params) {
		var closeButton = true;
		var width = "80%";
		var height = "80%";
		var onClose = null;
		if (params) {
			closeButton = params.closeButton;
			width = params.width;
			height = params.height;
			onClose = params.onClose;
		}

		this.doShowFrame(src,closeButton,width,height,onClose);
	},

	doShowFrame:function(src,closeButton,width,height,onClose) {
		this.onClose = onClose;

		if (this.currentMessageBox) {
			this.close();
		}

		if (!width) { width = '80%'; }

		if (!height) { height = '80%'; }

		var modalContainer = document.createElement('div');
		modalContainer.className = this.modalContainerClassName;
		modalContainer.style.position = 'fixed';
		modalContainer.style.top = '0px';
		modalContainer.style.left = '0px';
		modalContainer.style.right = '0px';
		modalContainer.style.bottom = '0px';
		modalContainer.style.zIndex = 999999;

		var messageContainer = document.createElement('div');
		messageContainer.className = this.frameClassName;
		messageContainer.style.width = width;
		messageContainer.style.height = height;
		messageContainer.style.position = 'relative';
		modalContainer.appendChild(messageContainer);

		var iframeContainer = document.createElement('iframe');
		iframeContainer.src = src;
		iframeContainer.setAttribute("frameborder", "0");
		iframeContainer.style.width = "100%";
		iframeContainer.style.height = "100%";
		messageContainer.appendChild(iframeContainer);

		$('body')[0].appendChild(modalContainer);

		this.currentMessageBox = modalContainer;
		this.messageContainer = messageContainer;
		var thisClass = this;
		this.adjustTop();

		if (closeButton) {
			this.createCloseButton();
		}
	},

	showElement:function(domElement,params) {
		var closeButton = true;
		var width = "60%";
		var height = "40%";
		var onClose = null;
		var className = this.messageClassName;
		if (params) {
			className = params.className;
			closeButton = params.closeButton;
			width = params.width;
			height = params.height;
			onClose = params.onClose;
		}

		this.doShowElement(domElement,closeButton,width,height,className,onClose);
	},

	showMessage:function(message,params) {
		var closeButton = true;
		var width = "60%";
		var height = "40%";
		var onClose = null;
		var className = this.messageClassName;
		if (params) {
			className = params.className;
			closeButton = params.closeButton;
			width = params.width;
			height = params.height;
			onClose = params.onClose;
		}

		this.doShowMessage(message,closeButton,width,height,className,onClose);
	},

	doShowElement:function(domElement,closeButton,width,height,className,onClose) {
		this.onClose = onClose;

		if (this.currentMessageBox) {
			this.close();
		}
		if (!className) className = this.messageClassName;

		if (!width) { width = '80%'; }

		if (!height) { height = '30%'; }

		var modalContainer = document.createElement('div');
		modalContainer.className = this.modalContainerClassName;
		modalContainer.style.position = 'fixed';
		modalContainer.style.top = '0px';
		modalContainer.style.left = '0px';
		modalContainer.style.right = '0px';
		modalContainer.style.bottom = '0px';
		modalContainer.style.zIndex = 999999;

		var messageContainer = document.createElement('div');
		messageContainer.className = className;
		messageContainer.style.width = width;
		messageContainer.style.height = height;
		messageContainer.style.position = 'relative';
		messageContainer.appendChild(domElement);
		modalContainer.appendChild(messageContainer);

		$('body')[0].appendChild(modalContainer);

		this.currentMessageBox = modalContainer;
		this.messageContainer = messageContainer;
		var thisClass = this;
		this.adjustTop();

		if (closeButton) {
			this.createCloseButton();
		}
	},

	doShowMessage:function(message,closeButton,width,height,className,onClose) {
		this.onClose = onClose;

		if (this.currentMessageBox) {
			this.close();
		}
		if (!className) className = this.messageClassName;

		if (!width) { width = '80%'; }

		if (!height) { height = '30%'; }

		var modalContainer = document.createElement('div');
		modalContainer.className = this.modalContainerClassName;
		modalContainer.style.position = 'fixed';
		modalContainer.style.top = '0px';
		modalContainer.style.left = '0px';
		modalContainer.style.right = '0px';
		modalContainer.style.bottom = '0px';
		modalContainer.style.zIndex = 999999;

		var messageContainer = document.createElement('div');
		messageContainer.className = className;
		messageContainer.style.width = width;
		messageContainer.style.height = height;
		messageContainer.style.position = 'relative';
		messageContainer.innerHTML = message;
		modalContainer.appendChild(messageContainer);

		$('body')[0].appendChild(modalContainer);

		this.currentMessageBox = modalContainer;
		this.messageContainer = messageContainer;
		var thisClass = this;
		this.adjustTop();

		if (closeButton) {
			this.createCloseButton();
		}
	},

	showError:function(message,params) {
		var closeButton = false;
		var width = "60%";
		var height = "20%";
		var onClose = null;
		if (params) {
			closeButton = params.closeButton;
			width = params.width;
			height = params.height;
			onClose = params.onClose;
		}

		this.doShowError(message,closeButton,width,height,onClose);
	},

	doShowError:function(message,closeButton,width,height,onClose) {
		this.doShowMessage(message,closeButton,width,height,this.errorClassName,onClose);
	},

	createCloseButton:function() {
		if (this.messageContainer) {
			var thisClass = this;
			var closeButton = document.createElement('div');
			this.messageContainer.appendChild(closeButton);
			closeButton.className = 'paella_messageContainer_closeButton';
			$(closeButton).click(function(event) { thisClass.onCloseButtonClick(); });
		}
	},

	adjustTop:function() {
		if (this.currentMessageBox) {

			var msgHeight = $(this.messageContainer).outerHeight();
			var containerHeight = $(this.currentMessageBox).height();

			var top = containerHeight/2 - msgHeight/2;
			this.messageContainer.style.marginTop = top + 'px';
		}
	},

	close:function() {
		if (this.currentMessageBox && this.currentMessageBox.parentNode) {
			var msgBox = this.currentMessageBox;
			var parent = msgBox.parentNode;
			$(msgBox).animate({opacity:0.0},300,function() {
				parent.removeChild(msgBox);
			});
			if (this.onClose) {
				this.onClose();
			}
		}
	},

	onCloseButtonClick:function() {
		this.close();
	}
});

paella.messageBox = new paella.MessageBox();

paella.AntiXSS = {
	htmlEscape: function (str) {
		return String(str)
    		.replace(/&/g, '&amp;')
    		.replace(/"/g, '&quot;')
    		.replace(/'/g, '&#39;')
    		.replace(/</g, '&lt;')
    		.replace(/>/g, '&gt;');
    	},

    htmlUnescape: function (value){
		return String(value)
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&');
	}
};



paella.Node = Class.create({
	identifier:'',
	nodeList:null,
	
	initialize:function(id) {
		this.nodeList = {};
		this.identifier = id;
	},
	
	addTo:function(parentNode) {
		parentNode.addNode(this);
	},
	
	addNode:function(childNode) {
		this.nodeList[childNode.identifier] = childNode;
		return childNode;
	},
	
	getNode:function(id) {
		return this.nodeList[id];
	}
});

paella.DomNode = Class.create(paella.Node,{
	domElement:null,
	
	initialize:function(elementType,id,style) {
		this.parent(id);
		this.domElement = document.createElement(elementType);
		this.domElement.id = id;
		if (style) $(this.domElement).css(style);
	},
	
	addNode:function(childNode) {
		var returnValue = this.parent(childNode);
		this.domElement.appendChild(childNode.domElement);
		return returnValue;
	},

	onresize:function() {
	}
});

paella.Button = Class.create(paella.DomNode,{
	isToggle:false,

	initialize:function(id,className,action,isToggle) {
		this.isToggle = isToggle;
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = className;
		if (isToggle) {
			var thisClass = this;
			$(this.domElement).click(function(event) {
				thisClass.toggleIcon();
			});
		}
		$(this.domElement).click('click',action);
	},
	
	isToggled:function() {
		if (this.isToggle) {
			var element = $('#' + this.identifier)[0];
			return /([a-zA-Z0-9_]+)_active/.test(element.className);
		}
		else {
			return false;
		}
	},

	toggle:function() {
		this.toggleIcon();
	},

	toggleIcon:function() {
		var element = $('#' + this.identifier)[0];
		if (/([a-zA-Z0-9_]+)_active/.test(element.className)) {
			element.className = RegExp.$1;
		}
		else {
			element.className = element.className + '_active';
		}
		
	},
	
	show:function() {
		$(this.domElement).show();
	},
	
	hide:function() {
		$(this.domElement).hide();
	},
	
	visible:function() {
		return this.domElement.visible();
	}
});


paella.Profiles = {
	loadProfile:function(profileName,onSuccessFunction) {
		var params = { url:"config/profiles/profiles.json" };

		paella.ajax.get(params,function(data,mimetype,code) {
				if (typeof(data)=="string") {
					data = JSON.parse(data);
				}
				onSuccessFunction(data[profileName]);
			},
			function(data,mimetype,code) {
				paella.debug.log("Error loading video profiles. Check your Paella Player configuration");
			});
	},

	loadProfileList:function(onSuccessFunction) {
		var params = { url:"config/profiles/profiles.json" };

		paella.ajax.get(params,function(data,mimetype,code) {
				if (typeof(data)=="string") {
					data = JSON.parse(data);
				}
				onSuccessFunction(data);
			},
			function(data,mimetype,code) {
				paella.debug.log("Error loading video profiles. Check your Paella Player configuration");
			});
	}
};

paella.RelativeVideoSize = Class.create({
	w:1280,h:720,

	proportionalHeight:function(newWidth) {
		return Math.floor(this.h * newWidth / this.w);
	},

	proportionalWidth:function(newHeight) {
		return Math.floor(this.w * newHeight / this.h);
	},

	percentVSize:function(pxSize) {
		return pxSize * 100 / this.h;
	},

	percentWSize:function(pxSize) {
		return pxSize * 100 / this.w;
	},

	aspectRatio:function() {
		return this.w/this.h;
	}
});

paella.VideoElementBase = Class.create(paella.DomNode,{
	isReady:false,

	initialize:function(id,containerType,left,top,width,height) {
		var thisClass = this;
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(top) + '%';
		var percentLeft = relativeSize.percentWSize(left) + '%';
		var percentWidth = relativeSize.percentWSize(width) + '%';
		var percentHeight = relativeSize.percentVSize(height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:GlobalParams.video.zIndex};
		this.parent(containerType,id,style);
		$(this.domElement).bind('canplay',function(event) {
			thisClass.ready = true;
		});
	},

	isReady:function() {
		return this.ready;
	},

	play:function() {
		paella.debug.log("TODO: implement play() function in your VideoElementBase subclass");
	},

	pause:function() {
		paella.debug.log("TODO: implement pause() function in your VideoElementBase subclass");
	},

	isPaused:function() {
		paella.debug.log("TODO: implement isPaused() function in your VideoElementBase subclass");
		return false;
	},

	duration:function() {
		paella.debug.log("TODO: implement duration() function in your VideoElementBase subclass");
		return -1;
	},

	setCurrentTime:function(time) {
		paella.debug.log("TODO: implement setCurrentTime() function in your VideoElementBase subclass");
	},

	currentTime:function() {
		paella.debug.log("TODO: implement currentTime() function in your VideoElementBase subclass");
		return 0;
	},

	setVolume:function(volume) {
		paella.debug.log("TODO: implement setVolume() function in your VideoElementBase subclass");
		return false;
	},

	volume:function() {
		paella.debug.log("TODO: implement volume() function in your VideoElementBase subclass");
		return -1;
	},

	setPlaybackRate:function(rate) {
		paella.debug.log("TODO: implement setPlaybackRate() function in your VideoElementBase subclass");
	},

	addSource:function(sourceData) {
		paella.debug.log("TODO: implement addSource() function in your VideoElementBase subclass");
	},

	setClassName:function(className) {
		this.domElement.className = className;
	},

	getDimensions:function() {
		return { width: this.domElement.videoWidth, height: this.domElement.videoHeight };
	},

	setRect:function(rect,animate) {
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(rect.top) + '%';
		var percentLeft = relativeSize.percentWSize(rect.left) + '%';
		var percentWidth = relativeSize.percentWSize(rect.width) + '%';
		var percentHeight = relativeSize.percentVSize(rect.height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute'};
		if (animate) {
			this.disableClassName();
			var thisClass = this;
			$(this.domElement).animate(style,400,function(){ thisClass.enableClassName(); })
			this.enableClassNameAfter(400);
		}
		else {
			$(this.domElement).css(style);
		}
	},

	disableClassName:function() {
		this.classNameBackup = this.domElement.className;
		this.domElement.className = "";
	},

	enableClassName:function() {
		this.domElement.className = this.classNameBackup;
	},

	enableClassNameAfter:function(millis) {
		setTimeout("$('#" + this.domElement.id + "')[0].className = '" + this.classNameBackup + "'",millis);
	},

	setClassName:function(className) {
		this.domElement.className = className;
	},

	setVisible:function(visible,animate) {
		if (visible=="true" && animate) {
			$(this.domElement).animate({opacity:1.0},300);
		}
		else if (visible=="true" && !animate) {
			$(this.domElement).show();
		}
		else if (visible=="false" && animate) {
			$(this.domElement).animate({opacity:0.0},300);
		}
		else if (visible=="false" && !animate) {
			$(this.domElement).hide();
		}
	},

	setLayer:function(layer) {
		this.domElement.style.zIndex = layer;
	}
});

function paella_flash_video_ready(streamId) {
	var videoPlayer = paella_flash_VideoContainers[streamId];
	videoPlayer._isReady = true;
}

var paella_flash_VideoContainers = {};

paella.FlashVideo = Class.create(paella.VideoElementBase,{
	classNameBackup:'',
	flashVideo:null,
	paused:true,
	streamingMode:true,
	flashId:'',
	_isReady:false,

	initialize:function(id,left,top,width,height) {
		this.parent(id,'div',left,top,width,height);
		this.flashId = id + 'Movie';
		paella_flash_VideoContainers[this.flashId] = this;
	},

	isReady:function() {
		return this._isReady;
	},

	// Adobe Flash utils
	addParameter:function(swf,name,value) {
		var param = document.createElement('param');
		param.setAttribute("name",name);
		param.setAttribute("value",value);
		swf.appendChild(param);
	},

	createSwf:function(url,params) {
		var ieobject = document.createElement('object');
		ieobject.setAttribute('id',this.flashId + 'IE');
		ieobject.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
		ieobject.setAttribute('codebase', '"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=5,0,0,0"');
		ieobject.setAttribute("width","100%");
		ieobject.setAttribute("height","100%");
		ieobject.setAttribute("playerId",this.flashId);
		this.addParameter(ieobject,"movie",url);
		this.addParameter(ieobject,"quality","high");
		this.addParameter(ieobject,"bgcolor","#efefef");
		this.addParameter(ieobject,"play","true");
		this.addParameter(ieobject,"loop","true");
		this.addParameter(ieobject,"wmode","window");
		this.addParameter(ieobject,"scale","default");
		this.addParameter(ieobject,"menu","true");
		this.addParameter(ieobject,"devicefont","false");
		this.addParameter(ieobject,"salign","");
		this.addParameter(ieobject,"allowScriptAccess","sameDomain");

		var object = document.createElement('object');
		object.setAttribute('id',this.flashId);
		object.setAttribute("type","application/x-shockwave-flash");
		object.setAttribute("data",url);
		object.setAttribute("width","100%");
		object.setAttribute("height","100%");
		object.setAttribute("playerId",this.flashId);
		this.addParameter(object,"movie",url);
		this.addParameter(object,"quality","high");
		this.addParameter(object,"bgcolor","#efefef");
		this.addParameter(object,"play","true");
		this.addParameter(object,"loop","true");
		this.addParameter(object,"wmode","window");
		this.addParameter(object,"scale","default");
		this.addParameter(object,"menu","true");
		this.addParameter(object,"devicefont","false");
		this.addParameter(object,"salign","");
		this.addParameter(object,"allowScriptAccess","sameDomain");
		ieobject.appendChild(object);

		var flashVars = "playerId=" +  this.playerId;
		var separator = "&";
		for (var key in params) {
			flashVars += separator + key + "=" + encodeURIComponent(params[key]);
		}
		this.addParameter(ieobject,"flashvars",flashVars);
		this.addParameter(object,"flashvars",flashVars);

		var link = document.createElement('a');
		link.setAttribute("href", "http://www.adobe.com/go/getflash");
		link.innerHTML = '<img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Obtener Adobe Flash Player" />';
		object.appendChild(link);

		return ieobject;
	},

	play:function() {
		if (this.flashVideo) {
			try {
				this.flashVideo.play();
				this.paused = false;
				return true;
			}
			catch(e) {
			}
		}
		return false;
	},

	pause:function() {
		if (this.flashVideo) {
			try {
				this.flashVideo.pause();
				this.paused = true;
				return true;
			}
			catch(e) {
			}
		}
		return false;
	},

	isPaused:function() {
		return this.paused;
	},

	duration:function() {
		if (this.flashVideo) {
			try {
				return this.flashVideo.duration();
			}
			catch (e) {
				return -1;
			}
		}
	},

	setCurrentTime:function(time) {
		if (this.flashVideo) {
			try {
				this.flashVideo.seekToTime(time);
			}
			catch(e) {
			}
		}
	},

	currentTime:function() {
		if (this.flashVideo) {
			try {
				return this.flashVideo.getCurrentTime();
			}
			catch (e) {
				return 0;
			}
		}
		return -1;
	},

	setVolume:function(volume) {
		if (this.flashVideo) {
			var thisClass = this;
			try {
				this.flashVideo.setVolume(volume);
				return true;
			}
			catch(e) {
				new Timer(function(timer) {
					try {
						thisClass.flashVideo.setVolume(volume);
						timer.repeat = false;
					}
					catch(e2) {
						paella.debug.log('Fail to set volume on ' + thisClass.identifier);
						timer.repeat = true;
					}
				},100);
			}
		}
		return false;
	},

	volume:function() {
		return this.flashVideo.getVolume();
	},

	setPlaybackRate:function(rate) {
	},

	createSwfObject:function(swfFile,flashVars) {
		var id = this.identifier;
		var parameters = { wmode:'transparent' };

		var domElement = document.createElement('div');
		this.domElement.appendChild(domElement);
		domElement.id = id + "Movie";
		swfobject.embedSWF(swfFile,domElement.id,"100%","100%","9.0.0","",flashVars,parameters);

		var flashObj = $('#' + domElement.id)[0];
		return flashObj;
	},

	addSourceProgresiveDownload:function(sourceData){
		if (sourceData.type=='video/mp4') {
			var parameters = {};

			if (!/rtmp:\/\//.test(sourceData.src)) {
				parameters.url = sourceData.src;
				parameters.playerId = this.flashId;

				this.flashVideo = this.createSwfObject("player.swf",parameters);
			}
		}
		else if (sourceData.type=='video/x-flv') {
			var parameters = {};
			parameters.url = sourceData.src;
			parameters.playerId = this.flashId;
			this.flashVideo = this.createSwfObject("player.swf",parameters);
		}
	},

	addSourceStreaming:function(sourceData) {
		if (sourceData.type=='video/mp4') {
			var parameters = {};
			if (/(rtmp:\/\/[\w\d\.\-_]+[:+\d]*\/[\w\d\-_]+\/)(mp4:)([\w\d\.\/\-_]+)/i.test(sourceData.src)) {
				sourceData.src = RegExp.$1 + RegExp.$3;
			}

			if (/(rtmp:\/\/)([\w\d\.\-_]+[:+\d]*)\/([\w\d\-_]+\/)([\w\d\.\/\-_]+)/.test(sourceData.src)) {
				parameters.connect = RegExp.$1 + RegExp.$2 + '/' + RegExp.$3;
				parameters.url = "mp4:" + RegExp.$4;
			}
			parameters.playerId = this.flashId;
			parameters.isLiveStream = sourceData.isLiveStream;
			this.flashVideo = this.createSwfObject("player.swf",parameters);
		}
		else if (sourceData.type=='video/x-flv') {
			var parameters = {};

			if (/(rtmp:\/\/)([\w\d\.\-_]+[:+\d]*)\/([\w\d\-_]+\/)([\w\d\.\/\-_]+)(\.flv)?/.test(sourceData.src)) {
				parameters.connect = RegExp.$1 + RegExp.$2 + '/' + RegExp.$3;
				parameters.url = RegExp.$4;
			}
			parameters.playerId = this.flashId;
			parameters.isLiveStream = sourceData.isLiveStream;
			this.flashVideo = this.createSwfObject("player.swf",parameters);
		}
	},

	addSource:function(sourceData) {
		if (this.streamingMode) {
			this.addSourceStreaming(sourceData);
		}
		else{
			this.addSourceProgresiveDownload(sourceData);
		}
	},

	getDimensions:function() {
		var dim = {width:640, height:480};
		try {
			dim.width = this.flashVideo.getWidth();
			dim.height = this.flashVideo.getHeight();
		}
		catch (e) {
			paella.debug.log("Warning: flash video is not loaded");
		}
		return dim;
	}
});

paella.Html5Video = Class.create(paella.VideoElementBase,{
	classNameBackup:'',
	ready:false,

	initialize:function(id,left,top,width,height) {
		this.parent(id,'video',left,top,width,height);
		var thisClass = this;
		$(this.domElement).bind('canplay',function(event) {
			thisClass.ready = true;
		});
	},

	isReady:function() {
		return this.ready;
	},

	play:function() {
		if (this.domElement && this.domElement.play) {
			this.domElement.play();
		}
	},

	pause:function() {
		if (this.domElement && this.domElement.pause) {
			this.domElement.pause();
		}
	},

	isPaused:function() {
		return this.domElement.paused;
	},

	duration:function() {
		if (this.domElement && this.domElement.duration) {
			return this.domElement.duration;
		}
	},

	setCurrentTime:function(time) {
		if (this.domElement && this.domElement.currentTime) {
			this.domElement.currentTime = time;
		}
	},

	currentTime:function() {
		if (this.domElement && this.domElement.currentTime) {
			return this.domElement.currentTime;
		}
		return 0;
	},

	setVolume:function(volume) {
		this.domElement.volume = volume;
		return true;
	},

	volume:function() {
		return this.domElement.volume;
	},

	setPlaybackRate:function(rate) {
		this.domElement.playbackRate = rate;
	},

	addSource:function(sourceData) {
		var source = document.createElement('source');
		source.src = sourceData.src;
		source.type = sourceData.type;
		this.domElement.appendChild(source);
		var ua = new UserAgent();
		if (ua.browser.IsMobileVersion) {
			this.ready = true;
		}
	},

	getDimensions:function() {
		return { width: this.domElement.videoWidth, height: this.domElement.videoHeight };
	},

	setRect:function(rect,animate) {
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(rect.top) + '%';
		var percentLeft = relativeSize.percentWSize(rect.left) + '%';
		var percentWidth = relativeSize.percentWSize(rect.width) + '%';
		var percentHeight = relativeSize.percentVSize(rect.height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute'};
		if (animate) {
			this.disableClassName();
			var thisClass = this;
			$(this.domElement).animate(style,400,function(){ thisClass.enableClassName(); })
			this.enableClassNameAfter(400);
		}
		else {
			$(this.domElement).css(style);
		}
	},

	disableClassName:function() {
		this.classNameBackup = this.domElement.className;
		this.domElement.className = "";
	},

	enableClassName:function() {
		this.domElement.className = this.classNameBackup;
	},

	enableClassNameAfter:function(millis) {
		setTimeout("$('#" + this.domElement.id + "')[0].className = '" + this.classNameBackup + "'",millis);
	},

	setVisible:function(visible,animate) {
		if (visible=="true" && animate) {
			$(this.domElement).animate({opacity:1.0},300);
		}
		else if (visible=="true" && !animate) {
			$(this.domElement).show();
		}
		else if (visible=="false" && animate) {
			$(this.domElement).animate({opacity:0.0},300);
		}
		else if (visible=="false" && !animate) {
			$(this.domElement).hide();
		}
	},

	setLayer:function(layer) {
		this.domElement.style.zIndex = layer;
	}
});

paella.SlideshowVideo = Class.create(paella.VideoElementBase,{
	isReady:false,
	img:null,
	_frames:null,
	_duration:0,
	_currentTime:0,
	_playTime:0,
	_lastFrame:-1,

	updateTimer:null,

	initialize:function(id,left,top,width,height) {
		this.parent(id,'div',left,top,width,height);
		this.img = document.createElement('img');
		this.img.style.width = '100%';
		this.img.style.height = '100%';
		this.domElement.appendChild(this.img);

		var thisClass = this;
		thisClass.ready = false;
	},

	isReady:function() {
		return this.ready;
	},

	checkFrame:function() {
		var src = null;
		var alt = "";
		var lastFrame = -1;

		for (var i=0;i<this._frames.length;++i) {
			var frameData = this._frames[i];
			if (this._currentTime<frameData.time) break;
			src = frameData.image;
			alt = "frame_" + frameData.time;
			lastFrame = frameData.time;
		}

		if (this._lastFrame!=lastFrame) {
			this.img.src = src;
			this.img.alt = alt;
			this._lastFrame = lastFrame;
		}
	},

	play:function() {
		if (!this.updateTimer) {
			this._playTime = new Date().getTime();
			this.updateTimer = new Timer(function(timer,params){
				var time = new Date().getTime();
				var elapsed = Math.round((time - params.player._playTime) / 1000);
				params.player._currentTime += elapsed;
				params.player._playTime = time;
				params.player.checkFrame();
				if (params.player_currentTime>=params.player._duration) params.player.pause();
			},1000,{player:this});
			this.updateTimer.repeat = true;
		}
	},

	pause:function() {
		if (this.updateTimer) {
			this.updateTimer.cancel();
			this.updateTimer = null;
		}
	},

	isPaused:function() {
		return this.updateTimer==null;
	},

	duration:function() {
		return _duration;
	},

	setCurrentTime:function(time) {
		if (this._duration>=time) {
			this._currentTime = time;
			this.checkFrame();
		}
	},

	currentTime:function() {
		return this._currentTime;
	},

	setVolume:function(volume) {
		return false;
	},

	volume:function() {
		return -1;
	},

	setPlaybackRate:function(rate) {
	},

	// sourceData = {frames:{frame_1:'frame_1.jpg',frame_1:'frame_1.jpg',...frame_n:'frame_n.jpg'},duration:183}
	addSource:function(sourceData) {
		this._duration = sourceData.duration;
		this._currentTime = 0;
		this.loadFrames(sourceData.frames,sourceData.duration);
		var frameZero = new Image();
		var thisClass = this;
		frameZero.onload = function(event) {
			thisClass.ready = true;
			thisClass.checkFrame();
		}
		frameZero.src = this._frames[0].image;
	},

	loadFrames:function(frames,duration) {
		this._frames = [];
		for (var i=0;i<duration;++i) {
			var frame = frames['frame_' + i];
			if (frame) this._frames.push({time:i,image:frame});
		}
	}
});


paella.BackgroundContainer = Class.create(paella.DomNode,{
	initialize:function(id,image) {
		this.parent('img',id,{position:'relative',top:'0px',left:'0px',right:'0px',bottom:'0px',zIndex:GlobalParams.background.zIndex});
		this.domElement.setAttribute('src',image);
		this.domElement.setAttribute('alt','');
		this.domElement.setAttribute('width','100%');
		this.domElement.setAttribute('height','100%');
	},
	
	setImage:function(image) {
		this.domElement.setAttribute('src',image);
	}
});

paella.VideoOverlay = Class.create(paella.DomNode,{
	size:{w:1280,h:720},
	
	initialize:function() {
		var style = {position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',overflow:'hidden',zIndex:10};
		this.parent('div','overlayContainer',style);
		this.domElement.setAttribute("role", "main");
	},
	
	enableBackgroundMode:function() {
		this.domElement.className = 'overlayContainer background';
	},
	
	disableBackgroundMode:function() {
		this.domElement.className = 'overlayContainer';
	},
	
	clear:function() {
		this.domElement.innerHTML = "";
	},
	
	getMasterRect:function() {
		return paella.player.videoContainer.getMasterVideoRect();
	},
	
	getSlaveRect:function() {
		return paella.player.videoContainer.getSlaveVideoRect()
	},
	
	addText:function(text,rect,isDebug) {
		var textElem = document.createElement('div0');
		textElem.innerHTML = text;
		textElem.className = "videoOverlayText";
		if (isDebug) textElem.style.backgroundColor = "red";
		return this.addElement(textElem,rect);
	},
	
	addElement:function(element,rect) {
		this.domElement.appendChild(element);
		element.style.position = 'absolute';
		element.style.left = this.getHSize(rect.left) + '%';
		element.style.top = this.getVSize(rect.top) + '%';
		element.style.width = this.getHSize(rect.width) + '%';
		element.style.height = this.getVSize(rect.height) + '%';
		return element;
	},
	
	removeElement:function(element) {
		this.domElement.removeChild(element);
	},
	
	getVSize:function(px) {
		return px*100/this.size.h;
	},
	
	getHSize:function(px) {
		return px*100/this.size.w;
	}
});

paella.VideoContainerBase = Class.create(paella.DomNode,{
	trimming:{enabled:false,start:0,end:0},
	timeupdateEventTimer:null,
	timeupdateInterval:250,
	masterVideoData:null,
	slaveVideoData:null,
	currentMasterVideoData:null,
	currentSlaveVideoData:null,

	initialize:function(id) {
		var style = {position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',overflow:'hidden'}
		this.parent('div',id,style);		
	},
	
	initEvents:function() {
		var thisClass = this;
		paella.events.bind(paella.events.play,function(event) { thisClass.play(); thisClass.startTimeupdate(); });
		paella.events.bind(paella.events.pause,function(event) { thisClass.pause(); thisClass.stopTimeupdate(); });
		paella.events.bind(paella.events.next,function(event) { thisClass.next(); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.previous,function(event) { thisClass.previous(); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.seekTo,function(event,params) { thisClass.setCurrentPercent(params.newPositionPercent); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.seekToTime,function(event,params) { thisClass.setCurrentTime(params.time); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.setPlaybackRate,function(event,params) { thisClass.setPlaybackRate(params); });
		paella.events.bind(paella.events.setVolume,function(event,params) { thisClass.setVolume(params); });
		paella.events.bind(paella.events.setTrim,function(event,params) { thisClass.setTrim});
	},
	
	triggerTimeupdate:function() {
		var thisClass = this;
		paella.events.trigger(paella.events.timeupdate,{videoContainer:thisClass, currentTime:thisClass.currentTime() });
	},
	
	startTimeupdate:function() {
		var thisClass = this;
		this.timeupdateEventTimer = new Timer(function(timer) {
			thisClass.triggerTimeupdate();
		},this.timeupdateInterval);
		this.timeupdateEventTimer.repeat = true;
	},
	
	stopTimeupdate:function() {
		this.timeupdateEventTimer.repeat = false;
		this.timeupdateEventTimer = null;
	},

	play:function() {
		paella.debug.log('VideoContainerBase.play()');
	},
	
	pause:function() {
		paella.debug.log('VideoContainerBase.pause()');
	},
	
	trimStart:function() {
		return 0;
	},
	
	trimEnd:function() {
		return this.duration();
	},

	trimEnabled:function() {
		return false;
	},
	
	enableTrimming:function() {
		this.trimming.enabled = true;
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this.trimming.enabled,trimStart:this.trimming.start,trimEnd:this.trimming.end});
	},
	
	disableTrimming:function() {
		this.trimming.enabled = false;
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this.trimming.enabled,trimStart:this.trimming.start,trimEnd:this.trimming.end});
	},
	
	setTrimming:function(start,end) {
		this.trimming.start = start;
		this.trimming.end = end;
		if (this.currentTime()<this.trimming.start) {
			this.setCurrentTime(this.trimming.start);
		}
		if (this.currentTime()>this.trimming.end) {
			this.setCurrentTime(this.trimming.end);
		}
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this.trimming.enabled,trimStart:this.trimming.start,trimEnd:this.trimming.end});
	},
	
	setTrimmingStart:function(start) {
		this.setTrimming(start,this.trimming.end);
	},
	
	setTrimmingEnd:function(end) {
		this.setTrimming(this.trimming.start,end);
	},
	
	setCurrentPercent:function(percent) {
		var start = this.trimStart();
		var end = this.trimEnd();
		var duration = end - start;
		var trimedPosition = percent * duration / 100;
		var realPosition = parseFloat(trimedPosition) + parseFloat(start);
		this.setCurrentTime(realPosition);
	},

	setCurrentTime:function(time) {
		paella.debug.log("VideoContainerBase.setCurrentTime(" +  time + ")");
	},
	
	currentTime:function() {
		paella.debug.log("VideoContainerBase.currentTime()");
		return 0;
	},
	
	duration:function() {
		paella.debug.log("VideoContainerBase.duration()");
		return 0
	},
	
	paused:function() {
		paella.debug.log("VideoContainerBase.paused()");
		return true;
	},
	
	setupVideo:function(onSuccess) {
		paella.debug.log("VideoContainerBase.setupVide()");
	},
	
	setPlaybackRate:function(params) {
		paella.debug.log("VideoContainerBase.setPlaybackBase(" + params.rate + ")");
	},
	
	setVolume:function(params) {
		paella.debug.log("VideoContainerBase.setVolume(" + params.master + ")");
	},
	
	volume:function() {
		paella.debug.log("VideoContainerBase.volume()");
		return 1;
	},
	
	isReady:function() {
		paella.debug.log("VideoContainerBase.isReady()");
		return true;
	},

	onresize:function() { this.parent(onresize);
	}
});

paella.VideoContainer = Class.create(paella.VideoContainerBase,{
	containerId:'',
	video1Id:'',
	video2Id:'',
	backgroundId:'',
	container:null,
	video1ClassName:'video masterVideo',
	video2ClassName:'video slaveVideo',
	//fitHorizontal:false,
	isHidden:false,
	maxSyncDelay:0.5,
	logos:null,
	isMasterReady:false,
	isSlaveReady:false,
	isMonostream:false,
	sourceData:[],
	overlayContainer:null,
	videoSyncTimeMillis:5000,
	currentMasterVideoRect:{},
	currentSlaveVideoRect:{},

	initialize:function(id) {
		this.parent(id);
		var thisClass = this;
		this.containerId = id + '_container';
		this.video1Id = id + '_1';
		this.video2Id = id + '_2';
		this.backgroundId = id + '_bkg';
		this.logos = [];
				
		this.container = new paella.DomNode('div',this.containerId,{position:'relative',display:'block',marginLeft:'auto',marginRight:'auto',width:'1024px',height:'567px'});
		this.container.domElement.setAttribute('role','main');
		this.addNode(this.container);
	
		this.overlayContainer = new paella.VideoOverlay(this.domElement);
		this.container.addNode(this.overlayContainer);
	
		var overlayLoader = document.createElement("div");
		overlayLoader.className = "videoLoaderOverlay";
		this.overlayContainer.addElement(overlayLoader,{left:0,top:0,width:1280,height:720});
		//this.overlayContainer.addText("Loading",{left:0,top:0,width:1280,height:720},true);
		paella.events.bind(paella.events.loadComplete,function() { thisClass.overlayContainer.clear(); });
		
		this.container.addNode(new paella.BackgroundContainer(this.backgroundId,'config/profiles/resources/default_background_paella.jpg'));
	
		this.initEvents();
		paella.events.bind(paella.events.timeupdate,function(event) { thisClass.checkVideoTrimming(); } );
		
		var thisClass = this;
		var timer = new paella.utils.Timer(function(timer) {
			thisClass.syncVideos();
		},thisClass.videoSyncTimeMillis);
		timer.repeat = true;
	},
	
	getMasterVideoRect:function() {
		return this.currentMasterVideoRect;
	},
	
	getSlaveVideoRect:function() {
		return this.currentSlaveVideoRect;
	},
	
	createVideoPlayers:function() {
		var masterVideo = new paella.FlashVideo(this.video1Id,850,140,360,550);
		masterVideo.setClassName(this.video1ClassName);
		this.container.addNode(masterVideo);
		
		var slaveVideo = new paella.FlashVideo(this.video2Id,10,40,800,600);
		slaveVideo.setClassName(this.video2ClassName);
		this.container.addNode(slaveVideo);
	},

	setHidden:function(hidden) {
		this.isHidden = hidden;
	},

	hideVideo:function() {
		this.setHidden(true);
	},
	
	publishVideo:function() {
		this.setHidden(false);
	},

	syncVideos:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (!this.isMonostream && masterVideo && slaveVideo && masterVideo.currentTime && slaveVideo.currentTime) {
			var diff = Math.abs(masterVideo.currentTime() - slaveVideo.currentTime());

			if (diff>this.maxSyncDelay) {
				paella.debug.log("Sync videos performed, diff=" + diff);
				slaveVideo.setCurrentTime(masterVideo.currentTime());
			}
		}
	},

	checkVideoTrimming:function() {
		var current = this.currentTime();
		var end = this.duration();
		var start = 0;
		if (this.trimming.enabled) {
			end = this.trimming.end;
			start = parseFloat(this.trimming.start);
		}
		if (current>=Math.floor(end)) {
			var thisClass = this;
			paella.events.trigger(paella.events.endVideo,{videoContainer:thisClass});
			this.pause();
		}
		else if (current<start) {
			this.setCurrentTime(start + 1);
		}
	},
	
	play:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.play();
		if (slaveVideo) slaveVideo.play();
	},
	
	pause:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.pause();
		if (slaveVideo) slaveVideo.pause();
	},
	
	next:function() {
		if (this.trimming.end!=0) {
			this.setCurrentTime(this.trimming.end);			
		}
		else {
			this.setCurrentTime(this.duration(true));
		}
	},
	
	previous:function() {
		this.setCurrentTime(this.trimming.start);
	},

	setCurrentTime:function(time) {
		if (this.trimming.enabled) {
			if (time<this.trimming.start) time = this.trimming.start;
			if (time>this.trimming.end) time = this.trimming.end;
		}
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.setCurrentTime(time);
		if (slaveVideo) slaveVideo.setCurrentTime(time);
	},
	
	currentTime:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) return masterVideo.currentTime();
		else if (slaveVideo) return slaveVideo.currentTime();
		else return 0;
	},
	
	setPlaybackRate:function(params) {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) {
			masterVideo.setPlaybackRate(params.rate);
		}
		if (slaveVideo) {
			slaveVideo.setPlaybackRate(params.rate);
		}
	},
	
	setVolume:function(params) {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo && params.master) {
			masterVideo.setVolume(params.master);
		}
		else if (masterVideo) {
			masterVideo.setVolume(0);
		}
		if (slaveVideo && params.slave) {
			slaveVideo.setVolume(params.slave);
		}
		else if (slaveVideo) {
			slaveVideo.setVolume(0);
		}
	},
	
	volume:function(video) {
		if (!video && this.masterVideo()) {
			return this.masterVideo().volume();
		}
		else if (video=="master" && this.masterVideo()) {
			return this.masterVideo().volume();
		}
		else if (video=="slave" && this.slaveVideo()) {
			return this.slaveVideo().volume();
		}
		else {
			return 0;
		}
	},

	masterVideo:function() {
		return this.container.getNode(this.video1Id);
	},
	
	slaveVideo:function() {
		return this.container.getNode(this.video2Id);
	},
	
	duration:function(ignoreTrimming) {
		if (this.trimming.enabled && !ignoreTrimming) {
			return this.trimming.end - this.trimming.start;
		}
		else {
			if (!this.videoDuration) {
				this.videoDuration = this.masterVideo().duration();
			}
			return this.videoDuration;
		}
	},
	
	paused:function() {
		return this.masterVideo().isPaused();
	},

	trimEnabled:function() {
		return this.trimming.enabled;
	},

	trimStart:function() {
		if (this.trimming.enabled) {
			return this.trimming.start;
		}
		else {
			return 0;
		}
	},
	
	trimEnd:function() {
		if (this.trimming.enabled) {
			return this.trimming.end;
		}
		else {
			return this.duration();
		}
	},
	
	setMasterSource:function(masterVideoData,type) {
		if (type=='html') {
			var masterVideo = new paella.Html5Video(this.video1Id,850,140,360,550);
		}
		else if (type=='flash') {
			var masterVideo = new paella.FlashVideo(this.video1Id,850,140,360,550);
			masterVideo.streamingMode = false;
		}
		else if (type=='streaming') {
			var masterVideo = new paella.FlashVideo(this.video1Id,850,140,360,550);
			masterVideo.streamingMode = true;
		}
		else if (type=='image') {
			var masterVideo = new paella.SlideshowVideo(this.video1Id,850,140,360,550);
		}
		masterVideo.setClassName(this.video1ClassName);
		this.container.addNode(masterVideo);
		
		var thisClass = this;
		this.sourceData.push(masterVideoData);
		this.setupVideo(masterVideo,masterVideoData,type,'master');
		this.masterVideoData = masterVideoData;
		new Timer(function(timer) {
			if (masterVideo.isReady()) {
				thisClass.isMasterReady = true;
				timer.repeat = false;
			}
			else {
				timer.repeat = true;
			}
		},100);
		
		// TODO: Return false on video player error
		return true;
	},
	
	setSlaveSource:function(slaveVideoData,type) {
		if (type=='html' || !slaveVideoData) {
			var slaveVideo = new paella.Html5Video(this.video2Id,10,40,800,600);
		}
		else if (type=='flash') {
			var slaveVideo = new paella.FlashVideo(this.video2Id,10,40,800,600);
			slaveVideo.streamingMode = false;
		}
		else if (type=='streaming') {
			var slaveVideo = new paella.FlashVideo(this.video2Id,10,40,800,600);
			slaveVideo.streamingMode = true;
		}
		else if (type=='image') {
			var slaveVideo = new paella.SlideshowVideo(this.video2Id,850,140,360,550);
		}
		slaveVideo.setClassName(this.video2ClassName);
		this.container.addNode(slaveVideo);
		
		if (!slaveVideoData) {
			setMonoStreamMode();
			return false;
		}
		
		var thisClass = this;
		this.sourceData.push(slaveVideoData);
		this.setupVideo(slaveVideo,slaveVideoData,type,'slave');
		this.slaveVideoData = slaveVideoData;
		new Timer(function(timer) {
			if (slaveVideo.isReady()) {
				thisClass.isSlaveReady = true;
				timer.repeat = false;
			}
			else {
				timer.repeat = true;
			}
		},100);
		
		// TODO: Return false on video player error
		return true;
	},

	setMonoStreamMode:function() {
		this.isMonoStream = true;
		this.isSlaveReady = true;
	},

	getVideoQuality:function(source,stream) {
		if (source.length>0) {
			var query = paella.utils.parameters.list['res' + stream];
			var selected = source[0];
			var win_w = $(window).width();
			var win_h = $(window).height();
			var win_res = (win_w * win_h);
			var selected_res = parseInt(selected.res.w) * parseInt(selected.res.h);
			var selected_diff = Math.abs(win_res - selected_res);
			
			for (var i=0; i<source.length; ++i) {
				var res = source[i].res;
				if (res) {
					if (query != undefined) {
						res = res.w + "x" + res.h;
						if (res==query) {
							 selected = source[i];
							break;
						}
					}
					else{
						var m_res = parseInt(source[i].res.w) * parseInt(source[i].res.h);
						var m_diff = Math.abs(win_res - m_res);
				
						if (m_diff < selected_diff){
							selected_diff = m_diff;
							selected = source[i];
						}
				
				
					}
				}
			}
			return selected;
		}
		else {
			return source;
		}
	},

	setupVideo:function(videoNode,videoData,type,stream) {
		if (videoNode && videoData) {
			var mp4Source = videoData.sources.mp4;
			var oggSource = videoData.sources.ogg;
			var webmSource = videoData.sources.webm;
			var flvSource = videoData.sources.flv;
			var rtmpSource = videoData.sources.rtmp;
			var imageSource = videoData.sources.image;
			
			var selectedSource = null;
			
			if (type=="html") {
				if (mp4Source) {
					selectedSource = mp4Source;
				}
				if (oggSource) {
					selectedSource = oggSource;
				}
				if (webmSource) {
					selectedSource = webmSource;
				}
			}
			else if (flvSource && type=="flash") {
				selectedSource = flvSource;
			}
			else if (mp4Source && type=="flash") {
				selectedSource = mp4Source;
			}
			else if (rtmpSource && type=="streaming"){
				selectedSource = rtmpSource;
			}
			else if (imageSource && type=="image") {
				selectedSource = imageSource;
			}
			
			selectedSource = this.getVideoQuality(selectedSource,stream);
			if (stream=='master') this.currentMasterVideoData = selectedSource;
			else if (stream=='slave') this.currentSlaveVideoData = selectedSource;
			videoNode.addSource(selectedSource);
		}
	},
	
	numberOfStreams:function() {
		return this.sourceData.length;
	},

	getMonostreamMasterProfile:function() {
		return {
			content:"presenter",
			visible:true,
			layer:1,
			rect:[
				{aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
				{aspectRatio:"4/3",left:160,top:0,width:960,height:720},
			]
		}
	},
	
	getMonostreamSlaveProfile:function() {
		return {
			content:"slides",
			visible:false,
			layer:0,
			rect:[
				{aspectRatio:"16/9",left:0,top:0,width:0,height:0},
				{aspectRatio:"4/3",left:0,top:0,width:0,height:0},
			]
		}
	},

	setProfile:function(profileName,onSuccess) {
		var thisClass = this;
		paella.Profiles.loadProfile(profileName,function(profileData) {
			if (thisClass.numberOfStreams()==1) {
				profileData.masterVideo = thisClass.getMonostreamMasterProfile();
				profileData.slaveVideo = thisClass.getMonostreamSlaveProfile();
			}
			thisClass.applyProfileWithJson(profileData);
			onSuccess(profileName);
			paella.utils.cookies.set("lastProfile",profileName);
		});
	},
	
	isReady:function() {
		return this.isMasterReady && this.isSlaveReady;
	},

	hideAllLogos:function() {
		for (var i=0;i<this.logos.length;++i) {
			var logoId = this.logos[i];
			var logo = this.container.getNode(logoId);
			$(logo.domElement).hide();
		}
	},

	showLogos:function(logos) {
		if (logos == undefined) return;	
		var relativeSize = new paella.RelativeVideoSize();
		for (var i=0; i<logos.length;++i) {
			var logo = logos[i];
			var logoId = logo.content;
			var logoNode = this.container.getNode(logoId);
			var rect = logo.rect;
			if (!logoNode) {
				style = {};
				logoNode = this.container.addNode(new paella.DomNode('img',logoId,style));
				logoNode.domElement.setAttribute('src','config/profiles/resources/' + logoId);
				logoNode.domElement.setAttribute('src','config/profiles/resources/' + logoId);
			}
			else {
				$(logoNode.domElement).show();
			}
			var percentTop = relativeSize.percentVSize(rect.top) + '%';
			var percentLeft = relativeSize.percentWSize(rect.left) + '%';
			var percentWidth = relativeSize.percentWSize(rect.width) + '%';
			var percentHeight = relativeSize.percentVSize(rect.height) + '%';
			var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:logo.zIndex};
			$(logoNode.domElement).css(style);
		}
	},

	applyProfileWithJson:function(profileData) {
		var video1 = this.container.getNode(this.video1Id);
		var video2 = this.container.getNode(this.video2Id);

		var background = this.container.getNode(this.backgroundId);

		var rectMaster = profileData.masterVideo.rect[0];
		var rectSlave = profileData.slaveVideo.rect[0];
		var masterDimensions = video1.getDimensions();
		var slaveDimensions = {width:360,height:240};
		if (video2) slaveDimensions = video2.getDimensions();
		var masterAspectRatio = (masterDimensions.height==0) ? 1.3333:masterDimensions.width / masterDimensions.height;
		var slaveAspectRatio = (slaveDimensions.height==0) ? 1.3333:slaveDimensions.width / slaveDimensions.height;
		var profileMasterAspectRatio = 1.333;
		var profileSlaveAspectRatio = 1.333;
		
		var minMasterDiff = 10;
		for (var i = 0; i<profileData.masterVideo.rect.length;++i) {
			var profileMaster = profileData.masterVideo.rect[i];
			if (/([0-9]+)\/([0-9]+)/.test(profileMaster.aspectRatio)) {
				profileMasterAspectRatio = Number(RegExp.$1) / Number(RegExp.$2);
			}
			var masterDiff = Math.abs(profileMasterAspectRatio - masterAspectRatio);
			if (minMasterDiff>masterDiff) {
				minMasterDiff = masterDiff;
				rectMaster = profileMaster;
			}
			//paella.debug.log(profileMasterAspectRatio + ' - ' + masterAspectRatio + ' = ' + masterDiff);
		}
		
		var minSlaveDiff = 10;
		for (var i = 0; i<profileData.slaveVideo.rect.length;++i) {
			var profileSlave = profileData.slaveVideo.rect[i];
			if (/([0-9]+)\/([0-9]+)/.test(profileSlave.aspectRatio)) {
				profileSlaveAspectRatio = Number(RegExp.$1) / Number(RegExp.$2);
			}
			var slaveDiff = Math.abs(profileSlaveAspectRatio - slaveAspectRatio);
			if (minSlaveDiff>slaveDiff) {
				minSlaveDiff = slaveDiff;
				rectSlave = profileSlave;
			}
		}
		
		// Logos
		// Hide previous logos
		this.hideAllLogos();

		// Create or show new logos
		this.showLogos(profileData.logos);

		video1.setRect(rectMaster,true);
		this.currentMasterVideoRect = rectMaster;
		video1.setVisible(profileData.masterVideo.visible,true);
		if (video2) {
			video2.setRect(rectSlave,true);
			this.currentSlaveVideoRect = rectSlave;
			video2.setVisible(profileData.slaveVideo.visible,true);
			video2.setLayer(profileData.slaveVideo.layer);
		}
		video1.setLayer(profileData.masterVideo.layer);
		background.setImage('config/profiles/resources/' + profileData.background.content);
	},

	resizePortrail:function() {
		var width = $(this.domElement).width();
		var relativeSize = new paella.RelativeVideoSize();
		var height = relativeSize.proportionalHeight(width);
		this.container.domElement.style.width = width + 'px';
		this.container.domElement.style.height = height + 'px';
		
		var containerHeight = $(this.domElement).height();
		var newTop = containerHeight / 2 - height / 2;
		this.container.domElement.style.top = newTop + "px";
	},
	
	resizeLandscape:function() {
		var height = $(this.domElement).height();
		var relativeSize = new paella.RelativeVideoSize();
		var width = relativeSize.proportionalWidth(height);
		this.container.domElement.style.width = width + 'px';
		this.container.domElement.style.height = height + 'px';
		this.container.domElement.style.top = '0px';
	},

	onresize:function() { this.parent();
		var relativeSize = new paella.RelativeVideoSize();
		var aspectRatio = relativeSize.aspectRatio();
		var width = $(this.domElement).width();
		var height = $(this.domElement).height();
		var containerAspectRatio = width/height;
		
		if (containerAspectRatio>aspectRatio) {
			this.resizeLandscape();
		}
		else {
			this.resizePortrail();
		}
	}
});



paella.PluginManager = Class.create({
	targets:null,
	pluginList:new Array(),
	eventDrivenPlugins:new Array(),
	
	initialize:function() {
		this.targets = {};
		var thisClass = this;
		paella.events.bind(paella.events.loadPlugins,function(event) {
			thisClass.loadPlugins();
		});
	},

	setTarget:function(pluginType,target) {
		if (target.addPlugin) {
			this.targets[pluginType] = target;
		}
	},

	getTarget:function(pluginType) {
		// PluginManager can handle event-driven events:
		if (pluginType=="eventDriven") {
			return this;
		}
		else {
			var target = this.targets[pluginType];
			return target;
		}
	},
	
	registerPlugin:function(plugin) {
		// Registra los plugins en una lista y los ordena
		this.pluginList.push(plugin);
		this.pluginList.sort(function(a,b) {
			return a.getIndex() - b.getIndex();
		});
	},

	loadPlugins:function() {
		var pluginConfig = paella.player.config.plugins;
		if (!pluginConfig) {
			pluginConfig = {defaultConfig:{enabled:true},list:{}}
		}
		for (var i=0; i<this.pluginList.length; ++i) {
			var plugin = this.pluginList[i];
			var name = plugin.getName();
			var config = pluginConfig.list[name];
			if (!config) {
				config = pluginConfig.defaultConfig;
			}
			else {
				for (var key in pluginConfig.defaultConfig) {
					if (config[key]===undefined) config[key] = pluginConfig.defaultConfig[key];
				}
			}
			if ((config && config.enabled) || !config) {
				paella.debug.log("loading plugin " + name);
				plugin.config = config;
				plugin.load(this);
			}
		}
	},
	
	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (plugin.type=="eventDriven" && isEnabled) {
				plugin.setup();
				thisClass.eventDrivenPlugins.push(plugin);
				var events = plugin.getEvents();
				for (var i=0; i<events.length;++i) {
					var eventName = events[i];
					paella.events.bind(eventName,function(event,params) {
						plugin.onEvent(event.type,params);
					});
				}	
			}
		});
	},
	
	getPlugin:function(name) {
		for (var i=0;i<this.pluginList.length;++i) {
			if (this.pluginList[i].getName()==name) return this.pluginList[i];
		}
		return null;
	}
});

paella.pluginManager = new paella.PluginManager();

paella.Plugin = Class.create({
	type:'',
	
	initialize:function() {
		var thisClass = this;
		paella.pluginManager.registerPlugin(this);
	},

	load:function(pluginManager) {
		var target = pluginManager.getTarget(this.type);
		if (target && target.addPlugin) {
			target.addPlugin(this);
		}
	},

	getRootNode:function(id) {
		return null;
	},
	
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {
		
	},

	getIndex:function() {
		return 0;
	},
	
	getName:function() {
		return "";
	}
});

paella.PopUpContainer = Class.create(paella.DomNode,{
	containers:null,
	currentContainerId:-1,

	initialize:function(id,className) {
		var This = this;
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = className;
		
		this.containers = {};
		paella.events.bind(paella.events.hidePopUp,function(event,params) { This.hideContainer(params.identifier,params.button); });
		paella.events.bind(paella.events.showPopUp,function(event,params) { This.showContainer(params.identifier,params.button); });
	},
	
	hideContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			$(this.domElement).css({width:'0px'});
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
	},
	
	showContainer:function(identifier,button) {
		var container = this.containers[identifier];
		var right = $(button.parentElement).width() - $(button).position().left - $(button).width();
		if (container && this.currentContainerId!=identifier && this.currentContainerId!=-1) {
			var prevContainer = this.containers[this.currentContainerId];
			prevContainer.plugin.willHideContent();
			prevContainer.button.className = prevContainer.button.className.replace(' selected','');
			container.button.className = container.button.className + ' selected';
			$(prevContainer.element).hide();
			prevContainer.plugin.didHideContent();
			container.plugin.willShowContent();
			$(container.element).show();
			var width = $(container.element).width();
			$(this.domElement).css({width:width + 'px',right:right + 'px'});
			this.currentContainerId = identifier;
			container.plugin.didShowContent();
		}
		else if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();
			$(this.domElement).css({width:'0px'});			
			container.button.className = container.button.className.replace(' selected','');
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
		else if (container) {
			container.button.className = container.button.className + ' selected';
			container.plugin.willShowContent();
			$(container.element).show();
			var width = $(container.element).width();
			$(this.domElement).css({width:width + 'px',right:right + 'px'});
			this.currentContainerId = identifier;
			container.plugin.didShowContent();
		}
	},
	
	registerContainer:function(identifier,domElement,button,plugin) {
		var containerInfo = {
			button:button,
			element:domElement,
			plugin:plugin
		};
		this.containers[identifier] = containerInfo;
		// this.domElement.appendChild(domElement);
		$(domElement).hide();
		button.popUpIdentifier = identifier;
		button.sourcePlugin = plugin;
		$(button).click(function(event) {
			paella.events.trigger(paella.events.showPopUp,{identifier:this.popUpIdentifier,button:this});
		});
		$(button).keyup(function(event) {
			if ( (event.keyCode == 13) && (!this.plugin.isPopUpOpen()) ){			
				paella.events.trigger(paella.events.showPopUp,{identifier:this.popUpIdentifier,button:this});
			}
			else if ( (event.keyCode == 27)){			
				paella.events.trigger(paella.events.hidePopUp,{identifier:this.popUpIdentifier,button:this});
			}
		});
		plugin.containerManager = this;
	}
});

paella.TimelineContainer = Class.create(paella.PopUpContainer,{
	hideContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			this.currentContainerId = -1;
			$(this.domElement).css({height:'0px'});
			container.plugin.didHideContent();
		}
	},
	
	showContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId!=identifier && this.currentContainerId!=-1) {
			var prevContainer = this.containers[this.currentContainerId];
			prevContainer.button.className = prevContainer.button.className.replace(' selected','');
			container.button.className = container.button.className + ' selected';
			prevContainer.plugin.willHideContent();
			$(prevContainer.element).hide();
			prevContainer.plugin.didHideContent();
			container.plugin.willShowContent();
			$(container.element).show();
			this.currentContainerId = identifier;
			var height = $(container.element).height();
			$(this.domElement).css({height:height + 'px'});
			container.plugin.didShowContent();
		}
		else if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();		
			container.button.className = container.button.className.replace(' selected','');
			$(this.domElement).css({height:'0px'});
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
		else if (container) {
			container.plugin.willShowContent();
			container.button.className = container.button.className + ' selected';
			$(container.element).show();
			this.currentContainerId = identifier;
			var height = $(container.element).height();
			$(this.domElement).css({height:height + 'px'});
			container.plugin.didShowContent();
		}
	}
});

paella.ButtonPlugin = Class.create(paella.Plugin,{
	type:'button',
	subclass:'',
	container:null,
	containerManager:null,
	
	getAlignment:function() {
		return 'left';	// or right
	},
	
	// Returns the button subclass.
	getSubclass:function() {
		return "myButtonPlugin";
	},

	action:function(button) {
		// Implement this if you want to do something when the user push the plugin button
	},
	
	getName:function() {
		return "ButtonPlugin";
	},
	
	getMinWindowSize:function() {
		return 0;
	},
	
	buildContent:function(domElement) {
		// Override if your plugin 
	},
	
	willShowContent:function() {
		paella.debug.log(this.getName() + " willDisplayContent");
	},

	didShowContent:function() {
		paella.debug.log(this.getName() + " didDisplayContent");
	},

	willHideContent:function() {
		paella.debug.log(this.getName() + " willHideContent");
	},

	didHideContent:function() {
		paella.debug.log(this.getName() + " didHideContent");
	},

	getButtonType:function() {
		//return paella.ButtonPlugin.type.popUpButton;
		//return paella.ButtonPlugin.type.timeLineButton;
		return paella.ButtonPlugin.type.actionButton;
	},
	
	hideButton:function() {
		this.button.setAttribute('aria-hidden', 'false');
		$(this.button).hide();
	},
	
	showButton:function() {
		this.button.setAttribute('aria-hidden', 'true');
		$(this.button).show();
	},
	
	// Utility functions: do not override
	changeSubclass:function(newSubclass) {
		this.subclass = newSubclass;
		this.container.className = this.getClassName();
	},
	
	getClassName:function() {
		return paella.ButtonPlugin.kClassName + ' ' + this.getAlignment() + ' ' + this.subclass;
	},
	
	getContainerClassName:function() {
		if (this.getButtonType()==paella.ButtonPlugin.type.timeLineButton) {
			return paella.ButtonPlugin.kTimeLineClassName + ' ' + this.getSubclass();
		}
		else if (this.getButtonType()==paella.ButtonPlugin.type.popUpButton) {
			return paella.ButtonPlugin.kPopUpClassName + ' ' + this.getSubclass();
		}
	},
	
	setToolTip:function(message) {
		this.button.setAttribute("title", message);
		this.button.setAttribute("aria-label", message);
	},
	
	getDefaultToolTip: function() {
		return "";
	},
	
	isPopUpOpen:function() {
		return (this.button.popUpIdentifier == this.containerManager.currentContainerId);
	}
});

paella.ButtonPlugin.alignment = {
	left:'left',
	right:'right'
}
paella.ButtonPlugin.kClassName = 'buttonPlugin';
paella.ButtonPlugin.kPopUpClassName = 'buttonPluginPopUp';
paella.ButtonPlugin.kTimeLineClassName = 'buttonTimeLine';
paella.ButtonPlugin.type = {
	actionButton:1,
	popUpButton:2,
	timeLineButton:3
}


paella.ButtonPlugin.buildPluginButton = function(plugin,id) {
	plugin.subclass = plugin.getSubclass();
	var elem = document.createElement('div');
	elem.className = plugin.getClassName();
	elem.id = id;
	elem.setAttribute("tabindex", 1000+plugin.getIndex());
	elem.setAttribute("alt", "");
	elem.setAttribute("role", "button");
	elem.plugin = plugin;
	plugin.button = elem;
	plugin.container = elem;
	plugin.setToolTip(plugin.getDefaultToolTip());
	$(elem).click(function(event) {
		this.plugin.action(this);
	});
	$(elem).keyup(function(event) {
		if (event.keyCode == 13) {
			this.plugin.action(this);
		}
	});
	return elem;
}

paella.ButtonPlugin.buildPluginPopUp = function(parent,plugin,id) {
	plugin.subclass = plugin.getSubclass();
	var elem = document.createElement('div');
	parent.appendChild(elem);
	elem.className = plugin.getContainerClassName();
	elem.id = id;
	elem.plugin = plugin;
	plugin.buildContent(elem);
	return elem;
}

paella.VideoOverlayButtonPlugin = Class.create(paella.ButtonPlugin,{
	type:'videoOverlayButton',
	
	// Returns the button subclass.
	getSubclass:function() {
		return "myVideoOverlayButtonPlugin";
	},

	action:function(button) {
		// Implement this if you want to do something when the user push the plugin button
	},

	getName:function() {
		return "VideoOverlayButtonPlugin";
	}
});


paella.EventDrivenPlugin = Class.create(paella.Plugin,{
	type:'eventDriven',
	
	initialize:function() {
		this.parent();
		var events = this.getEvents();
		for (var i = 0; i<events.length;++i) {
			var event = events[i];
			if (event==paella.events.loadStarted) {
				this.onEvent(paella.events.loadStarted);
			}
		}
	},

	getEvents:function() {
		return new Array();
	},

	onEvent:function(eventType,params) {
	},
	
	getName:function() {
		return "EventDrivenPlugin";
	}
});


paella.TimeControl = Class.create(paella.DomNode,{
	initialize:function(id) {
		this.parent('div',id,{left:"0%"});
		this.domElement.className = 'timeControlOld';
		this.domElement.className = 'timeControl';
		//this.domElement.innerHTML = "0:00:00";
		var thisClass = this;
		paella.events.bind(paella.events.timeupdate,function(event,params) { thisClass.onTimeUpdate(params); });
	},

	onTimeUpdate:function(memo) {
		var videoContainer = memo.videoContainer;
		var real = { start:0, end:videoContainer.duration };
		var trimmed = { start:videoContainer.trimStart(), end:videoContainer.trimEnd() };
		var currentTime = memo.currentTime - trimmed.start;
		var duration = trimmed.end - trimmed.start;
		var percent = currentTime * 100 / duration;
		if (this.domElement.className=="timeControlOld") {	// Support for old style time control
			this.domElement.style.left = percent + '%';
		}
		this.domElement.innerHTML = this.secondsToHours(parseInt(currentTime));
	},

	secondsToHours:function(sec_numb) {
		var hours   = Math.floor(sec_numb / 3600);
		var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
		var seconds = sec_numb - (hours * 3600) - (minutes * 60);

		if (hours < 10) {hours = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		return hours + ':' + minutes + ':' + seconds;
	}
});

paella.PlaybackBar = Class.create(paella.DomNode,{
	playbackFullId:'',
	updatePlayBar:true,
	timeControlId:'',

	initialize:function(id) {
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = "playbackBar";
		this.domElement.setAttribute("alt", "");
		this.domElement.setAttribute("title", "Timeline Slider");
		this.domElement.setAttribute("aria-label", "Timeline Slider");
		this.domElement.setAttribute("role", "slider");
		this.domElement.setAttribute("aria-valuemin", "0");
		this.domElement.setAttribute("aria-valuemax", "100");
		this.domElement.setAttribute("aria-valuenow", "0");
		this.domElement.setAttribute("tabindex", "1100");
		$(this.domElement).keyup(function(event){
			switch(event.keyCode) {
				case 37: //Left
					var curr = 100*paella.player.videoContainer.currentTime()/paella.player.videoContainer.duration();
					var selectedPosition = curr - 5;
					paella.events.trigger(paella.events.seekTo,{ newPositionPercent:selectedPosition });
					break;
				case 39: //Right
					var curr = 100*paella.player.videoContainer.currentTime()/paella.player.videoContainer.duration();
					var selectedPosition = curr + 5;
					paella.events.trigger(paella.events.seekTo,{ newPositionPercent:selectedPosition });
					break;
			}
		});

		this.playbackFullId = id + "_full";
		this.timeControlId = id + "_timeControl";
		var playbackFull = new paella.DomNode('div',this.playbackFullId,{width:'0%'});
		playbackFull.domElement.className = "playbackBarFull";
		this.addNode(playbackFull);
		this.addNode(new paella.TimeControl(this.timeControlId));
		var thisClass = this;
		paella.events.bind(paella.events.timeupdate,function(event,params) { thisClass.onTimeUpdate(params); });
		$(this.domElement).bind('mousedown',function(event) { paella.utils.mouseManager.down(thisClass,event); event.stopPropagation(); });
		$(playbackFull.domElement).bind('mousedown',function(event) { paella.utils.mouseManager.down(thisClass,event); event.stopPropagation();  });
		$(this.domElement).bind('mousemove',function(event) { paella.utils.mouseManager.move(event); });
		$(playbackFull.domElement).bind('mousemove',function(event) { paella.utils.mouseManager.move(event); });
		$(this.domElement).bind('mouseup',function(event) { paella.utils.mouseManager.up(event); });
		$(playbackFull.domElement).bind('mouseup',function(event) { paella.utils.mouseManager.up(event); });
	},

	playbackFull:function() {
		return this.getNode(this.playbackFullId);
	},

	timeControl:function() {
		return this.getNode(this.timeControlId);
	},

	setPlaybackPosition:function(percent) {
		this.playbackFull().domElement.style.width = percent + '%';
	},

	isSeeking:function() {
		return !this.updatePlayBar;
	},

	onTimeUpdate:function(memo) {
		if (this.updatePlayBar) {
			var videoContainer = memo.videoContainer;
			var real = { start:0, end:videoContainer.duration };
			var trimmed = { start:videoContainer.trimStart(), end:videoContainer.trimEnd() };
			var currentTime = memo.currentTime - trimmed.start;
			var duration = trimmed.end - trimmed.start;
			this.setPlaybackPosition(currentTime * 100 / duration);
		}
	},

	down:function(event,x,y) {
		this.updatePlayBar = false;
		this.move(event,x,y);
	},

	move:function(event,x,y) {
		var width = $(this.domElement).width();
		var selectedPosition = x - $(this.domElement).offset().left; // pixels
		if (selectedPosition<0) {
			selectedPosition = 0;
		}
		else if (selectedPosition>width) {
			selectedPosition = 100;
		}
		else {
			selectedPosition = selectedPosition * 100 / width; // percent
		}
		this.setPlaybackPosition(selectedPosition);
	},

	up:function(event,x,y) {
		var width = $(this.domElement).width();
		var selectedPosition = x - $(this.domElement).offset().left; // pixels
		if (selectedPosition<0) {
			selectedPosition = 0;
		}
		else if (selectedPosition>width) {
			selectedPosition = 100;
		}
		else {
			selectedPosition = selectedPosition * 100 / width; // percent
		}
		paella.events.trigger(paella.events.seekTo,{ newPositionPercent:selectedPosition });
		this.updatePlayBar = true;
	}
});

paella.PlaybackControl = Class.create(paella.DomNode,{
	playbackBarId:'',
	pluginsContainer:null,
	popUpPluginContainer:null,
	timeLinePluginContainer:null,

	playbackPluginsWidth:0,
	popupPluginsWidth:0,

	minPlaybackBarSize:120,

	playbackBarInstance:null,

	buttonPlugins:[],

	addPlugin:function(plugin) {
		var thisClass = this;

		var id = 'buttonPlugin' + this.buttonPlugins.length;
		this.buttonPlugins.push(plugin);
		var button = paella.ButtonPlugin.buildPluginButton(plugin,id);
		plugin.button = button;
		this.pluginsContainer.domElement.appendChild(button);
		$(button).hide();
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				$(plugin.button).show();
				plugin.setup();
				var id = 'buttonPlugin' + thisClass.buttonPlugins.length;
				if (plugin.getButtonType()==paella.ButtonPlugin.type.popUpButton) {
					var parent = thisClass.popUpPluginContainer.domElement;
					var popUpContent = paella.ButtonPlugin.buildPluginPopUp(parent,plugin,id + '_container');
					thisClass.popUpPluginContainer.registerContainer(plugin.getName(),popUpContent,button,plugin);
				}
				else if (plugin.getButtonType()==paella.ButtonPlugin.type.timeLineButton) {
					var parent = thisClass.timeLinePluginContainer.domElement;
					var timeLineContent = paella.ButtonPlugin.buildPluginPopUp(parent, plugin,id + '_timeline');
					thisClass.timeLinePluginContainer.registerContainer(plugin.getName(),timeLineContent,button,plugin);
				}
			}
			else {
				thisClass.pluginsContainer.domElement.removeChild(plugin.button);
			}
		});
	},

	initialize:function(id) {
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = 'playbackControls';
		this.playbackBarId = id + '_playbackBar';

		var thisClass = this;
		this.pluginsContainer = new paella.DomNode('div',id + '_playbackBarPlugins');
		this.pluginsContainer.domElement.className = 'playbackBarPlugins';
		this.pluginsContainer.domElement.setAttribute("role", "toolbar");
		this.addNode(this.pluginsContainer);

		this.popUpPluginContainer = new paella.PopUpContainer(id + '_popUpPluginContainer','popUpPluginContainer');
		this.addNode(this.popUpPluginContainer);
		this.timeLinePluginContainer = new paella.TimelineContainer(id + '_timelinePluginContainer','timelinePluginContainer');
		this.addNode(this.timeLinePluginContainer);
		this.addNode(new paella.PlaybackBar(this.playbackBarId));

		paella.pluginManager.setTarget('button',this);
	},

	playbackBar:function() {
		if (this.playbackBarInstance==null) {
			this.playbackBarInstance = this.getNode(this.playbackBarId);
		}
		return this.playbackBarInstance;
	},

	onresize:function() {
		paella.debug.log("resize playback bar");
		var windowSize = $(this.domElement).width();

		for (var i=0;i<this.buttonPlugins.length;++i) {
			var plugin = this.buttonPlugins[i];
			var minSize = plugin.getMinWindowSize();
			if (minSize>0 && windowSize<minSize) {
				$(plugin.container).hide();
			}
			else {
				$(plugin.container).show();
			}
		}
	}
});

paella.ControlsContainer = Class.create(paella.DomNode,{
	playbackControlId:'',
	editControlId:'',
	isEnabled:true,

	autohideTimer:null,
	hideControlsTimeMillis:3000,

	playbackControlInstance:null,

	videoOverlayButtons:null,

	buttonPlugins:[],

	addPlugin:function(plugin) {
		var thisClass = this;
		var id = 'videoOverlayButtonPlugin' + this.buttonPlugins.length;
		this.buttonPlugins.push(plugin);
		var button = paella.ButtonPlugin.buildPluginButton(plugin,id);
		this.videoOverlayButtons.domElement.appendChild(button);
		plugin.button = button;
		$(button).hide();
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				$(plugin.button).show();
				plugin.setup();
			}
		});
	},

	initialize:function(id) {
		this.parent('div',id);
		this.viewControlId = id + '_view';
		this.playbackControlId = id + '_playback';
		this.editControlId = id + '_editor';
		this.addNode(new paella.PlaybackControl(this.playbackControlId));
		var thisClass = this;
		paella.events.bind(paella.events.showEditor,function(event) { thisClass.onShowEditor(); });
		paella.events.bind(paella.events.hideEditor,function(event) { thisClass.onHideEditor(); });

		paella.events.bind(paella.events.play,function(event) { thisClass.onPlayEvent(); });
		paella.events.bind(paella.events.pause,function(event) { thisClass.onPauseEvent(); });
		paella.events.bind('mousemove',function(event) { thisClass.onMouseMoveEvent(); });
		paella.events.bind(paella.events.endVideo,function(event) { thisClass.onEndVideoEvent(); });
		paella.events.bind('keydown',function(event) { thisClass.onKeyEvent() });

		this.videoOverlayButtons = new paella.DomNode('div',id + '_videoOverlayButtonPlugins');
		this.videoOverlayButtons.domElement.className = 'videoOverlayButtonPlugins';
		this.videoOverlayButtons.domElement.setAttribute("role", "toolbar");
		this.addNode(this.videoOverlayButtons);

		paella.pluginManager.setTarget('videoOverlayButton',this);
	},

	onShowEditor:function() {
		var editControl = this.editControl();
		if (editControl) $(editControl.domElement).hide();
	},

	onHideEditor:function() {
		var editControl = this.editControl();
		if (editControl) $(editControl.domElement).show();
	},

//	showEditorButton:function() {
//		this.addNode(new EditControl(this.editControlId));
//	},

	enterEditMode:function() {
		var playbackControl = this.playbackControl();
		var editControl = this.editControl();
		if (playbackControl && editControl) {
			$(playbackControl.domElement).hide();
		}
	},

	exitEditMode:function() {
		var playbackControl = this.playbackControl();
		var editControl = this.editControl();
		if (playbackControl && editControl) {
			$(playbackControl.domElement).show();
		}
	},

	playbackControl:function() {
		if (this.playbackControlInstance==null) {
			this.playbackControlInstance = this.getNode(this.playbackControlId);
		}
		return this.playbackControlInstance;
	},

	editControl:function() {
		return this.getNode(this.editControlId);
	},

	disable:function() {
		this.isEnabled = false;
		this.hide();
	},

	enable:function() {
		this.isEnabled = true;
		this.show();
	},

	hide:function() {
		var This = this;
		var userAgent = new UserAgent();
		if (!userAgent.browser.IsMobileVersion) {
			$(this.domElement).animate({opacity:0.0},{duration:300, complete:function(){
				This.domElement.setAttribute('aria-hidden', 'true');
				//$(This.domElement).hide();
			}});
			paella.events.trigger(paella.events.controlBarWillHide);
		}
		else {
			paella.debug.log("Mobile version: controls will not hide");
		}
	},

	show:function() {
		if (this.isEnabled) {
			if (this.domElement.style.opacity!=1.0) {
				this.domElement.style.opacity = 1.0;
				this.domElement.setAttribute('aria-hidden', 'false');
				//$(this.domElement).show();
				paella.events.trigger(paella.events.controlBarDidShow);
			}
		}
	},

	autohideTimeout:function() {
		var playbackBar = this.playbackControl().playbackBar();
		if (playbackBar.isSeeking()) {
			this.restartAutohideTimer();
		}
		else {
			this.hideControls();
		}
	},

	hideControls:function() {
		this.hide();
	},

	showControls:function() {
		this.show();
	},

	onPlayEvent:function() {
		this.restartAutohideTimer();
	},

	onPauseEvent:function() {
		this.clearAutohideTimer();
	},

	onEndVideoEvent:function() {
		this.show();
		this.clearAutohideTimer();
	},

	onKeyEvent:function() {
		this.showControls();
		if (paella.player.videoContainer.isReady() && !paella.player.videoContainer.paused()) {
			this.restartAutohideTimer();
		}
	},

	onMouseMoveEvent:function() {
		this.showControls();
		if (paella.player.videoContainer.isReady() && !paella.player.videoContainer.paused()) {
			this.restartAutohideTimer();
		}
	},

	clearAutohideTimer:function() {
		if (this.autohideTimer!=null) {
			this.autohideTimer.cancel();
			this.autohideTimer = null;
		}
	},

	restartAutohideTimer:function() {
		this.clearAutohideTimer();
		var thisClass = this;
		this.autohideTimer = new paella.utils.Timer(function(timer) {
			thisClass.autohideTimeout();
		},this.hideControlsTimeMillis);
	},

	onresize:function() {
		this.playbackControl().onresize();
	}
});


paella.LoaderContainer = Class.create(paella.DomNode,{
	timer:null,
	loader:null,
	loaderPosition:0,

	initialize:function(id) {
		this.parent('div',id,{position:'fixed',backgroundColor:'white',opacity:'0.7',top:'0px',left:'0px',right:'0px',bottom:'0px',zIndex:10000});
		this.loader = this.addNode(new paella.DomNode('div','',{position:'fixed',width:'128px',height:'128px',top:'50%',left:'50%',marginLeft:'-64px',marginTop:'-64px',backgroundImage:'url(resources/images/loader.png)'}));
		var thisClass = this;
		paella.events.bind(paella.events.loadComplete,function(event,params) { thisClass.loadComplete(params); });
		this.timer = new paella.utils.Timer(function(timer) {
			thisClass.loaderPosition -= 128;
			thisClass.loader.domElement.style.backgroundPosition = thisClass.loaderPosition + 'px';
			timer.timeout = timer.timeout * 2;
		},1000);
		this.timer.repeat = true;
	},
	
	loadComplete:function(params) {
		$(this.domElement).hide();
		this.timer.repeat = false;
	}
});

paella.KeyManager = Class.create({
	isPlaying:false,
	Keys:{Space:32,Left:37,Up:38,Right:39,Down:40,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90},
	
	enabled:true,

	initialize:function() {
		var thisClass = this;
		paella.events.bind(paella.events.loadComplete,function(event,params) { thisClass.loadComplete(event,params); });
		paella.events.bind(paella.events.play,function(event) { thisClass.onPlay(); });
		paella.events.bind(paella.events.pause,function(event) { thisClass.onPause(); });
	},
	
	loadComplete:function(event,params) {
		var thisClass = this;
		paella.events.bind("keyup",function(event) { thisClass.keyUp(event); });
	},

	onPlay:function() {
		this.isPlaying = true;
	},

	onPause:function() {
		this.isPlaying = false;
	},

	keyUp:function(event) {
		if (!this.enabled) return;
		
		// Matterhorn standard keys
		if (event.altKey && event.ctrlKey) {
			if (event.which==this.Keys.P) {
				this.togglePlayPause();
			}
			else if (event.which==this.Keys.S) {
				this.pause();
			}
			else if (event.which==this.Keys.M) {
				this.mute();
			}
			else if (event.which==this.Keys.U) {
				this.volumeUp();
			}
			else if (event.which==this.Keys.D) {
				this.volumeDown();
			}
		}
		else { // Paella player keys
			if (event.which==this.Keys.Space) {
				this.togglePlayPause();
			}
			else if (event.which==this.Keys.Up) {
				this.volumeUp();
			}
			else if (event.which==this.Keys.Down) {
				this.volumeDown();
			}
			else if (event.which==this.Keys.M) {
				this.mute();
			}
		}
	},
	
	togglePlayPause:function() {
		if (this.isPlaying) {
			paella.events.trigger(paella.events.pause);
		}
		else {
			paella.events.trigger(paella.events.play);
		}
	},
	
	pause:function() {
		paella.events.trigger(paella.events.pause);
	},
	
	mute:function() {
		var videoContainer = paella.player.videoContainer;
		var newVolume = 0;
		if (videoContainer.volume()==0) newVolume = 1.0;
		paella.events.trigger(paella.events.setVolume,{master:newVolume,slave:0});
	},
	
	volumeUp:function() {
		var videoContainer = paella.player.videoContainer;
		var volume = videoContainer.volume();
		volume += 0.1;
		volume = (volume>1) ? 1.0:volume;
		paella.events.trigger(paella.events.setVolume,{master:volume,slave:0});
	},
	
	volumeDown:function() {
		var videoContainer = paella.player.videoContainer;
		var volume = videoContainer.volume();
		volume -= 0.1;
		volume = (volume<0) ? 0.0:volume;
		paella.events.trigger(paella.events.setVolume,{master:volume,slave:0});
	}
});

paella.keyManager = new paella.KeyManager();


paella.AccessControl = Class.create({
	permissions:{
		canRead:false,
		canContribute:false,
		canWrite:false,
		loadError:true,
		isAnonymous:false
	},
	
	userData:{
		username:'',
		name:'',
		lastname: '',
		avatar:'',
	},

	checkAccess:function(onSuccess) {
		onSuccess(this.permissions);
	}
});

paella.DefaultAccessControl = Class.create(paella.AccessControl,{
	checkAccess:function(onSuccess) {
		this.permissions.canRead = false;
		this.permissions.canContribute = false;
		this.permissions.canWrite = false;
		this.permissions.loadError = false;
		this.permissions.isAnonymous = true;
		this.userData.username = 'anonymous';
		this.userData.name = 'Anonymous';
		this.userData.avatar = 'resources/images/default_avatar.png';
		onSuccess(this.permissions);
	}
});

paella.VideoLoader = Class.create({
	streams:[],		// {sources:{mp4:{src:"videourl.mp4",type:"video/mp4"},
					//			 ogg:{src:"videourl.ogv",type:"video/ogg"},
					//			 webm:{src:"videourl.webm",type:"video/webm"},
					//			 flv:{src:"videourl.flv",type:"video/x-flv"},
					//			 rtmp:{src:"rtmp://server.com/endpoint/url.loquesea",type="video/mp4 | video/x-flv"},
					//			 image:{frames:{frame_1:'frame_1.jpg',...frame_n:'frame_n.jpg'},duration:183},
					//	preview:'video_preview.jpg'}
	frameList:[],	// frameList[timeInstant] = { id:"frame_id", mimetype:"image/jpg", time:timeInstant, url:"image_url"}

	loadStatus:false,
	codecStatus:false,

	isH264Capable:function() {
		var videoElement = document.createElement('video');
		var h264 = videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"');
		if (h264=="") h264 = videoElement.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
		h264 = (h264=='probably') || (h264=='maybe');
		return h264;
	},

	isOggCapable:function() {
		if (paella.utils.userAgent.browser.IsMobileVersion) return false;
		var videoElement = document.createElement('video');
		var ogg = videoElement.canPlayType('video/ogg; codecs="theora"');
		ogg = (ogg=='probably') || (ogg=='maybe');
		return ogg;
	},

	isWebmCapable:function() {
		if (paella.utils.userAgent.browser.IsMobileVersion) return false;
		var videoElement = document.createElement('video');
		var webm = videoElement.canPlayType('video/webm; codecs="vp8, vorbis"');
		webm = (webm=='probably') || (webm=='maybe');
		return webm;
	},
	
	isImageCapable:function() {
		return true;
	},
	
	isHtmlVideoCompatible:function(streamIndex) {
		var status = false;
		if (this.streams.length>streamIndex) {
			var stream = this.streams[streamIndex];
			var h264 = this.isH264Capable();
			var ogg = this.isOggCapable();
			var webm = this.isWebmCapable();
			
			paella.debug.log("Browser video capabilities: mp4=" + ((h264) ? 'yes':'no') + ', ogg=' + ((ogg) ? 'yes':'no') + ', webm=' + ((webm) ? 'yes':'no'));
			
			if (stream.sources.mp4 && h264 && !/rtmp:\/\//.test(stream.sources.mp4.src)) {
				status = true;
			}
			else if (stream.sources.ogg && ogg) {
				status = true;
			}
			else if (stream.sources.webm && webm) {
				status = true;
			}
		}
		return status;
	},
	
	isImageCompatible:function(streamIndex) {
		var status = false;
		if (this.streams.length>streamIndex) {
			var stream = this.streams[streamIndex];
			if (stream.sources.image) {
				status = true;
			}
		}
		return status;
	},
	
	isFlashCompatible:function(streamIndex) {
		var ua = new UserAgent();
		var status = false;
		
		if (this.streams.length>streamIndex) {
			var stream = this.streams[streamIndex];
				
			if (stream.sources.mp4) status = true;
			else if (stream.sources.flv) status = true;
		}

		return status && !ua.browser.IsMobileVersion;
	},

	isStreamingCompatible:function(streamIndex) {
		var ua = new UserAgent();
		var status = false;

		if (this.streams.length>streamIndex) {
			var stream = this.streams[streamIndex];
				
			if (stream.sources.rtmp) status = true;
			else status = false;
		}

		return status && !ua.browser.IsMobileVersion;
	},
	
	isStreamCompatible:function(streamIndex,method) {
		var status = false;
		if (method.enabled) {
			if (method.name=='html' && this.isHtmlVideoCompatible(streamIndex)) {
				status = true;
			}
			else if (method.name=='flash' && this.isFlashCompatible(streamIndex)) {
				status = true;
			}
			else if (method.name=='streaming' && this.isStreamingCompatible(streamIndex)) {
				status = true;
			}
			else if (method.name=='image' && this.isImageCompatible(streamIndex)) {
				status = true;
			}
		}
		return status;
	},

	getPreferredMethod:function(streamIndex) {
		var userAgent = new UserAgent();
		var preferredMethod = null;
		var methods = paella.player.config.player.methods;
		
		// Mobile browsers can only play one stream
		if (userAgent.browser.IsMobileVersion && streamIndex>=1) {
			for (var i=0;i<methods.length;++i) {
				if (methods[i].name=='image' && methods[i].enabled && this.isStreamCompatible(streamIndex,methods[i])) {
					preferredMethod = methods[i];
				}
			}
		} 
		else {
			for (var i=0;i<methods.length;++i) {
				if (this.isStreamCompatible(streamIndex,methods[i])) {
					preferredMethod = methods[i];
					break;
				}
			}
		}
		
		return preferredMethod;
	},

	loadVideo:function(videoId,onSuccess) {
		// This function must to:
		//	- load this.streams and this.frameList
		// 	- Check streams compatibility using this.isStreamCompatible(streamIndex)
		//	- Set this.loadStatus = true if load is Ok, or false if something gone wrong
		//	- Set this.codecStatus = true if the browser can reproduce all streams
		//	- Call onSuccess()
		onSuccess();
	}
});

paella.PlayerBase = Class.create({
	config:null,
	playerId:'',
	mainContainer:null,
	videoContainer:null,
	controls:null,
	accessControl:null,
	
	checkCompatibility:function() {
		if (paella.utils.parameters.get('ignoreBrowserCheck')) {
			return true;
		}
		var userAgent = new UserAgent();
		if (userAgent.browser.IsMobileVersion) return true;
		if (userAgent.browser.Chrome || userAgent.browser.Safari || userAgent.browser.Firefox || userAgent.browser.Opera ||
				(userAgent.browser.Explorer && userAgent.browser.Version.major>=9)) {
			return true;
		}
		else {
			var errorMessage = paella.dictionary.translate("It seems that your browser is not HTML 5 compatible");
			paella.events.trigger(paella.events.error,{error:errorMessage});
			var message = errorMessage + '<div style="display:block;width:470px;height:140px;margin-left:auto;margin-right:auto;font-family:Verdana,sans-sherif;font-size:12px;"><a href="http://www.google.es/chrome" style="color:#004488;float:left;margin-right:20px;"><img src="resources/images/chrome.png" style="width:80px;height:80px" alt="Google Chrome"></img><p>Google Chrome</p></a><a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home" style="color:#004488;float:left;margin-right:20px;"><img src="resources/images/explorer.png" style="width:80px;height:80px" alt="Internet Explorer 9"></img><p>Internet Explorer 9</p></a><a href="http://www.apple.com/safari/" style="float:left;margin-right:20px;color:#004488"><img src="resources/images/safari.png" style="width:80px;height:80px" alt="Safari"></img><p>Safari 5</p></a><a href="http://www.mozilla.org/firefox/" style="float:left;color:#004488"><img src="resources/images/firefox.png" style="width:80px;height:80px" alt="Firefox"></img><p>Firefox 12</p></a></div>';
			message += '<div style="margin-top:30px;"><a id="ignoreBrowserCheckLink" href="#" onclick="window.location = window.location + \'&ignoreBrowserCheck=true\'">' + paella.dictionary.translate("Continue anyway") + '</a></div>';
			paella.messageBox.showError(message,{height:'40%'});
		}
		return false;
	},

	initialize:function(playerId) {
		if (!this.checkCompatibility()) {
			paella.debug.log('It seems that your browser is not HTML 5 compatible');
		}
		else {
			paella.player = this;
			this.playerId = playerId;
			this.mainContainer = $('#' + this.playerId)[0];
			this.accessControl = paella.initDelegate.initParams.accessControl;
			var thisClass = this;
			paella.events.bind(paella.events.loadComplete,function(event,params) { thisClass.loadComplete(event,params); });
		}
	},

	includePlugins:function(productionPluginFile,devPluginsDir,devPluginsArray,productionPluginCss) {
		if (!productionPluginCss) productionPluginCss = 'plugins/plugins.css';

		if (/debug/.test(window.location.href)) {
			paella.debug.debug = true;
			for (var i=0; i<devPluginsArray.length; i++) {
				var jsFile = devPluginsArray[i];
				var cssFile = jsFile.substr(0, jsFile.lastIndexOf(".")) + ".css";
				paella.debug.log(devPluginsDir + jsFile + ", " + devPluginsDir + cssFile);
				paella.utils.require(devPluginsDir + jsFile);
				paella.utils.importStylesheet(devPluginsDir + cssFile);
			}
		}
		else {
			paella.utils.importStylesheet(productionPluginCss);
		}
	},

	loadComplete:function(event,params) {
		
	}
});

paella.InitDelegate = Class.create({
	initParams:{
		configUrl:'config/config.json',
		dictionaryUrl:'config/dictionary',
		editorDictionaryUrl:'config/editor_dictionary',
		accessControl:new paella.DefaultAccessControl(),
		videoLoader:new paella.VideoLoader()
	},

	initialize:function(params) {
		if (params) {
			for (var key in params) {
				this.initParams[key] = params[key];
			}
		}
	},

	getId:function() {
		return paella.utils.parameters.get('id');
	},
	
	loadDictionary:function(onSuccess) {
		var asyncLoader = new paella.AsyncLoader();
		asyncLoader.addCallback(new paella.DictionaryCallback(this.initParams.dictionaryUrl));
		asyncLoader.addCallback(new paella.DictionaryCallback(this.initParams.editorDictionaryUrl));
		asyncLoader.load(function() {
				onSuccess();
			},
			function() {
				onSuccess();
			}
		);
	},

	loadConfig:function(onSuccess) {
		var configUrl = this.initParams.configUrl;
		var params = {};
		params.url = configUrl;
		paella.ajax.get(params,function(data,type,returnCode) {
				if (typeof(data)=='string') {
					try {
						data = JSON.parse(data);
					}
					catch (e) {
						onSuccess({});
					}
				}
				paella.dictionary.addDictionary(data);
				onSuccess(data);
			},
			function(data,type,returnCode) {
				onSuccess({});
			});
	},

	loadEditorConfig:function(onSuccess) {
		var data = {
			cssPath:'resources/ui/jquery-ui.css'
		};
		onSuccess(data);
	}
});

var paellaPlayer = null;
paella.plugins = {};
paella.plugins.events = {};
paella.initDelegate = null;

var PaellaPlayer = Class.create(paella.PlayerBase,{
	player:null,

	selectedProfile:'',
	videoIdentifier:'',
	editor:null,
	loader:null,

	// Video data:
	videoData:null,

	setProfile:function(profileName) {
		var thisClass = this;
		this.videoContainer.setProfile(profileName,function(newProfileName) {
			thisClass.selectedProfile = newProfileName;
		});
	},

	initialize:function(playerId) {
		this.parent(playerId);

		// if initialization ok
		if (this.playerId==playerId) {
			this.loadPaellaPlayer();
			this.includePlugins('javascript/paella_plugins.js','plugins/',paella.pluginList);

			var thisClass = this;
			paella.events.bind(paella.events.setProfile,function(event,params) {
				thisClass.setProfile(params.profileName);
			});
		}
	},

	loadPaellaPlayer:function() {
		var thisClass = this;
		this.loader = new paella.LoaderContainer('paellaPlayer_loader');
		$('body')[0].appendChild(this.loader.domElement);
		paella.events.trigger(paella.events.loadStarted);

		paella.initDelegate.loadDictionary(function() {
			paella.initDelegate.loadConfig(function(config) {
				thisClass.onLoadConfig(config);
			});
		});
	},

	onLoadConfig:function(configData) {
		paella.data = new paella.Data(configData);

		this.config = configData;
		this.videoIdentifier = paella.initDelegate.getId();

		if (this.videoIdentifier) {
			if (this.mainContainer) {
				this.videoContainer = new paella.VideoContainer(this.playerId + "_videoContainer");
				this.controls = new paella.ControlsContainer(this.playerId + '_controls');
				this.mainContainer.appendChild(this.videoContainer.domElement);
				this.mainContainer.appendChild(this.controls.domElement);
			}
			$(window).resize(function(event) { paella.player.onresize(); });
			this.onload();
		}
	},

	onload:function() {
		var thisClass = this;
		this.accessControl.checkAccess(function(permissions) {
			if (!permissions.loadError) {
				paella.debug.log("read:" + permissions.canRead + ", contribute:" + permissions.canContribute + ", write:" + permissions.canWrite);
				if (permissions.canWrite) {
					//thisClass.setupEditor();
					paella.events.bind(paella.events.showEditor,function(event) { thisClass.showEditor(); });
					paella.events.bind(paella.events.hideEditor,function(event) { thisClass.hideEditor(); });
				}
				if (permissions.canRead) {
					thisClass.loadVideo();
					thisClass.videoContainer.publishVideo();
				}
				else {
					thisClass.unloadAll(paella.dictionary.translate("You are not authorized to view this resource"));
				}
			}
			else if (permissions.isAnonymous) {
				var errorMessage = paella.dictionary.translate("You are not logged in");
				thisClass.unloadAll(errorMessage);
				paella.events.trigger(paella.events.error,{error:errorMessage});
			}
			else {
				var errorMessage = paella.dictionary.translate("You are not authorized to view this resource");
				thisClass.unloadAll(errorMessage);
				paella.events.trigger(paella.events.error,{error:errorMessage});
			}
		});
	},

	onresize:function() {
		this.videoContainer.onresize();
		this.controls.onresize();
		if (this.editor) {
			this.editor.resize();
		}
	},

	unloadAll:function(message) {
		$('#playerContainer')[0].innerHTML = "";
		var loaderContainer = $('#paellaPlayer_loader')[0];
		paella.messageBox.showError(message);
	},

	//setupEditor:function() {
		//if (paella.extended) return;
	//	if (paella.editor && paella.player.config.editor && paella.player.config.editor.enabled && !paella.utils.userAgent.browser.IsMobileVersion) {
			//this.controls.showEditorButton();
	//	}
	//	else {
	//		setTimeout('paella.player.setupEditor()',500);
	//	}
	//},

	showEditor:function() {
		new paella.editor.Editor();
	},

	hideEditor:function() {
	},

	loadVideo:function() {
		if (this.videoIdentifier) {
			var thisClass = this;
			var loader = paella.initDelegate.initParams.videoLoader;
			this.onresize();
			loader.loadVideo(this.videoIdentifier,function() {
				var master = loader.streams[0];
				var slave = loader.streams[1];
				var frames = loader.frameList;

				if (loader.loadStatus) {
					var preferredMethodMaster = loader.getPreferredMethod(0);
					var preferredMethodSlave  = loader.getPreferredMethod(1);
					var status = true;

					if (preferredMethodMaster) {
						status = paella.player.videoContainer.setMasterSource(master,preferredMethodMaster.name);
					}

					if (preferredMethodSlave) {
						status = paella.player.videoContainer.setSlaveSource(slave,preferredMethodSlave.name);
					}
					else {
						paella.player.videoContainer.setMonoStreamMode();
					}


					if (paella.player.isLiveStream()) {
						$(paella.player.controls.playbackControl().playbackBar().domElement).hide();
					}

					if (status) {
						paella.events.trigger(paella.events.loadPlugins,{pluginManager:paella.pluginManager});

						// The loadComplete event depends on the readyState of presenter and slide video
						new paella.utils.Timer(function(timer) {
							if (thisClass.videoContainer.isReady()) {
								paella.events.trigger(paella.events.loadComplete,{masterVideo:master,slaveVideo:slave,frames:frames});
								thisClass.onresize();
								timer.repeat = false;
							}
							else {
								timer.repeat = true;
							}
						},500);
					}
					else {
						var errorMessage = paella.dictionary.translate("Your browser is not compatible with the required video codec");
						paella.messageBox.showError(errorMessage);
						paella.events.trigger(paella.events.error,{error:errorMessage});
					}
				}
				else {
					var errorMessage = paella.dictionary.translate("Error loading video data");
					paella.messageBox.showError(errorMessage);
					paella.events.trigger(paella.events.error,{error:errorMessage});
				}
			});
		}
	},

	isLiveStream:function() {
		if (this._isLiveStream===undefined) {
			var loader = paella.initDelegate.initParams.videoLoader;
			var checkSource = function(sources,index) {
				if (sources.length>index) {
					var source = sources[index];
					for (var key in source.sources) {
						if (typeof(source.sources[key])=="object") {
							for (var i=0; i<source.sources[key].length; ++i) {
								var stream = source.sources[key][i];
								if (stream.isLiveStream) return true;
							}
						}
					}
				}
				return false;
			}
			this._isLiveStream = checkSource(loader.streams,0) || checkSource(loader.streams,1);
		}
		return this._isLiveStream;
	},

	loadPreviews:function() {
		var streams = paella.initDelegate.initParams.videoLoader.streams;
		var slavePreviewImg = null;

		var masterPreviewImg = streams[0].preview;
		if (streams.length >=2) {
			slavePreviewImg = streams[1].preview;
		}
		if (masterPreviewImg) {
			var masterRect = paella.player.videoContainer.overlayContainer.getMasterRect();
			this.masterPreviewElem = document.createElement('img');
			this.masterPreviewElem.src = masterPreviewImg;
			paella.player.videoContainer.overlayContainer.addElement(this.masterPreviewElem,masterRect);
		}
		if (slavePreviewImg) {
			var slaveRect = paella.player.videoContainer.overlayContainer.getSlaveRect();
			this.slavePreviewElem = document.createElement('img');
			this.slavePreviewElem.src = slavePreviewImg;
			paella.player.videoContainer.overlayContainer.addElement(this.slavePreviewElem,slaveRect);
		}
		paella.events.bind(paella.events.timeUpdate,function(event) {
			paella.player.unloadPreviews();
		});
	},

	unloadPreviews:function() {
		if (this.masterPreviewElem) {
			paella.player.videoContainer.overlayContainer.removeElement(this.masterPreviewElem);
			this.masterPreviewElem = null;
		}
		if (this.slavePreviewElem) {
			paella.player.videoContainer.overlayContainer.removeElement(this.slavePreviewElem);
			this.slavePreviewElem = null;
		}
	},

	loadComplete:function(event,params) {
		var thisClass = this;
		var time = paella.utils.parameters.get('time');
		var master = paella.player.videoContainer.masterVideo();
		var getProfile = paella.utils.parameters.get('profile');
		var cookieProfile = paella.utils.cookies.get('lastProfile');
		if (getProfile) {
			this.setProfile(getProfile);
		}
		else if (cookieProfile) {
			this.setProfile(cookieProfile);
		}
		else {
			this.setProfile(this.config.defaultProfile);
		}

		// TODO: No sé muy bien por qué pero si no se reproduce el vídeo al menos un segundo no funciona el setSeek
		paella.events.trigger(paella.events.play);
		new paella.utils.Timer(function(timer) {
			var autoplay = paella.utils.parameters.list['autoplay'] ? paella.utils.parameters.list['autoplay']:'';
			autoplay = autoplay.toLowerCase();

			var playerConfig = paella.player.config.player;
			if (playerConfig.stream0Audio===false && paella.player.videoContainer.numberOfStreams()>=1) {
				paella.player.videoContainer.masterVideo().setVolume(0);
			}
			else if (paella.player.videoContainer.numberOfStreams()>=1) {
				paella.player.videoContainer.masterVideo().setVolume(1);
			}
			if (playerConfig.stream1Audio!==true && paella.player.videoContainer.numberOfStreams()>=2) {
				paella.player.videoContainer.slaveVideo().setVolume(1);
			}
			else if (paella.player.videoContainer.numberOfStreams()>=2) {
				paella.player.videoContainer.slaveVideo().setVolume(0);
			}

			if (autoplay!='true' && autoplay!='yes') paella.events.trigger(paella.events.pause);
			if (time) {
				var duration = master.duration();
				var trimStart = thisClass.videoContainer.trimStart();
				var trimEnd = thisClass.videoContainer.trimEnd();
				if (thisClass.videoContainer.trimEnabled()) {
					duration = trimEnd - trimStart;
				}
				var hour = 0;
				var minute = 0;
				var second = 0;
				if (/([0-9]+)h/.test(time)) {
					hour = Number(RegExp.$1);
				}
				if (/([0-9]+)m/.test(time)) {
					minute = Number(RegExp.$1);
				}
				if (/([0-9]+)s/.test(time)) {
					second = Number(RegExp.$1);
				}
				var currentTime = hour * 60 * 60 + minute * 60 + second;
				var currentPercent = currentTime * 100 / duration;
				paella.events.trigger(paella.events.seekTo,{newPositionPercent:currentPercent});
			}
			thisClass.loadPreviews();
			if (paella.player.config.editor &&
				paella.player.config.editor.enabled &&
				paella.player.config.editor.loadOnStartup) {
				paella.events.trigger(paella.events.showEditor);
			}
		},1000);
	}
});

/* Initializer function */
function initPaellaEngage(playerId,initDelegate) {
	if (!initDelegate) {
		initDelegate = new paella.InitDelegate();
	}
	paella.initDelegate = initDelegate;
	var lang = navigator.language || window.navigator.userLanguage;
	paellaPlayer = new PaellaPlayer(playerId,paella.initDelegate);
}


/*
	Paella HTML 5 Multistream Player
	Copyright (C) 2013  Universitat Politècnica de València

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

paella.ExtendedPlugin = Class.create(paella.Plugin, {
	type:'extendedPlugin',
	
	getName:function() { return "es.upv.paella.extended.Plugin"; },
	
	checkEnabled:function(onSuccess) {
		onSuccess(paella.extended!=null);
	},
	
	getIndex:function() {
		return 10000;
	}
});

paella.RightBarPlugin = Class.create(paella.ExtendedPlugin,{
	type:'rightBarPlugin',
	getName:function() { return "es.upv.paella.extended.RightBarPlugin"; },

	buildContent:function(domElement) {
		
	}
});

paella.TabBarPlugin = Class.create(paella.ExtendedPlugin,{
	type:'tabBarPlugin',
	getName:function() { return "es.upv.paella.extended.TabBarPlugin"; },
	
	getTabName:function() {
		return "New Tab";
	},
	
	action:function(tab) {
		
	},

	buildContent:function(domElement) {
		
	},
	
	setToolTip:function(message) {
		this.button.setAttribute("title", message);
		this.button.setAttribute("aria-label", message);
	},
	
	getDefaultToolTip: function() {
		return "";
	}	
});

paella.Extended = Class.create({
	container:null,
	paellaHeader:null,
	paellaContainer:null,
	rightContainer:null,
	bottomContainer:null,

	settings:{
		containerId:'paellaExtendedContainer',
		paellaHeaderId:'playerHeader',
		paellaContainerId:'playerContainer',
		rightContainerId:'paella_right',
		bottomContainerId:'paella_bottom',
		containerClass:'paellaExtendedContainer',
		playerHeaderClass:'playerHeader',
		playerContainerClass:'playerContainer',
		rightContainerClass:'rightContainer',
		bottomContainerClass:'bottomContainer',
		aspectRatio:1.777777,
		initDelegate:new paella.InitDelegate({accessControl:new paella.AccessControl(),videoLoader:new paella.VideoLoader})
	},
	
	rightBarPlugins:[],
	tabBarPlugins:[],
	
	currentTabIndex:0,
	bottomContainerTabs:null,
	bottomContainerContent:null,

	initialize:function(settings) {
		this.saveSettings(settings);
		this.loadPaellaExtended();
		var thisClass = this;
		$(window).resize(function(event) { thisClass.onresize() });
	},
	
	saveSettings:function(settings) {
		if (settings) {
			for (var key in settings) {
				this.settings[key] = settings[key];
			}
		}
	},
	
	loadPaellaExtended:function() {
		this.container = $('#' + this.settings.containerId)[0];
		if (!this.container) {
			var body = $('body')[0];
			body.innerHTML = "";
			this.container = document.createElement('div');
			this.container.id = this.settings.containerId;
			this.container.className = this.settings.containerClass;
			body.appendChild(this.container);
		}
		else {
			this.container.innerHTML = "";
			this.container.className = this.settings.containerClass;
		}

		this.paellaHeader = document.createElement('div');
		this.paellaHeader.id = this.settings.paellaHeaderId;
		this.paellaHeader.className=this.settings.playerHeaderClass;
		this.container.appendChild(this.paellaHeader);
		
		this.paellaContainer = document.createElement('div');
		this.paellaContainer.id = this.settings.paellaContainerId;
		this.paellaContainer.className=this.settings.playerContainerClass;
		this.container.appendChild(this.paellaContainer);
		
		this.rightContainer = document.createElement('div');
		this.rightContainer.id = this.settings.rightContainerId;
		this.rightContainer.className = this.settings.rightContainerClass;
		this.container.appendChild(this.rightContainer);
		
		this.bottomContainer = document.createElement('div');
		this.bottomContainer.id = this.settings.bottomContainerId;
		this.bottomContainer.className=this.settings.bottomContainerClass;
		this.container.appendChild(this.bottomContainer);
		
		var tabs = document.createElement('div');
		tabs.id = 'bottomContainer_tabs';
		tabs.className = 'bottomContainerTabs';
		this.bottomContainerTabs = tabs;
		this.bottomContainer.appendChild(tabs);
		
		var bottomContent = document.createElement('div');
		bottomContent.id = 'bottomContainer_content';
		bottomContent.className = 'bottomContainerContent';
		this.bottomContainerContent = bottomContent;
		this.bottomContainer.appendChild(bottomContent);
		

		var thisClass = this;
		$(document).bind(paella.events.loadComplete,function(event,params) {
			thisClass.setMainProfile();
		});

		
		this.initPlugins();

		initPaellaEngage(this.paellaContainer.id,this.settings.initDelegate);
		this.onresize();
	},
	
	initPlugins:function() {
		paella.pluginManager.setTarget('rightBarPlugin',this);
		paella.pluginManager.setTarget('tabBarPlugin',this);
	},
	
	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				plugin.setup();
				if (plugin.type=='rightBarPlugin') {
					thisClass.rightBarPlugins.push(plugin);
					thisClass.addRightBarPlugin(plugin);
				}
				if (plugin.type=='tabBarPlugin') {
					thisClass.tabBarPlugins.push(plugin);
					thisClass.addTabPlugin(plugin);
				}	
			}
		});
	},
	
	showTab:function(tabIndex) {
		for (var i=0;i<this.tabBarPlugins.length;++i) {
			var tabItem = $("#tab_" + i)[0];
			var tabContent = $("#tab_content_" + i)[0];
		
			if (i==tabIndex) {
				tabItem.className = "bottomContainerTabItem enabledTabItem";
				tabContent.className = "bottomContainerContent enabledTabContent";
			}
			else {
				tabItem.className = "bottomContainerTabItem disabledTabItem";
				tabContent.className = "bottomContainerContent disabledTabContent";			
			}
		}
	},

	addTabPlugin:function(plugin) {
		var tabIndex = this.currentTabIndex;
		
		// Add tab
		var tabItem = document.createElement('div');
		tabItem.id = "tab_" + tabIndex;
		tabItem.className = "bottomContainerTabItem disabledTabItem";
		tabItem.innerHTML = plugin.getTabName();
		tabItem.plugin = plugin;
		var thisClass = this;
		$(tabItem).click(function(event) { if (/disabledTabItem/.test(this.className)) { thisClass.showTab(tabIndex); this.plugin.action(this); } });
		$(tabItem).keyup(function(event) {
			if (event.keyCode == 13) {
				if (/disabledTabItem/.test(this.className)) { thisClass.showTab(tabIndex); this.plugin.action(this); } 
			}
		});		
		this.bottomContainerTabs.appendChild(tabItem);
		
		// Add tab content
		var tabContent = document.createElement('div');
		tabContent.id = "tab_content_" + tabIndex;
		tabContent.className = "bottomContainerContent disabledTabContent " + plugin.getSubclass();
		this.bottomContainerContent.appendChild(tabContent);
		plugin.buildContent(tabContent);
		
		plugin.button = tabItem;
		plugin.container = tabContent;

		plugin.button.setAttribute("tabindex", 3000+plugin.getIndex());
		plugin.button.setAttribute("alt", "");
		plugin.setToolTip(plugin.getDefaultToolTip());
		

		// Show tab
		if (this.firstTabShown===undefined) {
			this.showTab(tabIndex);
			this.firstTabShown = true;
		}
		++this.currentTabIndex;
	},
	
	addRightBarPlugin:function(plugin) {
		var container = document.createElement('div');
		container.className = "rightBarPluginContainer " + plugin.getSubclass();
		this.rightContainer.appendChild(container);
		plugin.buildContent(container);
	},

	setMainProfile:function() {
		var profile = 'full';
		var cookieProfile = paella.utils.cookies.get("paella.extended.profile");
		if (cookieProfile) {
			profile = cookieProfile;
		}
		else if ((paella) && (paella.player) && (paella.player.config) && (paella.player.config.player) && (paella.player.config.player.defaultProfile)){
			profile = paella.player.config.player.defaultProfile;
		}
		this.setProfile(profile);
	},
	
	setProfile:function(profileName) {
		paella.utils.cookies.set("paella.extended.profile", profileName);
		var thisClass = this;
		this.container.className = this.settings.containerClass + " " + profileName;
		this.paellaHeader.className = this.settings.playerHeaderClass + " " + profileName;
		this.paellaContainer.className = this.settings.playerContainerClass + " " + profileName;
		this.rightContainer.className = this.settings.rightContainerClass + " " + profileName;
		this.bottomContainer.className = this.settings.bottomContainerClass + " " + profileName;
		this.onresize();
		if (paella.player) {
			paella.player.onresize();
		}
	},
	
	getProfile:function() {
		var regExp = new RegExp(this.settings.containerClass + " ([a-zA-Z0-9]+)");
		if (regExp.test(paella.extended.container.className)) {
			return RegExp.$1;
		}
		return '';
		//return /paellaExtendedContainer ([a-zA-Z0-9]+)/.test(paella.extended.container.className)
	},

	onresize:function() {
	/*
		var aspect = this.settings.aspectRatio;
		var width = jQuery(this.paellaContainer).width();
		var height = width / aspect;
		this.paellaContainer.style.height = height + 'px';
	*/
	}
});

function initPaellaExtended(settings) {
	paella.extended = new paella.Extended(settings);
}


paella.editor = {};

paella.editor.utils = {
	mouse: {
		mouseDownTarget:'',
	}
}

var bootstrapUtils = {
	elem:function(type,params,inner) {
		var elem = document.createElement(type);
		for (var attr in params) {
			elem.setAttribute(attr, params[attr]);
		}
		if (inner) {elem.innerHTML = inner;}
		return elem;
	},
	
	append:function(parent,child) {
		parent.appendChild(child);
		return child;
	},

	navbar:function(title,subclass) {
		var nav = this.elem("div",{"class":"navbar tiny " + subclass});
		var navInner = this.append(nav,this.elem("div",{"class":"navbar-inner tiny"}))
		if (title) {
			this.append(navInner,this.elem("div",{"class":"brand","href":"JavaScript:void(0);"},title));
		}
		return nav;
	},
	
	dropdown:function(title,subclass,items,size,icon,alignRight) {
		return this.dropButton(title,subclass,items,size,icon,alignRight,'');
	},
	
	dropup:function(title,subclass,items,size,icon,alignRight) {
		return this.dropButton(title,subclass,items,size,icon,alignRight,'dropup');
	},

	dropButton:function(title,subclass,items,size,icon,alignRight,type) {
		var align = '';
		if (alignRight) align = 'pull-right';
		
		var dropup = this.elem('div',{'class':'btn-group ' + type + ' ' + subclass + ' ' + align});
		if (icon) {
			title = '<i class="' + icon + '"></i>&nbsp;<span class="text">' + title + '</span>&nbsp;';
		}
		else {
			title = '&nbsp;<span class="text">' + title + '</span>&nbsp;';
		}
		
		var btn = this.append(dropup,this.elem('a',{'class':'btn dropdown-toggle ' + size,'data-toggle':'dropdown','href':'JavaScript:void(0);'},title + '<span class="caret"></span>'));
		
		
		var ul = this.append(dropup,this.elem('ul',{'class':'dropdown-menu'}));
		for (var key in items) {
			var action = items[key];
			var li = this.append(ul,this.elem('li'));
			this.append(li,this.elem('a',{'href':'JavaScript:void(0);','onclick':action,'class':'listItem'},key));
		}
		return dropup;
	},
	
	buttonGroup:function(buttons,btnSubclass,isPushButton) {
		var group = document.createElement('div');
		group.className = 'btn-group';
		
		
		for (var i=0;i<buttons.length;++i) {
			var button = document.createElement('button');
			button.className = 'btn ' + btnSubclass;
			button.innerHTML = buttons[i].label;
			button.buttonData = buttons[i];
			button.buttonData.disabledClass = button.className;
			button.title = buttons[i].hint;
			if (isPushButton) {
				$(button).click(function(event) {
					this.buttonData.onclick(this.buttonData);
				});				
			}
			else {
				$(button).click(function(event) {
					for (var j=0;j<this.parentNode.childNodes.length;++j) {
						this.parentNode.childNodes[j].className = this.buttonData.disabledClass;
					}
					this.className = this.className + ' active';
					this.buttonData.onclick(this.buttonData);
				});
			}
			group.appendChild(button);
		}
		return group;
	},
	
	button:function(label,className,hint,onclick) {
		var button = document.createElement('button');
		button.className = 'btn ' + className;
		button.innerHTML = label;
		button.title = hint;
		$(button).click(function(event) { onclick(this); });
		return button;
	}
};

paella.editor.PluginSaveCallback = Class.create(paella.AsyncLoaderCallback,{
	plugin:null,
	
	initialize:function(plugin) {
		this.parent("pluginSaveCallback");
		this.plugin = plugin;
	},
	
	load:function(onSuccess,onError) {
		this.plugin.onSave(function() {
			onSuccess();
		});
	}
});

paella.editor.PluginDiscardCallback = Class.create(paella.AsyncLoaderCallback,{
	plugin:null,
	
	initialize:function(plugin) {
		this.parent("pluginDiscardCallback");
		this.plugin = plugin;
	},
	
	load:function(onSuccess,onError) {
		this.plugin.onDiscard(function() {
			onSuccess();
		});
	}
});

paella.editor.PluginManager = Class.create({
	trackPlugins:[],
	rightBarPlugins:[],
	toolbarPlugins:[],

	initialize:function() {
		this.initPlugins();	
	},
	
	initPlugins:function() {
		paella.pluginManager.setTarget('editorTrackPlugin',this);
		paella.pluginManager.setTarget('editorRightBarPlugin',this);
		paella.pluginManager.setTarget('editorToolbarPlugin',this);
	},
	
	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				plugin.setup();
				if (plugin.type=='editorTrackPlugin') {
					thisClass.trackPlugins.push(plugin);
				}
				if (plugin.type=='editorRightBarPlugin') {
					thisClass.rightBarPlugins.push(plugin);
				}
				if (plugin.type=='editorToolbarPlugin') {
					thisClass.toolbarPlugins.push(plugin);
				}
			}
		});
	},
	
	onTrackChanged:function(newTrack) {
		// Notify tab plugins
		for (var i=0;i<this.rightBarPlugins.length;++i) {
			var plugin = this.rightBarPlugins[i];
			plugin.onTrackSelected(newTrack);
		}
		
		// Notify toolbar plugins
		for (var i=0;i<this.toolbarPlugins.length;++i) {
			var plugin = this.toolbarPlugins[i];
			plugin.onTrackSelected(newTrack);
		}
	},
	
	onSave:function(onDone) {
		var asyncLoader = new paella.AsyncLoader();
		for (var i=0;i<this.trackPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.trackPlugins[i]));
		}
		for (var i=0;i<this.rightBarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.rightBarPlugins[i]));
		}
		for (var i=0;i<this.toolbarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.toolbarPlugins[i]));
		}
		asyncLoader.load(function() {
				paella.events.trigger(paella.events.didSaveChanges);
				onDone(true);
			},
			function() {
				onDone(false);
			});
	},
	
	onDiscard:function(onDone) {
		var asyncLoader = new paella.AsyncLoader();
		for (var i=0;i<this.trackPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.trackPlugins[i]));
		}
		for (var i=0;i<this.rightBarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.rightBarPlugins[i]));
		}
		for (var i=0;i<this.toolbarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.toolbarPlugins[i]));
		}
		asyncLoader.load(function() {
				onDone(true);
			},
			function() {
				onDone(false);
			});
	}
});

paella.editor.pluginManager = new paella.editor.PluginManager();

paella.editor.EditorPlugin = Class.create(paella.Plugin,{
	onTrackSelected:function(newTrack) {
		if (newTrack) {
			paella.debug.log(this.getName() + ": New track selected " + newTrack.getName());
		}
		else {
			paella.debug.log("No track selected");
		}
	},

	onSave:function(onDone) {
		// Paella Editor calls this function when the user clicks on "save" button
		onDone();
	},
	
	onDiscard:function(onDone) {
		onDone();
	},
	
	contextHelpString:function() {
		return "";
	}
});

paella.editor.TrackPlugin = Class.create(paella.editor.EditorPlugin,{
	type:'editorTrackPlugin',

	getIndex:function() {
		return 10000;
	},

	getName:function() {
		return "editorTrackPlugin";
	},
	
	getTrackName:function() {
		return "My Track";
	},
	
	getColor:function() {
		return "#5500FF";
	},
	
	getTextColor:function() {
		return "#F0F0F0";
	},
	
	getTrackType:function() {
		return "secondary";
	},
	
	getTrackItems:function() {
		var exampleTracks = [{id:1,s:10,e:70},{id:2,s:110,e:340}];
		return exampleTracks;
	},
	
	allowResize:function() {
		return true;
	},
	
	allowDrag:function() {
		return true;
	},
	
	allowEditContent:function() {
		return true;
	},
	
	onTrackChanged:function(id,start,end) {
		//paella.debug.log('Track changed: id=' + id + ", start: " + start + ", end:" + end);
		paella.events.trigger(paella.events.documentChanged);
	},
	
	onTrackContentChanged:function(id,content) {
		//paella.debug.log('Track content changed: id=' + id + ', new content: ' + content);
		paella.events.trigger(paella.events.documentChanged);
	},
	
	onSelect:function(trackItemId) {
		paella.debug.log('Track list selected: ' + this.getTrackName());
	},
	
	onUnselect:function() {
		paella.debug.log('Track list unselected: ' + this.getTrackName());
	},
	
	onDblClick:function(trackData) {
	},
	
	getTools:function() {
		return [];
	},

	onToolSelected:function(toolName) {
		//paella.debug.log('Tool selected: ' + toolName);
		paella.events.trigger(paella.events.documentChanged);
	},

	isToolEnabled:function(toolName) {
		return true;
	},
	
	buildToolTabContent:function(tabContainer) {
		
	},

	getSettings:function() {
		return null;
	}
});

paella.editor.MainTrackPlugin = Class.create(paella.editor.TrackPlugin,{
	getTrackType:function() {
		return "master";
	},
	
	getTrackItems:function() {
		var exampleTracks = [{id:1,s:30,e:470}];
		return exampleTracks;
	},
	
	getName:function() {
		return "editorMainTrackPlugin";
	},
});

paella.editor.RightBarPlugin = Class.create(paella.editor.EditorPlugin,{
	type:'editorRightBarPlugin',
	
	getIndex:function() {
		return 10000;
	},
	
	getName:function() {
		return "editorRightbarPlugin";
	},
	
	getTabName:function() {
		return "My Rightbar Plugin";
	},
	
	getContent:function() {
		var container = document.createElement('div');
		container.innerHTML = "Rightbar plugin";
		return container;
	},
	
	onLoadFinished:function() {
		
	}
});

paella.editor.EditorToolbarPlugin = Class.create(paella.editor.EditorPlugin,{
	type:'editorToolbarPlugin',
	trackList:[],
	
	getIndex:function() {
		return 10000;
	},
	
	getName:function() {
		return "editorToolbarPlugin";
	},
		
	getButtonName:function() {
		return "Toolbar Plugin";
	},
	
	getIcon:function() {
		return "icon-edit";
	},

	getOptions:function() {
		return []
	},
	
	onOptionSelected:function(optionIndex) {
	}
});

paella.editor.Tabbar = Class.create({
	navbar:null,
	container:null,
	
	initialize:function(parent) {
		this.navbar = bootstrapUtils.navbar("","navbar-inverse");
		parent.appendChild(this.navbar);
		this.container = $(this.navbar).find(".navbar-inner")[0];
	}
});

paella.editor.Toolbar = Class.create({
	navbar:null,
	container:null,
	toolButton:null,
	selectedToolUtils:null,
	editorMenu:null,
	toolbarPlugins:null,

	initialize:function(parent) {
		this.navbar = bootstrapUtils.navbar("","navbar-inverse");
		parent.appendChild(this.navbar);
		this.container = $(this.navbar).find(".navbar-inner")[0];
		this.buildTrackTools();
		this.buildPlaybackControls();
		this.buildEditorMenu();
		this.buildPlugins();
	},
	
	buildTrackTools:function() {
		var selectionTrackName = paella.dictionary.translate("Selection");
		var tools = {};
		tools[selectionTrackName] = "paella.editor.instance.bottomBar.toolbar.onToolChanged('select','" + selectionTrackName + "')";
		var trackPlugins = paella.editor.pluginManager.trackPlugins;
		for (var i in trackPlugins) {
			var plugin = trackPlugins[i];
			var label = plugin.getTrackName();
			// TODO: tool icon
			var action = "paella.editor.instance.bottomBar.toolbar.onToolChanged('" + plugin.getName() + "','" + plugin.getTrackName() +"')";
			//var action = "paella.editor.instance.bottomBar.timeline.selectTrackList('" + plugin.getName() + "');";
			tools[label] = action;
		}
		var defaultText = paella.dictionary.translate("Tool") + ": " + paella.dictionary.translate('Selection');
		this.toolButton = bootstrapUtils.dropdown(defaultText,'toolDropdown',tools,'btn-mini','',false);
		this.container.appendChild(this.toolButton);
		this.selectedToolUtils = document.createElement('span');
		this.selectedToolUtils.className = 'editorToolbar_selectedToolUtils';
		this.container.appendChild(this.selectedToolUtils);
	},
	
	buildPlaybackControls:function() {
		var playbackControls = document.createElement('span');
		playbackControls.className = 'editorToolbarPlaybackControls';
		this.container.appendChild(playbackControls);
		var buttonData = [];
		buttonData.push({
			label:'<i class="icon-step-backward icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.seekTo,{newPositionPercent:0});
			}
		});
		buttonData.push({
			label:'<i class="icon-play icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.play);
			}
		});
		buttonData.push({
			label:'<i class="icon-pause icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.pause);
			}
		});
		buttonData.push({
			label:'<i class="icon-step-forward icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.seekTo,{newPositionPercent:99});
			}
		});
		playbackControls.appendChild(bootstrapUtils.buttonGroup(buttonData,'btn-mini',true));
	},
	
	buildPlugins:function() {
		if (!this.toolbarPlugins) {
			this.toolbarPlugins = document.createElement('span');
			this.container.appendChild(this.toolbarPlugins);
		}
		else {
			this.toolbarPlugins.innerHTML = "";
		}
		var plugins = paella.editor.pluginManager.toolbarPlugins;
		for (var i=0;i<plugins.length;++i) {
			var plugin = plugins[i];
			var pluginName = plugin.getName();
			var name = plugin.getButtonName();
			var options = plugin.getOptions();
			var optionsObject = {}
			var icon = plugin.getIcon();
			if (icon) { icon = icon + ' icon-white'; }
			for (var j=0;j<options.length;++j) {
				optionsObject[options[j]] = "paella.editor.instance.bottomBar.toolbar.selectPluginOption('" + pluginName + "'," + j + ")";
			}
			var button = bootstrapUtils.dropdown(name,'editorDropdown',optionsObject,'btn-mini',icon,true);
			this.toolbarPlugins.appendChild(button);
		}
	},

	buildEditorMenu:function() {
		var tools = {
		};
		tools[paella.dictionary.translate("Save and close editor")] = "paella.editor.instance.bottomBar.toolbar.saveAndClose();";
		tools[paella.dictionary.translate("Save changes")] = "paella.editor.instance.bottomBar.toolbar.save();";
		tools[paella.dictionary.translate("Discard changes and close")] = "paella.editor.instance.bottomBar.toolbar.discardAndClose();";
		this.editorMenu = bootstrapUtils.dropdown(paella.dictionary.translate('Paella Editor'),'editorDropdown',tools,'btn-mini','icon-edit icon-white',true);
		this.container.appendChild(this.editorMenu);
	},
	
	selectPluginOption:function(pluginName,optionIndex) {
		var plugins = paella.editor.pluginManager.toolbarPlugins;
		for (var i=0;i<plugins.length;++i) {
			var plugin = plugins[i];
			if (plugin.getName()==pluginName) {
				plugin.onOptionSelected(optionIndex);
			}
		}
		this.buildPlugins();
	},

	onToolChanged:function(toolName,trackName) {
		paella.editor.instance.bottomBar.timeline.selectTrackList(toolName);
		var textElem = $(this.toolButton).find('.text')[0];
		textElem.innerHTML = paella.dictionary.translate("Tool") + ": " + trackName;
		this.setupTrackTool(toolName);
	},
	
	setupTrackTool:function(toolName) {
		this.selectedToolUtils.innerHTML = "";
		var plugin = null;
		for (var i=0;i<paella.editor.pluginManager.trackPlugins.length;++i) {
			plugin = paella.editor.pluginManager.trackPlugins[i];
			if (toolName==plugin.getName()) {
				break;
			}
			else {
				plugin = null;
			}
		}
		if (plugin) {
			var buttonData = [];
			var tools = plugin.getTools()
			for (var i=0;i<tools.length;++i) {
				buttonData.push({
					label:tools[i].label,
					plugin:plugin,
					toolName:tools[i].name,
					hint:tools[i].hint,
					onclick:function(buttonData) {
						if (buttonData.plugin.onToolSelected(buttonData.toolName)) {
							paella.editor.instance.bottomBar.timeline.rebuildTrack(plugin.getName());
							paella.editor.pluginManager.onTrackChanged(plugin);
							paella.editor.instance.rightBar.updateCurrentTab();
						}
					}
				});
			}
			if (buttonData.length>0) {
				var toolLabel = document.createElement('span');
				toolLabel.innerHTML = '&nbsp;' + paella.dictionary.translate('Options') + ':';
				this.selectedToolUtils.appendChild(toolLabel);
				this.selectedToolUtils.appendChild(bootstrapUtils.buttonGroup(buttonData,'btn-mini'));
			}
		}
	},
	
	saveAndClose:function() {
		paella.editor.pluginManager.onSave(function(status) {
			paella.editor.instance.unloadEditor();
		});
	},
	
	save:function() {
		paella.editor.pluginManager.onSave(function() {
			
		});
	},
	
	discardAndClose:function() {
		paella.editor.pluginManager.onDiscard(function(status) {
			paella.debug.log("Discard changes");
			paella.editor.instance.unloadEditor();
		});
	}
});

paella.editor.Timeline = Class.create({
	container:null,
	containerMinHeight:133,
	content:null,
	timeMarks:null,
	tracks:null,
	zoom:100,
	trackItemList:null,
	trackItemIndex:{
		back:5,
		front:10
	},
	trackItemOpacity:{
		back:0.5,
		front:0.9
	},
	currentTrackList:null,
	
	initialize:function(parent) {
		var defaultHeight = this.containerMinHeight;
		
		this.trackItemList = [];
		this.container = document.createElement('div');
		this.container.className = 'editorTimelineContainer';
		$(this.container).css({
			"height":defaultHeight + "px"
		});
		parent.appendChild(this.container);
		
		
		this.content = document.createElement('div');
		this.content.className = 'editorTimelineContent';
		$(this.content).css({
			'width':this.zoom + '%',
			'height':'100%'
		});
		this.container.appendChild(this.content);
		
		this.timeMarks = document.createElement('div');
		this.timeMarks.className = "editorTimeLineTimeMarks";
		this.content.appendChild(this.timeMarks);
		this.buildTimeMarks();

		this.tracks = document.createElement('div');
		this.tracks.className = "editorTimeLineTracks";
		this.tracks.style.minHeight = this.containerMinHeight + 'px';
		this.content.appendChild(this.tracks);
		
		this.loadPlugins();
		
		this.setupCursors();
	},
	
	setupCursors:function() {
		var cursor = document.createElement('div');
		cursor.className = 'editorTimelineCursor';
		this.container.appendChild(cursor);
		var content = this.content;
		$(this.container).mousemove(function(event) {
			var duration = paella.player.videoContainer.duration(true);
			var contentWidth = $(content).width();
			var position = $(content).position().left
			var left = event.pageX - position;
			$(cursor).css({'left':left + 'px'});
			
			var time = left * duration / contentWidth;
			cursor.innerHTML =  paella.utils.timeParse.secondsToTime(time);
		});
		
		var currentTimeCursor = document.createElement('div');
		currentTimeCursor.className = 'editorTimelineCursor currentTime';
		this.container.appendChild(currentTimeCursor);
		$(document).bind(paella.events.timeUpdate,function(event,params) {
			var duration = paella.player.videoContainer.duration(true);
			var contentWidth = $(content).width();
			var currentTime = params.currentTime;

			var left = currentTime * contentWidth / duration;
			
			$(currentTimeCursor).css({'left':left + 'px'});

			currentTimeCursor.innerHTML =  paella.utils.timeParse.secondsToTime(currentTime);
		});
		
		$(document).bind(paella.events.seekToTime,function(event,params) {
			var duration = paella.player.videoContainer.duration(true);
			var contentWidth = $(content).width();
			var currentTime = params.time;

			var left = currentTime * contentWidth / duration;
			
			$(currentTimeCursor).css({'left':left + 'px'});

			currentTimeCursor.innerHTML =  paella.utils.timeParse.secondsToTime(currentTime);
		});

		$(this.container).mouseup(function(event) {
			if (paella.editor.utils.mouse.mouseDownTarget!='track') {
				var duration = paella.player.videoContainer.duration(true);
				var contentWidth = $(content).width();
				var position = $(content).position().left
				var left = event.pageX - position;
				var time = left * 100 / contentWidth;
				$(document).trigger(paella.events.seekTo,{newPositionPercent:time});	
			}			
		});
	},

	loadPlugins:function() {
		var thisClass = this;
		var container = this.tracks;
		container.innerHTML = "";
		var plugins = paella.editor.pluginManager.trackPlugins;
		var secTrackIndex = 0;
		var subclass = "";
		for (var i in plugins) {
			if (plugins[i].getTrackType()=='secondary') {
				subclass = "track" + secTrackIndex;
				++secTrackIndex;
			}
			else {
				subclass = "";
			}
			var track = new paella.editor.Track(container,plugins[i],subclass);
			this.trackItemList.push(track);
		}
		this.selectTrackList(this.currentTrackList);
	},

	rebuildTrack:function(pluginName) {
		var plugins = paella.editor.pluginManager.trackPlugins;
		for (var i in this.trackItemList) {
			var track = this.trackItemList[i];
			if (track.getName()==pluginName) {
				track.rebuild();
			}
		}
	},
	
	getHeight:function() {
		if ($(this.container).height()<this.containerMinHeight) return this.containerMinHeight;
		else return $(this.container).height();
	},

	buildTimeMarks:function() {
		var zoom = this.zoom;
		this.timeMarks.innerHTML = "";
		var barWidth = $(this.timeMarks).width();
		var duration = paella.player.videoContainer.duration(true);
		var markWidth = 70;
		var numberOfMarks = Math.ceil(barWidth / markWidth);
		var timeIncrement = duration / numberOfMarks;
		var remainder = barWidth % markWidth;
		var odd = true;
		var currentTime = 0;
		for (var i=0;i<numberOfMarks;++i) {
			var mark = document.createElement('div');
			mark.className = "editorTimeLineMark";
			if (odd) mark.className = mark.className + " odd";
			if (i==(numberOfMarks-1)) {
				markWidth = remainder;
				mark.className += " last";
			}
			mark.style.width = markWidth + 'px';
			mark.innerHTML = paella.utils.timeParse.secondsToTime(currentTime);//"0:00:00";
			currentTime += timeIncrement;
			this.timeMarks.appendChild(mark);
			var padding = 0; //$(mark).css('padding-left');
			var finalWidth = markWidth - padding;
			mark.style.width = finalWidth + 'px';
			odd = !odd;
		}
	},

	setZoom:function(percent) {
		var thisClass = this;
		this.zoom = percent;
		this.timeMarks.innerHTML = "";
		$(this.content).animate({'width':percent + '%'},{
			complete:function() {
				thisClass.buildTimeMarks();
			}
		});
	},
	
	onresize:function() {
		this.buildTimeMarks();
		var height = $(this.tracks).outerHeight();
		if (paella.utils.userAgent.system.Windows) {
			var padding = $(this.tracks).outerHeight() - $(this.tracks).height();
			height = height + padding - 3; 
		}

		$(this.container).css('height',height + 'px');
	},
	
	selectTrackList:function(trackItem,noEvent,selectTrackItem) {
		if (trackItem=='select') {
			this.currentTrackList = null;
		}
		else {
			for (var i in this.trackItemList) {
				var trackItemObj = this.trackItemList[i];
				var container = trackItemObj.container;
				if (trackItemObj.getName()==trackItem) {
					this.currentTrackList = trackItemObj;
					$(container).css({
						'z-index':this.trackItemIndex.front,
						'opacity':this.trackItemOpacity.front
					});
				}
				else {
					$(container).css({
						'z-index':this.trackItemIndex.back,
						'opacity':this.trackItemOpacity.back
					});	
				}			
			}
		}
		
		var plugin = null;
		if (this.currentTrackList) {
			plugin = this.currentTrackList.plugin;
			if (selectTrackItem>0) this.currentTrackList.selectTrack(selectTrackItem,noEvent);
		}
		if (!noEvent) {
			paella.editor.pluginManager.onTrackChanged(plugin);
			paella.editor.instance.rightBar.updateCurrentTab();
		}
	},
	
	focusTrackListItem:function(trackItemName,itemId) {
		this.selectTrackList(trackItemName,true,itemId);
		var trackElement = $('#' + paella.editor.TrackUtils.buildTrackItemId(trackItemName,itemId))[0];
		if (trackElement) {
			var scrollLeft = paella.editor.instance.bottomBar.timeline.container.scrollLeft;
			var itemOffset = $(trackElement).offset().left - 10;
			var newScroll = scrollLeft + itemOffset;
			 $(paella.editor.instance.bottomBar.timeline.container).animate({scrollLeft : newScroll},{duration:100});
		}
	}
});

paella.editor.BottomToolbar = Class.create({
	container:null,
	content:null,
	
	initialize:function(parent) {
		this.container = document.createElement('div');
		this.container.className = 'editorBottomToolbarContainer';
		parent.appendChild(this.container);
		
		this.content = document.createElement('div');
		this.container.appendChild(this.content);
		this.content.appendChild(bootstrapUtils.dropup('Zoom','zoomDropup',{
			'100%':'paella.editor.instance.bottomBar.timeline.setZoom(100)',
			'200%':'paella.editor.instance.bottomBar.timeline.setZoom(200)',
			'500%':'paella.editor.instance.bottomBar.timeline.setZoom(200)',
			'1000%':'paella.editor.instance.bottomBar.timeline.setZoom(1000)',
			'3000%':'paella.editor.instance.bottomBar.timeline.setZoom(3000)',
			'5000%':'paella.editor.instance.bottomBar.timeline.setZoom(5000)'
		},'btn-mini','icon-search',true));
	}
});

paella.editor.BottomBar = Class.create(paella.AsyncLoaderCallback,{
	editor:null,
	container:null,
	toolbar:null,
	timeline:null,
	bottomToolbar:null,

	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		var thisClass = this;
		this.container = document.createElement('div');
		this.container.className = "paellaEditorBottomBar";
	//	this.container.style.height = this.getHeight() + 'px';
		this.editor.editorContainer.appendChild(this.container);
		this.build();
		onSuccess();
	},
	
	build:function() {
		this.toolbar = new paella.editor.Toolbar(this.container);
		this.timeline = new paella.editor.Timeline(this.container);
		this.bottomToolbar = new paella.editor.BottomToolbar(this.container);
	},
	
	getHeight:function() {
		return $(this.container).height();
	},
	
	onresize:function() {
		this.timeline.onresize();
	}
});

paella.editor.RightBar = Class.create(paella.AsyncLoaderCallback,{
	editor:null,
	container:null,
	tabBar:null,
	selectedTab:0,
	tabContent:null,

	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		this.container = document.createElement('div');
		this.container.className = "paellaEditorRightBar";
		this.container.style.width = this.getWidth() + 'px';
		this.container.style.bottom = this.editor.bottomBar.getHeight() + 'px';
		this.editor.editorContainer.appendChild(this.container);
		this.tabBar = new paella.editor.Tabbar(this.container);
		this.tabContent = document.createElement('div');
		this.tabContent.className = "paellaEditorRightBarContent";
		this.container.appendChild(this.tabContent);
	
		this.loadPlugins();
		onSuccess();
	},
	
	loadPlugins:function() {
		var thisClass = this;
		var container = this.tabBar.container;
		container.innerHTML = "";
		var ul = document.createElement('ul');
		ul.className = "nav";
		var active = "active";
		var plugins = paella.editor.pluginManager.rightBarPlugins;
		if (plugins.length>0) {
			var i=0;
			for (var i in plugins) {
				var plugin = plugins[i];
				ul.appendChild(this.getTab(plugin,i));
				++i;
			}
			container.appendChild(ul);
		
			var currentTab = plugins[this.selectedTab];
			this.tabContent.innerHTML = "";
			this.tabContent.appendChild(currentTab.getContent());	
			currentTab.onLoadFinished();
		}
	},
	
	getTab:function(plugin,index) {
		var thisClass = this;
		var active = ""
		if (index==this.selectedTab) active = "active";
		var li = document.createElement('li');
		li.className = active;
		var a = document.createElement('a');
		a.className = "rightBarPlugin";
		a.setAttribute('href','JavaScript:void(0);');
		a.innerHTML = '<span class="editorRightBarTabIcon ' + plugin.getName() + '"></span>' + plugin.getTabName();
		a.tabIndex = index;
		$(a).click(function(event) {
			thisClass.loadTab(this.tabIndex);
		});
		li.appendChild(a);
		return li;
	},
	
	updateCurrentTab:function() {
		if (this.tabBar) {	// Prevents update current tab if the editor is the tab bar is not loaded
			this.loadPlugins();
		}
	},

	getWidth:function() {
		return 300;
	},
	
	loadTab:function(index) {
		this.selectedTab = index;
		this.loadPlugins();
	},
	
	onresize:function() {
		this.container.style.bottom = this.editor.bottomBar.getHeight() + 'px';	
	}
});


paella.editor.TrackUtils = {
	buildTrackItemId:function(trackName,trackItemId) {
		return 'paellaEditorTrack_' + trackName + '_' + trackItemId;
	},
};

paella.editor.Track = Class.create({
	container:null,
	plugin:null,
	trackIndex:{
		back:10,
		front:20
	},
	trackOpacity:{
		back:0.7,
		front:1
	},
	trackElemList:null,
	
	buildTrackItemId:function(trackName,trackItemId) {
		return paella.editor.TrackUtils.buildTrackItemId(trackName,trackItemId);
	},

	initialize:function(parentContainer,plugin,subclass) {
		this.trackElemList = [];
		this.plugin = plugin;
		var newTrackGroup = document.createElement('div');
		this.container = newTrackGroup;
		parentContainer.appendChild(newTrackGroup);
		this.buildTracks(newTrackGroup);
		type = plugin.getTrackType();
		if (type=="master") {
			newTrackGroup.className = "editorTrackListItem master " + subclass;
		}
		else if (type=="secondary") {
			newTrackGroup.className = "editorTrackListItem secondary " + subclass;
		}
	},
	
	getName:function() {
		return this.plugin.getName();
	},
	
	rebuild:function() {
		this.container.innerHTML = '';
		this.buildTracks(this.container);
	},

	buildTracks:function(container) {
		var plugin = this.plugin;
		var trackList = plugin.getTrackItems();
		for (var i in trackList) {
			var trackItem = this.getTrack(trackList[i]);
			this.trackElemList.push(trackItem);
			this.container.appendChild(trackItem);
		}
	},
	
	getTrack:function(trackData) {
		var thisClass = this;
		var plugin = this.plugin;
		var duration = paella.player.videoContainer.duration(true);
		trackData.d = trackData.e - trackData.s;
		var track = document.createElement('div');
		track.className = 'editorTrackItem ' + plugin.getName();
		track.id = this.buildTrackItemId(plugin.getName(),trackData.id);
		var start = trackData.s * 100 / duration;
		var width = trackData.d * 100 / duration;
		$(track).css({
			'left':start + '%',
			'width':width + '%',
			'background-color':plugin.getColor(),
			'opacity':this.trackOpacity.back
		});
		track.trackInfo = {
			trackData:trackData,
			plugin:plugin
		}
		
		var label = document.createElement('div');
		if (trackData.name && trackData.name!='') {
			label.innerHTML = trackData.name;
		}
		else {
			label.innerHTML = plugin.getTrackName();
		}
		
		label.className = 'editorTrackItemLabel ' + this.plugin.getTrackType();
		label.style.color = plugin.getTextColor();
		track.appendChild(label);
		
		if (!trackData.lock) {
			if (plugin.allowResize()) {
				var resizerL = document.createElement('div');
				resizerL.className = 'editorTrackItemResizer left';
				resizerL.track = track;
				track.appendChild(resizerL);
				var resizerR = document.createElement('div');
				resizerR.className = 'editorTrackItemResizer right';
				resizerR.track = track;
				track.appendChild(resizerR);
			
				$(resizerL).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'L',event);
				});
				$(resizerR).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'R',event);
				});
			}

			if (plugin.allowDrag()) {
				var moveArea = document.createElement('div');
				moveArea.className = 'editorTrackItemMoveArea';
				moveArea.track = track;
				track.appendChild(moveArea);
				$(moveArea).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'M',event);
				});				
			}
		}
		else {
			var lockIcon = document.createElement('i');
			lockIcon.className = 'editorTrackItemLock icon-lock icon-white';
			track.appendChild(lockIcon);
		}
		
		$(track).mousedown(function(event) {
			paella.editor.utils.mouse.mouseDownTarget = 'track';
			thisClass.onTrackDown(this,event);
		});
		
		$(document).mousemove(function(event) {
			thisClass.onResizerMove(event);
		});
		$(document).mouseup(function(event) {
			paella.editor.utils.mouse.mouseDownTarget = '';
			thisClass.onResizerUp(this.track,event);
		});
		$(track).dblclick(function(event) {
			thisClass.onDblClick(this.trackInfo,event);
		});
		return track;
	},
	
	
	currentTrack:null,
	resizeTrack:null,
	currentResizer:null,
	lastPos:{x:0,y:0},
	
	selectTrack:function(requestedTrack,noEvents) {
		if (typeof(requestedTrack)=="number") {
			for (var i=0;i<this.trackElemList.length;++i) {
				var trackElem = this.trackElemList[i];
				if (trackElem.trackInfo.trackData.id==requestedTrack) {
					requestedTrack = trackElem;
					break;
				}
			}
		}
		if (typeof(requestedTrack)!="number" && this.currentTrack!=requestedTrack) {
			if (!noEvents) this.onUnselect();
			for (var i=0;i<this.trackElemList.length;++i) {
				var trackElem = this.trackElemList[i];
				if (trackElem==requestedTrack) {
					this.currentTrack = trackElem;
					if (!noEvents) this.onSelect(trackElem.trackInfo);
					$(trackElem).css({
						'z-index':this.trackIndex.front,
						'opacity':this.trackOpacity.front
					});
				}
				else {
					$(trackElem).css({
						'z-index':this.trackIndex.back,
						'opacity':this.trackOpacity.back
					});
				}
			}
		}
	},
	
	onSelect:function(trackInfo) {
		this.plugin.onSelect(trackInfo.trackData);
	},
	
	onDblClick:function(track,event) {
		this.plugin.onDblClick(track.trackData);
	},
	
	onUnselect:function() {
		this.plugin.onUnselect();
	},
	
	onTrackDown:function(track,event) {
	// This will work only in secondary track items and in the first main track plugin:
		this.selectTrack(track);
		paella.editor.instance.bottomBar.toolbar.onToolChanged(this.plugin.getName(),this.plugin.getTrackName());
		
	},

	onResizerDown:function(track,resizer,event) {
		if (event) {
			this.resizeTrack = track;
			this.currentResizer = resizer;
			this.lastPos.x = event.clientX;
			this.lastPos.y = event.clientY;
		}
	},

	onResizerUp:function(track,event) {
		if (this.resizeTrack) {
			var duration = paella.player.videoContainer.duration(true);
			var totalWidth = $(this.container).width();
			var left = $(this.resizeTrack).position().left;
			var width = $(this.resizeTrack).width();
			left = left * 100 / totalWidth;
			width = width * 100 / totalWidth;
			var start = left * duration / 100;
			var end = (left + width) * duration / 100;
			
			var plugin = this.resizeTrack.trackInfo.plugin;
			var trackData = this.resizeTrack.trackInfo.trackData;
			plugin.onTrackChanged(trackData.id,start,end);
			paella.editor.pluginManager.onTrackChanged(plugin);
			paella.editor.instance.rightBar.updateCurrentTab();
			paella.editor.instance.bottomBar.timeline.rebuildTrack(plugin.getName());
			
			this.resizeTrack.trackInfo.trackData;

			$(this.resizeTrack).css({
				'left':left + '%',
				'width':width + '%'
			});
		}
		this.resizeTrack = null;
	},

	onResizerMove:function(event) {
		if (this.resizeTrack) {
			var diff = {
				x:event.clientX - this.lastPos.x,
				y:event.clientY - this.lastPos.y
			}
			var duration = paella.player.videoContainer.duration(true);
			var left = $(this.resizeTrack).position().left;
			var width = $(this.resizeTrack).width();
			
			//if (left<0) return;
			//else if ((left + width)>duration) return;
			if (this.currentResizer=='L') {
				left += diff.x;
				width -= diff.x;
				$(this.resizeTrack).css({'left':left + 'px','width':width + 'px'});
			}
			else if (this.currentResizer=='R') {
				width += diff.x;
				$(this.resizeTrack).css({'width':width + 'px'});
			}
			else if (this.currentResizer=='M') {	// Move track tool
				left +=diff.x;
				$(this.resizeTrack).css({'left':left + 'px'});
			}
			this.lastPos.x = event.clientX;
			this.lastPos.y = event.clientY;
		}
	}
});

paella.editor.EmbedPlayer = Class.create(paella.AsyncLoaderCallback,{
	editar:null,
	
	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		var barHeight = this.editor.bottomBar.getHeight() + 20;
		var rightBarWidth = this.editor.rightBar.getWidth() + 20;
		$(paella.player.mainContainer).css({
			'position':'fixed',
			"width":"",
			"bottom":barHeight + "px",
			"right":rightBarWidth + "px",
			"left":"20px",
			"top":"20px"
		});
		paella.player.mainContainer.className = "paellaMainContainerEditorMode";
		new Timer(function(timer) {
			paella.player.controls.disable();
			paella.player.onresize();
			if (onSuccess) {
				onSuccess();
			}
		},500);
	},
	
	restorePlayer:function() {
		$('body')[0].appendChild(paella.player.mainContainer);
		paella.player.controls.enable();
		paella.player.mainContainer.className = "";
		$(paella.player.mainContainer).css({
			'position':'',
			"width":"",
			"bottom":"",
			"left":"",
			"right":"",
			"top":""
		});
		paella.player.onresize();
	},
	
	onresize:function() {
		var barHeight = this.editor.bottomBar.getHeight() + 20;
		var rightBarWidth = this.editor.rightBar.getWidth() + 20;
		$(paella.player.mainContainer).css({
			'position':'fixed',
			"width":"",
			"bottom":barHeight + "px",
			"right":rightBarWidth + "px",
			"left":"20px",
			"top":"20px"
		});

	}
});

paella.editor.Editor = Class.create({
	config:null,
	editorContainer:null,
	isLoaded:false,
	bottomBar:null,
	rightBar:null,
	embedPlayer:null,
	loader:null,

	initialize:function() {
		if (paella.player.accessControl.permissions.canWrite) {
			var thisClass = this;
			paella.editor.instance = this;
			paella.initDelegate.loadEditorConfig(function(config) {
				thisClass.config = config;
				thisClass.loadEditor();
			});	
		}
	},
	
	loadEditor:function() {
		paella.keyManager.enabled = false;
		var thisClass = this;
		this.editorContainer = document.createElement('div');
		$('body')[0].appendChild(this.editorContainer);
		this.editorContainer.className = 'editorContainer';
		this.editorContainer.id = "editorContainer";
		this.editorContainer.appendChild(paella.player.mainContainer);
		$('body')[0].style.backgroundImage = "url(resources/images/editor_video_bkg.png)";
		
		this.loader = new paella.AsyncLoader();
		this.bottomBar = this.loader.addCallback(new paella.editor.BottomBar());
		this.rightBar = this.loader.addCallback(new paella.editor.RightBar());
		this.embedPlayer = this.loader.addCallback(new paella.editor.EmbedPlayer());
		this.loader.load(function() {
			thisClass.onLoadSuccess();
		},function() {
			thisClass.onLoadFail();
		});
	},
	
	onLoadSuccess:function() {
		this.isLoaded = true;
		var thisClass = this;
		this.onresize();
		$(window).resize(function(event) {
			thisClass.onresize();
		});
		$(document).trigger(paella.events.play);
		new Timer(function(timer) {
			$(document).trigger(paella.events.pause);	
		},100);
		paella.events.bind(paella.events.documentChanged,function(event,params) {
			window.onbeforeunload = function(event) { return paella.dictionary.translate('There are unsaved changes'); }
		});
		paella.events.bind(paella.events.didSaveChanges,function(event,params) {
			window.onbeforeunload = null;
		});
	},
	
	onLoadFail:function() {
		
	},
	
	unloadEditor:function() {
		paella.keyManager.enabled = true;
		this.embedPlayer.restorePlayer();
		$('body')[0].removeChild(this.editorContainer);
		$('body')[0].style.backgroundImage = "";
		this.editorContainer = null;
		this.isLoaded = false;
		$(document).trigger(paella.events.pause);		
		$(document).trigger(paella.events.hideEditor);			
	},

	onresize:function() {
		if (this.isLoaded) {
			this.bottomBar.onresize();
			this.rightBar.onresize();
			this.embedPlayer.onresize();
		}
	}
});

/*
var EditControl = Class.create(paella.DomNode,{
	buttonId:'',

	initialize:function(id) {
		this.buttonId = id + '_button';
		var style = {position:'absolute',top:'0px',right:'0px'};
		this.parent('div',id,style);
		this.domElement.className = 'editControlContainer';
		var editButton = this;
		this.addNode(new paella.Button(this.buttonId,'editButton',function(event) {
			editButton.toggleEditor();
		},false));
	},

	toggleEditor:function() {
		if ((paella.extended) || (window!=window.top)){
			window.open("index.html?id=" + paella.player.videoIdentifier);
		}
		else{
			$(document).trigger(paella.events.showEditor);
		}
	},

	getButton:function() {
		return this.getNode(this.buttonId);
	}
});
*/




paella.editor.ToolStatusPlugin = Class.create(paella.editor.RightBarPlugin,{
	currentTrack:null,
	currentTextField:null,
	trackItemContainer:null,
	selectedColor:"rgb(255, 255, 236)",
	
	initialize:function() {
		this.parent();
		if (paella.utils.language()=='es') {
			var esDict = {
				'Tool':'Herramienta',
				'Selected tool':'Herramienta seleccionada',
				'this track does not contain any item':'esta pista no contiene ningún elemento',
				'Click on timeline outside any track to select current playback time.':'Haz clic en el fondo de la línea de tiempo para establecer el instante actual de reproducción',
				'Quick help':'Ayuda rápida',
				'item':'elemento',
				'items':'elementos',
				'from':'desde',
				'to':'hasta'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getIndex:function() {
		return 10000;
	},
	
	getName:function() {
		return "es.upv.paella.editor.toolStatusPlugin";
	},
	
	getTabName:function() {
		return paella.dictionary.translate("Tool");
	},
	
	getContent:function() {
		this.currentTextField = null;
		var elem = document.createElement('div');
		if (this.currentTrack) {
			var plugin = paella.pluginManager.getPlugin(this.currentTrack.getName());
			elem.innerHTML = "<h6>" + paella.dictionary.translate("Tool") + ": " + paella.dictionary.translate(this.currentTrack.getTrackName()) + "</h6>";
			var trackList = this.currentTrack.getTrackItems();
			var trackContainer = document.createElement('div');
			trackContainer.className = "editorPluginToolStatus_trackItemList";
			this.trackItemContainer = trackContainer;
			plugin.buildToolTabContent(trackContainer);
			if (trackContainer.childNodes.length==0) {
				for (var i=0;i<trackList.length;++i) {
					this.addTrackData(trackContainer,trackList[i]);
				}
			}
			elem.appendChild(trackContainer);
		}
		else {
			elem.innerHTML = "<h6>" + paella.dictionary.translate("Tool") + ": " + paella.dictionary.translate("Selection") + "</h6>";
			
		}
		
		this.addToolHelp(elem);
		
		return elem;
	},
	
	addTrackData:function(parent,track) {
		var trackData = document.createElement('div');
		//trackData.innerHTML = track.id + " s:" + track.s + ", e:" + track.e;
		var trackTime = document.createElement('div');
		var duration = Math.round((track.e - track.s) * 100) / 100;
		trackTime.innerHTML = paella.dictionary.translate('from') + ' ' + paella.utils.timeParse.secondsToTime(track.s) + ' ' +
							  paella.dictionary.translate('to') + ' ' + paella.utils.timeParse.secondsToTime(track.e) + ', ' +
							  duration + ' sec';
		trackData.appendChild(trackTime); 
		if (track.content) {
			var content = paella.AntiXSS.htmlUnescape(track.content);
			this.addTrackContent(trackData,track.id,content,track.s,track.e);
		}
		parent.appendChild(trackData);
	},
	
	addTrackContent:function(parent,id,content,start,end) {
		var contentElem = null;
		var thisClass = this;
		if (this.currentTrack.allowEditContent()) {
			contentElem = document.createElement('input');
			contentElem.setAttribute('type', 'text');
			contentElem.setAttribute('id','trackContentEditor_' + id);
			contentElem.setAttribute('value',content);
			contentElem.trackData = {id:id,content:content,s:start,e:end};
			contentElem.plugin = this.currentTrack;
			$(contentElem).change(function(event) {
				this.plugin.onTrackContentChanged(this.trackData.id,$(this).val());
				paella.editor.instance.bottomBar.timeline.rebuildTrack(this.plugin.getName());
			});
			$(contentElem).click(function(event) {
				thisClass.onFocusChanged(this,this.plugin,this.trackData);
			});
			$(contentElem).focus(function(event) {
				thisClass.onFocusChanged(this,this.plugin,this.trackData);
			});
			
			var selectedTrackItemId = -1;
			try {
				selectedTrackItemId = this.currentTrack.trackInfo.trackData.id;
			}
			catch (e) { }
//paella.editor.instance.bottomBar.timeline.currentTrackList.currentTrack.trackInfo.trackData.id;
			if (selectedTrackItemId==id) {
				this.currentTextField = contentElem;
				this.currentTextField.style.backgroundColor = this.selectedColor;
			}
		}
		else {
			contentElem = document.createElement('input');
			contentElem.setAttribute('type', 'text');
			contentElem.setAttribute('id',id);
			contentElem.setAttribute('disabled','disabled');
			contentElem.setAttribute('style','color:rgb(119, 119, 119)');
			contentElem.setAttribute('value',content);
		}
		
		
		parent.appendChild(contentElem);
	},
	
	onFocusChanged:function(field,plugin,trackData) {
		if (this.currentTextField) {
			this.currentTextField.style.backgroundColor = "#fff";
		}
		field.style.backgroundColor = this.selectedColor;
		paella.editor.instance.bottomBar.timeline.focusTrackListItem(plugin.getName(),trackData.id);
		this.currentTextField = field;
		
		// Set the timeline position at the end of this track item
		var time = trackData.e;
		$(document).trigger(paella.events.seekToTime,{time:time});
	},
	
	onLoadFinished:function() {
		if (this.currentTextField) {
			this.trackItemContainer.scrollTop = $(this.currentTextField).position().top;
		}
	},
		
	addToolHelp:function(parent) {
		var helpText = "";
		if (this.currentTrack) {
			helpText = this.currentTrack.contextHelpString();
		}
		else {
			helpText = paella.dictionary.translate("Click on timeline outside any track to select current playback time.");
		}
		
		if (helpText!="") {
			var helpElem = document.createElement('div');
			helpElem.className = "editorPluginToolStatusHelp";
			parent.appendChild(helpElem);
			helpElem.innerHTML = '<strong>' + paella.dictionary.translate('Quick help') + ': </strong>' + helpText;
		}		
	},
	
	onTrackSelected:function(newTrack) {
		this.currentTrack = newTrack;
	}
});

new paella.editor.ToolStatusPlugin();


/*


paella.editor.CaptionsPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	selectedTrackItem:null,
	
	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Captions':'Subtítulos',
				'Create':'Crear',
				'Delete':'Borrar'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		for (var i=0;i<this.tracks.length;++i) {
			this.tracks[i].name = this.tracks[i].content;
		}
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected caption')}
		];
	},
	
	getTrackItemIndex:function(item) {
//		return this.tracks.indexOf(item);
		for(var i=0;i<this.tracks.length;++i) {
			if (item.id==this.tracks[i].id) {
				return i;
			}
		}
		return -1;
	},

	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			this.tracks.splice(this.getTrackItemIndex(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			var start = paella.player.videoContainer.currentTime();
			var end = start + 60;
			var id = this.getTrackUniqueId();
			this.tracks.push({id:id,s:start,e:end,content:paella.dictionary.translate('Caption')});
			return true;
		}
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "es.upv.paella.editor.trackCaptions";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Captions");
	},
	
	getColor:function() {
		return 'rgb(212, 212, 224)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},
	
	onTrackContentChanged:function(id,content) {
		var item = this.getTrackItem(id);
		if (item) {
			item.content = content;
			item.name = content;
		}
	},
	
	allowEditContent:function() {
		return false;
	},
	
	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	contextHelpString:function() {
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar subtítulos. Para crear un subtítulo, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los subtítulos";
		}
		else {
			return "Use this tool to create, delete and edit video captions. To create a caption, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the caption text.";
		}
	}
});

paella.editor.captionsPlugin = new paella.editor.CaptionsPlugin();

*/






paella.plugins.BreaksEditorPlugin = Class.create(paella.editor.MainTrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		paella.data.read('breaks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
				This.tracks = data.breaks;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Breaks':'Descansos',
				'Break':'Descanso',
				'Create a new break in the current position': 'Añade un descanso en el instante actual',
				'Delete selected break': 'Borra el descanso seleccionado'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new break in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected break')}
		];
	},
	
	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			paella.events.trigger(paella.events.documentChanged);
			this.tracks.splice(this.tracks.indexOf(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			paella.events.trigger(paella.events.documentChanged);
			var start = paella.player.videoContainer.currentTime();
			var end = start + 30;
			var id = this.getTrackUniqueId();
			var content = paella.dictionary.translate('Break');
			this.tracks.push({id:id,s:start,e:end,content:content,name:content});
			return true;
		}
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "es.upv.paella.editor.trackBreaks";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Breaks");
	},
	
	getColor:function() {
		return 'rgb(219, 81, 81)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},
	
	onTrackContentChanged:function(id,content) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.content = paella.AntiXSS.htmlEscape(content);
			item.name = paella.AntiXSS.htmlEscape(content);
		}
	},
	
	allowEditContent:function() {
		return true;
	},
	
	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	contextHelpString:function() {
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar descansos. Para crear un descanso, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los descansos";
		}
		else {
			return "Use this tool to create, delete and edit breaks. To create a break, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the break text.";
		}
	},
	
	onSave:function(success) {
		var data = {
			breaks:this.tracks
		}
		paella.data.write('breaks',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.breaksPlayerPlugin.breaks = data.breaks;
			success(status);
		});
		
	}
});

paella.plugins.breaksEditorPlugin = new paella.plugins.BreaksEditorPlugin();


paella.plugins.BreaksPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	breaks:null,
	lastEvent:0,
	visibleBreaks:null,

	getName:function() { return "es.upv.paella.BreaksPlayerPlugin"; },
	checkEnabled:function(onSuccess) {
		var This = this;
		this.breaks = [];
		this.visibleBreaks = [];
		paella.data.read('breaks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
				This.breaks = data.breaks;
			}
			onSuccess(true);
		});
	},
		
	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkBreaks(params);
	},
	
	checkBreaks:function(params) {
		for (var i=0; i<this.breaks.length; ++i) {
			var a = this.breaks[i];
			
			if (a.s<params.currentTime && a.e>params.currentTime) {
				this.showBreaks(a);
			} else if (a.s.toFixed(0) == params.currentTime.toFixed(0)){
				this.avoidBreak(a);
			}
		}
		
		for (var key in this.visibleBreaks) {
			if (typeof(a)=='object') {
				var a = this.visibleBreaks[key];
				if (a && (a.s>=params.currentTime || a.e<=params.currentTime)) {
					this.removeBreak(a);
				}
			}
		}
	},
	
	showBreaks:function(br) {
		if (!this.visibleBreaks[br.s]) {
			var rect = {left:100,top:350,width:1080,height:20};
			br.elem = paella.player.videoContainer.overlayContainer.addText(br.content,rect);
			br.elem.className = 'textBreak';
			this.visibleBreaks[br.s] = br;
		}
	},
	
	removeBreak:function(br) {
		if (this.visibleBreaks[br.s]) {
			var elem = this.visibleBreaks[br.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleBreaks[br.s] = null;
		}
	},
	
	avoidBreak:function(br){
		var newTime = br.e; 
		paella.events.trigger(paella.events.seekToTime,{time:newTime});
	}
});

paella.plugins.breaksPlayerPlugin = new paella.plugins.BreaksPlayerPlugin();


paella.plugins.CaptionsEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	
	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		paella.data.read('captions',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.captions && data.captions.length>0) {
				This.tracks = data.captions;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Captions':'Subtítulos',
				'Caption':'Subtítulo',
				'Create a new caption in the current position': 'Añade un subtítulo en el instante actual',
				'Delete selected caption': 'Borra el subtítulo seleccionado'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected caption')}
		];
	},
	
	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			paella.events.trigger(paella.events.documentChanged);
			this.tracks.splice(this.tracks.indexOf(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			paella.events.trigger(paella.events.documentChanged);
			var start = paella.player.videoContainer.currentTime();
			var end = start + 30;
			var id = this.getTrackUniqueId();
			var content = paella.dictionary.translate('Caption');
			this.tracks.push({id:id,s:start,e:end,content:content,name:content});
			return true;
		}
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "es.upv.paella.editor.trackCaptions";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Captions");
	},
	
	getColor:function() {
		return 'rgb(159, 166, 88)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},
	
	onTrackContentChanged:function(id,content) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.content = paella.AntiXSS.htmlEscape(content);
			item.name = paella.AntiXSS.htmlEscape(content);
		}
	},
	
	allowEditContent:function() {
		return true;
	},
	
	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	contextHelpString:function() {
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar subtítulos. Para crear un subtítulo, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los subtítulos";
		}
		else {
			return "Use this tool to create, delete and edit video captions. To create a caption, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the caption text.";
		}
	},
	
	onSave:function(success) {
		var data = {
			captions:[]
		}
		for (var i = 0; i<this.tracks.length; ++i) {
			var track = this.tracks[i];
			var trackParams = {}
			for (var key in track) {
				// Avoid write the DOM element
				if (key!='elem') {
					trackParams[key] = track[key];
				}
			}
			data.captions.push(trackParams);
		}
		paella.data.write('captions',{id:paella.initDelegate.getId()},data,function(response,status) {
			paella.plugins.captionsPlayerlugin.captions = data.captions;
			success(status);
		});

		if (data.captions.length >= 1) paella.plugins.activeCaptionsPlugin.setButtonEnabled(true);
      	else paella.plugins.activeCaptionsPlugin.setButtonEnabled(false);
	}
});

paella.plugins.captionsEditorPlugin = new paella.plugins.CaptionsEditorPlugin();


paella.plugins.CaptionsPlayerPlugin = Class.create(paella.EventDrivenPlugin,{
	captions:null,
	lastEvent:0,
	visibleCaptions:[],
	captionsEnabled:null,
	root: null,
	element:null,
	counter: 0,

	getName:function() { return "es.upv.paella.CaptionsPlayerPlugin"; },
	checkEnabled:function(onSuccess) {
		var This = this;
		this.captions = [];
		this.visibleCaptions = [];
		paella.data.read('captions',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.captions && data.captions.length>0) {
				This.captions = data.captions;
			}
			onSuccess(true);
		});
	},

	setup:function() {

		var overlayContainer = paella.player.videoContainer.overlayContainer;
		var rect = {left:100,top:620,width:1080,height:20};

		this.root = document.createElement("div");
		this.root.className = 'videoLoadTestOverlay';
			
		this.element = document.createElement("div");
		this.element.className = 'textCaption';

		this.root.appendChild(this.element);

		//overlayContainer.addElement(this.root, rect);

	},
		
	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkCaptions(params);
	},
	
	checkCaptions:function(params) {
		for (var i=0; i<this.captions.length; ++i) {
			var a = this.captions[i];
			if (this.captionsEnabled && a.s<params.currentTime && a.e>params.currentTime) {
				this.showCaption(a);
			}
		}
		
		for (var key in this.visibleCaptions) {
			if (typeof(a)=='object') {
				var a = this.visibleCaptions[key];
				if (a && (a.s>=params.currentTime || a.e<=params.currentTime || !this.captionsEnabled)) {
					this.removeCaption(a);
				}
			}
		}

		if (this.counter <= 0) {
			this.element.innerHTML = '';
			this.element.className = 'textCaption disabled';
		}
	},
	
	showCaption:function(caption) {
		this.element.className = 'textCaption';
		this.element.innerHTML = caption.content;
			
		if (!this.visibleCaptions[caption.s]) {

			var overlayContainer = paella.player.videoContainer.overlayContainer;
			var rect = {left:100,top:620,width:1080,height:20};
			overlayContainer.addElement(this.root, rect);
			this.counter++;
			this.visibleCaptions[caption.s] = caption;
			
			/*var rect = {left:100,top:620,width:1080,height:20};
			caption.elem = paella.player.videoContainer.overlayContainer.addText(caption.content,rect);
			caption.elem.className = 'textCaption';
			this.visibleCaptions[caption.s] = caption;*/
		}
	},
	
	removeCaption:function(caption) {
		if (this.visibleCaptions[caption.s]) {
			this.counter--;
			this.visibleCaptions[caption.s] = null;

			/*var elem = this.visibleCaptions[caption.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleCaptions[caption.s] = null;*/
		}
	}
});

paella.plugins.captionsPlayerlugin = new paella.plugins.CaptionsPlayerPlugin();

paella.plugins.ActiveCaptionsPlugin = Class.create(paella.ButtonPlugin,{
	button: null,
	buttonEnabled: true,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showCaptionsPluginButton"; },
	getIndex:function() { return 580; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.activeCaptionsPlugin"; },
	checkEnabled:function(onSuccess) { 
		var thisClass = this;
		paella.data.read('captions',{id:paella.initDelegate.getId()},function(data,status) {
		 	if (!(data && typeof(data)=='object' && data.captions && data.captions.length>0)) {
				thisClass.button.className = thisClass.getButtonItemClass(false,false);
				thisClass.buttonEnabled = false;
		 	}
		 	onSuccess(true); 
		});
	},
	getDefaultToolTip:function() { return paella.dictionary.translate("Show captions"); },

	setup:function(){
		if(this.buttonEnabled) this.showButton();
		else this.hideButton();
	},	
						  
	action:function(button) {
		this.button = button;
		if (this.activeCaptions) {
			button.className = this.getButtonItemClass(false,true);
			paella.plugins.captionsPlayerlugin.captionsEnabled = false;
			this.activeCaptions = false;
		} else { 
			button.className = this.getButtonItemClass(true,true);
			paella.plugins.captionsPlayerlugin.captionsEnabled = true;
			this.activeCaptions = true;
		}
	},

	setButtonEnabled:function(enabled){
		var sel = this.button.className.split(" ");
		this.activeCaptions = ((enabled)&&(sel[3] == 'selected'));
		this.button.className = this.getButtonItemClass(sel[3] == 'selected',enabled);
		if (enabled) this.showButton();
		else this.hideButton();
		paella.plugins.captionsPlayerlugin.captionsEnabled = ((enabled)&&(sel[3] == 'selected'));
	},
	
	getButtonItemClass:function(selected,enabled) {
		return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' selected':'') + ((enabled) ? '':' disabled');
	}
});
  

paella.plugins.activeCaptionsPlugin = new paella.plugins.ActiveCaptionsPlugin();


paella.plugins.CommentsPlugin = Class.create(paella.TabBarPlugin,{
	divRoot:null,
	divPublishComment:null,
	divComments:null,
	publishCommentTextArea:null,
	publishCommentButtons:null,
	canPublishAComment: false,
	comments: [],
	commentsTree: [],
	domElement:null,
  
	getSubclass:function() { return "showCommentsTabBar"; },
	getName:function() { return "es.upv.paella.commentsPlugin"; },
	getTabName:function() { return paella.dictionary.translate("Comments"); },
	checkEnabled:function(onSuccess) { onSuccess(paella.extended); },
	getIndex:function() { return 40; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Comments"); },	
				     
	action:function(tab) {
		this.loadContent();
	},
			
	buildContent:function(domElement) {
		this.domElement = domElement;
		this.canPublishAComment = paella.initDelegate.initParams.accessControl.permissions.canWrite;
		this.loadContent();
	},
				
	loadContent:function() {
		this.divRoot = this.domElement;
		this.divRoot.innerHTML ="";
		
		this.divPublishComment = document.createElement('div');
		this.divPublishComment.className = 'CommentPlugin_Publish';
		this.divPublishComment.id = 'CommentPlugin_Publish';

		this.divComments = document.createElement('div'); 
		this.divComments.className = 'CommentPlugin_Comments';
		this.divComments.id = 'CommentPlugin_Comments';

		if(this.canPublishAComment){
			this.divRoot.appendChild(this.divPublishComment);
			this.createPublishComment();
		}
		this.divRoot.appendChild(this.divComments);
		
		this.reloadComments();
	},
	
	//Allows the user to write a new comment
	createPublishComment:function() {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry";
		
		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID;
		divEntry.className = 'comments_entry';
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.style.width = "48px";
		divSil.src = paella.initDelegate.initParams.accessControl.userData.avatar;
		divSil.id = rootID+"_silhouette";
		divEntry.appendChild(divSil);
		
		var divTextAreaContainer;
		divTextAreaContainer = document.createElement('div');
		divTextAreaContainer.className = "comments_entry_container";
		divTextAreaContainer.id = rootID+"_textarea_container";
		divEntry.appendChild(divTextAreaContainer);
		
		this.publishCommentTextArea = document.createElement('textarea');
		this.publishCommentTextArea.id = rootID+"_textarea";
		this.publishCommentTextArea.onclick = function(){paella.keyManager.enabled = false;};
		this.publishCommentTextArea.onblur = function(){paella.keyManager.enabled = true;};
		divTextAreaContainer.appendChild(this.publishCommentTextArea);
		
		this.publishCommentButtons = document.createElement('div');
		this.publishCommentButtons.id = rootID+"_buttons_area";
		divTextAreaContainer.appendChild(this.publishCommentButtons);
		
		var btnAddComment;
		btnAddComment = document.createElement('button');
		btnAddComment.id = rootID+"_btnAddComment";
		btnAddComment.className = "publish";
		btnAddComment.onclick = function(){
			var txtValue = thisClass.publishCommentTextArea.value;
			if (txtValue.replace(/\s/g,'') != "") {
				thisClass.addComment();
			}
		};
		btnAddComment.innerHTML = paella.dictionary.translate("Publish");
		
		this.publishCommentButtons.appendChild(btnAddComment);
		
		divTextAreaContainer.commentsTextArea = this.publishCommentTextArea;
		divTextAreaContainer.commentsBtnAddComment = btnAddComment;
		divTextAreaContainer.commentsBtnAddCommentToInstant = this.btnAddCommentToInstant;
		
		this.divPublishComment.appendChild(divEntry);
	},
		
	addComment:function(){
		var thisClass = this;
		var txtValue = paella.AntiXSS.htmlEscape(thisClass.publishCommentTextArea.value);
		//var txtValue = thisClass.publishCommentTextArea.value;
		var now = new Date();
		
		this.comments.push({
			id: paella.utils.uuid(),
			userName:paella.initDelegate.initParams.accessControl.userData.name,
			mode: "normal",
			value: txtValue,
			created: now
		});

		var data = {
			allComments: this.comments
		}
		
		paella.data.write('comments',{id:paella.initDelegate.getId()},data,function(response,status){
			if (status) {thisClass.loadContent();}
		});
	},
	
	addReply:function(annotationID, domNodeId){
		var thisClass = this;
		var textArea = document.getElementById(domNodeId);
		var txtValue = paella.AntiXSS.htmlEscape(textArea.value);
		var now = new Date();
		
		paella.keyManager.enabled = true;

		this.comments.push({
			id: paella.utils.uuid(),
			userName:paella.initDelegate.initParams.accessControl.userData.name,
			mode: "reply",
			parent: annotationID,
			value: txtValue,
			created: now
		});

		var data = {
			allComments: this.comments
		}
		
		paella.data.write('comments',{id:paella.initDelegate.getId()},data,function(response,status){
			if (status) thisClass.reloadComments();
		});
	},
	
	reloadComments:function() {     
		var thisClass = this;
		thisClass.commentsTree = [];
		thisClass.comments = [];
		this.divComments.innerHTML ="";
		
		paella.data.read('comments',{id:paella.initDelegate.getId()},function(data,status) {
			
			if (data && typeof(data)=='object' && data.allComments && data.allComments.length>0) {
				thisClass.comments = data.allComments;
				var tempDict = {};

				// obtain normal comments  
				for (var i =0; i < data.allComments.length; ++i ){
					var valueText = data.allComments[i].value;
                                                
					if (data.allComments[i].mode !== "reply") { 
						var comment = {};
						comment["id"] = data.allComments[i].id;
						comment["userName"] = data.allComments[i].userName;
						comment["mode"] = data.allComments[i].mode;
						comment["value"] = valueText;
						comment["created"] = data.allComments[i].created;
						comment["replies"] = [];    

						thisClass.commentsTree.push(comment); 
						tempDict[comment["id"]] = thisClass.commentsTree.length - 1;
					}
				}
			
				// obtain reply comments
				for (var i =0; i < data.allComments.length; ++i ){
					var valueText = data.allComments[i].value;

					if (data.allComments[i].mode === "reply") { 
						var comment = {};
						comment["id"] = data.allComments[i].id;
						comment["userName"] = data.allComments[i].userName;
						comment["mode"] = data.allComments[i].mode;
						comment["value"] = valueText;
						comment["created"] = data.allComments[i].created;

						var index = tempDict[data.allComments[i].parent];
						thisClass.commentsTree[index]["replies"].push(comment);
					}
				}
				thisClass.displayComments();
			} 
		});
	},
	
	displayComments:function() {
          var thisClass = this;
          for (var i =0; i < thisClass.commentsTree.length; ++i ){
            var comment = thisClass.commentsTree[i];
            var e = thisClass.createACommentEntry(comment);
            thisClass.divComments.appendChild(e);
          } 
        },
	
	createACommentEntry:function(comment) {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry"+comment["id"];
		var users;
		
		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID;
		divEntry.className = "comments_entry";
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.id = rootID+"_silhouette";

		divEntry.appendChild(divSil);
		
		var divCommentContainer;
		divCommentContainer = document.createElement('div');
		divCommentContainer.className = "comments_entry_container";
		divCommentContainer.id = rootID+"_comment_container";
		divEntry.appendChild(divCommentContainer);
		
		var divCommentMetadata;
		divCommentMetadata = document.createElement('div');
		divCommentMetadata.id = rootID+"_comment_metadata"; 
		divCommentContainer.appendChild(divCommentMetadata);
		
		
		
//		var datePublish = comment["created"];
		var datePublish = "";
		if (comment["created"]) {
			var dateToday=new Date()
			var dateComment = paella.utils.timeParse.matterhornTextDateToDate(comment["created"]);			
			datePublish = paella.utils.timeParse.secondsToText((dateToday.getTime()-dateComment.getTime())/1000);
		}
		/*
		var headLine = "<span class='comments_entry_username'>" + comment["userName"] + "</span>";
		headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";
		divCommentMetadata.innerHTML = headLine;
		*/
		
		var divCommentValue;
		divCommentValue = document.createElement('div');
		divCommentValue.id = rootID+"_comment_value";
		divCommentValue.className = "comments_entry_comment";
		divCommentContainer.appendChild(divCommentValue);		
		
		divCommentValue.innerHTML = comment["value"];
		
		var divCommentReply = document.createElement('div');
		divCommentReply.id = rootID+"_comment_reply";
		divCommentContainer.appendChild(divCommentReply);
		
		paella.data.read('userInfo',{username:comment["userName"]}, function(data,status) {
			if (data) {
				divSil.src = data.avatar;
				
				var headLine = "<span class='comments_entry_username'>" + data.name + " " + data.lastname + "</span>";
				headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";				
				divCommentMetadata.innerHTML = headLine;
			}
		});

		if (this.canPublishAComment == true) {
			//var btnRplyComment = document.createElement('button');
			var btnRplyComment = document.createElement('div');
			btnRplyComment.className = "reply_button";
			btnRplyComment.innerHTML = paella.dictionary.translate("Reply");
			
			btnRplyComment.id = rootID+"_comment_reply_button";
			btnRplyComment.onclick = function(){
				var e = thisClass.createAReplyEntry(comment["id"]);
				this.style.display="none";
				this.parentElement.parentElement.appendChild(e);
			};
			divCommentReply.appendChild(btnRplyComment);
		}
		
		for (var i =0; i < comment.replies.length; ++i ){
			var e = thisClass.createACommentReplyEntry(comment["id"], comment["replies"][i]);
			divCommentContainer.appendChild(e);
		}
		return divEntry;
	},
	
	createACommentReplyEntry:function(parentID, comment) {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry_" + parentID + "_reply_" + comment["id"];

		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID;
		divEntry.className = "comments_entry";
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.id = rootID+"_silhouette";

		divEntry.appendChild(divSil);
			
		var divCommentContainer;
		divCommentContainer = document.createElement('div');
		divCommentContainer.className = "comments_entry_container";
		divCommentContainer.id = rootID+"_comment_container";
		divEntry.appendChild(divCommentContainer);
			
		var divCommentMetadata;
		divCommentMetadata = document.createElement('div');
		divCommentMetadata.id = rootID+"_comment_metadata"; 
		divCommentContainer.appendChild(divCommentMetadata);
//		var datePublish = comment["created"];
		var datePublish = "";
		if (comment["created"]) {
			var dateToday=new Date()
			var dateComment = paella.utils.timeParse.matterhornTextDateToDate(comment["created"]);			
			datePublish = paella.utils.timeParse.secondsToText((dateToday.getTime()-dateComment.getTime())/1000);
		}
		
		/*
		var headLine = "<span class='comments_entry_username'>" + comment["userName"] + "</span>";
		headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";
		divCommentMetadata.innerHTML = headLine;
		*/
		
		var divCommentValue;
		divCommentValue = document.createElement('div');
		divCommentValue.id = rootID+"_comment_value";
		divCommentValue.className = "comments_entry_comment";
		divCommentContainer.appendChild(divCommentValue);		
		
		divCommentValue.innerHTML = comment["value"];
		
		paella.data.read('userInfo',{username:comment["userName"]}, function(data,status) {
			if (data) {
				divSil.src = data.avatar;
				
				var headLine = "<span class='comments_entry_username'>" + data.name + " " + data.lastname + "</span>";
				headLine += "<span class='comments_entry_datepublish'>" + datePublish + "</span>";				
				divCommentMetadata.innerHTML = headLine;
			}
		});	
			
		return divEntry;
	},
	
	//Allows the user to write a new reply
	createAReplyEntry:function(annotationID) {
		var thisClass = this;
		var rootID = this.divPublishComment.id+"_entry_" + annotationID + "_reply";

		var divEntry;
		divEntry = document.createElement('div');
		divEntry.id = rootID+"_entry";
		divEntry.className = "comments_entry";
		
		var divSil;
		divSil = document.createElement('img');
		divSil.className = "comments_entry_silhouette";
		divSil.style.width = "48px";		
		divSil.id = rootID+"_silhouette";
		divSil.src = paella.initDelegate.initParams.accessControl.userData.avatar;
		divEntry.appendChild(divSil);
		
		var divCommentContainer;
		divCommentContainer = document.createElement('div');
		divCommentContainer.className = "comments_entry_container comments_reply_container";
		divCommentContainer.id = rootID+"_reply_container";
		divEntry.appendChild(divCommentContainer);
	
		var textArea;
		textArea = document.createElement('textArea');
		textArea.onclick = function(){paella.keyManager.enabled = false;};
		textArea.draggable = false;
		textArea.id = rootID+"_textarea";
		divCommentContainer.appendChild(textArea);
		
		this.publishCommentButtons = document.createElement('div');
		this.publishCommentButtons.id = rootID+"_buttons_area";
		divCommentContainer.appendChild(this.publishCommentButtons);
		
		var btnAddComment;
		btnAddComment = document.createElement('button');
		btnAddComment.id = rootID+"_btnAddComment";
		btnAddComment.className = "publish";
		btnAddComment.onclick = function(){
			var txtValue = textArea.value;
			if (txtValue.replace(/\s/g,'') != "") {
				thisClass.addReply(annotationID,textArea.id);
			}
		};
		btnAddComment.innerHTML = paella.dictionary.translate("Reply");
		
		this.publishCommentButtons.appendChild(btnAddComment);
		
		return divEntry;
	}
	
});
  
paella.plugins.commentsPlugin = new paella.plugins.CommentsPlugin();



paella.plugins.DescriptionPlugin = Class.create(paella.TabBarPlugin,{
	getSubclass:function() { return "showDescriptionTabBar"; },
	getName:function() { return "es.upv.paella.descriptionPlugin"; },
	getTabName:function() { return "Descripción"; },
			
	domElement:null,
			
	buildContent:function(domElement) {
		this.domElement = domElement;
		this.loadContent();
	},
			
	action:function(tab) {
		this.loadContent();
	},
			
	loadContent:function() {
		var container = this.domElement;
		container.innerHTML = "Loading...";
		new paella.Timer(function(t) {
			container.innerHTML = "Loading done";
		},2000);
	}
	
});
  

paella.plugins.descriptionPlugin = new paella.plugins.DescriptionPlugin();

paella.plugins.ExtendedProfilesPlugin = Class.create(paella.ButtonPlugin,{
	buttonItems: null,
	extendedModes: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showExtendedProfilesButton"; },
	getIndex:function() { return 550; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.extendedProfilesPlugin"; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Change page layout"); },
	checkEnabled:function(onSuccess) {onSuccess(paella.extended);},
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	buttons: [],
	selected_button: null,

	_isFullscreen:false,

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if(thisClass.isPopUpOpen()){
		    	if (event.keyCode == Keys.Up) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length)
				            thisClass.buttons[thisClass.selected_button].className = 'extendedProfilesItemButton '+thisClass.buttons[thisClass.selected_button].data.profileData;

					    thisClass.selected_button--;
					    thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
		           	}
	            }
	            else if (event.keyCode == Keys.Down) {
	            	if(thisClass.selected_button<thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0)
	            			thisClass.buttons[thisClass.selected_button].className = 'extendedProfilesItemButton '+thisClass.buttons[thisClass.selected_button].data.profileData;

	            		thisClass.selected_button++;
	               		thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	                thisClass.onItemClick(thisClass.buttons[thisClass.selected_button],thisClass.buttons[thisClass.selected_button].data.profile,thisClass.buttons[thisClass.selected_button].data.profileData);
	            }
        	}
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		extendedModes = ['fullScr','full','big','small'];
		for (var mode in extendedModes){
		  var modeData = extendedModes[mode];
		  var buttonItem = thisClass.getProfileItemButton(mode,modeData);
		  thisClass.buttonItems[mode] = buttonItem;
		  domElement.appendChild(buttonItem);
		  this.buttons.push(buttonItem);
		}
		this.selected_button = thisClass.buttons.length;
	},

	getProfileItemButton:function(profile,profileData) {
		var elem = document.createElement('div');
		elem.className = 'extendedProfilesItemButton ' + profileData
		elem.id = profile + '_button';
		elem.data = {
			profile:profile,
			profileData:profileData,
			plugin:this
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(elem,this.data.profile, this.data.profileData);
		});
		return elem;
	},

	onItemClick:function(button,profile,profileData) {
		if (profileData == "fullScr") {
			//paella.extended.setProfile('full');
			this.switchFullScreen(profile,profileData);
		} else {
			if (this.isFullscreen()) {
				if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
					this._isFullscreen = false;
				}
				else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
					this._isFullscreen = false;
				}
				else if (document.msExitFullscreen) {
					document.msExitFullscreen();
					this._isFullscreen = false;
				}
				else if (document.cancelFullScreen) {
					document.cancelFullScreen();
					this._isFullscreen = false;
				}
				this.buttonItems[0].className  = this.getButtonItemClass('fullScr',false);
			}

			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),false);
			this.buttonItems[profile].className = this.getButtonItemClass(profileData,true);
			paella.extended.setProfile(button.data.profileData);
		}
	    paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	},

	getButtonItemClass:function(profileName,selected) {
		return 'extendedProfilesItemButton ' + profileName  + ((selected) ? ' selected':'');
	},

	switchFullScreen:function(profile,profileData){
		var thisClass = this;
		var fs = document.getElementById(paella.player.mainContainer.id);
		if (this.isFullscreen()) {
			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),true);
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,false);
				this._isFullscreen = false;
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
				this.buttonItems[profile].className = this.getButtonItemClass(profileData,false);
				this._isFullscreen = false;
			}
			else if (document.msExitFullscreen) {
				document.msExitFullscreen();
				this.buttonItems[profile].className = this.getButtonItemClass(profileData,false);
				this._isFullscreen = false;
			}
			else if (document.cancelFullScreen) {
				document.cancelFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,false);
				this._isFullscreen = false;
			}
		}
		else {
			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),false);
			if (fs.webkitRequestFullScreen) {
				fs.webkitRequestFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,true);
				this._isFullscreen = true;
			}
			else if (fs.mozRequestFullScreen){
				fs.mozRequestFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,true);
				this._isFullscreen = true;
			}
			else if (fs.msRequestFullscreen) {
				fs.msRequestFullscreen();
				this.buttonItems[profile].className = this.getButtonItemClass(profileData,true);
				this._isFullscreen = true;
			}
			else if (fs.requestFullScree) {
				fs.requestFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,true);
				this._isFullscreen = true;
			}
			else {
				alert('Your browser does not support fullscreen mode');
			}

			var onFullScreenEvent = function(){
				var fs = thisClass.isFullscreen();
				if (fs) {
					var fs = document.getElementById(paella.player.mainContainer.id);
					fs.style.width = '100%';
					fs.style.height = '100%';
				}
				else {
					var fs = document.getElementById(paella.player.mainContainer.id);
					fs.style.width = '';
					fs.style.height = '';
				}
			}
			document.addEventListener("fullscreenchange", onFullScreenEvent, false);
			document.addEventListener("webkitfullscreenchange", onFullScreenEvent, false);
			document.addEventListener("mozfullscreenchange", onFullScreenEvent, false);
		}
	},

	isFullscreen:function() {
		return this._isFullscreen;
	}
});


paella.plugins.extendedProfilesPlugin = new paella.plugins.ExtendedProfilesPlugin();



paella.plugins.FootPrintsPlugin = Class.create(paella.ButtonPlugin,{
	INTERVAL_LENGTH:5,
	inPosition:0,
	outPosition:0,
	canvas: null,
	footPrintsTimer: null,
	footPrintsData: {},

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "footPrints"; },
	getIndex:function() { return 590; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Show statistics"); },
	getName:function() { return "es.upv.paella.FootPrintsPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },


	setup:function(){
		var thisClass = this;
		paella.events.bind(paella.events.timeUpdate, function(event) { thisClass.onTimeUpdate(); });

		switch(this.config.skin) {
		case 'custom':
			this.fillStyle = this.config.fillStyle;
			this.strokeStyle = this.config.strokeStyle;
			break;

		case 'dark':
			this.fillStyle = '#727272';
			this.strokeStyle = '#424242';
			break;

		case 'light':
			this.fillStyle = '#d8d8d8';
			this.strokeStyle = '#ffffff';
			break;

		default:
			this.fillStyle = '#d8d8d8';
			this.strokeStyle = '#ffffff';
			break;
		}

	},

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	buildContent:function(domElement) {
		var container = document.createElement('div');
		container.className = 'footPrintsContainer';

		this.canvas = document.createElement('canvas');
		this.canvas.id = 'footPrintsCanvas';
		this.canvas.className = 'footPrintsCanvas';
		container.appendChild(this.canvas);


		domElement.appendChild(container);
	},

    onTimeUpdate:function() {
		var videoCurrentTime = Math.round(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());
		if (this.inPosition <= videoCurrentTime && videoCurrentTime <= this.inPosition + this.INTERVAL_LENGTH) {
			this.outPosition = videoCurrentTime;
			if (this.inPosition + this.INTERVAL_LENGTH === this.outPosition) {
				this.trackFootPrint(this.inPosition, this.outPosition);
				this.inPosition = this.outPosition;
			}
		}
		else {
			this.trackFootPrint(this.inPosition, this.outPosition);
			this.inPosition = videoCurrentTime;
			this.outPosition = videoCurrentTime;
		}
    },

    trackFootPrint:function(inPosition, outPosition) {
    	var data = {"in": inPosition, "out": outPosition};
		paella.data.write('footprints',{id:paella.initDelegate.getId()}, data);
    },

	willShowContent:function() {
		var thisClass = this;
		this.loadFootprints();
		this.footPrintsTimer = new paella.utils.Timer(function(timer) {
			thisClass.loadFootprints();
			},5000);
		this.footPrintsTimer.repeat = true;
	},

	didHideContent:function() {
		if (this.footPrintsTimer!=null) {
			this.footPrintsTimer.cancel();
			this.footPrintsTimer = null;
		}
	},

    loadFootprints:function () {
	    var thisClass = this;
		paella.data.read('footprints',{id:paella.initDelegate.getId()},function(data,status) {
			var footPrintsData = {};
			var duration = Math.floor(paella.player.videoContainer.duration());
			var trimStart = Math.floor(paella.player.videoContainer.trimStart());

            var lastPosition = -1;
            var lastViews = 0;
			for (var i = 0; i < data.length; i++) {
				position = data[i].position - trimStart;
				if (position < duration){
					views = data[i].views;

					if (position - 1 != lastPosition){
						for (var j = lastPosition + 1; j < position; j++) {
							footPrintsData[j] = lastViews;
						}
					}
					footPrintsData[position] = views;
					lastPosition = position;
					lastViews = views;
				}
			}
			thisClass.drawFootPrints(footPrintsData);
		});
    },

	drawFootPrints:function(footPrintsData) {
		if (this.canvas) {
			var duration = Object.keys(footPrintsData).length;
			var ctx = this.canvas.getContext("2d");
			var h = 0;
			for (var i = 0; i<duration; ++i) {
				if (footPrintsData[i] > h) { h = footPrintsData[i]; }
			}

			this.canvas.setAttribute("width", duration);
			this.canvas.setAttribute("height", h);
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.fillStyle = this.fillStyle; //'#faa166'; //'#9ED4EE';
			ctx.strokeStyle = this.strokeStyle; //'#fa8533'; //"#0000FF";
			ctx.lineWidth = 2;

			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;

			for (var i = 0; i<duration-1; ++i) {
				ctx.beginPath();
				ctx.moveTo(i, h);
				ctx.lineTo(i, h-footPrintsData[i]);
				ctx.lineTo(i+1, h-footPrintsData[i+1]);
				ctx.lineTo(i+1, h);
				ctx.closePath();
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(i, h-footPrintsData[i]);
				ctx.lineTo(i+1, h-footPrintsData[i+1]);
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
});

paella.plugins.footPrintsPlugin = new paella.plugins.FootPrintsPlugin();


paella.plugins.FrameControlPlugin = Class.create(paella.ButtonPlugin,{
	frames:null,
	highResFrames:null,
	currentFrame:null,
	navButtons:null,
	buttons: [],
	contx:null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "frameControl"; },
	getIndex:function() { return 510; },
	getMinWindowSize:function() { return 200; },
	getName:function() { return "es.upv.paella.FrameControlPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Navigate by slides"); },
	checkEnabled:function(onSuccess) {
		onSuccess(paella.initDelegate.initParams.videoLoader.frameList!=null && paella.initDelegate.initParams.videoLoader.frameList.length>0);
	},

	setup:function() {
		var thisClass = this;
		var oldClassName;
		var blockCounter = 1;
		var correctJump = 0;
		var selectedItem = -1;
		var jumpAtItem;
    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	var visibleItems = Math.floor(thisClass.contx.offsetWidth/100);
        	var rest = thisClass.buttons.length%visibleItems;
        	var blocks = Math.floor(thisClass.buttons.length/visibleItems);

        	if (thisClass.isPopUpOpen()){
		    	if (event.keyCode == Keys.Left) {
		           if(selectedItem > 0){
				        thisClass.buttons[selectedItem].className = oldClassName;

					    selectedItem--;

					    if(blockCounter > blocks) correctJump = visibleItems - rest;
	            		jumpAtItem = ((visibleItems)*(blockCounter-1))-1-correctJump;

	            		if(selectedItem == jumpAtItem && selectedItem != 0){
				            thisClass.navButtons.left.scrollContainer.scrollLeft -= visibleItems*105;
							--blockCounter;
	            		}

	            		if(this.hiResFrame)thisClass.removeHiResFrame();
					    thisClass.buttons[selectedItem].frameControl.onMouseOver(null,thisClass.buttons[selectedItem].frameData);
					    oldClassName = thisClass.buttons[selectedItem].className;
					    thisClass.buttons[selectedItem].className = 'frameControlItem selected';
		           	}
	            }
	            else if (event.keyCode == Keys.Right) {
	            	if(selectedItem<thisClass.buttons.length-1){
	            		if(selectedItem >= 0){
	            			thisClass.buttons[selectedItem].className = oldClassName;
	            		}

	            		selectedItem++;

	            		if (blockCounter == 1) correctJump = 0;
	            		jumpAtItem = (visibleItems)*blockCounter-correctJump;

	            		if(selectedItem == jumpAtItem){
				        	thisClass.navButtons.left.scrollContainer.scrollLeft += visibleItems*105;
		            		++blockCounter;
	            		}

	            		if(this.hiResFrame)thisClass.removeHiResFrame();
	            		thisClass.buttons[selectedItem].frameControl.onMouseOver(null,thisClass.buttons[selectedItem].frameData);
	               		oldClassName = thisClass.buttons[selectedItem].className;
	               		thisClass.buttons[selectedItem].className = 'frameControlItem selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	            	thisClass.buttons[selectedItem].frameControl.onClick(null,thisClass.buttons[selectedItem].frameData);
	            	oldClassName = 'frameControlItem current';
	            }
	            else if (event.keyCode == Keys.Esc){
	            	thisClass.removeHiResFrame();
	            }
            }
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.frames = [];
		var container = document.createElement('div');
		container.className = 'frameControlContainer';

		thisClass.contx = container;

		var content = document.createElement('div');
		content.className = 'frameControlContent';

		this.navButtons = {
			left:document.createElement('div'),
			right:document.createElement('div')
		}
		this.navButtons.left.className = 'frameControl navButton left';
		this.navButtons.right.className = 'frameControl navButton right';

		var frame = this.getFrame(null);

		domElement.appendChild(this.navButtons.left);
		domElement.appendChild(container);
		container.appendChild(content);
		domElement.appendChild(this.navButtons.right);

		this.navButtons.left.scrollContainer = container;
		$(this.navButtons.left).click(function(event) {
			this.scrollContainer.scrollLeft -= 100;
		});

		this.navButtons.right.scrollContainer = container;
		$(this.navButtons.right).click(function(event) {
			this.scrollContainer.scrollLeft += 100;
		});

		content.appendChild(frame);

		var itemWidth = $(frame).outerWidth(true);
		content.innerHTML = '';

		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		if (frames) {
			var numFrames = 0;
			for (var key in frames) {
				var frameItem = this.getFrame(frames[key]);
				content.appendChild(frameItem,'frameContrlItem_' + numFrames);
				this.frames.push(frameItem);
				++numFrames;
			}
		}

		$(content).css({width:(numFrames * itemWidth) + 'px'});

		var This = this;
		paella.events.bind(paella.events.setTrim,function(event,params) {
			This.checkVisibility(params.trimEnabled,params.trimStart,params.trimEnd);
		});

		paella.events.bind(paella.events.timeupdate,function(event,params) { This.onTimeUpdate(params.currentTime) });
	},

	showHiResFrame:function(url) {
		var frameRoot = document.createElement("div");
		var frame = document.createElement("div");
		var hiResImage = document.createElement('img');
        hiResImage.className = 'frameHiRes';
        hiResImage.setAttribute('src',url);
        hiResImage.setAttribute('style', 'width: 100%;');

		$(frame).append(hiResImage);
		$(frameRoot).append(frame);

        frameRoot.setAttribute('style', 'display: table;');
        frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');
		overlayContainer = paella.player.videoContainer.overlayContainer;

		var streams = paella.initDelegate.initParams.videoLoader.streams;
		if (streams.length == 1){
			overlayContainer.addElement(frameRoot, overlayContainer.getMasterRect());
		}
		else if (streams.length >= 2){
			overlayContainer.addElement(frameRoot, overlayContainer.getSlaveRect());
		}
		overlayContainer.enableBackgroundMode();
		this.hiResFrame = frameRoot;
	},

	removeHiResFrame:function() {
		overlayContainer = paella.player.videoContainer.overlayContainer;
		overlayContainer.removeElement(this.hiResFrame);
		overlayContainer.disableBackgroundMode();
	},

	checkVisibility:function(trimEnabled,trimStart,trimEnd) {
		if (!trimEnabled) {
			for (var i = 0; i<this.frames.length;++i) {
				$(this.frames[i]).show();
			}
		}
		else {
			for (var i = 0; i<this.frames.length; ++i) {
				var frameElem = this.frames[i];
				var frameData = frameElem.frameData;
				if (frameData.time<trimStart) {
					if (this.frames.length>i+1 && this.frames[i+1].frameData.time>trimStart) {
						$(frameElem).show();
					}
					else {
						$(frameElem).hide();
					}
				}
				else if (frameData.time>trimEnd) {
					$(frameElem).hide();
				}
				else {
					$(frameElem).show();
				}
			}
		}
	},

	getFrame:function(frameData,id) {
		var frame = document.createElement('div');
		frame.className = 'frameControlItem';
		if (id) frame.id = id;
		if (frameData) {

			this.buttons.push(frame);

			frame.frameData = frameData;
			frame.frameControl = this;
			image = frameData.thumb ? frameData.thumb:frameData.url;
			var labelTime = paella.utils.timeParse.secondsToTime(frameData.time);
			frame.innerHTML = '<img src="' + image + '" alt="" class="frameControlImage" title="'+labelTime+'" aria-label="'+labelTime+'"></img>';
			$(frame).mouseover(function(event) {
				this.frameControl.onMouseOver(event,this.frameData);
			});
			$(frame).mouseout(function(event) {
				this.frameControl.onMouseOut(event,this.frameData);
			});
			$(frame).click(function(event) {
				this.frameControl.onClick(event,this.frameData);
			});
		}
		return frame;
	},

	onMouseOver:function(event,frameData) {
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		var frame = frames[frameData.time];
		if (frame) {
			var image = frame.url;
			this.showHiResFrame(image);
		}
	},

	onMouseOut:function(event,frameData) {
		this.removeHiResFrame();
	},

	onClick:function(event,frameData) {
		paella.events.trigger(paella.events.seekToTime,{time:frameData.time + 1});
	},

	onTimeUpdate:function(currentTime) {
		var frame = null;
		for (var i = 0; i<this.frames.length; ++i) {
			if (this.frames[i].frameData.time<=currentTime) {
				frame = this.frames[i];
			}
			else {
				break;
			}
		}
		if (this.currentFrame!=frame) {
			//this.navButtons.left.scrollContainer.scrollLeft += 100;

			if (this.currentFrame) this.currentFrame.className = 'frameControlItem';
			this.currentFrame = frame;
			this.currentFrame.className = 'frameControlItem current';
		}
	}
});

paella.plugins.frameControlPlugin = new paella.plugins.FrameControlPlugin();


paella.plugins.FullScreenPlugin = Class.create(paella.ButtonPlugin, {
	_isFullscreen:false,

	getIndex:function() { return 551; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showFullScreenButton"; },
	getName:function() { return "es.upv.paella.fullScreenButtonPlugin"; },
	checkEnabled:function(onSuccess) {
		onSuccess(!paella.extended);
	},
	getDefaultToolTip:function() { return paella.dictionary.translate("Go FullScreen"); },


	action:function(button) {
		//if (window==window.top) {
		//	this.doFullScreen(button);
		//}
		//else {
		//	window.top.location = window.location;
		//}
		this.doFullScreen(button);
	},

	doFullScreen:function(button) {
		var fs = document.getElementById(paella.player.mainContainer.id);
		fs.style.width = '100%';
		fs.style.height = '100%';
		if (this.isFullscreen()) {

			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
				button.className = this.getButtonItemClass(false);
				this._isFullscreen = false;
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
				button.className = this.getButtonItemClass(false);
				this._isFullscreen = false;
			}
			else if (document.msExitFullscreen()) {
				document.msExitFullscreen();
				button.class = this.getButtonItemClass(false);
				this._isFullscreen = false;
			}
			else if (document.cancelFullScreen) {
				document.cancelFullScreen();
				button.className = this.getButtonItemClass(false);
				this._isFullscreen = false;
			}


		}
		else {
			if (fs.webkitRequestFullScreen) {
				fs.webkitRequestFullScreen();
				button.className = this.getButtonItemClass(true);
				this._isFullscreen = true;
			}
			else if (fs.mozRequestFullScreen){
				fs.mozRequestFullScreen();
				button.className = this.getButtonItemClass(true);
				this._isFullscreen = true;
			}
			else if (fs.msRequestFullscreen) {
				fs.msRequestFullscreen();
				button.className = this.getButtonItemClass(true);
				this._isFullscreen = true;
			}
			else if (fs.requestFullScreen) {
				fs.requestFullScreen();
				button.className = this.getButtonItemClass(true);
				this._isFullscreen = true;
			}
			else {
				alert('Your browser does not support fullscreen mode');
			}
		}
	},

	isFullscreen:function() {
		return this._isFullscreen;
	},

	getButtonItemClass:function(selected) {
		return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' active':'');
	}
});

paella.plugins.fullScreenPlugin = new paella.plugins.FullScreenPlugin();


paella.LiveStreamIndicator = Class.create(paella.VideoOverlayButtonPlugin,{
    isEditorVisible:function() {
        return paella.editor.instance!=null;
    },
    getIndex:function() {return 10;},

    getSubclass:function() {
        return "liveIndicator";
    },

    getAlignment:function() {
        return 'right';
    },
    getDefaultToolTip:function() { return paella.dictionary.translate("This video is a live stream"); },

    checkEnabled:function(onSuccess) {
        onSuccess(paella.player.isLiveStream());
    },

    setup:function() {
        var thisClass = this;
    },

    action:function(button) {
        paella.messageBox.showMessage(paella.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"));
    },

    getName:function() {
        return "es.upv.paella.LiveStramingIndicator";
    }
});

paella.plugins.liveStreamIndicator = new paella.LiveStreamIndicator();



paella.plugins.PlayPauseButtonPlugin = Class.create(paella.ButtonPlugin, {
	playSubclass:'playButton',
	pauseSubclass:'pauseButton',

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.playSubclass; },
	getName:function() { return "es.upv.paella.playPauseButtonPlugin"; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Play"); },
	getIndex:function() {return 110;},

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {
		var This = this;
		paella.events.bind(paella.events.play,function(event) { This.changeSubclass(This.pauseSubclass); This.setToolTip(paella.dictionary.translate("Pause"));});
		paella.events.bind(paella.events.pause,function(event) { This.changeSubclass(This.playSubclass); This.setToolTip(paella.dictionary.translate("Play"));});
	},

	action:function(button) {
		if (paella.player.videoContainer.paused()) {
			paella.events.trigger(paella.events.play);
		}
		else {
			paella.events.trigger(paella.events.pause);
		}
	}
});

paella.plugins.playPauseButtonPlugn = new paella.plugins.PlayPauseButtonPlugin();

paella.plugins.PlayButtonOnScreen = Class.create(paella.EventDrivenPlugin,{
	containerId:'paella_plugin_PlayButtonOnScreen',
	container:null,
	enabled:true,
	isPlaying:false,

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {
		this.container = document.createElement('div');
		this.container.className = "playButtonOnScreen";
		this.container.id = this.containerId;
		paella.player.videoContainer.domElement.appendChild(this.container);
		var thisClass = this;
		$(this.container).click(function(event){thisClass.onPlayButtonClick()});

		var icon = document.createElement('canvas');
		icon.className = "playButtonOnScreenIcon";
		icon.setAttribute("width", 300);
		icon.setAttribute("height",300);
		var ctx = icon.getContext('2d');

		ctx.beginPath();
		ctx.arc(150,150,140,0,2*Math.PI,true);
		ctx.closePath();

		ctx.strokeStyle = 'white';
		ctx.lineWidth = 10;
		ctx.stroke();
		ctx.fillStyle = '#8f8f8f';
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(100,70);
		ctx.lineTo(250,150);
		ctx.lineTo(100,230);
		ctx.lineTo(100,70);
		ctx.closePath();
		ctx.fillStyle = 'white';
		ctx.fill();

		ctx.stroke();

		this.container.appendChild(icon);
	},

	getEvents:function() {
		return [paella.events.endVideo,paella.events.play,paella.events.pause,paella.events.showEditor,paella.events.hideEditor];
	},

	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.endVideo:
				this.endVideo();
				break;
			case paella.events.play:
				this.play();
				break;
			case paella.events.pause:
				this.pause();
				break;
			case paella.events.showEditor:
				this.showEditor();
				break;
			case paella.events.hideEditor:
				this.hideEditor();
				break;
		}
	},

	onPlayButtonClick:function() {
		$(document).trigger(paella.events.play);
	},

	endVideo:function() {
		this.isPlaying = false;
		this.checkStatus();
	},

	play:function() {
		this.isPlaying = true;
		this.checkStatus();
	},

	pause:function() {
		this.isPlaying = false;
		this.checkStatus();
	},

	showEditor:function() {
		this.enabled = false;
		this.checkStatus();
	},

	hideEditor:function() {
		this.enabled = true;
		this.checkStatus();
	},

	checkStatus:function() {
		if ((this.enabled && this.isPlaying) || !this.enabled) {
			$(this.container).hide();
		}
		else {
			$(this.container).show();
		}
	},

	getIndex:function() {
		return 1010;
	},

	getName:function() {
		return "es.upv.paella.playButtonOnScreen";
	}
});

new paella.plugins.PlayButtonOnScreen();


paella.plugins.MultipleQualitiesPlugin = Class.create(paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showMultipleQualitiesPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.multipleQualitiesPlugin"; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Change video quality"); },	
	checkEnabled:function(onSuccess) { onSuccess(this.checkStreams()); },
	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Presenter':'Presentador',
				'Slide':'Diapositiva'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},
						      
	checkStreams:function(){
		this.currentMaster = paella.player.videoContainer.currentMasterVideoData;
		this.currentSlave = paella.player.videoContainer.currentSlaveVideoData;
		
		var allMasterSources = paella.player.videoContainer.masterVideoData.sources;
		for (key in allMasterSources){
			for (var j =0; j < allMasterSources[key].length; ++j ){ 
				if ((allMasterSources[key][j].type == this.currentMaster.type)){
					this.availableMasters.push(allMasterSources[key][j]);
				}
			}
		}

		
		if (this.currentSlave){
			var allSlaveSources = paella.player.videoContainer.slaveVideoData.sources;
			for (key in allSlaveSources){
				for (var j =0; j < allSlaveSources[key].length; ++j ){
					if ((allSlaveSources[key][j].type == this.currentSlave.type)){
						this.availableSlaves.push(allSlaveSources[key][j]);
					}
				}
			}
		}
		
		return (this.availableMasters.length > 1 || this.availableSlaves.length > 1)
	},
	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var thisClass = this;
		this.currentUrl = window.location;
			
		var selectQuality = document.createElement('div');
		selectQuality.className = 'selectQuality';
		
		var labelM = document.createElement('label');
		labelM.innerHTML = paella.dictionary.translate("Presenter");
				
		var comboM = document.createElement('select');
		comboM.id = 'master';
		$(comboM).change(function() {
			var param1Q = $(comboM).val();
			thisClass.changeVideoStream(param1Q,comboM.id);
		});
			
		if (this.availableMasters.length > 1){
			for (var j =0; j < this.availableMasters.length; ++j ){
				var w = this.availableMasters[j].res.w;
				var h = this.availableMasters[j].res.h
				var option = document.createElement('option');
				option.value = w+"x"+h;
				option.innerHTML = w+" x "+h;
				if ((w == this.currentMaster.res.w) && (h == this.currentMaster.res.h)){
					option.setAttribute('selected',true);
				}
				comboM.appendChild(option);	
			}
			selectQuality.appendChild(labelM);
			selectQuality.appendChild(comboM);
		}
		
		var labelS = document.createElement('label');
		labelS.innerHTML = paella.dictionary.translate("Slide");
		
		var comboS = document.createElement('select');
		comboS.id = 'slave';
		$(comboS).change(function() {
			var param1Q = $(comboS).val();
			thisClass.changeVideoStream(param1Q,comboS.id);
		});
			
		if (this.availableSlaves.length+1 > 1){
			for (var j =0; j < this.availableSlaves.length; ++j ){
				var w = this.availableSlaves[j].res.w;
				var h = this.availableSlaves[j].res.h
				var option = document.createElement('option');
				option.value = w+"x"+h;
				option.innerHTML = w+" x "+h;
				if ((w == this.currentSlave.res.w) && (h == this.currentSlave.res.h)){
					option.setAttribute('selected',true);
				}
				comboS.appendChild(option);	
			}
			selectQuality.appendChild(labelS);
			selectQuality.appendChild(comboS);
		}
		
		domElement.appendChild(selectQuality);
	},
	
	changeVideoStream:function(newRes,combo) {
		var newUrl;
		var resM = paella.utils.parameters.get("resmaster");
		var resS = paella.utils.parameters.get("resslave");
		
		if (combo == "master"){
			if (resM)
				newUrl = this.constructNewUrl("resmaster",newRes,"resslave",resS);
			else 
				newUrl = this.currentUrl+"&resmaster="+newRes;
		} else { 
			if (resS)
				newUrl = this.constructNewUrl("resslave",newRes,"resmaster",resM);
			else
				newUrl = this.currentUrl+"&resslave="+newRes;
		}
		
		window.open (newUrl,'_self',false)
	},
	
	constructNewUrl:function(param1,param1Q,param2,param2Q) {
		var iniUrl = this.currentUrl.href.split("&");
		return iniUrl[0]+"&"+param1+"="+param1Q+((param2Q) ? "&"+param2+"="+param2Q:'');
	}
});
  

paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();


paella.plugins.RepeatButtonPlugin = Class.create(paella.ButtonPlugin, {
	repeatSubclass:'repeatButton',

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.repeatSubclass; },
	getName:function() { return "es.upv.paella.repeatButtonPlugin"; },
	getIndex:function() {return 120;},
	getDefaultToolTip:function() { return paella.dictionary.translate("Rewind 30 seconds"); },

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	action:function(button) {
	  var newTime = paella.player.videoContainer.currentTime()-30;
	  paella.events.trigger(paella.events.seekToTime,{time:newTime});
	}
});

paella.plugins.repeatButtonPlugin = new paella.plugins.RepeatButtonPlugin();


paella.ShowEditorPlugin = Class.create(paella.VideoOverlayButtonPlugin,{
	isEditorVisible:function() {
		return paella.editor.instance!=null;
	},
	getIndex:function() {return 10;},

	getSubclass:function() {
		return "showEditorButton";
	},

	getAlignment:function() {
		return 'right';
	},
	getDefaultToolTip:function() { return paella.dictionary.translate("Enter editor mode"); },

	checkEnabled:function(onSuccess) {
		onSuccess(paella.editor && paella.player.config.editor && paella.player.config.editor.enabled && !paella.utils.userAgent.browser.IsMobileVersion &&
			(paella.initDelegate.initParams.accessControl.permissions.canWrite || this.config.alwaysVisible)
			&& !paella.player.isLiveStream());
	},

	setup:function() {
		var thisClass = this;

		paella.events.bind(paella.events.hideEditor,function(event) { thisClass.onHideEditor(); });
		paella.events.bind(paella.events.showEditor,function(event) { thisClass.onShowEditor(); });
	},

	action:function(button) {
		var editorPage = this.config.editorPage ? this.config.editorPage: '';
		if ((paella.extended) || (window!=window.top)){
			window.open(editorPage + "?id=" + paella.player.videoIdentifier, '_top');
		}
		else {
			paella.events.trigger(paella.events.showEditor);
		}
	},

	onHideEditor:function() {
		this.showButton();
	},

	onShowEditor:function() {
		this.hideButton();
	},

	getName:function() {
		return "es.upv.paella.ShowEditorPlugin";
	}
});

paella.plugins.showEditorPlugin = new paella.ShowEditorPlugin();


paella.plugins.SnapShotsEditorPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:null,
	selectedTrackItem:null,
	highResFrames:null,
	
	getIndex:function() { return 0; },
	
	checkEnabled:function(onSuccess) {
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		onSuccess(frames!=null);
	},

	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Slides':'Diapositivas',
				'Slide': 'Diapositiva' 
			};
			paella.dictionary.addDictionary(esDict);
		}	
	},


	showHiResFrame:function(url) {
		var frameRoot = document.createElement("div"); 
		var frame = document.createElement("div"); 
		var hiResImage = document.createElement('img'); 
        hiResImage.className = 'frameHiRes';
        hiResImage.setAttribute('src',url);
        hiResImage.setAttribute('style', 'width: 100%;');

		$(frame).append(hiResImage);
		$(frameRoot).append(frame);

        frameRoot.setAttribute('style', 'display: table;');
        frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');
		overlayContainer = paella.player.videoContainer.overlayContainer;
		
		var streams = paella.initDelegate.initParams.videoLoader.streams;
		if (streams.length == 1){
			overlayContainer.addElement(frameRoot, overlayContainer.getMasterRect());
		}
		else if (streams.length >= 2){
			overlayContainer.addElement(frameRoot, overlayContainer.getSlaveRect());
		}
		overlayContainer.enableBackgroundMode();
		this.hiResFrame = frameRoot;
	},

	removeHiResFrame:function() {
		overlayContainer = paella.player.videoContainer.overlayContainer;
		overlayContainer.removeElement(this.hiResFrame);
		overlayContainer.disableBackgroundMode();
	},


	createTrackContent: function(frameItem, numSlide) {		
		onMouseOverScript = "paella.plugins.snapShotsEditorPlugin.showHiResFrame('" + frameItem.url + "');"
		onMouseOutScript = "paella.plugins.snapShotsEditorPlugin.removeHiResFrame();"
		
		return 	'<div class="snapShotsEditorPluginBox" onmouseover="'+ onMouseOverScript + '" onmouseout="' + onMouseOutScript + '">' +
				'	<img class="snapShotsEditorPluginImage" src="' + frameItem.thumb + '"/>' +
				'	<div class="snapShotsEditorPluginSliteText">'+ paella.dictionary.translate("Slide") + ' ' + numSlide +'</div>' +
				'</div>';					
	},

	getTrackItems:function() {
		if (this.tracks == null) {
			this.tracks = [];
			var frames = paella.initDelegate.initParams.videoLoader.frameList;
			if (frames) {
				var numFrame = 0;
				var keys = Object.keys(paella.initDelegate.initParams.videoLoader.frameList);
				
				for (;numFrame< keys.length-1; numFrame++) {
					var frameItem = frames[keys[numFrame]];
					var s = parseInt(keys[numFrame]);
					var e = parseInt(keys[numFrame+1]);
					var d = e-s;
					this.tracks.push({s:s, e:e, d:d, name: this.createTrackContent(frameItem, numFrame+1)});
				}
				if (keys.length > 0){
					var frameItem = frames[keys[numFrame]];
					var s = parseInt(keys[numFrame]);
					var e = paella.player.videoContainer.duration();
					var d = e-s;				
					this.tracks.push({s:s, e:e, d:d, name: this.createTrackContent(frameItem, numFrame+1)});
				}			
			}		
		}	
		return this.tracks;
	},
	
	getTools:function() {
		return [];
	},
	
	onToolSelected:function(toolName) {
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "es.upv.paella.editor.SnapShotsEditorPlugin";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Slides");
	},
	
	getColor:function() {
		return 'rgb(159, 166, 88)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	allowEditContent:function() {
		return false;
	},
	allowDrag:function() {
		return false;
	},	
	allowResize:function() {
		return false;
	},	
	
	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	onSave:function(success) {
		success(true);
	}
});

paella.plugins.snapShotsEditorPlugin = new paella.plugins.SnapShotsEditorPlugin();


paella.plugins.SocialPlugin = Class.create(paella.ButtonPlugin,{
	buttonItems: null,
	socialMedia: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showSocialPluginButton"; },
	getIndex:function() { return 560; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.socialPlugin"; },
	checkEnabled:function(onSuccess) { onSuccess(true); },
	getDefaultToolTip:function() { return paella.dictionary.translate("Share this video"); },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	buttons: [],
	selected_button: null,


    initialize:function() {
        this.parent();
        if (paella.utils.language()=='es') {
            var esDict = {
                'Custom size:': 'Tamaño personalizado:',
                'Choose your embed size. Copy the text and paste it in your html page.': 'Elija el tamaño del video a embeber. Copie el texto y péguelo en su página html.',
                'Width:':'Ancho:',
                'Height:':'Alto:'
            };
            paella.dictionary.addDictionary(esDict);
        }
    },

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if(thisClass.isPopUpOpen()) {
		    	if (event.keyCode == Keys.Up) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length)
				            thisClass.buttons[thisClass.selected_button].className = 'socialItemButton '+thisClass.buttons[thisClass.selected_button].data.mediaData;

					    thisClass.selected_button--;
					    thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
		           	}
	            }
	            else if (event.keyCode == Keys.Down) {
	            	if(thisClass.selected_button<thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0)
	            			thisClass.buttons[thisClass.selected_button].className = 'socialItemButton '+thisClass.buttons[thisClass.selected_button].data.mediaData;

	            		thisClass.selected_button++;
	               		thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	                thisClass.onItemClick(thisClass.buttons[thisClass.selected_button].data.mediaData);
	            }
        	}
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		socialMedia = ['facebook','twitter', 'embed'];
		for (var media in socialMedia){
		  var mediaData = socialMedia[media];
		  var buttonItem = thisClass.getSocialMediaItemButton(mediaData);
		  thisClass.buttonItems[media] = buttonItem;
		  domElement.appendChild(buttonItem);
		  this.buttons.push(buttonItem);
		}
		this.selected_button = thisClass.buttons.length;
	},

	getSocialMediaItemButton:function(mediaData) {
		var elem = document.createElement('div');
		elem.className = 'socialItemButton ' + mediaData
		elem.id = mediaData + '_button';
		elem.data = {
			mediaData:mediaData,
			plugin:this
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this.data.mediaData);
		});
		return elem;
	},

	onItemClick:function(mediaData) {
		var url = this.getVideoUrl();
		switch (mediaData) {
			case ('twitter'):
				window.open('http://twitter.com/home?status=' + url);
				break;
			case ('facebook'):
				window.open('http://www.facebook.com/sharer.php?u=' + url);
				break;
			case ('embed'):
				this.embedPress();
				break;
		}
		paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	},

	getVideoUrl:function() {
		var url = document.location.href;
		return url;
	},

    embedPress:function() {
        var host = document.location.protocol + "//" +document.location.host;
        var pathname = document.location.pathname;

        var p = pathname.split("/");
        if (p.length > 0){p[p.length-1] = "embed.html";}
		var id = paella.initDelegate.getId();
        var url = host+p.join("/")+"?id="+id;
        //var paused = paella.player.videoContainer.paused();
        //$(document).trigger(paella.events.pause);

        var divSelectSize="<div style='display:inline-block;'> " +
            "    <input class='embedSizeButton' style='width:110px; height:73px;' value='620x349' />" +
            "    <input class='embedSizeButton' style='width:100px; height:65px;' value='540x304' />" +
            "    <input class='embedSizeButton' style='width:90px;  height:58px;' value='460x259' />" +
            "    <input class='embedSizeButton' style='width:80px;  height:50px;' value='380x214' />" +
            "    <input class='embedSizeButton' style='width:70px;  height:42px;' value='300x169' />" +
            "</div><div style='display:inline-block; vertical-align:bottom; margin-left:10px;'>"+
            "    <div>"+paella.dictionary.translate("Custom size:")+"</div>" +
            "    <div>"+paella.dictionary.translate("Width:")+" <input id='social_embed_width-input' class='embedSizeInput' maxlength='4' type='text' name='Costum width min 300px' alt='Costum width min 300px' title='Costum width min 300px' value=''></div>" +
            "    <div>"+paella.dictionary.translate("Height:")+" <input id='social_embed_height-input' class='embedSizeInput' maxlength='4' type='text' name='Costum width min 300px' alt='Costum width min 300px' title='Costum width min 300px' value=''></div>" +
            "</div>";


        var divEmbed = "<div id='embedContent' style='text-align:left; font-size:14px; color:black;'><div id=''>"+divSelectSize+"</div> <div id=''>"+paella.dictionary.translate("Choose your embed size. Copy the text and paste it in your html page.")+"</div> <div id=''><textarea id='social_embed-textarea' class='social_embed-textarea' rows='4' cols='1' style='font-size:12px; width:95%; overflow:auto; margin-top:5px; color:black;'></textarea></div>  </div>";


        paella.messageBox.showMessage(divEmbed, {
            closeButton:true,
            width:'750px',
            height:'210px',
            onClose:function() {
            //      if (paused == false) {$(document).trigger(paella.events.play);}
            }
        });
        var w_e = $('#social_embed_width-input')[0];
        var h_e = $('#social_embed_height-input')[0];
        w_e.onkeyup = function(event){
            var width = parseInt(w_e.value);
            var height = parseInt(h_e.value);
            if (isNaN(width)){
            	w_e.value="";
            }
            else{
                if (width<300){
                    $("#social_embed-textarea")[0].value = "Embed width too low. The minimum value is a width of 300.";
                }
                else{
                    if (isNaN(height)){
                        height = (width/(16/9)).toFixed();
                        h_e.value = height;
                    }
                    $("#social_embed-textarea")[0].value = '<iframe allowfullscreen src="'+url+'" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="'+width+'" height="'+height+'"></iframe>';
                }
            }
        };
        var embs = $(".embedSizeButton");
        for (var i=0; i< embs.length; i=i+1){
            var e = embs[i];
            e.onclick=function(event){
                var value = event.toElement.value;
                if (value) {
                    var size = value.split("x");

                    w_e.value = size[0];
                    h_e.value = size[1];
                    $("#social_embed-textarea")[0].value = '<iframe allowfullscreen src="'+url+'" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="'+size[0]+'" height="'+size[1]+'"></iframe>';
                }
            };
        }
    }



});


paella.plugins.socialPlugin = new paella.plugins.SocialPlugin();


paella.plugins.TrimmingLoaderPlugin = Class.create(paella.EventDrivenPlugin,{
	
	getName:function() { return "es.upv.paella.TrimmingPlayerPlugin"; },
	//checkEnabled:function(onSuccess) { onSuccess(paella.player.config.trimming && paella.player.config.trimming.enabled); },
		
	getEvents:function() { return [paella.events.loadComplete,paella.events.showEditor,paella.events.hideEditor]; },

	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.loadComplete:
				this.loadTrimming();
				break;
			case paella.events.showEditor:
				paella.player.videoContainer.disableTrimming();
				break;
			case paella.events.hideEditor:
				if (paella.player.config.trimming && paella.player.config.trimming.enabled) {
					paella.player.videoContainer.enableTrimming();
				}
				break;
		}
	},
	
	loadTrimming:function() {
		var videoId = paella.initDelegate.getId();
		paella.data.read('trimming',{id:videoId},function(data,status) {
			if (data && status && data.end>0) {
				paella.player.videoContainer.enableTrimming();
				paella.player.videoContainer.setTrimming(data.start, data.end);
			}
		});
	}
});

paella.plugins.trimmingLoaderPlugin = new paella.plugins.TrimmingLoaderPlugin();

paella.plugins.TrimmingTrackPlugin = Class.create(paella.editor.MainTrackPlugin,{
	trimmingTrack:null,
	trimmingData:{s:0,e:0},

	getTrackItems:function() {
		if (this.trimmingTrack==null) {
			this.trimmingTrack = {id:1,s:0,e:0};
			this.trimmingTrack.s = paella.player.videoContainer.trimStart();
			this.trimmingTrack.e = paella.player.videoContainer.trimEnd();
			this.trimmingData.s = this.trimmingTrack.s;
			this.trimmingData.e = this.trimmingTrack.e;
		}		
		var tracks = [];
		tracks.push(this.trimmingTrack);
		return tracks;
	},
		
	getName:function() { return "es.upv.paella.editor.TrimmingTrackPlugin"; },
	
	getTrackName:function() {
		return paella.dictionary.translate("Trimming");
	},
	
	getColor:function() {
		return 'rgb(0, 51, 107)';
	},
	
	//checkEnabled:function(isEnabled) {
	//	isEnabled(paella.plugins.trimmingLoaderPlugin.config.enabled);
		//isEnabled(paella.player.config.trimming && paella.player.config.trimming.enabled);
		//},
	
	onSave:function(onDone) {
		paella.player.videoContainer.enableTrimming();
		paella.player.videoContainer.setTrimmingStart(this.trimmingTrack.s);
		paella.player.videoContainer.setTrimmingEnd(this.trimmingTrack.e);
		
		paella.data.write('trimming',{id:paella.initDelegate.getId()},{start:this.trimmingTrack.s,end:this.trimmingTrack.e},function(data,status) {
			onDone(status);
		});
	},
	
	onDiscard:function(onDone) {
		this.trimmingTrack.s = this.trimmingData.s;
		this.trimmingTrack.e = this.trimmingData.e;
		onDone(true);
	},
	
	allowDrag:function() {
		return false;
	},
	
	onTrackChanged:function(id,start,end) {
		this.trimmingTrack.s = start;
		this.trimmingTrack.e = end;
		this.parent(id,start,end);
	},

	contextHelpString:function() {
		// TODO: Implement this using the standard paella.dictionary class
		if (paella.utils.language()=="es") {
			return "Utiliza la herramienta de recorte para definir el instante inicial y el instante final de la clase. Para cambiar la duración solo hay que arrastrar el inicio o el final de la pista \"Recorte\", en la linea de tiempo.";
		}
		else {
			return "Use this tool to define the start and finish time.";
		}
	}
});

paella.plugins.trimmingTrackPlugin = new paella.plugins.TrimmingTrackPlugin();



paella.plugins.UserTrackingCollectorPlugIn = Class.create(paella.EventDrivenPlugin,{
	heartbeatTimer:null,

	getName:function() { return "es.upv.paella.userTrackingCollectorPlugIn"; },

	setup:function() {
		var thisClass = this;
		
		if ( this.config.heartBeatTime > 0) {		
			this.heartbeatTimer = new paella.Timer(function(timer) {thisClass.registerEvent('HEARTBEAT'); }, this.config.heartBeatTime);
			this.heartbeatTimer.repeat = true;
		}
		//--------------------------------------------------
		$(window).resize(function(event) { thisClass.onResize(); });
				
	},
	
	getEvents:function() {	
		return [paella.events.play,
				paella.events.pause,
				paella.events.seekTo,
				paella.events.seekToTime
		];
	},
	
	onEvent:function(eventType, params) {
		this.registerEvent(eventType);		
	},
	
	onResize:function() {
		var w = $(window);
		var label = w.width()+"x"+w.height();
		this.registerEvent("RESIZE-TO", label);
	},
	
	registerEvent: function(event, label) {
		var videoCurrentTime = parseInt(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());			
		var playing = !paella.player.videoContainer.paused();
		
		var eventInfo = {
			time: videoCurrentTime,
			playing: playing,
			event: event,
			label: label
		};
		paella.events.trigger(paella.events.userTracking, eventInfo);		
	}
});


paella.plugins.userTrackingCollectorPlugIn = new paella.plugins.UserTrackingCollectorPlugIn();


paella.plugins.UserTrackingGoogleAnalyticsSaverPlugIn = Class.create(paella.EventDrivenPlugin,{
	getName:function() { return "es.upv.paella.userTrackingGoogleAnalyticsSaverPlugIn"; },
	getEvents:function() { return [paella.events.userTracking]; },
	
	

	checkEnabled:function(onSuccess) {
		var trackingID = this.config.trackingID;
		var domain = this.config.domain || "auto";
		if (trackingID){
			paella.debug.log("Google Analitycs Enabled");
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','//www.google-analytics.com/analytics.js','__gaTracker');
			
			__gaTracker('create', trackingID, domain);
			__gaTracker('send', 'pageview');
			onSuccess(true);
		}		
		else {
			paella.debug.log("No Google Tracking ID found in config file. Disabling Google Analitycs PlugIn");
			onSuccess(false);
		}				
	},

	onEvent:function(eventType, params) {
		if (this.config.trackingEvents) {
			var category = this.config.category || "PaellaPlayer";
			var action = params.event;
			var label =  "";
			
			try {
				label = JSON.stringify({
					videoID: paella.player.videoIdentifier,
					label: params.label,
				});
			}
			catch(e) {}
							
			__gaTracker('send', 'event', category, action, label);
		}
	}	
});


paella.plugins.userTrackingGoogleAnalyticsSaverPlugIn = new paella.plugins.UserTrackingGoogleAnalyticsSaverPlugIn();





paella.plugins.ViewModePlugin = Class.create(paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showViewModeButton"; },
	getIndex:function() { return 540; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.viewModePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Change video layout"); },		
	checkEnabled:function(onSuccess) {
		onSuccess(paella.initDelegate.initParams.videoLoader.streams.length>=2);
	},

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if (thisClass.isPopUpOpen()){
		    	if (event.keyCode == Keys.Up) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length)
				            thisClass.buttons[thisClass.selected_button].className = 'viewModeItemButton '+thisClass.buttons[thisClass.selected_button].data.profile;
				    
					    thisClass.selected_button--;
					    thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected'; 
		           	}
	            }
	            else if (event.keyCode == Keys.Down) {
	            	if( thisClass.selected_button < thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0)
	            			thisClass.buttons[thisClass.selected_button].className = 'viewModeItemButton '+thisClass.buttons[thisClass.selected_button].data.profile;
	            		
	            		thisClass.selected_button++;
	               		thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	                thisClass.onItemClick(thisClass.buttons[thisClass.selected_button],thisClass.buttons[thisClass.selected_button].data.profile,thisClass.buttons[thisClass.selected_button].data.profile);
	            }
        	}
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		paella.Profiles.loadProfileList(function(profiles) {
			for (var profile in profiles) {
				var profileData = profiles[profile];
				var buttonItem = thisClass.getProfileItemButton(profile,profileData);
				thisClass.buttonItems[profile] = buttonItem;
				domElement.appendChild(buttonItem);
				thisClass.buttons.push(buttonItem);
			}
			thisClass.selected_button = thisClass.buttons.length;
		});
	},
	
	getProfileItemButton:function(profile,profileData) {
		var elem = document.createElement('div');
		elem.className = this.getButtonItemClass(profile,false);
		elem.id = profile + '_button';
		elem.data = {
			profile:profile,
			profileData:profileData,
			plugin:this
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this,this.data.profile,this.data.profileData);
		});
		return elem;
	},
	
	onItemClick:function(button,profile,profileData) {
		var prevButtonItem = this.buttonItems[paella.player.selectedProfile];
		var nextButtonItem = this.buttonItems[profile];
		
		if (nextButtonItem && prevButtonItem!=nextButtonItem) {
			prevButtonItem.className = this.getButtonItemClass(paella.player.selectedProfile,false);
			nextButtonItem.className = this.getButtonItemClass(profile,true);
			paella.events.trigger(paella.events.setProfile,{profileName:profile});
			paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
		}
	},
	
	getButtonItemClass:function(profileName,selected) {
		return 'viewModeItemButton ' + profileName  + ((selected) ? ' selected':'');
	}
});

paella.plugins.viewModePlugin = new paella.plugins.ViewModePlugin();


