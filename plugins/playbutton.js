
paella.plugins.PlayPauseButtonPlugin = Class.create(paella.ButtonPlugin, {
	playSubclass:'playButton',
	pauseSubclass:'pauseButton',
	
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.playSubclass; },
	getName:function() { return "es.upv.paella.playPauseButtonPlugin"; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Play"); },
	getIndex:function() {return 1000;},
	
	setup:function() {
		var This = this;
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

paella.plugins.PlayButtonOnScreen = Class.create(paella.EventDrivenPlugin,{
	containerId:'paella_plugin_PlayButtonOnScreen',
	container:null,
	enabled:true,
	isPlaying:false,

	initPlugin:function() {
		this.container = document.createElement('div');
		this.container.className = "playButtonOnScreen";
		this.container.id = this.containerId;
		paella.player.videoContainer.domElement.appendChild(this.container);
		var thisClass = this;
		$(this.container).click(function(event){thisClass.onPlayButtonClick()});
		
		var icon = document.createElement('canvas');
		icon.className = "playButtonOnScreenIcon";
		icon.setAttribute("width", 300);
		icon.setAttribute("height",300);
		var ctx = icon.getContext('2d');
		
		ctx.beginPath();
		ctx.arc(150,150,140,0,2*Math.PI,true);
		ctx.closePath();
		
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 10;
		ctx.stroke();
		ctx.fillStyle = '#8f8f8f';
		ctx.fill();
		
		ctx.beginPath();
		ctx.moveTo(100,70);
		ctx.lineTo(250,150);
		ctx.lineTo(100,230);
		ctx.lineTo(100,70);
		ctx.closePath();
		ctx.fillStyle = 'white';
		ctx.fill();

		ctx.stroke();

		this.container.appendChild(icon);
	},
	
	getEvents:function() {
		return [paella.events.endVideo,paella.events.play,paella.events.pause,paella.events.showEditor,paella.events.hideEditor,paella.events.loadComplete];
	},
	
	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.loadComplete:
				this.initPlugin();
				break;
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
		$(document).trigger(paella.events.play);
	},
	
	endVideo:function() {
		this.isPlaying = false;
		this.checkStatus();
	},
	
	play:function() {
		this.isPlaying = true;
		this.checkStatus();
	},
	
	pause:function() {
		this.isPlaying = false;
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
		if ((this.enabled && this.isPlaying) || !this.enabled) {
			$(this.container).hide();
		}
		else {
			$(this.container).show();
		}
	},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},
	
	getIndex:function() {
		return 1010;
	},
	
	getName:function() {
		return "es.upv.paella.playButtonOnScreen";
	}
});

new paella.plugins.PlayButtonOnScreen();
