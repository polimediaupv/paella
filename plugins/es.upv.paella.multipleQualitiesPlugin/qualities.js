Class ("paella.plugins.MultipleQualitiesPlugin",paella.ButtonPlugin,{
	_available:[],

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showMultipleQualitiesPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 550; },
	getName:function() { return "es.upv.paella.multipleQualitiesPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Change video quality"); },
		
	checkEnabled:function(onSuccess) {
		var This = this;
		paella.player.videoContainer.getQualities()
			.then(function(q) {
				This._available = q;
				onSuccess(q.length>1);
			});
	},		
		
	setup:function() {
		var This = this;
		this.setQualityLabel();
		paella.events.bind(paella.events.qualityChanged, function(event) { This.setQualityLabel(); });
	},

	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		var This = this;
		this._available.forEach(function(q) {
			var title = q.shortLabel();
			domElement.appendChild(This.getItemButton(q));
		});
	},

	getItemButton:function(quality) {
		var elem = document.createElement('div');
		var This = this;
		paella.player.videoContainer.getCurrentQuality()
			.then(function(currentIndex,currentData) {
				var label = quality.shortLabel();
				elem.className = This.getButtonItemClass(label,quality.index==currentIndex);
				elem.id = label;
				elem.innerHTML = label;
				elem.data = quality;
				$(elem).click(function(event) {
					$('.multipleQualityItem').removeClass('selected');
					$('.multipleQualityItem.' + this.data.toString()).addClass('selected');
					paella.player.videoContainer.setQuality(this.data.index)
						.then(function() {
							paella.player.controls.hidePopUp(This.getName());
							This.setQualityLabel();
						});
				});
			});
		return elem;
	},
	
	setQualityLabel:function() {
		var This = this;
		paella.player.videoContainer.getCurrentQuality()
			.then(function(q) {
				This.setText(q.shortLabel());
			});
	},

	getButtonItemClass:function(profileName,selected) {
		return 'multipleQualityItem ' + profileName  + ((selected) ? ' selected':'');
	}
});


paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin();


		
