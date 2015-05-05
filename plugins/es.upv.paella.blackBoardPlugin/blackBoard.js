Class ("paella.BlackBoard", paella.EventDrivenPlugin,{
	_blackBoardProfile:"s_p_blackboard",
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
	_lensWidth:90,
	_lensHeight:50,
	_conImg:null,

	getIndex:function(){return 10;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "blackBoardButton"; },

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
		self._overlayContainer = $("#overlayContainer");
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

	createLens:function(top,left,width,height){
		var self = this;
		
			var lens = document.createElement("div");
			lens.className = "lensClass";
			self._lensDIV = lens;

			$(self._lensContainer).append(lens);
			$(self._lensContainer).mousemove(function(event) {
			if(event.pageX > (left+(self._lensWidth/2)) &&  
				event.pageX < (left+width)-(self._lensWidth/2) &&
				event.pageY > (top+100) &&
				event.pageY < (top+100+height)-(self._lensWidth/2) ){
        		self._lensDIV.style.left=event.pageX-(self._lensWidth/2)+"px";
        		self._lensDIV.style.top=event.pageY-(self._lensHeight/2)+"px";

        		var x = (event.pageX-left) * 100 / (width);
        		var y = (event.pageY-top-100) * 100 / (height);
        		//console.log(x +" %  "+ y +" %");
        		self._blackBoardDIV.style.backgroundSize = 250+'%';
        		self._blackBoardDIV.style.backgroundPosition = x.toString() + '% ' + y.toString() + '%';

        		}
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

		var lensContainer = document.createElement("div");
		lensContainer.className = "lensContainer";
		self._lensContainer = lensContainer;

		var conImg = document.createElement("img");
		conImg.className = "conImg";
		self._conImg = conImg;
		
		var aux = paella.player.videoContainer.getMasterVideoRect();
		lensContainer.style.top = 385+"px";
		lensContainer.style.width = 432+"px";
		lensContainer.style.height = 243+"px";
		lensContainer.style.left = 10+"px";
		lensContainer.style.zIndex = 5000;
		lensContainer.style.position = "absolute";

		conImg.width = aux.width;
		conImg.height = aux.height;

		$(lensContainer).append(conImg);

		$(self._lensContainer).mouseenter(function(){self.createLens(385, 10, 432, 243); self._blackBoardDIV.style.opacity = 1.0;});
		$(self._lensContainer).mouseleave(function(){self.destroyLens();});

		setTimeout(function(){ // TIMER FOR NICE VIEW
			$(self._overlayContainer).append(blackBoardDiv);
			$(self._overlayContainer).append(lensContainer);
		}, self._creationTimer);
		



	},

	destroyOverlay:function(){
		var self = this;

		if(self._blackBoardDIV){
			$(self._blackBoardDIV).remove();
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
		return "es.upv.paella.blackBoardPlugin";
	}
});

paella.plugins.blackBoard = new paella.BlackBoard();
