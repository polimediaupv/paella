Class("paella.plugins.FlexSkipPlugin", paella.ButtonPlugin, {
	getAlignment: function() {
		return 'left';
	},
	getSubclass: function() {
		return 'flexSkip_' + this.config.direction + '_' + this.config.seconds;
	},
	getName: function() {
		return "edu.harvard.dce.paella.flexSkipPlugin";
	},
	getIndex: function() {
		return 121;
	},
	formatMessage: function() {
		return this.config.direction + ' ' + this.config.seconds + ' seconds';
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
		var newTime;
		if (this.config.direction == 'Rewind') {
			newTime = paella.player.videoContainer.currentTime() - this.config.seconds;
		} else {
			newTime = paella.player.videoContainer.currentTime() + this.config.seconds;
		}
		paella.events.trigger(paella.events.seekToTime, {
			time: newTime
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
	}
});

paella.plugins.flexSkipForwardPlugin = new paella.plugins.FlexSkipForwardPlugin();
