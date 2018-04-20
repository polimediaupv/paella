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
		this.domElement.innerHTML = "";
	},

	getMasterRect:function() {
		return paella.player.videoContainer.getMasterVideoRect();
	},

	getSlaveRect:function() {
		return paella.player.videoContainer.getSlaveVideoRect();
	},

	addText:function(text,rect,isDebug) {
		var textElem = document.createElement('div');
		textElem.innerHTML = text;
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
		paella.events.trigger(paella.events.play);
		this.startTimeupdate();
	},

	pause:function() {
		paella.events.trigger(paella.events.pause);
		this.stopTimeupdate();
	},

	seekTo:function(newPositionPercent) {
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
			return this._videoData;
		}

		get audioStreams() {
			return this._audioStreams;
		}

		get videoPlayers() {
			return this._videoPlayers;
		}

		get audioPlayers() {
			return this._audioPlayers;
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

	class VideoContainer_old extends paella.VideoContainerBase {
		constructor(id) {
			super(id);
			this.containerId = '';
			this.video1Id = '';
			this.videoSlaveId = '';
			this.backgroundId = '';
			this.container = null;
			this.profileFrameStrategy = null;

			this.videoWrappers = [];
			this._players = [];
			this._videoPlayers = [];
			this._audioPlayers = [];
			this._audioPlayer = null;
			this._audioLanguage = paella.dictionary.currentLanguage();
			this._volume = 1;

			this.videoClasses = {
				master:"video masterVideo",
				slave:"video slaveVideo"
			};

			this.isHidden = false;
			this.logos = null;

			this.overlayContainer = null;
			this.videoSyncTimeMillis = 5000;
			this.currentMasterVideoRect = {};
			this.currentSlaveVideoRect = {};

			this._maxSyncDelay = 0.5;
			this._isMonostream = false;

			this._videoQualityStrategy = null;

			this._sourceData = null;
			this._isMasterReady = false;
			this._isSlaveReady = false;

			this._firstLoad = false;
			this._playOnLoad = false;
			this._seekToOnLoad = 0;
				
			this._showPosterFrame = true;
			this._currentProfile = null;

			var thisClass = this;
			this._sourceData = [];
			this.containerId = id + '_container';
			this.video1Id = id + '_master';
			this.videoSlaveId = id + '_slave_';
			this.audioId = id + '_audio_';
			this.backgroundId = id + '_bkg';
			this.logos = [];
			this._videoQualityStrategy = this._getQualityStrategyObject();


			this.container = new paella.DomNode('div',this.containerId,{position:'relative',display:'block',marginLeft:'auto',marginRight:'auto',width:'1024px',height:'567px'});
			this.container.domElement.setAttribute('role','main');
			this.addNode(this.container);

			this.overlayContainer = new paella.VideoOverlay(this.domElement);
			this.container.addNode(this.overlayContainer);

			this.container.addNode(new paella.BackgroundContainer(this.backgroundId, paella.utils.folders.profiles() + '/resources/default_background_paella.jpg'));

			Object.defineProperty(this,'sourceData',{
				get: function() { return this._sourceData; }
			});

			var timer = new base.Timer(function(timer) {
				thisClass.syncVideos();
			},thisClass.videoSyncTimeMillis);
			timer.repeat = true;

			var config = paella.player.config;
			try {
				var StrategyClass = config.player.profileFrameStrategy;
				var ClassObject = Class.fromString(StrategyClass);
				var strategy = new ClassObject();
				if (dynamic_cast("paella.ProfileFrameStrategy", strategy)) {
					this.setProfileFrameStrategy(strategy);
				}
			}
			catch (e) {

			}

			this._streamProvider = new paella.StreamProvider();

			Object.defineProperty(this,'ready',{
				get: function() {
					return this._isMasterReady && this._isSlaveReady;
				}
			});

			Object.defineProperty(this,'isMonostream', {
				get: function() {
					return this._isMonostream;
				}
			});
		}

		get streamProvider() { return this._streamProvider; }

		_getQualityStrategyObject() {
			var Constructor = null;
			paella.player.config.player
				.videoQualityStrategy
				.split('.')
				.forEach(function(ns,index,array) {
					if (index==0 && array.length>1) {
						Constructor = window[ns];
					}
					else {
						Constructor = Constructor[ns];
					}
				});
		
			Constructor = Constructor || paella.VideoQualityStrategy();
			return new Constructor();
		}

		getVideoData() {
			return new Promise((resolve) => {
				let result = { master:null, slaves:[] };
				let promises = [];
				if (this.masterVideo()) {
					promises.push(this.masterVideo().getVideoData()
						.then((masterVideoData) => {
							result.master = masterVideoData;
							return Promise.resolve(masterVideoData);
						})
					);
				}
				if (this.slaveVideo()) {
					promises.push(this.slaveVideo().getVideoData()
						.then((slaveVideoData) => {
							result.slaves.push(slaveVideoData);
							return Promise.resolve(slaveVideoData);
						})
					);
				}

				Promise.all(promises)
					.then(() => {
						resolve(result);
					});
			});
		}

		setVideoQualityStrategy(strategy) {
			this._videoQualityStrategy = strategy;
			if (this.masterVideo()) this.masterVideo().setVideoQualityStrategy(this._videoQualityStrategy);
			if (this.slaveVideo()) slaveVideo.setVideoQualityStrategy(this._videoQualityStrategy);
		}

		setProfileFrameStrategy(strategy) {
			this.profileFrameStrategy = strategy;
		}

		getMasterVideoRect() {
			return this.currentMasterVideoRect;
		}

		getSlaveVideoRect() {
			return this.currentSlaveVideoRect;
		}
	
		setHidden(hidden) {
			this.isHidden = hidden;
		}

		hideVideo() {
			this.setHidden(true);
		}

		publishVideo() {
			this.setHidden(false);
		}

		syncVideos() {
			var This = this;
			var masterVideo = this.masterVideo();
			var slaveVideo = this.slaveVideo();
			var masterCurrent = 0;
			var slaveCurrent = 0;
			if (!this._isMonostream && masterVideo) {
				masterVideo.currentTime()
					.then(function(m) {
						masterCurrent = m;
						if (slaveVideo) {
							return slaveVideo.currentTime();
						}
						else {
							return Promise.resolve(-1);
						}
					})

					.then(function(s) {
						if (s>=-1) {
							slaveCurrent = s;
							var diff = Math.abs(masterCurrent - slaveCurrent);

							if (diff>This._maxSyncDelay) {
								base.log.debug("Sync videos performed, diff=" + diff);
								slaveVideo.setCurrentTime(masterCurrent);
							}
						}
						let audioPromises = [];
						This._audioPlayers.forEach((player) => {
							audioPromises.push(player.currentTime());
						});
						return Promise.all(audioPromises);
					})

					.then(function(audioTime) {
						audioTime.forEach(function(t,index) {
							let player = This._audioPlayers[index];
							let diff = Math.abs(masterCurrent - t);
							if (diff>This._maxSyncDelay) {
								base.log.debug("Sync audio performed, diff=" + diff);
								player.setCurrentTime(t);
							}
						});
					});
			}
		}

		checkVideoBounds(trimming, current, paused, actualDuration) {
			var This = this;
			var start = trimming.start;
			var end = trimming.end;
			var enabled = trimming.enabled;
			paella.events.bind(paella.events.endVideo, () => {
				this.setCurrentTime(0);
			});
			if (!enabled) {
				if (current>=actualDuration) {
					paella.events.trigger(paella.events.endVideo, { videoContainer: this });
					this.pause();
				}
			}
			else {
				if (current>=Math.floor(end) && !paused) {
					paella.events.trigger(paella.events.endVideo, { videoContainer: this });
					this.pause();
				}
				else if (current<start) {
					this.setCurrentTime(start + 1);
				}
			}
		}

		play() {
			return new Promise((resolve) => {
				if (!this._firstLoad) {
					this._firstLoad = true;
				}
				else {
					this._playOnLoad = true;
				}
				let masterVideo = this.masterVideo();
				let slaveVideo = this.slaveVideo();
				if (masterVideo) {
					masterVideo.play()
						.then(() => {
							if (slaveVideo) {
								slaveVideo.play();
							}
							this._audioPlayers.forEach((player) => {
								player.play();
							});
							super.play();
							resolve();
						});
				}
				else {
					reject(new Error("Invalid master video"));
				}
			});
		}

		pause() {
			return new Promise((resolve,reject) => {
				var masterVideo = this.masterVideo();
				var slaveVideo = this.slaveVideo();
				if (masterVideo) {
					masterVideo.pause()
						.then(() => {
							if (slaveVideo) slaveVideo.pause();
							this._audioPlayers.forEach((player) => {
								player.pause();
							});
							super.pause();
							resolve();
						});
				}
				else {
					reject(new Error("invalid master video"));
				}
			});
		}

		next() {
			if (this._trimming.end!==0) {
				this.setCurrentTime(this._trimming.end);
			}
			else {
				this.duration(true)
					.then(function(d) {
						this.setCurrentTime(d);
					});
			}
			super.next();
		}

		previous() {
			this.setCurrentTime(this._trimming.start);
			super.previous();
		}

		setCurrentTime(time) {
			// if (time<=0) time = 1;  Fix #176
			return new Promise((resolve) => {
				let promises = [];
				if (this._trimming.enabled) {
					time += this._trimming.start;
					if (time<this._trimming.start) time = this._trimming.start;
					if (time>this._trimming.end) time = this._trimming.end;
				}
				promises.push(this.masterVideo().setCurrentTime(time));
				if (this.slaveVideo()) promises.push(this.slaveVideo().setCurrentTime(time));
				this._audioPlayers.forEach((player) => { promises.push(player.setCurrentTime(time)); });

				Promise.all(promises)
					.then(() => {
						return this.duration(false);
					})
					.then((duration) => {
						resolve({ time:time, duration:duration});
					});
			});
		}

		currentTime(ignoreTrimming = false) {
			if (this._trimming.enabled && !ignoreTrimming) {
				var trimStart = this._trimming.start;
				return new Promise((resolve) => {
					this.masterVideo().currentTime()
						.then(function(t) {
							resolve(t - trimStart);
						});
				});
			}
			else {
				return this.masterVideo().currentTime();
			}
		}

		setPlaybackRate(rate) {
			var masterVideo = this.masterVideo();
			var slaveVideo = this.slaveVideo();
			if (masterVideo) {
				masterVideo.setPlaybackRate(rate);
			}
			if (slaveVideo) {
				slaveVideo.setPlaybackRate(rate);
			}
			super.setPlaybackRate(rate);
		}

		setVolume(params) {
			return new Promise((resolve) => {
				if (typeof(params)=='object') {
					params = params.master!==undefined ? params.master:1;
				}
				this.mainAudioPlayer().setVolume(params)
					.then(() => {
						paella.events.trigger(paella.events.setVolume,{ master:params });
						this._volume = params;
						resolve(params);
					});
			});
		}

		volume() {
			return new Promise((resolve) => {
				this.mainAudioPlayer().volume().then((vol) => {
					resolve(vol);
				})
			});
		}

		masterVideo() {
			return this.videoWrappers.length>0 ? this.videoWrappers[0].getNode(this.video1Id) : null;
		}

		slaveVideo() {
			return this.videoWrappers.length>1 ? this.videoWrappers[1].getNode(this.videoSlaveId + 1) : null;
		}

		mainAudioPlayer() {
			return this._audioPlayer;
		}

		players() {
			let This = this;
			return new Promise((resolve) => {
				function waitResult() {
					if (!This.masterVideo()) {
						setTimeout(() => waitResult(), 10);
					}
					else {
						resolve(This._players);
					}
				}
				waitResult();
			});
		}

		videoPlayers() {
			let This = this;
			return new Promise((resolve) => {
				function waitResult() {
					if (!This.masterVideo()) {
						setTimeout(() => waitResult(), 10);
					}
					else {
						resolve(This._videoPlayers);
					}
				}
				waitResult();
			});
		}

		audioPlayers() {
			let This = this;
			return new Promise((resolve) => {
				function waitResult() {
					if (!This.masterVideo()) {
						setTimeout(() => waitResult(), 10);
					}
					else {
						resolve(This._audioPlayers);
					}
				}
				waitResult();
			});
		}

		duration(ignoreTrimming) {
			var This = this;
			return this.masterVideo().duration()
				.then(function(d) {
					if (This._trimming.enabled && !ignoreTrimming) {
						d = This._trimming.end - This._trimming.start;
					}
					return d;
				});
		}

		paused() {
			return this.masterVideo().isPaused();
		}

		trimEnabled() {
			return this._trimming.enabled;
		}

		trimStart() {
			if (this._trimming.enabled) {
				return this._trimming.start;
			}
			else {
				return 0;
			}
		}

		trimEnd() {
			if (this._trimming.enabled) {
				return this._trimming.end;
			}
			else {
				return this.duration();
			}
		}

		getQualities() {
			var qualities = [];
			return new Promise((resolve) => {
				this.masterVideo().getQualities()
					.then(function(q) {
						resolve(q);
					});
			});
		}

		setQuality(index) {
			var masterQualities = [];
			var slaveQualities = [];
			var This = this;
			return new Promise((resolve) => {
				function doSetQuality() {
					var masterIndex = index<masterQualities.length ? index:masterQualities.length - 1;
					var slaveIndex = index<slaveQualities.length ? index:slaveQualities.length - 1;
					This.masterVideo().setQuality(masterIndex)
						.then(() => {
							if (This.slaveVideo()) {
								return This.slaveVideo().setQuality(slaveIndex);
							}
							else {
								return paella_DeferredResolved();
							}
						})

						.then(() => {
							paella.events.trigger(paella.events.qualityChanged);
							resolve();
						});
				}

				this.masterVideo().getQualities()
					.then((q) => {
						masterQualities = q;
						if (this.slaveVideo()) {
							return this.slaveVideo().getQualities();
						}
						else {
							return paella_DeferredResolved();
						}
					})

					.then((q) => {
						slaveQualities = q || [];
						doSetQuality();
					});
			});
		}

		getCurrentQuality() {
			return this.masterVideo().getCurrentQuality();
		}

		setStartTime(time) {
			this.seekToTime(time);
		}

		get audioLanguage() {
			return this._audioLanguage;
		}

		getAudioLanguages() {
			return new Promise((resolve) => {
				let lang = [];
				this.players()
					.then((p) => {
						p.forEach((player) => {
							if (player.stream.language) {
								lang.push(player.stream.language);
							}
						});
						resolve(lang);
					});
			});
		}

		setAudioLanguage(lang) {
			return new Promise((resolve) => {
				let audioSet = false;
				this.players()
					.then((players) => {
						let promises = [];
						
						players.forEach((player) => {
							if (!audioSet && (player.stream.language==lang)) {
								audioSet = true;
								this._audioPlayer = player;
							}
							promises.push(player.setVolume(0));
						});
						return Promise.all(promises);
					})

					.then(() => {
						if (!audioSet) {
							this._audioPlayer = this.masterVideo();
						}
						return this.mainAudioPlayer().setVolume(this._volume);
					})

					.then(() => {
						this._audioLanguage = this.mainAudioPlayer().stream.language;
						paella.events.trigger(paella.events.audioLanguageChanged);
						resolve();
					})
			});
		}

		setStreamData(videoData) {
			var This = this;
			this._sourceData = videoData;
			var overlayLoader = document.createElement("div");
			overlayLoader.className = "videoLoaderOverlay";
			this.overlayContainer.addElement(overlayLoader,{left:0,top:0,width:1280,height:720});

			this._streamProvider.init(videoData);

			var masterRect = this._streamProvider.slaveVideos.length>0 ? {x:850,y:140,w:360,h:550}:{x:0,y:0,w:1280,h:720};
			var slaveRect = {x:10,y:40,w:800,h:600};
			this._isMonostream = this._streamProvider.slaveVideos.length==0;
			var masterVideoData = this._streamProvider.masterVideo;
			var audioStreamsData = this._streamProvider.audioStreams;

			this._players = [];
			this._videoPlayers = [];
			this._audioPlayers = [];
			var slaveVideoData = this._streamProvider.mainSlaveVideo;
			var masterVideo = paella.videoFactory.getVideoObject(this.video1Id,masterVideoData, masterRect);
			this._audioPlayer = masterVideo;
			this._players.push(masterVideo);
			this._videoPlayers.push(masterVideo);
			var slaveVideo = slaveVideoData ? paella.videoFactory.getVideoObject(this.videoSlaveId + 1,slaveVideoData, slaveRect) : null;
			if (slaveVideo) {
				slaveVideo.setVolume(0);
				this._players.push(slaveVideo);
				this._videoPlayers.push(slaveVideo);
			}
			
			audioStreamsData.forEach((streamData,index) => {
				let audioPlayer = paella.audioFactory.getAudioObject(this.audioId + index,streamData);
				if (audioPlayer) {
					this._audioPlayers.push(audioPlayer);
					this._players.push(audioPlayer);
					this.container.addNode(audioPlayer);
				}
			});

			
			masterVideo.setVideoQualityStrategy(this._videoQualityStrategy);
			if (slaveVideo) slaveVideo.setVideoQualityStrategy(this._videoQualityStrategy);
			
			addVideoWrapper.apply(this,['masterVideoWrapper',masterVideo]);
			if (this._streamProvider.slaveVideos.length>0) {
				addVideoWrapper.apply(this,['slaveVideoWrapper',slaveVideo]);
			}

			var autoplay = this.autoplay();
			masterVideo.setAutoplay(autoplay);
			if (slaveVideo) slaveVideo.setAutoplay(autoplay);

			return masterVideo.load()
				.then(() => {
					if (this._streamProvider.slaveVideos.length>0) {
						return slaveVideo.load();
					}
					else {
						return paella_DeferredResolved(true);
					}
				})

				.then(function() {
					if (This._audioPlayers.length>0) {
						let audioLoadPromises = [];
						This._audioPlayers.forEach(function(player) {
							audioLoadPromises.push(player.load());
						});
						return Promise.all(audioLoadPromises);
					}
					else {
						return paella_DeferredResolved(true);
					}
				})

				.then(function() {
					$(masterVideo.video).bind('timeupdate', function(evt) {
						var trimming = This._trimming;
						var current = evt.currentTarget.currentTime;
						var duration = evt.currentTarget.duration;
						if (trimming.enabled) {
							current -= trimming.start;
							duration = trimming.end - trimming.start;
						}
						paella.events.trigger(paella.events.timeupdate, { videoContainer:This, currentTime:current, duration:duration });
						This.checkVideoBounds(trimming,evt.currentTarget.currentTime,evt.currentTarget.paused,duration);

					});
					This.overlayContainer.removeElement(overlayLoader);
					This._isMasterReady = true;
					This._isSlaveReady = true;

					var config = paella.player.config;
					var masterVolume = (config.player.audio && config.player.audio.master!=undefined) ?
												config.player.audio.master:1.0;
					masterVideo.setVolume(masterVolume);
					return This.setAudioLanguage(This._audioLanguage);
				})
				
				.then(function() {
					paella.events.trigger(paella.events.videoReady);

					var getProfile = base.parameters.get('profile');
					var cookieProfile = base.cookies.get('lastProfile');
					let promise = null;
					if (getProfile) {
						promise = paella.profiles.setProfile(getProfile, false);
					}
					else if (cookieProfile) {
						promise = paella.profiles.setProfile(cookieProfile, false);
					}

					if (!promise) {
						promise = paella.profiles.setProfile(paella.profiles.getDefaultProfile(), false);
					}

					return new Promise((resolve) => {
						promise.then(() => resolve())
						.catch(() => {
							paella.profiles.setProfile(paella.profiles.getDefaultProfile(), false)
								.then(() => resolve());
						});
					});
				});
		}
		
		setAutoplay(ap = true) {
			if (!this.supportAutoplay()) return false;
			this._autoplay = ap;
			if (this.masterVideo()) {
				this.masterVideo().setAutoplay(ap);
			}
			if (this.slaveVideo()) {
				this.slaveVideo().setAutoplay(ap);
			}
			if (this._audioPlayers.length>0) {
				this._audioPlayers.forEach((p) => { p.setAutoplay(ap); });
			}
			return true;
		}

		autoplay() {
			return 	this.supportAutoplay() &&
					(base.parameters.get('autoplay')=='true' || this._streamProvider.isLiveStreaming) &&
					!base.userAgent.browser.IsMobileVersion;
		}

		supportAutoplay() {
			let result = false;
			if (this.masterVideo()) {
				result = this.masterVideo().supportAutoplay();
			}
			if (this.slaveVideo() && result) {
				result = result && this.slaveVideo().supportAutoplay();
			}
			if (this._audioPlayers.length>0 && result) {
				this._audioPlayers.forEach((p) => { result = result && p.supportAutoplay(); });
			}
			return result;
		}

		numberOfStreams() {
			return this._sourceData.length;
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
		}
	}

	class TrimmingHandler {
		constructor(videoContainer) {
			this._videoContainer = videoContainer;

			this._enabled = false;
			this._start = 0;
			this._end = 0;
		}

		get enabled() { return this._enabled && this._end>this._start; }
		get start() { return this._start; }
		get end() { return this._end; }

		init(trimmingData) {

		}

		checkVideoBounds(currentTime,isPaused,duration) {

		}
	}

	class VideoContainer extends paella.VideoContainerBase {

		get streamProvider() { return this._streamProvider; }
		get ready() { return this._ready; }
		get isMonostream() { return this._streamProvider.isMonostream; }
		get trimming() { return this._trimmingHandler; }
		get videoWrappers() { return this._videoWrappers; }
		get container() { return this._container; }

		constructor(id) {
			super(id);

			this._streamProvider = new paella.StreamProvider();
			this._ready = false;
			this._trimmingHandler = new TrimmingHandler(this);
			this._videoWrappers = [];

			this._container = new paella.DomNode('div','mainVideoContainer',{position:'relative',display:'block',marginLeft:'auto',marginRight:'auto',width:'1024px',height:'567px'});
			this._container.domElement.setAttribute('role','main');
			this.addNode(this._container);

			this.setProfileFrameStrategy(paella.ProfileFrameStrategy.Factory());
			this.setVideoQualityStrategy(paella.VideoQualityStrategy.Factory());
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


		setStreamData(videoData) {
			return new Promise((resolve,reject) => {
				this.streamProvider.init(videoData);

				//let masterRect = this._streamProvider.slaveVideos.length>0 ? {x:850,y:140,w:360,h:550}:{x:0,y:0,w:1280,h:720};
				//let otherRect = {x:10,y:40,w:800,h:600}; 

				this.streamProvider.videoPlayers.forEach((player,index) => {
					addVideoWrapper.apply(this,['videoPlayerWrapper_' + index,player]);
					player.setAutoplay(this.autoplay());
				});

				this.streamProvider.loadVideos()
					.then(() => {
						$(this.streamProvider.mainVideoPlayer.video).bind('timeupdate', (evt) => {
							let trimming = this.trimmingHandler;
							let current = evt.currentTarget.currentTime;
							let duration = evt.currentTarget.duration;
							if (this.trimmingHandler.enabled) {
								current -= trimming.start;
								duration = trimming.end - trimming.start;
							}
							paella.events.trigger(paella.events.timeupdate, { videoContainer:this });
							trimming.checkVideoBounds(evt.currentTarget.currentTime,evt.currentTarget.paused,duration);
						});

						this._ready = true;
						let getProfile = base.parameters.get('profile');
						let cookieProfile = base.cookies.get('profile');
						let profileToUse = base.parameters.get('profile') ||
										   base.cookies.get('profile') ||
										   paella.profiles.getDefaultProfile();

						paella.profiles.setProfile(profileToUse)
							.then(() => {
								resolve();
							})
							.catch(() => {
								paella.profiles.setProfile(paella.profiles.getDefaultProfile(), false).then(() => resolve());
							});
					});
			});
		}
	}

	paella.VideoContainer = VideoContainer;

})();

