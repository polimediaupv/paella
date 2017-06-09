Class("paella.HLSNativePlayer", paella.Html5Video, {
	initialize: function (id, stream, left, top, width, height) {
		this.parent(id, stream, left, top, width, height, 'hls');
	}
});

Class("paella.HLSPlayer", paella.Html5Video, {
	initialize: function (id, stream, left, top, width, height) {
		this.parent(id, stream, left, top, width, height, 'hls');
	},

	_loadDeps: function () {
		return new Promise((resolve, reject) => {
			if (!window.$paella_hls) {
				require(['resources/deps/hls.min.js'], function (hls) {
					window.$paella_hls = hls;
					resolve(window.$paella_hls);
				});
			} else {
				resolve(window.$paella_hls);
			}
		});
	},

	load: function () {
		if (base.userAgent.system.iOS) {
			return this.parent();
		} else {
			let This = this;
			return new Promise((resolve, reject) => {
				var source = this._stream.sources.hls;
				if (source && source.length > 0) {
					source = source[0];
					this._loadDeps()
						.then(function (Hls) {
							This._hls = new Hls();
							This._hls.loadSource(source.src);
							This._hls.attachMedia(This.video);

							This._hls.on(Hls.Events.LEVEL_SWITCHED, function (ev, data) {
								This.qualityIndex = data.level;
								This.setQuality(data.level);
							});

							This._hls.on(Hls.Events.ERROR, function (event, data) {
								if (data.fatal) {
									switch (data.type) {
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
							This._hls.on(Hls.Events.MANIFEST_PARSED, function () {
								This._deferredAction(function () {
									resolve();
								});
							});
						});
				} else {
					reject(new Error("Invalid source"));
				}
			});
		}
	},

	getQualities: function () {
		let This = this;
		return new Promise((resolve) => {
			if (!this._qualities) {
				This._qualities = [];
				This._hls.levels.forEach(function (q, index) {
					This._qualities.push(This._getQualityObject(index, {
						index: index,
						res: {
							w: q.width,
							h: q.height
						},
						bitrate: q.bitrate
					}));
				});
			}
			resolve(This._qualities);
		});
	},

	printQualityes: function () {
		return new Promise((resolve, reject) => {
			this.getCurrentQuality()
				.then((cq) => {
					return this.getNextQuality();
				})
				.then((nq) => {
					resolve();
				})
		});
	},

	setQuality: function (index) {
		this.qualityIndex = index;
		//this._hls.currentLevel = index;		
		this._hls.nextLevel = index;
		return new Promise((resolve, reject) => {
			resolve();
		});
	},

	getNextQuality: function () {
		return new Promise((resolve, reject) => {
			let index = this._hls.nextLevel;
			resolve(this._qualities[index]);
		});
	},


	getCurrentQuality: function () {
		this.getNextQuality()
		return new Promise((resolve, reject) => {
			let index = (this.qualityIndex == undefined) ? this._hls.currentLevel : this.qualityIndex;
			resolve(this._qualities[index]);
		});
	}
});


Class("paella.videoFactories.HLSVideoFactory", {
	lib_support: false,
	isStreamCompatible: function (streamData) {
		try {
			for (var key in streamData.sources) {
				if (key == 'hls') {
					const mediaSource = window.MediaSource = window.MediaSource || window.WebKitMediaSource;
					const sourceBuffer = window.SourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
					const isTypeSupported = mediaSource &&
						typeof mediaSource.isTypeSupported === 'function' &&
						mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
					const sourceBufferValidAPI = !sourceBuffer ||
						(sourceBuffer.prototype &&
							typeof sourceBuffer.prototype.appendBuffer === 'function' &&
							typeof sourceBuffer.prototype.remove === 'function');
					this.lib_support = isTypeSupported && sourceBufferValidAPI;
					return true;
				}
			}
		} catch (e) {}
		return false;
	},

	getVideoObject: function (id, streamData, rect) {
		++paella.videoFactories.Html5VideoFactory.s_instances;
		if (this.lib_support) {
			return new paella.HLSPlayer(id, streamData, rect.x, rect.y, rect.w, rect.h);
		}
		return new paella.HLSNativePlayer(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});