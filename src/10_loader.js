

// Default Access Control
//
Class ("paella.DefaultAccessControl", paella.AccessControl, {
	checkAccess:function(onSuccess) {
		this.permissions.canRead = true;
		this.permissions.canWrite = true;
		this.permissions.canContribute = true;
		this.permissions.loadError = false;
		this.permissions.isAnonymous = true;
		this.userData.login = 'anonymous';
		this.userData.name = 'Anonymous';
		this.userData.avatar = 'resources/images/default_avatar.png';
		onSuccess(this.permissions);
	}
});

// Default Video Loader
//
Class ("paella.DefaultVideoLoader", paella.VideoLoader, {
	_url:null,
	
	initialize: function (data) {
		if (typeof(data)=="object") {
			this._data = data;
		}
		else {
			try {
				this._data = JSON.parse(data);
			}
			catch (e) {
				this._url = data;
			}
		}
	},

	loadVideo: function (videoId, onSuccess) {
		if (this._data) {
			this.loadVideoData(this._data, onSuccess);
		}
		else if (this._url) {
			var This = this;
			This._url = this._url + '/' + videoId + '/';
			paella.ajax.get({ url:this._url + 'data.json' },
				function(data,type,err) {
					if (typeof(data)=="string") {
						try {
							data = JSON.parse(data);
						}
						catch(e) {}
					}
					This._data = data;
					This.loadVideoData(This._data,onSuccess);
				},
				function(data,type,err) {
				});
		}
	},

	loadVideoData:function(data,onSuccess) {
		var This = this;
		if (data.streams) {
			data.streams.forEach(function(stream) {
				data.streams.forEach(function(stream) {
					This.loadStream(stream);
				});
			});
		}
		if (data.frameList) {
			this.loadFrameData(data);
		}
		if (data.captions) {
			this.loadCaptions(data.captions);
		}
		if (data.blackboard) {
			this.loadBlackboard(data.streams[0],data.blackboard);
		}
		this.streams = data.streams;
		this.frameList = data.frameList;
		this.loadStatus = this.streams.length>0;
		onSuccess();
	},

	loadFrameData:function(data) {
		if (data.frameList && data.frameList.forEach) {
			var newFrames = {};
			data.frameList.forEach(function(frame) {
				var id = frame.time;
				newFrames[id] = frame;
			});
			data.frameList = newFrames;
		}
	},

	loadStream:function(stream) {
		var This = this;
		if (stream.sources.image) {
			stream.sources.image.forEach(function(image) {
				if (image.frames.forEach) {
					var newFrames = {};
					image.frames.forEach(function(frame) {
						var id = "frame_" + frame.time;
						newFrames[id] = frame.src;
					});
					image.frames = newFrames;
				}
			});
		}
		for (var type in stream.sources) {
			if (type!='image') {
				var source = stream.sources[type];
				source.forEach(function(sourceItem) {
					var pattern = /^[a-zA-Z\:]+\:\/\//gi;
					if(sourceItem.src.match(pattern) == null){
						sourceItem.src = This._url;
					}
					sourceItem.type = sourceItem.mimetype;
				});
			}
		}
	},

	loadCaptions:function(captions) {
		if (captions) {
			for (var i=0; i<captions.length; ++i) {
				var url = captions[i].url;

				if (! /^[a-zA-Z]+:\/\//.test(url)) {
					url = this.getRepository() + "/" + paella.initDelegate.getId() + "/" + url;
				}
				var c = new paella.captions.Caption(i, captions[i].format, url, {code: captions[i].lang, txt: captions[i].text});
				paella.captions.addCaptions(c);
			}
		}
	},

	loadBlackboard:function(stream, blackboard) {
		if (!stream.sources.image) {
			stream.sources.image = [];
		}
		var imageObject = {
			count: blackboard.frames.length,
			duration: blackboard.duration,
			mimetype: blackboard.mimetype,
			res: blackboard.res,
			frames: {}
		};

		blackboard.frames.forEach(function(frame) {
			var id = "frame_" + Math.round(frame.time);
			imageObject.frames[id] = frame.src;
		});

		stream.sources.image.push(imageObject);
	}
});

Class ("paella.DefaultInitDelegate", paella.InitDelegate, {
	initialize:function(config, params) {
		if (arguments.length==1) {
			this.parent(arguments[0]);
		}
		else if (arguments.length==2) {
			this._config = arguments[0];
			this.parent(arguments[1]);
		}
	},

	loadConfig: function(onSuccess) {
		if (this._config) {
			onSuccess(this._config);
		}
		else {
			this.parent(onSuccess);
		}
	}
});

/*
 *	playerContainer	Player DOM container id
 *	params.config			Use this configuration file
 *	params.data				Paella video data schema
 *	params.url				Repository URL
 */
paella.load = function(playerContainer, params) {
	var initObjects = {
		accessControl: new paella.DefaultAccessControl(),
		videoLoader: new paella.DefaultVideoLoader(params.data || params.url)
	};

	if (params.config) {
		paella.initDelegate = new paella.DefaultInitDelegate(params.config, initObjects);
	}
	else {
		paella.initDelegate = new paella.DefaultInitDelegate(initObjects);
	}
	new PaellaPlayer(playerContainer,paella.initDelegate);
};
