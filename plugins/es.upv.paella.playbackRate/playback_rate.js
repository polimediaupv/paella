Class ("paella.plugins.PlaybackRate",paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showPlaybackRateButton"; },
	getIndex:function() { return 640; },
	getMinWindowSize:function() { return 200; },
	getName:function() { return "es.upv.paella.playbackRate"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Set playback rate"); },		
	checkEnabled:function(onSuccess) {
		onSuccess(dynamic_cast("paella.Html5Video",paella.player.videoContainer.masterVideo())!=null);
	},

	setup:function() {
		var thisClass = this;
    },

	buildContent:function(domElement) {
		var This = this;
		this.buttonItems = {};
		//domElement.appendChild(This.getItemButton("0.5x",0.5));
		domElement.appendChild(This.getItemButton("0.75x",0.75));
		domElement.appendChild(This.getItemButton("1x",1.0));
		domElement.appendChild(This.getItemButton("1.25x",1.25));
		domElement.appendChild(This.getItemButton("1.5x",1.5));
	},
	
	getItemButton:function(label,rate) {
		var elem = document.createElement('div');
		elem.className = this.getButtonItemClass(label,false);
		elem.id = label + '_button';
		elem.innerHTML = label;
		elem.data = {
			label:label,
			rate:rate,
			plugin:this
		};
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this,this.data.label,this.data.rate);
		});
		return elem;
	},
	
	onItemClick:function(button,label,rate) {
		paella.player.videoContainer.setPlaybackRate(rate);
		this.setText(label);
		paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	},
	
	getText:function() {
		return "1x";
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

	getButtonItemClass:function(profileName,selected) {
		return 'playbackRateItem ' + profileName  + ((selected) ? ' selected':'');
	}
});

paella.plugins.playbackRate = new paella.plugins.PlaybackRate();
