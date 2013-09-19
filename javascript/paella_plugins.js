
paella.editor.ToolStatusPlugin = Class.create(paella.editor.RightBarPlugin,{
	currentTrack:null,
	currentTextField:null,
	trackItemContainer:null,
	selectedColor:"rgb(255, 255, 236)",
	
	initialize:function() {
		this.parent();
		if (paella.utils.language()=='es') {
			var esDict = {
				'Tool':'Herramienta',
				'Selected tool':'Herramienta seleccionada',
				'this track does not contain any item':'esta pista no contiene ningún elemento',
				'Click on timeline outside any track to select current playback time.':'Haz clic en el fondo de la línea de tiempo para establecer el instante actual de reproducción',
				'Quick help':'Ayuda rápida',
				'item':'elemento',
				'items':'elementos',
				'from':'desde',
				'to':'hasta'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getIndex:function() {
		return 10000;
	},
	
	getName:function() {
		return "toolStatusPlugin";
	},
	
	getTabName:function() {
		return paella.dictionary.translate("Tool");
	},
	
	getContent:function() {
		this.currentTextField = null;
		var elem = document.createElement('div');
		if (this.currentTrack) {
			elem.innerHTML = "<h6>" + paella.dictionary.translate("Tool") + ": " + paella.dictionary.translate(this.currentTrack.getTrackName()) + "</h6>";
			var trackList = this.currentTrack.getTrackItems();
			var trackContainer = document.createElement('div');
			trackContainer.className = "editorPluginToolStatus_trackItemList";
			this.trackItemContainer = trackContainer;
			for (var i=0;i<trackList.length;++i) {
				this.addTrackData(trackContainer,trackList[i]);
			}
			elem.appendChild(trackContainer);
		}
		else {
			elem.innerHTML = "<h6>" + paella.dictionary.translate("Tool") + ": " + paella.dictionary.translate("Selection") + "</h6>";
			
		}
		
		this.addToolHelp(elem);
		
		return elem;
	},
	
	addTrackData:function(parent,track) {
		var trackData = document.createElement('div');
		//trackData.innerHTML = track.id + " s:" + track.s + ", e:" + track.e;
		var trackTime = document.createElement('div');
		var duration = Math.round((track.e - track.s) * 100) / 100;
		trackTime.innerHTML = paella.dictionary.translate('from') + ' ' + paella.utils.timeParse.secondsToTime(track.s) + ' ' +
							  paella.dictionary.translate('to') + ' ' + paella.utils.timeParse.secondsToTime(track.e) + ', ' +
							  duration + ' sec';
		trackData.appendChild(trackTime); 
		if (track.content) {
			this.addTrackContent(trackData,track.id,track.content,track.s,track.e);
		}
		parent.appendChild(trackData);
	},
	
	addTrackContent:function(parent,id,content,start,end) {
		var contentElem = null;
		var thisClass = this;
		if (this.currentTrack.allowEditContent()) {
			contentElem = document.createElement('input');
			contentElem.setAttribute('type', 'text');
			contentElem.setAttribute('id','trackContentEditor_' + id);
			contentElem.setAttribute('value',content);
			contentElem.trackData = {id:id,content:content,s:start,e:end};
			contentElem.plugin = this.currentTrack;
			$(contentElem).change(function(event) {
				this.plugin.onTrackContentChanged(this.trackData.id,$(this).val());
				paella.editor.instance.bottomBar.timeline.rebuildTrack(this.plugin.getName());
			});
			$(contentElem).click(function(event) {
				thisClass.onFocusChanged(this,this.plugin,this.trackData);
			});
			$(contentElem).focus(function(event) {
				thisClass.onFocusChanged(this,this.plugin,this.trackData);
			});
			
			var selectedTrackItemId = paella.editor.instance.bottomBar.timeline.currentTrackList.currentTrack.trackInfo.trackData.id;
			if (selectedTrackItemId==id) {
				this.currentTextField = contentElem;
				this.currentTextField.style.backgroundColor = this.selectedColor;
			}
		}
		else {
			contentElem = document.createElement('input');
			contentElem.setAttribute('type', 'text');
			contentElem.setAttribute('id',id);
			contentElem.setAttribute('disabled','disabled');
			contentElem.setAttribute('style','color:rgb(119, 119, 119)');
			contentElem.setAttribute('value',content);
		}
		
		
		parent.appendChild(contentElem);
	},
	
	onFocusChanged:function(field,plugin,trackData) {
		if (this.currentTextField) {
			this.currentTextField.style.backgroundColor = "#fff";
		}
		field.style.backgroundColor = this.selectedColor;
		paella.editor.instance.bottomBar.timeline.focusTrackListItem(plugin.getName(),trackData.id);
		this.currentTextField = field;
		
		// Set the timeline position at the end of this track item
		var time = trackData.e;
		$(document).trigger(paella.events.seekToTime,{time:time});
	},
	
	onLoadFinished:function() {
		if (this.currentTextField) {
			this.trackItemContainer.scrollTop = $(this.currentTextField).position().top;
		}
	},
		
	addToolHelp:function(parent) {
		var helpText = "";
		if (this.currentTrack) {
			helpText = this.currentTrack.contextHelpString();
		}
		else {
			helpText = paella.dictionary.translate("Click on timeline outside any track to select current playback time.");
		}
		
		if (helpText!="") {
			var helpElem = document.createElement('div');
			helpElem.className = "editorPluginToolStatusHelp";
			parent.appendChild(helpElem);
			helpElem.innerHTML = '<strong>' + paella.dictionary.translate('Quick help') + ': </strong>' + helpText;
		}		
	},
	
	onTrackSelected:function(newTrack) {
		this.currentTrack = newTrack;
	}
});

new paella.editor.ToolStatusPlugin();



paella.editor.ConsolidatePlugin = Class.create(paella.editor.RightBarPlugin,{
	getIndex:function() {
		return 10001;
	},
	
	getName:function() {
		return "consolidatePlugin";
	},
	
	getTabName:function() {
		return "Consolidate";
	},
	
	getContent:function() {
		var elem = document.createElement('div');
		elem.innerHTML = "Consolidate video";
		
		elem.innerHTML += '<div><label for="title">Title:</label><input type="text" value="title" id="title"></div>';
		elem.innerHTML += '<div><label for="author">Author:</label><input type="text" value="author" id="title"></div>';
		elem.innerHTML += '<div><label for="serie">Serie:</label><input type="text" value="serie" id="title"></div>';
		
		elem.innerHTML += '<div><input type="button" value="Consolidate"></div>';
		
		return elem;
	}
});

new paella.editor.ConsolidatePlugin();


/*

paella.editor.CaptionsPlugin = Class.create(paella.editor.TrackPlugin,{
	tracks:[],
	selectedTrackItem:null,

	initialize:function() {
		this.parent();
		if (paella.utils.language()=="es") {
			var esDict = {
				'Captions':'Subtítulos'
			};
			paella.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		for (var i=0;i<this.tracks.length;++i) {
			this.tracks[i].name = this.tracks[i].content;
		}
		return this.tracks;
	},
	
	getTools:function() {
		return [
			{name:'create',label:paella.dictionary.translate('Create'),hint:paella.dictionary.translate('Create a new caption in the current position')},
			{name:'delete',label:paella.dictionary.translate('Delete'),hint:paella.dictionary.translate('Delete selected caption')}
		];
	},
	
	getTrackItemIndex:function(item) {
		for(var i=0;i<this.tracks.length;++i) {
			if (item.id==this.tracks[i].id) {
				return i;
			}
		}
		return -1;
	},

	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			this.tracks.splice(this.getTrackItemIndex(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			var start = paella.player.videoContainer.currentTime();
			var end = start + 60;
			var id = this.getTrackUniqueId();
			this.tracks.push({id:id,s:start,e:end,content:paella.dictionary.translate('Caption')});
			return true;
		}
	},
	
	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},
	
	getName:function() {
		return "trackCaptions";
	},
	
	getTrackName:function() {
		return paella.dictionary.translate("Captions");
	},
	
	getColor:function() {
		return 'rgb(212, 212, 224)';
	},
	
	getTextColor:function() {
		return 'rgb(90,90,90)';
	},
	
	onTrackChanged:function(id,start,end) {
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},
	
	onTrackContentChanged:function(id,content) {
		var item = this.getTrackItem(id);
		if (item) {
			item.content = content;
			item.name = content;
		}
	},
	
	allowEditContent:function() {
		return true;
	},
	
	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},
	
	contextHelpString:function() {
		if (paella.utils.language()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar subtítulos. Para crear un subtítulo, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los subtítulos";
		}
		else {
			return "Use this tool to create, delete and edit video captions. To create a caption, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the caption text.";
		}
	}
});

paella.editor.captionsPlugin = new paella.editor.CaptionsPlugin();
*/







paella.plugins.FrameControlPlugin = Class.create(paella.ButtonPlugin,{
	frames:null,
	highResFrames:null,
	currentFrame:null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "frameControl"; },
	getIndex:function() { return 100; },
	getMinWindowSize:function() { return 400; },
	getName:function() { return "FrameControlPlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.timeLineButton; },

	checkEnabled:function(onSuccess) {
		onSuccess(paella.initDelegate.initParams.videoLoader.frameList!=null &&
				  paella.initDelegate.initParams.videoLoader.streams.length>=2);
	},

	buildContent:function(domElement) {
		this.frames = [];
		var container = document.createElement('div');
		container.className = 'frameControlContainer';
		var content = document.createElement('div');
		content.className = 'frameControlContent';
		var frame = this.getFrame(null);
		
		domElement.appendChild(container);
		container.appendChild(content);
		content.appendChild(frame);
		
		var itemWidth = $(frame).outerWidth(true);
		content.innerHTML = '';
		
		var frames = paella.initDelegate.initParams.videoLoader.frameList;
		if (frames) {
			var numFrames = 0;
			for (var key in frames) {
				var frameItem = this.getFrame(frames[key]);
				content.appendChild(frameItem,'frameContrlItem_' + numFrames);
				this.frames.push(frameItem);
				++numFrames;
			}
		}
		
		$(content).css({width:(numFrames * itemWidth) + 'px'});
		
		var This = this;
		paella.events.bind(paella.events.setTrim,function(event,params) {
			This.checkVisibility(params.trimEnabled,params.trimStart,params.trimEnd);
		});
		
		paella.events.bind(paella.events.timeupdate,function(event,params) { This.onTimeUpdate(params.currentTime) });
		
		this.checkHighResFrames();
	},
	
	checkHighResFrames:function() {
		var slidesStream = paella.initDelegate.initParams.videoLoader.streams.length>=2 ? paella.initDelegate.initParams.videoLoader.streams[1]:null;
		if (slidesStream && slidesStream.sources.image) {
			this.highResFrames = {};
			for (var key in slidesStream.sources.image.frames) {
				var src = slidesStream.sources.image.frames[key];
				this.highResFrames[key] = src;
			}
		}
	},
	
	showHiResFrame:function(url) {
		var frameRoot = document.createElement("div"); 
		var frame = document.createElement("div"); 
		var hiResImage = document.createElement('img'); 
        hiResImage.className = 'frameHiRes';
        hiResImage.setAttribute('src',url);
        hiResImage.setAttribute('style', 'width: 100%;');

		$(frame).append(hiResImage);
		$(frameRoot).append(frame);

        frameRoot.setAttribute('style', 'display: table;');
        frame.setAttribute('style', 'display: table-cell; vertical-align:middle;');
		overlayContainer = paella.player.videoContainer.overlayContainer;
		
		var streams = paella.initDelegate.initParams.videoLoader.streams;
		if (streams.length == 1){
			overlayContainer.addElement(frameRoot, overlayContainer.getMasterRect());
		}
		else if (streams.length >= 2){
			overlayContainer.addElement(frameRoot, overlayContainer.getSlaveRect());
		}
		overlayContainer.enableBackgroundMode();
		this.hiResFrame = frameRoot;
	},

	removeHiResFrame:function() {
		overlayContainer = paella.player.videoContainer.overlayContainer;
		overlayContainer.removeElement(this.hiResFrame);
		overlayContainer.disableBackgroundMode();
	},
	
	checkVisibility:function(trimEnabled,trimStart,trimEnd) {
		if (!trimEnabled) {
			for (var i = 0; i<this.frames.length;++i) {
				$(this.frames[i]).show();
			}
		}
		else {
			for (var i = 0; i<this.frames.length; ++i) {
				var frameElem = this.frames[i];
				var frameData = frameElem.frameData;
				if (frameData.time<trimStart) {
					if (this.frames.length>i+1 && this.frames[i+1].frameData.time>trimStart) {
						$(frameElem).show();
					}
					else {
						$(frameElem).hide();
					}
				}
				else if (frameData.time>trimEnd) {
					$(frameElem).hide();
				}
				else {
					$(frameElem).show();
				}
			}	
		}
	},
	
	getFrame:function(frameData,id) {
		var frame = document.createElement('div');
		frame.className = 'frameControlItem';
		if (id) frame.id = id;
		if (frameData) {
			frame.frameData = frameData;
			frame.frameControl = this;
			frame.innerHTML = '<img src="' + frameData.url + '" alt="" class="frameControlImage"></img>';
			$(frame).mouseover(function(event) {
				this.frameControl.onMouseOver(event,this.frameData);
			});
			$(frame).mouseout(function(event) {
				this.frameControl.onMouseOut(event,this.frameData);
			});
			$(frame).click(function(event) {
				this.frameControl.onClick(event,this.frameData);
			});
		}
		return frame;
	},
	
	onMouseOver:function(event,frameData) {
		if (this.highResFrames) {
			var hRes = this.highResFrames['frame_' + frameData.time];
			if (hRes) {
				this.showHiResFrame(hRes);
			}
		}
	},
	
	onMouseOut:function(event,frameData) {
		this.removeHiResFrame();
	},
	
	onClick:function(event,frameData) {
		paella.events.trigger(paella.events.seekToTime,{time:frameData.time + 1});
	},
	
	onTimeUpdate:function(currentTime) {
		var frame = null;
		for (var i = 0; i<this.frames.length; ++i) {
			if (this.frames[i].frameData.time<=currentTime) {
				frame = this.frames[i];
			}
			else {
				break;
			}
		}
		if (this.currentFrame!=frame) {
			if (this.currentFrame) this.currentFrame.className = 'frameControlItem';
			this.currentFrame = frame;
			this.currentFrame.className = 'frameControlItem current';
		}
	}
});



paella.plugins.frameControlPlugin = new paella.plugins.FrameControlPlugin();



paella.plugins.PlayPauseButtonPlugin = Class.create(paella.ButtonPlugin, {
	playSubclass:'playButton',
	pauseSubclass:'pauseButton',
	
	getAlignment:function() { return 'left'; },
	getSubclass:function() { return this.playSubclass; },
	getName:function() { return "PlayPauseButtonPlugin"; },
	
	setup:function() {
		var This = this;
		paella.events.bind(paella.events.play,function(event) { This.changeSubclass(This.pauseSubclass); });
		paella.events.bind(paella.events.pause,function(event) { This.changeSubclass(This.playSubclass); });
	},

	action:function(button) {
		if (paella.player.videoContainer.paused()) {
			paella.events.trigger(paella.events.play);
		}
		else {		
			paella.events.trigger(paella.events.pause);
		}
	}
});

paella.plugins.playPauseButtonPlugn = new paella.plugins.PlayPauseButtonPlugin();

/*paella.plugins.PlayPauseButtonPlugin = Class.create(paella.PlaybackControlPlugin,{
	playId:'',
	pauseId:'',
	containerId:'',
	container:null,

	getRootNode:function(id) {
		this.playId = id + '_playButton';
		this.pauseId = id + '_pauseButton';
		this.containerId = id + '_container';
		var playPauseContainer = new paella.DomNode('div',this.containerId,{position:'absolute'});
		this.container = playPauseContainer;

		var thisClass = this;
		playPauseContainer.addNode(new paella.Button(this.playId,'playButton',function(event) { thisClass.playButtonClick(); },false));
		var pauseButton = new paella.Button(this.pauseId,'pauseButton',function(event) { thisClass.pauseButtonClick(); },false);
		playPauseContainer.addNode(pauseButton);
		$(pauseButton.domElement).hide();
		
		$(document).bind(paella.events.endVideo,function(event) {
			thisClass.playButton().show();
			thisClass.pauseButton().hide();
		});
		
		$(document).bind(paella.events.play,function() {
			thisClass.onPlay();
		});
		$(document).bind(paella.events.pause,function() {
			thisClass.onPause();
		});

		return playPauseContainer;		
	},
	
	setLeftPosition:function(position) {
		this.container.domElement.style.left = position + 'px';
	},
	
	getWidth:function() {
		return 50;
	},
	
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	getIndex:function() {
		return 0;
	},
	
	getName:function() {
		return "PlayPauseButtonPlugin";
	},

	playButton:function() {
		return this.container.getNode(this.playId);
	},

	pauseButton:function() {
		return this.container.getNode(this.pauseId);
	},
	
	playButtonClick:function() {
		this.playButton().hide();
		this.pauseButton().show();
		$(document).trigger(paella.events.play);
	},

	pauseButtonClick:function() {
		this.playButton().show();
		this.pauseButton().hide();
		$(document).trigger(paella.events.pause);
	},
	
	onPlay:function() {
		if (this.playButton()) {
			this.playButton().hide();
			this.pauseButton().show();			
		}
	},
	
	onPause:function() {
		if (this.playButton()) {
			this.playButton().show();
			this.pauseButton().hide();			
		}
	}
});

paella.plugins.playPauseButtonPlugin = new paella.plugins.PlayPauseButtonPlugin();
*/

paella.plugins.PlayButtonOnScreen = Class.create(paella.EventDrivenPlugin,{
	containerId:'paella_plugin_PlayButtonOnScreen',
	container:null,
	enabled:true,
	isPlaying:false,

	initPlugin:function() {
		this.container = document.createElement('div');
		this.container.className = "playButtonOnScreen";
		this.container.id = this.containerId;
		paella.player.videoContainer.domElement.appendChild(this.container);
		var thisClass = this;
		$(this.container).click(function(event){thisClass.onPlayButtonClick()});
		
		var icon = document.createElement('canvas');
		icon.className = "playButtonOnScreenIcon";
		icon.setAttribute("width", 300);
		icon.setAttribute("height",300);
		var ctx = icon.getContext('2d');
		
		ctx.beginPath();
		ctx.arc(150,150,140,0,2*Math.PI,true);
		ctx.closePath();
		
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 10;
		ctx.stroke();
		ctx.fillStyle = '#8f8f8f';
		ctx.fill();
		
		ctx.beginPath();
		ctx.moveTo(100,70);
		ctx.lineTo(250,150);
		ctx.lineTo(100,230);
		ctx.lineTo(100,70);
		ctx.closePath();
		ctx.fillStyle = 'white';
		ctx.fill();

		ctx.stroke();

		this.container.appendChild(icon);
	},
	
	getEvents:function() {
		return [paella.events.endVideo,paella.events.play,paella.events.pause,paella.events.showEditor,paella.events.hideEditor,paella.events.loadComplete];
	},
	
	onEvent:function(eventType,params) {
		switch (eventType) {
			case paella.events.loadComplete:
				this.initPlugin();
				break;
			case paella.events.endVideo:
				this.endVideo();
				break;
			case paella.events.play:
				this.play();
				break;
			case paella.events.pause:
				this.pause();
				break;
			case paella.events.showEditor:
				this.showEditor();
				break;
			case paella.events.hideEditor:
				this.hideEditor();
				break;
		}
	},
	
	onPlayButtonClick:function() {
		$(document).trigger(paella.events.play);
	},
	
	endVideo:function() {
		this.isPlaying = false;
		this.checkStatus();
	},
	
	play:function() {
		this.isPlaying = true;
		this.checkStatus();
	},
	
	pause:function() {
		this.isPlaying = false;
		this.checkStatus();
	},
	
	showEditor:function() {
		this.enabled = false;
		this.checkStatus();
	},
	
	hideEditor:function() {
		this.enabled = true;
		this.checkStatus();
	},
	
	checkStatus:function() {
		if ((this.enabled && this.isPlaying) || !this.enabled) {
			$(this.container).hide();
		}
		else {
			$(this.container).show();
		}
	},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},
	
	getIndex:function() {
		return 1010;
	},
	
	getName:function() {
		return "PlayButtonOnScreen";
	}
});

new paella.plugins.PlayButtonOnScreen();


paella.plugins.ViewModePlugin = Class.create(paella.ButtonPlugin,{
	buttonItems:null,

	getAlignment:function() { return 'right'; },
	getSubclass:function() { return "showViewModeButton"; },
	getIndex:function() { return 101; },
	getMinWindowSize:function() { return 300; },
	getName:function() { return "ViewModePlugin"; },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.videoContainer.isMonostream);
	},

	buildContent:function(domElement) {
		var thisClass = this;
		this.buttonItems = {};
		paella.Profiles.loadProfileList(function(profiles) {
			for (var profile in profiles) {
				var profileData = profiles[profile];
				var buttonItem = thisClass.getProfileItemButton(profile,profileData);
				thisClass.buttonItems[profile] = buttonItem;
				domElement.appendChild(buttonItem);
			}
		});
	},
	
	getProfileItemButton:function(profile,profileData) {
		var elem = document.createElement('div');
		elem.className = this.getButtonItemClass(profile,false);
		elem.id = profile + '_button';
		elem.data = {
			profile:profile,
			profileData:profileData,
			plugin:this
		}
		$(elem).click(function(event) {
			this.data.plugin.onItemClick(this,this.data.profile,this.data.profileData);
		});
		return elem;
	},
	
	onItemClick:function(button,profile,profileData) {
		var prevButtonItem = this.buttonItems[paella.player.selectedProfile];
		var nextButtonItem = this.buttonItems[profile];
		
		if (nextButtonItem && prevButtonItem!=nextButtonItem) {
			prevButtonItem.className = this.getButtonItemClass(paella.player.selectedProfile,false);
			nextButtonItem.className = this.getButtonItemClass(profile,true);
			paella.events.trigger(paella.events.setProfile,{profileName:profile});
			paella.events.trigger(paella.events.hidePopUp,{identifier:this.getName()});
		}
	},
	
	getButtonItemClass:function(profileName,selected) {
		return 'viewModeItemButton ' + profileName  + ((selected) ? ' selected':'');
	}
});

