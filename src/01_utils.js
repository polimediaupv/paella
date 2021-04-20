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
				const pageX = event.pageX || (event.changedTouches.length > 0 ? event.changedTouches[0].pageX : 0);
				const pageY = event.pageY || (event.changedTouches.length > 0 ? event.changedTouches[0].pageY : 0);
				this.targetObject.down(event,pageX,pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	
		up(event) {
			if (this.targetObject && this.targetObject.up) {
				const pageX = event.pageX || (event.changedTouches.length > 0 ? event.changedTouches[0].pageX : 0);
				const pageY = event.pageY || (event.changedTouches.length > 0 ? event.changedTouches[0].pageY : 0);
				this.targetObject.up(event,pageX,pageY);
				event.cancelBubble = true;
			}
			this.targetObject = null;
			return false;
		}
	
		out(event) {
			if (this.targetObject && this.targetObject.out) {
				const pageX = event.pageX || (event.changedTouches.length > 0 ? event.changedTouches[0].pageX : 0);
				const pageY = event.pageY || (event.changedTouches.length > 0 ? event.changedTouches[0].pageY : 0);
				this.targetObject.out(event,pageX,pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	
		move(event) {
			if (this.targetObject && this.targetObject.move) {
				const pageX = event.pageX || (event.changedTouches.length > 0 ? event.changedTouches[0].pageX : 0);
				const pageY = event.pageY || (event.changedTouches.length > 0 ? event.changedTouches[0].pageY : 0);
				this.targetObject.move(event,pageX,pageY);
				event.cancelBubble = true;
			}
			return false;
		}
	
		over(event) {
			if (this.targetObject && this.targetObject.over) {
				const pageX = event.pageX || (event.changedTouches.length > 0 ? event.changedTouches[0].pageX : 0);
				const pageY = event.pageY || (event.changedTouches.length > 0 ? event.changedTouches[0].pageY : 0);
				this.targetObject.over(event,pageX,pageY);
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

paella.utils = paella.utils || {};

paella.utils.mouseManager = new paella.MouseManager();

paella.utils.folders = {
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
}
	
paella.utils.styleSheet = {
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
};
	
paella.utils.skin = {
	set:function(skinName) {
		var skinId = 'paellaSkin';
		paella.utils.styleSheet.removeById(skinId);
		paella.utils.styleSheet.add(paella.utils.folders.skins() + '/style_' + skinName + '.css');
		paella.utils.cookies.set("skin",skinName);
	},
	
	restore:function(defaultSkin) {
		var storedSkin = paella.utils.cookies.get("skin");
		if (storedSkin && storedSkin!="") {
			this.set(storedSkin);
		}
		else {
			this.set(defaultSkin);
		}
	}
};

paella.utils.timeParse = {
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
			return paella.utils.dictionary.translate("1 second ago");
		}
		if (secAgo < 60) {
			return paella.utils.dictionary.translate("{0} seconds ago").replace(/\{0\}/g, secAgo);
		}
		// Minutes
		var minAgo = Math.round(secAgo/60);
		if (minAgo <= 1) {
			return paella.utils.dictionary.translate("1 minute ago");
		}
		if (minAgo < 60) {
			return paella.utils.dictionary.translate("{0} minutes ago").replace(/\{0\}/g, minAgo);
		}
		//Hours
		var hourAgo = Math.round(secAgo/(60*60));
		if (hourAgo <= 1) {
			return paella.utils.dictionary.translate("1 hour ago");
		}
		if (hourAgo < 24) {
			return paella.utils.dictionary.translate("{0} hours ago").replace(/\{0\}/g, hourAgo);
		}
		//Days
		var daysAgo = Math.round(secAgo/(60*60*24));
		if (daysAgo <= 1) {
			return paella.utils.dictionary.translate("1 day ago");
		}
		if (daysAgo < 24) {
			return paella.utils.dictionary.translate("{0} days ago").replace(/\{0\}/g, daysAgo);
		}
		//Months
		var monthsAgo = Math.round(secAgo/(60*60*24*30));
		if (monthsAgo <= 1) {
			return paella.utils.dictionary.translate("1 month ago");
		}
		if (monthsAgo < 12) {
			return paella.utils.dictionary.translate("{0} months ago").replace(/\{0\}/g, monthsAgo);
		}
		//Years
		var yearsAgo = Math.round(secAgo/(60*60*24*365));
		if (yearsAgo <= 1) {
			return paella.utils.dictionary.translate("1 year ago");
		}
		return paella.utils.dictionary.translate("{0} years ago").replace(/\{0\}/g, yearsAgo);
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
};

paella.utils.objectFromString = (str) => {
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

paella.utils.uuid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		let r = Math.random() * 16 | 0;
		let v = (c == 'x' ? r : r) & 0x3 | 0x8;
		return v.toString(16);
	});
};

(() => {

	class TimerManager {
		constructor() {
			this.timerArray = [];
			this.lastId = 0;
		}
	
		setupTimer(timer,time) {
			this.lastId++;
			timer.timerId = this.lastId;
			timer.timeout = time;
			this.timerArray[this.lastId] = timer;
			timer.jsTimerId = setTimeout(
				`g_timerManager.executeTimerCallback(${ this.lastId })`	
			, time);
		}
	
		executeTimerCallback(timerId) {
			var timer = this.timerArray[timerId];
			if (timer && timer.callback) {
				timer.callback(timer,timer.params);
			}
			if (timer.repeat) {
				timer.jsTimerId = setTimeout(
					`g_timerManager.executeTimerCallback(${ timer.timerId })`
				, timer.timeout);
			}
		}
	}

	window.g_timerManager = new TimerManager();

	class Timer {
		static sleep(milliseconds) {
			let start = new Date().getTime();
			for (let i = 0; i<1e7; ++i) {
				if ((new Date().getTime() - start) > milliseconds) {
					break;
				}
			}
		}

		constructor(callback,time,params) {
			this.callback = callback;
			this.params = params;
			this._repeat = false;
			g_timerManager.setupTimer(this,time);
		}

		get repeat() { return this._repeat; }
		set repeat(r) { this._repeat = r; } 

		cancel() {
			clearTimeout(this.jsTimerId);
		}
	}

	paella.utils.Timer = Timer;
})();

(() => {
	// Include scripts in header
	let g_requiredScripts = {};
	
	paella.require = function(path) {
		if (!g_requiredScripts[path]) {
			g_requiredScripts[path] = new Promise((resolve,reject) => {
				paella.utils.ajax.get({url: path}, (data) => {
					try {
						let module = {
							exports: null
						};
						let exports = null;
						eval(data);
						if (module && module.exports) {
							resolve(module.exports);
						}
						else {
							let geval = eval;
							geval(data);
							resolve();
						}
					}
					catch(err) {
						reject(err);
					}
				},
				(err) => {
					reject(err);
				});
			});
		}
		return g_requiredScripts[path];
	};

	paella.tabIndex = new (class TabIndexManager {
		constructor() {
			this._last = 1;
		}

		get next() {
			return this._last++;
		}

		get last() {
			return this._last - 1;
		}

		get tabIndexElements() {
			let result = Array.from($('[tabindex]'));

			// Sort by tabIndex
			result.sort((a,b) => {
				return a.tabIndex-b.tabIndex;
			});

			return result;
		}

		insertAfter(target,elements) {
			if (target.tabIndex==null || target.tabIndex==-1) {
				throw Error("Insert tab index: the target element does not have a valid tabindex.");
			}

			let targetIndex = -1;
			let newTabIndexElements = this.tabIndexElements;
			newTabIndexElements.some((elem,i) => {
				if (elem==target) {
					targetIndex = i;
					return true;
				}
			});
			newTabIndexElements.splice(targetIndex + 1, 0, ...elements);
			newTabIndexElements.forEach((elem,index) => {
				elem.tabIndex = index; + 1
			});
			this._last = newTabIndexElements.length;
		}

		removeTabIndex(elements) {
			Array.from(elements).forEach((e) => {
				e.removeAttribute("tabindex");
			});

			this.tabIndexElements.forEach((elem,index) => {
				elem.tabIndex = index + 1;
				this._last = elem.tabIndex + 1;
			});
		}
	})();

	paella.URL = class PaellaURL {
		constructor(urlText) {
			this._urlText = urlText;
		}

		get text() {
			return this._urlText;
		}

		get isAbsolute() {
			return new RegExp('^([a-z]+://|//)', 'i').test(this._urlText) ||
					/^\//.test(this._urlText);	// We consider that the URLs starting with / are absolute and local to this server
		}

		get isExternal() {
			let thisUrl = new URL(this.absoluteUrl);
			let localUrl = new URL(location.href);
			return thisUrl.hostname != localUrl.hostname;
		}

		get absoluteUrl() {
			let result = "";
			if (new RegExp('^([a-z]+://|//)', 'i').test(this._urlText)) {
				result = this._urlText;
			}
			else if (/^\//.test(this._urlText)) {
				result = `${ location.origin }${ this._urlText }`
			}
			else {
				let pathname = location.pathname;
				if (pathname.lastIndexOf(".")>pathname.lastIndexOf("/")) {
					pathname = pathname.substring(0,pathname.lastIndexOf("/")) + '/';
				}
				result = `${ location.origin }${ pathname }${ this._urlText }`;
			}
			result = (new URL(result)).href;
			return result;
		}

		appendPath(text) {
			if (this._urlText.endsWith("/") && text.startsWith("/")) {
				this._urlText += text.substring(1,text.length);
			}
			else if (this._urlText.endsWith("/") || text.startsWith("/")) {
				this._urlText += text;
			}
			else {
				this._urlText += "/" + text;
			}
			return this;
		}
	}
	
	class Log {
		get kLevelError() { return 1; }
		get kLevelWarning() { return 2; }
		get kLevelDebug() { return 3; }
		get kLevelLog() { return 4; }
	
		
        constructor() {
			this._currentLevel = 0;
            var logLevelParam = paella.utils.parameters.get("logLevel");
            logLevelParam = logLevelParam ? logLevelParam:paella.utils.hashParams.get("logLevel");
            logLevelParam = logLevelParam.toLowerCase();
            switch (logLevelParam) {
                case "error":
                    this.setLevel(this.kLevelError);
                    break;
                case "warning":
                    this.setLevel(this.kLevelWarning);
                    break;
                case "debug":
                    this.setLevel(this.kLevelDebug);
                    break;
                case "log":
                    this.setLevel(this.kLevelLog);
                    break;
            }
        }
    
        logMessage(level,message) {
            var prefix = "";
            if (typeof(level)=="string") {
                message = level;
            }
            else if (level>=paella.log.kLevelError && level<=paella.log.kLevelLog) {
                switch (level) {
                    case paella.log.kLevelError:
                        prefix = "ERROR: ";
                        break;
                    case paella.log.kLevelWarning:
                        prefix = "WARNING: ";
                        break;
                    case paella.log.kLevelDebug:
                        prefix = "DEBUG: ";
                        break;
                    case paella.log.kLevelLog:
                        prefix = "LOG: ";
                        break;
                }
            }
    
            if (this._currentLevel>=level && console.log) {
                console.log(prefix + message);
            }
        }
    
        error(message) {
            this.logMessage(paella.log.kLevelError, message);
        }
    
        warning(message) {
            this.logMessage(paella.log.kLevelWarning, message);
        }
    
        debug(message) {
            this.logMessage(paella.log.kLevelDebug, message);
        }
    
        log(message) {
            this.logMessage(paella.log.kLevelLog, message);
        }
    
        setLevel(level) {
            this._currentLevel = level;
        }
	}
    
	paella.log = new Log();
	
	
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
