Class ("paella.ZoomPlugin", paella.VideoOverlayButtonPlugin,{
	
	getIndex:function(){return 20;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "zoomButton"; },

	getDefaultToolTip:function() { return base.dictionary.translate("Zoom");},

	chechEnabled:function(onSuccess) {
		// TODO: check if the image to zoom is loaded
		return true;

	},

	action:function(button) {
	},

		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
