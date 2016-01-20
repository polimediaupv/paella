Class ("paella.TimeControl", paella.DomNode,{
	initialize:function(id) {
		this.parent('div',id,{left:"0%"});
		this.domElement.className = 'timeControlOld';
		this.domElement.className = 'timeControl';
		//this.domElement.innerHTML = "0:00:00";
		var thisClass = this;
		paella.events.bind(paella.events.timeupdate,function(event,params) { thisClass.onTimeUpdate(params); });
	},

	onTimeUpdate:function(memo) {
		var videoContainer = memo.videoContainer;
		var trimmed = { start:videoContainer.trimStart(), end:videoContainer.trimEnd() };
		var currentTime = memo.currentTime - trimmed.start;
		var duration = trimmed.end - trimmed.start;
		var percent = currentTime * 100 / duration;
		if (this.domElement.className=="timeControlOld") {	// Support for old style time control
			this.domElement.style.left = percent + '%';
		}
		this.domElement.innerHTML = this.secondsToHours(parseInt(currentTime));
	},

	secondsToHours:function(sec_numb) {
		var hours   = Math.floor(sec_numb / 3600);
		var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
		var seconds = sec_numb - (hours * 3600) - (minutes * 60);

		if (hours < 10) {hours = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		return hours + ':' + minutes + ':' + seconds;
	}
});

Class ("paella.PlaybackBar", paella.DomNode,{
	playbackFullId:'',
	updatePlayBar:true,
	timeControlId:'',
	//OVERLAY VARIABLES
	_images:null,
	_keys:null,
	_ant:null,
	_next:null,
	_videoLength:null,
	_lastSrc:null,
	_aspectRatio:1.777777778, // 16:9
	_hasSlides:null,
	_imgNode:null,
	_canvas:null,

	initialize:function(id) {
		var self = this;
		//OVERLAY INITIALIZE
		self.imageSetup();
		//END OVERLAY INITIALIZE

		var style = {};
		this.parent('div',id,style);
		this.domElement.className = "playbackBar";
		this.domElement.setAttribute("alt", "");
		//this.domElement.setAttribute("title", "Timeline Slider");
		this.domElement.setAttribute("aria-label", "Timeline Slider");
		this.domElement.setAttribute("role", "slider");
		this.domElement.setAttribute("aria-valuemin", "0");
		this.domElement.setAttribute("aria-valuemax", "100");
		this.domElement.setAttribute("aria-valuenow", "0");
		this.domElement.setAttribute("tabindex", "1100");
		$(this.domElement).keyup(function(event){
			var curr, selectedPosition;
			switch(event.keyCode) {
				case 37: //Left
					curr = 100*paella.player.videoContainer.currentTime()/paella.player.videoContainer.duration();
					selectedPosition = curr - 5;
					paella.player.videoContainer.seekTo(selectedPosition);
					break;
				case 39: //Right
					curr = 100*paella.player.videoContainer.currentTime()/paella.player.videoContainer.duration();
					selectedPosition = curr + 5;
					paella.player.videoContainer.seekTo(selectedPosition);
					break;
			}
		});

		this.playbackFullId = id + "_full";
		this.timeControlId = id + "_timeControl";
		var playbackFull = new paella.DomNode('div',this.playbackFullId,{width:'0%'});
		playbackFull.domElement.className = "playbackBarFull";
		this.addNode(playbackFull);
		this.addNode(new paella.TimeControl(this.timeControlId));
		var thisClass = this;
		paella.events.bind(paella.events.timeupdate,function(event,params) { thisClass.onTimeUpdate(params); });
		$(this.domElement).bind('mousedown',function(event) { paella.utils.mouseManager.down(thisClass,event); event.stopPropagation(); });
		$(playbackFull.domElement).bind('mousedown',function(event) { paella.utils.mouseManager.down(thisClass,event); event.stopPropagation();  });
		if (!base.userAgent.browser.IsMobileVersion) {
			$(this.domElement).bind('mousemove',function(event) { thisClass.movePassive(event); paella.utils.mouseManager.move(event); });
			$(playbackFull.domElement).bind('mousemove',function(event) { paella.utils.mouseManager.move(event); });
			$(this.domElement).bind("mouseout",function(event) { thisClass.mouseOut(event); });
		}
		$(this.domElement).bind('mouseup',function(event) { paella.utils.mouseManager.up(event); });
		$(playbackFull.domElement).bind('mouseup',function(event) { paella.utils.mouseManager.up(event); });

		if (paella.player.isLiveStream()) {
			$(this.domElement).hide();
		}
		setTimeout(function(){
			self.drawTimeMarks();
		},200);
	},

	mouseOut:function(event){
		if(this._hasSlides)
			$("#divTimeImageOverlay").remove();
		else
			$("#divTimeOverlay").remove();
	},

	drawTimeMarks:function(){
		var self = this;
		var parent = $("#playerContainer_controls_playback_playbackBar");
		this.clearCanvas();
		if (this._keys) {
			this._keys.forEach(function (l) {
				var aux = (parseInt(l) * parent.width()) / self._videoLength; // conversion to canvas
				self.drawTimeMark(parseInt(aux));
			});
		}
	},

	drawTimeMark:function(sec){
		var ht = 12; //default height value
		var ctx = this.getCanvasContext();
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(sec,0,1,ht);	
	},

	clearCanvas:function() {
		if (this._canvas) {
			this._canvas.parentNode.removeChild(this._canvas);
			this._canvas = null;
		}
	},

	getCanvas:function(){
		if (!this._canvas) {
			var parent = $("#playerContainer_controls_playback_playbackBar");
			var canvas = document.createElement("canvas");
			canvas.className = "playerContainer_controls_playback_playbackBar_canvas";
			canvas.id = ("playerContainer_controls_playback_playbackBar_canvas");
			canvas.width = parent.width();
			ht = canvas.height = parent.height();
			parent.prepend(canvas);
			this._canvas = document.getElementById("playerContainer_controls_playback_playbackBar_canvas");
		}
		return this._canvas;
	},

	getCanvasContext:function(){
		return this.getCanvas().getContext("2d");
	},

	movePassive:function(event){
		var playbackBar = $(this.domElement),
			width = playbackBar.width(),
			pos = playbackBar.offset(),
			left = 0;
		
		// Fix position when window is scrolled
		pos.left -= $(window).scrollLeft();
		
		left = event.clientX - pos.left;
		
		// Showtime, Imagetime
		var time = this.calculateTime(left / width),
			timeString = this.timeToTimestamp(time[0]),
			timeImageOverlay = $("#divTimeImageOverlay"),
			timeOverlay = $("#divTimeOverlay");
		
		if (this._hasSlides) {
			if (timeImageOverlay.length === 0) {
				this.setupTimeImageOverlay(timeString,width);
				timeImageOverlay = $("#divTimeImageOverlay");
			}
			
			this.imageUpdate(time[1]);
		}
		else if (timeOverlay.length === 0) {
			this.setupTimeOnly(timeString,width);
			timeOverlay = $("#divTimeOverlay");
		}
		
		timeOverlay.text(timeString);
		
		if(this._hasSlides) {
			var overlayWidth = timeImageOverlay.width();
			var overlayLeft = event.clientX - pos.left - (overlayWidth / 2);
			
			if (overlayLeft < 0) {
				overlayLeft = 0;
			} else if (overlayLeft > (width - overlayWidth)) {
				overlayLeft = width - overlayWidth;
			}
			
			timeImageOverlay.css({
				"left": overlayLeft,
				"bottom": playbackBar.parent().height()
			});
		}
		else{
			var timeWidth = timeOverlay.width();
			var timeLeft = event.clientX - pos.left - (timeWidth / 2);
		
			if (timeLeft < 0) {
				timeLeft = 0;
			} else if (timeLeft > (width - timeWidth)) {
				timeLeft = width - timeWidth;
			}
		
			timeOverlay.css({
				"left": timeLeft,
				"bottom": playbackBar.parent().height()
			});
		}
	},

	calculateTime:function(position){
		if(paella.player.videoContainer.trimEnabled()){
		 	time = paella.player.videoContainer.trimEnd()-paella.player.videoContainer.trimStart();
			time *= position;
			
			return [time, time + paella.player.videoContainer.trimStart()];
		}
		else{
			time = position * paella.player.videoContainer.duration("");
			return [time, time];
		}
	},
	
	timeToTimestamp:function(time){
		var hour = Math.floor(time / 3600) % 24,
			min = Math.floor(time / 60) % 60,
			sec = time % 60;

		hour = ("00"+hour).slice(hour.toString().length);
		min = ("00"+min).slice(min.toString().length);
		sec = ("00"+sec).slice(sec.toString().length);

		return (hour+":"+min+":"+sec);
	},

	imageSetup:function(){
		var self = this;
		
		//  BRING THE IMAGE ARRAY TO LOCAL
		this._images = {};
		var n = paella.initDelegate.initParams.videoLoader.frameList;

		if( !n || Object.keys(n).length === 0) { self._hasSlides = false; return;}
		else self._hasSlides = true;


		this._images = n; // COPY TO LOCAL
		this._videoLength = paella.player.videoContainer.duration(""); // video duration in frames

		// SORT KEYS FOR SEARCH CLOSEST
		this._keys = Object.keys(this._images);
		this._keys = this._keys.sort(function(a, b){return parseInt(a)-parseInt(b);}); // SORT FRAME NUMBERS STRINGS

		//NEXT
		this._next = 0;
		this._ant = 0;
	},

	imageUpdate:function(sec){
		var self = this;

		var src = $("#imgOverlay").attr('src');
		$(self._imgNode).show();
				if(sec > this._next || sec < this._ant) { 
					src = self.returnSrc(sec);
					if(src){
						self._lastSrc = src;
						$( "#imgOverlay" ).attr('src', src); // UPDATING IMAGE
					}
					else self.hideImg();
				} // RELOAD IF OUT OF INTERVAL
					else { 	
						if(src!=undefined) { return; }
						else { 
							$( "#imgOverlay" ).attr('src', self._lastSrc); 
						}// KEEP LAST IMAGE
					}			

				

	},
	hideImg:function(){
		var self = this;
		$(self._imgNode).hide();
	},

	returnSrc:function(sec){
		var thisClass = this;
		var keys = Object.keys(thisClass._images);

		keys.push(sec);

		keys.sort(function(a,b){
			return parseInt(a)-parseInt(b);
		});

		var n = keys.indexOf(sec)-1;
		n = (n > 0) ? n : 0;

		var i = keys[n];

		var next = keys[n+2];
		var ant = keys[n];

		next = (next==undefined) ? keys.length-1 : parseInt(next);
		thisClass._next = next;

		ant = (ant==undefined) ? 0 : parseInt(ant);
		thisClass._ant = ant;

		i=parseInt(i);
		if(thisClass._images[i]){
			return thisClass._images[i].thumb;
		}
		else return false;
	},

	setupTimeImageOverlay:function(time_str,width){
		var self = this;

		var div = document.createElement("div");
		div.className = "divTimeImageOverlay";
		div.id = ("divTimeImageOverlay");

		var aux = Math.round(width/10);
		div.style.width = Math.round(aux*self._aspectRatio)+"px"; //KEEP ASPECT RATIO 4:3
		//div.style.height = Math.round(aux)+"px";

		if(self._hasSlides){
		var img = document.createElement("img");
		img.className =  "imgOverlay";
		img.id = "imgOverlay";
		self._imgNode = img;

		div.appendChild(img);
		}


		var div2 = document.createElement("div");
		div2.className = "divTimeOverlay";
		div2.id = ("divTimeOverlay");
		div2.innerHTML = time_str;

		div.appendChild(div2);

		//CHILD OF CONTROLS_BAR
		$(this.domElement).parent().append(div);
	},
	
	setupTimeOnly:function(time_str,width){
		var div2 = document.createElement("div");
		div2.className = "divTimeOverlay";
		div2.id = ("divTimeOverlay");
		div2.innerHTML = time_str;

		//CHILD OF CONTROLS_BAR
		$(this.domElement).parent().append(div2);
	},

	playbackFull:function() {
		return this.getNode(this.playbackFullId);
	},

	timeControl:function() {
		return this.getNode(this.timeControlId);
	},

	setPlaybackPosition:function(percent) {
		this.playbackFull().domElement.style.width = percent + '%';
	},

	isSeeking:function() {
		return !this.updatePlayBar;
	},

	onTimeUpdate:function(memo) {
		if (this.updatePlayBar) {
			var videoContainer = memo.videoContainer;
			var trimmed = { start:videoContainer.trimStart(), end:videoContainer.trimEnd() };
			var currentTime = memo.currentTime - trimmed.start;
			var duration = trimmed.end - trimmed.start;
			this.setPlaybackPosition(currentTime * 100 / duration);
		}
	},

	down:function(event,x,y) {
		this.updatePlayBar = false;
		this.move(event,x,y);
	},

	move:function(event,x,y) {
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
	},

	up:function(event,x,y) {
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
	},

	onresize:function() {
		this.drawTimeMarks();
	}
});

Class ("paella.PlaybackControl",paella.DomNode,{
	playbackBarId:'',
	pluginsContainer:null,
	_popUpPluginContainer:null,
	_timeLinePluginContainer:null,

	playbackPluginsWidth:0,
	popupPluginsWidth:0,

	minPlaybackBarSize:120,

	playbackBarInstance:null,

	buttonPlugins:[],

	addPlugin:function(plugin) {
		var This = this;

		var id = 'buttonPlugin' + this.buttonPlugins.length;
		this.buttonPlugins.push(plugin);
		var button = paella.ButtonPlugin.buildPluginButton(plugin,id);
		plugin.button = button;
		this.pluginsContainer.domElement.appendChild(button);
		$(button).hide();
		plugin.checkEnabled(function(isEnabled) {
			var parent;
			if (isEnabled) {
				$(plugin.button).show();
				paella.pluginManager.setupPlugin(plugin);

				var id = 'buttonPlugin' + This.buttonPlugins.length;
				if (plugin.getButtonType()==paella.ButtonPlugin.type.popUpButton) {
					parent = This.popUpPluginContainer.domElement;
					var popUpContent = paella.ButtonPlugin.buildPluginPopUp(parent,plugin,id + '_container');
					This.popUpPluginContainer.registerContainer(plugin.getName(),popUpContent,button,plugin);
				}
				else if (plugin.getButtonType()==paella.ButtonPlugin.type.timeLineButton) {
					parent = This.timeLinePluginContainer.domElement;
					var timeLineContent = paella.ButtonPlugin.buildPluginPopUp(parent, plugin,id + '_timeline');
					This.timeLinePluginContainer.registerContainer(plugin.getName(),timeLineContent,button,plugin);
				}
			}
			else {
				This.pluginsContainer.domElement.removeChild(plugin.button);
			}
		});
	},

	initialize:function(id) {
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = 'playbackControls';
		this.playbackBarId = id + '_playbackBar';

		var thisClass = this;
		this.pluginsContainer = new paella.DomNode('div',id + '_playbackBarPlugins');
		this.pluginsContainer.domElement.className = 'playbackBarPlugins';
		this.pluginsContainer.domElement.setAttribute("role", "toolbar");
		this.addNode(this.pluginsContainer);

		this.addNode(new paella.PlaybackBar(this.playbackBarId));

		paella.pluginManager.setTarget('button',this);

		Object.defineProperty(
				this,
				"popUpPluginContainer",
				{
					get: function() {
						if (!this._popUpPluginContainer) {
							this._popUpPluginContainer = new paella.PopUpContainer(id + '_popUpPluginContainer','popUpPluginContainer');
							this.addNode(this._popUpPluginContainer);
						}
						return this._popUpPluginContainer;
					}
				}
		);

		Object.defineProperty(
				this,
				"timeLinePluginContainer",
				{
					get: function() {
						if (!this._timeLinePluginContainer) {
							this._timeLinePluginContainer = new paella.TimelineContainer(id + '_timelinePluginContainer','timelinePluginContainer');
							this.addNode(this._timeLinePluginContainer);
						}
						return this._timeLinePluginContainer;
					}
				}
		);
	},

	showPopUp:function(identifier,button) {
		this.popUpPluginContainer.showContainer(identifier,button);
		this.timeLinePluginContainer.showContainer(identifier,button);
	},

	hidePopUp:function(identifier,button) {
		this.popUpPluginContainer.hideContainer(identifier,button);
		this.timeLinePluginContainer.hideContainer(identifier,button);
	},

	playbackBar:function() {
		if (this.playbackBarInstance==null) {
			this.playbackBarInstance = this.getNode(this.playbackBarId);
		}
		return this.playbackBarInstance;
	},

	onresize:function() {
		var windowSize = $(this.domElement).width();
		base.log.debug("resize playback bar (width=" + windowSize + ")");

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
});

Class ("paella.ControlsContainer", paella.DomNode,{
	playbackControlId:'',
	editControlId:'',
	isEnabled:true,

	autohideTimer:null,
	hideControlsTimeMillis:3000,

	playbackControlInstance:null,

	videoOverlayButtons:null,

	buttonPlugins:[],
	
	_hidden:false,

	addPlugin:function(plugin) {
		var thisClass = this;
		var id = 'videoOverlayButtonPlugin' + this.buttonPlugins.length;
		this.buttonPlugins.push(plugin);
		var button = paella.ButtonPlugin.buildPluginButton(plugin,id);
		this.videoOverlayButtons.domElement.appendChild(button);
		plugin.button = button;
		$(button).hide();
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				$(plugin.button).show();
				paella.pluginManager.setupPlugin(plugin);
			}
		});
	},

	initialize:function(id) {
		this.parent('div',id);
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
			paella.player.controls.restartTimerEvent();
		});
		paella.events.bind(paella.events.endVideo,function(event) { thisClass.onEndVideoEvent(); });
		paella.events.bind('keydown',function(event) { thisClass.onKeyEvent(); });

		this.videoOverlayButtons = new paella.DomNode('div',id + '_videoOverlayButtonPlugins');
		this.videoOverlayButtons.domElement.className = 'videoOverlayButtonPlugins';
		this.videoOverlayButtons.domElement.setAttribute("role", "toolbar");
		this.addNode(this.videoOverlayButtons);

		paella.pluginManager.setTarget('videoOverlayButton',this);
	},

	onShowEditor:function() {
		var editControl = this.editControl();
		if (editControl) $(editControl.domElement).hide();
	},

	onHideEditor:function() {
		var editControl = this.editControl();
		if (editControl) $(editControl.domElement).show();
	},

