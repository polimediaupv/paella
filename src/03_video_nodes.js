
paella.Profiles = {
	profileList: null,
	
	loadProfile:function(profileName,onSuccessFunction) {
		var defaultProfile;
		if (paella.player && paella.player.config && paella.player.config.defaultProfile) {
				defaultProfile = paella.player.config.defaultProfile;
		}
		
		this.loadProfileList(function(data){		
			var profileData;
			if(data[profileName] ){
			    // Successful mapping
			    profileData = data[profileName];
			} else if (data[defaultProfile]) {
			    // Fallback to default profile
			    profileData = data[defaultProfile];
			    base.cookies.set("lastProfile", defaultProfile);
			} else {
			    // Unable to find or map defaultProfile in profiles.json
			    base.log.debug("Error loading the default profile. Check your Paella Player configuration");
			    return false;
			}
			onSuccessFunction(profileData);
		});
	},

	loadProfileList:function(onSuccessFunction) {
		var thisClass = this;
		if (this.profileList == null) {
			var params = { url:"config/profiles/profiles.json" };
	
			base.ajax.get(params,function(data,mimetype,code) {
					if (typeof(data)=="string") {
						data = JSON.parse(data);
					}
					thisClass.profileList = data;
					onSuccessFunction(thisClass.profileList);
				},
				function(data,mimetype,code) {
					base.log.debug("Error loading video profiles. Check your Paella Player configuration");
				}
			);
		}
		else {
			onSuccessFunction(thisClass.profileList);
		}
	}
};

