
(() => {

	let s_preventVideoDump = [];

	class HLSPlayer extends paella.Html5Video {
		get config() {
			let config = {
				autoStartLoad: true,
				startPosition : -1,
				capLevelToPlayerSize: true,
				debug: false,
				defaultAudioCodec: undefined,
				initialLiveManifestSize: 1,
				initialQualityLevel: 1,
				maxBufferLength: 6,
				maxMaxBufferLength: 6,
				maxBufferSize: 600*1000*1000,
				maxBufferHole: 0.5,
				lowBufferWatchdogPeriod: 0.5,
				highBufferWatchdogPeriod: 3,
				nudgeOffset: 0.1,
				nudgeMaxRetry : 3,
				maxFragLookUpTolerance: 0.2,
				enableWorker: true,
				enableSoftwareAES: true,
				manifestLoadingTimeOut: 10000,
				manifestLoadingMaxRetry: 1,
				manifestLoadingRetryDelay: 500,
				manifestLoadingMaxRetryTimeout : 64000,
				startLevel: undefined,
				levelLoadingTimeOut: 10000,
				levelLoadingMaxRetry: 4,
				levelLoadingRetryDelay: 500,
				levelLoadingMaxRetryTimeout: 64000,
				fragLoadingTimeOut: 20000,
				fragLoadingMaxRetry: 6,
				fragLoadingRetryDelay: 500,
				fragLoadingMaxRetryTimeout: 64000,
				startFragPrefetch: false,
				appendErrorMaxRetry: 3,
				enableWebVTT: true,
				enableCEA708Captions: true,
				stretchShortVideoTrack: false,
				maxAudioFramesDrift : 1,
				forceKeyFrameOnDiscontinuity: true,
				abrEwmaFastLive: 5.0,
				abrEwmaSlowLive: 9.0,
				abrEwmaFastVoD: 4.0,
				abrEwmaSlowVoD: 15.0,
				abrEwmaDefaultEstimate: 500000,
				abrBandWidthFactor: 0.95,
				abrBandWidthUpFactor: 0.7,
				minAutoBitrate: 0
			};

			let pluginConfig = {};
			paella.player.config.player.methods.some((methodConfig) => {
				if (methodConfig.factory=="HLSVideoFactory") {
					pluginConfig = methodConfig.config || {};
					return true;
				}
			});

			for (let key in config) {
				if (pluginConfig[key]!=undefined) {
					config[key] = pluginConfig[key];
				}
			}

			return config;
		}

		constructor(id,stream,left,top,width,height) {
			super(id,stream,left,top,width,height,'hls');
		}
		
		_loadDeps() {
			return new Promise((resolve,reject) => {
				if (!window.$paella_hls) {
					paella.require(paella.baseUrl +'javascript/hls.min.js')
						.then((hls) => {
							window.$paella_hls = hls;
							resolve(window.$paella_hls);
						});
				}
				else {
					resolve(window.$paella_hls);
				}	
			});
		}
	
		_deferredAction(action) {
			return new Promise((resolve,reject) => {
				function processResult(actionResult) {
					if (actionResult instanceof Promise) {
						actionResult.then((p) => resolve(p))
							.catch((err) => reject(err));
					}
					else {
						resolve(actionResult);
					}
				}
	
				if (this.ready) {
					processResult(action());
				}
				else {
					let eventFunction = () => {
						processResult(action());
						$(this.video).unbind('canplay');
						$(this.video).unbind('loadedmetadata');
						if (timer) {
							clearTimeout(timer);
							timer = null;
						}
					};
					$(this.video).bind('canplay',eventFunction);
					$(this.video).bind('loadedmetadata',eventFunction);
					let timerFunction = () => {
						if (!this.ready) {
							if (!this._hls) {
								// iOS
								// In this way the recharge is forced, and it is possible to recover errors.
								console.debug("HLS video resume failed. Trying to recover.");
								let src = this.video.innerHTML;
								this.video.innerHTML = "";
								this.video.innerHTML = src;
								this.video.load();
								this.video.play();
							}
							timer = setTimeout(timerFunction, 1000);
						}
						else {
							eventFunction();
						}
					}
					let timer = setTimeout(timerFunction, 1000);
				}
			});
		}

		setupHls(video,url) {
			return new Promise((resolve,reject) => {
				this._loadDeps()
					.then((Hls) => {
						if (Hls.isSupported()) {
							let cfg = this.config;
							//cfg.autoStartLoad = false;
							this._hls = new Hls(cfg);
							const hlsStream = this.stream?.sources?.hls?.length>0 && this.stream.sources.hls[0];
							const isLiveStreaming = hlsStream.isLiveStream;
							this.autoQuality = true;

							this._hls.on(Hls.Events.LEVEL_SWITCHED, (ev,data) => {
								this._qualities = this._qualities || [];
								this._qualityIndex = this.autoQuality ? this._qualities.length - 1 : data.level;
								paella.events.trigger(paella.events.qualityChanged,{});
								if (console && console.log) console.log(`HLS: quality level changed to ${ data.level }`);
							});

							this._hls.on(Hls.Events.ERROR, (event, data) => {
								if (data.fatal) {
									switch (data.type) {
									case Hls.ErrorTypes.NETWORK_ERROR:
										if (data.details == Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
											// TODO: Manifest file not found
											console.error("paella.HLSPlayer: unrecoverable error in HLS Player. The video is not available.");
											reject(new Error("No such HLS stream: the video is not available"));
										}
										else {
											console.error("paella.HLSPlayer: Fatal network error encountered, try to recover");
											this._hls.startLoad();
										}
										break;
									case Hls.ErrorTypes.MEDIA_ERROR:
										console.error("paella.HLSPlayer: Fatal media error encountered, try to recover");
										this._hls.recoverMediaError();
										break;
									default:
										console.error("paella.HLSPlayer: Fatal error. Can not recover");
										this._hls.destroy();
										reject(new Errro("Invalid media"));
										break;
									}
								}
							});

							this._hls.on(Hls.Events.MANIFEST_PARSED, () => {
								if (!cfg.autoStartLoad) {
									this._hls.startLoad();
								}

								// Fixes hls.js problems loading some live videos
								if (isLiveStreaming) {
									try {
										//video.play();
									} catch (e) {}
								}
							});

							const rand = Math.floor(Math.random() * 100000000000);
							url += /\?/.test(url) ? `&cache=${ rand }` : `?cache=${ rand }`;
							this._hls.loadSource(url);
							this._hls.attachMedia(video);

							video.addEventListener("canplay", () => {
								resolve(video);
							})
						}
						else {
							reject(new Error("HLS not supported"));
						}
					})
			});
		}

		webGlDidLoad() {
			if (paella.utils.userAgent.system.iOS) {
				return super.webGlDidLoad();
			}
			// Register a new video loader in the webgl engine, to enable the
			// hls compatibility in webgl canvas
			bg.utils.HTTPResourceProvider.AddVideoLoader('m3u8', (url,onSuccess,onFail) => {
				var video = document.createElement("video");
				s_preventVideoDump.push(video);
				this.setupHls(video,url)
					.then(() => onSuccess(video))
					.catch(() => onFail());
			});
			return Promise.resolve();
		}

		loadVideoStream(canvasInstance,stream) {
			if (paella.utils.userAgent.system.iOS) {
				return super.loadVideoStream(canvasInstance,stream);
			}

			return canvasInstance.loadVideo(this,stream,(videoElem) => {
				return this.setupHls(videoElem,stream.src);
			});
		}

		supportsMultiaudio() {
			return this._deferredAction(() => {
				if (paella.utils.userAgent.system.iOS) {
					return this.video.audioTracks.length>1;
				}
				else {
					return this._hls.audioTracks.length>1;
				}
			});
		}
	
		getAudioTracks() {
			return this._deferredAction(() => {
				if (paella.utils.userAgent.system.iOS) {
					let result = [];
					Array.from(this.video.audioTracks).forEach((t) => {
						result.push({
							id: t.id,
							groupId: "",
							name: t.label,
							lang: t.language
						});
					})
					return result;
				}
				else {
					return this._hls.audioTracks;
				}
			});
		}

		setCurrentAudioTrack(trackId) {
			return this._deferredAction(() => {
				if (paella.utils.userAgent.system.iOS) {
					let found = false;
					Array.from(this.video.audioTracks).forEach((track) => {
						if (track.id==trackId) {
							found = true;
							track.enabled = true;
						}
						else {
							track.enabled = false;
						}
					});
					return found;
				}
				else {
					if (this._hls.audioTracks.some((track) => track.id==trackId)) {
						this._hls.audioTrack = trackId;
						return true;
					}
					else {

						return false;
					}
				}
			});
		}

		getCurrentAudioTrack() {
			return this._deferredAction(() => {
				if (paella.utils.userAgent.system.iOS) {
					let result = null;
					Array.from(this.video.audioTracks).some((t) => {
						if (t.enabled) {
							result = t;
							return true;
						}
					});
					return result;
				}
				else {
					let result = null;
					this._hls.audioTracks.some((t) => {
						if (t.id==this._hls.audioTrack) {
							result = t;
							return true;
						}
					});
					return result;
				}
			})
		}
	
		getQualities() {
			if (paella.utils.userAgent.system.iOS)// ||
		//		paella.utils.userAgent.browser.Safari)
			{
				return new Promise((resolve,reject) => {
					resolve([
						{
							index: 0,
							res: "",
							src: "",
							toString:function() { return "auto"; },
							shortLabel:function() { return "auto"; },
							compare:function(q2) { return 0; }
						}
					]);
				});
			}
			else {
				let This = this;
				return new Promise((resolve) => {
					if (!this._qualities || this._qualities.length==0) {
						This._qualities = [];
						This._hls.levels.forEach(function(q, index){
							This._qualities.push(This._getQualityObject(index, {
								index: index,
								res: { w:q.width, h:q.height },
								bitrate: q.bitrate
							}));					
						});
						if (this._qualities.length>1) {
							// If there is only one quality level, don't add the "auto" option
							This._qualities.push(
								This._getQualityObject(This._qualities.length, {
									index:This._qualities.length,
									res: { w:0, h:0 },
									bitrate: 0
								}));
						}
					}
					This.qualityIndex = This._qualities.length - 1;
					resolve(This._qualities);
				});
			}
		}

		disable(isMainAudioPlayer) {
			if (paella.utils.userAgent.system.iOS) {
				return;
			}
			
			this._currentQualityIndex = this._qualityIndex;
			this._hls.currentLevel = 0;
		}
	
		enable(isMainAudioPlayer) {
			if (this._currentQualityIndex !== undefined && this._currentQualityIndex !== null) {
				this.setQuality(this._currentQualityIndex);
				this._currentQualityIndex = null;
			}
		}

		printQualityes() {
			return new Promise((resolve,reject) => {
				this.getCurrentQuality()
					.then((cq)=>{
						return this.getNextQuality();
					})
					.then((nq) => {
						resolve();
					})
			});		
		}
		
		setQuality(index) {
			if (paella.utils.userAgent.system.iOS)// ||
				//paella.utils.userAgent.browser.Safari)
			{
				return Promise.resolve();
			}
			else if (index!==null) {
				try {
					this.qualityIndex = index;
					let level = index;
					this.autoQuality = false;
					if (index==this._qualities.length-1) {
						level = -1;
						this.autoQuality = true;
					}
					this._hls.currentLevel = level;
				}
				catch(err) {
	
				}
				return Promise.resolve();
			}
			else {
				return Promise.resolve();
			}
		}
	
		getNextQuality() {
			return new Promise((resolve,reject) => {
				let index = this.qualityIndex;
				resolve(this._qualities[index]);
			});
		}
		
		getCurrentQuality() {
			if (paella.utils.userAgent.system.iOS)// ||
				//paella.utils.userAgent.browser.Safari)
			{
				return Promise.resolve(0);
			}
			else {
				return new Promise((resolve,reject) => {
					resolve(this._qualities[this.qualityIndex]);
				});
			}
		}
	}

	paella.HLSPlayer = HLSPlayer;
	
	
	class HLSVideoFactory extends paella.VideoFactory {
		get config() {
			let hlsConfig = null;
			paella.player.config.player.methods.some((methodConfig) => {
				if (methodConfig.factory=="HLSVideoFactory") {
					hlsConfig = methodConfig;
				}
				return hlsConfig!=null;
			});
			return hlsConfig || {
				iOSMaxStreams: 1,
				androidMaxStreams: 1
			};
		}

		isStreamCompatible(streamData) {
			if (paella.videoFactories.HLSVideoFactory.s_instances===undefined) {
				paella.videoFactories.HLSVideoFactory.s_instances = 0;
			}
			try {
				let cfg = this.config;
				if ((paella.utils.userAgent.system.iOS &&
					paella.videoFactories.HLSVideoFactory.s_instances>=cfg.iOSMaxStreams) ||
					(paella.utils.userAgent.system.Android &&
					paella.videoFactories.HLSVideoFactory.s_instances>=cfg.androidMaxStreams))
			//	In some old mobile devices, playing a high number of HLS streams may cause that the browser tab crash
				{
					return false;
				}
				
				for (var key in streamData.sources) {
					if (key=='hls') return true;
				}
			}
			catch (e) {}
			return false;	
		}
	
		getVideoObject(id, streamData, rect) {
			++paella.videoFactories.HLSVideoFactory.s_instances;
			return new paella.HLSPlayer(id, streamData, rect.x, rect.y, rect.w, rect.h);
		}
	}

	paella.videoFactories.HLSVideoFactory = HLSVideoFactory;
	
})();
