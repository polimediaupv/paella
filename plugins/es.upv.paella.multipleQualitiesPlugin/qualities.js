Class ("paella.plugins.MultipleQualitiesPlugin",paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	showWidthRes:null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showMultipleQualitiesPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 550; },
	getName:function() { return "es.upv.paella.multipleQualitiesPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Change video quality"); },
		
	checkEnabled:function(onSuccess) { 	
		var key, j;
		this.currentMaster = paella.player.videoContainer.currentMasterVideoData;
		this.currentSlave = paella.player.videoContainer.currentSlaveVideoData;

		var minVerticalRes = parseInt(this.config.minVerticalRes);
		var maxVerticalRes = parseInt(this.config.maxVerticalRes);

		// Search for the resolutions
		var allMasterSources = paella.player.videoContainer.masterVideoData.sources;
		
		for (key in allMasterSources){
			for (j =0; j < allMasterSources[key].length; ++j ){
				if ((allMasterSources[key][j].type == this.currentMaster.type)){
					if ( (isNaN(minVerticalRes)==false) && (parseInt(allMasterSources[key][j].res.h) < minVerticalRes) ) {
						continue;
					}
					if ( (isNaN(maxVerticalRes)==false) && (parseInt(allMasterSources[key][j].res.h) > maxVerticalRes) ) {
						continue;
					}
					this.availableMasters.push(allMasterSources[key][j]);
				}
			}
		}
		if (this.currentSlave){
			var allSlaveSources = paella.player.videoContainer.slaveVideoData.sources;
			for (key in allSlaveSources){
				for (j =0; j < allSlaveSources[key].length; ++j ){
					if ((allSlaveSources[key][j].type == this.currentSlave.type)){
						if ( (isNaN(minVerticalRes)==false) && (parseInt(allSlaveSources[key][j].res.h) < minVerticalRes) ) {
							continue;
						}
						if ( (isNaN(maxVerticalRes)==false) && (parseInt(allSlaveSources[key][j].res.h) > maxVerticalRes) ) {
							continue;
						}
						this.availableSlaves.push(allSlaveSources[key][j]);
					}
				}
			}
		}
		
		// Sort the available resolutions
		function sortfunc(a,b){
			var ia = parseInt(a.res.h);
			var ib = parseInt(b.res.h);
			
			return ((ia < ib) ? -1 : ((ia > ib) ? 1 : 0));
		}
		this.availableMasters.sort(sortfunc);
		this.availableSlaves.sort(sortfunc);		
		
		var isenabled = (this.availableMasters.length > 1 || this.availableSlaves.length > 1);
		onSuccess(isenabled);
	},		
		
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

		//config
		self.showWidthRes = (self.config.showWidthRes !== undefined) ? self.config.showWidthRes : true;
	},
	

	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var self = this;
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
				if(self.showWidthRes)
					domElement.appendChild(this.getItemButton(w+"x"+h,w+"x"+h, reso2));
				else
					domElement.appendChild(this.getItemButton(h+"p",w+"x"+h, reso2));
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
				if(self.showWidthRes)
					domElement.appendChild(this.getItemButton(w+"x"+h,w+"x"+h, reso2));
				else
					domElement.appendChild(this.getItemButton(h+"p",w+"x"+h, reso2));
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
	}
});


paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();


		
