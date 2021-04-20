
paella.addPlugin(function() {
	return class ViewModePlugin extends paella.ButtonPlugin {
		
		getAlignment() { return 'right'; }
		getSubclass() { return "showViewModeButton"; }
		getIconClass() { return 'icon-presentation-mode'; }
		getIndex() { return 540; }
		getName() { return "es.upv.paella.viewModePlugin"; }
		//getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getButtonType() { return paella.ButtonPlugin.type.menuButton; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Change video layout"); }		
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

		getMenuContent() {
			let buttonItems = [];
			paella.profiles.profileList.forEach((profileData,index) => {
				if (profileData.hidden) return;
				if (this.active_profiles) {
					let active = false;
					this.active_profiles.some((ap) => {
						if (ap == profile) {
							active = ap;
							return true;
						}
					});
					if (!active) {
						return;
					}
				}

	
				let current = paella.profiles.currentProfileName;

				let url = this.getButtonItemIcon(profileData);
				url = url.replace(/\\/ig,'/');
				buttonItems.push({
					id: profileData.id + "_button",
					title: "",
					value: profileData.id,
					icon: url,
					className: this.getButtonItemClass(profileData.id),
					default: current == profileData.id
				})
			})
			return buttonItems;
		}

		menuItemSelected(itemData) {
			paella.player.setProfile(itemData.value);
			paella.player.controls.hidePopUp(this.getName());
		}

		onProfileChange(profileName) {
			this.rebuildMenu();
		}
	
		getButtonItemClass(profileName) {
			return 'viewModeItemButton ' + profileName;
		}

		getButtonItemIcon(profileData) {
			return `${ paella.baseUrl }resources/style/${ profileData.icon }`;
		}
	}
});
