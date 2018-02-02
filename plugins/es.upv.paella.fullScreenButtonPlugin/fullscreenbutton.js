
paella.addPlugin(function() {
	return class FullScreenPlugin extends paella.ButtonPlugin {
		
		getIndex() { return 551; }
		getAlignment() { return 'right'; }
		getSubclass() { return "showFullScreenButton"; }
		getIconClass() { return 'icon-fullscreen'; }
		getName() { return "es.upv.paella.fullScreenButtonPlugin"; }
		checkEnabled(onSuccess) {
			this._reload = null;
			var enabled = paella.player.checkFullScreenCapability();
			onSuccess(enabled);
		}
		getDefaultToolTip() { return base.dictionary.translate("Go Fullscreen"); }
		
		setup() {
			this._reload = this.config.reloadOnFullscreen ? this.config.reloadOnFullscreen.enabled:false;
			this._keepUserQuality = this.config.reloadOnFullscreen ? this.config.reloadOnFullscreen.keepUserSelection:true;
			paella.events.bind(paella.events.enterFullscreen, (event) => this.onEnterFullscreen());
			paella.events.bind(paella.events.exitFullscreen, (event) => this.onExitFullscreen());
		}
	
		action(button) {
			if (paella.player.isFullScreen()) {
				paella.player.exitFullScreen();
			}
			else if ((!paella.player.checkFullScreenCapability() || base.userAgent.browser.Explorer) && window.location !== window.parent.location) {
				// Iframe and no fullscreen support
				var url = window.location.href;
	
				paella.player.pause();
				paella.player.videoContainer.currentTime()
					.then((currentTime) => {
						var obj = this.secondsToHours(currentTime);
						window.open(url+"&time="+obj.h+"h"+obj.m+"m"+obj.s+"s&autoplay=true");
					});
				
				return;
			}
			else {
				paella.player.goFullScreen();
			}
	
			if (paella.player.config.player.reloadOnFullscreen && !paella.utils.userAgent.system.iOS) {
				setTimeout(() => {
					if(this._reload) {
						paella.player.videoContainer.setQuality(null)
							.then(() => {
							});
						//paella.player.reloadVideos();
					}
				}, 1000);
			}
		}
	
		secondsToHours(sec_numb) {
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
		}
	
		onEnterFullscreen() {
			this.setToolTip(base.dictionary.translate("Exit Fullscreen"));
			this.button.className = this.getButtonItemClass(true);
			this.changeIconClass('icon-windowed');
		}
		
		onExitFullscreen() {
			this.setToolTip(base.dictionary.translate("Go Fullscreen"));
			this.button.className = this.getButtonItemClass(false);
			this.changeIconClass('icon-fullscreen');
			setTimeout(() => {
				paella.player.onresize();
			}, 100);
		}
	
		getButtonItemClass(selected) {
			return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' active':'');
		}
	}
});
