paella.addPlugin(function() {
	return class HelpPlugin extends paella.ButtonPlugin {

		getIndex() { return 509; }
		getAlignment() { return 'right'; }
		getSubclass() { return "helpButton"; }
		getIconClass() { return 'icon-help'; }
		getName() { return "es.upv.paella.helpPlugin"; }
		getMinWindowSize() { return 650; }

		getDefaultToolTip() { return base.dictionary.translate("Show help") + ' (' + base.dictionary.translate("Paella version:") + ' ' + paella.version + ')'; }


		checkEnabled(onSuccess) { 
			var availableLangs = (this.config && this.config.langs) || [];
			onSuccess(availableLangs.length>0); 
		}

		action(button) {
			var mylang = base.dictionary.currentLanguage();
			
			var availableLangs = (this.config && this.config.langs) || [];
			var idx = availableLangs.indexOf(mylang);
			if (idx < 0) { idx = 0; }
							
			//paella.messageBox.showFrame("http://paellaplayer.upv.es/?page=usage");
			let url = "resources/style/help/help_" + availableLangs[idx] + ".html";
			if (base.userAgent.browser.IsMobileVersion) {
				window.open(url);
			}
			else {
				paella.messageBox.showFrame(url);
			}
		}
		
	}
});