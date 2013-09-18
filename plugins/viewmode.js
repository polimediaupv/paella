paella.plugins.ViewModePlugin = Class.create(paella.ButtonPlugin,{
	buttonItems:null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showViewModeButton"; },
	getIndex:function() { return 101; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "ViewModePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.videoContainer.isMonostream);
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
			}
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

/*
var ProfileItemButton = Class.create(paella.DomNode,{
	viewModePlugin:null,

	initialize:function(icon,profileName,viewModePlugin) {
		this.parent('div',profileName + '_button',{display:'block',backgroundImage:'url(' + icon + ')',width:'78px',height:'41px'});
		this.viewModePlugin = viewModePlugin;

		var thisClass = this;
		$(this.domElement).click(function(event) {
			var currentProfileName = paellaPlayer.selectedProfile;
			if (profileName!=currentProfileName) {
				var currentButtonId = currentProfileName + '_button';
				var currentButton = $('#' + currentButtonId);
				$(currentButton).css({'background-position':'0px 0px'});
				var newButtonId = profileName + '_button';
				var newButton = $('#' + newButtonId);
				$(newButton).css({'background-position':'-78px 0px'});
//				paellaPlayer.setProfile(profileName);
				$(document).trigger(paella.events.setProfile,{profileName:profileName});
				if (thisClass.viewModePlugin) {
					$(thisClass.viewModePlugin.viewModeContainer.domElement).hide();
					thisClass.viewModePlugin.button.toggle();
				}
			}
		});
	}
	
paella.plugins.ViewModePlugin = Class.create(paella.PlaybackPopUpPlugin,{
	viewModeContainer:'',
	button:'',

	getRootNode:function(id) {
		var thisClass = this;
		this.button = new paella.Button(id + '_view_mode_button','showViewModeButton',function(event) { thisClass.viewModePress(); },true);
		return this.button;
	},
	
	getWidth:function() {
		return 45;
	},
	
	setRightPosition:function(position) {
		this.button.domElement.style.right = position + 'px';
	},
	
	getPopUpContent:function(id) {
		var thisClass = this;
		this.viewModeContainer = new paella.DomNode('div',id + '_viewmode_container',{display:'none'});
		paella.Profiles.loadProfileList(function(profiles) {
			for (var profile in profiles) {
				var profileData = profiles[profile];
				var imageUrl = 'config/profiles/resources/' + profileData.icon;
				thisClass.viewModeContainer.addNode(new ProfileItemButton(imageUrl,profile,thisClass));

				// Profile icon preload
				var image = new Image();
				image.src = imageUrl;
			}
		});
		return this.viewModeContainer;
	},
	
	viewModePress:function() {
		if (this.button.isToggled()) {
			$(this.viewModeContainer.domElement).show();
		}
		else {
			$(this.viewModeContainer.domElement).hide();
		}
	},
	
	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.videoContainer.isMonostream);
	},
	
	getIndex:function() {
		return 101;
	},
	
	getName:function() {
		return "ViewModePlugin";
	},
	
	getMinWindowSize:function() {
		return 500;
	}
});

new paella.plugins.ViewModePlugin();
*/

