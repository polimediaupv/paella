paella.addPlugin(function() {
	return class AudioSelector extends paella.ButtonPlugin {
		getAlignment() { return 'right'; }
		getSubclass() { return "audioSelector"; }
		getIconClass() { return 'icon-headphone'; }
		getIndex() { return 2040; }
		getName() { return "es.upv.paella.audioSelector"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Set audio stream"); }

		closeOnMouseOut() { return true; }
			
		checkEnabled(onSuccess) {
			this._mainPlayer = paella.player.videoContainer.streamProvider.mainVideoPlayer;
			this._mainPlayer.supportsMultiaudio()
				.then((supports)=> {
					if (supports) {
						this._legacyMode = false;
						return this._mainPlayer.getAudioTracks();
					}
					else {
						this._legacyMode = true;
						return paella.player.videoContainer.getAudioTags();
					}
				})

				.then((audioTracks) => {
					if (this._legacyMode) {
						this._tags = audioTracks;
						return Promise.resolve();
					}
					else {
						this._audioTracks = audioTracks;
						return this._mainPlayer.getCurrentAudioTrack();
					}
				})

				.then((defaultAudioTrack) => {
					if (this._legacyMode) {
						onSuccess(this._tags.length>1);
					}
					else {
						this._defaultAudioTrack = defaultAudioTrack;
						onSuccess(true);
					}
				})
		}

		getButtonType() { return paella.ButtonPlugin.type.menuButton; }

		getMenuContent() {
			let buttonItems = [];

			if (this._legacyMode) {
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
			}
			else {
				this._audioTracks.forEach((track) => {
					buttonItems.push({
						id: track.id,
						title: track.groupId + " " + track.name,
						value: track.id,
						icon: "",
						className: this.getButtonItemClass(track.id),
						default: track.id == this._defaultAudioTrack.id
					});
				});
			}

			return buttonItems;
		}

		menuItemSelected(itemData) {
			if (this._legacyMode) {
				paella.player.videoContainer.setAudioTag(itemData.value);
			}
			else {
				this._mainPlayer.setCurrentAudioTrack(itemData.id);
			}
			paella.player.controls.hidePopUp(this.getName());
		}
		
		setQualityLabel() {
			if (this._legacyMode) {
				var This = this;
				paella.player.videoContainer.getCurrentQuality()
					.then(function(q) {
						This.setText(q.shortLabel());
					});
			}
			else {

			}
		}

		getButtonItemClass(tag) {
			return 'videoAudioTrackItem ' + tag;
		}
	}
});