paella.addPlugin(function() {
	class FlexSkipPlugin extends paella.ButtonPlugin {
		getAlignment() { return 'left'; }
		getName() { return "edu.harvard.dce.paella.flexSkipPlugin"; }
		getIndex() { return 121; }
		getSubclass() { return 'flexSkip_Rewind_10'; }
		getIconClass() {
			if (this.config.seconds === 10) {
				return 'icon-back-10-s';
			}
			else {
				return 'icon-backward';
			}
		}
		formatMessage() { return `Rewind ${ this.config.seconds } seconds`; }
		getDefaultToolTip() { return paella.utils.dictionary.translate(this.formatMessage()); }
	
		checkEnabled(onSuccess) {
			onSuccess(!paella.player.isLiveStream());
		}
		
		action(button) {
			paella.player.videoContainer.currentTime()
				.then((currentTime) => {
					paella.player.videoContainer.seekToTime(currentTime - this.config.seconds);
				});
		}
	}

	paella.plugins.FlexSkipPlugin = FlexSkipPlugin;

	return FlexSkipPlugin;
});

paella.addPlugin(function() {

	return class FlexSkipForwardPlugin extends paella.plugins.FlexSkipPlugin {
		getIndex() { return 122; }
		getName() { return "edu.harvard.dce.paella.flexSkipForwardPlugin"; }
		getSubclass() { return 'flexSkip_Forward_30'; }
		getIconClass() { 
			if (this.config.seconds === 30) {
				return 'icon-forward-30-s';
			}
			else {
				return 'icon-forward2';
			}
		}
		formatMessage() { return `Forward ${this.config.seconds} seconds`; }
		
		action(button) {
			paella.player.videoContainer.currentTime()
				.then((currentTime) => {
					paella.player.videoContainer.seekToTime(currentTime + this.config.seconds);
				});
		}
	}
});
