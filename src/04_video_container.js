/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/


Class ("paella.BackgroundContainer", paella.DomNode,{
	initialize:function(id,image) {
		this.parent('img',id,{position:'relative',top:'0px',left:'0px',right:'0px',bottom:'0px',zIndex:GlobalParams.background.zIndex});
		this.domElement.setAttribute('src',image);
		this.domElement.setAttribute('alt','');
		this.domElement.setAttribute('width','100%');
		this.domElement.setAttribute('height','100%');
	},

	setImage:function(image) {
		this.domElement.setAttribute('src',image);
	}
});

Class ("paella.VideoOverlay", paella.DomNode,{
	size:{w:1280,h:720},

	initialize:function() {
		var style = {position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',overflow:'hidden',zIndex:10};
		this.parent('div','overlayContainer',style);
		this.domElement.setAttribute("role", "main");
	},

	_generateId:function() {
		return Math.ceil(Date.now() * Math.random());
	},

	enableBackgroundMode:function() {
		this.domElement.className = 'overlayContainer background';
	},

	disableBackgroundMode:function() {
		this.domElement.className = 'overlayContainer';
	},

	clear:function() {
		this.domElement.innerText = "";
	},

	getVideoRect:function(index) {
		return paella.player.videoContainer.getVideoRect(index);
	},

	addText:function(text,rect,isDebug) {
		var textElem = document.createElement('div');
		textElem.innerText = text;
		textElem.className = "videoOverlayText";
		if (isDebug) textElem.style.backgroundColor = "red";
		return this.addElement(textElem,rect);
	},

	addElement:function(element,rect) {
		this.domElement.appendChild(element);
		element.style.position = 'absolute';
		element.style.left = this.getHSize(rect.left) + '%';
		element.style.top = this.getVSize(rect.top) + '%';
		element.style.width = this.getHSize(rect.width) + '%';
		element.style.height = this.getVSize(rect.height) + '%';
		return element;
	},

	getLayer:function(id,zindex) {
		id = id || this._generateId();
		return $(this.domElement).find("#" + id)[0] || this.addLayer(id,zindex);
	},

	addLayer:function(id,zindex) {
		zindex = zindex || 10;
		var element = document.createElement('div');
		element.className = "row";
		element.id = id || this._generateId();
		return this.addElement(element,{ left:0, top: 0, width:1280, height:720 });
	},

	removeLayer:function(id) {
		var elem = $(this.domElement).find("#" + id)[0];
		if (elem) {
			this.domElement.removeChild(elem);
		}
	},

	removeElement:function(element) {
		if (element) {
			try {
				this.domElement.removeChild(element);
			}
			catch (e) {
				
			}
		}
	},

	getVSize:function(px) {
		return px*100/this.size.h;
	},

	getHSize:function(px) {
		return px*100/this.size.w;
	}
});

(function() {
	class VideoWrapper extends paella.DomNode {
		constructor(id, left, top, width, height) {
			var relativeSize = new paella.RelativeVideoSize();
			var percentTop = relativeSize.percentVSize(top) + '%';
			var percentLeft = relativeSize.percentWSize(left) + '%';
			var percentWidth = relativeSize.percentWSize(width) + '%';
			var percentHeight = relativeSize.percentVSize(height) + '%';
			var style = {
				top: percentTop,
				left: percentLeft,
				width: percentWidth,
				height: percentHeight,
				position: 'absolute',
				zIndex: GlobalParams.video.zIndex,
				overflow: 'hidden'
			};
			super('div',id,style);
			this._rect = { left:left, top:top, width:width, height:height };
			this.domElement.className = "videoWrapper";
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
		}

		getRect() {
			return this._rect;
		}

		disableClassName() {
			this.classNameBackup = this.domElement.className;
			this.domElement.className = "";
		}

		enableClassName() {
			this.domElement.className = this.classNameBackup;
		}

		enableClassNameAfter(millis) {
			setTimeout("$('#" + this.domElement.id + "')[0].className = '" + this.classNameBackup + "'",millis);
		}

		setVisible(visible,animate) {
			if (typeof(visible=="string")) {
				visible = /true/i.test(visible) ? true : false;
			}
			if (visible && animate) {
				$(this.domElement).show();
				$(this.domElement).animate({opacity:1.0},300);
			}
			else if (visible && !animate) {
				$(this.domElement).show();
			}
			else if (!visible && animate) {
				$(this.domElement).animate({opacity:0.0},300);
			}
			else if (!visible && !animate) {
				$(this.domElement).hide();
			}
		}

		setLayer(layer) {
			this.domElement.style.zIndex = layer;
		}
	}

	paella.VideoWrapper = VideoWrapper;
})();

Class ("paella.VideoContainerBase", paella.DomNode,{
	_trimming:{enabled:false,start:0,end:0},
	timeupdateEventTimer:null,
	timeupdateInterval:250,
	masterVideoData:null,
	slaveVideoData:null,
	currentMasterVideoData:null,
	currentSlaveVideoData:null,
	_force:false,

	_playOnClickEnabled: true,

	_seekDisabled: false,

	initialize:function(id) {
		var self = this;
		var style = {position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',overflow:'hidden'};
		this.parent('div',id,style);
		$(this.domElement).click(function(evt) {
			if (self.firstClick && base.userAgent.browser.IsMobileVersion) return;
			if (self.firstClick && !self._playOnClickEnabled) return;
			paella.player.videoContainer.paused()
				.then(function(paused) {
					self.firstClick = true;
					if (paused) {
						paella.player.play();
					}
					else {
						paella.player.pause();
					}
				});
		});
		this.domElement.addEventListener("touchstart",function(event) {
			if (paella.player.controls) {
				paella.player.controls.restartHideTimer();
			}
		});

		Object.defineProperty(this, "seekDisabled", {
			get: function() { return this._seekDisabled; },
			set: function(v) {
				let changed = v!=this._seekDisabled;
				this._seekDisabled = v;
				if (changed) {
					paella.events.trigger(paella.events.seekAvailabilityChanged, { disabled:this._seekDisabled, enabled:!this._seekDisabled })
				}
			}
		});

		Object.defineProperty(this, "seekEnabled", {
			get: function() { return !this._seekDisabled; },
			set: function(v) {
				let changed = v==this._seekDisabled;
				this._seekDisabled = !v;
				if (changed) {
					paella.events.trigger(paella.events.seekAvailabilityChanged, { disabled:this._seekDisabled, enabled:!this._seekDisabled })
				}
			}
		});
	},

	triggerTimeupdate:function() {
		var This = this;
		var paused = 0;
		var duration = 0;
		this.paused()
			.then(function(p) {
				paused = p;
				return This.duration();
			})

			.then(function(d) {
				duration = d;
				return This.currentTime();
			})

			.then(function(currentTime) {
				if (!paused || This._force) {
					This._force = false;
					paella.events.trigger(paella.events.timeupdate, {
						videoContainer: This,
						currentTime: currentTime,
						duration: duration
					});
				}
			});
	},

	startTimeupdate:function() {
		var thisClass = this;
		this.timeupdateEventTimer = new Timer(function(timer) {
			thisClass.triggerTimeupdate();
		},this.timeupdateInterval);
		this.timeupdateEventTimer.repeat = true;
	},

	stopTimeupdate:function() {
		if (this.timeupdateEventTimer) {
			this.timeupdateEventTimer.repeat = false;
		}
		this.timeupdateEventTimer = null;
	},

	enablePlayOnClick:function() {
		this._playOnClickEnabled = true;
	},

	disablePlayOnClick:function() {
		this._playOnClickEnabled = false;
	},

	isPlayOnClickEnabled:function() {
		return this._playOnClickEnabled;
	},

	play:function() {
		this.startTimeupdate();
		setTimeout(() => paella.events.trigger(paella.events.play), 50)
	},

	pause:function() {
		paella.events.trigger(paella.events.pause);
		this.stopTimeupdate();
	},

	seekTo:function(newPositionPercent) {
		if (this._seekDisabled) {
			console.log("Warning: Seek is disabled");
			return;
		}
		var thisClass = this;
		this.setCurrentPercent(newPositionPercent)
			.then((timeData) => {
				thisClass._force = true;
				this.triggerTimeupdate();
				paella.events.trigger(paella.events.seekToTime,{ newPosition:timeData.time });
				paella.events.trigger(paella.events.seekTo,{ newPositionPercent:newPositionPercent });
			});
	},

	seekToTime:function(time) {
		if (this._seekDisabled) {
			console.log("Seek is disabled");
			return;
		}
		this.setCurrentTime(time)
			.then((timeData) => {
				this._force = true;
				this.triggerTimeupdate();
				let percent = timeData.time * 100 / timeData.duration;
				paella.events.trigger(paella.events.seekToTime,{ newPosition:timeData.time });
				paella.events.trigger(paella.events.seekTo,{ newPositionPercent:percent });
			});
	},

	setPlaybackRate:function(params) {
		paella.events.trigger(paella.events.setPlaybackRate, { rate: params });
	},

	setVolume:function(params) {
	},

	volume:function() {
		return 1;
	},

	trimStart:function() {
		return new Promise((resolve) => {
			resolve(this._trimming.start);
		});
	},

	trimEnd:function() {
		return new Promise((resolve) => {
			resolve(this._trimming.end);
		});
	},

	trimEnabled:function() {
		return new Promise((resolve) => {
			resolve(this._trimming.enabled);
		});
	},

	trimming:function() {
		return new Promise((resolve) => {
			resolve(this._trimming);
		});
	},

	enableTrimming:function() {
		this._trimming.enabled = true;
		let cap=paella.captions.getActiveCaptions()
		if(cap!==undefined) paella.plugins.captionsPlugin.buildBodyContent(cap._captions,"list");
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this._trimming.enabled,trimStart:this._trimming.start,trimEnd:this._trimming.end});
	},

	disableTrimming:function() {
		this._trimming.enabled = false;
		let cap=paella.captions.getActiveCaptions()
		if(cap!==undefined) paella.plugins.captionsPlugin.buildBodyContent(cap._captions,"list");
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this._trimming.enabled,trimStart:this._trimming.start,trimEnd:this._trimming.end});
	},

	setTrimming:function(start,end) {
		return new Promise((resolve) => {
			let currentTime = 0;
			let duration = 0;

			this.currentTime()
				.then((c) => {
					currentTime = c;
					return this.duration();
				})

				.then((d) => {
					duration = d;
					this._trimming.start = Math.floor(start);
					this._trimming.end = Math.floor(end);
					if (currentTime<this._trimming.start) {
						this.setCurrentTime(this._trimming.start);
					}
					if (currentTime>this._trimming.end) {
						this.setCurrentTime(this._trimming.end);
					}
					if(this._trimming.enabled){
						let cap=paella.captions.getActiveCaptions();
						if(cap!==undefined) paella.plugins.captionsPlugin.buildBodyContent(cap._captions,"list");
					}
					paella.events.trigger(paella.events.setTrim,{trimEnabled:this._trimming.enabled,trimStart:this._trimming.start,trimEnd:this._trimming.end});
					resolve();
				});
		});
	},

	setTrimmingStart:function(start) {
 		return this.setTrimming(start,this._trimming.end);
	},

	setTrimmingEnd:function(end) {
		return this.setTrimming(this._trimming.start,end);
	},

	setCurrentPercent:function(percent) {
		var This = this;
		var duration = 0;
		return new Promise((resolve) => {
			this.duration()
				.then(function(d) {
					duration = d;
					return This.trimming();
				})
				.then(function(trimming) {
					var position = 0;
					if (trimming.enabled) {
						var start = trimming.start;
						var end = trimming.end;
						duration = end - start;
						var trimedPosition = percent * duration / 100;
						position = parseFloat(trimedPosition);
					}
					else {
						position = percent * duration / 100;
					}
					return This.setCurrentTime(position);
				})
				.then(function(timeData) {
					resolve(timeData);
				});
		});
	},

	setCurrentTime:function(time) {
		base.log.debug("VideoContainerBase.setCurrentTime(" +  time + ")");
	},

	currentTime:function() {
		base.log.debug("VideoContainerBase.currentTime()");
		return 0;
	},

	duration:function() {
		base.log.debug("VideoContainerBase.duration()");
		return 0;
	},

	paused:function() {
		base.log.debug("VideoContainerBase.paused()");
		return true;
	},

	setupVideo:function(onSuccess) {
		base.log.debug("VideoContainerBase.setupVide()");
	},

	isReady:function() {
		base.log.debug("VideoContainerBase.isReady()");
		return true;
	},

	onresize:function() { this.parent(onresize);
	}
});

