Class ("paella.plugins.CaptionsOnScreen",paella.EventDrivenPlugin,{
	containerId:'paella_plugin_CaptionsOnScreen',
	container:null,

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {
		var thisClass = this;
		thisClass.container = document.createElement('div');
		thisClass.container.className = "CaptionsOnScreen";
		thisClass.container.id = thisClass.containerId;
		

		var t = $('#playerContainer_videoContainer_container').offset().top;
		var h = $('#playerContainer_videoContainer_container').height();
		thisClass.container.style.top = (t+h+5)+"px";
		paella.player.videoContainer.domElement.appendChild(thisClass.container);
	},

	getEvents:function() {
		return [paella.events.controlBarWillHide];
	},

	onEvent:function(eventType,params) {
		var thisClass = this;
		switch (eventType) {
			case paella.events.controlBarWillHide:
				thisClass.moveCaptionsOverlay();
				break;
		}
	},

	moveCaptionsOverlay:function(){
		var t = $('#playerContainer_controls_playback').offset().top;
		var h = $('#playerContainer_controls_playback').height();
		thisClass.container.style.top = (t+h+5)+"px";
	},

	getIndex:function() {
		return 1050;
	},

	getName:function() {
		return "es.upv.paella.captionsPlugin";
	}
});

new paella.plugins.CaptionsOnScreen();