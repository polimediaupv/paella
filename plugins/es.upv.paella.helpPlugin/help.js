paella.plugins.HelpPlugin = Class.create(paella.ButtonPlugin, {

	getIndex:function() { return 509; },
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "helpButton"; },
	getName:function() { return "es.upv.paella.helpPlugin"; },

	getDefaultToolTip:function() { return paella.dictionary.translate("Show help"); },


	checkEnabled:function(onSuccess) { 
		var availableLangs = (this.config && this.config.langs) || [];
		onSuccess(availableLangs.length>0); 
	},

	action:function(button) {
		var mylang = paella.utils.language();
		
		var availableLangs = (this.config && this.config.langs) || [];
		var idx = availableLangs.indexOf(mylang);
		if (idx < 0) { idx = 0; }
						
		//paella.messageBox.showFrame("http://paellaplayer.upv.es/?page=usage");
		paella.messageBox.showFrame("resources/plugins/help/help_" + availableLangs[idx] + ".html");
	}
	
});

paella.plugins.helpPlugin = new paella.plugins.HelpPlugin();
