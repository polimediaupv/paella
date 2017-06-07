Class ("paella.plugins.WindowTitlePlugin",paella.EventDrivenPlugin,{
	_initDone:false,

	getName:function() {
		return "es.upv.paella.windowTitlePlugin";
	},

	checkEnabled:function(onSuccess) {
		paella.player.videoContainer.masterVideo().duration()
			.then((d) => {
				this.loadTitle();
			});
		onSuccess(true);
	},

	loadTitle:function() {
		var title = paella.player.videoLoader.getMetadata() && paella.player.videoLoader.getMetadata().title;
		document.title = title || document.title;
		this._initDone = true;
	}
});

paella.plugins.windowTitlePlugin = new paella.plugins.WindowTitlePlugin();
