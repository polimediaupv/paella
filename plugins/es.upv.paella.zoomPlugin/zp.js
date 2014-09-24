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
			// FRAME
			var newframe = document.createElement("div");
			newframe.className = "newframe";
			newframe.setAttribute('style', 'display: table;');
			// IMAGE
			var hiResImage = document.createElement('img');
   			hiResImage.className = 'frameHiRes';
       		hiResImage.setAttribute('src',"http://us.cdn281.fansshare.com/photos/lamborghiniaventador/lamborghini-aventador-estatura-gxx-orange-1157912976.jpg");
        	hiResImage.setAttribute('style', 'width: 100%;');
        	hiResImage.id ='photo_01';
        	hiResImage.setAttribute("id", "photo_01");
        	$(newframe).append(hiResImage);
        	// OVERLAY
			overlayContainer = paella.player.videoContainer.overlayContainer;
			overlayContainer.addElement(newframe, overlayContainer.getMasterRect());
			$(".newframe").css("background-color","rgba(80,80,80,0.4)");
			$(".newframe img").css("opacity","0");
			// APPLY ZOOM
			$("#photo_01").elevateZoom({ zoomType	: "inner", cursor: "crosshair" });
		}
		else if ($('.newframe').is(':hidden')){
   				$('.newframe').show();
   				}
			else
   				$('.newframe').hide();

   		
	},

		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
