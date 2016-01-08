
paella.Profiles = {
	profileList: null,
	
	getDefaultProfile: function() {
		if (paella.player && paella.player.config && paella.player.config.defaultProfile) {
				return paella.player.config.defaultProfile;
		}
		return undefined;		
	},
	
	loadProfile:function(profileName,onSuccessFunction) {
	
		var defaultProfile  = this.getDefaultProfile();		
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
			var params = { url: paella.utils.folders.profiles() + "/profiles.json" };
	
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

Class ("paella.VideoRect", paella.DomNode, {
	_rect:null,

	initialize:function(id, domType, left, top, width, height) {
		var This = this;
		this._rect = { left:left, top:top, width:width, height:height };
		var relativeSize = new paella.RelativeVideoSize();
		var percentTop = relativeSize.percentVSize(top) + '%';
		var percentLeft = relativeSize.percentWSize(left) + '%';
		var percentWidth = relativeSize.percentWSize(width) + '%';
		var percentHeight = relativeSize.percentVSize(height) + '%';
		var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:GlobalParams.video.zIndex};
		this.parent(domType,id,style);
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

function paella_Deferred(action,timeout) {
	timeout = timeout || 50;
	var def = $.Deferred();
	setTimeout(function() { action(def); }, timeout);
	return def;
}

function paella_DeferredResolved(param) {
	return paella_Deferred(function(def) { def.resolve(param); });
}

function paella_DeferredRejected(param) {
	return paella_Deferred(function(def) { def.reject(param); });
}

function paella_DeferredNotImplemented () {
	return paella_DeferredRejected(new Error("not implemented"));
}



Class ("paella.VideoElementBase", paella.VideoRect,{
	_ready:false,
	_autoplay:false,
	_stream:null,


	initialize:function(id,stream,containerType,left,top,width,height) {
		this._stream = stream;
		this.parent(id, containerType, left, top, width, height);
		Object.defineProperty(this,'ready',{
			get:function() { return this._ready; }
		});
	},

	// Initialization functions
	addSource:function(sourceData) {
		base.log.debug("TODO: implement addSource() function in your VideoElementBase subclass");
	},

	setPosterFrame:function(url) {
		base.log.debug("TODO: implement setPosterFrame() function");
	},

	setAutoplay:function(autoplay) {
		this._autoplay = autoplay;
	},

	setMetadata:function(data) {
		this._metadata = data;
	},

	load:function() {
		return paella_DeferredNotImplemented();
	},

	// Playback functions
	play:function() {
		base.log.debug("TODO: implement play() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	pause:function() {
		base.log.debug("TODO: implement pause() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	isPaused:function() {
		base.log.debug("TODO: implement isPaused() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	duration:function() {
		base.log.debug("TODO: implement duration() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	setCurrentTime:function(time) {
		base.log.debug("TODO: implement setCurrentTime() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	currentTime:function() {
		base.log.debug("TODO: implement currentTime() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	setVolume:function(volume) {
		base.log.debug("TODO: implement setVolume() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	volume:function() {
		base.log.debug("TODO: implement volume() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	setPlaybackRate:function(rate) {
		base.log.debug("TODO: implement setPlaybackRate() function in your VideoElementBase subclass");
		return paella_DeferredNotImplemented();
	},

	getQualities:function() {
		return paella_DeferredNotImplemented();
	},
	
	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();	// { width:X, height:Y }
	},

	freeze:function(){
		return paella_DeferredNotImplemented();
	},

	unFreeze:function(){
		return paella_DeferredNotImplemented();
	},



	// Utility functions
	setClassName:function(className) {
		this.domElement.className = className;
	},

	_callReadyEvent:function() {
		paella.events.trigger(paella.events.singleVideoReady, { sender:this });
	},

	_callUnloadEvent:function() {
		paella.events.trigger(paella.events.singleVideoUnloaded, { sender:this });
	}
});

Class ("paella.EmptyVideo", paella.VideoElementBase,{
	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'div',left,top,width,height);
	},

	// Initialization functions
	setPosterFrame:function(url) {},
	setAutoplay:function(auto) {},
	load:function() {return paella_DeferredRejected(new Error("no such compatible video player")); },
	play:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	pause:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	isPaused:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	duration:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	setCurrentTime:function(time) { return paella_DeferredRejected(new Error("no such compatible video player")); },
	currentTime:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	setVolume:function(volume) { return paella_DeferredRejected(new Error("no such compatible video player")); },
	volume:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	setPlaybackRate:function(rate) { return paella_DeferredRejected(new Error("no such compatible video player")); },
	unFreeze:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	freeze:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	unload:function() { return paella_DeferredRejected(new Error("no such compatible video player")); },
	getDimensions:function() { return paella_DeferredRejected(new Error("no such compatible video player")); }
});

Class ("paella.videoFactories.EmptyVideoFactory", paella.VideoFactory, {
	isStreamCompatible:function(streamData) {
		return true;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.EmptyVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});

Class ("paella.Html5Video", paella.VideoElementBase,{
	_posterFrame:null,

	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'video',left,top,width,height);
		var This = this;

		Object.defineProperty(this, 'video', {
			get:function() { return This.domElement; }
		});

		function onProgress(event) {
			if (!this._ready && this.video.readyState==4) {
				this._ready = true;
				if (this._initialCurrentTipe!=0) {
					this.video.currentTime = this._initialCurrentTime;
					delete this._initialCurrentTime;
				}
				this._callReadyEvent();
			}
		}

		function evtCallback(event) { onProgress.apply(This,event); }

		$(this.video).bind('progress', evtCallback);
		$(this.video).bind('loadstart',evtCallback);
		$(this.video).bind('loadedmetadata',evtCallback);
		$(this.video).bind('canplay',evtCallback);
	},

	// Initialization functions
	setPosterFrame:function(url) {
		this._posterFrame = url;
		this.video.setAttribute("poster",url);
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
		if (auto) {
			this.video.setAttribute("autoplay",auto);
		}
	},

	load:function() {
		// TODO: Cargar vídeo de:
		// this._stream;
		return paella_DeferredNotImplemented();
	},

	getQualities:function() {
		var defer = $.Deferred();
		var This = this;

		function qualities() {
			var result = [];
			This._streams.forEach(function(s) {
				result.push({ res: s.res, src: s.src });
			});
			return result;
		}

		if (this.ready) {
			defer.resolve(qualities());
		}
		else {
			$(this.video).bind('canplay',function(evt) {
				defer.resolve(qualities());
			});
		}

		return defer;
	},

	play:function() {
		this.video.play();
		return paella_DeferredNotImplemented();
	},

	pause:function() {
		this.video.pause();
		return paella_DeferredNotImplemented();
	},

	isPaused:function() {
		return paella_DeferredNotImplemented();
	},

	duration:function() {
		return paella_DeferredNotImplemented();
	},

	setCurrentTime:function(time) {
		return paella_DeferredNotImplemented();
	},

	currentTime:function() {
		return paella_DeferredNotImplemented();
	},

	setVolume:function(volume) {
		return paella_DeferredNotImplemented();
	},

	volume:function() {
		return paella_DeferredNotImplemented();
	},

	setPlaybackRate:function(rate) {
		return paella_DeferredNotImplemented();
	},



	unFreeze:function(){
		return paella_DeferredNotImplemented();
		/*
		var self = this;
		var c = document.getElementById(this.domElement.className + "canvas");
		$(c).remove();
		*/
	},
	
	freeze:function(){
		return paella_DeferredNotImplemented();
		/*
		var self = this;
		var canvas = document.createElement("canvas");
		var pos = this._rect;
		canvas.id = this.domElement.className + "canvas";
		canvas.width = $(this.domElement).width();
		canvas.height = $(this.domElement).height();
		canvas.style.position = "absolute";
		canvas.style.width = canvas.width + "px";
		canvas.style.height = canvas.height + "px";
		canvas.style.top = $(this.domElement).position().top + "px";
		canvas.style.left = $(this.domElement).position().left + "px";
		canvas.style.zIndex = 2;

		var ctx = canvas.getContext("2d");
		ctx.drawImage(this.domElement, 0, 0, Math.ceil(canvas.width/16)*16, Math.ceil(canvas.height/16)*16);//Draw image
		this.domElement.parentElement.appendChild(canvas);
		self._canvasPile.push(canvas);
		*/
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});

Class ("paella.videoFactories.Html5VideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='mp4') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.Html5Video(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});


Class ("paella.ImageVideo", paella.VideoElementBase,{
	_posterFrame:null,

	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'video',left,top,width,height);
		var This = this;

		Object.defineProperty(this, 'video', {
			get:function() { return This.domElement; }
		});

		function onProgress(event) {
			if (!this._ready && this.video.readyState==4) {
				this._ready = true;
				if (this._initialCurrentTipe!=0) {
					this.video.currentTime = this._initialCurrentTime;
					delete this._initialCurrentTime;
				}
				this._callReadyEvent();
			}
		}

		function evtCallback(event) { onProgress.apply(This,event); }

		$(this.domElement).bind('progress', evtCallback);
		$(this.domElement).bind('loadstart',evtCallback);
		$(this.domElement).bind('loadedmetadata',evtCallback);
		$(this.domElement).bind('canplay',evtCallback);
		if(thisClass._canvasPile == null){ thisClass._canvasPile = []; }
	},

	// Initialization functions
	setPosterFrame:function(url) {
		this._posterFrame = url;
		this.video.setAttribute("poster",url);
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
		if (auto) {
			this.video.setAttribute("autoplay",auto);
		}
	},

	load:function() {
		// TODO: Cargar vídeo de:
		// this._stream;
		return paella_DeferredNotImplemented();
	},

	play:function() {
		this.video.play();
		return paella_DeferredNotImplemented();
	},

	pause:function() {
		this.video.pause();
		return paella_DeferredNotImplemented();
	},

	isPaused:function() {
		return paella_DeferredNotImplemented();
	},

	duration:function() {
		return paella_DeferredNotImplemented();
	},

	setCurrentTime:function(time) {
		return paella_DeferredNotImplemented();
	},

	currentTime:function() {
		return paella_DeferredNotImplemented();
	},

	setVolume:function(volume) {
		return paella_DeferredNotImplemented();
	},

	volume:function() {
		return paella_DeferredNotImplemented();
	},

	setPlaybackRate:function(rate) {
		return paella_DeferredNotImplemented();
	},



	unFreeze:function(){
		return paella_DeferredNotImplemented();
	},

	freeze:function(){
		return paella_DeferredNotImplemented();
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});


Class ("paella.videoFactories.ImageVideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='image') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.ImageVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});

Class ("paella.MpegDashVideo", paella.VideoElementBase,{
	_posterFrame:null,

	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'video',left,top,width,height);
		var This = this;

		Object.defineProperty(this, 'video', {
			get:function() { return This.domElement; }
		});

		function onProgress(event) {
			if (!this._ready && this.video.readyState==4) {
				this._ready = true;
				if (this._initialCurrentTipe!=0) {
					this.video.currentTime = this._initialCurrentTime;
					delete this._initialCurrentTime;
				}
				this._callReadyEvent();
			}
		}

		function evtCallback(event) { onProgress.apply(This,event); }

		$(this.domElement).bind('progress', evtCallback);
		$(this.domElement).bind('loadstart',evtCallback);
		$(this.domElement).bind('loadedmetadata',evtCallback);
		$(this.domElement).bind('canplay',evtCallback);
		if(thisClass._canvasPile == null){ thisClass._canvasPile = []; }
	},

	// Initialization functions
	setPosterFrame:function(url) {
		this._posterFrame = url;
		this.video.setAttribute("poster",url);
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
		if (auto) {
			this.video.setAttribute("autoplay",auto);
		}
	},

	load:function() {
		// TODO: Cargar vídeo de:
		// this._stream;
		return paella_DeferredNotImplemented();
	},

	play:function() {
		this.video.play();
		return paella_DeferredNotImplemented();
	},

	pause:function() {
		this.video.pause();
		return paella_DeferredNotImplemented();
	},

	isPaused:function() {
		return paella_DeferredNotImplemented();
	},

	duration:function() {
		return paella_DeferredNotImplemented();
	},

	setCurrentTime:function(time) {
		return paella_DeferredNotImplemented();
	},

	currentTime:function() {
		return paella_DeferredNotImplemented();
	},

	setVolume:function(volume) {
		return paella_DeferredNotImplemented();
	},

	volume:function() {
		return paella_DeferredNotImplemented();
	},

	setPlaybackRate:function(rate) {
		return paella_DeferredNotImplemented();
	},



	unFreeze:function(){
		return paella_DeferredNotImplemented();
	},

	freeze:function(){
		return paella_DeferredNotImplemented();
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});


Class ("paella.videoFactories.MpegDashVideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='mpeg-dash') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.MpegDashVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});