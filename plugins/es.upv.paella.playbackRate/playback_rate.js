Class ("paella.plugins.PlaybackRate",paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,
	defaultRate:null,
	_domElement:null,

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return "showPlaybackRateButton"; },
	getIndex:function() { return 140; },
	getMinWindowSize:function() { return 200; },
	getName:function() { return "es.upv.paella.playbackRate"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Set playback rate"); },		
	checkEnabled:function(onSuccess) {
		onSuccess(dynamic_cast("paella.Html5Video",paella.player.videoContainer.masterVideo())!=null);
	},

	setup:function() {
		var thisClass = this;
		thisClass.defaultRate = 1.0;
    },

	buildContent:function(domElement) {
		var This = this;
		This._domElement = domElement;
		this.buttonItems = {};
		//domElement.appendChild(This.getItemButton("0.5x",0.5));
		domElement.appendChild(This.getItemButton("0.75x",0.75));
		domElement.appendChild(This.getItemButton("1x",1.0));
		domElement.appendChild(This.getItemButton("1.25x",1.25));
		domElement.appendChild(This.getItemButton("1.5x",1.5));
	},
	
	getItemButton:function(label,rate) {
		var elem = document.createElement('div');
		if(rate == 1.0){
			elem.className = this.getButtonItemClass(label,true);
		}
		else{
			elem.className = this.getButtonItemClass(label,false);
		}
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
		var self = this;
		//paella.player.videoContainer.setPlaybackRate(rate);
		paella.events.trigger(paella.events.setPlaybackRate, rate);
		this.setText(label);
		paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});

		var arr = self._domElement.children;
		for(var i=0; i < arr.length; i++){
			arr[i].className = self.getButtonItemClass(i,false);
		}
		button.className = self.getButtonItemClass(i,true);
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
