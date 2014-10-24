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
		var self = this;
		//RELOAD EVENT
		paella.events.bind(paella.events.singleVideoReady,function(event,params) {
			self.setQualityLabel();
		});

		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Presenter':'Presentador',
				'Slide':'Diapositiva'
			};
			base.dictionary.addDictionary(esDict);
		}
		this.setQualityLabel();
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
		var w, h,d,e,b=0;
		var percen1, percen2, reso2, act_percen;
		percen1=100/this.availableMasters.length;
		percen2=100/this.availableSlaves.length;
		if(this.availableMasters.length >= this.availableSlaves.length){
			act_percen= percen2;
			for(var i=0;i<this.availableMasters.length;i++){
				w = this.availableMasters[i].res.w;
				h = this.availableMasters[i].res.h;
				if(this.availableSlaves.length > 0){
					if(percen1 * (i+1) < act_percen){
						d = this.availableSlaves[b].res.w;
						e = this.availableSlaves[b].res.h;
						reso2 = d+"x"+e;
					}else{
						act_percen = percen2 + act_percen;
						d = this.availableSlaves[b].res.w;
						e = this.availableSlaves[b].res.h;
						reso2 = d+"x"+e;
						b++;
					}
				}
				domElement.appendChild(this.getItemButton(w+"x"+h,w+"x"+h, reso2));
			}
		}
		else{
			act_percen= percen1;
			for(var z=0;z<this.availableSlaves.length;z++){
				w = this.availableSlaves[z].res.w;
				h = this.availableSlaves[z].res.h;
				if(this.availableMasters.length > 0){
					if(percen2 * (z+1) < act_percen){
						d = this.availableMasters[b].res.w;
						e = this.availableMasters[b].res.h;
						reso2 = d+"x"+e;
					}else{
						act_percen = percen1 + act_percen;
						d = this.availableMasters[b].res.w;
						e = this.availableMasters[b].res.h;
						reso2 = d+"x"+e;
						b++;
					}
				}
				domElement.appendChild(this.getItemButton(w+"x"+h,w+"x"+h, reso2));
			}
		}
	},

	getItemButton:function(label,reso, reso2) {
		var elem = document.createElement('div');
		elem.className = this.getButtonItemClass(label,false);
		elem.id = label + '_button';
		elem.innerHTML = label;
		elem.data = {
			label:label,
			reso:reso,
			reso2:reso2,
			plugin:this
		};
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this,this.data.label,this.data.reso,this.data.reso2);
		});
		return elem;
	},

	onItemClick:function(button,label,reso, reso2) {
		//paella.player.videoContainer.setPlaybackRate(rate);
		//paella.player.reloadVideos(rate, rate);
		//this.setText(label);
		paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
		paella.player.reloadVideos(reso, reso2);

		this.setQualityLabel();
	},
	
	setQualityLabel:function() {
		var res = paella.player.videoContainer.currentMasterVideoData.res;
		this.setText(res.h + "p");
	},

	getButtonItemClass:function(profileName,selected) {
		return 'playbackRateItem ' + profileName  + ((selected) ? ' selected':'');
	},/*
	buildContent:function(domElement) {
		var j,w,h,option;
		var thisClass = this;
		//this.currentUrl = window.location;

		var selectQuality = document.createElement('div');
		selectQuality.className = 'selectQuality';

		var labelM = document.createElement('label');
		//labelM.innerHTML = base.dictionary.translate("Presenter");
		

		var comboM = document.createElement('select');
		comboM.setAttribute("size", '3');
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
		
	}*/
});


paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();


		
