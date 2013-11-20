////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Loader Publish Plugin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
paella.plugins.VideoLoadTestPlugin = Class.create(paella.EventDrivenPlugin,{
	startTime: 0,
	endTime: 0,

	initialize:function() {
		this.parent();
		this.startTime = Date.now();
		
        if (paella.utils.language()=='es') {
                var esDict = {
                        'Video loaded in {0} seconds':'Video cargado en {0} segundos',
                };
                paella.dictionary.addDictionary(esDict);
        }		
	},

		
	getName:function() { return 'es.upv.paella.test.videoLoadPlugin'; },
		
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},
		
	getEvents:function() {
		return [paella.events.loadComplete];
	},

	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.loadComplete:
				this.onLoadComplete();
				break;
		}
	},	
	
	onLoadComplete:function() {
		this.endTime = Date.now();
	
		var bench = (this.endTime - this.startTime)/1000.0;
		this.showOverlayMessage(paella.dictionary.translate("Video loaded in {0} seconds").replace(/\{0\}/g,bench));
	},	
	
		
	showOverlayMessage:function(message) {
		var overlayContainer = paella.player.videoContainer.overlayContainer;
		var rect = {left:40, top:50, width:1200, height:80};
		
		var root = document.createElement("div");
		root.className = 'videoLoadTestOverlay';
		var element = document.createElement("div");
		element.className = 'videoLoadTest';
		element.innerHTML = message;
		
		root.appendChild(element);
		
		overlayContainer.addElement(root, rect);	
	}
});

paella.plugins.videoLoadTestPlugin = new paella.plugins.VideoLoadTestPlugin();
