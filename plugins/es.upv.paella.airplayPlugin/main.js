Class ("paella.plugins.AirPlayPlugin", paella.ButtonPlugin, {
	_visible: false,

	getIndex:function() { return 552; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "AirPlayButton"; },
	getName:function() { return "es.upv.paella.airPlayPlugin"; },
	checkEnabled:function(onSuccess) {
        onSuccess(window.WebKitPlaybackTargetAvailabilityEvent);
	},
	getDefaultToolTip:function() { return base.dictionary.translate("Emit to AirPlay."); },

	setup:function() {
		var video = paella.player.videoContainer.masterVideo().video;
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
	},

	action:function(button) {
		var video = paella.player.videoContainer.masterVideo().video;
        video.webkitShowPlaybackTargetPicker();
	},

	updateClassName:function() {
		this.button.className = this.getButtonItemClass(true);
	},

	getButtonItemClass:function(selected) {
		return 'buttonPlugin ' + this.getSubclass() + " " + this.getAlignment() + " " + (this._visible ? "available":"not-available");
	}
});

paella.plugins.airPlayPlugin = new paella.plugins.AirPlayPlugin();
