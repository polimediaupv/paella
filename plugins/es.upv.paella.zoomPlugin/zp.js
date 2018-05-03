
paella.addPlugin(function() {
	return class ZoomPlugin extends paella.EventDrivenPlugin {
		
		getIndex(){return 20;}
		
		getAlignment(){
			return 'right';
		}
		getSubclass() { return "zoomButton"; }
		
		getDefaultToolTip() { return base.dictionary.translate("Zoom");}
		
		getEvents() {
			return[
				paella.events.timeUpdate,
				paella.events.setComposition,
				paella.events.loadPlugins,
				paella.events.play
			];
		}
		
		onEvent(event, params){
			switch(event){
				case paella.events.timeUpdate: this.imageUpdate(event,params); break;
				case paella.events.setComposition: this.compositionChanged(event,params); break;
				case paella.events.loadPlugins: this.loadPlugin(event,params); break;
				case paella.events.play: this.exitPhotoMode(); break;
			}
		}

		checkEnabled(onSuccess) {
			if (paella.player.videoContainer.sourceData.length<2) {
				this._zImages =null;
				this._imageNumber =null;
				this._isActivated =false;
				this._isCreated =false;
				this._keys =null;
				this._ant =null;
				this._next =null;
				this._videoLength =null;
				this._compChanged =false;
				this._restartPlugin =false;
				this._actualImage = null;
				this._zoomIncr = null;
				this._maxZoom = null;
				this._minZoom = null;
				this._dragMode = false;
				this._mouseDownPosition = null;
				onSuccess(false);
				return;
			}

			// CHECK IF THE VIDEO HAS HIRESIMAGES
			var n = paella.player.videoContainer.sourceData[0].sources;

			if(n.hasOwnProperty("image"))onSuccess(true);
			else onSuccess(false);
		}

		setupIcons(){
			var width = $('.zoomFrame').width();
			//ARROWS
			var arrowsLeft = document.createElement("div");
			arrowsLeft.className = "arrowsLeft";
			arrowsLeft.style.display = 'none';

			var arrowsRight = document.createElement("div");
			arrowsRight.className = "arrowsRight";
			arrowsRight.style.display = 'none';
			arrowsRight.style.left = (width-24)+'px';

			$(arrowsLeft).click(() => {
				this.arrowCallLeft();
				event.stopPropagation();
			});

			$(arrowsRight).click(() => {
				this.arrowCallRight();
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

			$(buttonZoomOn).click(() => {
				if(this._isActivated){
					this.exitPhotoMode();
					$('.zoomActionButton.buttonZoomOn').removeClass("clicked");
				}
				else{
					this.enterPhotoMode();
					//clicked
					$('.zoomActionButton.buttonZoomOn').addClass("clicked");
				}
				event.stopPropagation();
			});

			$(buttonSnapshot).click(() => {
				if(this._actualImage != null)
				window.open(this._actualImage, "_blank");
				event.stopPropagation();
			});

			$(buttonZoomIn).click(() => {
				this.zoomIn();
				event.stopPropagation();
			});

			$(buttonZoomOut).click(() => {
				this.zoomOut();
				event.stopPropagation();
			});
		}
		
		enterPhotoMode() {
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
			if(this._imageNumber <= 1) $('.arrowsLeft').hide(); else if(this._isActivated) $('.arrowsLeft').show();
			if(this._imageNumber >= this._keys.length-2) $('.arrowsRight').hide(); else if(this._isActivated) $('.arrowsRight').show();
		}
		
		exitPhotoMode() {
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
		}

		setup() {
			this._maxZoom = this.config.maxZoom || 500;
			this._minZoom = this.config.minZoom || 100;
			this._zoomIncr = this.config.zoomIncr || 10;


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
		}

		loadPlugin(){
			if(this._isCreated == false){
				this.createOverlay();
				this.setupIcons();
				$( ".zoomFrame" ).hide();
				this._isActivated = false;
				this._isCreated = true;
			}
		}

		imageUpdate(event,params) {
			var sec = Math.round(params.currentTime);
			var src = $( ".zoomFrame" ).css('background-image');

			if($('.newframe').length>0){

				if(this._zImages.hasOwnProperty("frame_"+sec)) { // SWAP IMAGES WHEN PLAYING
					if(src == this._zImages["frame_"+sec]) return;
					else src = this._zImages["frame_"+sec]; 
					}

					else if(sec > this._next || sec < this._ant || this._compChanged) { 
					if(this._compChanged) this._compChanged = false;
					src = this.returnSrc(sec); 
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
					this._actualImage = src;

					// UPDATE ARROWS
					if(this._imageNumber <= 1) $('.arrowsLeft').hide(); else if(this._isActivated) $('.arrowsLeft').show();
					if(this._imageNumber >= this._keys.length-2) $('.arrowsRight').hide(); else if(this._isActivated) $('.arrowsRight').show();
			}
		}

		returnSrc(sec){
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
		}

		arrowCallLeft(){
			if(this._imageNumber-1 >= 0){
				var frame = this._keys[this._imageNumber-1];
				this._imageNumber -= 1;
				paella.player.videoContainer.seekToTime(parseInt(frame.slice(6)));
			}
		}

		arrowCallRight(){
			if(this._imageNumber+1 <= this._keys.length){
				var frame = this._keys[this._imageNumber+1];
				this._imageNumber += 1;
				paella.player.videoContainer.seekToTime(parseInt(frame.slice(6)));
			}
		}

		createOverlay(){
			var newframe = document.createElement("div");
			newframe.className = "newframe";
			
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getVideoRect(0));

			var zoomframe = document.createElement("div");
			zoomframe.className = "zoomFrame";	
			newframe.insertBefore(zoomframe,newframe.firstChild);
			$(zoomframe).click(function(event) {
				event.stopPropagation();
			});


			// BINDS JQUERY
			$(zoomframe).bind('mousewheel', (e) => {
				if(e.originalEvent.wheelDelta /120 > 0) {
					this.zoomIn();
				}
				else{
					this.zoomOut();
				}
			});

			//BIND MOVEMENT
			$(zoomframe).mousedown((event) => {
				this.mouseDown(event.clientX,event.clientY);
			});
			
			$(zoomframe).mouseup((event) => {
				this.mouseUp();
			});
			
			$(zoomframe).mouseleave((event) => {
				this.mouseLeave();
			});
			
			$(zoomframe).mousemove((event) => {
				this.mouseMove(event.clientX,event.clientY);
			});
		}

		mouseDown(x,y) {
			this._dragMode = true;
			this._mouseDownPosition = { x:x, y:y };
		}
		
		mouseUp() {
			this._dragMode = false;
		}
		
		mouseLeave() {
			this._dragMode = false;
		}
		
		mouseMove(x,y){
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
		}

		zoomIn(){
			let z = $('.zoomFrame').css('background-size');
			z = z.split(" ");
			z = parseInt(z[0]);

			if(z < this._maxZoom){
				$('.zoomFrame').css('background-size',z + this._zoomIncr + "% auto");
			}	
		}

		zoomOut(){
			let z = $('.zoomFrame').css('background-size');
			z = z.split(" ");
			z = parseInt(z[0]);

			if(z > this._minZoom){
				$('.zoomFrame').css('background-size',z - this._zoomIncr+"% auto");
			}	
		}

		imageUpdateOnPause(params) {
			var sec = Math.round(params);
			var src = $( ".zoomFrame" ).css('background-image');

			if($('.newframe').length>0 && src != this._actualImage){

				if(this._zImages.hasOwnProperty("frame_"+sec)) { // SWAP IMAGES WHEN PLAYING
					if(src == this._zImages["frame_"+sec]) return;
					else src = this._zImages["frame_"+sec]; 
					}

				else { 
					this._compChanged = false;
					src = this.returnSrc(sec); 
				}
				$("#photo_01").attr('src',src).load();

				//PRELOAD NEXT IMAGE
				var image = new Image();
				image.onload = function()	{
					$( ".zoomFrame" ).css('background-image', 'url(' + src + ')');
				};
				image.src = src;

				// OPEN NEW WINDOW WITH FULLSCREEN IMAGE
				this._actualImage = src;
			}
		}

		compositionChanged(event,params){
			$( ".newframe" ).remove();// REMOVE PLUGIN
			this._isCreated = false;
			if(paella.player.videoContainer.getMasterVideoRect().visible){
				this.loadPlugin();
				// IF IS PAUSED ON COMPOSITION CHANGED
				if(paella.player.paused()){
					paella.player.videoContainer.currentTime()
					.then((currentTime) => {
						this.imageUpdateOnPause(currentTime);
					});
				}
			}
			this._compChanged = true;
		}

		getName() { 
			return "es.upv.paella.zoomPlugin";
		}
	};
});
