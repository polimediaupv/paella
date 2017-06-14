
Class ("paella.plugins.VolumeRangePlugin", paella.ButtonPlugin,{
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return 'volumeRangeButton'; },
	getName:function() { return "es.upv.paella.volumeRangePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Volume"); },
	getIndex:function() {return 120;},

	_tempMasterVolume: 0,
	_inputMaster: null,
	_control_NotMyselfEvent: true,
	_storedValue: false,

	closeOnMouseOut:function() { return true; },
	
	checkEnabled:function(onSuccess) {
		var enabled = !base.userAgent.browser.IsMobileVersion;
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
			thisClass._inputMaster = volume.master;
		}
		else {thisClass._control_NotMyselfEvent = true;}
	},

	storeVolume:function(){
		var This = this;
		paella.player.videoContainer.mainAudioPlayer().volume()
			.then(function(v) {
				This._tempMasterVolume = v;
				This._storedValue = true;
			});
	},

	loadStoredVolume:function(params){
		if (this._storedValue == false) {
			this.storeVolume();
		}

		if(this._tempMasterVolume){
			paella.player.videoContainer.setVolume({ master:this._tempMasterVolume });
		}
		this._storedValue = false;
	},

	buildContent:function(domElement) {
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
		paella.player.videoContainer.masterVideo().volume()
			.then((vol) => {
				rangeInputMaster.value = vol;
			})

		function updateMasterVolume() {
			var masterVolume = $(rangeInputMaster).val();
			var slaveVolume = 0;
			thisClass._control_NotMyselfEvent = false;
			paella.player.videoContainer.setVolume({ master:masterVolume });
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
	},

	updateClass: function() {
		var selected = '';
		var self = this;
		
		paella.player.videoContainer.mainAudioPlayer().volume()
			.then(function(volume){
				if (volume === undefined) { selected = 'med'; }
				else if (volume == 0) { selected = 'mute'; }
				else if (volume < 0.33) { selected = 'min'; }
				else if (volume < 0.66) { selected = 'med'; }
				else { selected = 'max'; }
				self.button.className = ['buttonPlugin', self.getAlignment(), self.getSubclass(), selected].join(' ');				
			})
	}
});

paella.plugins.volumeRangePlugin = new paella.plugins.VolumeRangePlugin();

