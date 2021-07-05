
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
		getDefaultToolTip() { return paella.utils.dictionary.translate("Fullscreen (f)"); }
		
		setup() {
			this._reload = this.config.reloadOnFullscreen ? this.config.reloadOnFullscreen.enabled:false;
			paella.events.bind(paella.events.enterFullscreen, (event) => this.onEnterFullscreen());
			paella.events.bind(paella.events.exitFullscreen, (event) => this.onExitFullscreen());
		}
	
		action(button) {
			if (paella.player.isFullScreen()) {
				paella.player.exitFullScreen();
			}
			else if ((!paella.player.checkFullScreenCapability() || paella.utils.userAgent.browser.Explorer) && window.location !== window.parent.location) {
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
	
			if (paella.player.config.player.reloadOnFullscreen && paella.player.videoContainer.supportAutoplay()) {
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
			this.setToolTip(paella.utils.dictionary.translate("Exit fullscreen (f)"));
			this.button.className = this.getButtonItemClass(true);
			this.changeIconClass('icon-windowed');
		}
		
		onExitFullscreen() {
			this.setToolTip(paella.utils.dictionary.translate("Fullscreen (f)"));
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
