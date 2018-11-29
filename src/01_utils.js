/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/


// Paella Mouse Manager
///////////////////////////////////////////////////////
(() => {
	class MouseManager {	
		get targetObject() { return this._targetObject; }
		set targetObject(t) { this._targetObject = t; }

		constructor() {
			paella.events.bind('mouseup',(event) => this.up(event));
			paella.events.bind('mousemove',(event) => this.move(event));
			paella.events.bind('mouseover',(event) =>  this.over(event));
		}
	
		down(targetObject,event) {
			this.targetObject = targetObject;
			if (this.targetObject && this.targetObject.down) {
				this.targetObject.down(event,event.pageX,event.pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	
		up(event) {
			if (this.targetObject && this.targetObject.up) {
				this.targetObject.up(event,event.pageX,event.pageY);
				event.cancelBubble = true;
			}
			this.targetObject = null;
			return false;
		}
	
		out(event) {
			if (this.targetObject && this.targetObject.out) {
				this.targetObject.out(event,event.pageX,event.pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	
		move(event) {
			if (this.targetObject && this.targetObject.move) {
				this.targetObject.move(event,event.pageX,event.pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	
		over(event) {
			if (this.targetObject && this.targetObject.over) {
				this.targetObject.over(event,event.pageX,event.pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	}

	paella.MouseManager = MouseManager;
})();


// paella.utils
///////////////////////////////////////////////////////
(function initSkinDeps() {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = paella.baseUrl + 'resources/bootstrap/css/bootstrap.min.css';
	link.type = 'text/css';
	link.media = 'screen';
	link.charset = 'utf-8';
	document.head.appendChild(link);
})();

paella.utils = {	
	mouseManager: new paella.MouseManager(),
	
	folders: {
		get: function(folder) {
			if (paella.player && paella.player.config && paella.player.config.folders && paella.player.config.folders[folder]) {
				return paella.player.config.folders[folder];	
			}
			return undefined;			
		},
		
		profiles: function() {
			return paella.baseUrl + (paella.utils.folders.get("profiles") || "config/profiles");
		},
		
		resources: function() {
			return paella.baseUrl + (paella.utils.folders.get("resources") || "resources");
		},
		
		skins: function() {
			return paella.baseUrl + (paella.utils.folders.get("skins") || paella.utils.folders.get("resources") + "/style");
		}
	},
	
	styleSheet: {
		removeById:function(id) {
			var outStyleSheet = $(document.head).find('#' + id)[0];
			if (outStyleSheet) {
				document.head.removeChild(outStyleSheet);
			}
		},
		
		remove:function(fileName) {
			var links = document.head.getElementsByTagName('link');
			for (var i =0; i<links.length; ++i) {
				if (links[i].href) {
					document.head.removeChild(links[i]);
					break;
				}
			}
		},
		
		add:function(fileName,id) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = fileName;
			link.type = 'text/css';
			link.media = 'screen';
			link.charset = 'utf-8';
			if (id) link.id = id;
			document.head.appendChild(link);
		},
		
		swap:function(outFile,inFile) {
			this.remove(outFile);
			this.add(inFile);
		}
	},
	
	skin: {
		set:function(skinName) {
			var skinId = 'paellaSkin';
			paella.utils.styleSheet.removeById(skinId);
			paella.utils.styleSheet.add(paella.utils.folders.skins() + '/style_' + skinName + '.css');
			base.cookies.set("skin",skinName);
		},
		
		restore:function(defaultSkin) {
			var storedSkin = base.cookies.get("skin");
			if (storedSkin && storedSkin!="") {
				this.set(storedSkin);
			}
			else {
				this.set(defaultSkin);
			}
		}
	},

	timeParse:{
		timeToSeconds:function(timeString) {
			var hours = 0;
			var minutes = 0;
			var seconds =0;
			if (/([0-9]+)h/i.test(timeString)) {
				hours = parseInt(RegExp.$1) * 60 * 60;
			}
			if (/([0-9]+)m/i.test(timeString)) {
				minutes = parseInt(RegExp.$1) * 60;
			}
			if (/([0-9]+)s/i.test(timeString)) {
				seconds = parseInt(RegExp.$1);
			}
			return hours + minutes + seconds;
		},
	
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
				return base.dictionary.translate("1 second ago");
			}
			if (secAgo < 60) {
				return base.dictionary.translate("{0} seconds ago").replace(/\{0\}/g, secAgo);
			}
			// Minutes
			var minAgo = Math.round(secAgo/60);
			if (minAgo <= 1) {
				return base.dictionary.translate("1 minute ago");
			}
			if (minAgo < 60) {
				return base.dictionary.translate("{0} minutes ago").replace(/\{0\}/g, minAgo);
			}
			//Hours
			var hourAgo = Math.round(secAgo/(60*60));
			if (hourAgo <= 1) {
				return base.dictionary.translate("1 hour ago");
			}
			if (hourAgo < 24) {
				return base.dictionary.translate("{0} hours ago").replace(/\{0\}/g, hourAgo);
			}
			//Days
			var daysAgo = Math.round(secAgo/(60*60*24));
			if (daysAgo <= 1) {
				return base.dictionary.translate("1 day ago");
			}
			if (daysAgo < 24) {
				return base.dictionary.translate("{0} days ago").replace(/\{0\}/g, daysAgo);
			}
			//Months
			var monthsAgo = Math.round(secAgo/(60*60*24*30));
			if (monthsAgo <= 1) {
				return base.dictionary.translate("1 month ago");
			}
			if (monthsAgo < 12) {
				return base.dictionary.translate("{0} months ago").replace(/\{0\}/g, monthsAgo);
			}
			//Years
			var yearsAgo = Math.round(secAgo/(60*60*24*365));
			if (yearsAgo <= 1) {
				return base.dictionary.translate("1 year ago");
			}
			return base.dictionary.translate("{0} years ago").replace(/\{0\}/g, yearsAgo);
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

	objectFromString: function(str) {
	  var arr = str.split(".");
	
	  var fn = (window || this);
	  for (var i = 0, len = arr.length; i < len; i++) {
		fn = fn[arr[i]];
	  }
	
	  if (typeof fn !== "function") {
		throw new Error("constructor not found");
	  }
	
	  return fn;
	}
};

(function() {
	let g_delegateCallbacks = {};
	let g_dataDelegates = [];

	class DataDelegate {
		read(context,params,onSuccess) {
			if (typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}

		write(context,params,value,onSuccess) {
			if (typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}

		remove(context,params,onSuccess) {
			if (typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	}

	paella.DataDelegate = DataDelegate;

	paella.dataDelegates = {};

	class Data {
		get enabled() { return this._enabled; }

		get dataDelegates() { return g_dataDelegates; }
	
		constructor(config) {
			this._enabled = config.data.enabled;

			// Delegate callbacks
			let executedCallbacks = [];
			for (let context in g_delegateCallbacks) {
				let callback = g_delegateCallbacks[context];
				let DelegateClass = null;
				let delegateName = null;

				if (!executedCallbacks.some((execCallbackData) => {
					if (execCallbackData.callback==callback) {
						delegateName = execCallbackData.delegateName;
						return true;
					}
				})) {
					DelegateClass = g_delegateCallbacks[context]();
					delegateName = DelegateClass.name;
					paella.dataDelegates[delegateName] = DelegateClass;
					executedCallbacks.push({ callback:callback, delegateName:delegateName });
				}

				if (!config.data.dataDelegates[context]) {
					config.data.dataDelegates[context] = delegateName;
				}

			}

			for (var key in config.data.dataDelegates) {
				try {
					
					var delegateName = config.data.dataDelegates[key];
					var DelegateClass = paella.dataDelegates[delegateName];
					var delegateInstance = new DelegateClass();
					g_dataDelegates[key] = delegateInstance;
				
				}
				catch (e) {
					console.warn("Warning: delegate not found - " + delegateName);
				}
			}


			// Default data delegate
			if (!this.dataDelegates["default"]) {
				this.dataDelegates["default"] = new paella.dataDelegates.DefaultDataDelegate();
			}
		}
	
		read(context,key,onSuccess) {
			var del = this.getDelegate(context);
			del.read(context,key,onSuccess);
		}
	
		write(context,key,params,onSuccess) {
			var del = this.getDelegate(context);
			del.write(context,key,params,onSuccess);
		}
	
		remove(context,key,onSuccess) {
			var del = this.getDelegate(context);
			del.remove(context,key,onSuccess);
		}
	
		getDelegate(context) {
			if (this.dataDelegates[context]) return this.dataDelegates[context];
			else return this.dataDelegates["default"];
		}
	}

	paella.Data = Data;

	paella.addDataDelegate = function(context,callback) {
		if (Array.isArray(context)) {
			context.forEach((ctx) => {
				g_delegateCallbacks[ctx] = callback;
			})
		}
		else if (typeof(context)=="string") {
			g_delegateCallbacks[context] = callback;
		}
	}

})();

paella.addDataDelegate(["default","trimming"], () => {
	paella.dataDelegates.DefaultDataDelegate = class CookieDataDelegate extends paella.DataDelegate {
		serializeKey(context,params) {
			if (typeof(params)=='object') params = JSON.stringify(params);
			return context + '|' + params;
		}
	
		read(context,params,onSuccess) {
			var key = this.serializeKey(context,params);
			var value = base.cookies.get(key);
			try {
				value = unescape(value);
				value = JSON.parse(value);
			}
			catch (e) {}
			if (typeof(onSuccess)=='function') {
				onSuccess(value,true);
			}
		}
	
		write(context,params,value,onSuccess) {
			var key = this.serializeKey(context,params);
			if (typeof(value)=='object') value = JSON.stringify(value);
			value = escape(value);
			base.cookies.set(key,value);
			if(typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	
		remove(context,params,onSuccess) {
			var key = this.serializeKey(context,params);
			if (typeof(value)=='object') value = JSON.stringify(value);
			base.cookies.set(key,'');
			if(typeof(onSuccess)=='function') {
				onSuccess({},true);
			}
		}
	}

	return paella.dataDelegates.DefaultDataDelegate;
})

// Will be initialized inmediately after loading config.json, in PaellaPlayer.onLoadConfig()
paella.data = null;


(() => {
	// Include scripts in header
	let g_requiredScripts = {};
	
	paella.require = function(path) {
		if (!g_requiredScripts[path]) {
			g_requiredScripts[path] = new Promise((resolve,reject) => {
				let script = document.createElement("script");
				if (path.split(".").pop()=='js') {
					script.src = path;
					script.async = false;
					document.head.appendChild(script);
					setTimeout(() => resolve(), 100);
				}
				else {
					reject(new Error("Unexpected file type"));
				}
			});
		}
		return g_requiredScripts[path];
	};

	class MessageBox {
		get modalContainerClassName() { return 'modalMessageContainer'; } 
		get frameClassName() { return 'frameContainer'; }
		get messageClassName() { return 'messageContainer'; }
		get errorClassName() { return 'errorContainer'; }
		
		get currentMessageBox() { return this._currentMessageBox; }
		set currentMessageBox(m) { this._currentMessageBox = m; } 
		get messageContainer() { return this._messageContainer; }
		get onClose() { return this._onClose; }
		set onClose(c) { this._onClose = c; }
	
		constructor() {
			this._messageContainer = null;
			$(window).resize((event) => this.adjustTop());
		}

		showFrame(src,params) {
			var closeButton = true;
			var onClose = null;
			if (params) {
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowFrame(src,closeButton,onClose);
		}
	
		doShowFrame(src,closeButton,onClose) {
			this.onClose = onClose;
			$('#playerContainer').addClass("modalVisible");
	
			if (this.currentMessageBox) {
				this.close();
			}
	
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
			modalContainer.appendChild(messageContainer);
	
			var iframeContainer = document.createElement('iframe');
			iframeContainer.src = src;
			iframeContainer.setAttribute("frameborder", "0");
			iframeContainer.style.width = "100%";
			iframeContainer.style.height = "100%";
			messageContainer.appendChild(iframeContainer);
	
			if (paella.player && paella.player.isFullScreen()) {
				paella.player.mainContainer.appendChild(modalContainer);
			}else{
				$('body')[0].appendChild(modalContainer);
			}
	
			this.currentMessageBox = modalContainer;
			this._messageContainer = messageContainer;
			this.adjustTop();
	
			if (closeButton) {
				this.createCloseButton();
			}
		}
	
		showElement(domElement,params) {
			var closeButton = true;
			var onClose = null;
			var className = this.messageClassName;
			if (params) {
				className = params.className;
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowElement(domElement,closeButton,className,onClose);
		}
	
		showMessage(message,params) {
			var closeButton = true;
			var onClose = null;
			var className = this.messageClassName;
			if (params) {
				className = params.className;
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowMessage(message,closeButton,className,onClose);
		}
	
		doShowElement(domElement,closeButton,className,onClose) {
			this.onClose = onClose;
			$('#playerContainer').addClass("modalVisible");
	
			if (this.currentMessageBox) {
				this.close();
			}
			if (!className) className = this.messageClassName;
	
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
			messageContainer.appendChild(domElement);
			modalContainer.appendChild(messageContainer);
	
			$('body')[0].appendChild(modalContainer);
	
			this.currentMessageBox = modalContainer;
			this._messageContainer = messageContainer;
			this.adjustTop();
	
			if (closeButton) {
				this.createCloseButton();
			}
		}
	
		doShowMessage(message,closeButton,className,onClose) {
			this.onClose = onClose;
			$('#playerContainer').addClass("modalVisible");
	
			if (this.currentMessageBox) {
				this.close();
			}
			if (!className) className = this.messageClassName;
	
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
			messageContainer.innerHTML = message;
			modalContainer.appendChild(messageContainer);
	
			if (paella.player && paella.player.isFullScreen()) {
				paella.player.mainContainer.appendChild(modalContainer);
			}else{
				$('body')[0].appendChild(modalContainer);
			}
	
			this.currentMessageBox = modalContainer;
			this._messageContainer = messageContainer;
			this.adjustTop();
	
			if (closeButton) {
				this.createCloseButton();
			}
		}

		showError(message,params) {
			var closeButton = false;
			var onClose = null;
			if (params) {
				closeButton = params.closeButton;
				onClose = params.onClose;
			}
	
			this.doShowError(message,closeButton,onClose);
		}
	
		doShowError(message,closeButton,onClose) {
			this.doShowMessage(message,closeButton,this.errorClassName,onClose);
		}
	
		createCloseButton() {
			if (this._messageContainer) {
				var closeButton = document.createElement('span');
				this._messageContainer.appendChild(closeButton);
				closeButton.className = 'paella_messageContainer_closeButton icon-cancel-circle';
				$(closeButton).click((event) => this.onCloseButtonClick());
			}
		}
		
		adjustTop() {
			if (this.currentMessageBox) {
	
				var msgHeight = $(this._messageContainer).outerHeight();
				var containerHeight = $(this.currentMessageBox).height();
	
				var top = containerHeight/2 - msgHeight/2;
				this._messageContainer.style.marginTop = top + 'px';
			}
		}
		
		close() {
			if (this.currentMessageBox && this.currentMessageBox.parentNode) {
				var msgBox = this.currentMessageBox;
				var parent = msgBox.parentNode;
				$('#playerContainer').removeClass("modalVisible");
				$(msgBox).animate({opacity:0.0},300,function() {
					parent.removeChild(msgBox);
				});
				if (this.onClose) {
					this.onClose();
				}
			}
		}
	
		onCloseButtonClick() {
			this.close();
		}
	}
	
	paella.MessageBox = MessageBox;
	paella.messageBox = new paella.MessageBox();

})();

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

function paella_DeferredResolved(param) {
	return new Promise((resolve) => {
		resolve(param);
	});
}

function paella_DeferredRejected(param) {
	return new Promise((resolve,reject) => {
		reject(param);
	});
}

function paella_DeferredNotImplemented () {
	return paella_DeferredRejected(new Error("not implemented"));
}
