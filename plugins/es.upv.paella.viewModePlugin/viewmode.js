Class ("paella.plugins.ViewModePlugin",paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,
	active_profiles: null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showViewModeButton"; },
	getIndex:function() { return 540; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.viewModePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Change video layout"); },		
	checkEnabled:function(onSuccess) {
		this.active_profiles = this.config.activeProfiles;
		onSuccess(!paella.player.videoContainer.isMonostream);
	},

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
        	if (thisClass.isPopUpOpen()){
		    	if (event.keyCode == Keys.Up) {
		           if(thisClass.selected_button>0){
			            if(thisClass.selected_button<thisClass.buttons.length)
				            thisClass.buttons[thisClass.selected_button].className = 'viewModeItemButton '+thisClass.buttons[thisClass.selected_button].data.profile;

					    thisClass.selected_button--;
					    thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
		           	}
	            }
	            else if (event.keyCode == Keys.Down) {
	            	if( thisClass.selected_button < thisClass.buttons.length-1){
	            		if(thisClass.selected_button>=0)
	            			thisClass.buttons[thisClass.selected_button].className = 'viewModeItemButton '+thisClass.buttons[thisClass.selected_button].data.profile;

	            		thisClass.selected_button++;
	               		thisClass.buttons[thisClass.selected_button].className = thisClass.buttons[thisClass.selected_button].className+' selected';
	            	}
	            }
	            else if (event.keyCode == Keys.Return) {
	                thisClass.onItemClick(thisClass.buttons[thisClass.selected_button],thisClass.buttons[thisClass.selected_button].data.profile,thisClass.buttons[thisClass.selected_button].data.profile);
	            }
        	}
        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		paella.Profiles.loadProfileList(function(profiles) {
			Object.keys(profiles).forEach(function(profile) {
				if (profiles[profile].hidden) return;
				if (thisClass.active_profiles) {
					var active = false;
					thisClass.active_profiles.forEach(function(ap) {
						if (ap == profile) {active = true;}
					});
					if (active == false) {
						return;
					}
				}
				
				
				// START - BLACKBOARD DEPENDENCY
				var n = paella.player.videoContainer.sourceData[0].sources;
				if(profile=="s_p_blackboard2" && n.hasOwnProperty("image")==false) { return; }
				// END - BLACKBOARD DEPENDENCY
				var profileData = profiles[profile];
				var buttonItem = thisClass.getProfileItemButton(profile, profileData);
				thisClass.buttonItems[profile] = buttonItem;
				domElement.appendChild(buttonItem);
				thisClass.buttons.push(buttonItem);
				if(paella.player.selectedProfile == profile){
					thisClass.buttonItems[profile].className = thisClass.getButtonItemClass(profile, true);
				}
			});
			thisClass.selected_button = thisClass.buttons.length;
		});
	},

	getProfileItemButton:function(profile,profileData) {
		var elem = document.createElement('div');
		elem.className = this.getButtonItemClass(profile,false);
		elem.id = profile + '_button';
		elem.data = {
			profile:profile,
			profileData:profileData,
			plugin:this
		};
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this,this.data.profile,this.data.profileData);
		});
		return elem;
	},

	onItemClick:function(button,profile,profileData) {
		var thisClass = this;
		var ButtonItem = this.buttonItems[profile];
		
		n = this.buttonItems;
		arr = Object.keys(n);
		arr.forEach(function(i){
			thisClass.buttonItems[i].className = thisClass.getButtonItemClass(i,false);
		});

		if (ButtonItem) {
			ButtonItem.className = thisClass.getButtonItemClass(profile,true);
			paella.player.setProfile(profile);
		}
		paella.player.controls.hidePopUp(this.getName());
	},

	getButtonItemClass:function(profileName,selected) {
		return 'viewModeItemButton ' + profileName  + ((selected) ? ' selected':'');
	}
});

paella.plugins.viewModePlugin = new paella.plugins.ViewModePlugin();
