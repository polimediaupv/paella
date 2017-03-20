Class ("paella.plugins.ArrowSlidesNavigator", paella.EventDrivenPlugin, {	
	getName:function() { return "es.upv.paella.arrowSlidesNavigatorPlugin"; },
	checkEnabled:function(onSuccess) {
		if (!paella.initDelegate.initParams.videoLoader.frameList || Object.keys(paella.initDelegate.initParams.videoLoader.frameList).length==0 && paella.player.videoContainer.isMonostream) {
			onSuccess(false);
		}
		else {
			onSuccess(true);
		}
	},
	
	setup:function() {
		var self = this;
		this._showArrowsIn = this.config.showArrowsIn || 'slave';
		this.createOverlay();
			
		self._frames = [];		
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		var numFrames;
		if (frames) {
			var framesKeys = Object.keys(frames);
			numFrames = framesKeys.length;

			framesKeys.map(function(i){return Number(i, 10);})
			.sort(function(a, b){return a-b;})
			.forEach(function(key){
				self._frames.push(frames[key]);
			});
		}
	},
	
	createOverlay:function(){
		var self = this;

		let overlayContainer = paella.player.videoContainer.overlayContainer;
		
		if (!this.arrows) {
			this.arrows = document.createElement('div');
			this.arrows.id = "arrows";
			this.arrows.style.marginTop = "25%";
			
			let arrowNext = document.createElement('div');
			arrowNext.className = "buttonPlugin arrowSlideNavidator nextButton right"
			this.arrows.appendChild(arrowNext);
	
			let arrowPrev = document.createElement('div');
			arrowPrev.className = "buttonPlugin arrowSlideNavidator prevButton left"
			this.arrows.appendChild(arrowPrev);
	
	
			$(arrowNext).click(function(e) {
				self.goNextSlide();
				e.stopPropagation();
			});
			$(arrowPrev).click(function(e) {
				self.goPrevSlide();
				e.stopPropagation();
			});			
		}
		
		if (this.container) {
			overlayContainer.removeElement(this.container);
		}
		switch (self._showArrowsIn) {
			case 'full':
				this.container = overlayContainer.addLayer();
				this.container.style.marginRight = "0";
				this.container.style.marginLeft = "0";			
				this.arrows.style.marginTop = "25%";
				break;
			case 'master':
				var element = document.createElement('div');			
				this.container = overlayContainer.addElement(element,overlayContainer.getMasterRect());			
				this.arrows.style.marginTop = "23%";
				break;
			case 'slave':
				var element = document.createElement('div');			
				this.container = overlayContainer.addElement(element,overlayContainer.getSlaveRect());
				this.arrows.style.marginTop = "35%";
				break;
		}
		
		this.container.appendChild(this.arrows);
		this.hideArrows();
	},	
	
	goNextSlide: function() {
		var self = this;
		paella.player.videoContainer.currentTime()
		.then(function(currentTime) {
			if (self._frames.length>1) {		
				for (let i = 0; i < self._frames.length-1; i++) { 
					var f1 = self._frames[i];
					var f2 = self._frames[i+1];
					
					if ((f1.time <= currentTime) && (f2.time > currentTime)) {
						paella.player.videoContainer.seekToTime(f2.time);	
					}				
				}
			}
		});
	},

	goPrevSlide: function() {
		var self = this;
		paella.player.videoContainer.currentTime()
		.then(function(currentTime) {
			if (self._frames.length==1) {
				paella.player.videoContainer.seekToTime(self._frames[0].time);		
			}
			else {
				//check first frame
				if (currentTime < self._frames[1].time) {
					paella.player.videoContainer.seekToTime(self._frames[0].time);	
				}
				// check last frame
				else if (self._frames[self._frames.length-1].time <= currentTime) {
					paella.player.videoContainer.seekToTime(self._frames[self._frames.length-2].time);
				}
				// check midle frames
				else {
					for (let i = 1; i < self._frames.length-1; i++) { 
						var f1 = self._frames[i];
						var f2 = self._frames[i+1];
						
						if ((f1.time <= currentTime) && (f2.time > currentTime)) {
							paella.player.videoContainer.seekToTime(self._frames[i-1].time);	
						}				
					}
				}
			}
		});		
	},
	
	showArrows:function(){
		$(this.arrows).show();
	},	
	hideArrows:function(){
		$(this.arrows).hide();
	},	
	
	getEvents:function() { return [paella.events.controlBarDidShow, paella.events.controlBarDidHide, paella.events.setComposition]; },

	onEvent:function(eventType,params) {
		var self = this;
    	switch(eventType) {
    		case paella.events.controlBarDidShow:
    			this.showArrows();
    			break;
    		case paella.events.controlBarDidHide:
    			this.hideArrows();
    			break;
    		case paella.events.setComposition:
    			this.createOverlay();
    			break;
    	}
	}
});
  

paella.plugins.arrowSlidesNavigator = new paella.plugins.ArrowSlidesNavigator();
