Class ("paella.plugins.CaptionsOnScreen",paella.EventDrivenPlugin,{
	containerId:'paella_plugin_CaptionsOnScreen',
	container:null,
	innerContainer:null,
	top:null,
	actualPos:null,
	lastEvent:null,
	controlsPlayback:null,
	captions:false,
	captionProvider:null,

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.isLiveStream());
	},

	setup:function() {

	
	},

	getEvents:function() {
		return [paella.events.controlBarWillHide, paella.events.controlBarDidShow, paella.events.captionsEnabled, paella.events.captionsDisabled ,paella.events.timeUpdate];
	},

	onEvent:function(eventType,params) {
		var thisClass = this;


		switch (eventType) {
			case paella.events.controlBarWillHide:
				if(thisClass.lastEvent == eventType || thisClass.captions==false)break;
				thisClass.moveCaptionsOverlay("down");
				break;
			case paella.events.controlBarDidShow:
				if(thisClass.lastEvent == eventType || thisClass.captions==false)break;
				thisClass.moveCaptionsOverlay("top");
				break;
			case paella.events.captionsEnabled:
				thisClass.buildContent(params);
				thisClass.captions = true;
				break;
			case paella.events.captionsDisabled:
				thisClass.hideContent();
				thisClass.captions = false;
				break;
			case paella.events.timeUpdate:
				if(thisClass.captions){ thisClass.updateCaptions(params); }
				break;

		}
		thisClass.lastEvent = eventType; 
	},

	buildContent:function(provider){
		var thisClass = this;
		thisClass.captionProvider = provider;

		if(thisClass.container==null){ // PARENT
			thisClass.container = document.createElement('div');
			thisClass.container.className = "CaptionsOnScreen";
			thisClass.container.id = thisClass.containerId;

			thisClass.innerContainer = document.createElement('div');
			thisClass.innerContainer.className = "CaptionsOnScreenInner";

			thisClass.container.appendChild(thisClass.innerContainer);			

			if(thisClass.controlsPlayback==null) thisClass.controlsPlayback = $('#playerContainer_controls_playback');


			paella.player.videoContainer.domElement.appendChild(thisClass.container);
		}
		else {
			$(thisClass.container).show();
		}

	},

	updateCaptions:function(time){
		var thisClass = this;

		if(thisClass.captions){
			var c = paella.captions.getActiveCaptions();
			var caption = c.getCaptionAtTime(time.currentTime);
			if(caption){
				$(thisClass.container).show();
				thisClass.innerContainer.innerHTML = caption.content;
			}
			else { 
				thisClass.innerContainer.innerHTML = ""; 
			}
		}
	},
	
	hideContent:function(){
		var thisClass = this;

		$(thisClass.container).hide();
	},
 
	moveCaptionsOverlay:function(pos){
		var thisClass = this;

		if(thisClass.controlsPlayback==null) thisClass.controlsPlayback = $('#playerContainer_controls_playback');
		
		if(pos=="down"){
			var t = thisClass.controlsPlayback.offset().top;
			setTimeout(function(){
			thisClass.innerContainer.style.bottom = (0-t)+"px";
		}, 1000);
			
		}
		if(pos=="top") {
			var t2 = thisClass.controlsPlayback.offset().top;
			t2 -= thisClass.innerContainer.offsetHeight+10;
			thisClass.innerContainer.style.bottom = (0-t2)+"px";
		}
	},

	getIndex:function() {
		return 1050;
	},

	getName:function() {
		return "es.upv.paella.captionsPlugin";
	}
});

new paella.plugins.CaptionsOnScreen();