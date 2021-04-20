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

var GlobalParams = {
	video:{zIndex:1},
	background:{zIndex:0}
};


window.paella = window.paella || {};
paella.player = null;
paella.version = "@version@";

(function buildBaseUrl() {
	if (window.paella_debug_baseUrl) {
		paella.baseUrl = window.paella_debug_baseUrl;
	}
	else {
		paella.baseUrl = location.href.replace(/[^/]*$/, '');
	}
})();

paella.events = {
	play:"paella:play",
	pause:"paella:pause",
	next:"paella:next",
	previous:"paella:previous",
	seeking:"paella:seeking",
	seeked:"paella:seeked",
	timeupdate:"paella:timeupdate",
	timeUpdate:"paella:timeupdate",
	seekTo:"paella:setseek",
	endVideo:"paella:endvideo",			// Triggered when a single video stream ends (once per video)
	ended:"paella:ended",				// Triggered when the video ends 
	seekToTime:"paella:seektotime",
	setTrim:"paella:settrim",
	setPlaybackRate:"paella:setplaybackrate",
	setVolume:'paella:setVolume',
	setComposition:'paella:setComposition',
	loadStarted:'paella:loadStarted',
	loadComplete:'paella:loadComplete',
	loadPlugins:'paella:loadPlugins',
	error:'paella:error',
	documentChanged:'paella:documentChanged',
	didSaveChanges:'paella:didsavechanges',
	controlBarWillHide:'paella:controlbarwillhide',
	controlBarDidHide:'paella:controlbardidhide',
	controlBarDidShow:'paella:controlbardidshow',
	hidePopUp:'paella:hidePopUp',
	showPopUp:'paella:showPopUp',
	enterFullscreen:'paella:enterFullscreen',
	exitFullscreen:'paella:exitFullscreen',
	resize:'paella:resize',		// params: { width:paellaPlayerContainer width, height:paellaPlayerContainer height }
	videoZoomChanged:'paella:videoZoomChanged',
	audioTagChanged:'paella:audiotagchanged',
	zoomAvailabilityChanged:'paella:zoomavailabilitychanged',
	
	qualityChanged:'paella:qualityChanged',
	singleVideoReady:'paella:singleVideoReady',
	singleVideoUnloaded:'paella:singleVideoUnloaded',
	videoReady:'paella:videoReady',
	videoUnloaded:'paella:videoUnloaded',
	
	controlBarLoaded:'paella:controlBarLoaded',	
	
	captionAdded: 'paella:caption:add', // Event triggered when new caption is available.
	captionsEnabled: 'paella:caption:enabled',  // Event triguered when a caption es enabled.
	captionsDisabled: 'paella:caption:disabled',  // Event triguered when a caption es disabled.
	
	profileListChanged:'paella:profilelistchanged',
	setProfile:'paella:setprofile',

	seekAvailabilityChanged:'paella:seekAvailabilityChanged',
	
	trigger:function(event,params) {
		$(document).trigger(event,params);
	},
	bind:function(event,callback) { $(document).bind(event,function(event,params) { callback(event,params);}); },
	
	setupExternalListener:function() {
		window.addEventListener("message", function(event) {
			if (event.data && event.data.event) {
				paella.events.trigger(event.data.event,event.data.params);
			}
		}, false);
	}
};

paella.events.setupExternalListener();
