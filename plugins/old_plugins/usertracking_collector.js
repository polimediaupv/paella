paella.plugins.UserTrackingCollectorPlugIn = Class.create(paella.EventDrivenPlugin,{
	heartbeatTimer:null,

	getName:function() { return "es.upv.paella.userTrackingCollectorPlugIn"; },

	setup:function() {
		var thisClass = this;
		
		if ( this.config.heartBeatTime > 0) {		
			this.heartbeatTimer = new paella.Timer(function(timer) {thisClass.registerEvent('HEARTBEAT'); }, this.config.heartBeatTime);
			this.heartbeatTimer.repeat = true;
		}
		//--------------------------------------------------
		$(window).resize(function(event) { thisClass.onResize(); });
				
	},
	
	getEvents:function() {	
		return [paella.events.play,
				paella.events.pause,
				paella.events.seekTo,
				paella.events.seekToTime
		];
	},
	
	onEvent:function(eventType, params) {
		this.registerEvent(eventType);		
	},
	
	onResize:function() {
		var w = $(window);
		var label = w.width()+"x"+w.height();
		this.registerEvent("RESIZE-TO", label);
	},
	
	registerEvent: function(event, label) {
		var videoCurrentTime = parseInt(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart());			
		var playing = !paella.player.videoContainer.paused();
		
		var eventInfo = {
			time: videoCurrentTime,
			playing: playing,
			event: event,
			label: label
		};
		paella.events.trigger(paella.events.userTracking, eventInfo);		
	}
});


paella.plugins.userTrackingCollectorPlugIn = new paella.plugins.UserTrackingCollectorPlugIn();
