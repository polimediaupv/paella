
Class ("paella.videoFactories.WebmVideoFactory", {
	webmCapable:function() {
		var testEl = document.createElement( "video" );
		if ( testEl.canPlayType ) {
			return "" !== testEl.canPlayType( 'video/webm; codecs="vp8, vorbis"' );
		}
		else {
			return false;
		}
	},

	isStreamCompatible:function(streamData) {
		try {
			if (!this.webmCapable()) return false;
			for (var key in streamData.sources) {
				if (key=='webm') return true;
			}
		}
		catch (e) {}
		return false;
	},

	getVideoObject:function(id, streamData, rect) {
		return new paella.Html5Video(id, streamData, rect.x, rect.y, rect.w, rect.h,'webm');
	}
});
