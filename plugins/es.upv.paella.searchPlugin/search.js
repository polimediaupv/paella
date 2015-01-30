Class ("paella.plugins.SearchPlugin", paella.ButtonPlugin,{
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return 'searchButton'; },
	getName:function() { return "es.upv.paella.searchPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },	
	getDefaultToolTip:function() { return base.dictionary.translate("Search text on captions"); },
	getIndex:function() {return 150;},
});

paella.plugins.searchPlugin = new paella.plugins.SearchPlugin();