Class ("paella.RelativeVideoSize", {
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

Class ("paella.VideoElementBase", paella.DomNode,{
	ready:false,
	_metadata:null,
	_rect:null,
	_autoplay:false,

	initialize:function(id,containerType,left,top,width,height) {
		var thisClass = this;
		this._rect = { left:left, top:top, width:width, height:height };
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(top) + '%';
		var percentLeft = relativeSize.percentWSize(left) + '%';
		var percentWidth = relativeSize.percentWSize(width) + '%';
		var percentHeight = relativeSize.percentVSize(height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:GlobalParams.video.zIndex};
		this.parent(containerType,id,style);
	},
	
	callReadyEvent:function() {
		paella.events.trigger(paella.events.singleVideoReady, { sender:this });
	},
	
	callUnloadEvent:function() {
		paella.events.trigger(paella.events.singleVideoUnloaded, { sender:this });
	},

	isReady:function() {
		return this.ready;
	},

	setAutoplay:function(autoplay) {
		this._autoplay = autoplay;
	},

	play:function() {
		base.log.debug("TODO: implement play() function in your VideoElementBase subclass");
	},

	pause:function() {
		base.log.debug("TODO: implement pause() function in your VideoElementBase subclass");
	},

	isPaused:function() {
		base.log.debug("TODO: implement isPaused() function in your VideoElementBase subclass");
		return false;
	},

	duration:function() {
		base.log.debug("TODO: implement duration() function in your VideoElementBase subclass");
		return -1;
	},

	setCurrentTime:function(time) {
		base.log.debug("TODO: implement setCurrentTime() function in your VideoElementBase subclass");
	},

	currentTime:function() {
		base.log.debug("TODO: implement currentTime() function in your VideoElementBase subclass");
		return 0;
	},

	setVolume:function(volume) {
		base.log.debug("TODO: implement setVolume() function in your VideoElementBase subclass");
		return false;
	},

	volume:function() {
		base.log.debug("TODO: implement volume() function in your VideoElementBase subclass");
		return -1;
	},

	setPlaybackRate:function(rate) {
		base.log.debug("TODO: implement setPlaybackRate() function in your VideoElementBase subclass");
	},

	addSource:function(sourceData) {
		base.log.debug("TODO: implement addSource() function in your VideoElementBase subclass");
	},
	
	setPosterFrame:function(url) {
		base.log.debug("TODO: implement setPosterFrame() function");
	},
	
	unload:function() {
		this.callUnloadEvent();
	},
	
	setClassName:function(className) {
		this.domElement.className = className;
	},

	setMetadata:function(data) {
		this._metadata = data;
	},

	getDimensions:function() {
		if (this._metadata && this._metadata.res) {
			return { width: this._metadata.res.w, height: this._metadata.res.h };
		}
		else {
			return { width: this.domElement.videoWidth, height: this.domElement.videoHeight };
		}
	},

	setRect:function(rect,animate) {
		this._rect = JSON.parse(JSON.stringify(rect));
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(rect.top) + '%';
		var percentLeft = relativeSize.percentWSize(rect.left) + '%';
		var percentWidth = relativeSize.percentWSize(rect.width) + '%';
		var percentHeight = relativeSize.percentVSize(rect.height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute'};
		if (animate) {
			this.disableClassName();
			var thisClass = this;
			
			$(this.domElement).animate(style,400,function(){
				thisClass.enableClassName();
				paella.events.trigger(paella.events.setComposition, { video:thisClass });
			});
			this.enableClassNameAfter(400);
		}
		else {
			$(this.domElement).css(style);
			paella.events.trigger(paella.events.setComposition, { video:this });
		}
	},
	
	getRect:function() {
		return this._rect;
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
			$(this.domElement).show();
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


//function paella_flash_video_ready(streamId) {
//	var videoPlayer = paella_flash_VideoContainers[streamId];
//	videoPlayer._isReady = true;
//}

var paella_flash_VideoContainers = {};

Class ("paella.FlashVideo", paella.VideoElementBase,{
	classNameBackup:'',
	flashVideo:null,
	paused:true,
	streamingMode:true,
	flashId:'',
	_isReady:false,
	_duration:0,

	initialize:function(id,left,top,width,height) {
		var This = this;
		this.parent(id,'div',left,top,width,height);
		this.flashId = id + 'Movie';
		paella_flash_VideoContainers[this.flashId] = this;
		
		paella.events.bind(paella.events.flashVideoEvent,function(event,params) {
			if (This.flashId==params.source) {
				This.eventReceived(params.eventName,params.values);
			}
		});
	},

	isReady:function() {
		return this._isReady;
	},
	
	eventReceived:function(eventName,params) {
//		if (eventName=="progress") {
//		}
		
		params = params.split(",");
		var processedParams = {};
		for (var i=0; i<params.length; ++i) {
			var splitted = params[i].split(":");
			var key = splitted[0];
			var value = splitted[1];
			if (value=="NaN") {
				value = NaN;
			}
			else if (/^true$/i.test(value)) {
				value = true;
			}
			else if (/^false$/i.test(value)) {
				value = false;
			}
			else if (!isNaN(parseFloat(value))) {
				value = parseFloat(value);
			}
			processedParams[key] = value;
		}
		this.processEvent(eventName,processedParams);
	},

	setAutoplay:function(autoplay) {
		this._autoplay = autoplay;

	},
	
	processEvent:function(eventName,params) {
		if (eventName!="loadedmetadata" && eventName!="pause" && !this._isReady) {
			this._isReady = true;
			this._duration = params.duration;
			this.callReadyEvent();
		}
		if (eventName=="progress") {
			try { this.flashVideo.setVolume(this._volume); }
			catch(e) {}
			base.log.debug("Flash video event: " + eventName + ", progress: " + this.flashVideo.currentProgress());
		}
		else if (eventName=="ended") {
			base.log.debug("Flash video event: " + eventName);
			paella.events.trigger(paella.events.pause);
			paella.player.controls.showControls();
		}
		else {
			base.log.debug("Flash video event: " + eventName);
		}
	},
	
	setPosterFrame:function(url) {
		if (this._posterFrame===undefined) {
			this._posterFrame = url;
			var posterFrame = document.createElement('img');
			posterFrame.src = url;
			posterFrame.className = "videoPosterFrameImage";
			posterFrame.alt = "poster frame";
			this.domElement.appendChild(posterFrame);
			this._posterFrameElement = posterFrame;
		}
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
				if (this._posterFrameElement) {
					$(this._posterFrameElement).hide();
				}
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
		return this._duration;
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

	setDefaultVolume:function(vol) {
		this._defaultVolume = vol;
		this._volume = vol;
	},
	
	setVolume:function(volume) {
		if (this.flashVideo) {
			this._volume = volume;
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
						base.log.debug('Fail to set volume on ' + thisClass.identifier);
						timer.repeat = true;
					}
				},100);
			}
		}
		return false;
	},

	volume:function() {
		var volume = 0;
		if (this.flashVideo) {
			try {
				volume = this.flashVideo.getVolume();
			}
			catch (e) {
				
			}
		}
		return volume;
	},

	setPlaybackRate:function(rate) {
	},

	createSwfObject:function(swfFile,flashVars) {
		var id = this.identifier;
		var parameters = { wmode:'transparent' };

		var domElement = document.createElement('div');
		this.domElement.appendChild(domElement);
		domElement.id = id + "Movie";

		if (swfobject.hasFlashPlayerVersion("9.0.0")) {
			swfobject.embedSWF(swfFile,domElement.id,"100%","100%","9.0.0","",flashVars,parameters, null, function callbackFn(e){
				if (e.success == false){
					var message = document.createElement('div');

					var header = document.createElement('h3');
					header.innerHTML = base.dictionary.translate("Flash player problem");
					var text = document.createElement('div');
					text.innerHTML = base.dictionary.translate("A problem occurred trying to load flash player.") + "<br>" +
						base.dictionary.translate("Please go to {0} and install it.")
						.replace("{0}", "<a style='color: #800000; text-decoration: underline;' href='http://www.adobe.com/go/getflash'>http://www.adobe.com/go/getflash</a>") + '<br>' +

						base.dictionary.translate("If the problem presist, contant us.");

					var link = document.createElement('a');
					link.setAttribute("href", "http://www.adobe.com/go/getflash");
					link.innerHTML = '<img style="margin:5px;" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Obtener Adobe Flash Player" />';

					message.appendChild(header);
					message.appendChild(text);
					message.appendChild(link);

					paella.messageBox.showError(message.innerHTML);
				}
			});
		}
		else {
			var message = document.createElement('div');

			var header = document.createElement('h3');
			header.innerHTML = base.dictionary.translate("Flash player 9 nedded");

			var text = document.createElement('div');

			text.innerHTML = base.dictionary.translate("You need at least Flash player 9 installed.") + "<br>" +
				base.dictionary.translate("Please go to {0} and install it.")
				.replace("{0}", "<a style='color: #800000; text-decoration: underline;' href='http://www.adobe.com/go/getflash'>http://www.adobe.com/go/getflash</a>");

			var link = document.createElement('a');
			link.setAttribute("href", "http://www.adobe.com/go/getflash");
			link.innerHTML = '<img style="margin:5px;" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Obtener Adobe Flash Player" />';

			message.appendChild(header);
			message.appendChild(text);
			message.appendChild(link);

			paella.messageBox.showError(message.innerHTML);
		}

		var flashObj = $('#' + domElement.id)[0];
		return flashObj;
	},

	addSourceProgresiveDownload:function(sourceData){
		var parameters = {};
		if (this._autoplay) {
			parameters.autoplay = this._autoplay;
		}
		if (base.parameters.get('debug')=="true") {
			parameters.debugMode = true;
		}
		if (sourceData.type=='video/mp4') {
			if (!/rtmp:\/\//.test(sourceData.src)) {
				parameters.url = sourceData.src;
				parameters.playerId = this.flashId;
				parameters.isLiveStream = false;
				this.flashVideo = this.createSwfObject("player.swf",parameters);
			}
		}
		else if (sourceData.type=='video/x-flv') {
			parameters.url = sourceData.src;
			parameters.playerId = this.flashId;
			parameters.isLiveStream = false;
			this.flashVideo = this.createSwfObject("player.swf",parameters);
		}
	},

	addSourceStreaming:function(sourceData) {
		var subscription = false;
		if (!sourceData || !sourceData.src) {
			base.log.debug("Invalid source data: expecting src");
			return;
		}
		if (typeof(sourceData.src)=="string") {
			base.log.debug("Invalid RTMP source format, expecting an object with the format: { server:'rtmp://server', stream:'video-stream' }");
			return;
		}
		if (!sourceData.src.server || !sourceData.src.stream) {
			base.log.debug("Invalid RTMP source configuration: expecting { server:'rtmp://server', stream:'video-stream' }");
			return;
		}

		if (sourceData.src.requiresSubscription===undefined &&
			paella.player.config.player.rtmpSettings
		) {
			subscription = paella.player.config.player.rtmpSettings.requiresSubscription || false;
		}
		else if (sourceData.src.requiresSubscription) {
			subscription = sourceData.src.requiresSubscription;
		}
		var parameters = {};
		var swfName = 'player_streaming.swf';
		if (this._autoplay) {
        	parameters.autoplay = this._autoplay;
       	}
		if (base.parameters.get('debug')=="true") {
			parameters.debugMode = true;
		}

		parameters.playerId = this.flashId;
		parameters.isLiveStream = sourceData.isLiveStream!==undefined ? sourceData.isLiveStream:false;
		parameters.server = sourceData.src.server;
		parameters.stream = sourceData.src.stream;
		parameters.subscribe = subscription;
		if (paella.player.config.player.rtmpSettings && paella.player.config.player.rtmpSettings.bufferTime!==undefined) {
			parameters.bufferTime = paella.player.config.player.rtmpSettings.bufferTime;
		}
		this.flashVideo = this.createSwfObject(swfName,parameters);
	},

	addSource:function(sourceData) {
		if (this.streamingMode) {
			this.addSourceStreaming(sourceData);
		}
		else{
			this.addSourceProgresiveDownload(sourceData);
		}
	},
	
	unload:function() {
		if (this.flashVideo) {
			this.domElement.innerHTML = "";
			this.flashVideo = null;
			this._isReady = false;
		}
		this.parent();
	},
	
	getDimensions:function() {
		var dim = {width:640, height:480};
		if (this._metadata && this._metadata.res) {
			dim.width = this._metadata.res.w;
			dim.height = this._metadata.res.h;
		}
		else {
			try {
				dim.width = this.flashVideo.getWidth();
				dim.height = this.flashVideo.getHeight();
			}
			catch (e) {
				base.log.debug("Warning: flash video is not loaded");
			}
		}
		return dim;
	}
});

Class ("paella.Html5Video", paella.VideoElementBase,{
	classNameBackup:'',
	ready:false,
	
	_initialCurrentTime:0,
	_posterFrame:null,

	initialize:function(id,left,top,width,height) {
		this.parent(id,'video',left,top,width,height);
		var thisClass = this;
		$(this.domElement).bind('progress',function(event) {
			thisClass.onVideoProgress(event);
		});
		$(this.domElement).bind('loadstart',function(event) {
			thisClass.onVideoProgress(event);
		});
		$(this.domElement).bind('loadedmetadata',function(event) {
			thisClass.onVideoProgress(event);
		});
		
		$(this.domElement).bind('canplay',function(event) {
			thisClass.onVideoProgress(event);
		});
	},
	
	onVideoProgress:function(event) {
		if (!this.ready && this.domElement.readyState==4) {
			this.ready = true;
			if (this._initialCurrentTime!=0) {
				this.domElement.currentTime = this._initialCurrentTime;
				delete this._initialCurrentTime;
			}
			this.callReadyEvent();
		}
	},

	isReady:function() {
		return this.ready;
	},
	
	setPosterFrame:function(url) {
		this._posterFrame = url;
		if (this.domElement) {
			this.domElement.setAttribute("poster",url);
		}
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
		if (auto) {
			this.domElement.setAttribute("autoplay",auto);
		}
	},

	play:function() {
		if (this.domElement && this.domElement.play) {
			this.domElement.play();
			if (this._initialCurrentTime && this.domElement.readyState==4) {
				this.domElement.currentTime = this._initialCurrentTime;
				delete this._initialCurrentTime;
			}
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
		if (!this.ready) {
			this._initialCurrentTime = time;
		}

		if (this.domElement && this.domElement.currentTime) {
			this.domElement.currentTime = time;
		}
		else if (this.domElement) {
			this._initialCurrentTime = time;
		}
	},

	currentTime:function() {
		if (this.domElement && this.domElement.currentTime) {
			return this.domElement.currentTime;
		}
		return 0;
	},

	setDefaultVolume:function(vol) {
		this.setVolume(vol);
	},
	
	setVolume:function(volume) {
		if (volume==0) {
			this.domElement.setAttribute("muted",true);
		}
		else {
			this.domElement.removeAttribute("muted");
		}
		this.domElement.volume = volume;
		return true;
	},

	volume:function() {
		if (this.domElement.muted) return 0;
		return this.domElement.volume;
	},

	setPlaybackRate:function(rate) {
		this.domElement.playbackRate = rate;
	},

	addSource:function(sourceData) {
		var source = document.createElement('source');
		var separator = sourceData.src.indexOf('?') == -1 ? '?' : '&';
		source.src = sourceData.src + separator + 'caches=' + Math.random();
		source.type = sourceData.type;
		this.domElement.appendChild(source);
	},
	
	drawCanvas:function(parent, video, canvas){
		canvas.style.position = "absolute";
		canvas.style.width = $(video).width()+"px";
		canvas.style.height = $(video).height()+"px";
		canvas.style.top = $(video).offset().top+"px";
		canvas.style.left = $(video).offset().left+"px";

		var ctx = canvas.getContext("2d");
		ctx.drawImage(video, 0, 0, canvas.style.width, canvas.style.height);//Draw image

		parent.appendChild(canvas);
	},

	unload:function() {
		//START_CANVAS
		var self = this;
		var video = document.querySelector('video');
		var canv = document.createElement("canvas");							
		self.drawCanvas(this.domElement.parentElement,video,canv);
		//END_CANVAS
		this.ready = false;
		var sources = $(this.domElement).find('source');
		for (var i=0; i<sources.length; ++i) {
			this.domElement.removeChild(sources[i]);
			sources[i].src = "";
		}
		this.domElement.src = '';
		this.domElement.load();
		this.parent();
	},

	getDimensions:function() {
		if (this._metadata && this._metadata.res) {
			return { width: this._metadata.res.w, height: this._metadata.res.h };
		}
		else {
			return { width: this.domElement.videoWidth, height: this.domElement.videoHeight };
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
			$(this.domElement).show();
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

Class ("paella.SlideshowVideo", paella.VideoElementBase,{
	ready:false,
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

	setDefaultVolume:function(vol) {
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
		};
		frameZero.src = this._frames[0].image;
	},
	
	unload:function() {
		this.domElement.innerHTML = "";
		this.parent();
	},

	loadFrames:function(frames,duration) {
		this._frames = [];
		for (var i=0;i<=duration;++i) {
			var frame = frames['frame_' + i];
			if (frame) this._frames.push({time:i,image:frame});
		}
	}
});
