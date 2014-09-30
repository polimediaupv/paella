Class ("paella.ZoomPlugin", paella.VideoOverlayButtonPlugin,{

	getIndex:function(){return 20;},

	getAlignment:function(){
		return 'right';
	},
	getSubclass:function() { return "zoomButton"; },

	getDefaultToolTip:function() { return base.dictionary.translate("Zoom");},

	chechEnabled:function(onSuccess) {
		// TODO: CHECK IF THE VIDEO HAS HIRESIMAGES
		return true;

	},

	setup:function() {
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
       		hiResImage.setAttribute('src',"resources/style/image.png");
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
			$("#photo_01").elevateZoom({ zoomType	: "inner", cursor: "crosshair", scrollZoom : true });

			//TODO: ADAPT TO IMAGE_RES

			// OPEN NEW WINDOW WITH FULLSCREEN IMAGE
			$(".newframe").click(function(e){
			window.open('resources/style/image.png');
			});


			//TODO: REMOVE ON COMPOSITION CHANGE

			//TODO: CHANGE IMAGES ON TIMELINE
		}
		else { // IF EXISTS REMOVE ON CLICK
			$( ".newframe" ).remove();
			$( ".zoomContainer" ).remove();
		}

	},

		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
