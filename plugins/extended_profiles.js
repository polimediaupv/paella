paella.plugins.ExtendedProfilesPlugin = Class.create(paella.ButtonPlugin,{
	buttonItems: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showExtendedProfilesButton"; },
	getIndex:function() { return 102; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.extendedProfilesPlugin"; },
	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		
		var extendedModes = ["Full","Big","Small"];
		for (var mode in extendedModes){
		  var modeData = extendedModes[mode];
		  var buttonItem = thisClass.getProfileItemButton(mode,modeData);
		  thisClass.buttonItems[mode] = buttonItem;
		  domElement.appendChild(buttonItem);
		}
	},
	
	getProfileItemButton:function(profile,profileData) {
		var elem = document.createElement('div');
		elem.className = 'extendedProfilesItemButton ' + profileData
		elem.id = profile + '_button';
		elem.data = {
			profile:profile,
			profileData:profileData,
			plugin:this
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(elem,this.data.profile);
		});
		return elem;
	},
	
	onItemClick:function(button,profile) {
		if (profile == 0){
			this.buttonItems[1].className = 'extendedProfilesItemButton Big';
			this.buttonItems[2].className = 'extendedProfilesItemButton Small';
			paella.extended.setProfile('full');
			button.className += ' selected';
			/*añadir un selected*/
		}else if (profile == 1){
			this.buttonItems[0].className = 'extendedProfilesItemButton Full';
			this.buttonItems[2].className = 'extendedProfilesItemButton Small';
			button.className += ' selected';
			paella.extended.setProfile('big');
		
		}else {
			this.buttonItems[0].className = 'extendedProfilesItemButton Full';
			this.buttonItems[1].className = 'extendedProfilesItemButton Big';
			button.className += ' selected';
			paella.extended.setProfile('small');
		}
		paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	}
	
});
  

paella.plugins.extendedProfilesPlugin = new paella.plugins.ExtendedProfilesPlugin();
