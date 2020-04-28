paella.addPlugin(function() {
	return class BlackBoard2 extends paella.EventDrivenPlugin {
		getName() { return "es.upv.paella.blackBoardPlugin"; }
		getIndex() {return 10; }
		getAlignment() { return 'right'; }
		getSubclass() { return "blackBoardButton2"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("BlackBoard"); }
	
		checkEnabled(onSuccess) {
			this._blackBoardProfile = "s_p_blackboard2";
			this._blackBoardDIV = null;
			this._hasImages = null;
			this._active = false;
			this._creationTimer = 500;
			this._zImages = null;
			this._videoLength = null;
			this._keys = null;
			this._currentImage = null;
			this._next = null;
			this._prev = null;
			this._lensDIV = null;
			this._lensContainer = null;
			this._lensWidth = null;
			this._lensHeight = null;
			this._conImg = null;
			this._zoom = 250;
			this._currentZoom = null;
			this._maxZoom = 500;
			this._mousePos = null;
			this._containerRect = null;
			onSuccess(true);
		}
	
		getEvents() {
			return[
				paella.events.setProfile,
				paella.events.timeUpdate
			];
		}
	
		onEvent(event, params) {
			var self = this;
			switch(event){
				case paella.events.setProfile:
					if(params.profileName!=self._blackBoardProfile){
						if(self._active){
							self.destroyOverlay();
							self._active = false;
						}
						break;
					}
					else{ 
					
						if(!self._hasImages){
							paella.player.setProfile("slide_professor");
						}
						if(self._hasImages && !self._active){
							self.createOverlay();
							self._active = true;
						}
					}
					break;
				case paella.events.timeUpdate:
					if(self._active && self._hasImages) {
						paella.player.videoContainer.trimming()
							.then((trimmingData) => {
								if (trimmingData.enabled) {
									params.currentTime += trimmingData.start;
								}
								
								self.imageUpdate(event,params);
							})
					}
					break;
			}
		}
	
		setup() {
			var self = this;	
	
			var n = paella.player.videoContainer.sourceData[0].sources;
			if(n.hasOwnProperty("image")){
				self._hasImages = true;
				//  BRING THE IMAGE ARRAY TO LOCAL
				self._zImages = {};
				self._zImages = paella.player.videoContainer.sourceData[0].sources.image[0].frames; // COPY TO LOCAL
				self._videoLength = paella.player.videoContainer.sourceData[0].sources.image[0].duration; // video duration in frames
	
				// SORT KEYS FOR SEARCH CLOSEST
				self._keys = Object.keys(self._zImages);
				self._keys = self._keys.sort(function(a, b){
					a = a.slice(6);
					b = b.slice(6);
					return parseInt(a)-parseInt(b); 
				});
			}
			else{
				self._hasImages = false;
	
				if (paella.player.selectedProfile == self._blackBoardProfile) {
					let defaultprofile = paella.player.config.defaultProfile;
					paella.player.setProfile(defaultprofile);
				}
			}
	
	
			//NEXT
			this._next = 0;
			this._prev = 0;
	
			if(paella.player.selectedProfile == self._blackBoardProfile){
				self.createOverlay();
				self._active = true;
			}
	
			self._mousePos = {};
	
	
			paella.Profiles.loadProfile(self._blackBoardProfile,function(profileData) {
				self._containerRect = profileData.blackBoardImages;
			});
		}
	
		createLens() {
			var self = this;
			if(self._currentZoom == null) { self._currentZoom = self._zoom; }
			var lens = document.createElement("div");
			lens.className = "lensClass";
	
			self._lensDIV = lens;
	
			var p = $('.conImg').offset();
			var width = $('.conImg').width();
			var height = $('.conImg').height();
			lens.style.width = (width/(self._currentZoom/100))+"px";
			lens.style.height = (height/(self._currentZoom/100))+"px";
			self._lensWidth = parseInt(lens.style.width);
			self._lensHeight = parseInt(lens.style.height);
			$(self._lensContainer).append(lens);
			
			$(self._lensContainer).mousemove(function(event) {	
				let mouseX = (event.pageX-p.left);
				let mouseY = (event.pageY-p.top);
				
				self._mousePos.x = mouseX;
				self._mousePos.y = mouseY;
	
				let lensTop = (mouseY - self._lensHeight/2);
				lensTop = (lensTop < 0) ? 0 : lensTop;
				lensTop = (lensTop > (height-self._lensHeight)) ? (height-self._lensHeight) : lensTop; 
	
				let lensLeft = (mouseX - self._lensWidth/2);
				lensLeft = (lensLeft < 0) ? 0 : lensLeft;
				lensLeft = (lensLeft > (width-self._lensWidth)) ? (width-self._lensWidth) : lensLeft; 
	
				self._lensDIV.style.left = lensLeft + "px";
				self._lensDIV.style.top = lensTop + "px";
				if(self._currentZoom != 100){
					let x = (lensLeft) * 100 / (width-self._lensWidth);
					let y = (lensTop) * 100 / (height-self._lensHeight);
					self._blackBoardDIV.style.backgroundPosition = x.toString() + '% ' + y.toString() + '%';
				}
					
				else if(self._currentZoom == 100){
						var xRelative = mouseX * 100 / width;
						var yRelative = mouseY * 100 / height;
						self._blackBoardDIV.style.backgroundPosition = xRelative.toString() + '% ' + yRelative.toString() + '%';
					}
	
				self._blackBoardDIV.style.backgroundSize = self._currentZoom+'%';
			});
	
			$(self._lensContainer).bind('wheel mousewheel', function(e){
				let delta;
	
				if (e.originalEvent.wheelDelta !== undefined) {
					delta = e.originalEvent.wheelDelta;
				}
				else {
					delta = e.originalEvent.deltaY * -1;
				}
	
				if(delta > 0 && self._currentZoom<self._maxZoom) {
					self.reBuildLens(10);
				}
				else if(self._currentZoom>100){
					self.reBuildLens(-10);
				}
				else if(self._currentZoom==100){
					self._lensDIV.style.left = 0+"px";
					self._lensDIV.style.top = 0+"px";
				}
				self._blackBoardDIV.style.backgroundSize = (self._currentZoom)+"%";
			
			});	
		}
	
		reBuildLens(zoomValue) {
			var self = this;
			self._currentZoom += zoomValue;
			var p = $('.conImg').offset();
			var width = $('.conImg').width();
			var height = $('.conImg').height();
			self._lensDIV.style.width = (width/(self._currentZoom/100))+"px";
			self._lensDIV.style.height = (height/(self._currentZoom/100))+"px";
			self._lensWidth = parseInt(self._lensDIV.style.width);
			self._lensHeight = parseInt(self._lensDIV.style.height);
			
			if(self._currentZoom != 100){
				let mouseX = self._mousePos.x;
				let mouseY = self._mousePos.y;
	
				let lensTop = (mouseY - self._lensHeight/2);
				lensTop = (lensTop < 0) ? 0 : lensTop;
				lensTop = (lensTop > (height-self._lensHeight)) ? (height-self._lensHeight) : lensTop; 
	
				let lensLeft = (mouseX - self._lensWidth/2);
				lensLeft = (lensLeft < 0) ? 0 : lensLeft;
				lensLeft = (lensLeft > (width-self._lensWidth)) ? (width-self._lensWidth) : lensLeft; 
	
				self._lensDIV.style.left = lensLeft + "px";
				self._lensDIV.style.top = lensTop + "px";
	
				let x = (lensLeft) * 100 / (width-self._lensWidth);
				let y = (lensTop) * 100 / (height-self._lensHeight);
				self._blackBoardDIV.style.backgroundPosition = x.toString() + '% ' + y.toString() + '%';
			}
		}
	
		destroyLens() {
			var self=this;
			if(self._lensDIV){
				$(self._lensDIV).remove();
				self._blackBoardDIV.style.backgroundSize = 100+'%';
				self._blackBoardDIV.style.opacity = 0;
			}
			//self._currentZoom = self._zoom;
		}
	
		createOverlay() {
			var self = this;
	
			var blackBoardDiv = document.createElement("div");
			blackBoardDiv.className = "blackBoardDiv";
			self._blackBoardDIV = blackBoardDiv;
			self._blackBoardDIV.style.opacity = 0;
	
			var lensContainer = document.createElement("div");
			lensContainer.className = "lensContainer";
			self._lensContainer = lensContainer;
	
			var conImg = document.createElement("img");
			conImg.className = "conImg";
			self._conImg = conImg;
	
			if (self._currentImage) {
				self._conImg.src = self._currentImage;
				$(self._blackBoardDIV).css('background-image', 'url(' + self._currentImage + ')');
			}
	
			$(lensContainer).append(conImg);
	
			$(self._lensContainer).mouseenter(function(){self.createLens(); self._blackBoardDIV.style.opacity = 1.0;});
			$(self._lensContainer).mouseleave(function(){self.destroyLens();});
	
			setTimeout(function(){ // TIMER FOR NICE VIEW
				let overlayContainer = paella.player.videoContainer.overlayContainer;
				overlayContainer.addElement(blackBoardDiv, overlayContainer.getVideoRect(0));
				overlayContainer.addElement(lensContainer, self._containerRect);
			}, self._creationTimer);
		}
	
		destroyOverlay() {
			var self = this;
	
			if (self._blackBoardDIV) {
				$(self._blackBoardDIV).remove();
			}
			if (self._lensContainer){
				$(self._lensContainer).remove();
			}
		}
	
		imageUpdate(event,params) {
			var self = this;
			var sec = Math.round(params.currentTime);
			var src = $(self._blackBoardDIV).css('background-image');
	
			if($(self._blackBoardDIV).length>0){
	
				if(self._zImages.hasOwnProperty("frame_"+sec)) { // SWAP IMAGES WHEN PLAYING
					if(src == self._zImages["frame_"+sec]) {
						return;
					}
					else {
						src = self._zImages["frame_"+sec];
					}
				}
				else if(sec > self._next || sec < self._prev) {
					src = self.returnSrc(sec); 
				} // RELOAD IF OUT OF INTERVAL
				else {
					return;
				}
	
				//PRELOAD NEXT IMAGE
				var image = new Image();
				image.onload = function(){
					$(self._blackBoardDIV).css('background-image', 'url(' + src + ')'); // UPDATING IMAGE
				};
				image.src = src;
	
				self._currentImage = src;
				self._conImg.src = self._currentImage;
			}
		}
	
		returnSrc(sec) {
			var prev = 0;
			for (let i=0; i<this._keys.length; i++){
				var id = parseInt(this._keys[i].slice(6));
				var lastId = parseInt(this._keys[(this._keys.length-1)].slice(6));
				if(sec < id) {  // PREVIOUS IMAGE
					this._next = id; 
					this._prev = prev; 
					this._imageNumber = i-1;
					return this._zImages["frame_" + prev];	 // return previous and keep next change
				}
				else if (sec > lastId && sec < this._videoLength) { // LAST INTERVAL
					this._next = this._videoLength;
					this._prev = lastId;
					return this._zImages["frame_" + prev]; 
				}
				else {
					prev = id;
				}
			}
		}
	}

});
