function EpisodeParser() {
	this.streams = [];
	this.frameList = [];

	var metadata = {};
	var blackboard = null;

	function parseBlackboard(blackboards) {
		blackboard = { frames:[] };
		for (var i=0; i<blackboards.length; ++i) {
			var currentBlackboard = blackboards[i];
			if (!blackboard.duration) {
				blackboard.duration = metadata.duration;
			}
			if (!blackboard.mimetype) {
				blackboard.mimetype = currentBlackboard.mimetype;
			}
			if (!blackboard.res) {
				blackboard.res = { w:0, h:0 };
			}

			if (/(\d+):(\d+):(\d+)/.test(currentBlackboard.time)) {
				var time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
				var src = (currentBlackboard.thumb.url);

				blackboard.frames.push({ time:time, src:src });
			}
		}
	}

	function isStreaming(trackUrl) {
		return /rtmp:\/\//.test(trackUrl);
	}

	function getStreamSource(track) {
		var res = [0,0];
		if(track.mediainfo && (track.mediainfo.video instanceof Object)) {
			res = track.mediainfo.video.resolution.split('x');
		}

		var source = {
			src:  track.url,
			mimetype: track.mimetype,
			res: {w:res[0], h:res[1]},
			isLiveStream: track.live
		};
		if (track.live) {
			source.isLiveStream = true;
		}

		return source;
	}

	function parseMetadata(sourceMetadata) {
		metadata.duration = sourceMetadata.duration/1000;
		metadata.title = sourceMetadata.title;
	}

	this.getOutput = function() {
		var data = {
			metadata:metadata,
			streams:this.streams
		};

		if (this.frameList && this.frameList.length>0) {
			data.frameList = this.frameList;
		}

		if (this.captions) {
			data.captions = this.captions;
		}

		if (blackboard) {
			data.blackboard = blackboard;
		}

		return JSON.stringify(data, null, "\t");
	}

	this.parse = function(filePath) {
		var episode = require('./' + filePath);
		this.path = filePath.split('/');
		this.path.pop();
		this.path = this.path.join('/') + '/';

		var streams = {};
		var tracks = episode.mediapackage.media.tracks;
		var slides = episode.mediapackage.slides;
		var blackboards = episode.mediapackage.blackboard;

		// Read the tracks!!
		for (var i=0; i<tracks.length; ++i) {
			var currentTrack = tracks[i];
			var currentStream = streams[currentTrack.type];
			if (currentStream == undefined) { currentStream = { sources:{}, preview:'' }; }


			if (isStreaming(currentTrack.url)) {
				if ( !(currentStream.sources['rtmp']) || !(currentStream.sources['rtmp'] instanceof Array)){
					currentStream.sources['rtmp'] = [];
				}
				currentStream.sources['rtmp'].push(getStreamSource(currentTrack))
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
					currentStream.sources[videotype].push(getStreamSource(currentTrack));
				}
			}

			currentStream.preview = currentTrack.preview;

			streams[currentTrack.type] = currentStream;
		}

		var presenter = streams["presenter/delivery"];
		var presentation = streams["presentation/delivery"];

		if (episode.mediapackage.metadata) {
			parseMetadata(episode.mediapackage.metadata);
		}

		// Read the slides
		if (slides) {
			var duration = parseInt(episode.mediapackage.metadata.duration/1000);
			var imageSource =   {mimetype:"image/jpeg", frames:[], count:0, duration: duration, res:{w:320, h:180}}
			var thumbSource = {mimetype:"image/jpeg", frames:[], count:0, duration: duration, res:{w:1280, h:720}}

			for (var i=0; i<slides.length; ++i) {
				var currentSlide = slides[i];

				if (/(\d+):(\d+):(\d+)/.test(currentSlide.time)) {
					time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);


					slideUrl = (currentSlide.slide) ? currentSlide.slide.url : currentSlide.thumb.url;
					thumbUrl = (currentSlide.thumb) ? currentSlide.thumb.url : currentSlide.slide.url;

					imageSource.frames.push({ time:time, src:slideUrl });
					imageSource.count = imageSource.count +1;
					thumbSource.frames.push({ time:time, src:thumbUrl });
					thumbSource.count = thumbSource.count +1;

					this.frameList.push({id:'frame_'+time, mimetype:currentSlide.mimetype, time:time, url:slideUrl, thumb:thumbUrl});
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
			parseBlackboard(blackboards);
		}

		// Finaly push the streams
		if (presenter) { this.streams.push(presenter); }
		if (presentation) { this.streams.push(presentation); }

		// Load Captions
		this.captions = episode.mediapackage.captions;
	};
};

if (process.argv.length<3) {
	console.log("usage: node convert.js in_file");
}
else {
	var fs = require('fs');
	var outFilePath = process.argv[2].split('/');
	outFilePath.pop();
	outFilePath = outFilePath.join('/') + '/data.json';

	var parser = new EpisodeParser();
	parser.parse(process.argv[2]);
	fs.writeFileSync(outFilePath,parser.getOutput());
}
