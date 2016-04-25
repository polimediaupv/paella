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
var GlobalParams = {
	video:{zIndex:1},
	background:{zIndex:0}
};


var paella = {};
paella.player = null;

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
	endVideo:"paella:endvideo",
	seekToTime:"paella:seektotime",
	setTrim:"paella:settrim",
	setPlaybackRate:"paella:setplaybackrate",
	setVolume:'paella:setVolume',
	setComposition:'paella:setComposition',
	loadStarted:'paella:loadStarted',
	loadComplete:'paella:loadComplete',
	loadPlugins:'paella:loadPlugins',
	error:'paella:error',
	setProfile:'paella:setprofile',
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

	qualityChanged:'paella:qualityChanged',
	singleVideoReady:'paella:singleVideoReady',
	singleVideoUnloaded:'paella:singleVideoUnloaded',
	videoReady:'paella:videoReady',
	videoUnloaded:'paella:videoUnloaded',
	
	controlBarLoaded:'paella:controlBarLoaded',	
	
	flashVideoEvent:'paella:flashVideoEvent',
	
	captionAdded: 'paella:caption:add', // Event triggered when new caption is available.
	captionsEnabled: 'paella:caption:enabled',  // Event triguered when a caption es enabled.
	captionsDisabled: 'paella:caption:disabled',  // Event triguered when a caption es disabled.
	

	trigger:function(event,params) { $(document).trigger(event,params); },
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