(function() {
	// Profile frame strategies

	class ProfileFrameStrategy {
		static Factory() {
			var config = paella.player.config;

			try {
				var strategyClass = config.player.profileFrameStrategy;
				var ClassObject = paella.utils.objectFromString(strategyClass);
				var strategy = new ClassObject();
				if (strategy instanceof paella.ProfileFrameStrategy) {
					return strategy;
				}
			}
			catch (e) {
			}
			
			return null;
		}

		valid() { return true; }

		adaptFrame(videoDimensions,frameRect) {
			return frameRect;
		}
	}

	paella.ProfileFrameStrategy = ProfileFrameStrategy;

	class LimitedSizeProfileFrameStrategy extends ProfileFrameStrategy {
		adaptFrame(videoDimensions,frameRect) {
			if (videoDimensions.width<frameRect.width|| videoDimensions.height<frameRect.height) {
				var frameRectCopy = JSON.parse(JSON.stringify(frameRect));
				frameRectCopy.width = videoDimensions.width;
				frameRectCopy.height = videoDimensions.height;
				var diff = { w:frameRect.width - videoDimensions.width,
							h:frameRect.height - videoDimensions.height };
				frameRectCopy.top = frameRectCopy.top + diff.h/2;
				frameRectCopy.left = frameRectCopy.left + diff.w/2;
				return frameRectCopy;
			}
			return frameRect;
		}
	}

	paella.LimitedSizeProfileFrameStrategy = LimitedSizeProfileFrameStrategy;
})();

