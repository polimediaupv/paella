
(() => {

	class HLSPlayer extends paella.Html5Video {
		constructor(id,stream,left,top,width,height) {
			super(id,stream,left,top,width,height,'hls');
		}
		
		_loadDeps() {
			return new Promise((resolve,reject) => {
				if (!window.$paella_hls) {
					require(['resources/deps/hls.min.js'],function(hls) {
						window.$paella_hls = hls;
						resolve(window.$paella_hls);
					});
				}
				else {
					resolve(window.$paella_hls);
				}	
			});
		}
	
		allowZoom() {
			return true;
		}
		
		load() {
			if (this._posterFrame) {
				this.video.setAttribute("poster",this._posterFrame);
			}
			if (base.userAgent.system.iOS)// ||
			//	base.userAgent.browser.Safari)
			{
				return super.load();
			}
			else {
				let This = this;
				return new Promise((resolve,reject) => {
					var source = this._stream.sources.hls;
					if (source && source.length>0) {
						source = source[0];
						this._loadDeps()
							.then(function(Hls) {
								if(Hls.isSupported()) {
									This._hls = new Hls();
									This._hls.loadSource(source.src);
									This._hls.attachMedia(This.video);
									This._hls.config.capLevelToPlayerSize = true;
									This.autoQuality = true;
	
									This._hls.on(Hls.Events.LEVEL_SWITCHED, function(ev, data) {
										This._qualities = This._qualities || [];
										This.qualityIndex = This.autoQuality ? This._qualities.length - 1 : data.level;
										paella.events.trigger(paella.events.qualityChanged,{});
										if (console && console.log) console.log(`HLS: quality level changed to ${ data.level }`);
									});
									
									This._hls.on(Hls.Events.ERROR, function (event, data) {
										//deal with nonfatal media errors that might come from redirects after session expiration
										if (data.type == Hls.ErrorTypes.MEDIA_ERROR) {
												This._hls.destroy();
												base.log.error("paella.HLSPlayer: Encountered invalid media file");
												reject(new Error("invalid media"));
										}
										if (data.fatal) {
											switch(data.type) {
											case Hls.ErrorTypes.NETWORK_ERROR:
												base.log.error("paella.HLSPlayer: Fatal network error encountered, try to recover");
												This._hls.startLoad();
												break;
											case Hls.ErrorTypes.MEDIA_ERROR:
												base.log.error("paella.HLSPlayer: Fatal media error encountered, try to recover");
												This._hls.recoverMediaError();
												break;
											default:
												base.log.error("paella.HLSPlayer: Fatal Error. Can not recover");
												This._hls.destroy();
												break;
											}
										}
									});
									This._hls.on(Hls.Events.MANIFEST_PARSED,function() {
										This._deferredAction(function() {
											resolve();
										});
									});
								}
							});
					}
					else {
						reject(new Error("Invalid source"));
					}
				});
			}
		}
	
		getQualities() {
			if (base.userAgent.system.iOS)// ||
		//		base.userAgent.browser.Safari)
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
						This._qualities.push(
							This._getQualityObject(This._qualities.length, {
								index:This._qualities.length,
								res: { w:0, h:0 },
								bitrate: 0
							}));
					}
					This.qualityIndex = This._qualities.length - 1;
					resolve(This._qualities);
				});
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
			if (base.userAgent.system.iOS)// ||
				//base.userAgent.browser.Safari)
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
			if (base.userAgent.system.iOS)// ||
				//base.userAgent.browser.Safari)
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
		isStreamCompatible(streamData) {
			if (paella.videoFactories.HLSVideoFactory.s_instances===undefined) {
				paella.videoFactories.HLSVideoFactory.s_instances = 0;
			}
			try {
				if (paella.videoFactories.HLSVideoFactory.s_instances>0 && 
					base.userAgent.system.iOS)
			//	In old iOS devices, playing more than one HLS stream may cause that the browser tab crash
			//		&& (paella.utils.userAgent.system.Version.major<=10 && paella.utils.userAgent.system.Version.minor<3))
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
