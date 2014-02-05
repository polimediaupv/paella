paella.BackgroundContainer = Class.create(paella.DomNode,{
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

paella.VideoOverlay = Class.create(paella.DomNode,{
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
		return paella.player.videoContainer.getSlaveVideoRect()
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
		this.domElement.removeChild(element);
	},
	
	getVSize:function(px) {
		return px*100/this.size.h;
	},
	
	getHSize:function(px) {
		return px*100/this.size.w;
	}
});

paella.VideoContainerBase = Class.create(paella.DomNode,{
	trimming:{enabled:false,start:0,end:0},
	timeupdateEventTimer:null,
	timeupdateInterval:250,
	masterVideoData:null,
	slaveVideoData:null,
	currentMasterVideoData:null,
	currentSlaveVideoData:null,

	initialize:function(id) {
		var style = {position:'absolute',left:'0px',right:'0px',top:'0px',bottom:'0px',overflow:'hidden'}
		this.parent('div',id,style);		
	},
	
	initEvents:function() {
		var thisClass = this;
		paella.events.bind(paella.events.play,function(event) { thisClass.play(); thisClass.startTimeupdate(); });
		paella.events.bind(paella.events.pause,function(event) { thisClass.pause(); thisClass.stopTimeupdate(); });
		paella.events.bind(paella.events.next,function(event) { thisClass.next(); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.previous,function(event) { thisClass.previous(); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.seekTo,function(event,params) { thisClass.setCurrentPercent(params.newPositionPercent); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.seekToTime,function(event,params) { thisClass.setCurrentTime(params.time); thisClass.triggerTimeupdate(); });
		paella.events.bind(paella.events.setPlaybackRate,function(event,params) { thisClass.setPlaybackRate(params); });
		paella.events.bind(paella.events.setVolume,function(event,params) { thisClass.setVolume(params); });
		paella.events.bind(paella.events.setTrim,function(event,params) { thisClass.setTrim});
	},
	
	triggerTimeupdate:function() {
		var thisClass = this;
		paella.events.trigger(paella.events.timeupdate,{videoContainer:thisClass, currentTime:thisClass.currentTime() });
	},
	
	startTimeupdate:function() {
		var thisClass = this;
		this.timeupdateEventTimer = new Timer(function(timer) {
			thisClass.triggerTimeupdate();
		},this.timeupdateInterval);
		this.timeupdateEventTimer.repeat = true;
	},
	
	stopTimeupdate:function() {
		this.timeupdateEventTimer.repeat = false;
		this.timeupdateEventTimer = null;
	},

	play:function() {
		paella.debug.log('VideoContainerBase.play()');
	},
	
	pause:function() {
		paella.debug.log('VideoContainerBase.pause()');
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
		paella.debug.log("VideoContainerBase.setCurrentTime(" +  time + ")");
	},
	
	currentTime:function() {
		paella.debug.log("VideoContainerBase.currentTime()");
		return 0;
	},
	
	duration:function() {
		paella.debug.log("VideoContainerBase.duration()");
		return 0
	},
	
	paused:function() {
		paella.debug.log("VideoContainerBase.paused()");
		return true;
	},
	
	setupVideo:function(onSuccess) {
		paella.debug.log("VideoContainerBase.setupVide()");
	},
	
	setPlaybackRate:function(params) {
		paella.debug.log("VideoContainerBase.setPlaybackBase(" + params.rate + ")");
	},
	
	setVolume:function(params) {
		paella.debug.log("VideoContainerBase.setVolume(" + params.master + ")");
	},
	
	volume:function() {
		paella.debug.log("VideoContainerBase.volume()");
		return 1;
	},
	
	isReady:function() {
		paella.debug.log("VideoContainerBase.isReady()");
		return true;
	},

	onresize:function() { this.parent(onresize);
	}
});

paella.VideoContainer = Class.create(paella.VideoContainerBase,{
	containerId:'',
	video1Id:'',
	video2Id:'',
	backgroundId:'',
	container:null,
	video1ClassName:'video masterVideo',
	video2ClassName:'video slaveVideo',
	//fitHorizontal:false,
	isHidden:false,
	maxSyncDelay:0.5,
	logos:null,
	isMasterReady:false,
	isSlaveReady:false,
	isMonostream:false,
	sourceData:[],
	overlayContainer:null,
	videoSyncTimeMillis:5000,
	currentMasterVideoRect:{},
	currentSlaveVideoRect:{},

	initialize:function(id) {
		this.parent(id);
		var thisClass = this;
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
	
		var overlayLoader = document.createElement("div");
		overlayLoader.className = "videoLoaderOverlay";
		this.overlayContainer.addElement(overlayLoader,{left:0,top:0,width:1280,height:720});
		//this.overlayContainer.addText("Loading",{left:0,top:0,width:1280,height:720},true);
		paella.events.bind(paella.events.loadComplete,function() { thisClass.overlayContainer.clear(); });
		
		this.container.addNode(new paella.BackgroundContainer(this.backgroundId,'config/profiles/resources/default_background_paella.jpg'));
	
		this.initEvents();
		paella.events.bind(paella.events.timeupdate,function(event) { thisClass.checkVideoTrimming(); } );
		
		var thisClass = this;
		var timer = new paella.utils.Timer(function(timer) {
			thisClass.syncVideos();
		},thisClass.videoSyncTimeMillis);
		timer.repeat = true;
	},
	
	getMasterVideoRect:function() {
		return this.currentMasterVideoRect;
	},
	
	getSlaveVideoRect:function() {
		return this.currentSlaveVideoRect;
	},
	
	createVideoPlayers:function() {
		var masterVideo = new paella.FlashVideo(this.video1Id,850,140,360,550);
		masterVideo.setClassName(this.video1ClassName);
		this.container.addNode(masterVideo);
		
		var slaveVideo = new paella.FlashVideo(this.video2Id,10,40,800,600);
		slaveVideo.setClassName(this.video2ClassName);
		slaveVideo.setVolume(0);
		this.container.addNode(slaveVideo);
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
				paella.debug.log("Sync videos performed, diff=" + diff);
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
		if (current>=Math.floor(end)) {
			var thisClass = this;
			paella.events.trigger(paella.events.endVideo,{videoContainer:thisClass});
			this.pause();
		}
		else if (current<start) {
			this.setCurrentTime(start + 1);
		}
	},
	
	play:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.play();
		if (slaveVideo) slaveVideo.play();
	},
	
	pause:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.pause();
		if (slaveVideo) slaveVideo.pause();
	},
	
	next:function() {
		if (this.trimming.end!=0) {
			this.setCurrentTime(this.trimming.end);			
		}
		else {
			this.setCurrentTime(this.duration(true));
		}
	},
	
	previous:function() {
		this.setCurrentTime(this.trimming.start);
	},

	setCurrentTime:function(time) {
		if (this.trimming.enabled) {
			if (time<this.trimming.start) time = this.trimming.start;
			if (time>this.trimming.end) time = this.trimming.end;
		}
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) masterVideo.setCurrentTime(time);
		if (slaveVideo) slaveVideo.setCurrentTime(time);
	},
	
	currentTime:function() {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) return masterVideo.currentTime();
		else if (slaveVideo) return slaveVideo.currentTime();
		else return 0;
	},
	
	setPlaybackRate:function(params) {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo) {
			masterVideo.setPlaybackRate(params.rate);
		}
		if (slaveVideo) {
			slaveVideo.setPlaybackRate(params.rate);
		}
	},
	
	setVolume:function(params) {
		var masterVideo = this.masterVideo();
		var slaveVideo = this.slaveVideo();
		if (masterVideo && params.master) {
			masterVideo.setVolume(params.master);
		}
		else if (masterVideo) {
			masterVideo.setVolume(0);
		}
		if (slaveVideo && params.slave) {
			slaveVideo.setVolume(params.slave);
		}
		else if (slaveVideo) {
			slaveVideo.setVolume(0);
		}
	},
	
	volume:function(video) {
		if (!video && this.masterVideo()) {
			return this.masterVideo().volume();
		}
		else if (video=="master" && this.masterVideo()) {
			return this.masterVideo().volume();
		}
		else if (video=="slave" && this.slaveVideo()) {
			return this.slaveVideo().volume();
		}
		else {
			return 0;
		}
	},

	masterVideo:function() {
		return this.container.getNode(this.video1Id);
	},
	
	slaveVideo:function() {
		return this.container.getNode(this.video2Id);
	},
	
	duration:function(ignoreTrimming) {
		if (this.trimming.enabled && !ignoreTrimming) {
			return this.trimming.end - this.trimming.start;
		}
		else {
			if (!this.videoDuration) {
				this.videoDuration = this.masterVideo().duration();
			}
			return this.videoDuration;
		}
	},
	
	paused:function() {
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
	
	setMasterSource:function(masterVideoData,type) {
		if (type=='html') {
			var masterVideo = new paella.Html5Video(this.video1Id,850,140,360,550);
		}
		else if (type=='flash') {
			var masterVideo = new paella.FlashVideo(this.video1Id,850,140,360,550);
			masterVideo.streamingMode = false;
		}
		else if (type=='streaming') {
			var masterVideo = new paella.FlashVideo(this.video1Id,850,140,360,550);
			masterVideo.streamingMode = true;
		}
		else if (type=='image') {
			var masterVideo = new paella.SlideshowVideo(this.video1Id,850,140,360,550);
		}
		masterVideo.setClassName(this.video1ClassName);
		this.container.addNode(masterVideo);
		
		var thisClass = this;
		this.sourceData.push(masterVideoData);
		this.setupVideo(masterVideo,masterVideoData,type,'master');
		this.masterVideoData = masterVideoData;
		new Timer(function(timer) {
			if (masterVideo.isReady()) {
				thisClass.isMasterReady = true;
				timer.repeat = false;
			}
			else {
				timer.repeat = true;
			}
		},100);
		
		// TODO: Return false on video player error
		return true;
	},
	
	setSlaveSource:function(slaveVideoData,type) {
		if (type=='html' || !slaveVideoData) {
			var slaveVideo = new paella.Html5Video(this.video2Id,10,40,800,600);
		}
		else if (type=='flash') {
			var slaveVideo = new paella.FlashVideo(this.video2Id,10,40,800,600);
			slaveVideo.streamingMode = false;
		}
		else if (type=='streaming') {
			var slaveVideo = new paella.FlashVideo(this.video2Id,10,40,800,600);
			slaveVideo.streamingMode = true;
		}
		else if (type=='image') {
			var slaveVideo = new paella.SlideshowVideo(this.video2Id,850,140,360,550);
		}
		slaveVideo.setClassName(this.video2ClassName);
		this.container.addNode(slaveVideo);
		
		if (!slaveVideoData) {
			setMonoStreamMode();
			return false;
		}
		
		var thisClass = this;
		this.sourceData.push(slaveVideoData);
		this.setupVideo(slaveVideo,slaveVideoData,type,'slave');
		this.slaveVideoData = slaveVideoData;
		new Timer(function(timer) {
			if (slaveVideo.isReady()) {
				thisClass.isSlaveReady = true;
				slaveVideo.setVolume(0);
				timer.repeat = false;
			}
			else {
				timer.repeat = true;
			}
		},100);
		
		// TODO: Return false on video player error
		return true;
	},

	setMonoStreamMode:function() {
		this.isMonoStream = true;
		this.isSlaveReady = true;
	},

	getVideoQuality:function(source,stream) {
		if (source.length>0) {
			var query = paella.utils.parameters.list['res' + stream];
			var selected = source[0];
			var win_w = $(window).width();
			var win_h = $(window).height();
			var win_res = (win_w * win_h);
			var selected_res = parseInt(selected.res.w) * parseInt(selected.res.h);
			var selected_diff = Math.abs(win_res - selected_res);
			
			for (var i=0; i<source.length; ++i) {
				var res = source[i].res;
				if (res) {
					if (query != undefined) {
						res = res.w + "x" + res.h;
						if (res==query) {
							 selected = source[i];
							break;
						}
					}
					else{
						var m_res = parseInt(source[i].res.w) * parseInt(source[i].res.h);
						var m_diff = Math.abs(win_res - m_res);
				
						if (m_diff < selected_diff){
							selected_diff = m_diff;
							selected = source[i];
						}
				
				
					}
				}
			}
			return selected;
		}
		else {
			return source;
		}
	},

	setupVideo:function(videoNode,videoData,type,stream) {
		if (videoNode && videoData) {
			var mp4Source = videoData.sources.mp4;
			var oggSource = videoData.sources.ogg;
			var webmSource = videoData.sources.webm;
			var flvSource = videoData.sources.flv;
			var rtmpSource = videoData.sources.rtmp;
			var imageSource = videoData.sources.image;
			
			var selectedSource = null;
			
			if (type=="html") {
				if (mp4Source) {
					selectedSource = mp4Source;
				}
				if (oggSource) {
					selectedSource = oggSource;
				}
				if (webmSource) {
					selectedSource = webmSource;
				}
			}
			else if (flvSource && type=="flash") {
				selectedSource = flvSource;
			}
			else if (mp4Source && type=="flash") {
				selectedSource = mp4Source;
			}
			else if (rtmpSource && type=="streaming"){
				selectedSource = rtmpSource;
			}
			else if (imageSource && type=="image") {
				selectedSource = imageSource;
			}
			
			selectedSource = this.getVideoQuality(selectedSource,stream);
			if (stream=='master') this.currentMasterVideoData = selectedSource;
			else if (stream=='slave') this.currentSlaveVideoData = selectedSource;
			videoNode.addSource(selectedSource);
		}
	},
	
	numberOfStreams:function() {
		return this.sourceData.length;
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
		}
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
		}
	},

	setProfile:function(profileName,onSuccess) {
		var thisClass = this;
		paella.Profiles.loadProfile(profileName,function(profileData) {
			if (thisClass.numberOfStreams()==1) {
				profileData.masterVideo = thisClass.getMonostreamMasterProfile();
				profileData.slaveVideo = thisClass.getMonostreamSlaveProfile();
			}
			thisClass.applyProfileWithJson(profileData);
			onSuccess(profileName);
			paella.utils.cookies.set("lastProfile",profileName);
		});
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
		var relativeSize = new paella.RelativeVideoSize();
		for (var i=0; i<logos.length;++i) {
			var logo = logos[i];
			var logoId = logo.content;
			var logoNode = this.container.getNode(logoId);
			var rect = logo.rect;
			if (!logoNode) {
				style = {};
				logoNode = this.container.addNode(new paella.DomNode('img',logoId,style));
				logoNode.domElement.setAttribute('src','config/profiles/resources/' + logoId);
				logoNode.domElement.setAttribute('src','config/profiles/resources/' + logoId);
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

	applyProfileWithJson:function(profileData) {
		var video1 = this.container.getNode(this.video1Id);
		var video2 = this.container.getNode(this.video2Id);

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
			//paella.debug.log(profileMasterAspectRatio + ' - ' + masterAspectRatio + ' = ' + masterDiff);
		}
		
		var minSlaveDiff = 10;
		for (var i = 0; i<profileData.slaveVideo.rect.length;++i) {
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

		video1.setRect(rectMaster,true);
		this.currentMasterVideoRect = rectMaster;
		video1.setVisible(profileData.masterVideo.visible,true);
		if (video2) {
			video2.setRect(rectSlave,true);
			this.currentSlaveVideoRect = rectSlave;
			video2.setVisible(profileData.slaveVideo.visible,true);
			video2.setLayer(profileData.slaveVideo.layer);
		}
		video1.setLayer(profileData.masterVideo.layer);
		background.setImage('config/profiles/resources/' + profileData.background.content);
	},

	resizePortrail:function() {
		var width = $(this.domElement).width();
		var relativeSize = new paella.RelativeVideoSize();
		var height = relativeSize.proportionalHeight(width);
		this.container.domElement.style.width = width + 'px';
		this.container.domElement.style.height = height + 'px';
		
		var containerHeight = $(this.domElement).height();
		var newTop = containerHeight / 2 - height / 2;
		this.container.domElement.style.top = newTop + "px";
	},
	
	resizeLandscape:function() {
		var height = $(this.domElement).height();
		var relativeSize = new paella.RelativeVideoSize();
		var width = relativeSize.proportionalWidth(height);
		this.container.domElement.style.width = width + 'px';
		this.container.domElement.style.height = height + 'px';
		this.container.domElement.style.top = '0px';
	},

	onresize:function() { this.parent();
		var relativeSize = new paella.RelativeVideoSize();
		var aspectRatio = relativeSize.aspectRatio();
		var width = $(this.domElement).width();
		var height = $(this.domElement).height();
		var containerAspectRatio = width/height;
		
		if (containerAspectRatio>aspectRatio) {
			this.resizeLandscape();
		}
		else {
			this.resizePortrail();
		}
	}
});

