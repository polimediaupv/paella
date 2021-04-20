
paella.addPlugin(function() {
	return class PlaybackRate extends paella.ButtonPlugin {
		
		getAlignment() { return 'left'; }
		getSubclass() { return "showPlaybackRateButton"; }
		getIconClass() { return 'icon-screen'; }
		getIndex() { return 140; }
		getName() { return "es.upv.paella.playbackRatePlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.menuButton; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Set playback rate"); }

		checkEnabled(onSuccess) {
			this.buttonItems = null;
			this.buttons =  [];
			this.selected_button =  null;
			this.defaultRate = null;
			this._domElement = null;
			this.available_rates =  null;
			var enabled = paella.player.videoContainer.masterVideo() instanceof paella.Html5Video;
			onSuccess(enabled && !paella.player.videoContainer.streamProvider.isLiveStreaming);
		}

		closeOnMouseOut() { return true; }

		setup() {
			this.defaultRate = 1.0;
			this.available_rates = this.config.availableRates || [0.75, 1, 1.25, 1.5];
		}

		getMenuContent() {
			let buttonItems = [];
			this.available_rates.forEach((rate) => {
				let profileName = rate + "x";
				buttonItems.push({
					id: profileName,
					title: profileName,
					value: rate,
					icon: "",
					className: this.getButtonItemClass(profileName),
					default: rate == 1.0
				});
			});

			return buttonItems;
		}

		menuItemSelected(itemData) {
			paella.player.videoContainer.setPlaybackRate(itemData.value);
			this.setText(itemData.title);
			paella.player.controls.hidePopUp(this.getName());
		}

		getText() {
			return "1x";
		}

		getButtonItemClass(profileName,selected) {
			return 'playbackRateItem ' + profileName  + ((selected) ? ' selected':'');
		}
	}
});