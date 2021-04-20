paella.addPlugin(function() {
	return class ThemeChooserPlugin extends paella.ButtonPlugin {
		getAlignment() { return 'right'; }
		getSubclass() { return "themeChooserPlugin"; }
		getIconClass() { return 'icon-paintbrush'; }
		getIndex() { return 2030; }
		getName() { return "es.upv.paella.themeChooserPlugin"; }	
		getDefaultToolTip() { return paella.utils.dictionary.translate("Change theme"); }	
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		
		checkEnabled(onSuccess) { 
			this.currentUrl = null;
			this.currentMaster = null;
			this.currentSlave = null;
			this.availableMasters = [];
			this.availableSlaves = [];
			if ( paella.player.config.skin && paella.player.config.skin.available
				&& (paella.player.config.skin.available instanceof Array) 
				&& (paella.player.config.skin.available.length >0)) {
				
				onSuccess(true);			
			}
			else {
				onSuccess(false);
			}
		}
		
		buildContent(domElement) {
			var This = this;
			paella.player.config.skin.available.forEach(function(item){
				var elem = document.createElement('div');
				elem.className = "themebutton";
				elem.innerText = item.replace('-',' ').replace('_',' ');
				$(elem).click(function(event) {
					paella.utils.skin.set(item);
					paella.player.controls.hidePopUp(This.getName());
				});
				
				domElement.appendChild(elem);			
			});
		}
	}
});
