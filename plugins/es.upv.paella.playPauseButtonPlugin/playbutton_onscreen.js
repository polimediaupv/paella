
paella.addPlugin(function() {
	return class PlayButtonOnScreen extends paella.EventDrivenPlugin {
		constructor() {
			super();
			this.containerId = 'paella_plugin_PlayButtonOnScreen';
			this.container = null;
			this.enabled = true;
			this.isPlaying = false;
			this.showIcon = true;
			this.firstPlay = false;
		}
	
		checkEnabled(onSuccess) {
			this.showOnEnd = true;
			paella.data.read('relatedVideos', {id:paella.player.videoIdentifier}, (data) => {
                this.showOnEnd = !Array.isArray(data) ||  data.length == 0;
			});
			
			onSuccess(true);
		}
	
		getIndex() { return 1010; }
		getName() { return "es.upv.paella.playButtonOnScreenPlugin"; }
	
		setup() {
			this.container = paella.LazyThumbnailContainer.GetIconElement();
			paella.player.videoContainer.domElement.appendChild(this.container);
			$(this.container).click(() =>  this.onPlayButtonClick());
		}
	
		getEvents() {
			return [
				paella.events.ended,
				paella.events.endVideo,
				paella.events.play,
				paella.events.pause,
				paella.events.showEditor,
				paella.events.hideEditor
			];
		}
	
		onEvent(eventType,params) {
			switch (eventType) {
				case paella.events.ended:
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
			paella.player.videoContainer.ended()
			.then(ended => {
				if (ended) {
					this.isPlaying = false;
					this.showIcon = this.showOnEnd;
					this.checkStatus();
				} else {
					paella.log.debug(`BTN ON SCREEN: The player is no longer in ended state.`);
				}
			});
		}
	
		play() {
			this.isPlaying = true;
			this.showIcon = false;
			if (!/dimmed/.test(this.container.className)) {
				this.container.className += " dimmed";
			}
			this.checkStatus();
		}
	
		pause() {
			this.isPlaying = false;
			this.showIcon = this.config.showOnPause;
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
});

