paella.addPlugin(function() {
	return class ShowEditorPlugin extends paella.VideoOverlayButtonPlugin {
		getName() {
			return "es.upv.paella.showEditorPlugin";
		}
		getSubclass() { return "showEditorButton"; }
		getIconClass() { return 'icon-pencil'; }
		getAlignment() { return 'right'; }
		getIndex() {return 10;}
		getDefaultToolTip() { return base.dictionary.translate("Enter editor mode"); }

		checkEnabled(onSuccess) {			
			if (this.config.editorUrl) {
				paella.initDelegate.initParams.accessControl.canWrite()
				.then((canWrite)=>{
					var enabled = (canWrite); // && !base.userAgent.browser.IsMobileVersion && !paella.player.isLiveStream());					
					onSuccess(enabled);
				});	
			}
			else {				
				onSuccess(false);
			}
		}

		action(button) {
			var editorUrl = this.config.editorUrl.replace("{id}", paella.player.videoIdentifier);
			window.location.href = editorUrl;
		}
	}
});

