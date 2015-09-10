Class ("paella.plugins.WindowTitlePlugin",paella.EventDrivenPlugin,{
	_initDone:false,

	getName:function() {
		return "es.upv.paella.windowTitlePlugin";
	},

	getEvents:function() {
		return [
			paella.events.singleVideoReady
		];
	},

	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.singleVideoReady:
				if (!this._initDone) this.loadTitle();
				break;
		}
	},

	loadTitle:function() {
		var title = paella.player.videoLoader.getMetadata() && paella.player.videoLoader.getMetadata().title;
		document.title = title || document.title;
		this._initDone = true;
	}
});

paella.plugins.windowTitlePlugin = new paella.plugins.WindowTitlePlugin();
