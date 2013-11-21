paella.plugins.SocialPlugin = Class.create(paella.ButtonPlugin,{
	buttonItems: null,
	socialMedia: null,
	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showSocialPluginButton"; },
	getIndex:function() { return 2060; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "es.upv.paella.socialPlugin"; },
	checkEnabled:function(onSuccess) { onSuccess(true); },
	getDefaultToolTip:function() { return paella.dictionary.translate("Share this video"); },	
	
	
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		socialMedia = ['facebook','twitter'];
		for (var media in socialMedia){
		  var mediaData = socialMedia[media];
		  var buttonItem = thisClass.getSocialMediaItemButton(mediaData);
		  thisClass.buttonItems[media] = buttonItem;
		  domElement.appendChild(buttonItem);
		}
	},
	
	getSocialMediaItemButton:function(mediaData) {
		var elem = document.createElement('div');
		elem.className = 'socialItemButton ' + mediaData
		elem.id = mediaData + '_button';
		elem.data = {
			mediaData:mediaData,
			plugin:this
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this.data.mediaData);
		});
		return elem;
	},
	
	onItemClick:function(mediaData) {
		var url = this.getVideoUrl();
		switch (mediaData) {
			case ('twitter'):
				window.open('http://twitter.com/home?status=' + url);
				break;
			case ('facebook'):
				window.open('http://www.facebook.com/sharer.php?u=' + url);
				break;  
                }
		paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
	},
	
	getVideoUrl:function() {
		var url = document.location.href;
		return url;
	}
});
  

paella.plugins.socialPlugin = new paella.plugins.SocialPlugin();
