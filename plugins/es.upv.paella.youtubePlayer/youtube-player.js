/**
 * Created by fernando on 13/4/16.
 */
Class ("paella.YoutubeVideo", paella.VideoElementBase,{
	_posterFrame:null,
	_currentQuality:null,
	_autoplay:false,

	_readyPromise:null,

	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,'div',left,top,width,height);
		var This = this;
		this._readyPromise = $.Deferred();

		Object.defineProperty(this, 'video', {
			get:function() { return This._youtubePlayer; }
		});
	},


	_deferredAction:function(action) {
		var This = this;
		var defer = new $.Deferred();

		this._readyPromise.then(function() {
				defer.resolve(action());
			},
			function() {
				defer.reject();
			});

		return defer;
	},

	_getQualityObject:function(index, s) {
		var level = 0;
		switch (s) {
			case 'small':
				level = 1;
				break;
			case 'medium':
				level = 2;
				break;
			case 'large':
				level = 3;
				break;
			case 'hd720':
				level = 4;
				break;
			case 'hd1080':
				level = 5;
				break;
			case 'highres':
				level = 6;
				break;
		}
		return {
			index: index,
			res: { w:null, h:null},
			src: null,
			label:s,
			level:level,
			bitrate:level,
			toString:function() { return this.label; },
			shortLabel:function() { return this.label; },
			compare:function(q2) { return this.level - q2.level; }
		};
	},

	_onStateChanged:function(e) {
		console.log("On state changed");
	},

	// Initialization functions
	getVideoData:function() {
		var defer = $.Deferred();
		var This = this;
		this._deferredAction(function() {
			var stream = This._stream.sources.youtube[0];
			var videoData = {
				duration: This.video.getDuration(),
				currentTime: This.video.getCurrentTime(),
				volume: This.video.getVolume(),
				paused: !This._playing,
				ended: This.video.ended,
				res: {
					w: stream.res.w,
					h: stream.res.h
				}
			};
			defer.resolve(videoData);
		});
		return defer;
	},

	setPosterFrame:function(url) {
		this._posterFrame = url;
	},

	setAutoplay:function(auto) {
		this._autoplay = auto;

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

			$('#' + this.identifier).animate(style,400,function(){
				thisClass.enableClassName();
				paella.events.trigger(paella.events.setComposition, { video:thisClass });
			});
			this.enableClassNameAfter(400);
		}
		else {
			$('#' + this.identifier).css(style);
			paella.events.trigger(paella.events.setComposition, { video:this });
		}
	},

	setVisible:function(visible,animate) {
		if (visible=="true" && animate) {
			$('#' + this.identifier).show();
			$('#' + this.identifier).animate({opacity:1.0},300);
		}
		else if (visible=="true" && !animate) {
			$('#' + this.identifier).show();
		}
		else if (visible=="false" && animate) {
			$('#' + this.identifier).animate({opacity:0.0},300);
		}
		else if (visible=="false" && !animate) {
			$('#' + this.identifier).hide();
		}
	},

	setLayer:function(layer) {
		$('#' + this.identifier).css({ zIndex:layer});
	},

	load:function() {
		var This = this;

		var defer = $.Deferred();
		this._qualityListReadyPromise = $.Deferred();
		paella.youtubePlayerVars.apiReadyPromise.
			then(function() {
				var stream = This._stream.sources.youtube[0];

				if (stream) {
					// TODO: poster frame
					This._youtubePlayer = new YT.Player(This.identifier, {
						height: '390',
						width: '640',
						videoId:stream.id,
						playerVars: {
							controls: 0,
							disablekb: 1
						},
						events: {
							onReady: function(e) {
								This._readyPromise.resolve();
							},
							onStateChanged:function(e) {
								console.log("state changed");
							},
							onPlayerStateChange:function(e) {
								console.log("state changed");
							}
						}
					});

					defer.resolve();
				}
				else {
					defer.reject(new Error("Could not load video: invalid quality stream index"));
				}
			});

		return defer;
	},

	getQualities:function() {
		var This = this;
		var defer = $.Deferred();
		this._qualityListReadyPromise.then(function(q) {
			var result = [];
			var index = -1;
			This._qualities = {};
			q.forEach(function(item) {
				index++;
				This._qualities[item] = This._getQualityObject(index,item);
				result.push(This._qualities[item]);
			});
			defer.resolve(result);
		});
		return defer;
	},

	setQuality:function(index) {
		var This = this;
		var defer = $.Deferred();
		this._qualityListReadyPromise.then(function(q) {
			for (var key in This._qualities) {
				var searchQ = This._qualities[key];
				if (typeof(searchQ)=="object" && searchQ.index==index) {
					This.video.setPlaybackQuality(searchQ.label);
					break;
				}
			}
			defer.resolve();
		});
		return defer;
	},

	getCurrentQuality:function() {
		var This = this;
		var defer = $.Deferred();
		this._qualityListReadyPromise.then(function(q) {
			defer.resolve(This._qualities[This.video.getPlaybackQuality()]);
		});
		return defer;
	},

	play:function() {
		var This = this;
		return this._deferredAction(function() {
			This._playing = true;
			This.video.playVideo();
			new base.Timer(function(timer) {
				var q = This.video.getAvailableQualityLevels();
				if (q.length) {
					timer.repeat = false;
					This._qualityListReadyPromise.resolve(q);
				}
				else {
					timer.repeat = true;
				}
			},500);
		});
	},

	pause:function() {
		var This = this;
		return this._deferredAction(function() {
			This._playing = false;
			This.video.pauseVideo();
		});
	},

	isPaused:function() {
		var This = this;
		return this._deferredAction(function() {
			return !This._playing;
		});
	},

	duration:function() {
		var This = this;
		return this._deferredAction(function() {
			return This.video.getDuration();
		});
	},

	setCurrentTime:function(time) {
		var This = this;
		return this._deferredAction(function() {
			This.video.seekTo(time);
		});
	},

	currentTime:function() {
		var This = this;
		return this._deferredAction(function() {
			return This.video.getCurrentTime();
		});
	},

	setVolume:function(volume) {
		var This = this;
		return this._deferredAction(function() {
			This.video.setVolume(volume * 100);
		});
	},

	volume:function() {
		var This = this;
		return this._deferredAction(function() {
			return This.video.getVolume() / 100;
		});
	},

	setPlaybackRate:function(rate) {
		var This = this;
		return this._deferredAction(function() {
			This.video.playbackRate = rate;
		});
	},

	playbackRate: function() {
		var This = this;
		return this._deferredAction(function() {
			return This.video.playbackRate;
		});
	},

	goFullScreen:function() {
		var This = this;
		return this._deferredAction(function() {
			var elem = This.video;
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
		var This = this;
		return this._deferredAction(function() {
			var c = document.getElementById(This.video.className + "canvas");
			$(c).remove();
		});
	},

	freeze:function(){
		var This = this;
		return this._deferredAction(function() {
			var canvas = document.createElement("canvas");
			canvas.id = This.video.className + "canvas";
			canvas.width = This.video.videoWidth;
			canvas.height = This.video.videoHeight;
			canvas.style.cssText = This.video.style.cssText;
			canvas.style.zIndex = 2;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(This.video, 0, 0, Math.ceil(canvas.width/16)*16, Math.ceil(canvas.height/16)*16);//Draw image
			This.video.parentElement.appendChild(canvas);
		});
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	},

	getDimensions:function() {
		return paella_DeferredNotImplemented();
	}
});

Class ("paella.videoFactories.YoutubeVideoFactory", {
	initYoutubeApi:function() {
		if (!this._initialized) {
			var tag = document.createElement('script');

			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			paella.youtubePlayerVars = {
				apiReadyPromise: new $.Deferred()
			};
			this._initialized = true;
		}
	},

	isStreamCompatible:function(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='youtube') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		this.initYoutubeApi();
		return new paella.YoutubeVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});

//paella.youtubePlayerVars = {
//	apiReadyPromise: $.Promise()
//};

function onYouTubeIframeAPIReady() {
//	console.log("Youtube iframe API ready");
	paella.youtubePlayerVars.apiReadyPromise.resolve();
}

