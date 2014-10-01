
Class ("paella.plugins.VolumeRangePlugin", paella.ButtonPlugin,{
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return 'volumeRangeButton'; },
	getName:function() { return "es.upv.paella.volumeRangePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Volume"); },
	getIndex:function() {return 120;},

	_showMasterVolume: null,
	_showSlaveVolume: null,

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
			rangeInputMaster.type = "range";
			rangeInputMaster.value = this.getMasterVolume();
			rangeInputMaster.min = 0;
			rangeInputMaster.max = 1;
			rangeInputMaster.step = 0.01;
			
			var updateMasterVolume = function() {
				var slaveVideo = paella.player.videoContainer.slaveVideo();
				var slaveVolume = 0;
				if (slaveVideo) { slaveVolume = slaveVideo.volume(); }
			
				var masterVolume = $(rangeInputMaster).val(); 
				paella.events.trigger(paella.events.setVolume, {master:masterVolume, slave:slaveVolume});				
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
			rangeInputSlave.type = "range";
			rangeInputSlave.value = this.getSlaveVolume();
			rangeInputSlave.min = 0;
			rangeInputSlave.max = 1;
			rangeInputSlave.step = 0.01;
			
			var updateSlaveVolume = function() {
				var masterVideo = paella.player.videoContainer.masterVideo();
				var masterVolume = 0;
				if (masterVideo) { masterVolume = masterVideo.volume(); }
				
				var slaveVolume = $(rangeInputSlave).val(); 
				paella.events.trigger(paella.events.setVolume,{master:masterVolume, slave:slaveVolume});
			};
			$(rangeInputSlave).bind('input', function (e) { updateSlaveVolume(); });
			$(rangeInputSlave).change(function() { updateSlaveVolume(); });
									
			rangeSlave.appendChild(rangeImageSlave);
			rangeSlave.appendChild(rangeInputSlave);
			videoRangeContainer.appendChild(rangeSlave);
		}

							
		paella.events.bind(paella.events.setVolume, function(event,params) {
			if (this._showMasterVolume) {
				rangeInputMaster.value = params.master;
			}
			if (!paella.player.videoContainer.isMonostream && this._showMasterVolume) {
				rangeInputSlave.value = params.slave;
			}
			thisClass.updateClass();
		});
		
		
		
		domElement.appendChild(videoRangeContainer);
		thisClass.updateClass();
	},
	
	getMasterVolume : function() {
		var masterVideo = paella.player.videoContainer.masterVideo();
	
		if (masterVideo) {	
			return masterVideo.volume();
		}
		return 0;
	},

	getSlaveVolume : function() {
		var slaveVideo = paella.player.videoContainer.slaveVideo();
		
		if (slaveVideo) {	
			return slaveVideo.volume();
		}
		return 0;
	},
	
	updateClass: function() {
		var volume; 
		var selected = '';
		
		if (this._showMasterVolume && this._showSlaveVolume) {
			selected = "med";
		}
		else {
			if (this._showMasterVolume) {
				volume = paella.player.videoContainer.masterVideo().volume();
			}
			if (this._showSlaveVolume) {
				volume = paella.player.videoContainer.slaveVideo().volume();				
			}
			
			if (volume === undefined) { selected = 'med'; }
			else if (volume == 0) { selected = 'mute'; }
			else if (volume < 0.33) { selected = 'min'; }
			else if (volume < 0.66) { selected = 'med'; }
			else { selected = 'max'; }
		} 
						
		this.button.className = ['buttonPlugin', this.getAlignment(), this.getSubclass(), selected].join(' ');		
	}
});

paella.plugins.volumeRangePlugin = new paella.plugins.VolumeRangePlugin();

