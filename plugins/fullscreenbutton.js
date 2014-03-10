paella.plugins.FullScreenPlugin = Class.create(paella.ButtonPlugin, {
	getIndex:function() { return 551; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showFullScreenButton"; },
	getName:function() { return "es.upv.paella.fullScreenButtonPlugin"; },
	checkEnabled:function(onSuccess) { 
		onSuccess((!paella.extended) && (window==window.top)); 
	},
	getDefaultToolTip:function() { return paella.dictionary.translate("Go FullScreen"); },		
	

					       
	action:function(button) {
		var fs = document.getElementById(paella.player.mainContainer.id);
		fs.style.width = '100%';
		fs.style.height = '100%';
		if (this.isFullscreen()) {
		 
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
				button.className = this.getButtonItemClass(false);
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
				button.className = this.getButtonItemClass(false);
			}
			else if (document.cancelFullScreen) {
				document.cancelFullScreen();
				button.className = this.getButtonItemClass(false);
			}
			
			
		}
		else {
			if (fs.webkitRequestFullScreen) {
				fs.webkitRequestFullScreen();
				button.className = this.getButtonItemClass(true);
			}
			else if (fs.mozRequestFullScreen){
				fs.mozRequestFullScreen();
				button.className = this.getButtonItemClass(true);
			}
			else if (fs.requestFullScreen()) {
				fs.requestFullScreen();
				button.className = this.getButtonItemClass(true);
			}
			else {
				alert('Your browser does not support fullscreen mode');
			}
		}
	},
	
	isFullscreen:function() {
		if (document.webkitIsFullScreen!=undefined) {
			return document.webkitIsFullScreen;
		}
		else if (document.mozFullScreen!=undefined) {
			return document.mozFullScreen;
		}
		return false;
	},
	
	getButtonItemClass:function(selected) {
		return 'buttonPlugin '+this.getAlignment() +' '+ this.getSubclass() + ((selected) ? ' active':'');
	}
});

paella.plugins.fullScreenPlugin = new paella.plugins.FullScreenPlugin();
