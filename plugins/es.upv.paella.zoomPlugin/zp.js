Class ("paella.ZoomPlugin", paella.EventDrivenPlugin,{
	_zImages:null,
	_imageNumber:null,
	_isActivated:false,
	_isCreated:false,
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
	_dragMode: false,
	_mouseDownPosition: null,

	getIndex:function(){return 20;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "zoomButton"; },

	getDefaultToolTip:function() { return base.dictionary.translate("Zoom");},

	getEvents:function() {
		return[
			paella.events.timeUpdate,
			paella.events.setComposition,
			paella.events.loadPlugins,
			paella.events.play
		];
    },

    onEvent:function(event, params){
    	var self = this;
    	switch(event){
    		case paella.events.timeUpdate: this.imageUpdate(event,params); break;
    		case paella.events.setComposition: this.compositionChanged(event,params); break;
    		case paella.events.loadPlugins: this.loadPlugin(event,params); break;
			case paella.events.play: this.exitPhotoMode(); break;
    	}
    },
	checkEnabled:function(onSuccess) {
		if (paella.player.videoContainer.sourceData.length<2) {
			onSuccess(false);
			return;
		}

		// CHECK IF THE VIDEO HAS HIRESIMAGES
		var n = paella.player.videoContainer.sourceData[0].sources;

		if(n.hasOwnProperty("image"))onSuccess(true);
		else onSuccess(false);
	},

	setupIcons:function(){
		var self = this;
		var width = $('.zoomFrame').width();
		//ARROWS
		var arrowsLeft = document.createElement("div");
		arrowsLeft.className = "arrowsLeft";
		arrowsLeft.style.display = 'none';

		var arrowsRight = document.createElement("div");
		arrowsRight.className = "arrowsRight";
		arrowsRight.style.display = 'none';
		arrowsRight.style.left = (width-24)+'px';

		$(arrowsLeft).click(function(){
			self.arrowCallLeft();
			event.stopPropagation();
		});
		$(arrowsRight).click(function(){
			self.arrowCallRight();
			event.stopPropagation();
		});

		//ICONS
		var iconsFrame = document.createElement("div");
		iconsFrame.className = "iconsFrame";

		var buttonZoomIn = document.createElement("button");
		buttonZoomIn.className = "zoomActionButton buttonZoomIn";
		buttonZoomIn.style.display = 'none';

		var buttonZoomOut = document.createElement("button");
		buttonZoomOut.className = "zoomActionButton buttonZoomOut";
		buttonZoomOut.style.display = 'none';

		var buttonSnapshot = document.createElement("button");
		buttonSnapshot.className = "zoomActionButton buttonSnapshot";
		buttonSnapshot.style.display = 'none';

		var buttonZoomOn = document.createElement("button");
		buttonZoomOn.className = "zoomActionButton buttonZoomOn";

		$(iconsFrame).append(buttonZoomOn);
		$(iconsFrame).append(buttonSnapshot);
		$(iconsFrame).append(buttonZoomIn);
		$(iconsFrame).append(buttonZoomOut);

		$(".newframe").append(iconsFrame);
		$(".newframe").append(arrowsLeft);
		$(".newframe").append(arrowsRight);

		$(buttonZoomOn).click(function(){
			if(self._isActivated){
				self.exitPhotoMode();
				$('.zoomActionButton.buttonZoomOn').removeClass("clicked");
			}
			else{
				self.enterPhotoMode();
				//clicked
				$('.zoomActionButton.buttonZoomOn').addClass("clicked");
			}
			event.stopPropagation();
		});

		$(buttonSnapshot).click(function(){
			if(self._actualImage != null)
			window.open(self._actualImage, "_blank");
			event.stopPropagation();
		});

		$(buttonZoomIn).click(function(){
			self.zoomIn();
			event.stopPropagation();
		});

		$(buttonZoomOut).click(function(){
			self.zoomOut();
			event.stopPropagation();
		});
	},
	
	enterPhotoMode:function() {
		var self = this;

		$( ".zoomFrame" ).show();
		$( ".zoomFrame").css('opacity','1');
		this._isActivated = true;
		// SHOW ZOOM ICONS
		$('.buttonSnapshot').show();
		$('.buttonZoomOut').show();
		$('.buttonZoomIn').show();
		//ARROWS
		$('.arrowsRight').show();
		$('.arrowsLeft').show();
		paella.player.pause();

		//UPDATE ARROWS
		if(self._imageNumber <= 1) $('.arrowsLeft').hide(); else if(this._isActivated) $('.arrowsLeft').show();
		if(self._imageNumber >= self._keys.length-2) $('.arrowsRight').hide(); else if(this._isActivated) $('.arrowsRight').show();
	},
	
	exitPhotoMode:function() {
		$( ".zoomFrame" ).hide();
		this._isActivated = false;
		// HIDE ZOOM ICONS
		$('.buttonSnapshot').hide();
		$('.buttonZoomOut').hide();
		$('.buttonZoomIn').hide();
		//ARROWS
		$('.arrowsRight').hide();
		$('.arrowsLeft').hide();
		$('.zoomActionButton.buttonZoomOn').removeClass("clicked");
	},

	setup:function() {
		var self = this;
		
		self._maxZoom = self.config.maxZoom || 500;
		self._minZoom = self.config.minZoom || 100;
		self._zoomIncr = self.config.zoomIncr || 10;


		//  BRING THE IMAGE ARRAY TO LOCAL
		this._zImages = {};
		this._zImages = paella.player.videoContainer.sourceData[0].sources.image[0].frames; // COPY TO LOCAL
		this._videoLength = paella.player.videoContainer.sourceData[0].sources.image[0].duration; // video duration in frames

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

	loadPlugin:function(){
		var self = this;
		if(self._isCreated == false){
			self.createOverlay();
			self.setupIcons();
			$( ".zoomFrame" ).hide();
			self._isActivated = false;
			self._isCreated = true;
		}
	},

	imageUpdate:function(event,params) {

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

					// UPDATE ARROWS
					if(self._imageNumber <= 1) $('.arrowsLeft').hide(); else if(this._isActivated) $('.arrowsLeft').show();
					if(self._imageNumber >= self._keys.length-2) $('.arrowsRight').hide(); else if(this._isActivated) $('.arrowsRight').show();
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
				this._imageNumber = i-1;
				return this._zImages["frame_"+ant];} // return previous and keep next change
			else if(sec > lastId && sec < this._videoLength){ // LAST INTERVAL
					this._next = this._videoLength;
					this._ant = lastId;
					return this._zImages["frame_"+ant]; 
			}
				else ant = id;
		}
	},
	arrowCallLeft:function(){
		var self=this;
		if(self._imageNumber-1 >= 0){
			var frame = self._keys[self._imageNumber-1];
			self._imageNumber -= 1;
			paella.player.videoContainer.seekToTime(parseInt(frame.slice(6)));
		}
	},
	arrowCallRight:function(){
		var self=this;
		if(self._imageNumber+1 <= self._keys.length){
			var frame = self._keys[self._imageNumber+1];
			self._imageNumber += 1;
			paella.player.videoContainer.seekToTime(parseInt(frame.slice(6)));
		}
	},

	createOverlay:function(){
			var self = this;

			var newframe = document.createElement("div");
			newframe.className = "newframe";
			
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getMasterRect());

			var zoomframe = document.createElement("div");
			zoomframe.className = "zoomFrame";	
      		newframe.insertBefore(zoomframe,newframe.firstChild);
			$(zoomframe).click(function(event) {
				event.stopPropagation();
			});


      		// BINDS JQUERY
      		$(zoomframe).bind('mousewheel', function(e){
        		if(e.originalEvent.wheelDelta /120 > 0) {
            		self.zoomIn();
        		}
        		else{
            		self.zoomOut();
        		}
        	});

        	//BIND MOUSE HOVER ( IN - OUT )
        	//$(zoomframe).mouseleave(function() {
   			// $('.zoomFrame').css('opacity','0');
  			//});
  			//$(zoomframe).mouseenter(function() {
   			// $('.zoomFrame').css('opacity','1');
  			//});

  			//BIND MOVEMENT
			$(zoomframe).mousedown(function(event) {
				self.mouseDown(event.clientX,event.clientY);
			});
			
			$(zoomframe).mouseup(function(event) {
				self.mouseUp();
			});
			
			$(zoomframe).mouseleave(function(event) {
				self.mouseLeave();
			});
			
  			$(zoomframe).mousemove(function(event){
  				self.mouseMove(event.clientX,event.clientY);
  			});

	},

	mouseDown:function(x,y) {
		this._dragMode = true;
		this._mouseDownPosition = { x:x, y:y };
	},
	
	mouseUp:function() {
		this._dragMode = false;
	},
	
	mouseLeave:function() {
		this._dragMode = false;
	},
	
	mouseMove:function(x,y){
		if (this._dragMode) {
			var p = $(".zoomFrame")[0];
			var pos = this._backgroundPosition ? this._backgroundPosition:{left:0,top:0};

			var width = $('.zoomFrame').width();
			var height = $('.zoomFrame').height();
			
			var px = this._mouseDownPosition.x - x;
			var py = this._mouseDownPosition.y - y;
			
			var positionx = pos.left + px;
			var positiony = pos.top + py;
			positionx = positionx>=0 ? positionx:0;
			positionx = positionx<=100 ? positionx:100;
			positiony = positiony>=0 ? positiony:0;
			positiony = positiony<=100 ? positiony:100;

			$('.zoomFrame').css('background-position',positionx+"% "+positiony+"%");
			this._backgroundPosition = { left:positionx, top:positiony };
			this._mouseDownPosition.x = x;
			this._mouseDownPosition.y = y;
		}
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

	imageUpdateOnPause:function(params) {
			var self = this;
			var sec = Math.round(params);
			var src = $( ".zoomFrame" ).css('background-image');

			if($('.newframe').length>0 && src != self._actualImage){

				if(this._zImages.hasOwnProperty("frame_"+sec)) { // SWAP IMAGES WHEN PLAYING
					if(src == this._zImages["frame_"+sec]) return;
					else src = this._zImages["frame_"+sec]; 
					}

				else { 
					if(self._compChanged) self._compChanged = false;
					src = self.returnSrc(sec); 
					}

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
	},

	compositionChanged:function(event,params){
		var self = this;
		$( ".newframe" ).remove();// REMOVE PLUGIN
		self._isCreated = false;
		if(paella.player.videoContainer.getMasterVideoRect().visible){
			self.loadPlugin();
			// IF IS PAUSED ON COMPOSITION CHANGED
			if(paella.player.paused()){
			var currentTime = paella.player.videoContainer.currentTime();
			self.imageUpdateOnPause(currentTime);
			}
		}
		self._compChanged = true;

	},

	getName:function() { 
		return "es.upv.paella.zoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
