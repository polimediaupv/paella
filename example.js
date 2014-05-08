//
// paella-standalone
//

paella.standalone = {}

// Standalone Access Control
//
// By default read/write access 
var StandaloneAccessControl = Class.create(paella.AccessControl,{
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
var StandAloneVideoLoader = Class.create(paella.VideoLoader, {
	loadVideo:function(videoId, onSuccess) {
		var This = this;
		
		try {
			var repo = paella.player.config.standalone.reposiroty
		}
		catch(e){}
		
		if (!repo) {
			paella.player.unloadAll(paella.dictionary.translate("Error! Repository not defined config file. Please configure paella!"));
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
							paella.player.unloadAll(paella.dictionary.translate("Error parsing episode.json."));
						}
					}				
					paella.standalone.episode = data;
					This.parseEpisode(onSuccess);
				},
				function(data,contentType,code) {
					paella.player.unloadAll(paella.dictionary.translate("Error loading video."));
				}
			);
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
				res: {w:res[0], h:res[1]}
			};

		return source;
	},
		
	parseEpisode: function(onSuccess) {
		var streams = {};
		var tracks = paella.standalone.episode.mediapackage.media.tracks;
		var slides = paella.standalone.episode.mediapackage.slides;
		this.frameList = {}



		// Read the tracks!!
		for (var i=0; i<tracks.length; ++i) {
			var currentTrack = tracks[i];
			var currentStream = streams[currentTrack.type];
			if (currentStream == undefined) { currentStream = { sources:{}, preview:'' }; }
			
			
			if (this.isStreaming(currentTrack)) {
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

					imageSource.frames["frame_"+time] = currentSlide.slide.url;
					imageSource.count = imageSource.count +1;
					thumbSource.frames["frame_"+time] = currentSlide.thumb.url;
					thumbSource.count = thumbSource.count +1;
                	
                	this.frameList[time] = {id:'frame_'+time, mimetype:currentSlide.mimetype, time:time, url:currentSlide.slide.url, thumb:currentSlide.thumb.url};
				}			
			}
			
			
			// Set the image stream for presentation
			var imagesArray = [];
			if (presentation != undefined) {
				if (imageSource.count > 0) { imagesArray.push(imageSource); }
				if (thumbSource.count > 0) { imagesArray.push(thumbSource); }
				if (imagesArray.length > 0) {
					presentation.sources.image = imagesArray; 
				}
			}
		}		
		
		// Finaly push the streams
		if (presenter) { this.streams.push(presenter); }
		if (presentation) { this.streams.push(presentation); }

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
});



// Functions to load Paella
// 
function loadPaella(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new StandaloneAccessControl(), videoLoader:new StandAloneVideoLoader()});
	
	initPaellaEngage(containerId,initDelegate);
}

function loadPaellaExtended(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new StandaloneAccessControl(), videoLoader:new StandAloneVideoLoader()});
	
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