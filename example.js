var MyAccessControl = Class.create(paella.AccessControl,{
	checkAccess:function(onSuccess) {
		this.permissions.canRead = true;
		this.permissions.canWrite = true;
		this.permissions.canContribute = true;
		this.permissions.loadError = false;
		this.permissions.isAnonymous = true;
		onSuccess(this.permissions);
	}
});

var MyVideoLoader = Class.create(paella.VideoLoader, {
	loadVideo:function(videoId,onSuccess) {
		var url = paella.utils.parameters.get('id');
		if (url) {
			var stream = {
				sources:{
					mp4:{
						src:url + '/presenter.mp4',
						type:"video/mp4"
						}
					},
				preview:url + '/PRESENTER.jpg'
			};
			this.streams.push(stream);
			
			stream = {
				sources:{
					mp4:{
						src:url + '/presentation.mp4',
						type:"video/mp4"
					},
					image:{
						frames:{frame_0:'test/image/frame_0.jpg',frame_419:'test/image/frame_419.jpg',frame_658:'test/image/frame_658.jpg'},
						duration:928
					}
				},
				preview:url + '/image/frame_0.jpg'
			};
			this.streams.push(stream);
		}
	
		// No thumbnails
		//frameList[timeInstant] = { id:"frame_id", mimetype:"image/jpg", time:timeInstant, url:"image_url"}
		this.frameList = {};
		this.frameList[0] = {id:'frame_0', mimetype:'image/jpg', time:0, url:url + '/image/frame_0.jpg'};
		this.frameList[419] = {id:'frame_419', mimetype:'image/jpg', time:419, url:url + '/image/frame_419.jpg'};
		this.frameList[658] = {id:'frame_658', mimetype:'image/jpg', time:658, url:url + '/image/frame_658.jpg'};

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
