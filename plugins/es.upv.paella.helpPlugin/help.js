Class ("paella.plugins.HelpPlugin",paella.ButtonPlugin, {

	getIndex:function() { return 509; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "helpButton"; },
	getName:function() { return "es.upv.paella.helpPlugin"; },
	getMinWindowSize:function() { return 650; },

	getDefaultToolTip:function() { return base.dictionary.translate("Show help") + ' (' + base.dictionary.translate("Paella version:") + ' ' + paella.version + ')'; },


	checkEnabled:function(onSuccess) { 
		var availableLangs = (this.config && this.config.langs) || [];
		onSuccess(availableLangs.length>0); 
	},

	action:function(button) {
		var mylang = base.dictionary.currentLanguage();
		
		var availableLangs = (this.config && this.config.langs) || [];
		var idx = availableLangs.indexOf(mylang);
		if (idx < 0) { idx = 0; }
						
		//paella.messageBox.showFrame("http://paellaplayer.upv.es/?page=usage");
		paella.messageBox.showFrame("resources/style/help/help_" + availableLangs[idx] + ".html");
	}
	
});

paella.plugins.helpPlugin = new paella.plugins.HelpPlugin();
