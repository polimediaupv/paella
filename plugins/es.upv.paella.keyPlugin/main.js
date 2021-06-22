paella.addPlugin(() => {
    return class DefaultKeyPlugin extends paella.KeyPlugin {
        checkEnabled(onSuccess) {
			onSuccess(true);
        }
        
        getName() { return "es.upv.paella.defaultKeysPlugin"; }
    
        setup() {

        }

        onKeyPress(event) {
            // Matterhorn standard keys
			if (event.altKey && event.ctrlKey) {
				if (event.which==paella.Keys.P) {
                    this.togglePlayPause();
                    return true;
				}
				else if (event.which==paella.Keys.S) {
                    this.pause();
                    return true;
				}
				else if (event.which==paella.Keys.M) {
                    this.mute();
                    return true;
				}
				else if (event.which==paella.Keys.U) {
                    this.volumeUp();
                    return true;
				}
				else if (event.which==paella.Keys.D) {
                    this.volumeDown();
                    return true;
				}
			}
			else { // Paella player keys
				// added key K
				if (event.which==paella.Keys.Space || event.which==paella.Keys.K) {
                    this.togglePlayPause();
                    return true;
				}
				if (event.which==paella.Keys.Space) {
                    this.togglePlayPause();
                    return true;
				}
				else if (event.which==paella.Keys.Up) {
                    this.volumeUp();
                    return true;
				}
				else if (event.which==paella.Keys.Down) {
                    this.volumeDown();
                    return true;
				}
				else if (event.which==paella.Keys.M) {
                    this.mute();
                    return true;
				}
				// added key F
				else if (event.which==paella.Keys.F) {
					this.toggleFullScreen();
					return true;
				}
				// added key J and ARROW LEFT
				else if (event.which==paella.Keys.J || event.which==paella.Keys.Left ) {
					this.jumpBackward();
					return true;
				}
				// added key L and ARROW RIGHT
				else if (event.which==paella.Keys.L || event.which==paella.Keys.Right ) {
					this.jumpForward();
					return true;
				}
            }
            return false;
        }

		// toggle fullscreen (see "fullScreenButtonPlugin" -> "fullscreenbutton.js")
		toggleFullScreen() {
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

        togglePlayPause() {
            paella.player.videoContainer.paused().then((p) => {
                p ? paella.player.play() : paella.player.pause();
            });
		}
	
		pause() {
			paella.player.pause();
		}
	
		mute() {
			var videoContainer = paella.player.videoContainer;
			if (videoContainer.muted) {
				videoContainer.unmute();
			}
			else {
				videoContainer.mute();
			}
			// videoContainer.volume().then(function(volume){
			// 	var newVolume = 0;
			// 	if (volume==0) { newVolume = 1.0; }
			// 	paella.player.videoContainer.setVolume({ master:newVolume, slave: 0});
			// });
		}
	
		volumeUp() {
			var videoContainer = paella.player.videoContainer;
			videoContainer.volume().then(function(volume){
				volume += 0.1;
				volume = (volume>1) ? 1.0:volume;
				paella.player.videoContainer.setVolume(volume);
			});
		}
	
		volumeDown() {
			var videoContainer = paella.player.videoContainer;
			videoContainer.volume().then(function(volume){
				volume -= 0.1;
				volume = (volume<0) ? 0.0:volume;
				paella.player.videoContainer.setVolume(volume);
			});
		}

		// jump backward "-10 seconds" (see "flexSkipPlugin" -> "flexskipbutton.js")
		jumpBackward() {
			var videoContainer = paella.player.videoContainer;
			videoContainer.currentTime().then(function(currentTime) {
				paella.player.videoContainer.seekToTime(currentTime - 10);
			});
		}

		// jump forward "+10 seconds" (see "flexSkipPlugin" -> "flexskipbutton.js")
		jumpForward() {
			var videoContainer = paella.player.videoContainer;
			videoContainer.currentTime().then(function(currentTime) {
				paella.player.videoContainer.seekToTime(currentTime + 10);
			});
		}
    };
})