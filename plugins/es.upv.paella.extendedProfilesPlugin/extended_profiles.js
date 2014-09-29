paella.plugins.ExtendedProfilesPlugin = Class.create(paella.ButtonPlugin,{
	buttonItems: null,
	extendedModes: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showExtendedProfilesButton"; },
	getIndex:function() { return 550; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.extendedProfilesPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Change page layout"); },
	checkEnabled:function(onSuccess) {onSuccess(paella.extended);},
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	buttons: [],
	selected_button: null,

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if(thisClass.isPopUpOpen()){
		    	if (event.keyCode == Keys.Up) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length)
				            thisClass.buttons[thisClass.selected_button].className = 'extendedProfilesItemButton '+thisClass.buttons[thisClass.selected_button].data.profileData;

					    thisClass.selected_button--;
					    thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
		           	}
	            }
	            else if (event.keyCode == Keys.Down) {
	            	if(thisClass.selected_button<thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0)
	            			thisClass.buttons[thisClass.selected_button].className = 'extendedProfilesItemButton '+thisClass.buttons[thisClass.selected_button].data.profileData;

	            		thisClass.selected_button++;
	               		thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	                thisClass.onItemClick(thisClass.buttons[thisClass.selected_button],thisClass.buttons[thisClass.selected_button].data.profile,thisClass.buttons[thisClass.selected_button].data.profileData);
	            }
        	}
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		extendedModes = ['fullScr','full','big','small'];
		extendedModes.forEach(function(mode) {
			if (mode != 'fullScr' || paella.player.checkFullScreenCapability()) {		
				var modeIdx = extendedModes.indexOf(mode);
				var buttonItem = thisClass.getProfileItemButton(modeIdx, mode);
				thisClass.buttonItems[modeIdx] = buttonItem;
				domElement.appendChild(buttonItem);
				thisClass.buttons.push(buttonItem);
			}
		});
		this.selected_button = thisClass.buttons.length;
	},

	getProfileItemButton:function(profile,profileData) {
		var elem = document.createElement('div');
		elem.className = 'extendedProfilesItemButton ' + profileData;
		elem.id = profile + '_button';
		elem.data = {
			profile:profile,
			profileData:profileData,
			plugin:this
		};
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(elem, this.data.profile, this.data.profileData);
		});
		return elem;
	},

	onItemClick:function(button, profile, profileData) {		
		if (profileData == "fullScr") {
			this.switchFullScreen(profile, profileData);
		} 
		else {
			if (paella.player.isFullScreen()) {
				paella.player.exitFullScreen();				
				this.buttonItems[0].className  = this.getButtonItemClass('fullScr', false);
			}

			this.buttonItems[extendedModes.indexOf(paella.extended.getProfile())].className = this.getButtonItemClass(paella.extended.getProfile(), false);
			this.buttonItems[profile].className = this.getButtonItemClass(profileData,true);
			paella.extended.setProfile(button.data.profileData);
		}
	    paella.events.trigger(paella.events.hidePopUp, {identifier:this.getName()});
	},

	getButtonItemClass:function(profileName,selected) {
		return 'extendedProfilesItemButton ' + profileName  + ((selected) ? ' selected':'');
	},

	switchFullScreen:function(profile,profileData){		
		if (paella.player.isFullScreen()) {
			paella.player.exitFullScreen();
		}
		else {
			paella.player.goFullScreen();
		}
	}
});


paella.plugins.extendedProfilesPlugin = new paella.plugins.ExtendedProfilesPlugin();
