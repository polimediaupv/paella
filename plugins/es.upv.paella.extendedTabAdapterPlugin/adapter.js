Class ("paella.plugins.extendedTabAdapterPlugin",paella.ButtonPlugin,{
	currentUrl:null,
	currentMaster:null,
	currentSlave:null,
	availableMasters:[],
	availableSlaves:[],
	showWidthRes:null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "extendedTabAdapterPlugin"; },
	getIndex:function() { return 2030; },
	getMinWindowSize:function() { return 550; },
	getName:function() { return "es.upv.paella.extendedTabAdapterPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Extended Tab Adapter"); },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },
	
	buildContent:function(domElement) {
		domElement.appendChild(paella.extendedAdapter.bottomContainer);
	}
});


new paella.plugins.extendedTabAdapterPlugin();