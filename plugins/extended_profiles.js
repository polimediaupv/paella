paella.plugins.ExtendedProfilesPlugin = Class.create(paella.ButtonPlugin,{
	buttonItems: null,
	extendedModes: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showExtendedProfilesButton"; },
	getIndex:function() { return 102; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.extendedProfilesPlugin"; },
	checkEnabled:function(onSuccess) { onSuccess(paella.extended); },
	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		extendedModes = ['full','big','small'];
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
			this.data.plugin.onItemClick(elem,this.data.profile, this.data.profileData);
		});
		return elem;
	},
	
	onItemClick:function(button,profile,profileData) {
	  this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),false);
	  this.buttonItems[profile].className = this.getButtonItemClass(profileData,true);
	  paella.extended.setProfile(button.data.profileData);
	  paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	},
	
	getButtonItemClass:function(profileName,selected) {
		return 'extendedProfilesItemButton ' + profileName  + ((selected) ? ' selected':'');
	}
	
});
  

paella.plugins.extendedProfilesPlugin = new paella.plugins.ExtendedProfilesPlugin();