//	showEditorButton:function() {
//		this.addNode(new EditControl(this.editControlId));
//	},

	enterEditMode:function() {
		var playbackControl = this.playbackControl();
		var editControl = this.editControl();
		if (playbackControl && editControl) {
			$(playbackControl.domElement).hide();
		}
	},

	exitEditMode:function() {
		var playbackControl = this.playbackControl();
		var editControl = this.editControl();
		if (playbackControl && editControl) {
			$(playbackControl.domElement).show();
		}
	},

	playbackControl:function() {
		if (this.playbackControlInstance==null) {
			this.playbackControlInstance = this.getNode(this.playbackControlId);
		}
		return this.playbackControlInstance;
	},

	editControl:function() {
		return this.getNode(this.editControlId);
	},

	disable:function() {
		this.isEnabled = false;
		this.hide();
	},

	enable:function() {
		this.isEnabled = true;
		this.show();
	},

	isHidden:function() {
		return this._hidden;
	},

	hide:function() {
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
		if (This._doHide) {
			if (!base.userAgent.browser.IsMobileVersion && !base.userAgent.browser.Explorer) {			
				$(this.domElement).animate({opacity:0.0},{duration:300, complete: hideIfNotCanceled});
			}
			else {
				hideIfNotCanceled();
			}		
		}
	},

	showPopUp:function(identifier) {
		this.playbackControl().showPopUp(identifier);
	},

	hidePopUp:function(identifier) {
		this.playbackControl().hidePopUp(identifier);
	},

	show:function() {
		if (this.isEnabled) {
			$(this.domElement).stop();
			this._doHide = false;
			this.domElement.style.opacity = 1.0;
			this.domElement.setAttribute('aria-hidden', 'false');
			this._hidden = false;
			$(this.domElement).show();
			paella.events.trigger(paella.events.controlBarDidShow);
		}
	},

	autohideTimeout:function() {
		var playbackBar = this.playbackControl().playbackBar();
		if (playbackBar.isSeeking()) {
			paella.player.controls.restartHideTimer();
		}
		else {
			paella.player.controls.hideControls();
		}
	},

	hideControls:function() {
		this.hide();
	},

	showControls:function() {
		this.show();
	},

	onPlayEvent:function() {
		this.restartHideTimer();
	},

	onPauseEvent:function() {
		this.clearAutohideTimer();
	},

	onEndVideoEvent:function() {
		this.show();
		this.clearAutohideTimer();
	},

	onKeyEvent:function() {
		this.showControls();
		if (paella.player.videoContainer.isReady() && !paella.player.videoContainer.paused()) {
			paella.player.controls.restartHideTimer();
		}
	},

	cancelHideBar:function() {
		this.restartTimerEvent();
	},

	restartTimerEvent:function() {
		if (this.isHidden()){
			this.showControls();
		}
		this._doHide = false;
		var paused = paella.player.videoContainer.paused();
		if (!paused) {
			this.restartHideTimer();
		}
	},

	clearAutohideTimer:function() {
		if (this.autohideTimer!=null) {
			this.autohideTimer.cancel();
			this.autohideTimer = null;
		}
	},

	restartHideTimer:function() {
		this.clearAutohideTimer();
		var thisClass = this;
		this.autohideTimer = new base.Timer(function(timer) {
			thisClass.autohideTimeout();
		},this.hideControlsTimeMillis);
	},

	onresize:function() {
		this.playbackControl().onresize();
	}
});
