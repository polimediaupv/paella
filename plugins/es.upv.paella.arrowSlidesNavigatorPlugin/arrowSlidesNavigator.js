
paella.addPlugin(function() {

	return class ArrowSlidesNavigator extends paella.EventDrivenPlugin {
		getName() { return "es.upv.paella.arrowSlidesNavigatorPlugin"; }

		checkEnabled(onSuccess) {
			if (!paella.initDelegate.initParams.videoLoader.frameList ||
				Object.keys(paella.initDelegate.initParams.videoLoader.frameList).length==0 ||
				paella.player.videoContainer.isMonostream)
			{
				onSuccess(false);
			}
			else {
				onSuccess(true);
			}
		}
		
		setup() {
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
		}
		
		createOverlay(){
			var self = this;
	
			let overlayContainer = paella.player.videoContainer.overlayContainer;
			
			if (!this.arrows) {
				this.arrows = document.createElement('div');
				this.arrows.id = "arrows";
				this.arrows.style.marginTop = "25%";
				
				let arrowNext = document.createElement('div');
				arrowNext.className = "buttonPlugin arrowSlideNavidator nextButton right icon-next2"
				this.arrows.appendChild(arrowNext);
		
				let arrowPrev = document.createElement('div');
				arrowPrev.className = "buttonPlugin arrowSlideNavidator prevButton left icon-previous2"
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

			let rect = null;
			let element = null;
			
			if (!paella.profiles.currentProfile) {
				return null;
			}

			this.config.content = this.config.content || ["presentation"];
			let profilesContent = [];
			paella.profiles.currentProfile.videos.forEach((profileData) => {
				profilesContent.push(profileData.content);
			});

			// Default content, if the "content" setting is not set in the configuration file
			let selectedContent = profilesContent.length==1 ? profilesContent[0] : (profilesContent.length>1 ? profilesContent[1] : "");

			this.config.content.some((preferredContent) => {
				if (profilesContent.indexOf(preferredContent)!=-1) {
					selectedContent = preferredContent;
					return true;
				}
			})


			if (!selectedContent) {
				this.container = overlayContainer.addLayer();
				this.container.style.marginRight = "0";
				this.container.style.marginLeft = "0";			
				this.arrows.style.marginTop = "25%";
			}
			else {
				let videoIndex = 0;
				paella.player.videoContainer.streamProvider.streams.forEach((stream,index) => {
					if (stream.type=="video" && selectedContent==stream.content) {
						videoIndex = index;
					}
				});
				element = document.createElement('div');
				rect = overlayContainer.getVideoRect(videoIndex);	// content
				this.container = overlayContainer.addElement(element,rect);
				this.visible = rect.visible;
				this.arrows.style.marginTop = "33%";
			}
			
			this.container.appendChild(this.arrows);
			this.hideArrows();
		}
		
		getCurrentRange() {
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
								if ((t1<currentTime && t2>currentTime) || t1==currentTime) {
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
		}
	
		goNextSlide() {
			var self = this;
			let trimming;
			this.getCurrentRange()
				.then((range) => {
					return paella.player.videoContainer.seekToTime(range.next);
				})

				.then(() => {
					paella.player.videoContainer.play();
				});
		}
	
		goPrevSlide() {
			var self = this;
			let trimming = null;
			this.getCurrentRange()
				.then((range) => {
					return paella.player.videoContainer.seekToTime(range.prev);
				})
				
				.then(() => {
					paella.player.videoContainer.play();
				});
		}
		
		showArrows(){ if (this.visible) $(this.arrows).show(); }
		hideArrows(){ $(this.arrows).hide(); }
		
		getEvents() { return [paella.events.controlBarDidShow, paella.events.controlBarDidHide, paella.events.setComposition]; }
	
		onEvent(eventType,params) {
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
	} 
});
