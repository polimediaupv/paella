Class ("paella.RTMPVideo", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_duration:0,
	_paused:true,

	_flashId:null,
	_swfContainer:null,
	_flashVideo:null,
	_volume:1,


	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'div',left,top,width,height);
		this._flashId = id + 'Movie';
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

		Object.defineProperty(this,'swfContainer',{
			get:function() { return This._swfContainer; }
		});

		Object.defineProperty(this,'flashId', {
			get:function() { return This._flashId; }
		});

		Object.defineProperty(this,'flashVideo', {
			get:function() { return This._flashVideo; }
		});
	},

	_createSwfObject:function(swfFile,flashVars) {
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
					header.innerHTML = base.dictionary.translate("Flash player problem");
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

	_deferredAction:function(action) {
		var This = this;
		var defer = new $.Deferred();

		if (This.ready) {
			defer.resolve(action());
		}
		else {
			var resolve = function() {
				This._ready = true;
				defer.resolve(action());
			};
			$(This.swfContainer).bind('paella:flashvideoready', resolve);
		}

		return defer;
	},

	_getQualityObject:function(index, s) {
		return {
			index: index,
			res: s.res,
			src: s.src,
			toString:function() { return this.res.w + "x" + this.res.h; },
			shortLabel:function() { return this.res.h + "p"; },
			compare:function(q2) { return this.res.w*this.res.h - q2.res.w*q2.res.h; }
		};
	},

	// Initialization functions
	getVideoData:function() {
		var defer = $.Deferred();
		var This = this;
		this._deferredAction(function() {
			var videoData = {
				duration: This.flashVideo.duration(),
				currentTime: This.flashVideo.getCurrentTime(),
				volume: This.flashVideo.getVolume(),
				paused: This._paused,
				ended: This._ended,
				res: {
					w: This.flashVideo.getWidth(),
					h: This.flashVideo.getHeight()
				}
			};
			defer.resolve(videoData);
		});
		return defer;
	},

	setPosterFrame:function(url) {
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
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;
	},

	load:function() {
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
	},

	getQualities:function() {
		var This = this;
		var defer = $.Deferred();
		setTimeout(function() {
			var result = [];
			var sources = This._stream.sources.rtmp;
			var index = -1;
			sources.forEach(function(s) {
				index++;
				result.push(This._getQualityObject(index,s));
			});
			defer.resolve(result);
		},10);
		return defer;
	},

	setQuality:function(index) {
		index = index!==undefined && index!==null ? index:0;
		var defer = $.Deferred();
		var This = this;
		var paused = this._paused;
		var sources = this._stream.sources.rtmp;
		this._currentQuality = index<sources.length ? index:0;
		var source = sources[index];
		if (source.isLiveStream) {
			return paella_DeferredResolved();
		}
		else {
			var currentTime = this._currentTime;
			This.load()
				.then(function() {
					//This._loadCurrentFrame();
					defer.resolve();
				});
			return defer;
		}
	},

	getCurrentQuality:function() {
		var defer = $.Deferred();
		defer.resolve(this._getQualityObject(this._currentQuality,this._stream.sources.image[this._currentQuality]));
		return defer;
	},

	play:function() {
		var This = this;
		return this._deferredAction(function() {
			if (This._posterFrameElement) {
				This._posterFrameElement.parentNode.removeChild(This._posterFrameElement);
				This._posterFrameElement = null;
			}
			This._paused = false;
			This.flashVideo.play();
		});
	},

	pause:function() {
		var This = this;
		return this._deferredAction(function() {
			This._paused = true;
			This.flashVideo.pause();
		});
	},

	isPaused:function() {
		var This = this;
		return this._deferredAction(function() {
			return This._paused;
		});
	},

	duration:function() {
		var This = this;
		return this._deferredAction(function() {
			return This.flashVideo.duration();
		});
	},

	setCurrentTime:function(time) {
		var This = this;
		return this._deferredAction(function() {
			var duration = This.flashVideo.duration();
			This.flashVideo.seekTo(time * 100 / duration);
		});
	},

	currentTime:function() {
		var This = this;
		return this._deferredAction(function() {
			return This.flashVideo.getCurrentTime();
		});
	},

	setVolume:function(volume) {
		var This = this;
		this._volume = volume;
		return this._deferredAction(function() {
			This.flashVideo.setVolume(volume);
		});
	},

	volume:function() {
		var This = this;
		return this._deferredAction(function() {
			return This.flashVideo.getVolume();
		});
	},

	setPlaybackRate:function(rate) {
		var This = this;
		return this._deferredAction(function() {
			This._playbackRate = rate;
		});
	},

	playbackRate: function() {
		var This = this;
		return this._deferredAction(function() {
			return This._playbackRate;
		});
	},

	goFullScreen:function() {
		return paella_DeferredNotImplemented();
	},


	unFreeze:function(){
		return this._deferredAction(function() {});
	},

	freeze:function(){
		return this._deferredAction(function() {});
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});


Class ("paella.videoFactories.RTMPVideoFactory", {
	isStreamCompatible:function(streamData) {
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
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.RTMPVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});