Class ("paella.BlackBoard2", paella.EventDrivenPlugin,{
	_blackBoardProfile:"s_p_blackboard2",
	_blackBoardDIV:null,
	_hasImages:null,
	_active:false,
	_creationTimer:500,
	_zImages:null,
	_videoLength:null,
	_keys:null,
	_actualImage:null,
	_next:null,
	_ant:null,
	_lensDIV:null,
	_lensContainer:null,
	_lensWidth:null,
	_lensHeight:null,
	_conImg:null,
	_zoom:250,
	_currentZoom:null,
	_maxZoom:500,
	_mousePos:null,
	_containerRect:null,

	getName:function() { 
		return "es.upv.paella.blackBoardPlugin";
	},

	getIndex:function() {return 10;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "blackBoardButton2"; },
	getDefaultToolTip:function() { return base.dictionary.translate("BlackBoard");},

	checkEnabled:function(onSuccess) {		
			onSuccess(true);
	},

	getEvents:function() {
		return[
			paella.events.setProfile,
			paella.events.timeUpdate
		];
    },

    onEvent:function(event, params){
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
	    			self.imageUpdate(event,params);
	    		}
	    		break;
    	}
    },

	setup:function() {
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
				defaultprofile = paella.player.config.defaultProfile;
				paella.player.setProfile(defaultprofile);
			}
		}


		//NEXT
		this._next = 0;
		this._ant = 0;

		if(paella.player.selectedProfile == self._blackBoardProfile){
			self.createOverlay();
			self._active = true;
		}

		self._mousePos = {};


		paella.Profiles.loadProfile(self._blackBoardProfile,function(profileData) {
			self._containerRect = profileData.blackBoardImages;
		});
	},

	createLens:function(){
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
				mouseX = (event.pageX-p.left);
				mouseY = (event.pageY-p.top);
				
				self._mousePos.x = mouseX;
				self._mousePos.y = mouseY;

				lensTop = (mouseY - self._lensHeight/2);
				lensTop = (lensTop < 0) ? 0 : lensTop;
				lensTop = (lensTop > (height-self._lensHeight)) ? (height-self._lensHeight) : lensTop; 

				lensLeft = (mouseX - self._lensWidth/2);
				lensLeft = (lensLeft < 0) ? 0 : lensLeft;
				lensLeft = (lensLeft > (width-self._lensWidth)) ? (width-self._lensWidth) : lensLeft; 

				self._lensDIV.style.left = lensLeft + "px";
				self._lensDIV.style.top = lensTop + "px";
				if(self._currentZoom != 100){
	        		x = (lensLeft) * 100 / (width-self._lensWidth);
	        		y = (lensTop) * 100 / (height-self._lensHeight);
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
	        var delta;

	        if (e.originalEvent.wheelDelta !== undefined)
	            delta = e.originalEvent.wheelDelta;
	        else
	            delta = e.originalEvent.deltaY * -1;

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
		
	},

	reBuildLens:function(zoomValue){
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
				var mouseX = self._mousePos.x;
				var mouseY = self._mousePos.y;

				lensTop = (mouseY - self._lensHeight/2);
				lensTop = (lensTop < 0) ? 0 : lensTop;
				lensTop = (lensTop > (height-self._lensHeight)) ? (height-self._lensHeight) : lensTop; 

				lensLeft = (mouseX - self._lensWidth/2);
				lensLeft = (lensLeft < 0) ? 0 : lensLeft;
				lensLeft = (lensLeft > (width-self._lensWidth)) ? (width-self._lensWidth) : lensLeft; 

				self._lensDIV.style.left = lensLeft + "px";
				self._lensDIV.style.top = lensTop + "px";

				x = (lensLeft) * 100 / (width-self._lensWidth);
	        	y = (lensTop) * 100 / (height-self._lensHeight);
	        	self._blackBoardDIV.style.backgroundPosition = x.toString() + '% ' + y.toString() + '%';
			}
	},

	destroyLens:function(){
		var self=this;
		if(self._lensDIV){
			$(self._lensDIV).remove();
			self._blackBoardDIV.style.backgroundSize = 100+'%';
			self._blackBoardDIV.style.opacity = 0;
		}
		//self._currentZoom = self._zoom;
	},

	createOverlay:function(){
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

		if(self._actualImage){
			self._conImg.src = self._actualImage;
			$(self._blackBoardDIV).css('background-image', 'url(' + self._actualImage + ')');
		}

		$(lensContainer).append(conImg);

		$(self._lensContainer).mouseenter(function(){self.createLens(); self._blackBoardDIV.style.opacity = 1.0;});
		$(self._lensContainer).mouseleave(function(){self.destroyLens();});

		setTimeout(function(){ // TIMER FOR NICE VIEW
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(blackBoardDiv, overlayContainer.getMasterRect());
			overlayContainer.addElement(lensContainer, self._containerRect);
		}, self._creationTimer);
	},

	destroyOverlay:function(){
		var self = this;

		if(self._blackBoardDIV){
			$(self._blackBoardDIV).remove();
		}
		if(self._lensContainer){
			$(self._lensContainer).remove();
		}
	},

	imageUpdate:function(event,params) {

			var self = this;
			var sec = Math.round(params.currentTime);
			var src = $(self._blackBoardDIV).css('background-image');

			if($(self._blackBoardDIV).length>0){

				if(self._zImages.hasOwnProperty("frame_"+sec)) { // SWAP IMAGES WHEN PLAYING
					if(src == self._zImages["frame_"+sec]) return;
					else src = self._zImages["frame_"+sec]; 
					}

				else if(sec > self._next || sec < self._ant) {
					src = self.returnSrc(sec); 
					} // RELOAD IF OUT OF INTERVAL
					else return;

					//PRELOAD NEXT IMAGE
					var image = new Image();
					image.onload = function(){
	    			$(self._blackBoardDIV).css('background-image', 'url(' + src + ')'); // UPDATING IMAGE
					};
					image.src = src;

					self._actualImage = src;
					self._conImg.src = self._actualImage;
			}
		
	},
	returnSrc:function(sec){
		var self = this;
		var ant = 0;
		for (i=0; i<self._keys.length; i++){
			var id = parseInt(self._keys[i].slice(6));
			var lastId = parseInt(self._keys[(self._keys.length-1)].slice(6));
			if(sec < id) {  // PREVIOUS IMAGE
				self._next = id; 
				self._ant = ant; 
				self._imageNumber = i-1;
				return self._zImages["frame_"+ant];} // return previous and keep next change
			else if(sec > lastId && sec < self._videoLength){ // LAST INTERVAL
					self._next = self._videoLength;
					self._ant = lastId;
					return self._zImages["frame_"+ant]; 
			}
			else ant = id;
		}
	}
});

paella.plugins.blackBoard2 = new paella.BlackBoard2();
