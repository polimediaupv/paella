//paella.plugins.PlayPauseButtonPlugin = Class.create(paella.ButtonPlugin, {
Class ("paella.plugins.PlayPauseButtonPlugin",paella.ButtonPlugin, {
	playSubclass:'playButton',
	pauseSubclass:'pauseButton',

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.playSubclass; },
	getName:function() { return "es.upv.paella.playPauseButtonPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Play"); },
	getIndex:function() {return 110;},

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {
		var This = this;
		if (paella.player.playing()) {
			this.changeSubclass(This.pauseSubclass);
		}
		paella.events.bind(paella.events.play,function(event) { This.changeSubclass(This.pauseSubclass); This.setToolTip(paella.dictionary.translate("Pause"));});
		paella.events.bind(paella.events.pause,function(event) { This.changeSubclass(This.playSubclass); This.setToolTip(paella.dictionary.translate("Play"));});
	},

	action:function(button) {
		if (paella.player.videoContainer.paused()) {
			paella.events.trigger(paella.events.play);
		}
		else {
			paella.events.trigger(paella.events.pause);
		}
	}
});

paella.plugins.playPauseButtonPlugn = new paella.plugins.PlayPauseButtonPlugin();





//paella.plugins.PlayButtonOnScreen = Class.create(paella.EventDrivenPlugin,{
Class ("paella.plugins.PlayButtonOnScreen",paella.EventDrivenPlugin,{
	containerId:'paella_plugin_PlayButtonOnScreen',
	container:null,
	enabled:true,
	isPlaying:false,
	showIcon:true,
	firstPlay:false,

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {
		var thisClass = this;
		this.container = document.createElement('div');
		this.container.className = "playButtonOnScreen";
		this.container.id = this.containerId;
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
/*
			ctx.moveTo(100, 70);
			ctx.lineTo(250, 150);
			ctx.lineTo(100, 230);
			ctx.lineTo(100, 70);
*/
			ctx.closePath();
			ctx.fillStyle = 'white';
			ctx.fill();

			ctx.stroke();
		}
		window.addEventListener('resize', repaintCanvas, false);
		repaintCanvas();
	},

	getEvents:function() {
		return [paella.events.endVideo,paella.events.play,paella.events.pause,paella.events.showEditor,paella.events.hideEditor];
	},

	onEvent:function(eventType,params) {
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
	},

	onPlayButtonClick:function() {
		this.firstPlay = true;
		this.checkStatus();
	},

	endVideo:function() {
		this.isPlaying = false;
		this.checkStatus();
	},

	play:function() {
		this.isPlaying = true;
		this.showIcon = false;
		this.checkStatus();
	},

	pause:function() {
		this.isPlaying = false;
		this.showIcon = false;
		this.checkStatus();
	},

	showEditor:function() {
		this.enabled = false;
		this.checkStatus();
	},

	hideEditor:function() {
		this.enabled = true;
		this.checkStatus();
	},

	checkStatus:function() {
		if ((this.enabled && this.isPlaying) || !this.enabled || !this.showIcon) {
			$(this.container).hide();
		}
		else {
			$(this.container).show();
		}
	},

	getIndex:function() {
		return 1010;
	},

	getName:function() {
		return "es.upv.paella.playButtonOnScreen";
	}
});

new paella.plugins.PlayButtonOnScreen();
