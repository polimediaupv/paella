Class ("paella.AccessControl", {
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
	},

	getAuthenticationUrl:function(callbackParam) { return ""; }
});

// Default Access Control
//
Class ("paella.DefaultAccessControl", paella.AccessControl,{
	_authParams:null,

	initialize:function(authParams) {
		this._authParams = authParams || {};
	},

	checkAccess:function(onSuccess) {
		var This = this;
		this.getUserData(function(data) {
			This.permissions = data.permissions;
			This.userData = data.userData;
			onSuccess(This.permissions);
		});
	},

	getUserData:function(onSuccess) {
		var status = false;
		if (paella.player.config.auth) {
			var callback = paella.player.config.auth.userDataCallbackName ? window[paella.player.config.auth.userDataCallbackName]:null;
			if (typeof(callback)=="function") {
				status = true;
				callback(onSuccess);
			}
		}
		if (!status) {
			onSuccess({
				permissions: {
					canRead: true,
					canContribute: false,
					canWrite: false,
					loadError: false,
					isAnonymous: true
				},
				userData: {
					username: 'anonymous',
					name: 'Anonymous',
					avatar: paella.utils.folders.resources() + '/images/default_avatar.png'
				}
			});
		}
	},

	getAuthenticationUrl:function(callbackParams) {
		var authCallback = this._authParams.authCallbackName && window[this._authParams.authCallbackName];
		if (!authCallback && paella.player.config.auth) {
			authCallback = paella.player.config.auth.authCallbackName && window[paella.player.config.auth.authCallbackName];
		}

		if (typeof(authCallback)=="function") {
			return authCallback(callbackParams);
		}
		return "";
	}
});


