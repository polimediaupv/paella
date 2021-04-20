---
---

# Defaul tkey plugin

Implemented in `plugins/es.upv/paella.keyPlugin/main.js`:

```javascript
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
            }
            
            return false;
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
    };
})
```

