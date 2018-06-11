
paella.addPlugin(function() {
	return class VolumeRangePlugin extends paella.ButtonPlugin {
		getAlignment() { return 'left'; }
		getSubclass() { return 'volumeRangeButton'; }
		getIconClass() { return 'icon-volume-high'; }
		getName() { return "es.upv.paella.volumeRangePlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getDefaultToolTip() { return base.dictionary.translate("Volume"); }
		getIndex() {return 120;}

		
		closeOnMouseOut() { return true; }
		
		checkEnabled(onSuccess) {
			this._tempMasterVolume = 0;
			this._inputMaster = null;
			this._control_NotMyselfEvent = true;
			this._storedValue = false;
			var enabled = !base.userAgent.browser.IsMobileVersion;
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

		buildContent(domElement) {
			var thisClass = this;

			var videoRangeContainer = document.createElement('div');
			videoRangeContainer.className = 'videoRangeContainer';


			var rangeMaster = document.createElement('div');
			rangeMaster.className = "range";
			var rangeImageMaster = document.createElement('div');
			rangeImageMaster.className = "image master";
			var rangeInputMaster = document.createElement('input');
			thisClass._inputMaster = rangeInputMaster;
			rangeInputMaster.type = "range";
			rangeInputMaster.min = 0;
			rangeInputMaster.max = 1;
			rangeInputMaster.step = 0.01;
			paella.player.videoContainer.audioPlayer.volume()
				.then((vol) => {
					rangeInputMaster.value = vol;
				})

			function updateMasterVolume() {
				var masterVolume = $(rangeInputMaster).val();
				var slaveVolume = 0;
				thisClass._control_NotMyselfEvent = false;
				paella.player.videoContainer.setVolume(masterVolume);
			};
			$(rangeInputMaster).bind('input', function (e) { updateMasterVolume(); });
			$(rangeInputMaster).change(function() { updateMasterVolume(); });

			rangeMaster.appendChild(rangeImageMaster);
			rangeMaster.appendChild(rangeInputMaster);
			videoRangeContainer.appendChild(rangeMaster);

			paella.events.bind(paella.events.setVolume, (event,params) => {
				rangeInputMaster.value = params.master;
				this.updateClass();
			});

			domElement.appendChild(videoRangeContainer);
			thisClass.updateClass();

			var Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

			$(this.button).keyup(function(event) {
				if(thisClass.isPopUpOpen()) {
					paella.player.videoContainer.volume().then((v) => {
						let newvol = -1;
						if (event.keyCode == Keys.Left) {
							newvol = v - 0.1;
						}
						else if (event.keyCode == Keys.Right) {
							newvol = v + 0.1;
						}

						if (newvol!=-1) {
							newvol = newvol<0 ? 0 : newvol>1 ? 1 : newvol;
							paella.player.videoContainer.setVolume(newvol).then((v) => {
							})
						}
					});
				}
			});
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
