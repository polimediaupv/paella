paella.AsyncLoaderCallback = Class.create({
	name:"",

	initialize:function(name) {
		this.name = name;	
	},
	
	load:function(onSuccess,onError) {
		paella.debug.log("loading " + this.name);
		onSuccess();
		// If error: onError()
	}
});

paella.AsyncLoader = Class.create({
	callbackArray:null,
	currentCallback:-1,

	initialize:function() {
		this.callbackArray = [];
	},
	
	addCallback:function(cb) {
		this.currentCallback = -1;
		this.callbackArray.push(cb);
		return cb;
	},
	
	load:function(onSuccess,onError) {
		this.currentCallback++;
		var thisClass = this;
		var cb = this.callbackArray[this.currentCallback];
		if (cb) {
			cb.load(function() {
				thisClass.load(onSuccess);
			},
			function() {
				if(onError) onError();
			});
		}
		else if (onSuccess) {
			onSuccess();
		}
	}
});

paella.DictionaryLoader = Class.create(paella.AsyncLoaderCallback,{
	dictionaryUrl:'',

	initialize:function(dictionaryUrl) {
		this.parent("dictionaryLoader");
		this.dictionaryUrl = dictionaryUrl;
	},
	
	load:function(onSuccess,onError) {
		var lang = paella.utils.language();
		var url = this.dictionaryUrl + '_' + lang + '.json';
		var params = {}
		new paella.Ajax(url,params,function(data) {
			if (typeof(data)=="string") {
				try {
					data = JSON.parse(data);
				}
				catch (e) {
					onSuccess();
					return;
				}
			}

			paella.dictionary.addDictionary(data);
			onSuccess();
		});
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

paella.Ajax = Class.create({
	callback:null,

	// Params:
	//	url:http://...
	//	data:{param1:'param1',param2:'param2'...}
	// 	onSuccess:function(response)
	initialize:function(url,params,onSuccess,proxyUrl,useJsonp,method) {
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

paella.Cookies = Class.create({
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
});

var Utils = Class.create({
	cookies:new paella.Cookies(),

	parameters:{
		get:function(parameter) {
			var url = location.href;
			var index = url.indexOf("?");
			index = url.indexOf(parameter,index) + parameter.length;
			if (url.charAt(index)=="=") {
				var result = url.indexOf("&",index);
				if (result==-1) {
					result = url.length;
				}
				return url.substring(index + 1, result);
			}
			return "";
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
				return hourAgo + paella.dictionary.translate("{0} months ago").replace(/\{0\}/g, monthsAgo);
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
	}
});

paella.utils = new Utils();

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
