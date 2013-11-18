paella.plugins.MultipleQualitiesPlugin = Class.create(paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showMultipleQualitiesPlugin"; },
	getIndex:function() { return 105; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.multipleQualitiesPlugin"; },
	checkEnabled:function(onSuccess) { onSuccess(this.checkStreams()); },
	setup:function() {
		if (paella.utils.language()=="es") {
			var esDict = {
				'Presenter':'Presentador',
				'Slide':'Diapositiva'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},
						      
	checkStreams:function(){
		this.currentMaster = paella.player.videoContainer.currentMasterVideoData;
		this.currentSlave = paella.player.videoContainer.currentSlaveVideoData;
		
		var allMasterSources = paella.player.videoContainer.masterVideoData.sources;
		var allSlaveSources = paella.player.videoContainer.slaveVideoData.sources;
		
		for (key in allMasterSources){
			for (var j =0; j < allMasterSources[key].length; ++j ){ 
				if ((allMasterSources[key][j].type == this.currentMaster.type)){
					this.availableMasters.push(allMasterSources[key][j]);
				}
			}
		}
		
		for (key in allSlaveSources){
			for (var j =0; j < allSlaveSources[key].length; ++j ){
				if ((allSlaveSources[key][j].type == this.currentSlave.type)){
					this.availableSlaves.push(allSlaveSources[key][j]);
				}
			}
		}
		
		return (this.availableMasters.length > 1 || this.availableSlaves.length > 1)
	},
	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var thisClass = this;
		this.currentUrl = window.location;
			
		var selectQuality = document.createElement('div');
		selectQuality.className = 'selectQuality';
		
		var labelM = document.createElement('label');
		labelM.innerHTML = paella.dictionary.translate("Presenter");
				
		var comboM = document.createElement('select');
		comboM.id = 'master';
		$(comboM).change(function() {
			var param1Q = $(comboM).val();
			thisClass.changeVideoStream(param1Q,comboM.id);
		});
			
		if (this.availableMasters.length > 1){
			for (var j =0; j < this.availableMasters.length; ++j ){
				var w = this.availableMasters[j].res.w;
				var h = this.availableMasters[j].res.h
				var option = document.createElement('option');
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
		labelS.innerHTML = paella.dictionary.translate("Slide");
		
		var comboS = document.createElement('select');
		comboS.id = 'slave';
		$(comboS).change(function() {
			var param1Q = $(comboS).val();
			thisClass.changeVideoStream(param1Q,comboS.id);
		});
			
		if (this.availableSlaves.length > 1){
			for (var j =0; j < this.availableSlaves.length; ++j ){
				var w = this.availableSlaves[j].res.w;
				var h = this.availableSlaves[j].res.h
				var option = document.createElement('option');
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
		var newUrl;
		var resM = paella.utils.parameters.get("resmaster");
		var resS = paella.utils.parameters.get("resslave");
		
		if (combo == "master"){
			if (resM)
				newUrl = this.constructNewUrl("resmaster",newRes,"resslave",resS);
			else 
				newUrl = this.currentUrl+"&resmaster="+newRes;
		} else { 
			if (resS)
				newUrl = this.constructNewUrl("resslave",newRes,"resmaster",resM);
			else
				newUrl = this.currentUrl+"&resslave="+newRes;
		}
		
		window.open (newUrl,'_self',false)
	},
	
	constructNewUrl:function(param1,param1Q,param2,param2Q) {
		var iniUrl = this.currentUrl.href.split("&");
		return iniUrl[0]+"&"+param1+"="+param1Q+((param2Q) ? "&"+param2+"="+param2Q:'');
	}
});
  

paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();
