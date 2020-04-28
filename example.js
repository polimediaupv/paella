var examplePresenterSources = {
	sources:{
		mp4:[ { src:'/presenter.mp4', type:"video/mp4", res:{w:1280,h:720} },
			  { src:'/presenter.mp4', type:"video/mp4", res:{w:1024,h:768} } ]
	},
	preview:'/PRESENTER.jpg'
}

var exampleSlidesSources = {
	sources:{
		mp4:[ { src:'/presentation.mp4', type:"video/mp4", res:{w:1024,h:768} },
		{ src:'/presentation.mp4', type:"video/mp4", res:{w:640,h:480} } ],
		image:[ {
			frames:{
				frame_0:'/image/frame_0.jpg',
				frame_8:'/image/frame_8.jpg',
				frame_24:'/image/frame_24.jpg',
				frame_48:'/image/frame_48.jpg',
				frame_67:'/image/frame_67.jpg',
				frame_79:'/image/frame_79.jpg',
				frame_145:'/image/frame_145.jpg',
				frame_204:'/image/frame_204.jpg',
				frame_275:'/image/frame_275.jpg',
				frame_314:'/image/frame_314.jpg',
				frame_333:'/image/frame_333.jpg',
				frame_352:'/image/frame_352.jpg',
				frame_382:'/image/frame_382.jpg',
				frame_419:'/image/frame_419.jpg',
				frame_464:'/image/frame_464.jpg',
				frame_496:'/image/frame_496.jpg',
				frame_505:'/image/frame_505.jpg',
				frame_512:'/image/frame_512.jpg',
				frame_521:'/image/frame_521.jpg',
				frame_542:'/image/frame_542.jpg',
				frame_585:'/image/frame_585.jpg',
				frame_593:'/image/frame_593.jpg',
				frame_599:'/image/frame_599.jpg',
				frame_612:'/image/frame_612.jpg',
				frame_613:'/image/frame_613.jpg',
				frame_658:'/image/frame_658.jpg'
			},
			type:"image/jpeg",
			duration:928,
			res:{w:1024,h:768}
		} ]
	},
	preview:'/image/frame_0.jpg'
}

var exampleFrameList = {}

