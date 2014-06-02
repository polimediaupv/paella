paella.plugins.ImageControlPlugin = Class.create(paella.ButtonPlugin,{
	button:null,
	frames:null,
	activeImageZoom:false,
	highResFrames:null,
	currentFrame:null,
	contx:null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "imageZoom"; },
	getIndex:function() { return 511; },
	getMinWindowSize:function() { return 200; },
	getName:function() { return "es.upv.paella.ImageControlPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Enlarge presenter"); },	
	checkEnabled:function(onSuccess) { 
		var thisClass = this;
		paella.data.read('images',{},function(data,status) {
				onSuccess((data && typeof(data)=='object'));
		});
	},

	action:function(button) {
		this.button = button;
		if (this.activeImageZoom) {
			this.removeHiResFrame();
			this.activeImageZoom = false;
		} else { 
			this.activeImageZoom = true;
		}
	},

	buildContent:function(domElement) {
		var This = this;
		this.frames = [];
		
		var images;
		paella.data.read('images',{},function(data,status) {
				images = data;
		});

		if (images) {
			var numImages = 0;
			for (var key in images) {
				var frameItem = this.getFrame(images[key]);
				this.frames.push(frameItem);
				++numImages;
			}
		}
				
		paella.events.bind(paella.events.timeupdate,function(event,params) { This.onTimeUpdate(params.currentTime) });
	},
	
	showHiResFrame:function(url) {
		var frameRoot = document.createElement("div"); 
		var frame = document.createElement("div"); 
		var hiResImage = document.createElement('img'); 
        hiResImage.className = 'frameHiRes';
        hiResImage.setAttribute('src',url);
        hiResImage.setAttribute('style', 'width: 100%;');

		$(frame).append(hiResImage);
		$(frameRoot).append(frame);

        frameRoot.setAttribute('style', 'display: table;');
        frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');
		overlayContainer = paella.player.videoContainer.overlayContainer;
		
		var streams = paella.initDelegate.initParams.videoLoader.streams;
		if (streams.length == 1){
			overlayContainer.addElement(frameRoot, overlayContainer.getMasterRect());
		}
		else if (streams.length >= 2){
			overlayContainer.addElement(frameRoot, overlayContainer.getSlaveRect());
		}
		this.hiResFrame = frameRoot;
	},

	removeHiResFrame:function() {
		overlayContainer = paella.player.videoContainer.overlayContainer;
		if (this.hiResFrame) overlayContainer.removeElement(this.hiResFrame);
	},
	
	getFrame:function(frameData,id) {
		var frame = {};
		if (id) frame.id = id;
		if (frameData) {
			frame.frameData = frameData;
			frame.frameControl = this;
			image = frameData.thumb ? frameData.thumb:frameData.url;	
		}
		return frame;
	},
	
	onTimeUpdate:function(currentTime) {
		var frame = null;
		for (var i = 0; i<this.frames.length; ++i) {
			if (this.frames[i].frameData.time<=currentTime) {
				frame = this.frames[i];
			}
			else {
				break;
			}
		}
	
		/**/try{this.removeHiResFrame();}catch(e){}

		this.currentFrame = frame;
		if (this.activeImageZoom) this.showHiResFrame(this.currentFrame.frameData.url);
	}
});

paella.plugins.imageControlPlugin = new paella.plugins.ImageControlPlugin();


paella.dataDelegates.ImageZoomDataDelegate = Class.create(paella.DataDelegate,{
    initialize:function() {
    },

    read:function(context,params,onSuccess) {
        //if (typeof(params)=='object') params = JSON.stringify(params);

        var value = paella.initDelegate.initParams.videoLoader.frameList;

        try {
            value = JSON.parse(value);
        }
        catch (e) {}
        if (typeof(onSuccess)=='function') {
            onSuccess(value,true);
        }
    }

});