paella.addPlugin(function() {
	return class WindowTitlePlugin extends paella.EventDrivenPlugin {
		
		getName() {
			return "es.upv.paella.windowTitlePlugin";
		}
		
		checkEnabled(onSuccess) {
			this._initDone = false;
			paella.player.videoContainer.masterVideo().duration()
				.then((d) => {
					this.loadTitle();
				});
			onSuccess(true);
		}

		loadTitle() {
			var title = paella.player.videoLoader.getMetadata() && paella.player.videoLoader.getMetadata().title;
			document.title = title || document.title;
			this._initDone = true;
		}
	};
});