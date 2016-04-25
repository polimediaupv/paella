Class ("paella.plugins.FullScreenPlugin",paella.ButtonPlugin, {
	_reload:null,

	getIndex:function() { return 551; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showFullScreenButton"; },
	getName:function() { return "es.upv.paella.fullScreenButtonPlugin"; },
	checkEnabled:function(onSuccess) {
		var enabled = paella.player.checkFullScreenCapability();
		onSuccess(enabled);
	},
	getDefaultToolTip:function() { return base.dictionary.translate("Go Fullscreen"); },

	setup:function() {
		var thisClass = this;

		this._reload = this.config.reloadOnFullscreen ? this.config.reloadOnFullscreen.enabled:false;
		this._keepUserQuality = this.config.reloadOnFullscreen ? this.config.reloadOnFullscreen.keepUserSelection:true;
		paella.events.bind(paella.events.enterFullscreen, function(event) { thisClass.onEnterFullscreen(); });
		paella.events.bind(paella.events.exitFullscreen, function(event) { thisClass.onExitFullscreen(); });
	},

	action:function(button) {
		var self = this;
		if (paella.player.isFullScreen()) {
			paella.player.exitFullScreen();
		}
		else if ((!paella.player.checkFullScreenCapability() || base.userAgent.browser.Explorer) && window.location !== window.parent.location) {
			// Iframe and no fullscreen support
			var url = window.location.href;

			paella.player.pause();
			paella.player.videoContainer.currentTime()
                .then(function(currentTime) {
					var obj = self.secondsToHours(currentTime);
					window.open(url+"&time="+obj.h+"h"+obj.m+"m"+obj.s+"s&autoplay=true");
                });
			
			return;
		}
		else {
			paella.player.goFullScreen();
		}

		setTimeout(function() {
			if(self._reload) {
				paella.player.videoContainer.setQuality(null)
					.then(function() {
					});
				//paella.player.reloadVideos();
			}
		}, 1000);
	},

	secondsToHours:function(sec_numb) {
		var hours   = Math.floor(sec_numb / 3600);
		var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
		var seconds =  Math.floor(sec_numb - (hours * 3600) - (minutes * 60));
		var obj = {};

		if (hours < 10) {hours = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		obj.h = hours;
		obj.m = minutes;
		obj.s = seconds;
		return obj;
	},

	onEnterFullscreen: function() {
		this.setToolTip(base.dictionary.translate("Exit Fullscreen"));
		this.button.className = this.getButtonItemClass(true);				
	},
	
	onExitFullscreen: function() {
		this.setToolTip(base.dictionary.translate("Go Fullscreen"));
		this.button.className = this.getButtonItemClass(false);
		setTimeout(function() {
			paella.player.onresize();
		}, 100);
	},

	getButtonItemClass:function(selected) {
		return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' active':'');
	}
});

paella.plugins.fullScreenPlugin = new paella.plugins.FullScreenPlugin();
