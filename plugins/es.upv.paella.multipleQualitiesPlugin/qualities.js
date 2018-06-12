
paella.addPlugin(function() {
	return class MultipleQualitiesPlugin extends paella.ButtonPlugin {
		
		getAlignment() { return 'right'; }
		getSubclass() { return "showMultipleQualitiesPlugin"; }
		getIconClass() { return 'icon-screen'; }
		getIndex() { return 2030; }
		getMinWindowSize() { return 550; }
		getName() { return "es.upv.paella.multipleQualitiesPlugin"; }
		getDefaultToolTip() { return base.dictionary.translate("Change video quality"); }
		
		closeOnMouseOut() { return true; }
		
		checkEnabled(onSuccess) {
			this._available = [];
			paella.player.videoContainer.getQualities()
				.then((q) => {
					this._available = q;
					onSuccess(q.length>1);
				});
		}		
			
		setup() {
			this.setQualityLabel();
			paella.events.bind(paella.events.qualityChanged, (event) => this.setQualityLabel());
		}

		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		
		buildContent(domElement) {
			this._available.forEach((q) => {
				var title = q.shortLabel();
				domElement.appendChild(this.getItemButton(q));
			});
		}

		getItemButton(quality) {
			var elem = document.createElement('div');
			let This = this;
			paella.player.videoContainer.getCurrentQuality()
				.then((currentIndex,currentData) => {
					var label = quality.shortLabel();
					elem.className = this.getButtonItemClass(label,quality.index==currentIndex);
					elem.id = label;
					elem.innerHTML = label;
					elem.data = quality;
					$(elem).click(function(event) {
						$('.multipleQualityItem').removeClass('selected');
						$('.multipleQualityItem.' + this.data.toString()).addClass('selected');
						paella.player.videoContainer.setQuality(this.data.index)
							.then(() => {
								paella.player.controls.hidePopUp(This.getName());
								This.setQualityLabel();
							});
					});
				});
			return elem;
		}
		
		setQualityLabel() {
			paella.player.videoContainer.getCurrentQuality()
				.then((q) => {
					this.setText(q.shortLabel());
				});
		}

		getButtonItemClass(profileName,selected) {
			return 'multipleQualityItem ' + profileName  + ((selected) ? ' selected':'');
		}
	}
});