exampleFrameList[0] = {id:'frame_0', mimetype:'image/jpg', time:0, url:'/image/frame_0.jpg', thumb:'/image/frame_0.jpg'};
exampleFrameList[8] = {id:'frame_8', mimetype:'image/jpg', time:8, url:'/image/frame_8.jpg', thumb:'/image/frame_8.jpg'};
exampleFrameList[24] = {id:'frame_24', mimetype:'image/jpg', time:24, url:'/image/frame_24.jpg', thumb:'/image/frame_24.jpg'};
exampleFrameList[48] = {id:'frame_48', mimetype:'image/jpg', time:48, url:'/image/frame_48.jpg', thumb:'/image/frame_48.jpg'};
exampleFrameList[67] = {id:'frame_67', mimetype:'image/jpg', time:67, url:'/image/frame_67.jpg', thumb:'/image/frame_67.jpg'};
exampleFrameList[79] = {id:'frame_79', mimetype:'image/jpg', time:79, url:'/image/frame_79.jpg', thumb:'/image/frame_79.jpg'};
exampleFrameList[145] = {id:'frame_145', mimetype:'image/jpg', time:145, url:'/image/frame_145.jpg', thumb:'/image/frame_145.jpg'};
exampleFrameList[204] = {id:'frame_204', mimetype:'image/jpg', time:204, url:'/image/frame_204.jpg', thumb:'/image/frame_204.jpg'};
exampleFrameList[275] = {id:'frame_275', mimetype:'image/jpg', time:275, url:'/image/frame_275.jpg', thumb:'/image/frame_275.jpg'};
exampleFrameList[314] = {id:'frame_314', mimetype:'image/jpg', time:314, url:'/image/frame_314.jpg', thumb:'/image/frame_314.jpg'};
exampleFrameList[333] = {id:'frame_333', mimetype:'image/jpg', time:333, url:'/image/frame_333.jpg', thumb:'/image/frame_333.jpg'};
exampleFrameList[352] = {id:'frame_352', mimetype:'image/jpg', time:352, url:'/image/frame_352.jpg', thumb:'/image/frame_352.jpg'};
exampleFrameList[382] = {id:'frame_382', mimetype:'image/jpg', time:382, url:'/image/frame_382.jpg', thumb:'/image/frame_382.jpg'};
exampleFrameList[419] = {id:'frame_419', mimetype:'image/jpg', time:419, url:'/image/frame_419.jpg', thumb:'/image/frame_419.jpg'};
exampleFrameList[464] = {id:'frame_464', mimetype:'image/jpg', time:464, url:'/image/frame_464.jpg', thumb:'/image/frame_464.jpg'};
exampleFrameList[496] = {id:'frame_496', mimetype:'image/jpg', time:496, url:'/image/frame_496.jpg', thumb:'/image/frame_496.jpg'};
exampleFrameList[505] = {id:'frame_505', mimetype:'image/jpg', time:505, url:'/image/frame_505.jpg', thumb:'/image/frame_505.jpg'};
exampleFrameList[512] = {id:'frame_512', mimetype:'image/jpg', time:512, url:'/image/frame_512.jpg', thumb:'/image/frame_512.jpg'};
exampleFrameList[521] = {id:'frame_521', mimetype:'image/jpg', time:521, url:'/image/frame_521.jpg', thumb:'/image/frame_521.jpg'};
exampleFrameList[542] = {id:'frame_542', mimetype:'image/jpg', time:542, url:'/image/frame_542.jpg', thumb:'/image/frame_542.jpg'};
exampleFrameList[585] = {id:'frame_585', mimetype:'image/jpg', time:585, url:'/image/frame_585.jpg', thumb:'/image/frame_585.jpg'};
exampleFrameList[593] = {id:'frame_593', mimetype:'image/jpg', time:593, url:'/image/frame_593.jpg', thumb:'/image/frame_593.jpg'};
exampleFrameList[599] = {id:'frame_599', mimetype:'image/jpg', time:599, url:'/image/frame_599.jpg', thumb:'/image/frame_599.jpg'};
exampleFrameList[612] = {id:'frame_612', mimetype:'image/jpg', time:612, url:'/image/frame_612.jpg', thumb:'/image/frame_612.jpg'};
exampleFrameList[613] = {id:'frame_613', mimetype:'image/jpg', time:613, url:'/image/frame_613.jpg', thumb:'/image/frame_613.jpg'};
exampleFrameList[658] = {id:'frame_658', mimetype:'image/jpg', time:658, url:'/image/frame_658.jpg', thumb:'/image/frame_658.jpg'};


