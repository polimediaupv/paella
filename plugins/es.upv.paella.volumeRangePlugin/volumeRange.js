
Class ("paella.plugins.VolumeRangePlugin", paella.ButtonPlugin,{
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return 'volumeRangeButton'; },
	getName:function() { return "es.upv.paella.volumeRangePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Volume"); },
	getIndex:function() {return 120;},

	_showMasterVolume: null,
	_showSlaveVolume: null,
	_tempMasterVolume: 0,
	_tempSlaveVolume: 0,
	_inputMaster: null,
	_inputSlave: null,
	_control_NotMyselfEvent: true,
	_storedValue: false,

	closeOnMouseOut:function() { return true; },
	
	checkEnabled:function(onSuccess) {
		var enabled = false;
		if (!base.userAgent.browser.IsMobileVersion) {
			this._showMasterVolume = (this.config.showMasterVolume !== undefined) ? this.config.showMasterVolume : true;
			this._showSlaveVolume = ((this.config.showSlaveVolume !== undefined) && (!paella.player.videoContainer.isMonostream)) ? this.config.showSlaveVolume : false;

			if (this._showMasterVolume || this._showSlaveVolume) {
				enabled = true;
			}
		}
		onSuccess(enabled);
	},

	setup:function() {
		var self = this;
		//STORE VALUES
		paella.events.bind(paella.events.videoUnloaded,function(event,params) {self.storeVolume();});
		//RECOVER VALUES
		paella.events.bind(paella.events.singleVideoReady,function(event,params) {self.loadStoredVolume(params);});

		paella.events.bind(paella.events.setVolume, function(evt,par){ self.updateVolumeOnEvent(par);});
	},

	updateVolumeOnEvent:function(volume){
		var thisClass = this;

		if(thisClass._control_NotMyselfEvent){
			if(thisClass._inputMaster){
				thisClass._inputMaster.value = volume.master;
			}

			if(thisClass._inputSlave){
				thisClass._inputSlave.value = volume.slave;
			}
		}
		else {thisClass._control_NotMyselfEvent = true;}
	},

	storeVolume:function(){
		var This = this;
		paella.player.videoContainer.masterVideo().volume()
			.then(function(v) {
				This._tempMasterVolume = v;
				return paella.player.videoContainer.slaveVideo() ? paella.player.videoContainer.slaveVideo().volume():0;
			})

			.then(function(v) {
				This._tempSlaveVolume  = v;
				This._storedValue = true;
			});
	},

	loadStoredVolume:function(params){
		if (this._storedValue == false) {
			this.storeVolume();
		}

		if((params.sender.identifier == "playerContainer_videoContainer_1") && this._tempSlaveVolume || this._tempMasterVolume){
			paella.player.videoContainer.setVolume({ master:this._tempMasterVolume, slave:this._tempSlaveVolume });
		}
		this._storedValue = false;
	},

	buildContent:function(domElement) {
		var thisClass = this;

		var videoRangeContainer = document.createElement('div');
		videoRangeContainer.className = 'videoRangeContainer';


		if (this._showMasterVolume) {
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
			paella.player.videoContainer.masterVideo().volume()
				.then((vol) => {
					rangeInputMaster.value = vol;
				})

			function updateMasterVolume() {
				var masterVolume = $(rangeInputMaster).val();
				var slaveVideo = paella.player.videoContainer.slaveVideo();
				var slaveVolume = 0;
				if (slaveVideo) {
					slaveVideo.volume()
						.then(function(volume) {
							slaveVolume = volume;
							thisClass._control_NotMyselfEvent = false;
							paella.player.videoContainer.setVolume({ master:masterVolume, slave:slaveVolume });
						});
				}
				else {
					thisClass._control_NotMyselfEvent = false;
					paella.player.videoContainer.setVolume({ master:masterVolume, slave:slaveVolume });
				}
			};
			$(rangeInputMaster).bind('input', function (e) { updateMasterVolume(); });
			$(rangeInputMaster).change(function() { updateMasterVolume(); });

			rangeMaster.appendChild(rangeImageMaster);
			rangeMaster.appendChild(rangeInputMaster);
			videoRangeContainer.appendChild(rangeMaster);
		}



		if (!paella.player.videoContainer.isMonostream && this._showSlaveVolume) {
			var rangeSlave = document.createElement('div');
			rangeSlave.className = "range";
			var rangeImageSlave = document.createElement('div');
			rangeImageSlave.className = "image slave";
			var rangeInputSlave = document.createElement('input');
			this._inputSlave = rangeInputSlave;
			rangeInputSlave.type = "range";
			rangeInputSlave.min = 0;
			rangeInputSlave.max = 1;
			rangeInputSlave.step = 0.01;
			paella.player.videoContainer.slaveVideo() && paella.player.videoContainer.slaveVideo().volume()
				.then((vol) => {
					rangeInputSlave.value = vol;
				});

			var updateSlaveVolume = function() {
				var masterVideo = paella.player.videoContainer.masterVideo();
				var slaveVolume = $(rangeInputSlave).val();
				var masterVolume = 0;
				if (masterVideo) { 
					masterVideo.volume()
						.then(function(volume) {
							thisClass._control_NotMyselfEvent = false;
							paella.player.videoContainer.setVolume({ master:volume, slave:slaveVolume });
						});
				}
				else {
					thisClass._control_NotMyselfEvent = false;
					paella.player.videoContainer.setVolume({ master:masterVolume, slave:slaveVolume });
				}
			};
			$(rangeInputSlave).bind('input', function (e) { updateSlaveVolume(); });
			$(rangeInputSlave).change(function() { updateSlaveVolume(); });

			rangeSlave.appendChild(rangeImageSlave);
			rangeSlave.appendChild(rangeInputSlave);
			videoRangeContainer.appendChild(rangeSlave);
		}


		paella.events.bind(paella.events.setVolume, (event,params) => {
			if (this._showMasterVolume) {
				rangeInputMaster.value = params.master;
			}
			if (!paella.player.videoContainer.isMonostream && this._showMasterVolume && this._inputSlave) {
				this._inputSlave.value = params.slave;
			}
			this.updateClass();
		});

		domElement.appendChild(videoRangeContainer);
		thisClass.updateClass();
	},

	getSlaveVolume : function() {
		var slaveVideo = paella.player.videoContainer.slaveVideo();

		if (slaveVideo) {
			return slaveVideo.volume();
		}
		return 0;
	},

	updateClass: function() {
		var selected = '';
		var self = this;
		
		if (this._showMasterVolume && this._showSlaveVolume) {
			selected = "med";
			this.button.className = ['buttonPlugin', this.getAlignment(), this.getSubclass(), selected].join(' ');
		}
		else {
			var volumePromise;
			if (this._showMasterVolume) {
				volumePromise = paella.player.videoContainer.masterVideo().volume();
			}
			if (this._showSlaveVolume) {
				volumePromise = paella.player.videoContainer.slaveVideo().volume();
			}

			volumePromise.then(function(volume){
				if (volume === undefined) { selected = 'med'; }
				else if (volume == 0) { selected = 'mute'; }
				else if (volume < 0.33) { selected = 'min'; }
				else if (volume < 0.66) { selected = 'med'; }
				else { selected = 'max'; }
				self.button.className = ['buttonPlugin', self.getAlignment(), self.getSubclass(), selected].join(' ');				
			});
		}
	}
});

paella.plugins.volumeRangePlugin = new paella.plugins.VolumeRangePlugin();

