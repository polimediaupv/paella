
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

paella.FlashVideo = Class.create(paella.VideoElementBase,{
	classNameBackup:'',
	flashVideo:null,
	paused:true,
	streamingMode:true,
	flashId:'',

	initialize:function(id,left,top,width,height) {
		this.parent(id,'div',left,top,width,height);
		this.flashId = id + 'Movie';
	},
	
	isReady:function() {
		return true;
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
		
		var flashVars = "";
		var separator = "";
		for (var key in params) {
			flashVars += separator + key + "=" + encodeURIComponent(params[key]);
			separator = "&";
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
				
				this.flashVideo = this.createSwfObject("player.swf",parameters);
			}
		}
		else if (sourceData.type=='video/x-flv') {
			var parameters = {};
			parameters.url = sourceData.src;
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
			
			this.flashVideo = this.createSwfObject("player.swf",parameters);
		}
		else if (sourceData.type=='video/x-flv') {
			var parameters = {};
			
			if (/(rtmp:\/\/)([\w\d\.\-_]+[:+\d]*)\/([\w\d\-_]+\/)([\w\d\.\/\-_]+)(\.flv)?/.test(sourceData.src)) {
				parameters.connect = RegExp.$1 + RegExp.$2 + '/' + RegExp.$3;
				parameters.url = RegExp.$4;
			}
			
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


