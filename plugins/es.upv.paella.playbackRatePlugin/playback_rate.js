
paella.addPlugin(function() {
	return class PlaybackRate extends paella.ButtonPlugin {
		
		getAlignment() { return 'left'; }
		getSubclass() { return "showPlaybackRateButton"; }
		getIconClass() { return 'icon-screen'; }
		getIndex() { return 140; }
		getMinWindowSize() { return 500; }
		getName() { return "es.upv.paella.playbackRatePlugin"; }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		getDefaultToolTip() { return base.dictionary.translate("Set playback rate"); }

		checkEnabled(onSuccess) {
			this.buttonItems = null;
			this.buttons =  [];
			this.selected_button =  null;
			this.defaultRate = null;
			this._domElement = null;
			this.available_rates =  null;
			var enabled = (!base.userAgent.browser.IsMobileVersion && dynamic_cast("paella.Html5Video",paella.player.videoContainer.masterVideo())!=null);
			onSuccess(enabled);
		}

		closeOnMouseOut() { return true; }

		setup() {
			this.defaultRate = 1.0;
			this.available_rates = this.config.availableRates || [0.75, 1, 1.25, 1.5];
		}

		buildContent(domElement) {
			this._domElement = domElement;
			this.buttonItems = {};
			this.available_rates.forEach((rate) => {
				domElement.appendChild(this.getItemButton(rate+"x", rate));
			});
		}

		getItemButton(label,rate) {
			var elem = document.createElement('div');
			if(rate == 1.0){
				elem.className = this.getButtonItemClass(label,true);
			}
			else{
				elem.className = this.getButtonItemClass(label,false);
			}
			elem.id = label + '_button';
			elem.innerHTML = escape(label);
			elem.data = {
				label:label,
				rate:rate,
				plugin:this
			};
			$(elem).click(function(event) {
				this.data.plugin.onItemClick(this,this.data.label,this.data.rate);
			});
			return elem;
		}

		onItemClick(button,label,rate) {
			var self = this;
			paella.player.videoContainer.setPlaybackRate(rate);
			this.setText(label);
			paella.player.controls.hidePopUp(this.getName());


			var arr = self._domElement.children;
			for(var i=0; i < arr.length; i++){
				arr[i].className = self.getButtonItemClass(i,false);
			}
			button.className = self.getButtonItemClass(i,true);
		}

		getText() {
			return "1x";
		}

		getProfileItemButton(profile,profileData) {
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
		}

		getButtonItemClass(profileName,selected) {
			return 'playbackRateItem ' + profileName  + ((selected) ? ' selected':'');
		}
	}
});