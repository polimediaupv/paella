
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
			onSuccess(!paella.player.isLiveStream() || base.userAgent.system.Android 
				|| base.userAgent.system.iOS || !paella.player.videoContainer.supportAutoplay());
		}
	
		getIndex() { return 1010; }
		getName() { return "es.upv.paella.playButtonOnScreenPlugin"; }
	
		setup() {
			var thisClass = this;
			this.container = document.createElement('div');
			this.container.className = "playButtonOnScreen";
			this.container.id = this.containerId;
			this.container.style.width = "100%";
			this.container.style.height = "100%";		
			paella.player.videoContainer.domElement.appendChild(this.container);
			$(this.container).click(function(event){thisClass.onPlayButtonClick();});
	
			var icon = document.createElement('canvas');
			icon.className = "playButtonOnScreenIcon";
			this.container.appendChild(icon);
	
			function repaintCanvas(){
				var width = jQuery(thisClass.container).innerWidth();
				var height = jQuery(thisClass.container).innerHeight();
	
				icon.width = width;
				icon.height = height;
	
				var iconSize = (width<height) ? width/3 : height/3;
	
				var ctx = icon.getContext('2d');
				// Play Icon size: 300x300
				ctx.translate((width-iconSize)/2, (height-iconSize)/2);
	
				ctx.beginPath();
				ctx.arc(iconSize/2, iconSize/2 ,iconSize/2, 0, 2*Math.PI, true);
				ctx.closePath();
	
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 10;
				ctx.stroke();
				ctx.fillStyle = '#8f8f8f';
				ctx.fill();
	
				ctx.beginPath();
				ctx.moveTo(iconSize/3, iconSize/4);
				ctx.lineTo(3*iconSize/4, iconSize/2);
				ctx.lineTo(iconSize/3, 3*iconSize/4);
				ctx.lineTo(iconSize/3, iconSize/4);
	
				ctx.closePath();
				ctx.fillStyle = 'white';
				ctx.fill();
	
				ctx.stroke();
			}
			paella.events.bind(paella.events.resize,repaintCanvas);
			repaintCanvas();
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
});

