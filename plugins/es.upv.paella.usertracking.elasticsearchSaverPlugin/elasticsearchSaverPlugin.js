new (Class (paella.userTracking.SaverPlugIn, {
	type:'userTrackingSaverPlugIn',
	getName: function() {return "es.upv.paella.usertracking.elasticsearchSaverPlugin";},
	
	checkEnabled: function(onSuccess) {
		this._url = this.config.url;
		this._index = this.config.index || "paellaplayer";
		this._type = this.config.type || "usertracking";
		
		var enabled = true;
		if (this._url == undefined){
			enabled = false;
			base.log.debug("No ElasticSearch URL found in config file. Disabling ElasticSearch PlugIn");
		}
		
		onSuccess(enabled);
	},
	
	log: function(event, params) {	
		var p = params;
		if (typeof(p) != "object") {
			p = {value: p};
		}
		var log = {
			date: new Date(),
			video: paella.initDelegate.getId(),
			playing: !paella.player.videoContainer.paused(),
			time: parseInt(paella.player.videoContainer.currentTime() + paella.player.videoContainer.trimStart()),
			event: event,
			params: p
		};		
		
		paella.ajax.post({url:this._url+ "/"+ this._index + "/" + this._type + "/", params:JSON.stringify(log) });
	}
}))();