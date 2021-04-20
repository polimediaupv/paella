paella.addPlugin(function() {
	return class ElasticsearchSaverPlugin extends paella.userTracking.SaverPlugIn {
		getName() { return "es.upv.paella.usertracking.elasticsearchSaverPlugin"; }
		
		checkEnabled(onSuccess) {
			this._url = this.config.url;
			this._index = this.config.index || "paellaplayer";
			this._type = this.config.type || "usertracking";
			
			var enabled = true;
			if (this._url == undefined){
				enabled = false;
				paella.log.debug("No ElasticSearch URL found in config file. Disabling ElasticSearch PlugIn");
			}
			
			onSuccess(enabled);
		}
		
		log(event, params) {	
			var p = params;
			if (typeof(p) != "object") {
				p = {value: p};
			}
			
			let currentTime = 0;
			paella.player.videoContainer.currentTime()
				.then((t) => {
					currentTime = t;
					return paella.player.videoContainer.paused();
				})
				.then((paused) => {
					var log = {
						date: new Date(),
						video: paella.initDelegate.getId(),
						playing: !paused,
						time: parseInt(currentTime + paella.player.videoContainer.trimStart()),
						event: event,
						params: p
					};		
					
					paella.utils.ajax.post({url:this._url+ "/"+ this._index + "/" + this._type + "/", params:JSON.stringify(log) });
				});
		}
	}
});