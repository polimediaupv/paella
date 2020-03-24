
paella.addPlugin(() => {
	return class TimeMarksPlaybackCanvasPlugin extends paella.PlaybackCanvasPlugin {
		getName() { return "es.upv.paella.timeMarksPlaybackCanvasPlugin"; }

		get playbackBarCanvas() { return this._playbackBarCanvas; }

		setup() {
            console.log(this.config);
			this._frameList = paella.initDelegate.initParams.videoLoader.frameList;
			this._frameKeys = Object.keys(this._frameList);
			if( !this._frameList || !this._frameKeys.length) {
				this._hasSlides = false;
			}
			else {
				this._hasSlides = true;
				this._frameKeys = this._frameKeys.sort((a, b) => parseInt(a)-parseInt(b));
			}
		}

		drawCanvas(context,width,height) {
			let duration = 0;
			paella.player.videoContainer.duration(true)
				.then((d) => {
					duration = d;
					return paella.player.videoContainer.trimming();
				})
				.then((trimming) => {
					if (this._hasSlides) {
						this._frameKeys.forEach((l) => {
							let timeInstant = parseInt(l) - trimming.start;
							if (timeInstant>0) {
								let left = timeInstant * width / duration;
								this.drawTimeMark(context, left, height);
							}
						});
					}
				});
		}

		drawTimeMark(ctx,left,height){
			ctx.fillStyle = this.config.color;
			ctx.fillRect(left,0,1,height);	
		}
	}
});