Class ("paella.VideoLoader", {
	metadata:{		// Video metadata
		title:"",
		duration:0
	},
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

	getMetadata:function() {
		return this.metadata;
	},

	isH264Capable:function() {
		var videoElement = document.createElement('video');
		var h264 = videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"');
		if (h264=="") h264 = videoElement.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
		h264 = (h264=='probably');
		return h264;
	},

	isOggCapable:function() {
		if (base.userAgent.browser.IsMobileVersion) return false;
		var videoElement = document.createElement('video');
		var ogg = videoElement.canPlayType('video/ogg; codecs="theora"');
		ogg = (ogg=='probably');
		return ogg;
	},

	isWebmCapable:function() {
		if (base.userAgent.browser.IsMobileVersion) return false;
		var videoElement = document.createElement('video');
		var webm = videoElement.canPlayType('video/webm; codecs="vp8, vorbis"');
		webm = (webm=='probably');
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

			base.log.debug("Browser video capabilities: mp4=" + ((h264) ? 'yes':'no') + ', ogg=' + ((ogg) ? 'yes':'no') + ', webm=' + ((webm) ? 'yes':'no'));

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
		var status = false;

		if (this.streams.length>streamIndex) {
			var stream = this.streams[streamIndex];

			if (stream.sources.mp4) status = true;
			else if (stream.sources.flv) status = true;
		}

		return status && !base.userAgent.browser.IsMobileVersion;
	},

	isStreamingCompatible:function(streamIndex) {
		var status = false;

		if (this.streams.length>streamIndex) {
			var stream = this.streams[streamIndex];

			if (base.userAgent.browser.IsMobileVersion && stream.sources.hls) status = true;
			else if (!base.userAgent.browser.IsMobileVersion && stream.sources.rtmp) status = true;
			else status = false;
		}

		return status;
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
		var preferredMethod = null;
		var methods = paella.player.config.player.methods;
		var i;

		// Mobile browsers can only play one stream
		if (base.userAgent.browser.IsMobileVersion && streamIndex>=1) {
			for (i=0;i<methods.length;++i) {
				if (methods[i].name=='image' && methods[i].enabled && this.isStreamCompatible(streamIndex,methods[i])) {
					preferredMethod = methods[i];
				}
			}
		}
		else {
			for (i=0;i<methods.length;++i) {
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

Class ("paella.PlayerBase", {
	config:null,
	playerId:'',
	mainContainer:null,
	videoContainer:null,
	controls:null,
	accessControl:null,

	checkCompatibility:function() {
		var message = "";
		if (base.parameters.get('ignoreBrowserCheck')) {
			return true;
		}
		if (base.userAgent.browser.IsMobileVersion) return true;
		var isCompatible =	base.userAgent.browser.Chrome ||
							base.userAgent.browser.Safari ||
							base.userAgent.browser.Firefox ||
							base.userAgent.browser.Opera ||
							base.userAgent.browser.Edge ||
							(base.userAgent.browser.Explorer && base.userAgent.browser.Version.major>=9);
		if (isCompatible) {
			return true;
		}
		else {
			var errorMessage = base.dictionary.translate("It seems that your browser is not HTML 5 compatible");
			paella.events.trigger(paella.events.error,{error:errorMessage});
			message = errorMessage + '<div style="display:block;width:470px;height:140px;margin-left:auto;margin-right:auto;font-family:Verdana,sans-sherif;font-size:12px;"><a href="http://www.google.es/chrome" style="color:#004488;float:left;margin-right:20px;"><img src="'+paella.utils.folders.resources()+'images/chrome.png" style="width:80px;height:80px" alt="Google Chrome"></img><p>Google Chrome</p></a><a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home" style="color:#004488;float:left;margin-right:20px;"><img src="'+paella.utils.folders.resources()+'images/explorer.png" style="width:80px;height:80px" alt="Internet Explorer 9"></img><p>Internet Explorer 9</p></a><a href="http://www.apple.com/safari/" style="float:left;margin-right:20px;color:#004488"><img src="'+paella.utils.folders.resources()+'images/safari.png" style="width:80px;height:80px" alt="Safari"></img><p>Safari 5</p></a><a href="http://www.mozilla.org/firefox/" style="float:left;color:#004488"><img src="'+paella.utils.folders.resources()+'images/firefox.png" style="width:80px;height:80px" alt="Firefox"></img><p>Firefox 12</p></a></div>';
			message += '<div style="margin-top:30px;"><a id="ignoreBrowserCheckLink" href="#" onclick="window.location = window.location + \'&ignoreBrowserCheck=true\'">' + base.dictionary.translate("Continue anyway") + '</a></div>';
			paella.messageBox.showError(message,{height:'40%'});
		}
		return false;
	},

	initialize:function(playerId) {
		if (!this.checkCompatibility()) {
			base.log.debug('It seems that your browser is not HTML 5 compatible');
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

	loadComplete:function(event,params) {

	},

	auth: {
		login: function(redirect) {
			redirect = redirect || window.location.href;
			var url = paella.initDelegate.initParams.accessControl.getAuthenticationUrl(redirect);
			if (url) {
				window.location.href = url;
			}
		},

		permissions:function() {
			return paella.initDelegate.initParams.accessControl.permissions;
		},

		userData:function() {
			return paella.initDelegate.initParams.accessControl.userData;
		}
	}
});

Class ("paella.InitDelegate", {
	initParams:{
		configUrl:'config/config.json',
		dictionaryUrl:'localization/paella',
		//editorDictionaryUrl:'config/editor_dictionary',
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
		return base.parameters.get('id') || "noid";
	},

	loadDictionary:function(onSuccess) {
		var asyncLoader = new base.AsyncLoader();
		asyncLoader.addCallback(new base.DictionaryCallback(this.initParams.dictionaryUrl));
		//asyncLoader.addCallback(new base.DictionaryCallback(this.initParams.editorDictionaryUrl));
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
		base.ajax.get(params,function(data,type,returnCode) {
				if (typeof(data)=='string') {
					try {
						data = JSON.parse(data);
					}
					catch (e) {
						onSuccess({});
					}
				}
				base.dictionary.addDictionary(data);
				onSuccess(data);
			},
			function(data,type,returnCode) {
				paella.messageBox.showError(base.dictionary.translate("Error! Config file not found. Please configure paella!"));
				//onSuccess({});
			});
	},

	loadEditorConfig:function(onSuccess) {
		var data = {
			cssPath: paella.utils.folders.resources() + '/ui/jquery-ui.css'
		};
		onSuccess(data);
	}
});

var paellaPlayer = null;
paella.plugins = {};
paella.plugins.events = {};
paella.initDelegate = null;
