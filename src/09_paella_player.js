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

(() => {
	class PaellaPlayer extends paella.PlayerBase {
	
		getPlayerMode() {	
			if (paella.player.isFullScreen()) {
				return paella.PaellaPlayer.mode.fullscreen;
			}
			else if (window.self !== window.top) {
				return paella.PaellaPlayer.mode.embed
			}
	
			return paella.PaellaPlayer.mode.standard;
		}
	
	
		checkFullScreenCapability() {
			var fs = document.getElementById(paella.player.mainContainer.id);
			if ((fs.webkitRequestFullScreen) || (fs.mozRequestFullScreen) || (fs.msRequestFullscreen) || (fs.requestFullScreen)) {
				return true;
			}
			if (paella.utils.userAgent.browser.IsMobileVersion && paella.player.videoContainer.isMonostream) {
				return true;
			}		
			return false;
		}
	
		addFullScreenListeners() {
			var thisClass = this;
			
			var onFullScreenChangeEvent = function() {
				setTimeout(function() {
					paella.pluginManager.checkPluginsVisibility();
				}, 1000);
	
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
				document.addEventListener("webkitendfullscreen", onFullScreenChangeEvent, false);
			}
		}
	
		isFullScreen() {
			var webKitIsFullScreen = (document.webkitIsFullScreen === true);
			var msIsFullScreen = (document.msFullscreenElement !== undefined && document.msFullscreenElement !== null);
			var mozIsFullScreen = (document.mozFullScreen === true);
			var stdIsFullScreen = (document.fullScreenElement !== undefined && document.fullScreenElement !== null);
			
			return (webKitIsFullScreen || msIsFullScreen || mozIsFullScreen || stdIsFullScreen);
		}

		goFullScreen() {
			if (!this.isFullScreen()) {
				if (paella.utils.userAgent.system.iOS &&
					(paella.utils.userAgent.browser.Version.major<12 ||
					 !paella.utils.userAgent.system.iPad))
				{
					paella.player.videoContainer.masterVideo().goFullScreen();
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
		}
		
		exitFullScreen() {
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
		}
	
		setProfile(profileName,animate) {
			if (paella.profiles.setProfile(profileName,animate)) {
				let profileData = paella.player.getProfile(profileName);
				if (profileData && !paella.player.videoContainer.isMonostream) {
					paella.utils.cookies.set('lastProfile', profileName);
				}
				paella.events.trigger(paella.events.setProfile,{profileName:profileName});
			}
		}
	
		getProfile(profileName) {
			return paella.profiles.getProfile(profileName);
		}
	
		constructor(playerId) {
			super(playerId);

			this.player = null;
	
			this.videoIdentifier = '';
			this.loader = null;
		
			// Video data:
			this.videoData = null;
	
			// if initialization ok
			if (this.playerId==playerId) {
				this.loadPaellaPlayer();
				var thisClass = this;
			}
		}

		get selectedProfile(){ return paella.profiles.currentProfileName; }
	
		loadPaellaPlayer() {
			var This = this;
			this.loader = new paella.LoaderContainer('paellaPlayer_loader');
			$('body')[0].appendChild(this.loader.domElement);
			paella.events.trigger(paella.events.loadStarted);
	
			paella.initDelegate.loadDictionary()
				.then(function() {
					return paella.initDelegate.loadConfig();
				})
	
				.then(function(config) {
					This.accessControl = paella.initDelegate.initParams.accessControl;
					This.videoLoader = paella.initDelegate.initParams.videoLoader;
					This.onLoadConfig(config);
					if (config.skin) {
						var skin = config.skin.default || 'dark';
						paella.utils.skin.restore(skin);
					}
				});
		}
	
		onLoadConfig(configData) {
			paella.data = new paella.Data(configData);
			paella.pluginManager.registerPlugins();
	
			this.config = configData;
			this.videoIdentifier = paella.initDelegate.getId();
	
			if (this.videoIdentifier) {
				if (this.mainContainer) {
					this.videoContainer = new paella.VideoContainer(this.playerId + "_videoContainer");
					var videoQualityStrategy = new paella.BestFitVideoQualityStrategy();
					try {
						var StrategyClass = this.config.player.videoQualityStrategy;
						var ClassObject = paella.utils.classFromString(StrategyClass);
						videoQualityStrategy = new ClassObject();
					}
					catch(e) {
						paella.log.warning("Error selecting video quality strategy: strategy not found");
					}
					this.videoContainer.setVideoQualityStrategy(videoQualityStrategy);
					
					this.mainContainer.appendChild(this.videoContainer.domElement);
				}
				$(window).resize(function(event) { paella.player.onresize(); });
				this.onload();
			}
			
			paella.pluginManager.loadPlugins("paella.FastLoadPlugin");
		}
	
		onload() {
			var thisClass = this;
			var ac = this.accessControl;
			var canRead = false;
			var userData = {};
			this.accessControl.canRead()
				.then(function(c) {
					canRead = c;
					return thisClass.accessControl.userData();
				})
	
				.then(function(d) {
					userData = d;
					if (canRead) {
						thisClass.loadVideo();
					}
					else if (userData.isAnonymous) {
						var redirectUrl = paella.initDelegate.initParams.accessControl.getAuthenticationUrl("player/?id=" + paella.player.videoIdentifier);
						var message = '<div>' + paella.utils.dictionary.translate("You are not authorized to view this resource") + '</div>';
						if (redirectUrl) {
							message += '<div class="login-link"><a href="' + redirectUrl + '">' + paella.utils.dictionary.translate("Login") + '</a></div>';
						}
						thisClass.unloadAll(message);
					}
					else {
						let errorMessage = paella.utils.dictionary.translate("You are not authorized to view this resource");
						thisClass.unloadAll(errorMessage);
						paella.events.trigger(paella.events.error,{error:errorMessage});
					}
				})
	
				.catch((error) => {
					let errorMessage = paella.utils.dictionary.translate(error);
					thisClass.unloadAll(errorMessage);
					paella.events.trigger(paella.events.error,{error:errorMessage});
				});
		}
	
		onresize() {		
			this.videoContainer.onresize();
			if (this.controls) this.controls.onresize();
	
			// Resize the layout profile
			if (this.videoContainer.ready) {
				var cookieProfile = paella.utils.cookies.get('lastProfile');
				if (cookieProfile) {
					this.setProfile(cookieProfile,false);
				}
				else {
					this.setProfile(paella.player.selectedProfile, false);
				}
			}
			
			paella.events.trigger(paella.events.resize,{width:$(this.videoContainer.domElement).width(), height:$(this.videoContainer.domElement).height()});
		}

		unloadAll(message) {
			var loaderContainer = $('#paellaPlayer_loader')[0];
			this.mainContainer.innerText = "";
			paella.messageBox.showError(message);
		}
	
		reloadVideos(masterQuality,slaveQuality) {
			if (this.videoContainer) {
				this.videoContainer.reloadVideos(masterQuality,slaveQuality);
				this.onresize();
			}
		}
	
		loadVideo() {
			if (this.videoIdentifier) {
				var This = this;
				var loader = paella.player.videoLoader;
				this.onresize();
				loader.loadVideo(() => {
					var playOnLoad = false;
					This.videoContainer.setStreamData(loader.streams)
						.then(function() {
							paella.events.trigger(paella.events.loadComplete);
							This.addFullScreenListeners();
							This.onresize();
							// If the player has been loaded using lazyLoad, the video should be
							// played as soon as it loads
							if (This.videoContainer.autoplay() || g_lazyLoadInstance!=null) {
								This.play();
							}
							else if (loader.metadata.preview) {
								This.lazyLoadContainer = new LazyThumbnailContainer(loader.metadata.preview);
								document.body.appendChild(This.lazyLoadContainer.domElement);
							}
						})
						.catch((error) => {
							console.error(error);
							let msg = error.message || "Could not load the video";
							paella.messageBox.showError(paella.utils.dictionary.translate(msg));
						});
				});
			}
		}
	
		showPlaybackBar() {
			if (!this.controls) {
				this.controls = new paella.ControlsContainer(this.playerId + '_controls');
				this.mainContainer.appendChild(this.controls.domElement);
				this.controls.onresize();
				paella.events.trigger(paella.events.loadPlugins,{pluginManager:paella.pluginManager});
	
			}
		}
	
		isLiveStream() {
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
			return checkSource(loader.streams,0) || checkSource(loader.streams,1);
		}
	
		loadPreviews() {
			var streams = paella.initDelegate.initParams.videoLoader.streams;
			var slavePreviewImg = null;
	
			var masterPreviewImg = streams[0].preview;
			if (streams.length >=2) {
				slavePreviewImg = streams[1].preview;
			}
			if (masterPreviewImg) {
				var masterRect = paella.player.videoContainer.overlayContainer.getVideoRect(0);
				this.masterPreviewElem = document.createElement('img');
				this.masterPreviewElem.src = masterPreviewImg;
				paella.player.videoContainer.overlayContainer.addElement(this.masterPreviewElem,masterRect);
			}
			if (slavePreviewImg) {
				var slaveRect = paella.player.videoContainer.overlayContainer.getVideoRect(1);
				this.slavePreviewElem = document.createElement('img');
				this.slavePreviewElem.src = slavePreviewImg;
				paella.player.videoContainer.overlayContainer.addElement(this.slavePreviewElem,slaveRect);
			}
			paella.events.bind(paella.events.timeUpdate,function(event) {
				paella.player.unloadPreviews();
			});
		}
	
		unloadPreviews() {
			if (this.masterPreviewElem) {
				paella.player.videoContainer.overlayContainer.removeElement(this.masterPreviewElem);
				this.masterPreviewElem = null;
			}
			if (this.slavePreviewElem) {
				paella.player.videoContainer.overlayContainer.removeElement(this.slavePreviewElem);
				this.slavePreviewElem = null;
			}
		}
	
		loadComplete(event,params) {
			var thisClass = this;
	
			//var master = paella.player.videoContainer.masterVideo();

			paella.pluginManager.loadPlugins("paella.EarlyLoadPlugin");
			if (paella.player.videoContainer._autoplay){
				this.play();
			}		
		}
	
		play() {
			if (!this.videoContainer) {
				// play() is called from lazyLoadContainer
				this.lazyLoadContainer.destroyElements();
				this.lazyLoadContainer = null;
				this._onPlayClosure && this._onPlayClosure();
			}
			else if (this.lazyLoadContainer) {
				// play() has been called by a user interaction
				document.body.removeChild(this.lazyLoadContainer.domElement);
				this.lazyLoadContainer = null;
			}

			if (this.videoContainer) {
				return new Promise((resolve,reject) => {
					this.videoContainer.play()
						.then(() => {
							if (paella.initDelegate.initParams.disableUserInterface()) {
								resolve();
							}
							else if (!this.controls) {
								if (!this.controls) {
									this.showPlaybackBar();
									paella.events.trigger(paella.events.controlBarLoaded);
									this.controls.onresize();
								}
								resolve();
							}
						})
						.catch((err) => {
							reject(err);
						});
				});
			}
		}
	
		pause() {
			return this.videoContainer.pause();
		}
	
		playing() {
			return new Promise((resolve) => {
				this.paused()
					.then((p) => {
						resolve(!p);
					});
			});
		}
	
		paused() {
			return this.videoContainer.paused();
		}
	}
	
	paella.PaellaPlayer = PaellaPlayer;
	window.PaellaPlayer = PaellaPlayer;
	
	paella.PaellaPlayer.mode = {
		standard: 'standard',
		fullscreen: 'fullscreen',
		embed: 'embed'
	};

	class LazyThumbnailContainer extends paella.DomNode {

		static GetIconElement() {
			let container = document.createElement('button');
			container.className = "play-button-on-screen";
			container.setAttribute("aria-label","Play");
			container.style.width = "100%";
			container.style.height = "100%";
			container.style.pointerEvents = "none";
			container.addEventListener("click", (evt) => {
				evt.stopPropagation();
				paella.player.play();
			});
		
			let icon = document.createElement('div');
			icon['className'] = 'play-icon';
			container.appendChild(icon);

			return container;
		}


		constructor(src) {
			super('img','lazyLoadThumbnailContainer',{});
			let url = new paella.URL(src);
			if (!url.isAbsolute) {
				url = (new paella.URL(paella.player.repoUrl))
					.appendPath(paella.player.videoIdentifier)
					.appendPath(src);
			}
			this.domElement.src = url.absoluteUrl;
			this.domElement.alt = "";

			this.container = LazyThumbnailContainer.GetIconElement();
			if (!paella.player.videoContainer) {
				document.body.appendChild(this.container);
			}
		}

		setImage(url) {
			this.domElement.src = url;
		}

		onClick(closure) {
			this.domElement.onclick = closure;
		}

		destroyElements() {
			document.body.removeChild(this.domElement);
			document.body.removeChild(this.container);
		}
	}

	paella.LazyThumbnailContainer = LazyThumbnailContainer;

	
	let g_lazyLoadInstance = null;
	class PaellaPlayerLazy extends PaellaPlayer {
		constructor(playerId,initDelegate) {
			super(playerId,initDelegate);
			g_lazyLoadInstance = this;
		}

		set onPlay(closure) {
			this._onPlayClosure = closure;

		}

		loadComplete(event,params) {
		}

		onLoadConfig(configData) {
			//paella.data = new paella.Data(configData);
	
			this.config = configData;
			this.videoIdentifier = paella.initDelegate.getId();
	
			if (this.videoIdentifier) {
				$(window).resize(function(event) { paella.player.onresize(); });
				this.onload();
			}
		}

		loadVideo() {
			if (this.videoIdentifier) {
				var This = this;
				var loader = paella.player.videoLoader;
				this.onresize();
				loader.loadVideo(() => {
					if (!loader.metadata.preview) {
						paella.load(this.playerId,paella.loaderFunctionParams);
						g_lazyLoadInstance = null;	// Lazy load is disabled when the video has no preview
					}
					else {
						this.lazyLoadContainer = new LazyThumbnailContainer(loader.metadata.preview);
						document.body.appendChild(this.lazyLoadContainer.domElement);
						this.lazyLoadContainer.onClick(() => {
							this.lazyLoadContainer.destroyElements();
							this.lazyLoadContainer = null;
							this._onPlayClosure && this._onPlayClosure();
						});
						paella.events.trigger(paella.events.loadComplete);
					}
				});
			}
		}

		onresize() {}
	}

	paella.PaellaPlayerLazy = PaellaPlayerLazy;
	
	/* Initializer function */
	window.initPaellaEngage = function(playerId,initDelegate) {
		if (!initDelegate) {
			initDelegate = new paella.InitDelegate();
		}
		paella.initDelegate = initDelegate;
		paellaPlayer = new PaellaPlayer(playerId,paella.initDelegate);
	}
})();
