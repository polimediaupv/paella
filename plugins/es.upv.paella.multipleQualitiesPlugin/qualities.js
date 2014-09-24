Class ("paella.plugins.MultipleQualitiesPlugin",paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showMultipleQualitiesPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.multipleQualitiesPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Change video quality"); },
	checkEnabled:function(onSuccess) { onSuccess(this.checkStreams()); },
	setup:function() {
		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Presenter':'Presentador',
				'Slide':'Diapositiva'
			};
			base.dictionary.addDictionary(esDict);
		}
	},

	checkStreams:function() {
		var key, j;
		this.currentMaster = paella.player.videoContainer.currentMasterVideoData;
		this.currentSlave = paella.player.videoContainer.currentSlaveVideoData;

		var allMasterSources = paella.player.videoContainer.masterVideoData.sources;
		for (key in allMasterSources){
			for (j =0; j < allMasterSources[key].length; ++j ){
				if ((allMasterSources[key][j].type == this.currentMaster.type)){
					this.availableMasters.push(allMasterSources[key][j]);
				}
			}
		}


		if (this.currentSlave){
			var allSlaveSources = paella.player.videoContainer.slaveVideoData.sources;
			for (key in allSlaveSources){
				for (j =0; j < allSlaveSources[key].length; ++j ){
					if ((allSlaveSources[key][j].type == this.currentSlave.type)){
						this.availableSlaves.push(allSlaveSources[key][j]);
					}
				}
			}
		}

		return (this.availableMasters.length > 1 || this.availableSlaves.length > 1);
	},

	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	buildContent:function(domElement) {
		var j,w,h,option;
		var thisClass = this;
		this.currentUrl = window.location;

		var selectQuality = document.createElement('div');
		selectQuality.className = 'selectQuality';

		var labelM = document.createElement('label');
		labelM.innerHTML = base.dictionary.translate("Presenter");

		var comboM = document.createElement('select');
		comboM.id = 'master';
		$(comboM).change(function() {
			var param1Q = $(comboM).val();
			thisClass.changeVideoStream(param1Q, comboM.id);
		});

		if (this.availableMasters.length > 1){
			for (j =0; j < this.availableMasters.length; ++j ){
				w = this.availableMasters[j].res.w;
				h = this.availableMasters[j].res.h;
				option = document.createElement('option');
				option.value = w+"x"+h;
				option.innerHTML = w+" x "+h;
				if ((w == this.currentMaster.res.w) && (h == this.currentMaster.res.h)){
					option.setAttribute('selected',true);
				}
				comboM.appendChild(option);
			}
			selectQuality.appendChild(labelM);
			selectQuality.appendChild(comboM);
		}

		var labelS = document.createElement('label');
		labelS.innerHTML = base.dictionary.translate("Slide");

		var comboS = document.createElement('select');
		comboS.id = 'slave';
		$(comboS).change(function() {
			var param1Q = $(comboS).val();
			thisClass.changeVideoStream(param1Q,comboS.id);
		});

		if (this.availableSlaves.length+1 > 1){
			for (j=0; j < this.availableSlaves.length; ++j ){
				w = this.availableSlaves[j].res.w;
				h = this.availableSlaves[j].res.h;
				option = document.createElement('option');
				option.value = w+"x"+h;
				option.innerHTML = w+" x "+h;
				if ((w == this.currentSlave.res.w) && (h == this.currentSlave.res.h)){
					option.setAttribute('selected',true);
				}
				comboS.appendChild(option);
			}
			selectQuality.appendChild(labelS);
			selectQuality.appendChild(comboS);
		}

		domElement.appendChild(selectQuality);
	},

	changeVideoStream:function(newRes,combo) {

		paella.player.reloadVideos(newRes, newRes);
		
	}
});


paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();
