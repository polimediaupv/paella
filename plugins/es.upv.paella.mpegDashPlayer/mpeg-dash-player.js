
(() => {

class MpegDashVideo extends paella.Html5Video {

	constructor(id,stream,left,top,width,height) {
		super(id,stream,left,top,width,height,'mpd');
		this._posterFrame = null;
		this._player = null;
	}

	_loadDeps() {
		return new Promise((resolve,reject) => {
			if (!window.$paella_mpd) {
				paella.require(paella.baseUrl +'resources/deps/dash.all.js')
					.then(() => {
						window.$paella_mpd = true;
						resolve(window.$paella_mpd);
					});
			}
			else {
				resolve(window.$paella_mpd);
			}	
		});
	}

	_getQualityObject(item, index, bitrates) {
		var total = bitrates.length;
		var percent = Math.round(index * 100 / total);
		var label = index==0 ? "min":(index==total-1 ? "max":percent + "%");
		return {
			index: index,
			res: { w:null, h:null },
			bitrate: item.bitrate,
			src: null,
			toString:function() { return percent; },
			shortLabel:function() { return label; },
			compare:function(q2) { return this.bitrate - q2.bitrate; }
		};
	}

	webGlDidLoad() {
		// Register a new video loader in the webgl engine, to enable the
		// hls compatibility in webgl canvas
		bg.utils.HTTPResourceProvider.AddVideoLoader('mpd', (url,onSuccess,onFail) => {
			var video = document.createElement("video");
			s_preventVideoDump.push(video);
			// this.setupHls(video,url)
			// 	.then(() => onSuccess(video))
			// 	.catch(() => onFail());
		});
		return Promise.resolve();
	}

	loadVideoStream(canvasInstance,stream) {
		let This = this;
		return canvasInstance.loadVideo(this,stream,(videoElem) => {
			return new Promise((resolve,reject) => {
				this._loadDeps()
					.then(() => {
						
						var player = dashjs.MediaPlayer().create();
						player.initialize(videoElem,stream.src,true);
						player.getDebug().setLogToBrowserConsole(false);
						this._player = player;

						
						player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, function(a,b) {
							var bitrates = player.getBitrateInfoListFor("video");
							This._deferredAction(function() {
								if (!This._firstPlay) {
									This._player.pause();
									This._firstPlay = true;
								}
								resolve();
							});
						});
				
					});
				});
		}); 
	}

	// load() {
	// 	let This = this;
	// 	return new Promise((resolve,reject) => {
	// 		var source = this._stream.sources.mpd;
	// 		if (source && source.length>0) {
	// 			source = source[0];
	// 			this._loadDeps()
	// 				.then(function() {
	// 					var context = dashContext;
	// 					var player = dashjs.MediaPlayer().create();
	// 					var dashContext = context;
	// 					player.initialize(This.video,source.src,true);
	// 					player.getDebug().setLogToBrowserConsole(false);
	// 					This._player = player;
	// 					player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED,function(a,b) {
	// 						var bitrates = player.getBitrateInfoListFor("video");
	// 						This._deferredAction(function() {
	// 							if (!This._firstPlay) {
	// 								This._player.pause();
	// 								This._firstPlay = true;	
	// 							}
	// 							resolve();
	// 						});
	// 					});
	// 				});
	// 		}
	// 		else {
	// 			reject(new Error("Invalid source"));
	// 		}
	// 	});
	// }

	supportAutoplay() {
		return true;
	}

	getQualities() {
		return new Promise((resolve) => {
			this._deferredAction(() => {
				if (!this._qualities) {
					this._qualities = [];
					this._player
						.getBitrateInfoListFor("video")

						.sort((a,b) => {
							return a.bitrate - b.bitrate;
						})

						.forEach((item,index,bitrates) => {
							this._qualities.push(this._getQualityObject(item,index,bitrates));
						});
						
					this.autoQualityIndex = this._qualities.length; 
					this._qualities.push({
						index: this.autoQualityIndex,
						res: { w:null, h:null },
						bitrate: -1,
						src: null,
						toString:function() { return "auto"; },
						shortLabel:function() { return "auto"; },
						compare:function(q2) { return this.bitrate - q2.bitrate; }
					});
					
				}
				resolve(this._qualities);
			});
		});
	}

	setQuality(index) {
		return new Promise((resolve,reject) => {
			let currentQuality = this._player.getQualityFor("video");
			if (index==this.autoQualityIndex) {
				this._player.setAutoSwitchQuality(true);
				resolve();
			}
			else if (index!=currentQuality) {
				this._player.setAutoSwitchQuality(false);
				this._player.off(dashjs.MediaPlayer.events.METRIC_CHANGED);
				this._player.on(dashjs.MediaPlayer.events.METRIC_CHANGED, (a,b) => {
					if (a.type=="metricchanged") {
						if (currentQuality!=this._player.getQualityFor("video")) {
							currentQuality = this._player.getQualityFor("video");
							resolve();
						}
					}
				});
				this._player.setQualityFor("video",index);
			}
			else {
				resolve();
			}
		});
	}

	getCurrentQuality() {
		return new Promise((resolve,reject) => {
			if (this._player.getAutoSwitchQuality()) {// auto quality
				resolve({
					index: this.autoQualityIndex,
					res: { w:null, h:null },
					bitrate: -1,
					src: null,
					toString:function() { return "auto"; },
					shortLabel:function() { return "auto"; },
					compare:function(q2) { return this.bitrate - q2.bitrate; }
				});
			}
			else {
				var index = this._player.getQualityFor("video");
				resolve(this._getQualityObject(this._qualities[index],index,this._player.getBitrateInfoListFor("video")));
			}
		});
	}

	unFreeze(){
		return paella_DeferredNotImplemented();
	}

	freeze(){
		return paella_DeferredNotImplemented();
	}

	unload() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}
}

paella.MpegDashVideo = MpegDashVideo;


class MpegDashVideoFactory extends paella.VideoFactory {
	isStreamCompatible(streamData) {
		try {
			if (paella.utils.userAgent.system.iOS) {
				return false;
			}
			for (var key in streamData.sources) {
				if (key=='mpd') return true;
			}
		}
		catch (e) {}
		return false;
	}

	getVideoObject(id, streamData, rect) {
		++paella.videoFactories.Html5VideoFactory.s_instances;
		return new paella.MpegDashVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
}

paella.videoFactories.MpegDashVideoFactory = MpegDashVideoFactory;

})();
