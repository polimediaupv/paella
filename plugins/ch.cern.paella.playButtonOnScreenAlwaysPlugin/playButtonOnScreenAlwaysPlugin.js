/*
Plugin override: PlayButtonOnScreen

Display always the big play button on the player, no matter the
stream is live or not.
*/
paella.addPlugin(function() {
	class PlayButtonOnScreenAlwaysPlugin extends paella.EventDrivenPlugin {
		getName() { return "ch.cern.paella.playButtonOnScreenAlwaysPlugin"; }
		getIndex() { return 1022; }

		constructor() {
			super();
			this.containerId = 'paella_plugin_PlayButtonOnScreen_Always';
			this.container = null;
			this.enabled = true;
			this.isPlaying = false;
			this.showIcon = true;
			this.firstPlay = false;
		}

		setup() {
			this.container = paella.LazyThumbnailContainer.GetIconElement();
			paella.player.videoContainer.domElement.appendChild(this.container);
			$(this.container).click(() =>  this.onPlayButtonClick());
		}

		checkEnabled(onSuccess) {
			this.showOnEnd = true;
			paella.data.read('relatedVideos', {id:paella.player.videoIdentifier}, (data) => {
                this.showOnEnd = !Array.isArray(data) ||  data.length == 0;
			});
			onSuccess(true);
		}

		getEvents() {
			return [paella.events.endVideo,paella.events.play,paella.events.pause,paella.events.showEditor,paella.events.hideEditor];
		}
		onEvent(eventType,params) {
			switch (eventType) {
				case paella.events.endVideo:
					this.endVideo();
					break;
				case paella.events.play:
					this.play();
					break;
				case paella.events.pause:
					this.pause();
					break;
				case paella.events.showEditor:
					this.showEditor();
					break;
				case paella.events.hideEditor:
					this.hideEditor();
					break;
			}
		}

		onPlayButtonClick() {
			this.firstPlay = true;
			this.checkStatus();
		}

		endVideo() {
			this.isPlaying = false;
			this.showIcon = this.showOnEnd;
			this.checkStatus();
		}

		play() {
			this.isPlaying = true;
			this.showIcon = false;
			this.checkStatus();
		}

		pause() {
			this.isPlaying = false;
			this.showIcon = true;
			this.checkStatus();
		}

		showEditor() {
			this.enabled = false;
			this.checkStatus();
		}

		hideEditor() {
			this.enabled = true;
			this.checkStatus();
		}

		checkStatus() {
			if ((this.enabled && this.isPlaying) || !this.enabled || !this.showIcon) {
				$(this.container).hide();
			}
			// Only show play button if none of the video players require mouse events
			else if (!paella.player.videoContainer.streamProvider.videoPlayers.every((p) => p.canvasData.mouseEventsSupport)) {
				$(this.container).show();
			}
	 }
	}

	paella.plugins.PlayButtonOnScreenAlwaysPlugin = PlayButtonOnScreenAlwaysPlugin;

	return PlayButtonOnScreenAlwaysPlugin;
});