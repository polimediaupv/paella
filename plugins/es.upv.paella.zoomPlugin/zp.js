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
		//WE TAKE THE COORDS
		var This = this;
		$('#playerContainer_videoContainer_1').mousemove(function(e){
			This.mouseMove(e);
		});
	},

	mouseMove:function(event) {
			console.log("X: "+event.pageX+" Y: "+event.pageY);
	},

	action:function(button) {
		if($('.newframe').length<1){
			var newframe = document.createElement("div");
			newframe.className = "newframe";
			newframe.setAttribute('style', 'display: table;');
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getMasterRect());
			$(".newframe").css("background-color","rgba(255,0,0,0.4)");
		}
		else if ($('.newframe').is(':hidden'))
   					$('.newframe').show();
			else
   				$('.newframe').hide();

		// CREATE THE NEW CONTAINER


		// ACTIVE THE PLUGIN

		// CHECK THE MOUSE CORDS


	},

		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
