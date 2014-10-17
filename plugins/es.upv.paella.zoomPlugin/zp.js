Class ("paella.ZoomPlugin", paella.VideoOverlayButtonPlugin,{
	_zImages:null,
	_isActivated:false,
	_keys:null,
	_ant:null,
	_next:null,
	_videoLength:null,
	_compChanged:false,
	_restartPlugin:false,

	getIndex:function(){return 20;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "zoomButton"; },

	getDefaultToolTip:function() { return base.dictionary.translate("Zoom");},

	checkEnabled:function(onSuccess) {
		// CHECK IF THE VIDEO HAS HIRESIMAGES
		var n = paella.player.videoContainer.sourceData;

		for(i=0; i < n.length; i++){
			if(n[i].sources.hasOwnProperty("image")){
				onSuccess(true);
			} else if(i == n.length) onSuccess(false);
		}
	},

	setup:function() {
		var self = this;
		
		//  BRING THE IMAGE ARRAY TO LOCAL
		this._zImages = {};
		var n = paella.player.videoContainer.sourceData;
		var n_res = 0;

		this._zImages = paella.player.videoContainer.sourceData[0].sources.image[0].frames; // COPY TO LOCAL
		this._videoLength = paella.player.videoContainer.sourceData[0].sources.image[0].duration; // video duration in frames
		
		// REMOVE ON COMPOSITION CHANGE
		paella.events.bind(paella.events.setComposition, function(event,params) {
			self.compositionChanged(event,params);
		});

		// BIND TIMEUPDATEVENT	
		paella.events.bind(paella.events.timeUpdate, function(event,params) { 
			self.imageUpdate(event,params);
		});

		// SORT KEYS FOR SEARCH CLOSEST
		this._keys = Object.keys(this._zImages);
		this._keys = this._keys.sort(function(a, b){
			a = a.slice(6);
			b = b.slice(6);
			return parseInt(a)-parseInt(b); 
		});

		//NEXT
		this._next = 0;
		this._ant = 0;
	},

	imageUpdate:function(event,params) {
		if(this._isActivated){

			var self = this;
			var sec = Math.round(params.currentTime);
			var src = $("#photo_01")[0].src;

			if($('.newframe').length>0){

				if(this._zImages.hasOwnProperty("frame_"+sec)) { // SWAP IMAGES WHEN PLAYING
					if(src == this._zImages["frame_"+sec]) return;
					else src = this._zImages["frame_"+sec]; 
					}

				else if(sec > this._next || sec < this._ant || self._compChanged) { 
					if(self._compChanged) self._compChanged = false;
					src = self.returnSrc(sec); 
					} // RELOAD IF OUT OF INTERVAL
					else return;

					$("#photo_01").attr('src',src).load();
					if($(".zoomContainer").length<1) // only 1 zoomcontainer
						$("#photo_01").elevateZoom({ zoomType	: "inner", cursor: "crosshair", scrollZoom : true }); // ZOOM
			

					//PRELOAD NEXT IMAGE
					var image = new Image();
					image.onload = function(){
	    			$( ".zoomWindow" ).css('background-image', 'url(' + src + ')'); // UPDATING IMAGE
					};
					image.src = src;

					
					// OPEN NEW WINDOW WITH FULLSCREEN IMAGE

					$("#photo_link").attr("href", src).attr("target","_blank");

				
			}
		}
		
	},

	returnSrc:function(sec){

		var ant = 0;
		for (i=0; i<this._keys.length; i++){
			var id = parseInt(this._keys[i].slice(6));
			var lastId = parseInt(this._keys[(this._keys.length-1)].slice(6));
			if(sec < id) {  // PREVIOUS IMAGE
				this._next = id; 
				this._ant = ant; 
				return this._zImages["frame_"+ant];} // return previous and keep next change
			else if(sec > lastId && sec < this._videoLength){ // LAST INTERVAL
					this._next = this._videoLength;
					this._ant = lastId;
					return this._zImages["frame_"+ant]; 
			}
				else ant = id;
		}
	},

	createOverlay:function(){
		var self = this;
		var newframe = document.createElement("div");
			newframe.className = "newframe";
			newframe.setAttribute('style', 'display: table;');
			
			// IMAGE
			var hiResImage = document.createElement('img');
   			hiResImage.className = 'frameHiRes';
   			// GET IMAGE FOR TIMELINE

   			var link = document.createElement('a');
   			link.setAttribute("id", "photo_link");

       		//hiResImage.setAttribute('src',"resources/style/000000.png");
        	hiResImage.setAttribute('style', 'width: 100%;');
        	hiResImage.setAttribute("id", "photo_01");

        	$(link).append(hiResImage);
        	$(newframe).append(link);

        	// OVERLAY
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getMasterRect());
			$(".newframe").css("background-color","rgba(80,80,80,0.4)");
			$(".newframe img").css("opacity","0");
	},

	action:function(button) {
		var self = this;
		if($('.newframe').length<1){
			//CREATE OVERLAY
			self.createOverlay();
			self._compChanged = true;
			this._isActivated = true;
		}
		else { // IF EXISTS REMOVE ON CLICK
			$( ".newframe" ).remove();
			this._isActivated = false;
		}

	},

	compositionChanged:function(event,params){
		var self = this;
		if($('.newframe').length>0){
			$( ".newframe" ).remove();// REMOVE PLUGIN
			self.createOverlay();//CALL AGAIN
		}
		self._compChanged = true;
	},


		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
