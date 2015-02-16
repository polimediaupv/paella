(function(){


var userTrackingManager = new (Class ({
	_plugins: [],
	
	addPlugin: function(plugin) {
		this._plugins.push(plugin);
	},
	initialize: function() {
		paella.pluginManager.setTarget('userTrackingSaverPlugIn', this);	
	}
}))();


paella.userTracking = {};

Class ("paella.userTracking.SaverPlugIn", paella.FastLoadPlugin, {
	type:'userTrackingSaverPlugIn',
	getIndex: function() {return -1;},
	
	log: function(event, label) {
		throw new Error('paella.paella.userTracking.SaverPlugIn#log must be overridden by subclass');
	}
});


var evsentsToLog = {};

paella.userTracking.log = function(event, label) {
	if (evsentsToLog[event] != undefined) {
		evsentsToLog[event].cancel();		
	}
	evsentsToLog[event] = new base.Timer(function(timer) {
		userTrackingManager._plugins.forEach(function(p) {
			p.log(event, label);
		});
		delete evsentsToLog[event];
	}, 500);
};



//////////////////////////////////////////////////////////
// Log automatic events
//////////////////////////////////////////////////////////
// Log simple events
[paella.events.play, paella.events.pause, paella.events.endVideo, 
paella.events.showEditor, paella.events.hideEditor, 
paella.events.enterFullscreen, paella.events.exitFullscreen].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		paella.userTracking.log(event, "");
	});
});

// Log show/hide PopUp
[paella.events.showPopUp, paella.events.hidePopUp].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		paella.userTracking.log(event, params.identifier);
	});
});

// Log captions Events
[/*paella.events.captionAdded,*/ paella.events.captionsEnabled, paella.events.captionsDisabled].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		var label = "";
		if (params != undefined) {
			var c = paella.captions.getCaptions(params);
			label = JSON.stringify({id: params, lang: c._lang, url: c._url});
		}
		paella.userTracking.log(event, label);
	});
});

// Log param events
[paella.events.seekTo, paella.events.seekToTime, paella.events.setPlaybackRate, paella.events.setVolume, paella.events.setProfile,
paella.events.resize, paella.events.setProfile].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		var label = "";
		try {
			label = JSON.stringify(params);
		}
		catch(e) {}
		
		paella.userTracking.log(event, label);
	});
});



/////////////////////////////
new (Class (paella.FastLoadPlugin, {
	type:'userTrackingSaverPlugIn',
	getName: function() {return "test";},
	
	log: function(event, label) {
		console.log("Log: " + event + " " + label);
	}
}))();




}());