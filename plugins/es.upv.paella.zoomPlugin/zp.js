Class ("paella.ZoomPlugin", paella.VideoOverlayButtonPlugin,{
	_zImages:null,
	_isActivated:false,
	_keys:null,
	_ant:null,
	_next:null,
	_videoLength:null,
	_compChanged:false,
	_restartPlugin:false,
	_actualImage: null,
	_zoomIncr: null,
	_maxZoom: null,
	_minZoom: null,

	getIndex:function(){return 20;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "zoomButton"; },

	getDefaultToolTip:function() { return base.dictionary.translate("Zoom");},

	checkEnabled:function(onSuccess) {
		// CHECK IF THE VIDEO HAS HIRESIMAGES
		var n = paella.player.videoContainer.sourceData[0].sources;

		if(n.hasOwnProperty("image"))onSuccess(true);
		else onSuccess(false);
		
	},

	setupIcons:function(){
		var self = this;

		var iconsFrame = document.createElement("div");
			iconsFrame.className = "iconsFrame";

		var buttonZoomIn = document.createElement("button");
			buttonZoomIn.className = "buttonZoomIn";

		var buttonZoomOut = document.createElement("button");
			buttonZoomOut.className = "buttonZoomOut";

		var buttonSnapshot = document.createElement("button");
			buttonSnapshot.className = "buttonSnapshot";
			buttonSnapshot.type = "button";

		$(iconsFrame).append(buttonSnapshot);
		$(iconsFrame).append(buttonZoomIn);
		$(iconsFrame).append(buttonZoomOut);

		$(".newframe").append(iconsFrame);
       	
       	$(iconsFrame).mouseleave(function() {
   			 $('.zoomFrame').css('opacity','0');
  			});
  		$(iconsFrame).mouseenter(function() {
   			 $('.zoomFrame').css('opacity','1');
  			});

		$(".buttonSnapshot").click(function(){
			if(self._actualImage != null)
			window.open(self._actualImage, "_blank");
		});

		$(".buttonZoomIn").click(function(){
			self.zoomIn();
		});

		$(".buttonZoomOut").click(function(){
			self.zoomOut();
		});


	},

	setup:function() {
		var self = this;
		
		self._maxZoom = self.config.maxZoom || 500;
		self._minZoom = self.config.minZoom || 100;
		self._zoomIncr = self.config.zoomIncr || 10;


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
			var src = $( ".zoomFrame" ).css('background-image');

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

					//PRELOAD NEXT IMAGE
					var image = new Image();
					image.onload = function(){
	    			$( ".zoomFrame" ).css('background-image', 'url(' + src + ')'); // UPDATING IMAGE
					};
					image.src = src;

					// OPEN NEW WINDOW WITH FULLSCREEN IMAGE
					self._actualImage = src;

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

        	// ZOOM
        	var zoomframe = document.createElement("div");
			zoomframe.className = "zoomFrame";	
      		newframe.insertBefore(zoomframe,newframe.firstChild);

        	// OVERLAY
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getMasterRect());

			//BIND MOUSEWHEEL
		    $(zoomframe).bind('mousewheel', function(e){
        		if(e.originalEvent.wheelDelta /120 > 0) {
            		self.zoomIn();
        		}
        		else{
            		self.zoomOut();
        		}
        	});

        	//BIND MOUSE HOVER ( IN - OUT )
        	$(zoomframe).mouseleave(function() {
   			 $('.zoomFrame').css('opacity','0');
  			});
  			$(zoomframe).mouseenter(function() {
   			 $('.zoomFrame').css('opacity','1');
  			});

  			//BIND MOVEMENT
  			$(zoomframe).mousemove(function(){
  				self.mouseMove();
  			});
	},

	mouseMove:function(){

		var p = $(".zoomFrame");
		var pos = p.offset();

		var width = $('.zoomFrame').width();
		var height = $('.zoomFrame').height();
		var px = event.clientX-pos.left;
		var py = event.clientY-pos.top;
		var positionx = Math.round(px * 100 / width);
		var positiony = Math.round(py * 100 / height);

		$('.zoomFrame').css('background-position',positionx+"% "+positiony+"%");
	},

	zoomIn:function(){
		var self = this;

		z = $('.zoomFrame').css('background-size');
		z = z.split(" ");
		z = parseInt(z[0]);

		if(z < self._maxZoom){
			$('.zoomFrame').css('background-size',z+self._zoomIncr+"% auto");
		}	
	},

	zoomOut:function(){
		var self = this;

		z = $('.zoomFrame').css('background-size');
		z = z.split(" ");
		z = parseInt(z[0]);

		if(z > self._minZoom){
			$('.zoomFrame').css('background-size',z-self._zoomIncr+"% auto");
		}	
	},

	action:function(button) {
		var self = this;
		if($('.newframe').length<1){
			//CREATE OVERLAY
			self.createOverlay();
			self.setupIcons();
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
			self.setupIcons();
		}
		self._compChanged = true;
	},

	getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
