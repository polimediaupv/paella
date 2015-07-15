Class ("paella.DrawPlayBackBarCanvas", paella.EventDrivenPlugin,{
	_color:null,
	_context:null,
	_canvas:null,
	_shape:null,
	_keys:null,
	_videoLength:null,

	getEvents:function() {
		return[
			paella.events.singleVideoReady,
		];
    },

    onEvent:function(event, params){
    	var self = this;
    	switch(event){
    		case paella.events.singleVideoReady: this.imageUpdate(event,params); break;
    	}
    },
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {
		var self = this;
		
		self._color = self.config.color || "#000000";
		self._shape = self.config.shape || "rect";
			
		var n = paella.initDelegate.initParams.videoLoader.frameList;
		self._keys = Object.keys(n);

		self._videoLength = paella.player.videoContainer.duration("");
	},

	init:function(){
		self._canvas = paella.player.controls.playbackControlInstance.playbackBarInstance.getCanvas();
		self._context = paella.player.controls.playbackControlInstance.playbackBarInstance.getCanvasContext();
	},

	drawSlideTime:function(){
		var self = this;
		self.init(); // initialize variables

		if(self._context){
			var parent = $("#playerContainer_controls_playback_playbackBar");
			self._keys.forEach(function(l){
				var time = (parseInt(l) * parent.width()) / self._videoLength; // conversion to canvas
				
				if(self._shape == "rect"){
					ctx.fillStyle = self._color;
					ctx.fillRect(time,0,1,parent.height());
				}
				
			});
		}
	},
	getName:function() { 
		return "es.upv.paella.drawPlayBackBarCanvas";
	}
});
paella.plugins.drawPlayBackBarCanvas = new paella.DrawPlayBackBarCanvas();