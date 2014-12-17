Class ("paella.PaellaPlayer", paella.PlayerBase,{
	player:null,

	selectedProfile:'',
	videoIdentifier:'',
	editor:null,
	loader:null,

	// Video data:
	videoData:null,

	getPlayerMode: function() {	
		if (paella.player.isFullScreen()) {
			return paella.PaellaPlayer.mode.fullscreen;
		}
		else if (window.self !== window.top) {
			return paella.PaellaPlayer.mode.embed;
		}
		else if (paella.extended) {
			return paella.PaellaPlayer.mode.extended;			
		}

		return paella.PaellaPlayer.mode.standard;
	},


	checkFullScreenCapability: function() {
		var fs = document.getElementById(paella.player.mainContainer.id);
		if ((fs.webkitRequestFullScreen) || (fs.mozRequestFullScreen) || (fs.msRequestFullscreen) || (fs.requestFullScreen)) {
			return true;
		}
		if (base.userAgent.browser.IsMobileVersion && paella.player.videoContainer.isMonostream) {
			return true;
		}		
		return false;
	},

	addFullScreenListeners : function() {
		var thisClass = this;
		
		var onFullScreenChangeEvent = function() {
			paella.pluginManager.checkPluginsVisibility();
			var fs = document.getElementById(paella.player.mainContainer.id);
			
			if (paella.player.isFullScreen()) {				
				fs.style.width = '100%';
				fs.style.height = '100%';
			}
			else {
				fs.style.width = '';
				fs.style.height = '';
			}
			
			if (thisClass.isFullScreen()) {
				paella.events.trigger(paella.events.enterFullscreen);				
			}
			else{
				paella.events.trigger(paella.events.exitFullscreen);
			}			
		};
	
		if (!this.eventFullScreenListenerAdded) {
			this.eventFullScreenListenerAdded = true;
			document.addEventListener("fullscreenchange", onFullScreenChangeEvent, false);
			document.addEventListener("webkitfullscreenchange", onFullScreenChangeEvent, false);
			document.addEventListener("mozfullscreenchange", onFullScreenChangeEvent, false);	
			document.addEventListener("MSFullscreenChange", onFullScreenChangeEvent, false);
		}		
	},

	isFullScreen: function() {
		var webKitIsFullScreen = (document.webkitIsFullScreen === true);
		var msIsFullScreen = (document.msFullscreenElement !== undefined && document.msFullscreenElement !== null);
		var mozIsFullScreen = (document.mozFullScreen === true);
		var stdIsFullScreen = (document.fullScreenElement !== undefined && document.fullScreenElement !== null);
		
		return (webKitIsFullScreen || msIsFullScreen || mozIsFullScreen || stdIsFullScreen);

	},
	goFullScreen: function() {
		this.addFullScreenListeners();
		if (!this.isFullScreen()) {
			if (base.userAgent.browser.IsMobileVersion && paella.player.videoContainer.isMonostream) {
				var video = paella.player.videoContainer.masterVideo().domElement;
				if (video.webkitSupportsFullscreen) {					
					video.webkitEnterFullscreen();
				}
			}
			else {			
				var fs = document.getElementById(paella.player.mainContainer.id);		
				if (fs.webkitRequestFullScreen) {			
					fs.webkitRequestFullScreen();
				}
				else if (fs.mozRequestFullScreen){
					fs.mozRequestFullScreen();
				}
				else if (fs.msRequestFullscreen) {
					fs.msRequestFullscreen();
				}
				else if (fs.requestFullScreen) {
					fs.requestFullScreen();
				}
			}
		}
	},
	
	exitFullScreen: function() {
		this.addFullScreenListeners();	
		if (this.isFullScreen()) {			
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.msExitFullscreen()) {
				document.msExitFullscreen();
			}
			else if (document.cancelFullScreen) {
				document.cancelFullScreen();
			}								
		}		
	},


	setProfile:function(profileName,animate) {
		var thisClass = this;
		this.videoContainer.setProfile(profileName,function(newProfileName) {
			thisClass.selectedProfile = newProfileName;
		},animate);
	},

	initialize:function(playerId) {
		this.parent(playerId);

		// if initialization ok
		if (this.playerId==playerId) {
			this.loadPaellaPlayer();
			var thisClass = this;
			paella.events.bind(paella.events.setProfile,function(event,params) {
				thisClass.setProfile(params.profileName);
			});
		}
	},

	loadPaellaPlayer:function() {
		var thisClass = this;
		this.loader = new paella.LoaderContainer('paellaPlayer_loader');
		$('body')[0].appendChild(this.loader.domElement);
		paella.events.trigger(paella.events.loadStarted);

		paella.initDelegate.loadDictionary(function() {
			var minFirefoxVersion = base.userAgent.system.MacOS ? 35:(base.userAgent.system.Windows) ? 25:26;
			if (base.userAgent.browser.Firefox && base.userAgent.browser.Version.major<minFirefoxVersion) {
				message = "You are using Firefox version, and some required video playback capabilities are not available until Firefox min_version. Please, update your browser and try again.";
				message = base.dictionary.translate(message);
				message = message.replace("version",base.userAgent.browser.Version.major);
				message = message.replace("min_version",minFirefoxVersion);
				paella.messageBox.showError(message);
				return false;
			}
			paella.initDelegate.loadConfig(function(config) {
				var skin = (config.skin && config.skin.default) ? config.skin.default:'dark';
				paella.utils.skin.restore(skin);
				thisClass.onLoadConfig(config);
			});
		});
	},

	onLoadConfig:function(configData) {
		paella.data = new paella.Data(configData);

		this.config = configData;
		this.videoIdentifier = paella.initDelegate.getId();

		if (this.videoIdentifier) {
			if (this.mainContainer) {
				this.videoContainer = new paella.VideoContainer(this.playerId + "_videoContainer");
				this.mainContainer.appendChild(this.videoContainer.domElement);
			}
			$(window).resize(function(event) { paella.player.onresize(); });
			this.onload();
		}
	},

	onload:function() {
		var thisClass = this;
		this.accessControl.checkAccess(function(permissions) {
			var errorMessage;
			if (!permissions.loadError) {
				base.log.debug("read:" + permissions.canRead + ", contribute:" + permissions.canContribute + ", write:" + permissions.canWrite);
				if (permissions.canWrite) {
					//thisClass.setupEditor();
					paella.events.bind(paella.events.showEditor,function(event) { thisClass.showEditor(); });
					paella.events.bind(paella.events.hideEditor,function(event) { thisClass.hideEditor(); });
				}
				if (permissions.canRead) {
					thisClass.loadVideo();
					thisClass.videoContainer.publishVideo();
				}
				else {
					thisClass.unloadAll(base.dictionary.translate("You are not authorized to view this resource"));
				}
			}
			else if (permissions.isAnonymous) {
				errorMessage = base.dictionary.translate("You are not logged in");
				thisClass.unloadAll(errorMessage);
				paella.events.trigger(paella.events.error,{error:errorMessage});
			}
			else {
				errorMessage = base.dictionary.translate("You are not authorized to view this resource");
				thisClass.unloadAll(errorMessage);
				paella.events.trigger(paella.events.error,{error:errorMessage});
			}
		});
	},

	initVideoEvents:function() {
		var thisClass = this;
		paella.events.bind(paella.events.play,function(event) { thisClass.play(); });
		paella.events.bind(paella.events.pause,function(event) { thisClass.pause(); });
		paella.events.bind(paella.events.seekTo,function(event,params) { paella.player.videoContainer.seekTo(params.newPositionPercent); });
		paella.events.bind(paella.events.seekToTime,function(event,params) { paella.player.videoContainer.seekToTime(params.time); });
		paella.events.bind(paella.events.setPlaybackRate,function(event,params) { paella.player.videoContainer.setPlaybackRate(params); });
		paella.events.bind(paella.events.setVolume,function(event,params) { paella.player.videoContainer.setVolume(params); });
		paella.events.bind(paella.events.setTrim,function(event,params) {
			if (params.trimEnabled)
				paella.player.videoContainer.enableTrimming();
			else
				paella.player.videoContainer.disableTrimming();
			paella.player.videoContainer.setTrimming(params.trimStart, params.trimEnd);
		});
	},

	onresize:function() {		
		this.videoContainer.onresize();
		if (this.controls) this.controls.onresize();
		if (this.editor) {
			this.editor.resize();
		}

		// Resize the layout profile
		var cookieProfile = paella.utils.cookies.get('lastProfile');
		if (cookieProfile) {
			this.setProfile(cookieProfile,false);
		}
		else {
			this.setProfile(this.config.defaultProfile,false);
		}
		
		paella.events.trigger(paella.events.resize,{width:$(this.mainContainer).width(), height:$(this.mainContainer).height()});
	},

	unloadAll:function(message) {
		$('#playerContainer')[0].innerHTML = "";
		var loaderContainer = $('#paellaPlayer_loader')[0];
		paella.messageBox.showError(message);
	},

	showEditor:function() {
		new paella.editor.Editor();
	},

	hideEditor:function() {
	},

	reloadVideos:function(masterQuality,slaveQuality) {
		if (this.videoContainer) {
			this.videoContainer.reloadVideos(masterQuality,slaveQuality);
			this.onresize();
		}
	},

	loadVideo:function() {
		if (this.videoIdentifier) {
			this.initVideoEvents();
			var This = this;
			var loader = paella.initDelegate.initParams.videoLoader;
			this.onresize();
			loader.loadVideo(this.videoIdentifier,function() {
				paella.player.videoContainer.setMasterQuality(base.parameters.list['resmaster']);
				paella.player.videoContainer.setSlaveQuality(base.parameters.list['resslave']);

				var master = loader.streams[0];
				var slave = loader.streams[1];
				var playerConfig = paella.player.config.player;
				if (playerConfig.stream0Audio===false && master) {
					paella.player.videoContainer.setDefaultMasterVolume(0);
				}
				if (playerConfig.stream1Audio===false && slave) {
					paella.player.videoContainer.setDefaultSlaveVolume(0);
				}
				
				if (slave && slave.data && Object.keys(slave.data.sources).length==0) slave = null;
				var frames = loader.frameList;
				var errorMessage;

				if (loader.loadStatus) {
					var preferredMethodMaster = loader.getPreferredMethod(0);
					var preferredMethodSlave  = loader.getPreferredMethod(1);

					paella.player.videoContainer.setSources(
						{ data:master, type:preferredMethodMaster },
						{ data:slave, type:preferredMethodSlave }
					);

					paella.events.trigger(paella.events.loadComplete,{masterVideo:master,slaveVideo:slave,frames:frames});
					if (paella.player.isLiveStream()) {
						This.showPlaybackBar();
					}
					This.onresize();
				}
				else {
					errorMessage = base.dictionary.translate("Error loading video data");
					paella.messageBox.showError(errorMessage);
					paella.events.trigger(paella.events.error,{error:errorMessage});
				}
			});
		}
	},

	showPlaybackBar:function() {
		if (!this.controls) {
			this.controls = new paella.ControlsContainer(this.playerId + '_controls');
			this.mainContainer.appendChild(this.controls.domElement);
			this.controls.onresize();
			paella.events.trigger(paella.events.loadPlugins,{pluginManager:paella.pluginManager});

		}
	},

	isLiveStream:function() {
		if (this._isLiveStream===undefined) {
			var loader = paella.initDelegate.initParams.videoLoader;
			var checkSource = function(sources,index) {
				if (sources.length>index) {
					var source = sources[index];
					for (var key in source.sources) {
						if (typeof(source.sources[key])=="object") {
							for (var i=0; i<source.sources[key].length; ++i) {
								var stream = source.sources[key][i];
								if (stream.isLiveStream) return true;
							}
						}
					}
				}
				return false;
			};
			this._isLiveStream = checkSource(loader.streams,0) || checkSource(loader.streams,1);
		}
		return this._isLiveStream;
	},

	loadPreviews:function() {
		var streams = paella.initDelegate.initParams.videoLoader.streams;
		var slavePreviewImg = null;

		var masterPreviewImg = streams[0].preview;
		if (streams.length >=2) {
			slavePreviewImg = streams[1].preview;
		}
		if (masterPreviewImg) {
			var masterRect = paella.player.videoContainer.overlayContainer.getMasterRect();
			this.masterPreviewElem = document.createElement('img');
			this.masterPreviewElem.src = masterPreviewImg;
			paella.player.videoContainer.overlayContainer.addElement(this.masterPreviewElem,masterRect);
		}
		if (slavePreviewImg) {
			var slaveRect = paella.player.videoContainer.overlayContainer.getSlaveRect();
			this.slavePreviewElem = document.createElement('img');
			this.slavePreviewElem.src = slavePreviewImg;
			paella.player.videoContainer.overlayContainer.addElement(this.slavePreviewElem,slaveRect);
		}
		paella.events.bind(paella.events.timeUpdate,function(event) {
			paella.player.unloadPreviews();
		});
	},

	unloadPreviews:function() {
		if (this.masterPreviewElem) {
			paella.player.videoContainer.overlayContainer.removeElement(this.masterPreviewElem);
			this.masterPreviewElem = null;
		}
		if (this.slavePreviewElem) {
			paella.player.videoContainer.overlayContainer.removeElement(this.slavePreviewElem);
			this.slavePreviewElem = null;
		}
	},

	loadComplete:function(event,params) {
		var thisClass = this;

		var master = paella.player.videoContainer.masterVideo();
		var getProfile = base.parameters.get('profile');
		var cookieProfile = base.cookies.get('lastProfile');
		if (getProfile) {
			this.setProfile(getProfile, false);
		}
		else if (cookieProfile) {
			this.setProfile(cookieProfile, false);
		}
		else {
			this.setProfile(this.config.defaultProfile, false);
		}

		paella.pluginManager.loadEventDrivenPlugins();
	},

	play:function() {
		if (!this.controls) {
			this.showPlaybackBar();
			var urlParamTime = base.parameters.get("time");
			var hashParamTime = base.hashParams.get("time");
			var timeString = hashParamTime ? hashParamTime:urlParamTime ? urlParamTime:"0s";
			var startTime = paella.utils.timeParse.timeToSeconds(timeString);
			if (startTime) {
				paella.player.videoContainer.setStartTime(startTime);
			}
			paella.events.trigger(paella.events.controlBarLoaded);
			paella.events.trigger(paella.events.play);
			this.controls.onresize();
		}

		this.videoContainer.play();
	},

	pause:function() {
		this.videoContainer.pause();
	},

	playing:function() {
		return this.paused();
	},

	paused:function() {
		return this.videoContainer.paused();
	}
});

var PaellaPlayer = paella.PaellaPlayer;

paella.PaellaPlayer.mode = {
	standard: 'standard',
	fullscreen: 'fullscreen',
	extended: 'extended',
	embed: 'embed'
};

/* Initializer function */
function initPaellaEngage(playerId,initDelegate) {
	if (!initDelegate) {
		initDelegate = new paella.InitDelegate();
	}
	paella.initDelegate = initDelegate;
	var lang = navigator.language || window.navigator.userLanguage;
	paellaPlayer = new PaellaPlayer(playerId,paella.initDelegate);
}
