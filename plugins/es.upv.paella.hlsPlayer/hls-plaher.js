
Class ("paella.HLSPlayer", paella.Html5Video,{
	initialize:function(id,stream,left,top,width,height) {
		this.parent(id,stream,left,top,width,height,'hls');
	}
});


Class ("paella.videoFactories.HLSVideoFactory", {
	isStreamCompatible:function(streamData) {
		if (base.userAgent.system.iOS &&
			paella.videoFactories.Html5VideoFactory.s_instances==0)
		{
			try {
				for (var key in streamData.sources) {
					if (key=='hls') return true;
				}
			}
			catch (e) {}
		}

		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		++paella.videoFactories.Html5VideoFactory.s_instances;
		return new paella.HLSPlayer(id, streamData, rect.x, rect.y, rect.w, rect.h);
	}
});
