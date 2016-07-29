/*
 Paella HTML 5 Multistream Player
 Copyright (C) 2013  Universitat Politècnica de València

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
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

Class ("paella.VideoContainerBase", paella.DomNode,{
	_trimming:{enabled:false,start:0,end:0},
	timeupdateEventTimer:null,
	timeupdateInterval:250,
	masterVideoData:null,
	slaveVideoData:null,
	currentMasterVideoData:null,
	currentSlaveVideoData:null,
	_force:false,

	initialize:function(id) {
		var self = this;
		var style = {position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',overflow:'hidden'};
		this.parent('div',id,style);
		$(this.domElement).click(function(evt) {
			if (self.firstClick && base.userAgent.browser.IsMobileVersion) return;
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
		this.setCurrentPercent(newPositionPercent);
		thisClass._force = true;
		this.triggerTimeupdate();
		paella.events.trigger(paella.events.seekTo,{ newPositionPercent:newPositionPercent });

	},

	seekToTime:function(time) {
		this.setCurrentTime(time);
		this._force = true;
		this.triggerTimeupdate();
	},

	setPlaybackRate:function(params) {
	},

	setVolume:function(params) {
	},

	volume:function() {
		return 1;
	},

	trimStart:function() {
		var defer = $.Deferred();
		defer.resolve(this._trimming.start);
		return defer;
	},

	trimEnd:function() {
		var defer = $.Deferred();
		defer.resolve(this._trimming.end);
		return defer;
	},

	trimEnabled:function() {
		var defer = $.Deferred();
		defer.resolve(this._trimming.enabled);
		return defer;
	},

	trimming:function() {
		var defer = $.Deferred();
		defer.resolve(this._trimming);
		return defer;
	},

	enableTrimming:function() {
		this._trimming.enabled = true;
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this._trimming.enabled,trimStart:this._trimming.start,trimEnd:this._trimming.end});
	},

	disableTrimming:function() {
		this._trimming.enabled = false;
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this._trimming.enabled,trimStart:this._trimming.start,trimEnd:this._trimming.end});
	},

	setTrimming:function(start,end) {
		var This = this;
		var defer = $.Deferred();
		var currentTime = 0;
		var duration = 0;

		this.currentTime()
			.then(function(c) {
				currentTime = c;
				return This.duration();
			})

			.then(function(d) {
				duration = d;
				This._trimming.start = start;
				This._trimming.end = end;
				if (currentTime<This._trimming.start) {
					This.setCurrentTime(This._trimming.start);
				}
				if (currentTime>This._trimming.end) {
					This.setCurrentTime(This._trimming.end);
				}
				paella.events.trigger(paella.events.setTrim,{trimEnabled:This._trimming.enabled,trimStart:This._trimming.start,trimEnd:This._trimming.end});
				defer.resolve();
			});

		return defer;
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
					position = parseFloat(trimedPosition) + parseFloat(start);
				}
				else {
					position = percent * duration / 100;
				}
				return This.setCurrentTime(position);
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

Class ("paella.ProfileFrameStrategy",{
	valid:function() {
		return true;
	},

	adaptFrame:function(videoDimensions,frameRect) {
		return frameRect;
	}
});

Class ("paella.LimitedSizeProfileFrameStrategy", paella.ProfileFrameStrategy, {
	adaptFrame:function(videoDimensions,frameRect) {
		if (videoDimensions.width<frameRect.width|| videoDimensions.height<frameRect.height)
		{
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
});

Class ("paella.VideoContainer", paella.VideoContainerBase,{
	containerId:'',
	video1Id:'',
	video2Id:'',
	backgroundId:'',
	container:null,
	profileFrameStrategy:null,

	videoClasses:{
		master:"video masterVideo",
		slave:"video slaveVideo"
	},

	//fitHorizontal:false,
	isHidden:false,
	logos:null,

	overlayContainer:null,
	videoSyncTimeMillis:5000,
	currentMasterVideoRect:{},
	currentSlaveVideoRect:{},


	_maxSyncDelay:0.5,
	_isMonostream:false,

	_videoQualityStrategy:null,

	_sourceData:null,
	_isMasterReady:false,
	_isSlaveReady:false,

	_firstLoad:false,
	_playOnLoad:false,
	_seekToOnLoad:0,
	
	_defaultMasterVolume:1,
	_defaultSlaveVolume:1,
	
	_showPosterFrame:true,
	_currentProfile:null,

	initialize:function(id) {
		this.parent(id);
		var thisClass = this;
		this._sourceData = [];
		this.containerId = id + '_container';
		this.video1Id = id + '_1';
		this.video2Id = id + '_2';
		this.backgroundId = id + '_bkg';
		this.logos = [];
		this._videoQualityStrategy = new paella.VideoQualityStrategy();

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
	},

	setVideoQualityStrategy:function(strategy) {
		this._videoQualityStrategy = strategy;
		if (this.masterVideo()) this.masterVideo().setVideoQualityStrategy(this._videoQualityStrategy);
		if (this.slaveVideo()) slaveVideo.setVideoQualityStrategy(this._videoQualityStrategy);
	},

	setProfileFrameStrategy:function(strategy) {
		this.profileFrameStrategy = strategy;
	},

	getMasterVideoRect:function() {
		return this.currentMasterVideoRect;
	},

	getSlaveVideoRect:function() {
		return this.currentSlaveVideoRect;
	},

	setHidden:function(hidden) {
		this.isHidden = hidden;
	},

	hideVideo:function() {
		this.setHidden(true);
	},

	publishVideo:function() {
		this.setHidden(false);
	},

	syncVideos:function() {
		var This = this;
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		var masterCurrent = 0;
		var slaveCurrent = 0;
		if (!this._isMonostream && masterVideo && slaveVideo) {
			masterVideo.currentTime()
				.then(function(m) {
					masterCurrent = m;
					return slaveVideo.currentTime();
				})

				.then(function(s) {
					slaveCurrent = s;
					var diff = Math.abs(masterCurrent - slaveCurrent);

					if (diff>This._maxSyncDelay) {
						base.log.debug("Sync videos performed, diff=" + diff);
						slaveVideo.setCurrentTime(masterCurrent);
					}
				});
		}
	},

	checkVideoBounds:function(trimming, current, paused, actualDuration) {
		var This = this;
		var start = trimming.start;
		var end = trimming.end;
		var enabled = trimming.enabled;
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
	},

	play:function() {
		var This = this;
		var defer = $.Deferred();
		if (!this._firstLoad) {
			this._firstLoad = true;
		}
		else {
			this._playOnLoad = true;
		}
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();

		if (masterVideo) {
			masterVideo.play()
				.then(function() {
					if (slaveVideo) {
						slaveVideo.play();
					}
					This.parent();
					defer.resolve();
				});
		}
		else {
			defer.reject(new Error("Invalid master video"));
		}

		return defer;
	},

	pause:function() {
		var This = this;
		var defer = $.Deferred();
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) {
			masterVideo.pause()
				.then(function() {
					if (slaveVideo) slaveVideo.pause();
					This.parent();
					defer.resolve();
				});
		}
		else {
			defer.reject(new Error("invalid master video"));
		}

		return defer;
	},

	next:function() {
		if (this._trimming.end!==0) {
			this.setCurrentTime(this._trimming.end);
		}
		else {
			this.duration(true)
				.then(function(d) {
					this.setCurrentTime(d);
				});
		}
		this.parent();
	},

	previous:function() {
		this.setCurrentTime(this._trimming.start);
		this.parent();
	},

	setCurrentTime:function(time) {
		// if (time<=0) time = 1;  Fix #176
		if (this._trimming.enabled) {
			if (time<this._trimming.start) time = this._trimming.start;
			if (time>this._trimming.end) time = this._trimming.end;
		}
		this.masterVideo().setCurrentTime(time);
		if (this.slaveVideo()) this.slaveVideo().setCurrentTime(time);
		this.parent();
	},

	currentTime:function() {
		if (this._trimming.enabled) {
			var trimStart = this._trimming.start;
			var defer = $.Deferred();

			this.masterVideo().currentTime()
				.then(function(t) {
					defer.resolve(t - trimStart);
				});

			return defer;
		}
		else {
			return this.masterVideo().currentTime();
		}
	},

	setPlaybackRate:function(rate) {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) {
			masterVideo.setPlaybackRate(rate);
		}
		if (slaveVideo) {
			slaveVideo.setPlaybackRate(rate);
		}
		this.parent();
	},

	setVolume:function(params) {
		var defer = $.Deferred();
		var This = this;
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		var masterVolume = 0;
		var slaveVolume = 0;

		function setVolumes() {
			if (typeof(params)=='object') {
				masterVolume = params.master!==undefined ? params.master:masterVolume;
				slaveVolume = params.slave!==undefined ? params.slave:slaveVolume;
			}
			else {
				masterVolume = params;
				slaveVolume = 0;
			}
			masterVideo.setVolume(masterVolume);
			if (slaveVideo) slaveVideo.setVolume(slaveVolume);
			paella.events.trigger(paella.events.setVolume,{ master:masterVolume, slave:slaveVolume });
		}

		masterVideo.volume()
			.then(function(v) {
				masterVolume = v;
				return slaveVideo ? slaveVideo.volume():0;
			})

			.then(function (v) {
				slaveVolume = v;
				setVolumes();
				defer.resolve(params);
			});

		return defer;
	},

	volume:function(video) {
		if (!video) {
			return this.masterVideo().volume();
		}
		else if (video=="master" && this.masterVideo()) {
			return this.masterVideo().volume();
		}
		else if (video=="slave" && this.slaveVideo()) {
			return this.slaveVideo().volume();
		}
	},
	
	setDefaultMasterVolume:function(vol) {
		this._defaultMasterVolume = vol;
	},
	
	setDefaultSlaveVolume:function(vol) {
		this._defaultSlaveVolume = vol;
	},

	masterVideo:function() {
		return this.container.getNode(this.video1Id);
	},

	slaveVideo:function() {
		return this.container.getNode(this.video2Id);
	},

	duration:function(ignoreTrimming) {
		var This = this;
		return this.masterVideo().duration()
			.then(function(d) {
				if (This._trimming.enabled && !ignoreTrimming) {
					d = This._trimming.end - This._trimming.start;
				}
				return d;
			});
	},

	paused:function() {
		return this.masterVideo().isPaused();
	},

	trimEnabled:function() {
		return this._trimming.enabled;
	},

	trimStart:function() {
		if (this._trimming.enabled) {
			return this._trimming.start;
		}
		else {
			return 0;
		}
	},

	trimEnd:function() {
		if (this._trimming.enabled) {
			return this._trimming.end;
		}
		else {
			return this.duration();
		}
	},

	getQualities:function() {
		var qualities = [];
		var defer = $.Deferred();

		this.masterVideo().getQualities()
			.then(function(q) {
				defer.resolve(q);
			});

		return defer;
	},

	setQuality:function(index) {
		var masterQualities = [];
		var slaveQualities = [];
		var defer = $.Deferred();
		var This = this;

		function doSetQuality() {
			var masterIndex = index<masterQualities.length ? index:masterQualities.length - 1;
			var slaveIndex = index<slaveQualities.length ? index:slaveQualities.length - 1;
			This.masterVideo().setQuality(masterIndex)
				.then(function() {
					if (This.slaveVideo()) {
						return This.slaveVideo().setQuality(slaveIndex);
					}
					else {
						return paella_DeferredResolved();
					}
				})

				.then(function() {
					paella.events.trigger(paella.events.qualityChanged);
					defer.resolve();
				});
		}

		this.masterVideo().getQualities()
			.then(function(q) {
				masterQualities = q;
				if (This.slaveVideo()) {
					return This.slaveVideo().getQualities();
				}
				else {
					return paella_DeferredResolved();
				}
			})

			.then(function(q) {
				slaveQualities = q || [];
				doSetQuality();
			});


		return defer;
	},

	getCurrentQuality:function() {
		return this.masterVideo().getCurrentQuality();
	},

	setStartTime:function(time) {
		this.seekToTime(time);
	},

	setStreamData:function(videoData) {
		var This = this;
		this._sourceData = videoData;
		var overlayLoader = document.createElement("div");
		overlayLoader.className = "videoLoaderOverlay";
		this.overlayContainer.addElement(overlayLoader,{left:0,top:0,width:1280,height:720});

		var masterRect = videoData.length>1 ? {x:850,y:140,w:360,h:550}:{x:0,y:0,w:1280,h:720};
		var slaveRect = {x:10,y:40,w:800,h:600};
		this._isMonostream = videoData.length==1;
		var masterVideoData = videoData.length>0 ? videoData[0]:{ sources:[] };
		var slaveVideoData = videoData.length>1 ? videoData[1]:{ sources:[] };
		var masterVideo = paella.videoFactory.getVideoObject(this.video1Id,masterVideoData, masterRect);
		var slaveVideo = paella.videoFactory.getVideoObject(this.video2Id,slaveVideoData, slaveRect);

		var autoplay = this.autoplay();
		masterVideo.setAutoplay(autoplay);
		slaveVideo.setAutoplay(autoplay);

		masterVideo.setVideoQualityStrategy(this._videoQualityStrategy);
		slaveVideo.setVideoQualityStrategy(this._videoQualityStrategy);

		this.container.addNode(masterVideo);
		if (videoData.length>1) {
			this.container.addNode(slaveVideo);
		}

		return masterVideo.load()
			.then(function() {
				if (videoData.length>1) {
					return slaveVideo.load();
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
				var slaveVolume =  (config.player.audio && config.player.audio.slave!=undefined) ?
											config.player.audio.slave:0.0;
				masterVideo.setVolume(masterVolume);
				if (videoData.length>1) {
					slaveVideo.setVolume(slaveVolume);
				}

				paella.events.trigger(paella.events.videoReady);

				var getProfile = base.parameters.get('profile');
				var cookieProfile = base.cookies.get('lastProfile');
				if (getProfile) {
					return This.setProfile(getProfile, false);
				}
				else if (cookieProfile) {
					return This.setProfile(cookieProfile, false);
				}
				else {
					return This.setProfile(paella.Profiles.getDefaultProfile(), false);
				}
			});
	},
	
	setAutoplay:function() {
		this._autoplay = true;
		if (this.masterVideo()) {
			this.masterVideo().setAutoplay(true);
		}
		if (this.slaveVideo()) {
			this.slaveVideo().setAutoplay(true);
		}
	},

	autoplay:function() {
		return base.parameters.get('autoplay')=='true' &&
			paella.player.config.experimental &&
			paella.player.config.experimental.autoplay &&
			!base.userAgent.browser.IsMobileVersion;
	},

	numberOfStreams:function() {
		return this._sourceData.length;
	},

	getMonostreamMasterProfile:function() {
		return {
			content:"presenter",
			visible:true,
			layer:1,
			rect:[
				{aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
				{aspectRatio:"4/3",left:160,top:0,width:960,height:720},
			]
		};
	},

	getMonostreamSlaveProfile:function() {
		return {
			content:"slides",
			visible:false,
			layer:0,
			rect:[
				{aspectRatio:"16/9",left:0,top:0,width:0,height:0},
				{aspectRatio:"4/3",left:0,top:0,width:0,height:0},
			]
		};
	},

	getCurrentProfileName:function() {
		return this._currentProfile;
	},

	setProfile:function(profileName,animate) {
		var This = this;
		var defer = $.Deferred();
		animate = base.userAgent.browser.Explorer ? false:animate;
		paella.Profiles.loadProfile(profileName,function(profileData) {
			This._currentProfile = profileName;
			if (This.numberOfStreams()==1) {
				profileData.masterVideo = This.getMonostreamMasterProfile();
				profileData.slaveVideo = This.getMonostreamSlaveProfile();
			}
			This.applyProfileWithJson(profileData,animate);
			base.cookies.set("lastProfile",profileName);
			defer.resolve(profileName);
		});

		return defer;
	},

	hideAllLogos:function() {
		for (var i=0;i<this.logos.length;++i) {
			var logoId = this.logos[i];
			var logo = this.container.getNode(logoId);
			$(logo.domElement).hide();
		}
	},

	showLogos:function(logos) {
		if (logos == undefined) return;
		var relativeSize = new paella.RelativeVideoSize();
		for (var i=0; i<logos.length;++i) {
			var logo = logos[i];
			var logoId = logo.content;
			var logoNode = this.container.getNode(logoId);
			var rect = logo.rect;
			if (!logoNode) {
				style = {};
				logoNode = this.container.addNode(new paella.DomNode('img',logoId,style));
				logoNode.domElement.setAttribute('src', paella.utils.folders.profiles() + '/resources/' + logoId);
				logoNode.domElement.setAttribute('src', paella.utils.folders.profiles() + '/resources/' + logoId);
			}
			else {
				$(logoNode.domElement).show();
			}
			var percentTop = relativeSize.percentVSize(rect.top) + '%';
			var percentLeft = relativeSize.percentWSize(rect.left) + '%';
			var percentWidth = relativeSize.percentWSize(rect.width) + '%';
			var percentHeight = relativeSize.percentVSize(rect.height) + '%';
			var style = {top:percentTop,left:percentLeft,width:percentWidth,height:percentHeight,position:'absolute',zIndex:logo.zIndex};
			$(logoNode.domElement).css(style);
		}
	},
	
	getClosestRect:function(profileData,videoDimensions) {
		var minDiff = 10;
		var re = /([0-9]+)\/([0-9]+)/;
		var result = profileData.rect[0];
		var videoAspectRatio = videoDimensions.h==0 ? 1.333333:videoDimensions.w / videoDimensions.h;
		var profileAspectRatio = 1;
		profileData.rect.forEach(function(rect) {
			if ((reResult = re.exec(rect.aspectRatio))) {
				profileAspectRatio = Number(reResult[1]) / Number(reResult[2]);
			}
			var diff = Math.abs(profileAspectRatio - videoAspectRatio);
			if (minDiff>diff) {
				minDiff = diff;
				result = rect;
			}
		});
		return result;
	},

	applyProfileWithJson:function(profileData,animate) {
		var doApply = function(masterData, slaveData) {
			if (animate==undefined) animate = true;
			var video1 = this.masterVideo();
			var video2 = this.slaveVideo();

			var background = this.container.getNode(this.backgroundId);

			var masterDimensions = masterData.res;
			var slaveDimensions = slaveData && slaveData.res;
			var rectMaster = this.getClosestRect(profileData.masterVideo,masterData.res);
			var rectSlave = slaveData && this.getClosestRect(profileData.slaveVideo,slaveData.res);

			// Logos
			// Hide previous logos
			this.hideAllLogos();

			// Create or show new logos
			this.showLogos(profileData.logos);

			if (dynamic_cast("paella.ProfileFrameStrategy",this.profileFrameStrategy)) {
				var containerSize = { width:$(this.domElement).width(), height:$(this.domElement).height() };
				var scaleFactor = rectMaster.width / containerSize.width;
				var scaledMaster = { width:masterDimensions.w*scaleFactor, height:masterDimensions.h*scaleFactor };
				rectMaster.left = Number(rectMaster.left);
				rectMaster.top = Number(rectMaster.top);
				rectMaster.width = Number(rectMaster.width);
				rectMaster.height = Number(rectMaster.height);
				rectMaster = this.profileFrameStrategy.adaptFrame(scaledMaster,rectMaster);
				if (video2) {
					var scaledSlave = { width:slaveDimensions.w * scaleFactor, height:slaveDimensions.h * scaleFactor };
					rectSlave.left = Number(rectSlave.left);
					rectSlave.top = Number(rectSlave.top);
					rectSlave.width = Number(rectSlave.width);
					rectSlave.height = Number(rectSlave.height);
					rectSlave = this.profileFrameStrategy.adaptFrame(scaledSlave,rectSlave);
				}
			}

			video1.setRect(rectMaster,animate);
			this.currentMasterVideoRect = rectMaster;
			video1.setVisible(profileData.masterVideo.visible,animate);
			this.currentMasterVideoRect.visible = /true/i.test(profileData.masterVideo.visible) ? true:false;
			this.currentMasterVideoRect.layer = parseInt(profileData.masterVideo.layer);
			if (video2) {
				video2.setRect(rectSlave,animate);
				this.currentSlaveVideoRect = rectSlave;
				this.currentSlaveVideoRect.visible = /true/i.test(profileData.slaveVideo.visible) ? true:false;
				this.currentSlaveVideoRect.layer = parseInt(profileData.slaveVideo.layer);
				video2.setVisible(profileData.slaveVideo.visible,animate);
				video2.setLayer(profileData.slaveVideo.layer);
			}
			video1.setLayer(profileData.masterVideo.layer);
			background.setImage(paella.utils.folders.profiles() + '/resources/' + profileData.background.content);
		};
		
		var This = this;
		if (!this.masterVideo()) {
			return;
		}
		else if (!this.slaveVideo()) {		
			this.masterVideo().getVideoData()
				.then(function(data) {
					doApply.apply(This, [ data ]);
				});
		}
		else {
			var masterVideoData = {};		
			this.masterVideo().getVideoData()
				.then(function(data) {
					masterVideoData = data;
					return This.slaveVideo().getVideoData();
				})
				
				.then(function(slaveVideoData) {
					doApply.apply(This, [ masterVideoData, slaveVideoData ]);
				});
		}
	},

	resizePortrail:function() {
		var width = (paella.player.isFullScreen() == true) ? $(window).width() : $(this.domElement).width();
		var relativeSize = new paella.RelativeVideoSize();
		var height = relativeSize.proportionalHeight(width);
		this.container.domElement.style.width = width + 'px';
		this.container.domElement.style.height = height + 'px';

		var containerHeight = (paella.player.isFullScreen() == true) ? $(window).height() : $(this.domElement).height();
		var newTop = containerHeight / 2 - height / 2;
		this.container.domElement.style.top = newTop + "px";
	},

	resizeLandscape:function() {
		var height = (paella.player.isFullScreen() == true) ? $(window).height() : $(this.domElement).height();
		var relativeSize = new paella.RelativeVideoSize();
		var width = relativeSize.proportionalWidth(height);
		this.container.domElement.style.width = width + 'px';
		this.container.domElement.style.height = height + 'px';
		this.container.domElement.style.top = '0px';
	},

	onresize:function() {
		this.parent();
		var relativeSize = new paella.RelativeVideoSize();
		var aspectRatio = relativeSize.aspectRatio();
		var width = (paella.player.isFullScreen() == true) ? $(window).width() : $(this.domElement).width();
		var height = (paella.player.isFullScreen() == true) ? $(window).height() : $(this.domElement).height();
		var containerAspectRatio = width/height;

		if (containerAspectRatio>aspectRatio) {
			this.resizeLandscape();
		}
		else {
			this.resizePortrail();
		}
	}
});
