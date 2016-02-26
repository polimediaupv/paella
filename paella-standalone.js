//
// paella-standalone
//

paella.standalone = {}

// Standalone Access Control
//
// By default read/write access
paella.standalone.StandaloneAccessControl = Class.create(paella.AccessControl,{
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


// Standalone Video Loader
//
paella.standalone.StandAloneVideoLoader = Class.create(paella.VideoLoader, {
	initialize:function(arg1,arg2) {
		/*
			([video1],[video2])
			(repoFolder)
			()
		*/
		var video1 = null,
			video2 = null,
			repoFolder = null;
		if (arg1 instanceof Array) {
			video1 = arg1;
			video2 = [];
			if (arg2 instanceof Array) {
				video2 = arg2
			}
		}
		else {
			repoFolder = arg1;
		}

		this._video1 = video1;
		this._video2 = video2;
		this._repoFolder = repoFolder;
		//this.parent();
	},

	loadVideo:function(videoId, onSuccess) {
		if (this._video1) {
			// There Are Videos
			paella.debug.log("[WARN] Feature not implemented!")
		}
		this.loadVideoFromRepository(videoId, onSuccess);
	},

	loadVideoFromRepository:function(videoId, onSuccess) {
		var This = this;

		try {
			var repo = this.getRepository();
		}
		catch(e){}

		if (!repo || repo == "") {
			paella.player.unloadAll(base.dictionary.translate("Error! Repository not defined. Please configure paella!"));
		}
		else{
			var mpUrl = repo + videoId + '/episode.json';
			base.ajax.get({url:mpUrl, params:{}},
				function(data,contentType,code) {
					if (typeof(data)=='string') {
						try {
							data = JSON.parse(data);
						}
						catch (e) {
							paella.player.unloadAll(base.dictionary.translate("Error parsing episode.json."));
						}
					}
					paella.standalone.episode = data;
					This.parseEpisode(onSuccess);
				},
				function(data,contentType,code) {
					paella.player.unloadAll(base.dictionary.translate("Error loading video."));
				}
			);
		}
	},

	getRepository: function() {
		if (this._repoFolder != undefined) {
			return this._repoFolder;
		}
		else {
			try {
				return paella.player.config.standalone.repository;
			}
			catch(e) {
				return "";
			}
		}
	},
	isStreaming:function(trackUrl) {
		return /rtmp:\/\//.test(trackUrl);
	},

	getStreamSource:function(track) {
        if(track.mediainfo && (track.mediainfo.video instanceof Object)) {
		    var res = track.mediainfo.video.resolution.split('x');
        } else {
            var res = new Array(0,0);
        }

		var source = {
				src:  track.url,
				type: track.mimetype,
				res: {w:res[0], h:res[1]},
				isLiveStream: track.live
			};


			if (! /^[a-zA-Z]+:\/\//.test(source.src)) {
				source.src = this.getRepository() + "/" + paella.initDelegate.getId() + "/" + source.src;
			}

		return source;
	},

	parseEpisode: function(onSuccess) {
		var streams = {};
		var tracks = paella.standalone.episode.mediapackage.media.tracks;
		var slides = paella.standalone.episode.mediapackage.slides;
		var blackboards = paella.standalone.episode.mediapackage.blackboard;
		this.frameList = {}



		// Read the tracks!!
		for (var i=0; i<tracks.length; ++i) {
			var currentTrack = tracks[i];
			var currentStream = streams[currentTrack.type];
			if (currentStream == undefined) { currentStream = { sources:{}, preview:'' }; }


			if (this.isStreaming(currentTrack.url)) {
				if ( !(currentStream.sources['rtmp']) || !(currentStream.sources['rtmp'] instanceof Array)){
					currentStream.sources['rtmp'] = [];
				}
				currentStream.sources['rtmp'].push(this.getStreamSource(currentTrack))
			}
			else{
				var videotype = null;
				switch (currentTrack.mimetype) {
					case 'video/mp4':
					case 'video/ogg':
					case 'video/webm':
						videotype = currentTrack.mimetype.split("/")[1];
						break;
					case 'video/x-flv':
						videotype = 'flv';
						break;
					dafault:
						paella.debug.log('StandAloneVideoLoader: MimeType ('+currentTrack.mimetype+') not recognized!');
						break;
				}
				if (videotype){
					if ( !(currentStream.sources[videotype]) || !(currentStream.sources[videotype] instanceof Array)){
						currentStream.sources[videotype] = [];
					}
					currentStream.sources[videotype].push(this.getStreamSource(currentTrack));
				}
			}

			currentStream.preview = currentTrack.preview;
			if (! /^[a-zA-Z]+:\/\//.test(currentStream.preview)) {
				currentStream.preview = this.getRepository() + "/" + paella.initDelegate.getId() + "/" + currentStream.preview;
			}



			streams[currentTrack.type] = currentStream;
		}

		var presenter = streams["presenter/delivery"];
		var presentation = streams["presentation/delivery"];

		// Read the slides
		if (slides) {
			var duration = parseInt(paella.standalone.episode.mediapackage.metadata.duration/1000);
			var imageSource =   {type:"image/jpeg", frames:{}, count:0, duration: duration, res:{w:320, h:180}}
			var thumbSource = {type:"image/jpeg", frames:{}, count:0, duration: duration, res:{w:1280, h:720}}

			for (var i=0; i<slides.length; ++i) {
				var currentSlide = slides[i];

				if (/(\d+):(\d+):(\d+)/.test(currentSlide.time)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);

					
					slideUrl = (currentSlide.slide) ? currentSlide.slide.url : currentSlide.thumb.url;
					thumbUrl = (currentSlide.thumb) ? currentSlide.thumb.url : currentSlide.slide.url;

					if (! /^[a-zA-Z]+:\/\//.test(slideUrl)) {
						slideUrl = this.getRepository() + "/" + paella.initDelegate.getId() + "/" + slideUrl;
					}
					if (! /^[a-zA-Z]+:\/\//.test(thumbUrl)) {
						thumbUrl = this.getRepository() + "/" + paella.initDelegate.getId() + "/" + thumbUrl;
					}

					imageSource.frames["frame_"+time] = slideUrl;
					imageSource.count = imageSource.count +1;
					thumbSource.frames["frame_"+time] = thumbUrl;
					thumbSource.count = thumbSource.count +1;

					this.frameList[time] = {id:'frame_'+time, mimetype:currentSlide.mimetype, time:time, url:slideUrl, thumb:thumbUrl};
				}
			}


			// Set the image stream for presentation
			var imagesArray = [];
			if (imageSource.count > 0) { imagesArray.push(imageSource); }
			if (thumbSource.count > 0) { imagesArray.push(thumbSource); }
			
			if (imagesArray.length > 0) {
				if (presentation == undefined) {
					presentation = { sources:{}, preview:'' };
				}
				presentation.sources.image = imagesArray;
			}
		}


		// Read the blackboard
		if (blackboards) {
			var duration = parseInt(paella.standalone.episode.mediapackage.metadata.duration/1000);
			var thumbSource = {type:"image/jpeg", frames:{}, count:0, duration: duration, res:{w:1280, h:720}}

			for (var i=0; i<blackboards.length; ++i) {
				var currentBlackboard = blackboards[i];

				if (/(\d+):(\d+):(\d+)/.test(currentBlackboard.time)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
					
					thumbUrl = (currentBlackboard.thumb.url);

					if (! /^[a-zA-Z]+:\/\//.test(thumbUrl)) {
						thumbUrl = this.getRepository() + "/" + paella.initDelegate.getId() + "/" + thumbUrl;
					}

					thumbSource.frames["frame_"+time] = thumbUrl;
					thumbSource.count = thumbSource.count +1;
				}
			}


			// Set the image stream for presentation
			var imagesArray = [];
			if (thumbSource.count > 0) { imagesArray.push(thumbSource); }
			
			
			if (imagesArray.length > 0) {
				if (presenter == undefined) {
					presenter = { sources:{}, preview:'' };
				}			
				presenter.sources.image = imagesArray;
			}
		}



		// Finaly push the streams
		if (presenter) { this.streams.push(presenter); }
		if (presentation) { this.streams.push(presentation); }

		// Callback
		this.loadStatus = true;
		
				
		// Load Captions
		var captions = paella.standalone.episode.mediapackage.captions;
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
		
		onSuccess();
	}
});



paella.standalone.StandaloneInitDelegate = Class.create(paella.InitDelegate, {
	initialize:function(config, params) {
		if (!params) {
			params = config;
			config = null;
		}
		this._config = config;
		this.parent(params);
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


// Functions to load Paella
//
function loadStandalonePaella(containerId, config, arg1, arg2) {
	/*
		loadPaella("#paellacontainer", config?, [video1]);
		loadPaella("#paellacontainer", config?, [video1], [video2]);

		loadPaella("#paellacontainer", config?, repoFolder);
		loadPaella("#paellacontainer");
	*/
	var initDelegate = null;
	if ( config instanceof Array || typeof config == 'string' || config instanceof String) {
		arg2 = arg1;
		arg1 = config;
		config = null;
	}

	initDelegate = new paella.standalone.StandaloneInitDelegate(
		config,
		{
			accessControl: new paella.standalone.StandaloneAccessControl(),
			videoLoader: new paella.standalone.StandAloneVideoLoader(arg1, arg2)
		}
	);

	initPaellaEngage(containerId, initDelegate);
}

function loadStandalonePaellaExtended(containerId, config, arg1, arg2) {
	var initDelegate = null;
	if ( config instanceof Array || typeof config == 'string' || config instanceof String) {
		arg2 = arg1;
		arg1 = config;
		config = null;
	}

	initDelegate = new paella.standalone.StandaloneInitDelegate(
		config,
		{
			accessControl: new paella.standalone.StandaloneAccessControl(),
			videoLoader: new paella.standalone.StandAloneVideoLoader(arg1, arg2)
		}
	);

	initPaellaExtended({containerId:containerId, initDelegate:initDelegate});
}



// Data delegates
//
paella.dataDelegates.UserDataDelegate = Class.create(paella.DataDelegate,{
    initialize:function() {
    },

    read:function(context, params, onSuccess) {
    	var value = {
				userName:"userName",
				name: "Name",
				lastname: "Lastname",
				avatar:"plugins/silhouette32.png"
			};

      if (typeof(onSuccess)=='function') { onSuccess(value,true); }
    }
});



 
paella.dataDelegates.StandaloneCaptionsDataDelegate = Class.create(paella.DataDelegate,{	
	initialize:function() {
	},
	
	read:function(context, params, onSuccess) {
		var thisClass = this;
		var id = params.id;
		var captions;
		var ret = {error: true};
		
		
		try { 
			captions = paella.standalone.episode.mediapackage.captions;
		}
		catch(e) {}
		
		
		if (captions){
			if (params.op == "langs") {
				var langs=[];
				captions.forEach(function(c) { 
					langs.push({code: c.lang, text:c.text});
				});
				ret = { error: false, langs: langs };
				if (onSuccess) { onSuccess(ret, true); }			
			}
			else if (params.op == "caption") {
				var selectedCaption;
				captions.forEach(function(c) {
					if (c.lang == params.lang) {
						selectedCaption = c;
					}
				});
				if (selectedCaption){
					var url = selectedCaption.url;
					if (! /^[a-zA-Z]+:\/\//.test(url)) {
						url = paella.player.config.standalone.repository + "/" + params.id + "/" + url;
					}
					
					if (onSuccess) { onSuccess({error: false, url: url, format: selectedCaption.format}, true); }	        
		        }
		        else {
					if (onSuccess) { onSuccess({error: true}, false); }				
		        }			
			}
			else{
				if (onSuccess) { onSuccess({error: true}, false); }				
			}
		}
		else {
			if (onSuccess) { onSuccess({error: true}, false); }			
		}
	},
	
	write:function(context,params,value,onSuccess) {
		if (onSuccess) { onSuccess({}, false); }
	},
	
	remove:function(context,params,onSuccess) {
		if (onSuccess) { onSuccess({}, false); }
	}
});



