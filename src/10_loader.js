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

// Default Video Loader
//
class DefaultVideoLoader extends paella.VideoLoader {
	
	constructor(data) {
		super(data);
		this._url = null;
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
	}

	getVideoUrl() {
		if (paella.initDelegate.initParams.videoUrl) {
			return typeof(paella.initDelegate.initParams.videoUrl)=="function" ?
				paella.initDelegate.initParams.videoUrl() :
				paella.initDelegate.initParams.videoUrl;
		}
		else {
			let url = this._url || (paella.player.config.standalone && paella.player.config.standalone.repository) || '';
			return (/\/$/.test(url) ? url:url + '/') + paella.initDelegate.getId() + '/';
		}
	}

	getDataUrl() {
		if (paella.initDelegate.initParams.dataUrl) {
			return typeof(paella.initDelegate.initParams.dataUrl)=='function' ?
				paella.initDelegate.initParams.dataUrl() :
				paella.initDelegate.initParams.dataUrl;
		}
		else {
			return this.getVideoUrl() + 'data.json';
		}
	}

	loadVideo(onSuccess) {
		let loadVideoDelegate = paella.initDelegate.initParams.loadVideo;
		let url = this._url || this.getDataUrl();

		if (this._data) {
			this.loadVideoData(this._data, onSuccess);
		}
		else if (loadVideoDelegate) {
			loadVideoDelegate().then((data) => {
				this._data = data;
				this.loadVideoData(this._data, onSuccess);
			});
		}
		else if (url) {
			var This = this;
			paella.utils.ajax.get({ url:this.getDataUrl() },
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
						paella.messageBox.showError(paella.utils.dictionary.translate("You are not logged in"));
						break;
					case 403:
						paella.messageBox.showError(paella.utils.dictionary.translate("You are not authorized to view this resource"));
						break;
					case 404:
						paella.messageBox.showError(paella.utils.dictionary.translate("The specified video identifier does not exist"));
						break;
					default:
						paella.messageBox.showError(paella.utils.dictionary.translate("Could not load the video"));
					}
				});
		}
	}

	loadVideoData(data,onSuccess) {
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
	}

	loadFrameData(data) {
		var This = this;
		if (data.frameList && data.frameList.forEach) {
			var newFrames = {};
			data.frameList.forEach(function(frame) {
				if (! /^[a-zA-Z]+:\/\//.test(frame.url) && !/^data:/.test(frame.url)) {
					frame.url = This.getVideoUrl() + frame.url;
				}
				if (frame.thumb && ! /^[a-zA-Z]+:\/\//.test(frame.thumb) && !/^data:/.test(frame.thumb)) {
					frame.thumb = This.getVideoUrl() + frame.thumb;
				}
				var id = frame.time;
				newFrames[id] = frame;

			});
			data.frameList = newFrames;
		}
	}

	loadStream(stream) {
		var This=this;
		if (stream.preview && ! /^[a-zA-Z]+:\/\//.test(stream.preview) && !/^data:/.test(stream.preview)) {
			stream.preview = This.getVideoUrl() + stream.preview;
		}

		if (!stream.sources) {
			return;
		}

		if (stream.sources.image) {
			stream.sources.image.forEach(function(image) {
				if (image.frames.forEach) {
					var newFrames = {};
					image.frames.forEach(function(frame) {
						if (frame.src && ! /^[a-zA-Z]+:\/\//.test(frame.src) && !/^data:/.test(frame.src)) {
							frame.src = This.getVideoUrl() + frame.src;
						}
						if (frame.thumb && ! /^[a-zA-Z]+:\/\//.test(frame.thumb) && !/^data:/.test(frame.thumb)) {
							frame.thumb = This.getVideoUrl() + frame.thumb;
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
								sourceItem.src = This.getVideoUrl() + sourceItem.src;
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
	}

	loadCaptions(captions) {
		if (captions) {
			for (var i=0; i<captions.length; ++i) {
				var url = captions[i].url;

				if (! /^[a-zA-Z]+:\/\//.test(url)) {
					url = this.getVideoUrl() + url;
				}
				var c = new paella.captions.Caption(i, captions[i].format, url, {code: captions[i].lang, txt: captions[i].text});
				paella.captions.addCaptions(c);
			}
		}
	}

	loadBlackboard(stream, blackboard) {
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
				frame.src = This.getVideoUrl() + frame.src;
			}
			imageObject.frames[id] = frame.src;
		});

		stream.sources.image.push(imageObject);
	}
}

paella.DefaultVideoLoader = DefaultVideoLoader;

class DefaultInitDelegate extends paella.InitDelegate {
}

paella.DefaultInitDelegate = DefaultInitDelegate;

function getManifestFromParameters(params) {
	let master = null;
	if (master = paella.utils.parameters.get('video')) {
		let slave = paella.utils.parameters.get('videoSlave');
		slave = slave && decodeURIComponent(slave);
		let masterPreview = paella.utils.parameters.get('preview');
		masterPreview = masterPreview && decodeURIComponent(masterPreview);
		let slavePreview = paella.utils.parameters.get('previewSlave');
		slavePreview = slavePreview && decodeURIComponent(slavePreview);
		let title = paella.utils.parameters.get('title') || "Untitled Video";
		
		let data = {
			metadata: {
				title: title
			},
			streams: [
				{
					sources: {
						mp4: [
							{
								src:decodeURIComponent(master),
								mimetype:"video/mp4",
								res:{ w:0, h:0 }
							}
						]
					},
					preview:masterPreview,
					type: "video",
					content: "presenter"
				}
			],
			frameList: []
		}

		if (slave) {
			data.streams.push({
				sources: {
					mp4: [
						{
							src:slave,
							mimetype:"video/mp4",
							res:{ w:0, h:0 }
						} 
					]
				},
				preview:slavePreview,
				type: "video",
				content: "presentation"
			});
		}

		return data;
	}
	return null;
}

/*
 *	playerContainer	Player DOM container id
 *	params.configUrl		Url to the config json file
 *	params.config			Use this configuration file
 *	params.data				Paella video data schema
 *	params.url				Repository URL
 */
paella.load = function(playerContainer, params) {
	paella.loaderFunctionParams = params;
	var auth = (params && params.auth) || {};

	// Build custom init data using url parameters
	let data = getManifestFromParameters(params);
	if (data) {
		params.data = data;
	}

	var initObjects = params;
	initObjects.videoLoader = new paella.DefaultVideoLoader(params.data || params.url);

	paella.initDelegate = new paella.DefaultInitDelegate(initObjects);
	new PaellaPlayer(playerContainer,paella.initDelegate);
};

/*
 *	playerContainer	Player DOM container id
 *	params.configUrl		Url to the config json file
 *	params.config			Use this configuration file
 *	params.data				Paella video data schema
 *	params.url				Repository URL
 *  forceLazyLoad			Use lazyLoad even if your browser does not allow automatic playback of the video
 */
paella.lazyLoad = function(playerContainer, params, forceLazyLoad = true) {
	paella.loaderFunctionParams = params;
	var auth = (params && params.auth) || {};

	// Check autoplay. If autoplay is enabled, this function must call paella.load()
	paella.Html5Video.IsAutoplaySupported()
		.then((supported) => {
			let disableUI = /true/i.test(paella.utils.parameters.get("disable-ui"));
			if ((supported || forceLazyLoad) && !disableUI) {
				// Build custom init data using url parameters
				let data = getManifestFromParameters(params);
				if (data) {
					params.data = data;
				}

				var initObjects = params;
				initObjects.videoLoader = new paella.DefaultVideoLoader(params.data || params.url);

				paella.initDelegate = new paella.DefaultInitDelegate(initObjects);
				let lazyLoad = new paella.PaellaPlayerLazy(playerContainer,paella.initDelegate);
				lazyLoad.onPlay = () => {
					$('#' + playerContainer).innerHTML = "";
					paella.load(playerContainer,params);
				};
			}
			else {
				paella.load(playerContainer,params);
			}
		});
}

})();

