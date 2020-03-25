
paella.addPlugin(() => {
	return class TimeMarksPlaybackCanvasPlugin extends paella.PlaybackCanvasPlugin {
		getName() { return "es.upv.paella.timeMarksPlaybackCanvasPlugin"; }

		setup() {
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

		drawCanvas(context,width,height,videoData) {
			if (this._hasSlides) {
				this._frameKeys.forEach((l) => {
					l = parseInt(l);
					let timeInstant = videoData.trimming.enabled ? l - videoData.trimming.start : l;
					if (timeInstant>0 && timeInstant<videoData.trimming.duration) {
						let left = timeInstant * width / videoData.trimming.duration;
						this.drawTimeMark(context, left, height);
					}

				})
			}
		}

		drawTimeMark(ctx,left,height){
			ctx[1].fillStyle = this.config.color;
			ctx[1].fillRect(left,0,1,height);	
		}
	}
});
