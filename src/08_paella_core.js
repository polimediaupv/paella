paella.AccessControl = Class.create({
	permissions:{
		canRead:false,
		canContribute:false,
		canWrite:false,
		loadError:true,
		isAnonymous:false
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
		var videoElement = document.createElement('video');
		var ogg = videoElement.canPlayType('video/ogg; codecs="theora"');
		ogg = (ogg=='probably') || (ogg=='maybe');
		return ogg;
	},

	isWebmCapable:function() {
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
		return status;
	},

	getPreferredMethod:function(streamIndex) {
		var userAgent = new UserAgent();
		var preferredMethod = null;
		var methods = paella.player.config.player.methods;
		
		// Mobile browsers can only play one stream
		if (userAgent.browser.isMobileVersion && streamIndex>=1) {
			for (var i=0;i<methods.length;++i) {
				if (methods[i].name=='image' && methods[i].enabled && this.isStreamCompatible(streamIndex,methods[i])) {
					preferredMethod = method;
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
		asyncLoader.addCallback(new paella.DictionaryLoader(this.initParams.dictionaryUrl));
		asyncLoader.addCallback(new paella.DictionaryLoader(this.initParams.editorDictionaryUrl));
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
		new paella.Ajax(configUrl,params,function(data) {
			if (typeof(data)=="string") {
				data = JSON.parse(data);
			}
			onSuccess(data);
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