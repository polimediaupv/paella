paella.plugins.TrimmingTrackPlugin = Class.create(paella.editor.MainTrackPlugin,{
	trimmingTrack:null,
	trimmingData:{s:0,e:0},

	getTrackItems:function() {
		if (this.trimmingTrack==null) {
			this.trimmingTrack = {id:1,s:0,e:0};
			this.trimmingTrack.s = paella.player.videoContainer.trimStart();
			this.trimmingTrack.e = paella.player.videoContainer.trimEnd();
			this.trimmingData.s = this.trimmingTrack.s;
			this.trimmingData.e = this.trimmingTrack.e;
		}		
		var tracks = [];
		tracks.push(this.trimmingTrack);
		return tracks;
	},
		
	getName:function() { return "es.upv.paella.editor.trimmingTrackPlugin"; },

	getTools:function() {
		if(this.config.enableResetButton) {
			return [
				{name:'reset', label:base.dictionary.translate('Reset'), hint:base.dictionary.translate('Resets the trimming bar to the default length of the video.')}
			];
		}
	},

	onToolSelected:function(toolName) {
		if(this.config.enableResetButton) {
		    if(toolName=='reset') {
			this.trimmingTrack = {id:1,s:0,e:0};
			this.trimmingTrack.s = 0;
			this.trimmingTrack.e = paella.player.videoContainer.duration(true);
			return true;
			}
		}
	},

	getTrackName:function() {
		return base.dictionary.translate("Trimming");
	},
	
	getColor:function() {
		return 'rgb(0, 51, 107)';
	},
	
	//checkEnabled:function(isEnabled) {
	//	isEnabled(paella.plugins.trimmingLoaderPlugin.config.enabled);
		//isEnabled(paella.player.config.trimming && paella.player.config.trimming.enabled);
		//},
	
	onSave:function(onDone) {
		paella.player.videoContainer.enableTrimming();
		paella.player.videoContainer.setTrimmingStart(this.trimmingTrack.s);
		paella.player.videoContainer.setTrimmingEnd(this.trimmingTrack.e);

		this.trimmingData.s = this.trimmingTrack.s;
		this.trimmingData.e = this.trimmingTrack.e;
		
		paella.data.write('trimming',{id:paella.initDelegate.getId()},{start:this.trimmingTrack.s,end:this.trimmingTrack.e},function(data,status) {
			onDone(status);
		});
	},
	
	onDiscard:function(onDone) {
		this.trimmingTrack.s = this.trimmingData.s;
		this.trimmingTrack.e = this.trimmingData.e;
		onDone(true);
	},
	
	allowDrag:function() {
		return false;
	},
	
	onTrackChanged:function(id,start,end) {
		//Checks if the trimming is valid (start >= 0 and end <= duration_of_the_video)
		playerEnd = paella.player.videoContainer.duration(true);
		start = (start < 0)? 0 : start;
		end = (end > playerEnd)? playerEnd : end;
		this.trimmingTrack.s = start;
		this.trimmingTrack.e = end;
		this.parent(id,start,end);
	},

	contextHelpString:function() {
		// TODO: Implement this using the standard base.dictionary class
		if (base.dictionary.currentLanguage()=="es") {
			return "Utiliza la herramienta de recorte para definir el instante inicial y el instante final de la clase. Para cambiar la duración solo hay que arrastrar el inicio o el final de la pista \"Recorte\", en la linea de tiempo.";
		}
		else {
			return "Use this tool to define the start and finish time.";
		}
	}
});

paella.plugins.trimmingTrackPlugin = new paella.plugins.TrimmingTrackPlugin();

