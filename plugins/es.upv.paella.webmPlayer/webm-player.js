
(() => {

class WebmVideoFactory extends paella.VideoFactory {
	webmCapable() {
		var testEl = document.createElement( "video" );
		if ( testEl.canPlayType ) {
			return "" !== testEl.canPlayType( 'video/webm; codecs="vp8, vorbis"' );
		}
		else {
			return false;
		}
	}

	isStreamCompatible(streamData) {
		try {
			if (!this.webmCapable()) return false;
			for (var key in streamData.sources) {
				if (key=='webm') return true;
			}
		}
		catch (e) {}
		return false;
	}

	getVideoObject(id, streamData, rect) {
		return new paella.Html5Video(id, streamData, rect.x, rect.y, rect.w, rect.h,'webm');
	}
}

paella.videoFactories.WebmVideoFactory = WebmVideoFactory;

})();
