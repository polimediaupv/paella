paella.addPlugin(() => {
	return class BreaksPlayerPlugin extends paella.EventDrivenPlugin {
		get breaks() {
			return this._breaks || []
		}
		set breaks(b) {
			this._breaks = b;
		}
		get lastEvent() {
			return this._lastEvent || 0;
		}
		set lastEvent(e) {
			this._lastEvent = e;
		}
		get visibleBreaks() {
			return this._visibleBreaks || [];
		}
		set visibleBreaks(v) {
			this._visibleBreaks = v;
		}

		getName() {
			return "es.upv.paella.breaksPlayerPlugin";
		}
		checkEnabled(onSuccess) {
			var This = this;
			paella.data.read('breaks', {
				id: paella.initDelegate.getId()
			}, function (data, status) {
				if (data && typeof (data) == 'object' && data.breaks && data.breaks.length > 0) {
					This.breaks = data.breaks;
				}
				onSuccess(true);
			});
		}

		getEvents() {
			return [paella.events.timeUpdate];
		}

		onEvent(eventType, params) {
			var thisClass = this;

			params.videoContainer.currentTime(true)
				.then(function (currentTime) {
					thisClass.checkBreaks(currentTime);
				});
		}

		checkBreaks(currentTime) {
			var a;
			for (var i = 0; i < this.breaks.length; ++i) {
				a = this.breaks[i];

				if (a.s < currentTime && a.e > currentTime) {
					if (this.areBreaksClickable())
						this.avoidBreak(a);
					else
						this.showBreaks(a);
				} else if (a.s.toFixed(0) == currentTime.toFixed(0)) {
					this.avoidBreak(a);
				}
			}
			if (!this.areBreaksClickable()) {
				for (var key in this.visibleBreaks) {
					if (typeof (a) == 'object') {
						a = this.visibleBreaks[key];
						if (a && (a.s >= currentTime || a.e <= currentTime)) {
							this.removeBreak(a);
						}
					}
				}
			}
		}

		areBreaksClickable() {
			//Returns true if the config value is set and if we are not on the editor.
			return this.config.neverShow && !(paella.editor.instance && paella.editor.instance.isLoaded);
		}

		showBreaks(br) {
			if (!this.visibleBreaks[br.s]) {
				var rect = {
					left: 100,
					top: 350,
					width: 1080,
					height: 40
				};
				let name = br.name || paella.dictionary.translate("Break")
				br.elem = paella.player.videoContainer.overlayContainer.addText(name, rect);
				br.elem.className = 'textBreak';
				this.visibleBreaks[br.s] = br;
			}
		}

		removeBreak(br) {
			if (this.visibleBreaks[br.s]) {
				var elem = this.visibleBreaks[br.s].elem;
				paella.player.videoContainer.overlayContainer.removeElement(elem);
				this.visibleBreaks[br.s] = null;
			}
		}

		avoidBreak(br) {
			var newTime;
			if (paella.player.videoContainer.trimEnabled()) {
				paella.player.videoContainer.trimming()
					.then((trimming) => {
						if (br.e >= trimming.end) {
							newTime = 0;
							paella.player.videoContainer.pause();
						} else {
							newTime = br.e + (this.config.neverShow ? 0.01 : 0) - trimming.start;
						}
						paella.player.videoContainer.seekToTime(newTime);

					});
			} else {
				paella.player.videoContainer.duration(true)
					.then((duration) => {
						if (br.e >= duration) {
							newTime = 0;
							paella.player.videoContainer.pause();
						} else {
							newTime = br.e + (this.config.neverShow ? 0.01 : 0);
						}
						paella.player.videoContainer.seekToTime(newTime);
					});
			}
		}
	}
});