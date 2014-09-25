paella.plugins.FullScreenPlugin = Class.create(paella.ButtonPlugin, {
	_isFullscreen:false,

	getIndex:function() { return 551; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showFullScreenButton"; },
	getName:function() { return "es.upv.paella.fullScreenButtonPlugin"; },
	checkEnabled:function(onSuccess) {
		var enabled = false;
		if (base.userAgent.browser.IsMobileVersion) {
			enabled = paella.player.videoContainer.isMonostream && !paella.extended;
		}
		else {
			enabled = !paella.extended;
		}
		onSuccess(enabled);
	},
	getDefaultToolTip:function() { return base.dictionary.translate("Go Fullscreen"); },


	action:function(button) {
		//if (window==window.top) {
		//	this.doFullScreen(button);
		//}
		//else {
		//	window.top.location = window.location;
		//}
		this.doFullScreen(button);
	},

	doFullScreen:function(button) {
		var fs = document.getElementById(paella.player.mainContainer.id);
		fs.style.width = '100%';
		fs.style.height = '100%';
		var video = paella.player.videoContainer.masterVideo().domElement;
		if (base.userAgent.browser.IsMobileVersion && paella.player.videoContainer.isMonostream && video.webkitSupportsFullscreen) {
			video.webkitEnterFullscreen();
		}
		else {
			if (this.isFullscreen()) {

				this.setToolTip(base.dictionary.translate("Go Fullscreen"));

				if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
					button.className = this.getButtonItemClass(false);
					this._isFullscreen = false;
				}
				else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
					button.className = this.getButtonItemClass(false);
					this._isFullscreen = false;
				}
				else if (document.msExitFullscreen()) {
					document.msExitFullscreen();
					button.className = this.getButtonItemClass(false);
					this._isFullscreen = false;
				}
				else if (document.cancelFullScreen) {
					document.cancelFullScreen();
					button.className = this.getButtonItemClass(false);
					this._isFullscreen = false;
				}

			}
			else {
				this.setToolTip(base.dictionary.translate("Exit Fullscreen"));		
				if (fs.webkitRequestFullScreen) {
					fs.webkitRequestFullScreen();
					button.className = this.getButtonItemClass(true);
					this._isFullscreen = true;
				}
				else if (fs.mozRequestFullScreen){
					fs.mozRequestFullScreen();
					button.className = this.getButtonItemClass(true);
					this._isFullscreen = true;
				}
				else if (fs.msRequestFullscreen) {
					fs.msRequestFullscreen();
					button.className = this.getButtonItemClass(true);
					this._isFullscreen = true;
				}
				else if (fs.requestFullScreen) {
					fs.requestFullScreen();
					button.className = this.getButtonItemClass(true);
					this._isFullscreen = true;
				}
				else {
					this.setToolTip(base.dictionary.translate("Go Fullscreen"));
					alert('Your browser does not support fullscreen mode');
				}
			}
		}
	},

	isFullscreen:function() {
		return this._isFullscreen;
	},

	getButtonItemClass:function(selected) {
		return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' active':'');
	}
});

paella.plugins.fullScreenPlugin = new paella.plugins.FullScreenPlugin();
