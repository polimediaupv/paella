Class ("paella.plugins.ThemeChooserPlugin", paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "themeChooserPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 600; },
	getName:function() { return "es.upv.paella.themeChooserPlugin"; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Change theme"); },	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	checkEnabled:function(onSuccess) { 
		if ( paella.player.config.skin && paella.player.config.skin.available
			&& (paella.player.config.skin.available instanceof Array) 
			&& (paella.player.config.skin.available.length >0)) {
			
			onSuccess(true);			
		}
		else {
			onSuccess(false);
		}
	},
	
	buildContent:function(domElement) {
		var This = this;
		paella.player.config.skin.available.forEach(function(item){
			var elem = document.createElement('div');
			elem.className = "themebutton";
			elem.innerHTML = item.replace('-',' ').replace('_',' ');
			$(elem).click(function(event) {
				paella.utils.skin.set(item);
				paella.player.controls.hidePopUp(This.getName());
			});
			
			domElement.appendChild(elem);			
		});
	}
});


paella.plugins.themeChooserPlugin = new paella.plugins.ThemeChooserPlugin();


		
