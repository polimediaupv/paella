paella.addPlugin(function() {

	return class AirPlayPlugin extends paella.ButtonPlugin {
		getIndex() { return 552; }
		getAlignment() { return 'right'; }
		getSubclass() { return "AirPlayButton"; }
		getIconClass() { return 'icon-airplay'; }
		getName() { return "es.upv.paella.airPlayPlugin"; }
		checkEnabled(onSuccess) {
			this._visible = false;
			// PIP is only available with single stream videos
            if (paella.player.videoContainer.streamProvider.videoStreams.length!=1) {
                onSuccess(false);
            }
            else {
				onSuccess(window.WebKitPlaybackTargetAvailabilityEvent);
			}
		}
		getDefaultToolTip() { return paella.utils.dictionary.translate("Emit to AirPlay."); }
	
		setup() {
			let video = paella.player.videoContainer.masterVideo().video;
			if (window.WebKitPlaybackTargetAvailabilityEvent) {
				video.addEventListener('webkitplaybacktargetavailabilitychanged', (event) => {
					switch (event.availability) {
					case "available":
						this._visible = true;
						break;
					case "not-available":
						this._visible = false;
						break;
					}
					this.updateClassName();
				});
			}
		}
	
		action(button) {
			let video = paella.player.videoContainer.masterVideo().video;
			video.webkitShowPlaybackTargetPicker();
		}
	
		updateClassName() {
			this.button.className = this.getButtonItemClass(true);
		}
	
		getButtonItemClass(selected) {
			return 'buttonPlugin ' + this.getSubclass() + " " + this.getAlignment() + " " + (this._visible ? "available":"not-available");
		}
	}
});
