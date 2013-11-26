paella.plugins.ViewModePlugin = Class.create(paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showViewModeButton"; },
	getIndex:function() { return 540; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.viewModePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return paella.dictionary.translate("Change video layout"); },		
	checkEnabled:function(onSuccess) {
		onSuccess(paella.initDelegate.initParams.videoLoader.streams.length>=2);
	},

	setup:function() {
		var thisClass = this;

    	Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

        $(this.button).keyup(function(event) {
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

        });
    },

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		paella.Profiles.loadProfileList(function(profiles) {
			for (var profile in profiles) {
				var profileData = profiles[profile];
				var buttonItem = thisClass.getProfileItemButton(profile,profileData);
				thisClass.buttonItems[profile] = buttonItem;
				domElement.appendChild(buttonItem);
				thisClass.buttons.push(buttonItem);
			}
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
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this,this.data.profile,this.data.profileData);
		});
		return elem;
	},
	
	onItemClick:function(button,profile,profileData) {
		var prevButtonItem = this.buttonItems[paella.player.selectedProfile];
		var nextButtonItem = this.buttonItems[profile];
		
		if (nextButtonItem && prevButtonItem!=nextButtonItem) {
			prevButtonItem.className = this.getButtonItemClass(paella.player.selectedProfile,false);
			nextButtonItem.className = this.getButtonItemClass(profile,true);
			paella.events.trigger(paella.events.setProfile,{profileName:profile});
			paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
		}
	},
	
	getButtonItemClass:function(profileName,selected) {
		return 'viewModeItemButton ' + profileName  + ((selected) ? ' selected':'');
	}
});

paella.plugins.viewModePlugin = new paella.plugins.ViewModePlugin();
