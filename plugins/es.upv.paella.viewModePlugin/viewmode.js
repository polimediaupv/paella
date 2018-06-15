
paella.addPlugin(function() {
	return class ViewModePlugin extends paella.ButtonPlugin {
		
		getAlignment() { return 'right'; }
		getSubclass() { return "showViewModeButton"; }
		getIconClass() { return 'icon-presentation-mode'; }
		getIndex() { return 540; }
		getMinWindowSize() { return 300; }
		getName() { return "es.upv.paella.viewModePlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getDefaultToolTip() { return base.dictionary.translate("Change video layout"); }		
		checkEnabled(onSuccess) {
			this.buttonItems =null;
			this.buttons = [];
			this.selected_button = null;
			this.active_profiles = null;
			this.active_profiles = this.config.activeProfiles;
			onSuccess(!paella.player.videoContainer.isMonostream);
		}
	
		closeOnMouseOut() { return true; }
	
		setup() {
			var thisClass = this;
	
			var Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};
	
		  paella.events.bind(paella.events.setProfile,function(event,params) {
			  thisClass.onProfileChange(params.profileName);
		  });
	
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
		}

		rebuildProfileList() {
			this.buttonItems = {};
			this.domElement.innerHTML = "";
			paella.profiles.profileList.forEach((profileData) => {
				if (profileData.hidden) return;
				if (this.active_profiles) {
					var active = false;
					this.active_profiles.forEach(function(ap) {
						if (ap == profile) {active = true;}
					});
					if (active == false) {
						return;
					}
				}

				var buttonItem = this.getProfileItemButton(profileData.id, profileData);
				this.buttonItems[profileData.id] = buttonItem;
				this.domElement.appendChild(buttonItem);
				this.buttons.push(buttonItem);
				if(paella.player.selectedProfile == profileData.id){
					this.buttonItems[profileData.id].className = this.getButtonItemClass(profileData.id, true);
				}
			});
			this.selected_button = this.buttons.length;
		}
	
		buildContent(domElement) {
			var thisClass = this;
			this.domElement = domElement;
			this.rebuildProfileList();

			paella.events.bind(paella.events.profileListChanged,() => {
				this.rebuildProfileList();
			});
		}
	
		getProfileItemButton(profile,profileData) {
			var elem = document.createElement('div');
			elem.className = this.getButtonItemClass(profile,false);
			elem.style.backgroundImage = `url(${ this.getButtonItemIcon(profileData) })`;
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
		}
	
		onProfileChange(profileName) {
			var thisClass = this;
			var ButtonItem = this.buttonItems[profileName];

			var n = this.buttonItems;
			var arr = Object.keys(n);
			arr.forEach(function(i){
					thisClass.buttonItems[i].className = thisClass.getButtonItemClass(i,false);
			});
	
			if(ButtonItem) {
				ButtonItem.className = thisClass.getButtonItemClass(profileName,true);
			}
		}
	
		onItemClick(button,profile,profileData) {
			var ButtonItem = this.buttonItems[profile];
	
			if (ButtonItem) {
				paella.player.setProfile(profile);
			}
			paella.player.controls.hidePopUp(this.getName());
		}
	
		getButtonItemClass(profileName,selected) {
			return 'viewModeItemButton ' + profileName  + ((selected) ? ' selected':'');
		}

		getButtonItemIcon(profileData) {
			return `${ paella.baseUrl }resources/style/${ profileData.icon }`;
		}
	}
});
