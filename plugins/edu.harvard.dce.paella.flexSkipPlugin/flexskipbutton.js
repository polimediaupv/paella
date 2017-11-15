paella.addPlugin(function() {
	class FlexSkipPlugin extends paella.ButtonPlugin {
		getAlignment() { return 'left'; }
		getName() { return "edu.harvard.dce.paella.flexSkipPlugin"; }
		getIndex() { return 121; }
		getSubclass() { return 'flexSkip_Rewind_10'; }
		getIconClass() { return 'icon-back-10-s'; }
		formatMessage() { return 'Rewind 10 seconds'; }
		getDefaultToolTip() { return base.dictionary.translate(this.formatMessage()); }
		getMinWindowSize() { return 510; }
	
		checkEnabled(onSuccess) {
			onSuccess(!paella.player.isLiveStream());
		}
		
		action(button) {
			paella.player.videoContainer.currentTime()
				.then(function(currentTime) {
					paella.player.videoContainer.seekToTime(currentTime - 10);
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
		getIconClass() { return 'icon-forward-30-s'; }
		formatMessage() { return 'Forward 30 seconds'; }
		
		action(button) {
			paella.player.videoContainer.currentTime()
				.then(function(currentTime) {
					paella.player.videoContainer.seekToTime(currentTime + 30);
				});
		}
	}
});
