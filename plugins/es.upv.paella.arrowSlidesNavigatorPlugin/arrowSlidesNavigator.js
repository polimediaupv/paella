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

		let parentContainer = null;
		
		if (!this.arrows) {
			this.arrows = document.createElement('div');
			//this.arrows.id = "arrows";
			this.arrows.className = "arrow-slide-navigator-container";
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
		
		switch (self._showArrowsIn) {
			case 'full':
				let overlayContainer = paella.player.videoContainer.overlayContainer;
				if (this.container) {
					overlayContainer.removeElement(this.container);
				}
				this.container = overlayContainer.addLayer();
				this.container.style.marginRight = "0";
				this.container.style.marginLeft = "0";			
				this.arrows.style.marginTop = "25%";
				this.container.appendChild(this.arrows);
				break;
			case 'master':
				parentContainer = paella.player.videoContainer.masterVideo() &&
								  paella.player.videoContainer.masterVideo().parent &&
								  paella.player.videoContainer.masterVideo().parent.domElement;
				if (!parentContainer) return;
				if (this.arrows) {
					parentContainer.removeElement(this.arrows);
				}	
				parentContainer.appendChild(arrows);
				this.arrows.style.marginTop = "23%";
				break;
			case 'slave':
				parentContainer = paella.player.videoContainer.slaveVideo() &&
								  paella.player.videoContainer.slaveVideo().parent &&
								  paella.player.videoContainer.slaveVideo().parent.domElement;
				if (!parentContainer) return;
				parentContainer.appendChild(this.arrows);
				this.arrows.style.marginTop = "35%";
				break;
		}
		
		this.hideArrows();
	},	
	
	getCurrentRange: function() {
		return new Promise((resolve) => {
			if (this._frames.length<1) {
				resolve(null);
			}
			else {
				let trimming = null;
				let duration = 0;
				paella.player.videoContainer.duration()
					.then((d) => {
						duration = d;
						return paella.player.videoContainer.trimming();
					})

					.then((t) => {
						trimming = t;
						return paella.player.videoContainer.currentTime();
					})

					.then((currentTime) => {
						if (!this._frames.some((f1,i,array) => {
							if (i+1==array.length) { return; }
							let f0 = i==0 ? f1 : this._frames[i-1];
							let f2 = this._frames[i+1];
							let t0 = trimming.enabled ? f0.time - trimming.start : f0.time;
							let t1 = trimming.enabled ? f1.time - trimming.start : f1.time;
							let t2 = trimming.enabled ? f2.time - trimming.start : f2.time;
							if (t1<currentTime && t2>currentTime) {
								let range = {
									prev: t0,
									next: t2
								};
								if (t0<0) {
									range.prev = t1>0 ? t1 : 0;
								}
								resolve(range);
								return true;
							}
						})) {
							let t0 = this._frames[this._frames.length-2].time;
							let t1 = this._frames[this._frames.length-1].time;
							resolve({
								prev: trimming.enabled ? t0 - trimming.start : t0,
								next: trimming.enabled ? t1 - trimming.start : t1
							});
						}
					});
			}
		})
	},

	goNextSlide: function() {
		var self = this;
		let trimming;
		this.getCurrentRange()
			.then((range) => {
				console.log(range);
				paella.player.videoContainer.seekToTime(range.next);
			});
	},

	goPrevSlide: function() {
		var self = this;
		let trimming = null;
		this.getCurrentRange()
			.then((range) => {
				console.log(range);
				paella.player.videoContainer.seekToTime(range.prev-1);
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
    		//case paella.events.setComposition:
    		//	this.createOverlay();
    		//	break;
    	}
	}
});
  

paella.plugins.arrowSlidesNavigator = new paella.plugins.ArrowSlidesNavigator();
