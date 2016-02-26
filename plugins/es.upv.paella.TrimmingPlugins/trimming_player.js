Class ("paella.plugins.TrimmingLoaderPlugin",paella.EventDrivenPlugin,{
	
	getName:function() { return "es.upv.paella.trimmingPlayerPlugin"; },
		
	getEvents:function() { return [paella.events.controlBarLoaded, paella.events.showEditor, paella.events.hideEditor]; },

	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.controlBarLoaded:
				this.loadTrimming();
				break;
			case paella.events.showEditor:
				paella.player.videoContainer.disableTrimming();
				break;
			case paella.events.hideEditor:
				if (paella.player.config.trimming && paella.player.config.trimming.enabled) {
					paella.player.videoContainer.enableTrimming();
				}
				break;
		}
	},
	
	loadTrimming:function() {
		var videoId = paella.initDelegate.getId();
		paella.data.read('trimming',{id:videoId},function(data,status) {
			if (data && status && data.end>0) {
				paella.player.videoContainer.enableTrimming();
				paella.player.videoContainer.setTrimming(data.start, data.end);
			}
			else {
				// Check for optional trim 'start' and 'end', in seconds, in location args
				var startTime =  base.parameters.get('start');
				var endTime = base.parameters.get('end');
				if (startTime && endTime) {
					paella.player.videoContainer.enableTrimming();
					paella.player.videoContainer.setTrimming(startTime, endTime);
				}
			}
		});
	}
});

paella.plugins.trimmingLoaderPlugin = new paella.plugins.TrimmingLoaderPlugin();