paella.plugins.viewModePlugin = new paella.plugins.ViewModePlugin();

/*
var ProfileItemButton = Class.create(paella.DomNode,{
	viewModePlugin:null,

	initialize:function(icon,profileName,viewModePlugin) {
		this.parent('div',profileName + '_button',{display:'block',backgroundImage:'url(' + icon + ')',width:'78px',height:'41px'});
		this.viewModePlugin = viewModePlugin;

		var thisClass = this;
		$(this.domElement).click(function(event) {
			var currentProfileName = paellaPlayer.selectedProfile;
			if (profileName!=currentProfileName) {
				var currentButtonId = currentProfileName + '_button';
				var currentButton = $('#' + currentButtonId);
				$(currentButton).css({'background-position':'0px 0px'});
				var newButtonId = profileName + '_button';
				var newButton = $('#' + newButtonId);
				$(newButton).css({'background-position':'-78px 0px'});
//				paellaPlayer.setProfile(profileName);
				$(document).trigger(paella.events.setProfile,{profileName:profileName});
				if (thisClass.viewModePlugin) {
					$(thisClass.viewModePlugin.viewModeContainer.domElement).hide();
					thisClass.viewModePlugin.button.toggle();
				}
			}
		});
	}
	
paella.plugins.ViewModePlugin = Class.create(paella.PlaybackPopUpPlugin,{
	viewModeContainer:'',
	button:'',

	getRootNode:function(id) {
		var thisClass = this;
		this.button = new paella.Button(id + '_view_mode_button','showViewModeButton',function(event) { thisClass.viewModePress(); },true);
		return this.button;
	},
	
	getWidth:function() {
		return 45;
	},
	
	setRightPosition:function(position) {
		this.button.domElement.style.right = position + 'px';
	},
	
	getPopUpContent:function(id) {
		var thisClass = this;
		this.viewModeContainer = new paella.DomNode('div',id + '_viewmode_container',{display:'none'});
		paella.Profiles.loadProfileList(function(profiles) {
			for (var profile in profiles) {
				var profileData = profiles[profile];
				var imageUrl = 'config/profiles/resources/' + profileData.icon;
				thisClass.viewModeContainer.addNode(new ProfileItemButton(imageUrl,profile,thisClass));

				// Profile icon preload
				var image = new Image();
				image.src = imageUrl;
			}
		});
		return this.viewModeContainer;
	},
	
	viewModePress:function() {
		if (this.button.isToggled()) {
			$(this.viewModeContainer.domElement).show();
		}
		else {
			$(this.viewModeContainer.domElement).hide();
		}
	},
	
	checkEnabled:function(onSuccess) {
		onSuccess(!paella.player.videoContainer.isMonostream);
	},
	
	getIndex:function() {
		return 101;
	},
	
	getName:function() {
		return "ViewModePlugin";
	},
	
	getMinWindowSize:function() {
		return 500;
	}
});

new paella.plugins.ViewModePlugin();
*/



