paella.addPlugin(() => {
	return class BreaksPlayerPlugin extends paella.EventDrivenPlugin {
		getName() { return "es.upv.paella.breaksPlayerPlugin"; }

		checkEnabled(onSuccess) {
			onSuccess(true);
		}

		setup() {
			this.breaks = [];
			this.status = false;
			this.lastTime = 0;
			paella.data.read('breaks', { id: paella.player.videoIdentifier }, (data) => {
				if (data && typeof (data) == 'object' && data.breaks && data.breaks.length > 0) {
					this.breaks = data.breaks;
				}
			});
		}

		getEvents() { return [ paella.events.timeUpdate ]; }

		onEvent(eventType, params) {
			paella.player.videoContainer.currentTime(true)
				.then((currentTime) => {
					// The event type checking must to be done using the time difference, because
					// the timeUpdate event may arrive before the seekToTime event
					let diff = Math.abs(currentTime - this.lastTime);
					this.checkBreaks(currentTime,diff>=1 ? paella.events.seekToTime : paella.events.timeUpdate);
					this.lastTime = currentTime;
				});
		}

		checkBreaks(currentTime,eventType) {
			let breakMessage = "";
			if (this.breaks.some((breakItem) => {
				if (breakItem.s<=currentTime && breakItem.e>=currentTime) {
					if (eventType==paella.events.timeUpdate && !this.status) {
						this.skipTo(breakItem.e);
					}
					breakMessage = breakItem.text;
					return true;
				}
			})) {
				this.showMessage(breakMessage);
				this.status = true;
			}
			else {
				this.hideMessage();
				this.status = false;
			}
		}

		skipTo(time) {
			paella.player.videoContainer.trimming()
				.then((trimming) => {
					if (trimming.enabled) {
						paella.player.videoContainer.seekToTime(time - trimming.start);
					}
					else {
						paella.player.videoContainer.seekToTime(time);
					}
				})
		}

		showMessage(text) {
			if (this.currentText != text) {
				if (this.messageContainer) {
					paella.player.videoContainer.overlayContainer.removeElement(this.messageContainer);
				}
				var rect = {
					left: 100,
					top: 350,
					width: 1080,
					height: 40
				};
				this.currentText = text;
				this.messageContainer = paella.player.videoContainer.overlayContainer.addText(paella.utils.dictionary.translate(text), rect);
				this.messageContainer.className = 'textBreak';
				this.currentText = text;
			}
		}

		hideMessage() {
			if (this.messageContainer) {
				paella.player.videoContainer.overlayContainer.removeElement(this.messageContainer);
				this.messageContainer = null;
			}
			this.currentText = "";
		}
	}
});
