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
		extendedModes = ['fullScr','full','big','small'];
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
		if (profileData == "fullScr") {
			//paella.extended.setProfile('full');
			this.switchFullScreen(profile,profileData);
		} else {
			if (this.isFullscreen()) {
				if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
				else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				}
				else if (document.cancelFullScreen) {
					document.cancelFullScreen();
				}
				this.buttonItems[0].className  = this.getButtonItemClass('fullScr',false);
			}
			
			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),false);
			this.buttonItems[profile].className = this.getButtonItemClass(profileData,true);
			paella.extended.setProfile(button.data.profileData);
	  }
	    paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	},
	
	getButtonItemClass:function(profileName,selected) {
		return 'extendedProfilesItemButton ' + profileName  + ((selected) ? ' selected':'');
	},
	
	switchFullScreen:function(profile,profileData){
		var fs = document.getElementById(paella.player.mainContainer.id);
		fs.style.width = '100%';
		fs.style.height = '100%';
		if (this.isFullscreen()) {
			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),true);
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,false);
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
				this.buttonItems[profile].className = this.getButtonItemClass(profileData,false);
			}
			else if (document.cancelFullScreen) {
				document.cancelFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,false);
			}
		}
		else {
			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(),false);
			if (fs.webkitRequestFullScreen) {
				fs.webkitRequestFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,true);
				
			}
			else if (fs.mozRequestFullScreen){
				fs.mozRequestFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,true);
			}
			else if (fs.requestFullScreen()) {
				fs.requestFullScreen();
				this.buttonItems[profile].className  = this.getButtonItemClass(profileData,true);
			  
			}
			else {
				alert('Your browser does not support fullscreen mode');
			}
		}
	},
	
	isFullscreen:function() {
		if (document.webkitIsFullScreen!=undefined) {
			return document.webkitIsFullScreen;
		}
		else if (document.mozFullScreen!=undefined) {
			return document.mozFullScreen;
		}
		return false;
	}
	
});
  

paella.plugins.extendedProfilesPlugin = new paella.plugins.ExtendedProfilesPlugin();
