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


// Paella Mouse Manager
///////////////////////////////////////////////////////
Class ("paella.MouseManager", {
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


// paella.utils
///////////////////////////////////////////////////////
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
			return paella.utils.folders.get("profiles") || "config/profiles";			
		},
		
		resources: function() {
			return paella.utils.folders.get("resources") || "resources";			
		},
		
		skins: function() {
			return paella.utils.folders.get("skins") || paella.utils.folders.get("resources") + "/style";			
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
	}	
};




Class ("paella.DataDelegate", {
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

paella.dataDelegates = {};

Class ("paella.dataDelegates.CookieDataDelegate", paella.DataDelegate, {
	initialize:function() {
	},

	serializeKey:function(context,params) {
		if (typeof(params)=='object') params = JSON.stringify(params);
		return context + '|' + params;
	},

	read:function(context,params,onSuccess) {
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
	},

	write:function(context,params,value,onSuccess) {
		var key = this.serializeKey(context,params);
		if (typeof(value)=='object') value = JSON.stringify(value);
		value = escape(value);
		base.cookies.set(key,value);
		if(typeof(onSuccess)=='function') {
			onSuccess({},true);
		}
	},

	remove:function(context,params,onSuccess) {
		var key = this.serializeKey(context,params);
		if (typeof(value)=='object') value = JSON.stringify(value);
		base.cookies.set(key,'');
		if(typeof(onSuccess)=='function') {
			onSuccess({},true);
		}

	}
});

paella.dataDelegates.DefaultDataDelegate = paella.dataDelegates.CookieDataDelegate;


Class ("paella.Data", {
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
				base.log.debug("Warning: delegate not found - " + delegateName);
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

Class ("paella.MessageBox", {
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
