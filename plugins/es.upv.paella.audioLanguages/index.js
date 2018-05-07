paella.addPlugin(function() {
	return class AudioLanguage extends paella.ButtonPlugin {
		getAlignment() { return 'right'; }
		getSubclass() { return "audioLanguages"; }
		getIconClass() { return 'icon-headphone'; }
		getIndex() { return 2040; }
		getMinWindowSize() { return 400; }
		getName() { return "es.upv.paella.audioLanguage"; }
		getDefaultToolTip() { return base.dictionary.translate("Set audio language"); }

		closeOnMouseOut() { return true; }
			
		checkEnabled(onSuccess) {
			paella.player.videoContainer.getAudioLanguages()
				.then((lang) => {
					this._languages = lang;
					onSuccess(lang.length>1);
				});
		}
			
		setup() {
			var This = this;
			this.setLanguageLabel();
			paella.events.bind(paella.events.audioLanguageChanged, () => {
				this.setLanguageLabel();
			});
		}

		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		
		buildContent(domElement) {
			this._languages.forEach((lang) => {
				domElement.appendChild(this.getItemButton(lang));
			});
		}

		getItemButton(lang) {
			var elem = document.createElement('div');
			let currentLanguage = paella.player.videoContainer.streamProvider.mainAudioPlayer.stream.language;
			let label = paella.dictionary.translate(lang);
			elem.className = this.getButtonItemClass(label,lang==currentLanguage);
			elem.id = "laguageSelectorItem_" + lang;
			elem.innerHTML = label;
			elem.data = lang;
			$(elem).click(function(event) {
				$('.videoAudioTrackItem').removeClass('selected');
				$('.videoAudioTrackItem.' + this.data).addClass('selected');
				paella.player.videoContainer.setAudioLanguage(this.data);
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

		getButtonItemClass(language,selected) {
			return 'videoAudioTrackItem ' + language  + ((selected) ? ' selected':'');
		}

		setLanguageLabel() {
			this.setText(paella.player.videoContainer.audioLanguage);
		}
	}
});