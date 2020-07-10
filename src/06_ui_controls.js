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


(() => {

class TimeControl extends paella.DomNode {
	constructor(id) {
		super('div',id,{left:"0%"});
		this.domElement.className = 'timeControlOld';
		this.domElement.className = 'timeControl';
		//this.domElement.innerText = "0:00:00";
		var thisClass = this;
		paella.events.bind(paella.events.timeupdate,function(event,params) { thisClass.onTimeUpdate(params); });
	}

	onTimeUpdate(memo) {
		this.domElement.innerText = this.secondsToHours(parseInt(memo.currentTime));
	}

	secondsToHours(sec_numb) {
		var hours   = Math.floor(sec_numb / 3600);
		var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
		var seconds = sec_numb - (hours * 3600) - (minutes * 60);

		if (hours < 10) {hours = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		return hours + ':' + minutes + ':' + seconds;
	}
}

paella.TimeControl = TimeControl;

class PlaybackCanvasPlugin extends paella.DeferredLoadPlugin {
	get type() { return 'playbackCanvas'; }

	get playbackBarCanvas() { return this._playbackBarCanvas; }

	constructor() {
		super();
	}

	drawCanvas(context,width,height,videoData) {
		// videoData: {
		//		duration: fullDuration,
		//		trimming: {
		//			enabled: true | false,
		//			start: trimmingStart,
		//			end: trimmingEnd,
		//			duration: trimmedDuration | duration if trimming is not enabled
		//		}
		//	}
	}
}
paella.PlaybackCanvasPlugin = PlaybackCanvasPlugin;

class PlaybackBarCanvas {
	constructor(canvasElem) {
		this._parent = canvasElem;
		this._plugins = [];

		paella.pluginManager.setTarget('playbackCanvas', this);
	}

	addPlugin(plugin) {
		plugin._playbackBarCanvas = this;
		plugin.checkEnabled((isEnabled) => {
			if (isEnabled) {
				plugin.setup();
				this._plugins.push(plugin);
			}
		});
	}

	get parent() { return this._parent; }

	get canvas() {
		if (!this._canvas) {
			let createCanvas = (index) => {
				let result = document.createElement("canvas");
				result.className = "playerContainer_controls_playback_playbackBar_canvas layer_" + index;
				result.id = "playerContainer_controls_playback_playbackBar_canvas_" + index;
				result.width = $(this.parent).width();
				result.height = $(this.parent).height();
				return result;
			}
			this._canvas = [
				createCanvas(0),
				createCanvas(1)
			];
			$(this._parent).prepend(this._canvas[0]);
			$(this._parent).append(this._canvas[1]);
		}
		return this._canvas;
	}

	get context() {
		if (!this._context) {
			this._context = [
				this.canvas[0].getContext("2d"),
				this.canvas[1].getContext("2d")
			]
		}
		return this._context;
	}

	get width() {
		return this.canvas[0].width;
	}

	get height() {
		return this.canvas[0].height;
	}

	resize(w,h) {
		this.canvas[0].width = w;
		this.canvas[0].height = h;
		this.canvas[1].width = w;
		this.canvas[1].height = h;
		this.drawCanvas();
	}

	drawCanvas(){
		let duration = 0;
		paella.player.videoContainer.duration(true)
			.then((d) => {
				duration = d;
				return paella.player.videoContainer.trimming();
			})

			.then((trimming) => {
				let trimmedDuration = 0;
				if (trimming.enabled) {
					trimmedDuration = trimming.end - trimming.start;
				}
				let videoData = {
					duration: duration,
					trimming: {
						enabled: trimming.enabled,
						start: trimming.start,
						end: trimming.end,
						duration: trimming.enabled ? trimming.end - trimming.start : duration
					}
				}
				let ctx = this.context;
				let w = this.width;
				let h = this.height;
				this.clearCanvas();
				this._plugins.forEach((plugin) => {
					plugin.drawCanvas(ctx,w,h,videoData);
				});
			})
	}

	clearCanvas() {
		let clear = (ctx,w,h) => {
			ctx.clearRect(0, 0, w, h);
		}
		clear(this.context[0],this.width,this.height);
		clear(this.context[1],this.width,this.height);
	}
}

class PlaybackBar extends paella.DomNode {

	constructor(id) {
		var style = {};
		super('div',id,style);

		this.playbackFullId = '';
		this.updatePlayBar = true;
		this.timeControlId = '';
		this._images = null;
		this._prev = null;
		this._next = null;
		this._videoLength = null;
		this._lastSrc = null;
		this._aspectRatio = 1.777777778;
		this._hasSlides = null;
		this._imgNode = null;
		this._canvas = null;
		
		this.domElement.className = "playbackBar";
		this.domElement.setAttribute("alt", "");
		//this.domElement.setAttribute("title", "Timeline Slider");
		this.domElement.setAttribute("aria-label", "Timeline Slider");
		this.domElement.setAttribute("role", "slider");
		this.domElement.setAttribute("aria-valuemin", "0");
		this.domElement.setAttribute("aria-valuemax", "100");
		this.domElement.setAttribute("aria-valuenow", "0");
		this.domElement.setAttribute("tabindex", paella.tabIndex.next);
		$(this.domElement).keyup((event) => {
			var currentTime = 0;
			var duration = 0;
			paella.player.videoContainer.currentTime()
				.then((t) => {
					currentTime = t;
					return paella.player.videoContainer.duration();
				})

				.then((d) => {
					duration = d;
					var curr, selectedPosition;
					switch(event.keyCode) {
						case 37: //Left
							curr = 100*currentTime/duration;
							selectedPosition = curr - 5;
							paella.player.videoContainer.seekTo(selectedPosition);
							break;
						case 39: //Right
							curr = 100*currentTime/duration;
							selectedPosition = curr + 5;
							paella.player.videoContainer.seekTo(selectedPosition);
							break;
					}
				});
		});

		this.playbackFullId = id + "_full";
		this.timeControlId = id + "_timeControl";
		var playbackFull = new paella.DomNode('div',this.playbackFullId,{width:'0%'});
		playbackFull.domElement.className = "playbackBarFull";
		this.addNode(playbackFull);
		this.addNode(new paella.TimeControl(this.timeControlId));
		var thisClass = this;
		paella.events.bind(paella.events.timeupdate,function(event,params) { thisClass.onTimeUpdate(params); });
		$(this.domElement).bind('mousedown',function(event) {
			paella.utils.mouseManager.down(thisClass,event); event.stopPropagation();
		});
		$(playbackFull.domElement).bind('mousedown',function(event) {
			paella.utils.mouseManager.down(thisClass,event); event.stopPropagation();
		});
		if (!paella.utils.userAgent.browser.IsMobileVersion) {
			$(this.domElement).bind('mousemove',function(event) {
				thisClass.movePassive(event); paella.utils.mouseManager.move(event);
			});
			$(playbackFull.domElement).bind('mousemove',function(event) {
				paella.utils.mouseManager.move(event);
			});
			$(this.domElement).bind("mouseout",function(event) {
				thisClass.mouseOut(event);
			});
		}
		
		this.domElement.addEventListener('touchstart',(event) => {
			paella.utils.mouseManager.down(thisClass,event); event.stopPropagation();
		}, false);
		this.domElement.addEventListener('touchmove',(event) => {
			thisClass.movePassive(event);
			paella.utils.mouseManager.move(event);
		}, false);
		this.domElement.addEventListener('touchend',(event) => {
			paella.utils.mouseManager.up(event);
			thisClass.clearTimeOverlay();
		}, false);
	
		$(this.domElement).bind('mouseup',function(event) {
			paella.utils.mouseManager.up(event);
		});
		$(playbackFull.domElement).bind('mouseup',function(event) {
			paella.utils.mouseManager.up(event);
		});

		if (paella.player.isLiveStream()) {
			$(this.domElement).hide();
		}

		paella.events.bind(paella.events.seekAvailabilityChanged, (e,data) => {
			if (data.type!=paella.SeekType.DISABLED) {
				$(playbackFull.domElement).removeClass("disabled");
			}
			else {
				$(playbackFull.domElement).addClass("disabled");
			}
		});

		this._canvas = new PlaybackBarCanvas(this.domElement);
	}

	mouseOut(event){
		this.clearTimeOverlay();
	}

	clearTimeOverlay() {
		if(this._hasSlides) {
			$("#divTimeImageOverlay").remove();
		}
		else {
			$("#divTimeOverlay").remove();
		}
	}

	movePassive(event){
		var This = this;

		function updateTimePreview(duration,trimming) {
			// CONTROLS_BAR POSITON
			var p = $(This.domElement);
			var pos = p.offset();

			var width = p.width();
			let clientX = event.touches ? event.touches[0].clientX : event.clientX;
			var left = (clientX-pos.left);
			left = (left < 0) ? 0 : left;
			var position = left * 100 / width; // GET % OF THE STREAM

			var time = position * duration / 100;
			if (trimming.enabled) {
				time += trimming.start;
			}

			var hou = Math.floor((time - trimming.start) / 3600)%24;
			hou = ("00"+hou).slice(hou.toString().length);

			var min = Math.floor((time - trimming.start) / 60)%60;
			min = ("00"+min).slice(min.toString().length);

			var sec = Math.floor((time - trimming.start)%60);
			sec = ("00"+sec).slice(sec.toString().length);

			var timestr = (hou+":"+min+":"+sec);

			// CREATING THE OVERLAY
			if(This._hasSlides) {
				if($("#divTimeImageOverlay").length == 0)
					This.setupTimeImageOverlay(timestr,pos.top,width);
				else {
					$("#divTimeOverlay")[0].innerText = timestr; //IF CREATED, UPDATE TIME AND IMAGE
				}

				// CALL IMAGEUPDATE
				This.imageUpdate(time);
			}
			else {
				if($("#divTimeOverlay").length == 0) {
					This.setupTimeOnly(timestr,pos.top,width);
				}
				else {
					$("#divTimeOverlay")[0].innerText = timestr;
				}
			}

			// UPDATE POSITION IMAGE OVERLAY
			if (This._hasSlides) {
				var ancho = $("#divTimeImageOverlay").width();
				var posx = clientX-(ancho/2);
				if(clientX > (ancho/2 + pos.left)  &&  clientX < (pos.left+width - ancho/2) ) { // LEFT
					$("#divTimeImageOverlay").css("left",posx); // CENTER THE DIV HOVER THE MOUSE
				}
				else if(clientX < width / 2)
					$("#divTimeImageOverlay").css("left",pos.left);
				else
					$("#divTimeImageOverlay").css("left",pos.left + width - ancho);
			}

			// UPDATE POSITION TIME OVERLAY
			var ancho2 = $("#divTimeOverlay").width();
			var posx2 = clientX-(ancho2/2);
			if(clientX > ancho2/2 + pos.left  && clientX < (pos.left+width - ancho2/2) ){
				$("#divTimeOverlay").css("left",posx2); // CENTER THE DIV HOVER THE MOUSE
			}
			else if(clientX < width / 2)
				$("#divTimeOverlay").css("left",pos.left);
			else
				$("#divTimeOverlay").css("left",pos.left + width - ancho2-2);

			if(This._hasSlides) {
				$("#divTimeImageOverlay").css("bottom",$('.playbackControls').height());
			}
		}

		let duration = 0;
		paella.player.videoContainer.duration()
			.then(function(d) {
				duration = d;
				return paella.player.videoContainer.trimming();
			})
			.then(function(trimming) {
				updateTimePreview(duration,trimming);
			});
	}

	imageSetup(){
		return new Promise((resolve) => {
			paella.player.videoContainer.duration()
				.then((duration) => {
					//  BRING THE IMAGE ARRAY TO LOCAL
					this._images = {};
					var n = paella.initDelegate.initParams.videoLoader.frameList;

					if( !n || Object.keys(n).length === 0) {
						this._hasSlides = false;
						return;
					}
					else {
						this._hasSlides = true;
					}


					this._images = n; // COPY TO LOCAL
					this._videoLength = duration;

					// SORT KEYS FOR SEARCH CLOSEST
					this._keys = Object.keys(this._images);
					this._keys = this._keys.sort(function(a, b){return parseInt(a)-parseInt(b);}); // SORT FRAME NUMBERS STRINGS

					//NEXT
					this._next = 0;
					this._prev = 0;

					resolve();
				});
		});
	}

	imageUpdate(sec){
		var src = $("#imgOverlay").attr('src');
		$(this._imgNode).show();
		if(sec > this._next || sec < this._prev) {
			src = this.getPreviewImageSrc(sec);
			if (src) {
				this._lastSrc = src;
				$( "#imgOverlay" ).attr('src', src); // UPDATING IMAGE
			}
			else {
				this.hideImg();
			}
		} // RELOAD IF OUT OF INTERVAL
		else { 	
			if(src!=undefined) {
				return;
			}
			else { 
				$( "#imgOverlay" ).attr('src', this._lastSrc); 
			}// KEEP LAST IMAGE
		}
	}

	hideImg() {
		$(this._imgNode).hide();
	}

	getPreviewImageSrc(sec){
		var keys = Object.keys(this._images);

		keys.push(sec);

		keys.sort(function(a,b){
			return parseInt(a)-parseInt(b);
		});

		var n = keys.indexOf(sec)-1;
		n = (n > 0) ? n : 0;

		var i = keys[n];

		var next = keys[n+2];
		var prev = keys[n];

		next = (next==undefined) ? keys.length-1 : parseInt(next);
		this._next = next;

		prev = (prev==undefined) ? 0 : parseInt(prev);
		this._prev = prev;

		i=parseInt(i);
		if(this._images[i]){
			return this._images[i].url || this._images[i].url;
		}
		else return false;
	}

	setupTimeImageOverlay(time_str,top,width){
		var div = document.createElement("div");
		div.className = "divTimeImageOverlay";
		div.id = ("divTimeImageOverlay");

		var aux = Math.round(width/10);
		div.style.width = Math.round(aux*self._aspectRatio)+"px"; //KEEP ASPECT RATIO 4:3
		//div.style.height = Math.round(aux)+"px";

		if (this._hasSlides) {
			var img = document.createElement("img");
			img.className =  "imgOverlay";
			img.id = "imgOverlay";
			this._imgNode = img;

			div.appendChild(img);
		}


		var div2 = document.createElement("div");
		div2.className = "divTimeOverlay";
		div2.style.top = (top-20)+"px"; 
		div2.id = ("divTimeOverlay");
		div2.innerText = time_str;

		div.appendChild(div2);

		//CHILD OF CONTROLS_BAR
		$(this.domElement).parent().append(div);
	}
	
	setupTimeOnly(time_str,top,width){
		var div2 = document.createElement("div");
		div2.className = "divTimeOverlay";
		div2.style.top = (top-20)+"px"; 
		div2.id = ("divTimeOverlay");
		div2.innerText = time_str;

		//CHILD OF CONTROLS_BAR
		$(this.domElement).parent().append(div2);
	}

	playbackFull() {
		return this.getNode(this.playbackFullId);
	}

	timeControl() {
		return this.getNode(this.timeControlId);
	}

	setPlaybackPosition(percent) {
		this.playbackFull().domElement.style.width = percent + '%';
	}

	isSeeking() {
		return !this.updatePlayBar;
	}

	onTimeUpdate(memo) {
		if (this.updatePlayBar) {
			var currentTime = memo.currentTime;
			var duration = memo.duration;
			this.setPlaybackPosition(currentTime * 100 / duration);
		}
	}

	down(event,x,y) {
		this.updatePlayBar = false;
		this.move(event,x,y);
	}

	move(event,x,y) {
		var width = $(this.domElement).width();
		var selectedPosition = x - $(this.domElement).offset().left; // pixels
		if (selectedPosition<0) {
			selectedPosition = 0;
		}
		else if (selectedPosition>width) {
			selectedPosition = 100;
		}
		else {
			selectedPosition = selectedPosition * 100 / width; // percent
		}
		this.setPlaybackPosition(selectedPosition);
	}

	up(event,x,y) {
		var width = $(this.domElement).width();
		var selectedPosition = x - $(this.domElement).offset().left; // pixels
		if (selectedPosition<0) {
			selectedPosition = 0;
		}
		else if (selectedPosition>width) {
			selectedPosition = 100;
		}
		else {
			selectedPosition = selectedPosition * 100 / width; // percent
		}
		paella.player.videoContainer.seekTo(selectedPosition);
		this.updatePlayBar = true;
	}

	onresize() {
		this.imageSetup();
		let elem = $(this.domElement);
		this._canvas.resize(elem.width(),elem.height());
	}
}

paella.PlaybackBar = PlaybackBar;

class PlaybackControl extends paella.DomNode {

	addPlugin(plugin) {
		var id = 'buttonPlugin' + this.buttonPlugins.length;
		this.buttonPlugins.push(plugin);
		var button = paella.ButtonPlugin.BuildPluginButton(plugin,id);
		button.plugin = plugin;
		let expand = paella.ButtonPlugin.BuildPluginExpand(plugin,id);
		plugin.button = button;
		plugin._expandElement = expand;
		this.pluginsContainer.domElement.appendChild(button);
		if (expand) {
			let This = this;
			$(button).mouseover(function(evt) {
				evt.target.plugin.expand();
				This._expandedPlugin = evt.target.plugin;
			});
			this.pluginsContainer.domElement.appendChild(expand);
		}
		$(button).hide();
		plugin.checkEnabled((isEnabled) => {
			var parent;
			if (isEnabled) {
				$(plugin.button).show();
				paella.pluginManager.setupPlugin(plugin);

				var id = 'buttonPlugin' + this.buttonPlugins.length;
				if (plugin.getButtonType()==paella.ButtonPlugin.type.popUpButton) {
					parent = this.popUpPluginContainer.domElement;
					var popUpContent = paella.ButtonPlugin.BuildPluginPopUp(parent,plugin,id + '_container');
					this.popUpPluginContainer.registerContainer(plugin.getName(),popUpContent,button,plugin);
				}
				else if (plugin.getButtonType()==paella.ButtonPlugin.type.timeLineButton) {
					parent = this.timeLinePluginContainer.domElement;
					var timeLineContent = paella.ButtonPlugin.BuildPluginPopUp(parent, plugin,id + '_timeline');
					this.timeLinePluginContainer.registerContainer(plugin.getName(),timeLineContent,button,plugin);
				}
				else if (plugin.getButtonType()==paella.ButtonPlugin.type.menuButton) {
					parent = this.popUpPluginContainer.domElement;
					var popUpContent = paella.ButtonPlugin.BuildPluginMenu(parent,plugin,id + '_container');
					this.popUpPluginContainer.registerContainer(plugin.getName(),popUpContent,button,plugin);
				}
			}
			else {
				this.pluginsContainer.domElement.removeChild(plugin.button);
			}
		});
	}

	constructor(id) {
		var style = {};
		super('div',id,style);

		this.playbackBarId = '';
		this.pluginsContainer = null;
		this._popUpPluginContainer = null;
		this._timeLinePluginContainer = null;
		this.playbackPluginsWidth = 0;
		this.popupPluginsWidth = 0;
		this.minPlaybackBarSize = 120;
		this.playbackBarInstance = null;
		this.buttonPlugins = [];

		
		this.domElement.className = 'playbackControls';
		this.playbackBarId = id + '_playbackBar';

		var thisClass = this;
		this.pluginsContainer = new paella.DomNode('div',id + '_playbackBarPlugins');
		this.pluginsContainer.domElement.className = 'playbackBarPlugins';
		this.pluginsContainer.domElement.setAttribute("role", "toolbar");
		this.addNode(this.pluginsContainer);

		this.addNode(new paella.PlaybackBar(this.playbackBarId));

		paella.pluginManager.setTarget('button',this);

		$(window).mousemove((evt) => {
			if (this._expandedPlugin && ($(window).height() - evt.clientY)> 50) {
				this._expandedPlugin.contract();
				this._expandPlugin = null;
			}
		});
	}

	get popUpPluginContainer() {
		if (!this._popUpPluginContainer) {
			this._popUpPluginContainer = new paella.PopUpContainer(this.identifier + '_popUpPluginContainer','popUpPluginContainer');
			this.addNode(this._popUpPluginContainer);
		}
		return this._popUpPluginContainer;
	}

	get timeLinePluginContainer() {
		if (!this._timeLinePluginContainer) {
			this._timeLinePluginContainer = new paella.TimelineContainer(this.identifier + '_timelinePluginContainer','timelinePluginContainer');
			this.addNode(this._timeLinePluginContainer);
		}
		return this._timeLinePluginContainer;
	}

	showPopUp(identifier,button,swapFocus=false) {
		this.popUpPluginContainer.showContainer(identifier,button,swapFocus);
		this.timeLinePluginContainer.showContainer(identifier,button,swapFocus);
		this.hideCrossTimelinePopupButtons(identifier,this.popUpPluginContainer,this.timeLinePluginContainer,button,swapFocus);
	}

	// Hide popUpPluginContainer when a timeLinePluginContainer popup opens, and visa versa
	hideCrossTimelinePopupButtons(identifier, popupContainer, timelineContainer, button, swapFocus=true) {
		var containerToHide = null;
		if (popupContainer.containers[identifier]
			&& timelineContainer.containers[timelineContainer.currentContainerId]) {
			containerToHide = timelineContainer;
		} else if (timelineContainer.containers[identifier]
			&& popupContainer.containers[popupContainer.currentContainerId]) {
			containerToHide = popupContainer;
		}
		if (containerToHide) {
			var hideId = containerToHide.currentContainerId;
			var hidePugin = paella.pluginManager.getPlugin(hideId);
			if (hidePugin) {
				containerToHide.hideContainer(hideId,hidePugin.button,swapFocus);
			}
		}
	}

	hidePopUp(identifier,button,swapFocus=true) {
		this.popUpPluginContainer.hideContainer(identifier,button,swapFocus);
		this.timeLinePluginContainer.hideContainer(identifier,button,swapFocus);
	}

	playbackBar() {
		if (this.playbackBarInstance==null) {
			this.playbackBarInstance = this.getNode(this.playbackBarId);
		}
		return this.playbackBarInstance;
	}

	onresize() {
		var windowSize = $(this.domElement).width();
		paella.log.debug("resize playback bar (width=" + windowSize + ")");

		for (var i=0;i<this.buttonPlugins.length;++i) {
			var plugin = this.buttonPlugins[i];
			var minSize = plugin.getMinWindowSize();
			if (minSize > 0 && windowSize < minSize) {
				plugin.hideUI();
			}
			else {
				plugin.checkVisibility();
			}
		}

		this.getNode(this.playbackBarId).onresize();
	}
}

paella.PlaybackControl = PlaybackControl;

class ControlsContainer extends paella.DomNode {
	addPlugin(plugin) {
		var id = 'videoOverlayButtonPlugin' + this.buttonPlugins.length;
		this.buttonPlugins.push(plugin);
		var button = paella.ButtonPlugin.BuildPluginButton(plugin,id);
		this.videoOverlayButtons.domElement.appendChild(button);
		plugin.button = button;
		$(button).hide();
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				$(plugin.button).show();
				paella.pluginManager.setupPlugin(plugin);
			}
		});
	}

	constructor(id) {
		super('div',id);

		this.playbackControlId = '';
		this.editControlId = '';
		this.isEnabled = true;
		this.autohideTimer = null;
		this.hideControlsTimeMillis = 3000;
		this.playbackControlInstance = null;
		this.videoOverlayButtons = null;
		this.buttonPlugins = [];
		this._hidden = false;
		this._over = false;

		this.viewControlId = id + '_view';
		this.playbackControlId = id + '_playback';
		this.editControlId = id + '_editor';
		this.addNode(new paella.PlaybackControl(this.playbackControlId));
		var thisClass = this;
		paella.events.bind(paella.events.showEditor,function(event) { thisClass.onShowEditor(); });
		paella.events.bind(paella.events.hideEditor,function(event) { thisClass.onHideEditor(); });

		paella.events.bind(paella.events.play,function(event) { thisClass.onPlayEvent(); });
		paella.events.bind(paella.events.pause,function(event) { thisClass.onPauseEvent(); });
		$(document).mousemove(function(event) {
			paella.player.controls.restartHideTimer();
		});

		$(this.domElement).bind("mousemove",function(event) { thisClass._over = true; });
		$(this.domElement).bind("mouseout",function(event) { thisClass._over = false; });

		paella.events.bind(paella.events.endVideo,function(event) { thisClass.onEndVideoEvent(); });
		paella.events.bind('keydown',function(event) { thisClass.onKeyEvent(); });

		this.videoOverlayButtons = new paella.DomNode('div',id + '_videoOverlayButtonPlugins');
		this.videoOverlayButtons.domElement.className = 'videoOverlayButtonPlugins';
		this.videoOverlayButtons.domElement.setAttribute("role", "toolbar");
		this.addNode(this.videoOverlayButtons);

		paella.pluginManager.setTarget('videoOverlayButton',this);
	}

	onShowEditor() {
		var editControl = this.editControl();
		if (editControl) $(editControl.domElement).hide();
	}

	onHideEditor() {
		var editControl = this.editControl();
		if (editControl) $(editControl.domElement).show();
	}

	enterEditMode() {
		var playbackControl = this.playbackControl();
		var editControl = this.editControl();
		if (playbackControl && editControl) {
			$(playbackControl.domElement).hide();
		}
	}

	exitEditMode() {
		var playbackControl = this.playbackControl();
		var editControl = this.editControl();
		if (playbackControl && editControl) {
			$(playbackControl.domElement).show();
		}
	}

	playbackControl() {
		if (this.playbackControlInstance==null) {
			this.playbackControlInstance = this.getNode(this.playbackControlId);
		}
		return this.playbackControlInstance;
	}

	editControl() {
		return this.getNode(this.editControlId);
	}

	disable() {
		this.isEnabled = false;
		this.hide();
	}

	enable() {
		this.isEnabled = true;
		this.show();
	}

	isHidden() {
		return this._hidden;
	}

	hide() {
		var This = this;
		this._doHide = true;
		
		function hideIfNotCanceled() {
			if (This._doHide) {
				$(This.domElement).css({opacity:0.0});
				$(This.domElement).hide();
				This.domElement.setAttribute('aria-hidden', 'true');
				This._hidden = true;
				paella.events.trigger(paella.events.controlBarDidHide);
			}
		}

		paella.events.trigger(paella.events.controlBarWillHide);
		if (this._doHide) {
			if (!paella.utils.userAgent.browser.IsMobileVersion && !paella.utils.userAgent.browser.Explorer) {			
				$(this.domElement).animate({opacity:0.0},{duration:300, complete: hideIfNotCanceled});
			}
			else {
				hideIfNotCanceled();
			}		
		}
	}

	showPopUp(identifier) {
		this.playbackControl().showPopUp(identifier);
	}

	hidePopUp(identifier) {
		this.playbackControl().hidePopUp(identifier);
	}

	show() {
		if (this.isEnabled) {
			$(this.domElement).stop();
			this._doHide = false;
			this.domElement.style.opacity = 1.0;
			this.domElement.setAttribute('aria-hidden', 'false');
			this._hidden = false;
			$(this.domElement).show();
			paella.events.trigger(paella.events.controlBarDidShow);
		}
	}

	autohideTimeout() {
		var playbackBar = this.playbackControl().playbackBar();
		if (playbackBar.isSeeking() || this._over) {
			paella.player.controls.restartHideTimer();
		}
		else {
			paella.player.controls.hideControls();
		}
	}

	hideControls() {
		paella.player.videoContainer.paused()
			.then((paused) => {
				if (!paused) {
					this.hide();
				}
				else {
					this.show();
				}
			});
	}

	showControls() {
		this.show();
	}

	onPlayEvent() {
		this.restartHideTimer();
	}

	onPauseEvent() {
		this.clearAutohideTimer();
	}

	onEndVideoEvent() {
		this.show();
		this.clearAutohideTimer();
	}

	onKeyEvent() {
		this.restartHideTimer();
		paella.player.videoContainer.paused()
			.then(function(paused) {
				if (!paused) {
					paella.player.controls.restartHideTimer();
				}
			});
	}

	cancelHideBar() {
		this.restartTimerEvent();
	}

	restartTimerEvent() {
		if (this.isHidden()){
			this.showControls();
		}
		this._doHide = false;
		paella.player.videoContainer.paused((paused) => {
			if (!paused) {
				this.restartHideTimer();
			}
		});
	}

	clearAutohideTimer() {
		if (this.autohideTimer!=null) {
			this.autohideTimer.cancel();
			this.autohideTimer = null;
		}
	}

	restartHideTimer() {
		this.showControls();
		this.clearAutohideTimer();
		var thisClass = this;
		this.autohideTimer = new paella.utils.Timer(function(timer) {
			thisClass.autohideTimeout();
		},this.hideControlsTimeMillis);
	}

	onresize() {
		this.playbackControl().onresize();
	}
}

paella.ControlsContainer = ControlsContainer;


})();
