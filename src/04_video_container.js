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
		var textElem = document.createElement('div0');
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
	trimming:{enabled:false,start:0,end:0},
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
			if (paella.player.videoContainer.paused()) {
				paella.player.play();
			}
			else {
				paella.player.pause();
			}
			self.firstClick = true;
		});
		this.domElement.addEventListener("touchstart",function(event) {
			if (paella.player.controls) {
				paella.player.controls.restartHideTimer();
			}
		});
	},

	triggerTimeupdate:function() {
		var thisClass = this;
		if (!this.paused() || thisClass._force) {
			paella.events.trigger(paella.events.timeupdate,{videoContainer:thisClass, currentTime:thisClass.currentTime() });
			thisClass._force = false;
		}
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
		var thisClass = this;
		this.setCurrentTime(time);
		thisClass._force = true;
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
		return 0;
	},

	trimEnd:function() {
		return this.duration();
	},

	trimEnabled:function() {
		return false;
	},

	enableTrimming:function() {
		this.trimming.enabled = true;
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this.trimming.enabled,trimStart:this.trimming.start,trimEnd:this.trimming.end});
	},

	disableTrimming:function() {
		this.trimming.enabled = false;
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this.trimming.enabled,trimStart:this.trimming.start,trimEnd:this.trimming.end});
	},

	setTrimming:function(start,end) {
		this.trimming.start = start;
		this.trimming.end = end;
		if (this.currentTime()<this.trimming.start) {
			this.setCurrentTime(this.trimming.start);
		}
		if (this.currentTime()>this.trimming.end) {
			this.setCurrentTime(this.trimming.end);
		}
		paella.events.trigger(paella.events.setTrim,{trimEnabled:this.trimming.enabled,trimStart:this.trimming.start,trimEnd:this.trimming.end});
	},

	setTrimmingStart:function(start) {
		this.setTrimming(start,this.trimming.end);
	},

	setTrimmingEnd:function(end) {
		this.setTrimming(this.trimming.start,end);
	},

	setCurrentPercent:function(percent) {
		var start = this.trimStart();
		var end = this.trimEnd();
		var duration = end - start;
		var trimedPosition = percent * duration / 100;
		var realPosition = parseFloat(trimedPosition) + parseFloat(start);
		this.setCurrentTime(realPosition);
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
		if (videoDimensions.width<frameRect.width || videoDimensions.height<frameRect.height) {
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
	maxSyncDelay:0.5,
	logos:null,
	isMasterReady:false,
	isSlaveReady:false,
	isMonostream:false,

	overlayContainer:null,
	videoSyncTimeMillis:5000,
	currentMasterVideoRect:{},
	currentSlaveVideoRect:{},


	_sourceData:null,

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

		this.container = new paella.DomNode('div',this.containerId,{position:'relative',display:'block',marginLeft:'auto',marginRight:'auto',width:'1024px',height:'567px'});
		this.container.domElement.setAttribute('role','main');
		this.addNode(this.container);

		this.overlayContainer = new paella.VideoOverlay(this.domElement);
		this.container.addNode(this.overlayContainer);

		this.container.addNode(new paella.BackgroundContainer(this.backgroundId, paella.utils.folders.profiles() + '/resources/default_background_paella.jpg'));

		Object.defineProperty(this,'sourceData',{
			get: function() { return this._sourceData; }
		});

		paella.events.bind(paella.events.timeupdate,function(event) { thisClass.checkVideoTrimming(); } );

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
	},
	
	setVideoQualityStrategy:function(strategy) {
		this._videoQualityStrategy = strategy;
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
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (!this.isMonostream && masterVideo && slaveVideo && masterVideo.currentTime && slaveVideo.currentTime) {
			var diff = Math.abs(masterVideo.currentTime() - slaveVideo.currentTime());

			if (diff>this.maxSyncDelay) {
				base.log.debug("Sync videos performed, diff=" + diff);
				slaveVideo.setCurrentTime(masterVideo.currentTime());
			}
		}
	},

	checkVideoTrimming:function() {
		var current = this.currentTime();
		var end = this.duration();
		var start = 0;
		if (this.trimming.enabled) {
			end = this.trimming.end;
			start = parseFloat(this.trimming.start);
		}
		if (current>=Math.floor(end) && !this.paused()) {
			var thisClass = this;
			paella.events.trigger(paella.events.endVideo,{videoContainer:thisClass});
			this.pause();
		}
		else if (current<start) {
			this.setCurrentTime(start + 1);
		}
	},

	play:function() {
		if (!this._firstLoad) {
			this._firstLoad = true;
		}
		else {
			this._playOnLoad = true;
		}
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) {
			masterVideo.play();
		}
		if (slaveVideo) {
			slaveVideo.play();
		}
		this.parent();
	},

	pause:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.pause();
		if (slaveVideo) slaveVideo.pause();
		this.parent();
	},

	next:function() {
		if (this.trimming.end!==0) {
			this.setCurrentTime(this.trimming.end);
		}
		else {
			this.setCurrentTime(this.duration(true));
		}
		this.parent();
	},

	previous:function() {
		this.setCurrentTime(this.trimming.start);
		this.parent();
	},

	setCurrentTime:function(time) {
		if (time<=0) time = 1; 
		if (this.trimming.enabled) {
			if (time<this.trimming.start) time = this.trimming.start;
			if (time>this.trimming.end) time = this.trimming.end;
		}
		masterVideo.setCurrentTime(time);
		this.parent();
	},

	currentTime:function() {
		return this.masterVideo().currentTime();
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
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		var masterVolume = masterVideo && masterVideo.volume();
		var slaveVolume = slaveVideo && slaveVideo.volume();
		if (typeof(params)=='object') {
			masterVolume = params.master!==undefined ? params.master:masterVolume;
			slaveVolume = params.slave!==undefined ? params.slave:slaveVolume;
		}
		else {
			masterVolume = params;
			slaveVolume = 0;
		}

		if (masterVideo) {
			masterVideo.setVolume(masterVolume);
		}
		if (slaveVideo) {
			slaveVideo.setVolume(slaveVolume);
		}

		paella.events.trigger(paella.events.setVolume,{ master:masterVolume, slave:slaveVolume });

		this.parent();
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
		return this.masterVideo().duration()
			.then(function(d) {
				if (this.trimming.enabled && !ignoreTrimming) {
					d = this.trimming.end - this.trimming.start;
				}
				return d;
			});
	},

	paused:function() {
		// CAUTION: This function returns a promise
		return this.masterVideo().isPaused();
	},

	trimEnabled:function() {
		return this.trimming.enabled;
	},

	trimStart:function() {
		if (this.trimming.enabled) {
			return this.trimming.start;
		}
		else {
			return 0;
		}
	},

	trimEnd:function() {
		if (this.trimming.enabled) {
			return this.trimming.end;
		}
		else {
			return this.duration();
		}
	},

	setMasterQuality:function(quality) {
		this._masterQuality = quality;
	},
	
	setSlaveQuality:function(quality) {
		this._slaveQuality = quality;		
	},

	setStartTime:function(time) {
//		this._startTime = time;
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
		var masterVideoData = videoData.length>0 ? videoData[0]:{ sources:[] };
		var slaveVideoData = videoData.length>1 ? videoData[1]:{ sources:[] };
		var masterVideo = paella.videoFactory.getVideoObject(this.video1Id,masterVideoData, masterRect);
		var slaveVideo = paella.videoFactory.getVideoObject(this.video2Id,slaveVideoData, slaveRect);

		var autoplay = base.parameters.get('autoplay')=='true' &&
			paella.player.config.experimental &&
			paella.player.config.experimental.autoplay &&
			!base.userAgent.browser.IsMobileVersion;
		masterVideo.setAutoplay(autoplay);
		slaveVideo.setAutoplay(autoplay);

		this.container.addNode(masterVideo);
		if (videoData.length>1) {
			this.container.addNode(slaveVideo);
		}

		return masterVideo.load()
			.done(function() {
				return slaveVideo.load();
			})
			.done(function() {
				This.overlayContainer.removeElement(overlayLoader);

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
		var defer = $.Deferred();
		var This = this;
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

	isReady:function() {
		return this.isMasterReady && this.isSlaveReady;
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

	applyProfileWithJson:function(profileData,animate) {
		if (animate==undefined) animate = true;
		var video1 = this.container.getNode(this.video1Id);
		var video2 = this.container.getNode(this.video2Id);
		if (!video1) return;	// The video is not loaded

		var background = this.container.getNode(this.backgroundId);

		var rectMaster = profileData.masterVideo.rect[0];
		var rectSlave = profileData.slaveVideo.rect[0];
		var masterDimensions = video1.getDimensions();
		var slaveDimensions = {width:360,height:240};
		if (video2) slaveDimensions = video2.getDimensions();
		var masterAspectRatio = (masterDimensions.height==0) ? 1.3333:masterDimensions.width / masterDimensions.height;
		var slaveAspectRatio = (slaveDimensions.height==0) ? 1.3333:slaveDimensions.width / slaveDimensions.height;
		var profileMasterAspectRatio = 1.333;
		var profileSlaveAspectRatio = 1.333;

		var minMasterDiff = 10;
		for (var i = 0; i<profileData.masterVideo.rect.length;++i) {
			var profileMaster = profileData.masterVideo.rect[i];
			if (/([0-9]+)\/([0-9]+)/.test(profileMaster.aspectRatio)) {
				profileMasterAspectRatio = Number(RegExp.$1) / Number(RegExp.$2);
			}
			var masterDiff = Math.abs(profileMasterAspectRatio - masterAspectRatio);
			if (minMasterDiff>masterDiff) {
				minMasterDiff = masterDiff;
				rectMaster = profileMaster;
			}
			//base.log.debug(profileMasterAspectRatio + ' - ' + masterAspectRatio + ' = ' + masterDiff);
		}

		var minSlaveDiff = 10;
		for (i = 0; i<profileData.slaveVideo.rect.length;++i) {
			var profileSlave = profileData.slaveVideo.rect[i];
			if (/([0-9]+)\/([0-9]+)/.test(profileSlave.aspectRatio)) {
				profileSlaveAspectRatio = Number(RegExp.$1) / Number(RegExp.$2);
			}
			var slaveDiff = Math.abs(profileSlaveAspectRatio - slaveAspectRatio);
			if (minSlaveDiff>slaveDiff) {
				minSlaveDiff = slaveDiff;
				rectSlave = profileSlave;
			}
		}

		// Logos
		// Hide previous logos
		this.hideAllLogos();

		// Create or show new logos
		this.showLogos(profileData.logos);

		if (dynamic_cast("paella.ProfileFrameStrategy",this.profileFrameStrategy)) {
			var containerSize = { width:$(this.domElement).width(), height:$(this.domElement).height() };
			var scaleFactor = rectMaster.width / containerSize.width;
			var scaledMaster = { width:masterDimensions.width*scaleFactor, height:masterDimensions.height*scaleFactor };
			rectMaster.left = Number(rectMaster.left);
			rectMaster.top = Number(rectMaster.top);
			rectMaster.width = Number(rectMaster.width);
			rectMaster.height = Number(rectMaster.height);
			rectMaster = this.profileFrameStrategy.adaptFrame(scaledMaster,rectMaster);
			if (video2) {
				var scaledSlave = { width:slaveDimensions.width * scaleFactor, height:slaveDimensions.height * scaleFactor };
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
