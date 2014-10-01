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
		var self = this;
		//TODO: REMOVE ON COMPOSITION CHANGE
		paella.events.bind(paella.events.setComposition, function(event,params) {
			self.compositionChanged(event,params);
		});

		//TODO: BIND TIMEUPDATEVENT
		
		paella.events.bind(paella.events.timeUpdate, function(event,params) { 
			self.imageUpdate(event,params);
		});
	},

	imageUpdate:function(event,params) {
		var self = this;
		var sec = Math.round(params.currentTime);
		//console.log("iempo:"+params.currentTime+" REDONDEADO: "+sec);
		
		if($('.newframe').length>0){
			
			image = Math.floor(sec / 30); //15 is the capture interval
			nimage = image*30;
			//console.log("numero imagen: "+image);
			image_name = ("000000"+nimage).slice(nimage.toString().length);
			//console.log("nombre imagen: "+image_name+".png");
			//TODO: check if is the same image for this time update
			var src = $("#photo_01")[0].src;
			var mi_src = "http://localhost:8000/player/resources/style/"+image_name+".png";
			//console.log(src + " - " + mi_src);
			//console.log(src == mi_src);
			if(src != mi_src){
			//set the image
			$( ".newframe" ).remove();
			self.createOverlay();
			$("#photo_01").attr('src',"resources/style/"+image_name+".png");
			$("#photo_01").elevateZoom({ zoomType	: "inner", cursor: "crosshair", scrollZoom : true });
			}
			
		}
		
		
	},

	createOverlay:function(){
		var self = this;
		var newframe = document.createElement("div");
			newframe.className = "newframe";
			newframe.setAttribute('style', 'display: table;');
			// IMAGE
			/*var img = new Image();
			img.className
			img.addEventListener("load",function(event) {

			})
			img.src = "";
*/
			var hiResImage = document.createElement('img');
   			hiResImage.className = 'frameHiRes';
   			// GET IMAGE FOR TIMELINE

       		//hiResImage.setAttribute('src',"resources/style/000000.png");
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
			//$("#photo_01").elevateZoom({ zoomType	: "inner", cursor: "crosshair", scrollZoom : true });

			// OPEN NEW WINDOW WITH FULLSCREEN IMAGE
			$(".newframe").click(function(e){
			window.open('resources/style/image.png');
			});
	},

	action:function(button) {
		var self = this;
		if($('.newframe').length<1){
			//CREATE OVERLAY
			self.createOverlay();
		}
		else { // IF EXISTS REMOVE ON CLICK
			$( ".newframe" ).remove();
		}

	},

	compositionChanged:function(event,params){
		var self = this;
		if($('.newframe').length>0){
			$( ".newframe" ).remove();// REMOVE PLUGIN
			self.createOverlay();//CALL AGAIN
		}
	},


		getName:function() { 
		return "es.upv.paella.ZoomPlugin";
	}
});

paella.plugins.zoomPlugin = new paella.ZoomPlugin();
