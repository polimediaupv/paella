(() => {

class RTMPVideo extends paella.VideoElementBase {

	constructor(id,stream,left,top,width,height) {
		super(id,stream,'div',left,top,width,height);

		this._posterFrame = null;
		this._currentQuality = null;
		this._duration = 0;
		this._paused = true;
		this._streamName = null;
		this._flashId = null;
		this._swfContainer = null;
		this._flashVideo = null;
		this._volume = 1;

		this._flashId = id + 'Movie';
		this._streamName = 'rtmp';
		var This = this;

		this._stream.sources.rtmp.sort(function(a,b) {
			return a.res.h - b.res.h;
		});

		var processEvent = function(eventName,params) {
			if (eventName!="loadedmetadata" && eventName!="pause" && !This._isReady) {
				This._isReady = true;
				This._duration = params.duration;
				$(This.swfContainer).trigger("paella:flashvideoready");
			}
			if (eventName=="progress") {
				try { This.flashVideo.setVolume(This._volume); }
				catch(e) {}
				base.log.debug("Flash video event: " + eventName + ", progress: " + This.flashVideo.currentProgress());
			}
			else if (eventName=="ended") {
				base.log.debug("Flash video event: " + eventName);
				paella.events.trigger(paella.events.pause);
				paella.player.controls.showControls();
			}
			else {
				base.log.debug("Flash video event: " + eventName);
			}
		};

		var eventReceived = function(eventName,params) {
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
			processEvent(eventName,processedParams);
		};

		paella.events.bind(paella.events.flashVideoEvent,function(event,params) {
			if (This.flashId==params.source) {
				eventReceived(params.eventName,params.values);
			}
		});
	}

	get swfContainer() { return this._swfContainer; };

	get flashId() { return this._flashId; }

	get flashVideo() { return this._flashVideo; }

	_createSwfObject(swfFile,flashVars) {
		var id = this.identifier;
		var parameters = { wmode:'transparent' };

		var domElement = document.createElement('div');
		this.domElement.appendChild(domElement);
		domElement.id = id + "Movie";
		this._swfContainer = domElement;

		if (swfobject.hasFlashPlayerVersion("9.0.0")) {
			swfobject.embedSWF(swfFile,domElement.id,"100%","100%","9.0.0","",flashVars,parameters, null, function callbackFn(e){
				if (e.success == false){
					var message = document.createElement('div');

					var header = document.createElement('h3');
					header.innerText = base.dictionary.translate("Flash player problem");
					var text = document.createElement('div');
					text.innerHTML = base.dictionary.translate("A problem occurred trying to load flash player.") + "<br>" +
						base.dictionary.translate("Please go to {0} and install it.")
							.replace("{0}", "<a style='color: #800000; text-decoration: underline;' href='http://www.adobe.com/go/getflash'>http://www.adobe.com/go/getflash</a>") + '<br>' +

						base.dictionary.translate("If the problem presist, contact us.");

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
			header.innerText = base.dictionary.translate("Flash player needed");

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
	}

	_deferredAction(action) {
		return new Promise((resolve,reject) => {
			if (this.ready) {
				resolve(action());
			}
			else {
				$(this.swfContainer).bind('paella:flashvideoready', () => {
					this._ready = true;
					resolve(action());
				});
			}
		});
	}

	_getQualityObject(index, s) {
		return {
			index: index,
			res: s.res,
			src: s.src,
			toString:function() { return this.res.w + "x" + this.res.h; },
			shortLabel:function() { return this.res.h + "p"; },
			compare:function(q2) { return this.res.w*this.res.h - q2.res.w*q2.res.h; }
		};
	}

	// Initialization functions
	getVideoData() {
		let FlashVideoPlugin = this;
		return new Promise((resolve,reject) => {
			this._deferredAction(() => {
				let videoData = {
					duration: FlashVideoPlugin.flashVideo.duration(),
					currentTime: FlashVideoPlugin.flashVideo.getCurrentTime(),
					volume: FlashVideoPlugin.flashVideo.getVolume(),
					paused: FlashVideoPlugin._paused,
					ended: FlashVideoPlugin._ended,
					res: {
						w: FlashVideoPlugin.flashVideo.getWidth(),
						h: FlashVideoPlugin.flashVideo.getHeight()
					}
				};
				resolve(videoData);
			});
		});
	}

	setPosterFrame(url) {
		if (this._posterFrame==null) {
			this._posterFrame = url;
			var posterFrame = document.createElement('img');
			posterFrame.src = url;
			posterFrame.className = "videoPosterFrameImage";
			posterFrame.alt = "poster frame";
			this.domElement.appendChild(posterFrame);
			this._posterFrameElement = posterFrame;
		}
	//	this.video.setAttribute("poster",url);
	}

	setAutoplay(auto) {
		this._autoplay = auto;
	}

	load() {
		var This = this;
		var sources = this._stream.sources.rtmp;
		if (this._currentQuality===null && this._videoQualityStrategy) {
			this._currentQuality = this._videoQualityStrategy.getQualityIndex(sources);
		}

		var isValid = function(stream) {
			return stream.src && typeof(stream.src)=='object' && stream.src.server && stream.src.stream;
		};

		var stream = this._currentQuality<sources.length ? sources[this._currentQuality]:null;
		if (stream) {
			if (!isValid(stream)) {
				return paella_DeferredRejected(new Error("Invalid video data"));
			}
			else {
				var subscription = false;
				if (stream.src.requiresSubscription===undefined && paella.player.config.player.rtmpSettings) {
					subscription = paella.player.config.player.rtmpSettings.requiresSubscription || false;
				}
				else if (stream.src.requiresSubscription) {
					subscription = stream.src.requiresSubscription;
				}
				var parameters = {};
				var swfName = 'resources/deps/player_streaming.swf';
				if (this._autoplay) {
					parameters.autoplay = this._autoplay;
				}
				if (base.parameters.get('debug')=="true") {
					parameters.debugMode = true;
				}

				parameters.playerId = this.flashId;
				parameters.isLiveStream = stream.isLiveStream!==undefined ? stream.isLiveStream:false;
				parameters.server = stream.src.server;
				parameters.stream = stream.src.stream;
				parameters.subscribe = subscription;
				if (paella.player.config.player.rtmpSettings && paella.player.config.player.rtmpSettings.bufferTime!==undefined) {
					parameters.bufferTime = paella.player.config.player.rtmpSettings.bufferTime;
				}
				this._flashVideo = this._createSwfObject(swfName,parameters);

				$(this.swfContainer).trigger("paella:flashvideoready");

				return this._deferredAction(function() {
					return stream;
				});
			}

		}
		else {
			return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"));
		}
	}

	getQualities() {
		return new Promise((resolve,reject) => {
			setTimeout(() => {
				var result = [];
				var sources = this._stream.sources.rtmp;
				var index = -1;
				sources.forEach((s) => {
					index++;
					result.push(this._getQualityObject(index,s));
				});
				resolve(result);
			},50);
		});
	}

	setQuality(index) {
		index = index!==undefined && index!==null ? index:0;
		return new Promise((resolve,reject) => {
			var paused = this._paused;
			var sources = this._stream.sources.rtmp;
			this._currentQuality = index<sources.length ? index:0;
			var source = sources[index];
			this._ready = false;
			this._isReady = false;
			this.load()
				.then(function() {
					resolve();
				});
		});
	}

	getCurrentQuality() {
		return new Promise((resolve,reject) => {
			resolve(this._getQualityObject(this._currentQuality,
										   this._stream.sources.rtmp[this._currentQuality]));
		});
	}

	play() {
		var This = this;
		return this._deferredAction(function() {
			if (This._posterFrameElement) {
				This._posterFrameElement.parentNode.removeChild(This._posterFrameElement);
				This._posterFrameElement = null;
			}
			This._paused = false;
			This.flashVideo.play();
		});
	}

	pause() {
		var This = this;
		return this._deferredAction(function() {
			This._paused = true;
			This.flashVideo.pause();
		});
	}

	isPaused() {
		var This = this;
		return this._deferredAction(function() {
			return This._paused;
		});
	}

	duration() {
		var This = this;
		return this._deferredAction(function() {
			return This.flashVideo.duration();
		});
	}

	setCurrentTime(time) {
		var This = this;
		return this._deferredAction(function() {
			var duration = This.flashVideo.duration();
			This.flashVideo.seekTo(time * 100 / duration);
		});
	}

	currentTime() {
		var This = this;
		return this._deferredAction(function() {
			return This.flashVideo.getCurrentTime();
		});
	}

	setVolume(volume) {
		var This = this;
		this._volume = volume;
		return this._deferredAction(function() {
			This.flashVideo.setVolume(volume);
		});
	}

	volume() {
		var This = this;
		return this._deferredAction(function() {
			return This.flashVideo.getVolume();
		});
	}

	setPlaybackRate(rate) {
		var This = this;
		return this._deferredAction(function() {
			This._playbackRate = rate;
		});
	}

	playbackRate() {
		var This = this;
		return this._deferredAction(function() {
			return This._playbackRate;
		});
	}

	goFullScreen() {
		return paella_DeferredNotImplemented();
	}

	unFreeze(){
		return this._deferredAction(function() {});
	}

	freeze() {
		return this._deferredAction(function() {});
	}

	unload() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}

	getDimensions() {
		return paella_DeferredNotImplemented();
	}
}

paella.RTMPVideo = RTMPVideo;

class RTMPVideoFactory extends paella.VideoFactory {
	isStreamCompatible(streamData) {
		try {
			if (base.userAgent.system.iOS || base.userAgent.system.Android) {
				return false;
			}
			for (var key in streamData.sources) {
				if (key=='rtmp') return true;
			}
		}
		catch (e) {}
		return false;
	}

	getVideoObject(id, streamData, rect) {
		return new paella.RTMPVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
}

paella.videoFactories.RTMPVideoFactory = RTMPVideoFactory;

})();