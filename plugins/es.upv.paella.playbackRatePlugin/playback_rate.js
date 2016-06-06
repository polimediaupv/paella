Class ("paella.plugins.PlaybackRate",paella.ButtonPlugin,{
	buttonItems:null,
	buttons: [],
	selected_button: null,
	defaultRate:null,
	_domElement:null,
	available_rates: null,

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return "showPlaybackRateButton"; },
	getIndex:function() { return 140; },
	getMinWindowSize:function() { return 200; },
	getName:function() { return "es.upv.paella.playbackRatePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	getDefaultToolTip:function() { return base.dictionary.translate("Set playback rate"); },
	checkEnabled:function(onSuccess) {
		var enabled = (!base.userAgent.browser.IsMobileVersion && dynamic_cast("paella.Html5Video",paella.player.videoContainer.masterVideo())!=null);
		onSuccess(enabled);
	},

	setup:function() {
		this.defaultRate = 1.0;
		this.available_rates = this.config.availableRates || [0.75, 1, 1.25, 1.5];
    },

	buildContent:function(domElement) {
		var This = this;
		This._domElement = domElement;
		this.buttonItems = {};
		this.available_rates.forEach(function(rate){
			domElement.appendChild(This.getItemButton(rate+"x", rate));
		});
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
	        paella.player.videoContainer.setPlaybackRate(rate);
		this.setText(label);
		paella.player.controls.hidePopUp(this.getName());


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
