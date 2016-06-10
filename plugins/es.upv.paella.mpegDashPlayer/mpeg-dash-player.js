
Class ("paella.MpegDashVideo", paella.Html5Video,{
	_posterFrame:null,
	_player:null,

	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,left,top,width,height);
		var This = this;
	},

	_loadDeps:function() {
		var defer = $.Deferred();
		if (!window.$paella_mpd) {
			require(['resources/deps/dash.all.js'],function() {
				window.$paella_mpd = true;
				defer.resolve();
			});
		}
		else {
			defer.resolve(window.$paella_mpd);
		}
		return defer;
	},

	_getQualityObject:function(item, index, bitrates) {
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
	},

	load:function() {
		var This = this;
		var defer = $.Deferred();
		var source = this._stream.sources.mpd;
		if (source && source.length>0) {
			source = source[0];
			this._loadDeps()
				.then(function() {
					var context = new Dash.di.DashContext();
					player = new MediaPlayer(context);
					dashContext = context;
					player.startup();
					player.debug.setLogToBrowserConsole(false);
					player.attachView(This.video);
					player.setAutoPlay(false);
					player.setAutoSwitchQuality(true);
					This._player = player;

					player.addEventListener(MediaPlayer.events.STREAM_INITIALIZED,function(a,b) {
						bitrates = player.getBitrateInfoListFor("video");
						This._deferredAction(function() {
							defer.resolve();
						});
					});

					player.attachSource(source.src);
				});
		}
		else {
			defer.reject(new Error("Invalid source"));
		}

		return defer;
	},

	getQualities:function() {
		var This = this;
		var defer = $.Deferred();
		this._deferredAction(function() {
			if (!This._qualities) {
				This._qualities = [];
				This._player
					.getBitrateInfoListFor("video")

					.sort(function(a,b) {
						return a.bitrate - b.bitrate;
					})

					.forEach(function(item,index) {
						This._qualities.push(This._getQualityObject(item,index,bitrates));
					});
					
				This.autoQualityIndex = This._qualities.length; 
				This._qualities.push({
					index: This.autoQualityIndex,
					res: { w:null, h:null },
					bitrate: -1,
					src: null,
					toString:function() { return "auto"; },
					shortLabel:function() { return "auto"; },
					compare:function(q2) { return this.bitrate - q2.bitrate; }
				});
				
			}
			defer.resolve(This._qualities);
		});
		return defer;
	},

	setQuality:function(index) {
		var defer = $.Deferred();
		var This = this;

		var currentQuality = this._player.getQualityFor("video");
		if (index==This.autoQualityIndex) {
			this._player.setAutoSwitchQuality(true);
			defer.resolve();
		}
		else if (index!=currentQuality) {
			this._player.setAutoSwitchQuality(false);
			this._player.removeEventListener(MediaPlayer.events.METRIC_CHANGED);
			this._player.addEventListener(MediaPlayer.events.METRIC_CHANGED,function(a,b) {
				if(a.type=="metricchanged" && a.data.stream=="video") {
					if (currentQuality!=This._player.getQualityFor("video")) {
						currentQuality = This._player.getQualityFor("video");
						defer.resolve();
					}
				}
			});
			This._player.setQualityFor("video",index);
		}
		else {
			defer.resolve();
		}

		return defer;
	},

	getCurrentQuality:function() {
		var defer = $.Deferred();
		if (this._player.getAutoSwitchQuality()) {// auto quality
			defer.resolve({
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
			defer.resolve(this._getQualityObject(this._qualities[index],index,this._player.getBitrateInfoListFor("video")));
		}	
		return defer;
	},

	unFreeze:function(){
		return paella_DeferredNotImplemented();
	},

	freeze:function(){
		return paella_DeferredNotImplemented();
	},

	unload:function() {
		this._callUnloadEvent();
		return paella_DeferredNotImplemented();
	}
});


Class ("paella.videoFactories.MpegDashVideoFactory", {
	isStreamCompatible:function(streamData) {
		try {
			if (base.userAgent.system.iOS &&
				paella.videoFactories.Html5VideoFactory.s_instances>0)
			{
				return false;
			}
			for (var key in streamData.sources) {
				if (key=='mpd') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		++paella.videoFactories.Html5VideoFactory.s_instances;
		return new paella.MpegDashVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});

