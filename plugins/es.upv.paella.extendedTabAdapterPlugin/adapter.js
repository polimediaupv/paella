
paella.addPlugin(function() {
	return class extendedTabAdapterPlugin extends paella.ButtonPlugin {
		get currentUrl() { return this._currentUrl; }
		set currentUrl(v) { this._currentUrl = v; }
		get currentMaster() { return this._currentMaster; }
		set currentMaster(v) { this._currentMaster = v; }
		get currentSlave() { return this._currentSlave; }
		set currentSlave(v) { this._currentSlave = v; }
		get availableMasters() { return this._availableMasters; }
		set availableMasters(v) { this._availableMasters = v; }
		get availableSlaves() { return this._availableSlaves }
		set availableSlaves(v) { this._availableSlaves = v; }
		get showWidthRes() { return this._showWidthRes; }
		set showWidthRes(v) { this._showWidthRes = v; }

		getAlignment() { return 'right'; }
		getSubclass() { return "extendedTabAdapterPlugin"; }
		getIconClass() { return 'icon-folder'; }
		getIndex() { return 2030; }
		getName() { return "es.upv.paella.extendedTabAdapterPlugin"; }
		getDefaultToolTip() { return paella.utils.dictionary.translate("Extended Tab Adapter"); }
		getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
		
		buildContent(domElement) {
			domElement.appendChild(paella.extendedAdapter.bottomContainer);
		}
	}
});