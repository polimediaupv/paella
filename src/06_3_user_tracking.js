/*
 Paella HTML 5 Multistream Player
 Copyright (C) 2013  Universitat Politècnica de València

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


(function(){


var userTrackingManager = new (Class ({
	_plugins: [],
	
	addPlugin: function(plugin) {
		var self = this;
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				plugin.setup();
				self._plugins.push(plugin);				
			}
		});	
	},
	initialize: function() {
		paella.pluginManager.setTarget('userTrackingSaverPlugIn', this);	
	}
}))();


paella.userTracking = {};

Class ("paella.userTracking.SaverPlugIn", paella.FastLoadPlugin, {
	type:'userTrackingSaverPlugIn',
	getIndex: function() {return -1;},	
	checkEnabled:function(onSuccess) { onSuccess(true); },
	
	log: function(event, params) {
		throw new Error('paella.userTracking.SaverPlugIn#log must be overridden by subclass');
	}
});


var evsentsToLog = {};

paella.userTracking.log = function(event, params) {
	if (evsentsToLog[event] != undefined) {
		evsentsToLog[event].cancel();		
	}
	evsentsToLog[event] = new base.Timer(function(timer) {
		userTrackingManager._plugins.forEach(function(p) {
			p.log(event, params);
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
paella.events.enterFullscreen, paella.events.exitFullscreen, paella.events.loadComplete].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		paella.userTracking.log(event);
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
		var log;
		if (params != undefined) {
			var c = paella.captions.getCaptions(params);
			log = {id: params, lang: c._lang, url: c._url};
		}
		paella.userTracking.log(event, log);
	});
});

// Log setProfile
[paella.events.setProfile].forEach(function(event){
	paella.events.bind(event, function(ev, params) {		
		paella.userTracking.log(event, params.profileName);
	});
});


// Log seek events
[paella.events.seekTo, paella.events.seekToTime].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		var log;
		try {
			JSON.stringify(params);
			log = params;
		}
		catch(e) {}
		
		paella.userTracking.log(event, log);
	});
});


// Log param events
[paella.events.setVolume, paella.events.resize, paella.events.setPlaybackRate].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		var log;
		try {
			JSON.stringify(params);
			log = params;
		}
		catch(e) {}
		
		paella.userTracking.log(event, log);
	});
});


}());