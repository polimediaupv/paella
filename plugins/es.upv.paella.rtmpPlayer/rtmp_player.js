Class ("paella.RTMPVideo", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_currentTime:0,
	_duration: 0,
	_ended:false,
	_playTimer:null,
	_playbackRate:1,

	_frameArray:null,


	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'img',left,top,width,height);
		var This = this;

		this._stream.sources.image.sort(function(a,b) {
			return a.res.h - b.res.h;
		});

		Object.defineProperty(this, 'img', {
			get:function() { return This.domElement; }
		});

		Object.defineProperty(this, 'imgStream', {
			get:function() {
				return this._stream.sources.image[this._currentQuality];
			}
		});

		Object.defineProperty(this, '_paused', {
			get:function() {
				return this._playTimer==null;
			}
		});
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
			$(This.video).bind('paella:imagevideoready', resolve);
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

	_loadCurrentFrame:function() {
		var This = this;
		if (this._frameArray) {
			var frame = this._frameArray[0];
			this._frameArray.some(function(f) {
				if (This._currentTime<f.time) {
					return true;
				}
				else {
					frame = f.src;
				}
			});
			this.img.src = frame;
		}
	},

	// Initialization functions
	getVideoData:function() {
		var defer = $.Deferred();
		var This = this;
		this._deferredAction(function() {
			var videoData = {
				duration: This._duration,
				currentTime: This._currentTime,
				volume: 0,
				paused: This._paused,
				ended: This._ended,
				res: {
					w: This.imgStream.res.w,
					h: This.imgStream.res.h
				}
			};
			defer.resolve(videoData);
		});
		return defer;
	},

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
		var This = this;
		var sources = this._stream.sources.image;
		if (this._currentQuality===null && this._videoQualityStrategy) {
			this._currentQuality = this._videoQualityStrategy.getQualityIndex(sources);
		}

		var stream = this._currentQuality<sources.length ? sources[this._currentQuality]:null;
		if (stream) {
			this._frameArray = [];
			for (var key in stream.frames) {
				var time = Math.floor(Number(key.replace("frame_","")));
				this._frameArray.push({ src:stream.frames[key], time:time });
			}
			this._frameArray.sort(function(a,b) {
				return a.time - b.time;
			});
			this._ready = true;
			this._currentTime = 0;
			this._duration = stream.duration;
			this._loadCurrentFrame();
			paella.events.trigger("paella:imagevideoready");
			return this._deferredAction(function() {
				return stream;
			});
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
			var sources = This._stream.sources.mp4;
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
		var defer = $.Deferred();
		var This = this;
		var paused = this._paused;
		var sources = this._stream.sources.image;
		this._currentQuality = index<sources.length ? index:0;
		var currentTime = this._currentTime;
		This.load()
			.then(function() {
				This._loadCurrentFrame();
				defer.resolve();
			});
		return defer;
	},

	getCurrentQuality:function() {
		var defer = $.Deferred();
		defer.resolve(this._getQualityObject(this._currentQuality,this._stream.sources.image[this._currentQuality]));
		return defer;
	},

	play:function() {
		var This = this;
		return this._deferredAction(function() {
			This._playTimer = new base.Timer(function() {
				This._currentTime += 0.25 * This._playbackRate;
				This._loadCurrentFrame();
			}, 250);
			This._playTimer.repeat = true;
		});
	},

	pause:function() {
		var This = this;
		return this._deferredAction(function() {
			This._playTimer.repeat = false;
			This._playTimer = null;
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
			return This._duration;
		});
	},

	setCurrentTime:function(time) {
		var This = this;
		return this._deferredAction(function() {
			This._currentTime = time;
		});
	},

	currentTime:function() {
		var This = this;
		return this._deferredAction(function() {
			return This._currentTime;
		});
	},

	setVolume:function(volume) {
		return this._deferredAction(function() {
			// No audo sources in image video
		});
	},

	volume:function() {
		return this._deferredAction(function() {
			// No audo sources in image video
			return 0;
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
		var This = this;
		return this._deferredAction(function() {
			var elem = This.img;
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			}
			else if (elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			}
			else if (elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			}
			else if (elem.webkitEnterFullscreen) {
				elem.webkitEnterFullscreen();
			}
		});
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
			for (var key in streamData.sources) {
				if (key=='image') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.RTMPVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});