class MyAccessControl extends paella.AccessControl {
	checkAccess(onSuccess) {
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
}

// Dual MP4 progressive download
class DualMP4VideoLoader extends paella.VideoLoader {
	loadVideo(videoId,onSuccess) {
		var url = videoId;
		if (url) {
			var stream = examplePresenterSources;
			for(var i = 0; i<stream.sources.mp4.length; i++){
				stream.sources.mp4[i].src = url + stream.sources.mp4[i].src;
			}

			stream.preview = url + stream.preview;
			this.streams.push(stream);

			stream = exampleSlidesSources;
			for(var i = 0; i<stream.sources.mp4.length; i++){
				stream.sources.mp4[i].src = url + stream.sources.mp4[i].src;
			}

			stream.preview = url + stream.preview;
			for (var key in stream.sources.image.frames) {
				stream.sources.image.frames[key] = url + stream.sources.image.frames[key];
			}
			this.streams.push(stream);

			this.frameList = exampleFrameList;
			for (var key in this.frameList) {
				this.frameList[key].url = url + this.frameList[key].url;
				this.frameList[key].thumb = url + this.frameList[key].thumb;
			}
		}

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
}


// Dual Live RTMP Stream
class DualLiveRTMPStreamVideoLoader extends paella.VideoLoader {
	loadVideo(videoId,onSuccess) {
		var stream = {
			sources:{
				rtmp:[ { src:'rtmp://melpomene.upv.es/live/PRUEBAS', type:'video/x-flv', res:{w:1280,h:720}, isLiveStream:true} ]
			}
		}
		this.streams.push(stream);

		stream = {
			sources:{
				rtmp:[ { src:'rtmp://melpomene.upv.es/live/PRUEBAS', type:'video/x-flv', res:{w:1280,h:720}, isLiveStream:true} ]
			}
		}
		this.streams.push(stream);

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
}

// Live RTMP Stream
class LiveRTMPStreamVideoLoader extends paella.VideoLoader {
	loadVideo(videoId,onSuccess) {
		var stream = {
			sources:{
				rtmp:[ { src:'rtmp://melpomene.upv.es/live/PRUEBAS', type:'video/x-flv', res:{w:1280,h:720}, isLiveStream:true} ]
			}
		}
		this.streams.push(stream);

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
}

// RTMP/mp4 stream
class Mp4RTMPStreamVideoLoader extends paella.VideoLoader {
	loadVideo(videoId,onSuccess) {
		var stream = {
			sources:{
				rtmp:[ { src:'rtmp://polimedia.upv.es/vod/mp4:link/cursos/Profesores_POLIMEDIA_I/M98/B14/polimedia_muxed.mp4', type:'video/mp4', res:{w:1280,h:720}, isLiveStream:false}]
			}
		}
		this.streams.push(stream);

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
}

// RTMP/flv stream
class FlvRTMPStreamVideoLoader extends paella.VideoLoader {
	loadVideo(videoId,onSuccess) {
		var stream = {
			sources:{
				rtmp:[ { src:'rtmp://mhopencast.ethz.ch/matterhorn-engage/engage-player/1e6fdeaf-a28b-453e-ba7c-44eb62040eb8/ab72ddbe-10f3-4cb0-8261-e5567b8c242c/CAMERA', type:'video/x-flv', res:{w:1280,h:720}, isLiveStream:false} ]
			}
		}
		this.streams.push(stream);

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
}


// Dual rtmp streams
class DualRTMPVideoLoader extends paella.VideoLoader {
	loadVideo(videoId,onSuccess) {
		var stream = {
			sources:{
				rtmp:[ { src:'rtmp://mhopencast.ethz.ch/matterhorn-engage/engage-player/1e6fdeaf-a28b-453e-ba7c-44eb62040eb8/ab72ddbe-10f3-4cb0-8261-e5567b8c242c/CAMERA', type:'video/x-flv', res:{w:1280,h:720}, isLiveStream:false} ]
			}
		}
		this.streams.push(stream);

		stream = {
			sources:{
				rtmp:[ { src:'rtmp://polimedia.upv.es/vod/mp4:link/cursos/Profesores_POLIMEDIA_I/M98/B14/polimedia_muxed.mp4', type:'video/mp4', res:{w:1280,h:720}, isLiveStream:false}]
			}
		}
		this.streams.push(stream);

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
}


function loadPaella(containerId) {
//	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new DualMP4VideoLoader()});
//	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new DualLiveRTMPStreamVideoLoader()});
//	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new LiveRTMPStreamVideoLoader()});
	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new Mp4RTMPStreamVideoLoader()});
//	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new FlvRTMPStreamVideoLoader()});
//	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new DualRTMPVideoLoader()});

	initPaellaEngage(containerId,initDelegate);
}

function loadPaellaExtended(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new MyVideoLoader()});

	initPaellaExtended({containerId:containerId,initDelegate:initDelegate});
}

class UserDataDelegate extends paella.DataDelegate {
    constructor() {
    }

    read(context, params, onSuccess) {
    	var value = {
			userName:"userName",
			name: "Name",
			lastname: "Lastname",
			avatar:"plugins/silhouette32.png"
		};

        if (typeof(onSuccess)=='function') { onSuccess(value,true); }
    }
}

paella.dataDelegates.UserDataDelegate = UserDataDelegate;
