/*
 Paella HTML 5 Multistream Player
 Copyright (C) 2013  Universitat Politècnica de València

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */



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
			this._url = (/\/$/.test(this._url) ? this._url:this._url + '/')
				 + videoId + '/';
			base.ajax.get({ url:this._url + 'data.json' },
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
					switch (err) {
					case 401:
						paella.messageBox.showError(base.dictionary.translate("You are not logged in"));
						break;
					case 403:
						paella.messageBox.showError(base.dictionary.translate("You are not authorized to view this resource"));
						break;
					case 404:
						paella.messageBox.showError(base.dictionary.translate("The specified video identifier does not exist"));
						break;
					default:
						paella.messageBox.showError(base.dictionary.translate("Could not load the video"));
					}
				});
		}
	},

	loadVideoData:function(data,onSuccess) {
		var This = this;
		if (data.metadata) {
			this.metadata = data.metadata;
		}

		if (data.streams) {
			data.streams.forEach(function(stream) {
				This.loadStream(stream);
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
		var This = this;
		if (data.frameList && data.frameList.forEach) {
			var newFrames = {};
			data.frameList.forEach(function(frame) {
				if (! /^[a-zA-Z]+:\/\//.test(frame.url) && !/^data:/.test(frame.url)) {
					frame.url = This._url + frame.url;
				}
				if (frame.thumb && ! /^[a-zA-Z]+:\/\//.test(frame.thumb) && !/^data:/.test(frame.thumb)) {
					frame.thumb = This._url + frame.thumb;
				}
				var id = frame.time;
				newFrames[id] = frame;

			});
			data.frameList = newFrames;
		}
	},

	loadStream:function(stream) {
		var This=this;
		if (stream.preview && ! /^[a-zA-Z]+:\/\//.test(stream.preview) && !/^data:/.test(stream.preview)) {
			stream.preview = This._url + stream.preview;
		}

		if (stream.sources.image) {
			stream.sources.image.forEach(function(image) {
				if (image.frames.forEach) {
					var newFrames = {};
					image.frames.forEach(function(frame) {
						if (frame.src && ! /^[a-zA-Z]+:\/\//.test(frame.src) && !/^data:/.test(frame.src)) {
							frame.src = This._url + frame.src;
						}
						if (frame.thumb && ! /^[a-zA-Z]+:\/\//.test(frame.thumb) && !/^data:/.test(frame.thumb)) {
							frame.thumb = This._url + frame.thumb;
						}
						var id = "frame_" + frame.time;
						newFrames[id] = frame.src;
					});
					image.frames = newFrames;
				}
			});
		}
		for (var type in stream.sources) {
			if (stream.sources[type]) {
				if (type != 'image') {
					var source = stream.sources[type];
					source.forEach(function (sourceItem) {
						var pattern = /^[a-zA-Z\:]+\:\/\//gi;
						if (typeof(sourceItem.src)=="string") {
							if(sourceItem.src.match(pattern) == null){
								sourceItem.src = This._url + sourceItem.src;
							}
						}
						sourceItem.type = sourceItem.mimetype;
					});
				}
			}
			else {
				delete stream.sources[type];
			}
		}
	},

	loadCaptions:function(captions) {
		if (captions) {
			for (var i=0; i<captions.length; ++i) {
				var url = captions[i].url;

				if (! /^[a-zA-Z]+:\/\//.test(url)) {
					url = this._url + url;
				}
				var c = new paella.captions.Caption(i, captions[i].format, url, {code: captions[i].lang, txt: captions[i].text});
				paella.captions.addCaptions(c);
			}
		}
	},

	loadBlackboard:function(stream, blackboard) {
		var This = this;
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
			if (!/^[a-zA-Z]+:\/\//.test(frame.src)) {
				frame.src = This._url + frame.src;
			}
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

	loadConfig: function() {
		if (this._config) {
			var defer = new $.Deferred();
			defer.resolve(this._config);
			return defer;
		}
		else {
			return this.parent();
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
	var auth = (params && params.auth) || {};
	var initObjects = {
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
