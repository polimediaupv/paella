paella.addPlugin(function() {
	return class CaptionsOnScreen extends paella.EventDrivenPlugin {
		
		checkEnabled(onSuccess) {
			this.containerId = 'paella_plugin_CaptionsOnScreen';
			this.container = null;
			this.innerContainer = null;
			this.top = null;
			this.actualPos = null;
			this.lastEvent = null;
			this.controlsPlayback = null;
			this.captions = false;
			this.captionProvider = null;
			onSuccess(!paella.player.isLiveStream());
		}

		setup() {
		}

		getEvents() {
			return [paella.events.controlBarDidHide, paella.events.resize, paella.events.controlBarDidShow, paella.events.captionsEnabled, paella.events.captionsDisabled ,paella.events.timeUpdate];
		}

		onEvent(eventType,params) {
			var thisClass = this;

			switch (eventType) {
				case paella.events.controlBarDidHide:
					if(thisClass.lastEvent == eventType || thisClass.captions==false)break;
					thisClass.moveCaptionsOverlay("down");
					break;
				case paella.events.resize:
					if(thisClass.captions==false)break;
					if(paella.player.controls.isHidden()){
						thisClass.moveCaptionsOverlay("down");
					}
					else {
						thisClass.moveCaptionsOverlay("top");
					}
					break;

				case paella.events.controlBarDidShow:
					if(thisClass.lastEvent == eventType || thisClass.captions==false)break;
					thisClass.moveCaptionsOverlay("top");
					break;
				case paella.events.captionsEnabled:
					thisClass.buildContent(params);
					thisClass.captions = true;
					if(paella.player.controls.isHidden()){
						thisClass.moveCaptionsOverlay("down");
					}
					else {
						thisClass.moveCaptionsOverlay("top");
					}
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
		}

		buildContent(provider){
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
		}

		updateCaptions(time){
			if (this.captions) {
				paella.player.videoContainer.trimming()
					.then((trimming) => {
						let offset = trimming.enabled ? trimming.start : 0;
						var c = paella.captions.getActiveCaptions();
						var caption = c.getCaptionAtTime(time.currentTime + offset);
						if(caption){
							$(this.container).show();
							this.innerContainer.innerText = caption.content;
							this.moveCaptionsOverlay("auto");

						}
						else { 
							this.innerContainer.innerText = ""; 
							this.hideContent();
						}
					});
			}
		}
		
		hideContent(){
			var thisClass = this;

			$(thisClass.container).hide();
		}
	
		moveCaptionsOverlay(pos){
			var thisClass = this;
			var marginbottom = 10;

			if(thisClass.controlsPlayback==null) thisClass.controlsPlayback = $('#playerContainer_controls_playback');

			if(pos=="auto" || pos==undefined) {
				pos = paella.player.controls.isHidden() ? "down" : "top";
			}
			if(pos=="down"){
				var t = thisClass.container.offsetHeight;
				t -= thisClass.innerContainer.offsetHeight + marginbottom;
				thisClass.innerContainer.style.bottom = (0 - t) + "px";
			}
			if(pos=="top") {
				var t2 = thisClass.controlsPlayback.offset().top;
				t2 -= thisClass.innerContainer.offsetHeight + marginbottom;
				thisClass.innerContainer.style.bottom = (0-t2)+"px";
			}
		}

		getIndex() {
			return 1050;
		}

		getName() {
			return "es.upv.paella.overlayCaptionsPlugin";
		}
	}
});
