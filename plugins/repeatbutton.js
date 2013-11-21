paella.plugins.RepeatButtonPlugin = Class.create(paella.ButtonPlugin, {
	repeatSubclass:'repeatButton',
	
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.repeatSubclass; },
	getName:function() { return "es.upv.paella.repeatButtonPlugin"; },
	getIndex:function() {return 1005;},
	getDefaultToolTip:function() { return paella.dictionary.translate("Rewind 30 seconds"); },
	
	action:function(button) {
	  var newTime = paella.player.videoContainer.currentTime()-30;
	  paella.events.trigger(paella.events.seekToTime,{time:newTime});
	}
});

paella.plugins.repeatButtonPlugin = new paella.plugins.RepeatButtonPlugin();
