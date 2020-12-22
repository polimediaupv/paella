
paella.addPlugin(function() {
	return class MultipleQualitiesPlugin extends paella.ButtonPlugin {
		
		getAlignment() { return 'right'; }
		getSubclass() { return "showMultipleQualitiesPlugin"; }
		getIconClass() { return 'icon-screen'; }
		getIndex() { return 2030; }
		getName() { return "es.upv.paella.multipleQualitiesPlugin"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Change video quality"); }
		
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

		getButtonType() { return paella.ButtonPlugin.type.menuButton; }
		
		getMenuContent() {
			let buttonItems = [];

			const minVisibleQuality = this.config.minVisibleQuality !== undefined ? this.config.minVisibleQuality : 100;
			this._available.forEach((q,index) => {
				let resH = q.res && q.res.h || 0;
				if (resH>=minVisibleQuality || resH<=0) {
					buttonItems.push({
						id: q.shortLabel(),
						title: q.shortLabel(),
						value: index,
						icon: "",
						className: this.getButtonItemClass(q.shortLabel()),
						default: false
					});
				}
			});
			return buttonItems;
		}

		menuItemSelected(itemData) {
			paella.player.videoContainer.setQuality(itemData.value)
				.then(() => {
					paella.player.controls.hidePopUp(this.getName());
					this.setQualityLabel();
				});
		}

		setQualityLabel() {
			paella.player.videoContainer.getCurrentQuality()
				.then((q) => {
					this.setText(q.shortLabel());
				});
		}

		getButtonItemClass(profileName) {
			return 'multipleQualityItem ' + profileName;
		}
	}
});