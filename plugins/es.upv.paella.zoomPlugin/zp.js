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

	setup:function() {
		console.log("FUNCION SETUP");
		var This = this;
		$(function() {
			$('#playerContainer_videoContainer_1').hover(function(e){
				This.mouseMove(e);
			});
		});
	},

	mousemove:function(event) {
		var pos = $(this).offset();
			var posX = (e.pageX - pos.left);
			var posY = (e.pageY - pos.top);

			console.log("X: "+posX+" Y: "+posY);
	},

	action:function(button) {

		console.log("FUNCION CLICK");
		// VIDEO MASTER CONTAINER ID=playerContainer_videoContainer_1

		// ACTIVE THE PLUGIN

		// CHECK THE MOUSE CORDS


	},

		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
