paella.addPlugin(function() {
	return class AudioSelector extends paella.ButtonPlugin {
		getAlignment() { return 'right'; }
		getSubclass() { return "audioSelector"; }
		getIconClass() { return 'icon-headphone'; }
		getIndex() { return 2040; }
		getName() { return "es.upv.paella.audioSelector"; }
		getDefaultToolTip() { return base.dictionary.translate("Set audio stream"); }

		closeOnMouseOut() { return true; }
			
		checkEnabled(onSuccess) {
			paella.player.videoContainer.getAudioTags()
				.then((tags) => {
					this._tags = tags;
					onSuccess(tags.length>1);
				});
		}

		getButtonType() { return paella.ButtonPlugin.type.menuButton; }

		setup() {
			
			
		}

		getMenuContent() {
			let buttonItems = [];

			this._tags.forEach((tag,index) => {
				buttonItems.push({
					id: index,
					title: tag,
					value: tag,
					icon: "",
					className: this.getButtonItemClass(tag),
					default: tag == paella.player.videoContainer.audioTag
				});
			});

			return buttonItems;
		}

		menuItemSelected(itemData) {
			paella.player.videoContainer.setAudioTag(itemData.value);
		}
		
		setQualityLabel() {
			var This = this;
			paella.player.videoContainer.getCurrentQuality()
				.then(function(q) {
					This.setText(q.shortLabel());
				});
		}
		
		getButtonItemClass(tag) {
			return 'videoAudioTrackItem ' + tag;
		}
	}
});