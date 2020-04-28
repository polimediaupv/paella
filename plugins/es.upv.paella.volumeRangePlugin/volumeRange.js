
paella.addPlugin(function() {
	return class VolumeRangePlugin extends paella.ButtonPlugin {
		getAlignment() { return 'left'; }
		getSubclass() { return 'volumeRangeButton'; }
		getIconClass() { return 'icon-volume-high'; }
		getName() { return "es.upv.paella.volumeRangePlugin"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Volume"); }
		getIndex() {return 9999;}

		checkEnabled(onSuccess) {
			this._tempMasterVolume = 0;
			this._inputMaster = null;
			this._control_NotMyselfEvent = true;
			this._storedValue = false;
			var enabled = !paella.utils.userAgent.browser.IsMobileVersion;
			onSuccess(enabled);
		}

		setup() {
			var self = this;
			//STORE VALUES
			paella.events.bind(paella.events.videoUnloaded,function(event,params) {self.storeVolume();});
			//RECOVER VALUES
			paella.events.bind(paella.events.singleVideoReady,function(event,params) {self.loadStoredVolume(params);});

			paella.events.bind(paella.events.setVolume, function(evt,par){ self.updateVolumeOnEvent(par);});
		}

		updateVolumeOnEvent(volume){
			var thisClass = this;

			if(thisClass._control_NotMyselfEvent){
				thisClass._inputMaster = volume.master;
			}
			else {thisClass._control_NotMyselfEvent = true;}
		}

		storeVolume(){
			var This = this;
			paella.player.videoContainer.streamProvider.mainAudioPlayer.volume()
				.then(function(v) {
					This._tempMasterVolume = v;
					This._storedValue = true;
				});
		}

		loadStoredVolume(params){
			if (this._storedValue == false) {
				this.storeVolume();
			}

			if(this._tempMasterVolume){
				paella.player.videoContainer.setVolume(this._tempMasterVolume);
			}
			this._storedValue = false;
		}

		action(button) {
			if (paella.player.videoContainer.muted) {
				paella.player.videoContainer.unmute();
			}
			else {
				paella.player.videoContainer.mute();
			}
		}

		getExpandableContent() {
			var rangeInput = document.createElement('input');
			this._inputMaster = rangeInput;
			rangeInput.type = "range";
			rangeInput.min = 0;
			rangeInput.max = 1;
			rangeInput.step = 0.01;
			paella.player.videoContainer.audioPlayer.volume()
				.then((vol) => {
					rangeInput.value = vol;
				})

			let updateMasterVolume = () => {
				var masterVolume = $(rangeInput).val();
				var slaveVolume = 0;
				this._control_NotMyselfEvent = false;
				paella.player.videoContainer.setVolume(masterVolume);
			};
			$(rangeInput).bind('input', function (e) { updateMasterVolume(); });
			$(rangeInput).change(function() { updateMasterVolume(); });

			paella.events.bind(paella.events.setVolume, (event,params) => {
				rangeInput.value = params.master;
				this.updateClass();
			});
			this.updateClass();

			return rangeInput;
		}

		updateClass() {
			var selected = '';
			var self = this;
			
			paella.player.videoContainer.volume()
				.then((volume) => {
					if (volume === undefined) { selected = 'icon-volume-mid'; }
					else if (volume == 0) { selected = 'icon-volume-mute'; }
					else if (volume < 0.33) { selected = 'icon-volume-low'; }
					else if (volume < 0.66) { selected = 'icon-volume-mid'; }
					else { selected = 'icon-volume-high'; }
					this.changeIconClass(selected);
				})
		}
	};
});
