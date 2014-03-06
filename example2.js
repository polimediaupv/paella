var examplePresenterSources = {
	sources:{
		mp4:[	{ src:'/presenter_hi.mp4', type:"video/mp4", res:{w:1280,h:720} },
		 		{ src:'/presenter_hi.mp4', type:"video/mp4", res:{w:640,h:360} } ]
	},
	preview:'/presenter_preview.jpg'
}

var exampleSlidesSources = {
	sources:{
		mp4:[ { src:'/presentation_hi.mp4', type:"video/mp4", res:{w:1024,h:768} },
		{ src:'/presentation_lo.mp4', type:"video/mp4", res:{w:480,h:360} } ],
		image:[ {
			frames:{
				frame_0:'/image/frame_0.jpg',
				frame_364:'/image/frame_364.jpg',
				frame_752:'/image/frame_752.jpg',
				frame_855:'/image/frame_855.jpg'
			},
			type:"image/jpeg",
			duration:907,
			res:{w:1024,h:768}
		} ]
	},
	preview:'/slide_preview.jpg'
}

var exampleFrameList = {}

exampleFrameList[0] = {id:'frame_0', mimetype:'image/jpg', time:0, url:'/image/frame_0.jpg', thumb:'/image/frame_0.jpg'};
exampleFrameList[364] = {id:'frame_364', mimetype:'image/jpg', time:364, url:'/image/frame_364.jpg', thumb:'/image/frame_364.jpg'};
exampleFrameList[752] = {id:'frame_752', mimetype:'image/jpg', time:24, url:'/image/frame_752.jpg', thumb:'/image/frame_752.jpg'};
exampleFrameList[855] = {id:'frame_855', mimetype:'image/jpg', time:855, url:'/image/frame_855.jpg', thumb:'/image/frame_855.jpg'};

var MyAccessControl = Class.create(paella.AccessControl,{
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

var MyVideoLoader = Class.create(paella.VideoLoader, {
	loadVideo:function(videoId,onSuccess) {
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

		// No thumbnails
		//frameList[timeInstant] = { id:"frame_id", mimetype:"image/jpg", time:timeInstant, url:"image_url"}


		//this.frameList[0] = {id:'frame_0', mimetype:'image/jpg', time:0, url:url + '/image/frame_0.jpg'};
		//this.frameList[419] = {id:'frame_419', mimetype:'image/jpg', time:419, url:url + '/image/frame_419.jpg'};
		//this.frameList[658] = {id:'frame_658', mimetype:'image/jpg', time:658, url:url + '/image/frame_658.jpg'};

		// Callback
		this.loadStatus = true;
		onSuccess();
	}
});

function loadPaella(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new MyVideoLoader()});

	initPaellaEngage(containerId,initDelegate);
}

function loadPaellaExtended(containerId) {
	var initDelegate = new paella.InitDelegate({accessControl:new MyAccessControl(),videoLoader:new MyVideoLoader()});

	initPaellaExtended({containerId:containerId,initDelegate:initDelegate});
}

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