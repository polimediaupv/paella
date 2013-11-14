paella.plugins.MultipleQualitiesPlugin = Class.create(paella.ButtonPlugin,{
	currentUrl:null,
	availableMasters:null,
	availableSlaves:null,
	variousQualities: true,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showMultipleQualitiesPlugin"; },
	getIndex:function() { return 105; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.multipleQualitiesPlugin"; },
	checkEnabled:function(onSuccess) {
		this.availableMasters = paella.player.videoContainer.masterVideoData.sources.mp4;
		this.availableSlaves = paella.player.videoContainer.slaveVideoData.sources.mp4;
		//onSuccess((this.availableMasters.length > 1) || (this.availableSlaves.length > 1)); 
		onSuccess(true);
	},
	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var thisClass = this;
		this.currentUrl = window.location;
		
		var currentMaster = paella.player.videoContainer.currentMasterVideoData;
		var currentSlave = paella.player.videoContainer.currentSlaveVideoData;
			
		var selectQuality = document.createElement('div');
		selectQuality.className = 'selectQuality';
		
		if (this.availableMasters.length +1 > 1){
			var comboM = document.createElement('select');
			comboM.id = 'master';
			$(comboM).change(function() {
				var quality = $(comboM).val();
				thisClass.changeVideoStream(quality,comboM.id);
			});
			
			var labelM = document.createElement('label');
			labelM.innerHTML = paella.dictionary.translate("Presenter");
			
			for (var i =0; i < this.availableMasters.length; ++i ){
				if ((this.availableMasters[i].type == currentMaster.type)){
					var w = this.availableMasters[i].res.w;
					var h = this.availableMasters[i].res.h
					var option = document.createElement('option');
					option.value = w+"x"+h;
					option.innerHTML = w+" x "+h;
					if ((this.availableMasters[i].res.w == currentMaster.res.w) 
					&& (this.availableMasters[i].res.h == currentMaster.res.h)){
						option.setAttribute('selected',true);
					}
					comboM.appendChild(option);
				}
			}
			option = document.createElement('option');
			option.value = '1x1';
			option.innerHTML = '1';
			comboM.appendChild(option);
			
			option = document.createElement('option');
			option.value = '2x2';
			option.innerHTML = '2';
			comboM.appendChild(option);
			
			selectQuality.appendChild(labelM);
			selectQuality.appendChild(comboM);
		}
		
		if (this.availableSlaves.length +1 > 1){
			var comboS = document.createElement('select');
			comboS.id = 'slave';
			$(comboS).change(function() {
				var quality = $(comboS).val();
				thisClass.changeVideoStream(quality,comboS.id);
			});
		
			var labelS = document.createElement('label');
			labelS.innerHTML = paella.dictionary.translate("Slide");
			for (var i =0; i < this.availableSlaves.length; ++i ){
				if ((this.availableMasters[i].type == currentMaster.type)){
					var w = this.availableSlaves[i].res.w;
					var h = this.availableSlaves[i].res.h
					var option = document.createElement('option');
					option.value = w+"x"+h;
					option.innerHTML = w+" x "+h;
					if ((this.availableMasters[i].res.w == currentMaster.res.w) 
					&& (this.availableMasters[i].res.h == currentMaster.res.h)){
						option.setAttribute('selected',true);
					}
					comboS.appendChild(option);
				}
			}
			
			option = document.createElement('option');
			option.value = '3x3';
			option.innerHTML = '3';
			comboS.appendChild(option);
			
			option = document.createElement('option');
			option.value = '4x4';
			option.innerHTML = '4';
			comboS.appendChild(option);
			
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
	
	constructNewUrl:function(jefe,quality,otro,otroRes) {
		var iniUrl = this.currentUrl.href.split("&");
		return iniUrl[0]+"&"+jefe+"="+quality+((otroRes) ? "&"+otro+"="+otroRes:'');
	}
});
  

paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();
