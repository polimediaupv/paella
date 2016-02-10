Class ("paella.plugins.BreaksPlayerPlugin",paella.EventDrivenPlugin,{
	breaks:null,
	lastEvent:0,
	visibleBreaks:null,

	getName:function() { return "es.upv.paella.breaksPlayerPlugin"; },
	checkEnabled:function(onSuccess) {
		var This = this;
		this.breaks = [];
		this.visibleBreaks = [];
		paella.data.read('breaks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
				This.breaks = data.breaks;
			}
			onSuccess(true);
		});
	},

	getEvents:function() { return [paella.events.timeUpdate]; },

	onEvent:function(eventType,params) {
		this.checkBreaks(params);
	},

	checkBreaks:function(params) {
		var a;
		for (var i=0; i<this.breaks.length; ++i) {
			a = this.breaks[i];

			if (a.s<params.currentTime && a.e>params.currentTime) {
                            if(this.areBreaksClickable())
                                this.avoidBreak(a);
                            else
                                this.showBreaks(a);
			} else if (a.s.toFixed(0) == params.currentTime.toFixed(0)){
				this.avoidBreak(a);
			}
		}
		if(!this.areBreaksClickable()) {
			for (var key in this.visibleBreaks) {
				if (typeof(a)=='object') {
					a = this.visibleBreaks[key];
					if (a && (a.s>=params.currentTime || a.e<=params.currentTime)) {
						this.removeBreak(a);
					}
				}
			}
		}
	},
	areBreaksClickable:function() {
            //Returns true if the config value is set and if we are not on the editor.
	    return this.config.neverShow && !(paella.editor.instance && paella.editor.instance.isLoaded);
	},
	showBreaks:function(br) {
		if (!this.visibleBreaks[br.s]) {
			var rect = {left:100,top:350,width:1080,height:20};
			br.elem = paella.player.videoContainer.overlayContainer.addText(br.content,rect);
			br.elem.className = 'textBreak';
			this.visibleBreaks[br.s] = br;
		}
	},

	removeBreak:function(br) {
		if (this.visibleBreaks[br.s]) {
			var elem = this.visibleBreaks[br.s].elem;
			paella.player.videoContainer.overlayContainer.removeElement(elem);
			this.visibleBreaks[br.s] = null;
		}
	},

	avoidBreak:function(br){
		var newTime = br.e + (this.config.neverShow?0.01:0);
		paella.player.videoContainer.seekToTime(newTime);
	}
});

paella.plugins.breaksPlayerPlugin = new paella.plugins.BreaksPlayerPlugin();
