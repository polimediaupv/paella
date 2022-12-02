
paella.addPlugin(function() {
	return class PlayPauseButtonPlugin extends paella.ButtonPlugin {
		constructor() {
			super();
			this.playIconClass = 'icon-play';
			this.replayIconClass = 'icon-loop2';
			this.pauseIconClass = 'icon-pause';
			this.playSubclass = 'playButton';
			this.pauseSubclass = 'pauseButton';
		}
	
		getAlignment() { return 'left'; }
		getSubclass() { return this.playSubclass; }
		getIconClass() { return this.playIconClass; }
		getName() { return "es.upv.paella.playPauseButtonPlugin"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Play"); }
		getIndex() { return 110; }
	
		checkEnabled(onSuccess) {
			onSuccess(true);
		}
	
		setup() {
			if (paella.player.playing()) {
				this.changeIconClass(this.playIconClass);
			}
			
			paella.events.bind(paella.events.play,(event) => {
				this.changeIconClass(this.pauseIconClass);
				this.changeSubclass(this.pauseSubclass);
				this.setToolTip(paella.utils.dictionary.translate("Pause (k)"));
			});

			paella.events.bind(paella.events.pause,(event) => {
				this.changeIconClass(this.playIconClass);
				this.changeSubclass(this.playSubclass);
				this.setToolTip(paella.utils.dictionary.translate("Play (k)"));
			});

			paella.events.bind(paella.events.ended,(event) => {
				this.changeIconClass(this.replayIconClass);
				this.changeSubclass(this.playSubclass);
				this.setToolTip(paella.utils.dictionary.translate("Play (k)"));
			});
		}
	
		action(button) {
			paella.player.videoContainer.paused()
				.then(function(paused) {
					if (paused) {
						paella.player.play();
					}
					else {
						paella.player.pause();
					}
				});
		}
	}	
});