(function() {

	class StreamProvider {
		constructor(videoData) {
			this._mainStream = null;
			this._videoStreams = [];
			this._audioStreams = [];

			this._mainPlayer = null;
			this._audioPlayer = null;
			this._videoPlayers = [];
			this._audioPlayers = [];
			this._players = [];

			this._autoplay = base.parameters.get('autoplay')=='true' || this.isLiveStreaming;
		}

		init(videoData) {
			if (videoData.length==0) throw Error("Empty video data.");
			this._videoData = videoData;

			if (!this._videoData.some((stream) => { return stream.role=="master"; })) {
				this._videoData[0].role = "master";
			}

			this._videoData.forEach((stream, index) => {
				stream.type = stream.type || 'video';
				if (stream.role=='master') {
					this._mainStream = stream;
				}

				if (stream.type=='video') {
					this._videoStreams.push(stream);
				}
				else if (stream.type=='audio') {
					this._audioStreams.push(stream);
				}
			});

			if (this._videoStreams.length==0) {
				throw new Error("No video streams found. Paella Player requires at least one video stream.");
			}

			// Create video players
			let autoplay = this.autoplay;
			this._videoStreams.forEach((videoStream,index) => {
				let rect = {x:0,y:0,w:1280,h:720};
				let player = paella.videoFactory.getVideoObject(`video_${ index }`, videoStream, rect);
				player.setVideoQualityStrategy(this._qualityStrategy);
				player.setAutoplay(autoplay);

				if (videoStream==this._mainStream) {
					this._mainPlayer = player;
					this._audioPlayer = player;
				}
				else {
					player.setVolume(0);
				}

				this._videoPlayers.push(player);
				this._players.push(player);
			});

			// Create audio player
			this._audioStreams.forEach((audioStream,index) => {
				let player = paella.audioFactory.getAudioObject(`audio_${ index }`,audioStream);
				player.setAutoplay(autoplay);
				if (player) {
					this._audioPlayers.push(player);
					this._players.push(player);
				}
			});
		}

		loadVideos() {
			let promises = [];

			this._players.forEach((player) => {
				promises.push(player.load());
			});
			
			return Promise.all(promises);
		}

		get isMonostream() {
			return this._videoStreams.length==1;
		}

		get mainStream() {
			return this._mainStream;
		}

		get videoStreams() {
			//return this._videoData;
			return this._videoStreams;
		}

		
		get audioStreams() {
			return this._audioStreams;
		}
		
		get streams() {
			return this._videoStreams.concat(this._audioStreams);
		}

		get videoPlayers() {
			return this._videoPlayers;
		}

		get audioPlayers() {
			return this._audioPlayers;
		}

		get players() {
			return this._videoPlayers.concat(this._audioPlayers);
		}

		callPlayerFunction(fnName) {
			let promises = [];
			let functionArguments = [];
			for (let i=1; i<arguments.length; ++i) {
				functionArguments.push(arguments[i]);
			}

			this.players.forEach((player) => {
				promises.push(player[fnName](...functionArguments));
			});

			return new Promise((resolve,reject) => {
				Promise.all(promises)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
			});
		}

		get mainVideoPlayer() {
			return this._mainPlayer;
		}

		get mainAudioPlayer() {
			return this._audioPlayer;
		}

		get isLiveStreaming() {
			return paella.player.isLiveStream();
		}

		set qualityStrategy(strategy) {
			this._qualityStrategy = strategy;
			this._videoPlayers.forEach((player) => {
				player.setVideoQualityStrategy(strategy);
			})
		}

		get qualityStrategy() { return this._qualityStrategy || null; }

		get autoplay() {
			return this.supportAutoplay && this._autoplay;
		}

		set autoplay(ap) {
			if (!this.supportAutoplay || this.isLiveStreaming) return;
			this._autoplay = ap;
			if (this.videoPlayers) {
				this.videoPlayers.forEach((player) => player.setAutoplay(ap));
				this.audioPlayers.forEach((player) => player.setAutoplay(ap));
			}
		}

		get supportAutoplay() {
			return this.videoPlayers.every((player) => player.supportAutoplay());
		}
	}

	paella.StreamProvider = StreamProvider;

	function addVideoWrapper(id,videoPlayer) {
		let wrapper = new paella.VideoWrapper(id);
		wrapper.addNode(videoPlayer);
		this.videoWrappers.push(wrapper);
		this.container.addNode(wrapper);
		return wrapper;
	}

	class VideoContainer extends paella.VideoContainerBase {

		get streamProvider() { return this._streamProvider; }
		get ready() { return this._ready; }
		get isMonostream() { return this._streamProvider.isMonostream; }
		get trimmingHandler() { return this._trimmingHandler; }
		get videoWrappers() { return this._videoWrappers; }
		get container() { return this._container; }
		get profileFrameStrategy() { return this._profileFrameStrategy; }
		get sourceData() { return this._sourceData; }

		constructor(id) {
			super(id);

			this._streamProvider = new paella.StreamProvider();
			this._ready = false;
			this._videoWrappers = [];

			this._container = new paella.DomNode('div','playerContainer_videoContainer_container',{position:'relative',display:'block',marginLeft:'auto',marginRight:'auto',width:'1024px',height:'567px'});
			this._container.domElement.setAttribute('role','main');
			this.addNode(this._container);

			this.overlayContainer = new paella.VideoOverlay(this.domElement);
			this.container.addNode(this.overlayContainer);

			this.setProfileFrameStrategy(paella.ProfileFrameStrategy.Factory());
			this.setVideoQualityStrategy(paella.VideoQualityStrategy.Factory());

			this._audioTag = paella.dictionary.currentLanguage();
			this._audioPlayer = null;
			this._volume = 1;
		}

		// Playback and status functions
		play() {
			return new Promise((resolve,reject) => {
				this.streamProvider.callPlayerFunction('play')
					.then(() => {
						super.play();
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
			});
		}

		pause() {
			return new Promise((resolve,reject) => {
				this.streamProvider.callPlayerFunction('pause')
					.then(() => {
						super.pause();
						resolve();
					})
					.catch((err) => {
						reject(err);
					})
			});
		}

		setCurrentTime(time) {
			return new Promise((resolve,reject) => {
				this.trimming()
					.then((trimmingData) => {
						if (trimmingData.enabled) {
							time += trimmingData.start;
							if (time<trimmingData.start) {
								time = trimmingData.start;
							}
							if (time>trimmingData.end) {
								time = trimmingData.end;
							}
						}
						return this.streamProvider.callPlayerFunction('setCurrentTime',time);
					})
				
					.then(() => {
						return this.duration(false);
					})

					.then((duration) => {
						resolve({ time:time, duration:duration });
					})

					.catch((err) => {
						reject(err);
					})
			})
		}

		currentTime(ignoreTrimming = false) {
			return new Promise((resolve) => {
				let trimmingData = null;
				let p = ignoreTrimming ? Promise.resolve({ enabled:false }) : this.trimming();

				p.then((t) => {
					trimmingData = t;
					return this.streamProvider.mainVideoPlayer.currentTime();
				})

				.then((time) => {
					if (trimmingData.enabled) {
						time = time - trimmingData.start;
					}
					resolve(time)
				});
			});
		}

		setPlaybackRate(rate) {
			this.streamProvider.callPlayerFunction('setPlaybackRate',rate);
			super.setPlaybackRate(rate);
		}

		setVolume(params) {
			if (typeof(params)=='object') {
				console.warn("videoContainer.setVolume(): set parameter as object is deprecated");
				return Promise.resolve();
			}
			else {
				return new Promise((resolve,reject) => {
					this._audioPlayer.setVolume(params)
						.then(() => {
							paella.events.trigger(paella.events.setVolume, { master:params });
							resolve(params);
						})
						.catch((err) => {
							reject(err);
						});
				});
			}
		}

		volume() {
			return this._audioPlayer.volume();
		}

		duration(ignoreTrimming = false) {
			return new Promise((resolve) => {
				let trimmingData = null;
				let p = ignoreTrimming ? Promise.resolve({ enabled:false }) : this.trimming();

				p.then((t) => {
					trimmingData = t;
					return this.streamProvider.mainVideoPlayer.duration();
				})
				
				.then((duration) => {
					if (trimmingData.enabled) {
						duration = trimmingData.end - trimmingData.start;
					}
					resolve(duration);
				});
			})
		}

		paused() {
			return this.streamProvider.mainVideoPlayer.isPaused();
		}

		// Video quality functions
		getQualities() {
			return this.streamProvider.mainVideoPlayer.getQualities();
		}

		setQuality(index) {
			let qualities = [];
			let promises = [];
			this.streamProvider.videoPlayers.forEach((player) => {
				let playerData = {
					player:player,
					promise:player.getQualities()
				};
				qualities.push(playerData);
				promises.push(playerData.promise);
			});

			return new Promise((resolve) => {
				let resultPromises = [];
				Promise.all(promises)
					.then(() => {
						qualities.forEach((data) => {
							data.promise.then((videoQualities) => {						
								let videoQuality = videoQualities.length>index ? index:videoQualities.length - 1;
								resultPromises.push(data.player.setQuality(videoQuality));
							});
						});

						return Promise.all(resultPromises);
					})

					.then(() => {
						//setTimeout(() => {
							paella.events.trigger(paella.events.qualityChanged);
							resolve();
						//},10);
					});
			});
		}
		getCurrentQuality() {
			return this.streamProvider.mainVideoPlayer.getCurrentQuality();
		}

		// Current audio functions
		get audioTag() {
			return this._audioTag;
		}

		get audioPlayer() {
			return this._audioPlayer;
		}

		getAudioTags() {
			return new Promise((resolve) => {
				let lang = [];
				let p = this.streamProvider.players;
				p.forEach((player) => {
					if (player.stream.audioTag) {
						lang.push(player.stream.audioTag);
					}
				})
				resolve(lang);
			})
		}

		setAudioTag(lang) {
			return new Promise((resolve) => {
				let audioSet = false;
				let promises = [];
				this.streamProvider.players.forEach((player) => {
					if (!audioSet && player.stream.audioTag==lang) {
						audioSet = true;
						this._audioPlayer = player;
					}
					promises.push(player.setVolume(0));
				});

				if (!audioSet) {
					this._audioPlayer = this.streamProvider.mainVideoPlayer;
				}

				Promise.all(promises).then(() => {
					return this._audioPlayer.setVolume(this._volume);
				})

				.then(() => {
					this._audioTag = this._audioPlayer.stream.audioTag;
					paella.events.trigger(paella.events.audioTagChanged);
					resolve();
				});
			})
		}

		setProfileFrameStrategy(strategy) {
			this._profileFrameStrategy = strategy;
		}

		setVideoQualityStrategy(strategy) {
			this.streamProvider.qualityStrategy = strategy;
		}

		autoplay() { return this.streamProvider.autoplay; }
		supportAutoplay() { return this.streamProvider.supportAutoplay; }
		setAutoplay(ap=true) {
			this.streamProvider.autoplay = ap;
			return this.streamProvider.supportAutoplay;
		}

		masterVideo() {
			return this.streamProvider.mainVideoPlayer;
		}

		getVideoRect(videoIndex) {
			if (this.videoWrappers.length>videoIndex) {
				return this.videoWrappers[videoIndex].getRect();
			}
			else {
				throw new Error(`Video wrapper with index ${ videoIndex } not found`);
			}
		}

		setStreamData(videoData) {
			videoData.forEach((stream) => {
				for (var type in stream.sources) {
					let source = stream.sources[type];
					source.forEach((item) => {
						if (item.res) {
							item.res.w = Number(item.res.w);
							item.res.h = Number(item.res.h);
						}
					});
				}
			});
			this._sourceData = videoData;
			return new Promise((resolve,reject) => {
				this.streamProvider.init(videoData);

				this.streamProvider.videoPlayers.forEach((player,index) => {
					addVideoWrapper.apply(this,['videoPlayerWrapper_' + index,player]);
					player.setAutoplay(this.autoplay());
				});

				this.streamProvider.loadVideos()
					.then(() => {
						return this.setAudioTag(this.audioTag);
					})

					.then(() => {
						$(this.streamProvider.mainVideoPlayer.video).bind('timeupdate', (evt) => {
							this.trimming().then((trimmingData) => {
								let current = evt.currentTarget.currentTime;
								let duration = evt.currentTarget.duration;
								if (trimmingData.enabled) {
									current -= trimmingData.start;
									duration = trimmingData.end - trimmingData.start;
								}
								paella.events.trigger(paella.events.timeupdate, { videoContainer:this, currentTime:current, duration:duration });
								if (current>=duration) {
									this.streamProvider.callPlayerFunction('pause');
								}
							})
						});

						this._ready = true;
						paella.events.trigger(paella.events.videoReady);
						let profileToUse = base.parameters.get('profile') ||
										   base.cookies.get('profile') ||
										   paella.profiles.getDefaultProfile();

						if (paella.profiles.setProfile(profileToUse, false)) {
							resolve();
						}
						else if (!paella.profiles.setProfile(paella.profiles.getDefaultProfile(), false)) {
							resolve();
						}
					});
			});
		}

		resizePortrait() {
			var width = (paella.player.isFullScreen() == true) ? $(window).width() : $(this.domElement).width();
			var relativeSize = new paella.RelativeVideoSize();
			var height = relativeSize.proportionalHeight(width);
			this.container.domElement.style.width = width + 'px';
			this.container.domElement.style.height = height + 'px';

			var containerHeight = (paella.player.isFullScreen() == true) ? $(window).height() : $(this.domElement).height();
			var newTop = containerHeight / 2 - height / 2;
			this.container.domElement.style.top = newTop + "px";
		}

		resizeLandscape() {
			var height = (paella.player.isFullScreen() == true) ? $(window).height() : $(this.domElement).height();
			var relativeSize = new paella.RelativeVideoSize();
			var width = relativeSize.proportionalWidth(height);
			this.container.domElement.style.width = width + 'px';
			this.container.domElement.style.height = height + 'px';
			this.container.domElement.style.top = '0px';
		}

		onresize() {
			super.onresize();
			var relativeSize = new paella.RelativeVideoSize();
			var aspectRatio = relativeSize.aspectRatio();
			var width = (paella.player.isFullScreen() == true) ? $(window).width() : $(this.domElement).width();
			var height = (paella.player.isFullScreen() == true) ? $(window).height() : $(this.domElement).height();
			var containerAspectRatio = width/height;

			if (containerAspectRatio>aspectRatio) {
				this.resizeLandscape();
			}
			else {
				this.resizePortrait();
			}
			//paella.profiles.setProfile(paella.player.selectedProfile,false)
		}
	}

	paella.VideoContainer = VideoContainer;

})();

