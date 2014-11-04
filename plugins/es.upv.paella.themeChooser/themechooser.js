Class ("paella.plugins.ThemeChooserPlugin", paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "themeChooserPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.themeChooserPlugin"; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Change theme"); },	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	checkEnabled:function(onSuccess) { 
		onSuccess(paella.player.config.skin.available); 
	},
	
	buildContent:function(domElement) {
		var This = this;
		paella.player.config.skin.available.forEach(function(item){
			var elem = document.createElement('div');
			elem.className = "themebutton";
			elem.innerHTML = item.replace('-',' ').replace('_',' ');
			$(elem).click(function(event) {
				paella.utils.skin.set(item);
				paella.events.trigger(paella.events.hidePopUp,{identifier:This.getName()});
			});
			
			domElement.appendChild(elem);			
		});
	}
});


paella.plugins.themeChooserPlugin = new paella.plugins.ThemeChooserPlugin();


		
