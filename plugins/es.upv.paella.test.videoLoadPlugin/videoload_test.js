////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Loader Publish Plugin
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
paella.addPlugin(function() {
	return class VideoLoadTestPlugin extends paella.EventDrivenPlugin {
		getName() { return 'es.upv.paella.test.videoLoadPlugin'; }
	
		checkEnabled(onSuccess) {
			this.startTime = 0;
			this.endTime = 0;
			this.startTime = Date.now();
	
			if (base.dictionary.currentLanguage()=='es') {
					var esDict = {
							'Video loaded in {0} seconds':'Video cargado en {0} segundos',
					};
					base.dictionary.addDictionary(esDict);
			}
			onSuccess(true);
		}
	
		getEvents() {
			return [paella.events.loadComplete];
		}
	
		onEvent(eventType,params) {
			switch (eventType) {
				case paella.events.loadComplete:
					this.onLoadComplete();
					break;
			}
		}
	
		onLoadComplete() {
			this.endTime = Date.now();
	
			var bench = (this.endTime - this.startTime)/1000.0;
			this.showOverlayMessage(base.dictionary.translate("Video loaded in {0} seconds").replace(/\{0\}/g,bench));
		}
	
	
		showOverlayMessage(message) {
			var overlayContainer = paella.player.videoContainer.overlayContainer;
			var rect = {left:40, top:50, width:/*1200*/430, height:80};
	
			var root = document.createElement("div");
			root.className = 'videoLoadTestOverlay';
	
			var button = document.createElement("div");
			button.className ="btn";
			button.innerHTML = "X";
			button.onclick = function(){overlayContainer.removeElement(root);};
	
			var element = document.createElement("div");
			element.className = 'videoLoadTest';
			element.innerHTML = escape(message);
	
			element.appendChild(button);
			root.appendChild(element);
	
			overlayContainer.addElement(root, rect);
		}
	}
});
