Class ("paella.BlackBoard2", paella.EventDrivenPlugin,{
	_blackBoardProfile:"s_p_blackboard2",
	_overlayContainer:null,
	_blackBoardDIV:null,
	_active:false,
	_creationTimer:500,
	_zImages:null,
	_videoLength:null,
	_keys:null,
	_actualImage:null,
	_next:null,
	_ant:null,
	_lensFrame:null,
	_lensDIV:null,
	_lensContainer:null,
	_lensWidth:null,
	_lensHeight:null,
	_conImg:null,
	_globalContainerHeight:null,
	_globalContainerWidth:null,
	_zoom:250,

	getIndex:function(){return 10;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "blackBoardButton2"; },

	getDefaultToolTip:function() { return base.dictionary.translate("BlackBoard");},

	getEvents:function() {
		return[
			paella.events.setProfile,
			paella.events.timeUpdate
		];
    },

    onEvent:function(event, params){
    	var self = this;
    	switch(event){
    		case paella.events.setProfile: if(params.profileName==self._blackBoardProfile){
    											self.createOverlay();
    											self._active = true;
    										} 
    										else{
    											self.destroyOverlay();
    											self._active = false;
    										}
    										break;
    		case paella.events.timeUpdate: if(self._active){self.imageUpdate(event,params);} break;
    	}
    },
	checkEnabled:function(onSuccess) {
		var n = paella.player.videoContainer.sourceData[0].sources;

		if(n.hasOwnProperty("image"))onSuccess(true);
		else onSuccess(false);
	},

	setup:function() {
		var self = this;
		//self._overlayContainer = $("#overlayContainer");
		self._overlayContainer = $("#playerContainer_videoContainer_container");
		self._lensFrame = $("#playerContainer_videoContainer_1");		

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

		//NEXT
		this._next = 0;
		this._ant = 0;

		if(paella.player.selectedProfile == self._blackBoardProfile){
			self.createOverlay();
			self._active = true;
		}
	},

	createLens:function(){
		var self = this;

			var lens = document.createElement("div");
			lens.className = "lensClass";

			self._lensDIV = lens;

			var p = $('.conImg').offset();
			var width = $('.conImg').width();
			var height = $('.conImg').height();
			lens.style.width = (width/(self._zoom/100))+"px";
			lens.style.height = (height/(self._zoom/100))+"px";
			self._lensWidth = parseInt(lens.style.width);
			self._lensHeight = parseInt(lens.style.height);
			$(self._lensContainer).append(lens);
			
			$(self._lensContainer).mousemove(function(event) {	
				mouseX = (event.pageX-p.left);
				mouseY = (event.pageY-p.top);

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
	        		//console.log(x +" %  "+ y +" %");
	        		self._blackBoardDIV.style.backgroundSize = self._zoom+'%';
	        		self._blackBoardDIV.style.backgroundPosition = x.toString() + '% ' + y.toString() + '%';
    		});
		
	},
	destroyLens:function(){
		var self=this;
		if(self._lensDIV){
			$(self._lensDIV).remove();
			self._blackBoardDIV.style.backgroundSize = 100+'%';
			self._blackBoardDIV.style.opacity = 0;
		}
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

		self._globalContainerWidth = $('#playerContainer_videoContainer_container').width();
		self._globalContainerHeight = $('#playerContainer_videoContainer_container').height();
		
		var aux = paella.player.videoContainer.getMasterVideoRect();

		//conImg.width = aux.width;
		//conImg.height = aux.height;
		
		var aux3 = paella.player.videoContainer.getSlaveVideoRect();
		aux3.top = aux3.top + aux3.height + 20;
		aux3.width = aux3.width;
		aux3.height = aux3.width/1.333333333333333333; //4:3 photos
		aux3.left = aux3.left;

		$(lensContainer).append(conImg);

		$(self._lensContainer).mouseenter(function(){self.createLens(); self._blackBoardDIV.style.opacity = 1.0;});
		$(self._lensContainer).mouseleave(function(){self.destroyLens();});

		setTimeout(function(){ // TIMER FOR NICE VIEW
			//$(self._overlayContainer).append(blackBoardDiv);
			//$(self._overlayContainer).append(lensContainer);
			overlayContainer.addElement(blackBoardDiv, overlayContainer.getMasterRect());
			overlayContainer.addElement(lensContainer, aux3);
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
	},

	getName:function() { 
		return "es.upv.paella.blackBoardPlugin2";
	}
});

paella.plugins.blackBoard2 = new paella.BlackBoard2();
