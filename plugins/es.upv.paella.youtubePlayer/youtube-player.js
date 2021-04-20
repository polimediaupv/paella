
(() => {
	
class YoutubeVideo extends paella.VideoElementBase {

	constructor(id,stream,left,top,width,height) {
		super(id,stream,'div',left,top,width,height);
		this._posterFrame = null;
		this._currentQuality = null;
		this._autoplay = false;
		this._readyPromise = null;

		this._readyPromise = $.Deferred();
	}

	get video() { return this._youtubePlayer; }

	_deferredAction(action) {
		return new Promise((resolve,reject) => {
			this._readyPromise.then(function() {
					resolve(action());
				},
				function() {
					reject();
				});
		});
	}

	_getQualityObject(index, s) {
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
	}

	_onStateChanged(e) {
		console.log("On state changed");
	}

	// Initialization functions
	getVideoData() {
		var This = this;
		return new Promise((resolve,reject) => {
			var stream = this._stream.sources.youtube[0];
			this._deferredAction(() => {
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
				resolve(videoData);
			})
		});
	}

	setPosterFrame(url) {
		this._posterFrame = url;
	}

	setAutoplay(auto) {
		this._autoplay = auto;

	}

	setRect(rect,animate) {
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
	}

	setVisible(visible,animate) {
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
	}

	setLayer(layer) {
		$('#' + this.identifier).css({ zIndex:layer});
	}

	load() {
		var This = this;
		return new Promise((resolve,reject) => {
			this._qualityListReadyPromise = $.Deferred();
			paella.youtubePlayerVars.apiReadyPromise.
				then(() => {
					var stream = this._stream.sources.youtube[0];

					if (stream) {
						// TODO: poster frame
						this._youtubePlayer = new YT.Player(This.identifier, {
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

						resolve();
					}
					else {
						reject(new Error("Could not load video: invalid quality stream index"));
					}
				});
		});
	}

	getQualities() {
		let This = this;
		return new Promise((resolve,reject) => {
			This._qualityListReadyPromise.then(function(q) {
				var result = [];
				var index = -1;
				This._qualities = {};
				q.forEach((item) => {
					index++;
					This._qualities[item] = This._getQualityObject(index,item);
					result.push(This._qualities[item]);
				});
				resolve(result);
			});
		});
	}

	setQuality(index) {
		return new Promise((resolve,reject) => {
			this._qualityListReadyPromise.then((q) => {
				for (var key in this._qualities) {
					var searchQ = this._qualities[key];
					if (typeof(searchQ)=="object" && searchQ.index==index) {
						this.video.setPlaybackQuality(searchQ.label);
						break;
					}
				}
				resolve();
			});
		});
	}

	getCurrentQuality() {
		return new Promise((resolve,reject) => {
			this._qualityListReadyPromise.then((q) => {
				resolve(this._qualities[this.video.getPlaybackQuality()]);
			});
		});
	}

	play() {
		let This = this;
		return new Promise((resolve,reject) => {
			This._playing = true;
			This.video.playVideo();
			new paella.utils.Timer((timer) => {
				var q = this.video.getAvailableQualityLevels();
				if (q.length) {
					timer.repeat = false;
					this._qualityListReadyPromise.resolve(q);
					resolve();
				}
				else {
					timer.repeat = true;
				}
			},500);
		});
	}

	pause() {
		return this._deferredAction(() => {
			this._playing = false;
			this.video.pauseVideo();
		});
	}

	isPaused() {
		return this._deferredAction(() => {
			return !this._playing;
		});
	}

	duration() {
		return this._deferredAction(() => {
			return this.video.getDuration();
		});
	}

	setCurrentTime(time) {
		return this._deferredAction(() => {
			this.video.seekTo(time);
		});
	}

	currentTime() {
		return this._deferredAction(() => {
			return this.video.getCurrentTime();
		});
	}

	setVolume(volume) {
		return this._deferredAction(() => {
			this.video.setVolume && this.video.setVolume(volume * 100);
		});
	}

	volume() {
		return this._deferredAction(() => {
			return this.video.getVolume() / 100;
		});
	}

	setPlaybackRate(rate) {
		return this._deferredAction(() => {
			this.video.playbackRate = rate;
		});
	}

	playbackRate() {
		return this._deferredAction(() => {
			return this.video.playbackRate;
		});
	}

	goFullScreen() {
		return this._deferredAction(() => {
			var elem = this.video;
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
	}

	unFreeze(){
		return this._deferredAction(() => {
			var c = document.getElementById(this.video.className + "canvas");
			$(c).remove();
		});
	}

	freeze(){
		return this._deferredAction(() => {
			var canvas = document.createElement("canvas");
			canvas.id = this.video.className + "canvas";
			canvas.width = this.video.videoWidth;
			canvas.height = this.video.videoHeight;
			canvas.style.cssText = this.video.style.cssText;
			canvas.style.zIndex = 2;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(this.video, 0, 0, Math.ceil(canvas.width/16)*16, Math.ceil(canvas.height/16)*16);//Draw image
			this.video.parentElement.appendChild(canvas);
		});
	}

	unload() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}

	getDimensions() {
		return paella_DeferredNotImplemented();
	}
}

paella.YoutubeVideo = YoutubeVideo;

class YoutubeVideoFactory extends paella.VideoFactory {
	initYoutubeApi() {
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
	}

	isStreamCompatible(streamData) {
		try {
			for (var key in streamData.sources) {
				if (key=='youtube') return true;
			}
		}
		catch (e) {}
		return false;
	}

	getVideoObject(id, streamData, rect) {
		this.initYoutubeApi();
		return new paella.YoutubeVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
}

paella.videoFactories.YoutubeVideoFactory = YoutubeVideoFactory;

//paella.youtubePlayerVars = {
//	apiReadyPromise: $.Promise()
//};


})();


function onYouTubeIframeAPIReady() {
	//	console.log("Youtube iframe API ready");
	paella.youtubePlayerVars.apiReadyPromise.resolve();
}
