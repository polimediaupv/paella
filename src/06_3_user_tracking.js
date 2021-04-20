/*  
	Paella HTML 5 Multistream Player
	Copyright (C) 2017  Universitat Politècnica de València Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://www.osedu.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
*/


(function(){


var userTrackingManager = {
	_plugins: [],

	addPlugin: function(plugin) {
		plugin.checkEnabled((isEnabled) => {
			if (isEnabled) {
				plugin.setup();
				this._plugins.push(plugin);
			}
		});
	},
	initialize: function() {
		paella.pluginManager.setTarget('userTrackingSaverPlugIn', this);
	}
};

paella.userTracking = {};
userTrackingManager.initialize();

class SaverPlugIn extends paella.FastLoadPlugin {
	get type() { return 'userTrackingSaverPlugIn'; }
	getIndex() { return -1; }
	checkEnabled(onSuccess) { onSuccess(true); }

	log(event, params) {
		throw new Error('paella.userTracking.SaverPlugIn#log must be overridden by subclass');
	}
}

paella.userTracking.SaverPlugIn = SaverPlugIn;


var evsentsToLog = {};

paella.userTracking.log = function(event, params) {
	if (evsentsToLog[event] != undefined) {
		evsentsToLog[event].cancel();
	}
	evsentsToLog[event] = new paella.utils.Timer(function(timer) {
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
[
	paella.events.play,
	paella.events.pause,
	paella.events.endVideo,
	paella.events.showEditor,
	paella.events.hideEditor,
	paella.events.enterFullscreen,
	paella.events.exitFullscreen,
	paella.events.loadComplete
].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		paella.userTracking.log(event);
	});
});

// Log show/hide PopUp
[
	paella.events.showPopUp,
	paella.events.hidePopUp]
.forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		paella.userTracking.log(event, params.identifier);
	});
});

// Log captions Events
[
	// paella.events.captionAdded, 
	paella.events.captionsEnabled,
	paella.events.captionsDisabled
].forEach(function(event){
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
[
	paella.events.setProfile
].forEach(function(event){
	paella.events.bind(event, function(ev, params) {
		paella.userTracking.log(event, params.profileName);
	});
});


// Log seek events
[
	paella.events.seekTo,
	paella.events.seekToTime
].forEach(function(event){
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
[
	paella.events.setVolume,
	paella.events.resize,
	paella.events.setPlaybackRate,
	paella.events.qualityChanged
].forEach(function(event){
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
