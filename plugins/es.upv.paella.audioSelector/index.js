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
			
		setup() {
			var This = this;
			this.setTagLabel();
			paella.events.bind(paella.events.audioTagChanged, () => {
				this.setTagLabel();
			});
		}

		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		
		buildContent(domElement) {
			this._tags.forEach((tag) => {
				domElement.appendChild(this.getItemButton(tag));
			});
		}

		getItemButton(lang) {
			var elem = document.createElement('div');
			let currentTag = paella.player.videoContainer.audioTag;
			let label = paella.dictionary.translate(lang);
			elem.className = this.getButtonItemClass(label,lang==currentTag);
			elem.id = "audioTagSelectorItem_" + lang;
			elem.innerText = label;
			elem.data = lang;
			$(elem).click(function(event) {
				$('.videoAudioTrackItem').removeClass('selected');
				$('.videoAudioTrackItem.' + this.data).addClass('selected');
				paella.player.videoContainer.setAudioTag(this.data);
			});

			return elem;
		}
		
		setQualityLabel() {
			var This = this;
			paella.player.videoContainer.getCurrentQuality()
				.then(function(q) {
					This.setText(q.shortLabel());
				});
		}

		getButtonItemClass(tag,selected) {
			return 'videoAudioTrackItem ' + tag  + ((selected) ? ' selected':'');
		}

		setTagLabel() {
			this.setText(paella.player.videoContainer.audioTag);
		}
	}
});