//paella.plugins.PlayPauseButtonPlugin = Class.create(paella.ButtonPlugin, {
Class ("paella.plugins.PlayPauseButtonPlugin",paella.ButtonPlugin, {
	playSubclass:'playButton',
	pauseSubclass:'pauseButton',

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.playSubclass; },
	getName:function() { return "es.upv.paella.playPauseButtonPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Play"); },
	getIndex:function() {return 110;},

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {
		var This = this;
		if (paella.player.playing()) {
			this.changeSubclass(This.pauseSubclass);
		}
		paella.events.bind(paella.events.play,function(event) { This.changeSubclass(This.pauseSubclass); This.setToolTip(paella.dictionary.translate("Pause"));});
		paella.events.bind(paella.events.pause,function(event) { This.changeSubclass(This.playSubclass); This.setToolTip(paella.dictionary.translate("Play"));});
	},

	action:function(button) {
		paella.player.videoContainer.paused()
			.done(function(paused) {
				if (paused) {
					paella.player.play();
				}
				else {
					paella.player.pause();
				}
			});
	}
});

paella.plugins.playPauseButtonPlugn = new paella.plugins.PlayPauseButtonPlugin();

