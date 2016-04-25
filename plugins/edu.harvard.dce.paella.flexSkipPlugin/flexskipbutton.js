Class("paella.plugins.FlexSkipPlugin", paella.ButtonPlugin, {
	getAlignment: function() {
		return 'left';
	},
	getName: function() {
		return "edu.harvard.dce.paella.flexSkipPlugin";
	},
	getIndex: function() {
		return 121;
	},
	getSubclass: function() {
		return 'flexSkip_Rewind_10';
	},
	formatMessage: function() {
		return 'Rewind 10 seconds';
	},
	getDefaultToolTip: function() {
		return base.dictionary.translate(this.formatMessage());
	},
	getMinWindowSize: function() {
		return 510;
	},

	checkEnabled: function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},
	
	action: function(button) {
		paella.player.videoContainer.currentTime()
			.then(function(currentTime) {
				paella.player.videoContainer.seekToTime(currentTime - 10);
			});
	}
});

paella.plugins.flexSkipPlugin = new paella.plugins.FlexSkipPlugin();



Class("paella.plugins.FlexSkipForwardPlugin", paella.plugins.FlexSkipPlugin, {
	getIndex: function() {
		return 122;
	},
	getName: function() {
		return "edu.harvard.dce.paella.flexSkipForwardPlugin";
	},
	
	getSubclass: function() {
		return 'flexSkip_Forward_30';
	},
	formatMessage: function() {
		return 'Forward 30 seconds';
	},
	
	action: function(button) {
		paella.player.videoContainer.currentTime()
			.then(function(currentTime) {
				paella.player.videoContainer.seekToTime(currentTime + 30);
			});
	}
});

paella.plugins.flexSkipForwardPlugin = new paella.plugins.FlexSkipForwardPlugin();
