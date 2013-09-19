paella.editor.Tabbar = Class.create({
	navbar:null,
	container:null,
	
	initialize:function(parent) {
		this.navbar = bootstrapUtils.navbar("","navbar-inverse");
		parent.appendChild(this.navbar);
		this.container = $(this.navbar).find(".navbar-inner")[0];
	}
});

paella.editor.Toolbar = Class.create({
	navbar:null,
	container:null,
	toolButton:null,
	selectedToolUtils:null,
	editorMenu:null,
	toolbarPlugins:null,

	initialize:function(parent) {
		this.navbar = bootstrapUtils.navbar("","navbar-inverse");
		parent.appendChild(this.navbar);
		this.container = $(this.navbar).find(".navbar-inner")[0];
		this.buildTrackTools();
		this.buildPlaybackControls();
		this.buildEditorMenu();
		this.buildPlugins();
	},
	
	buildTrackTools:function() {
		var selectionTrackName = paella.dictionary.translate("Selection");
		var tools = {};
		tools[selectionTrackName] = "paella.editor.instance.bottomBar.toolbar.onToolChanged('select','" + selectionTrackName + "')";
		var trackPlugins = paella.editor.pluginManager.trackPlugins;
		for (var i in trackPlugins) {
			var plugin = trackPlugins[i];
			var label = plugin.getTrackName();
			// TODO: tool icon
			var action = "paella.editor.instance.bottomBar.toolbar.onToolChanged('" + plugin.getName() + "','" + plugin.getTrackName() +"')";
			//var action = "paella.editor.instance.bottomBar.timeline.selectTrackList('" + plugin.getName() + "');";
			tools[label] = action;
		}
		var defaultText = paella.dictionary.translate("Tool") + ": " + paella.dictionary.translate('Selection');
		this.toolButton = bootstrapUtils.dropdown(defaultText,'toolDropdown',tools,'btn-mini','',false);
		this.container.appendChild(this.toolButton);
		this.selectedToolUtils = document.createElement('span');
		this.selectedToolUtils.className = 'editorToolbar_selectedToolUtils';
		this.container.appendChild(this.selectedToolUtils);
	},
	
	buildPlaybackControls:function() {
		var playbackControls = document.createElement('span');
		playbackControls.className = 'editorToolbarPlaybackControls';
		this.container.appendChild(playbackControls);
		var buttonData = [];
		buttonData.push({
			label:'<i class="icon-step-backward icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.seekTo,{newPositionPercent:0});
			}
		});
		buttonData.push({
			label:'<i class="icon-play icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.play);
			}
		});
		buttonData.push({
			label:'<i class="icon-pause icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.pause);
			}
		});
		buttonData.push({
			label:'<i class="icon-step-forward icon-white"></i>',hint:'',
			onclick:function(buttonData) {
				$(document).trigger(paella.events.seekTo,{newPositionPercent:99});
			}
		});
		playbackControls.appendChild(bootstrapUtils.buttonGroup(buttonData,'btn-mini',true));
	},
	
	buildPlugins:function() {
		if (!this.toolbarPlugins) {
			this.toolbarPlugins = document.createElement('span');
			this.container.appendChild(this.toolbarPlugins);
		}
		else {
			this.toolbarPlugins.innerHTML = "";
		}
		var plugins = paella.editor.pluginManager.toolbarPlugins;
		for (var i=0;i<plugins.length;++i) {
			var plugin = plugins[i];
			var pluginName = plugin.getName();
			var name = plugin.getButtonName();
			var options = plugin.getOptions();
			var optionsObject = {}
			var icon = plugin.getIcon();
			if (icon) { icon = icon + ' icon-white'; }
			for (var j=0;j<options.length;++j) {
				optionsObject[options[j]] = "paella.editor.instance.bottomBar.toolbar.selectPluginOption('" + pluginName + "'," + j + ")";
			}
			var button = bootstrapUtils.dropdown(name,'editorDropdown',optionsObject,'btn-mini',icon,true);
			this.toolbarPlugins.appendChild(button);
		}
	},

	buildEditorMenu:function() {
		var tools = {
		};
		tools[paella.dictionary.translate("Save and close editor")] = "paella.editor.instance.bottomBar.toolbar.saveAndClose();";
		tools[paella.dictionary.translate("Save changes")] = "paella.editor.instance.bottomBar.toolbar.save();";
		tools[paella.dictionary.translate("Discard changes and close")] = "paella.editor.instance.bottomBar.toolbar.discardAndClose();";
		this.editorMenu = bootstrapUtils.dropdown(paella.dictionary.translate('Paella Editor'),'editorDropdown',tools,'btn-mini','icon-edit icon-white',true);
		this.container.appendChild(this.editorMenu);
	},
	
	selectPluginOption:function(pluginName,optionIndex) {
		var plugins = paella.editor.pluginManager.toolbarPlugins;
		for (var i=0;i<plugins.length;++i) {
			var plugin = plugins[i];
			if (plugin.getName()==pluginName) {
				plugin.onOptionSelected(optionIndex);
			}
		}
		this.buildPlugins();
	},

	onToolChanged:function(toolName,trackName) {
		paella.editor.instance.bottomBar.timeline.selectTrackList(toolName);
		var textElem = $(this.toolButton).find('.text')[0];
		textElem.innerHTML = paella.dictionary.translate("Tool") + ": " + trackName;
		this.setupTrackTool(toolName);
	},
	
	setupTrackTool:function(toolName) {
		this.selectedToolUtils.innerHTML = "";
		var plugin = null;
		for (var i=0;i<paella.editor.pluginManager.trackPlugins.length;++i) {
			plugin = paella.editor.pluginManager.trackPlugins[i];
			if (toolName==plugin.getName()) {
				break;
			}
			else {
				plugin = null;
			}
		}
		if (plugin) {
			var buttonData = [];
			var tools = plugin.getTools()
			for (var i=0;i<tools.length;++i) {
				buttonData.push({
					label:tools[i].label,
					plugin:plugin,
					toolName:tools[i].name,
					hint:tools[i].hint,
					onclick:function(buttonData) {
						if (buttonData.plugin.onToolSelected(buttonData.toolName)) {
							paella.editor.instance.bottomBar.timeline.rebuildTrack(plugin.getName());
							paella.editor.pluginManager.onTrackChanged(plugin);
							paella.editor.instance.rightBar.updateCurrentTab();
						}
					}
				});
			}
			if (buttonData.length>0) {
				var toolLabel = document.createElement('span');
				toolLabel.innerHTML = '&nbsp;' + paella.dictionary.translate('Options') + ':';
				this.selectedToolUtils.appendChild(toolLabel);
				this.selectedToolUtils.appendChild(bootstrapUtils.buttonGroup(buttonData,'btn-mini'));
			}
		}
	},
	
	saveAndClose:function() {
		paella.editor.pluginManager.onSave(function(status) {
			paella.editor.instance.unloadEditor();
		});
	},
	
	save:function() {
		paella.editor.pluginManager.onSave(function() {
			
		});
	},
	
	discardAndClose:function() {
		paella.editor.pluginManager.onDiscard(function(status) {
			paella.debug.log("Discard changes");
			paella.editor.instance.unloadEditor();
		});
	}
});

paella.editor.Timeline = Class.create({
	container:null,
	containerMinHeight:133,
	content:null,
	timeMarks:null,
	tracks:null,
	zoom:1000,
	trackItemList:null,
	trackItemIndex:{
		back:5,
		front:10
	},
	trackItemOpacity:{
		back:0.5,
		front:0.9
	},
	currentTrackList:null,
	
	initialize:function(parent) {
		var defaultHeight = this.containerMinHeight;
		
		this.trackItemList = [];
		this.container = document.createElement('div');
		this.container.className = 'editorTimelineContainer';
		$(this.container).css({
			"height":defaultHeight + "px"
		});
		parent.appendChild(this.container);
		
		
		this.content = document.createElement('div');
		this.content.className = 'editorTimelineContent';
		$(this.content).css({
			'width':this.zoom + '%',
			'height':'100%'
		});
		this.container.appendChild(this.content);
		
		this.timeMarks = document.createElement('div');
		this.timeMarks.className = "editorTimeLineTimeMarks";
		this.content.appendChild(this.timeMarks);
		this.buildTimeMarks();

		this.tracks = document.createElement('div');
		this.tracks.className = "editorTimeLineTracks";
		this.tracks.style.minHeight = this.containerMinHeight + 'px';
		this.content.appendChild(this.tracks);
		
		this.loadPlugins();
		
		this.setupCursors();
	},
	
	setupCursors:function() {
		var cursor = document.createElement('div');
		cursor.className = 'editorTimelineCursor';
		this.container.appendChild(cursor);
		var content = this.content;
		$(this.container).mousemove(function(event) {
			var duration = paella.player.videoContainer.duration(true);
			var contentWidth = $(content).width();
			var position = $(content).position().left
			var left = event.pageX - position;
			$(cursor).css({'left':left + 'px'});
			
			var time = left * duration / contentWidth;
			cursor.innerHTML =  paella.utils.timeParse.secondsToTime(time);
		});
		
		var currentTimeCursor = document.createElement('div');
		currentTimeCursor.className = 'editorTimelineCursor currentTime';
		this.container.appendChild(currentTimeCursor);
		$(document).bind(paella.events.timeUpdate,function(event,params) {
			var duration = paella.player.videoContainer.duration(true);
			var contentWidth = $(content).width();
			var currentTime = params.currentTime;

			var left = currentTime * contentWidth / duration;
			
			$(currentTimeCursor).css({'left':left + 'px'});

			currentTimeCursor.innerHTML =  paella.utils.timeParse.secondsToTime(currentTime);
		});
		
		$(document).bind(paella.events.seekToTime,function(event,params) {
			var duration = paella.player.videoContainer.duration(true);
			var contentWidth = $(content).width();
			var currentTime = params.time;

			var left = currentTime * contentWidth / duration;
			
			$(currentTimeCursor).css({'left':left + 'px'});

			currentTimeCursor.innerHTML =  paella.utils.timeParse.secondsToTime(currentTime);
		});

		$(this.container).mouseup(function(event) {
			if (paella.editor.utils.mouse.mouseDownTarget!='track') {
				var duration = paella.player.videoContainer.duration(true);
				var contentWidth = $(content).width();
				var position = $(content).position().left
				var left = event.pageX - position;
				var time = left * 100 / contentWidth;
				$(document).trigger(paella.events.seekTo,{newPositionPercent:time});	
			}			
		});
	},

	loadPlugins:function() {
		var thisClass = this;
		var container = this.tracks;
		container.innerHTML = "";
		var plugins = paella.editor.pluginManager.trackPlugins;
		var secTrackIndex = 0;
		var subclass = "";
		for (var i in plugins) {
			if (plugins[i].getTrackType()=='secondary') {
				subclass = "track" + secTrackIndex;
				++secTrackIndex;
			}
			else {
				subclass = "";
			}
			var track = new paella.editor.Track(container,plugins[i],subclass);
			this.trackItemList.push(track);
		}
		this.selectTrackList(this.currentTrackList);
	},

	rebuildTrack:function(pluginName) {
		var plugins = paella.editor.pluginManager.trackPlugins;
		for (var i in this.trackItemList) {
			var track = this.trackItemList[i];
			if (track.getName()==pluginName) {
				track.rebuild();
			}
		}
	},
	
	getHeight:function() {
		if ($(this.container).height()<this.containerMinHeight) return this.containerMinHeight;
		else return $(this.container).height();
	},

	buildTimeMarks:function() {
		var zoom = this.zoom;
		this.timeMarks.innerHTML = "";
		var barWidth = $(this.timeMarks).width();
		var duration = paella.player.videoContainer.duration(true);
		var markWidth = 70;
		var numberOfMarks = Math.ceil(barWidth / markWidth);
		var timeIncrement = duration / numberOfMarks;
		var remainder = barWidth % markWidth;
		var odd = true;
		var currentTime = 0;
		for (var i=0;i<numberOfMarks;++i) {
			var mark = document.createElement('div');
			mark.className = "editorTimeLineMark";
			if (odd) mark.className = mark.className + " odd";
			if (i==(numberOfMarks-1)) {
				markWidth = remainder;
				mark.className += " last";
			}
			mark.style.width = markWidth + 'px';
			mark.innerHTML = paella.utils.timeParse.secondsToTime(currentTime);//"0:00:00";
			currentTime += timeIncrement;
			this.timeMarks.appendChild(mark);
			var padding = 0; //$(mark).css('padding-left');
			var finalWidth = markWidth - padding;
			mark.style.width = finalWidth + 'px';
			odd = !odd;
		}
	},

	setZoom:function(percent) {
		var thisClass = this;
		this.zoom = percent;
		this.timeMarks.innerHTML = "";
		$(this.content).animate({'width':percent + '%'},{
			complete:function() {
				thisClass.buildTimeMarks();
			}
		});
	},
	
	onresize:function() {
		this.buildTimeMarks();
		var height = $(this.tracks).outerHeight();
		$(this.container).css('height',height + 'px');
	},
	
	selectTrackList:function(trackItem,noEvent,selectTrackItem) {
		if (trackItem=='select') {
			this.currentTrackList = null;
		}
		else {
			for (var i in this.trackItemList) {
				var trackItemObj = this.trackItemList[i];
				var container = trackItemObj.container;
				if (trackItemObj.getName()==trackItem) {
					this.currentTrackList = trackItemObj;
					$(container).css({
						'z-index':this.trackItemIndex.front,
						'opacity':this.trackItemOpacity.front
					});
				}
				else {
					$(container).css({
						'z-index':this.trackItemIndex.back,
						'opacity':this.trackItemOpacity.back
					});	
				}			
			}
		}
		
		var plugin = null;
		if (this.currentTrackList) {
			plugin = this.currentTrackList.plugin;
			if (selectTrackItem>0) this.currentTrackList.selectTrack(selectTrackItem,noEvent);
		}
		if (!noEvent) {
			paella.editor.pluginManager.onTrackChanged(plugin);
			paella.editor.instance.rightBar.updateCurrentTab();
		}
	},
	
	focusTrackListItem:function(trackItemName,itemId) {
		this.selectTrackList(trackItemName,true,itemId);
		var trackElement = $('#' + paella.editor.TrackUtils.buildTrackItemId(trackItemName,itemId))[0];
		if (trackElement) {
			var scrollLeft = paella.editor.instance.bottomBar.timeline.container.scrollLeft;
			var itemOffset = $(trackElement).offset().left - 10;
			var newScroll = scrollLeft + itemOffset;
			 $(paella.editor.instance.bottomBar.timeline.container).animate({scrollLeft : newScroll},{duration:100});
		}
	}
});

paella.editor.BottomToolbar = Class.create({
	container:null,
	content:null,
	
	initialize:function(parent) {
		this.container = document.createElement('div');
		this.container.className = 'editorBottomToolbarContainer';
		parent.appendChild(this.container);
		
		this.content = document.createElement('div');
		this.container.appendChild(this.content);
		this.content.appendChild(bootstrapUtils.dropup('Zoom','zoomDropup',{
			'100%':'paella.editor.instance.bottomBar.timeline.setZoom(100)',
			'200%':'paella.editor.instance.bottomBar.timeline.setZoom(200)',
			'500%':'paella.editor.instance.bottomBar.timeline.setZoom(200)',
			'1000%':'paella.editor.instance.bottomBar.timeline.setZoom(1000)',
			'3000%':'paella.editor.instance.bottomBar.timeline.setZoom(3000)',
			'5000%':'paella.editor.instance.bottomBar.timeline.setZoom(5000)'
		},'btn-mini','icon-search',true));
	}
});

paella.editor.BottomBar = Class.create(paella.AsyncLoaderCallback,{
	editor:null,
	container:null,
	toolbar:null,
	timeline:null,
	bottomToolbar:null,

	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		var thisClass = this;
		this.container = document.createElement('div');
		this.container.className = "paellaEditorBottomBar";
	//	this.container.style.height = this.getHeight() + 'px';
		this.editor.editorContainer.appendChild(this.container);
		this.build();
		onSuccess();
	},
	
	build:function() {
		this.toolbar = new paella.editor.Toolbar(this.container);
		this.timeline = new paella.editor.Timeline(this.container);
		this.bottomToolbar = new paella.editor.BottomToolbar(this.container);
	},
	
	getHeight:function() {
		return $(this.container).height();
	},
	
	onresize:function() {
		this.timeline.onresize();
	}
});

paella.editor.RightBar = Class.create(paella.AsyncLoaderCallback,{
	editor:null,
	container:null,
	tabBar:null,
	selectedTab:0,
	tabContent:null,

	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		this.container = document.createElement('div');
		this.container.className = "paellaEditorRightBar";
		this.container.style.width = this.getWidth() + 'px';
		this.container.style.bottom = this.editor.bottomBar.getHeight() + 'px';
		this.editor.editorContainer.appendChild(this.container);
		this.tabBar = new paella.editor.Tabbar(this.container);
		this.tabContent = document.createElement('div');
		this.tabContent.className = "paellaEditorRightBarContent";
		this.container.appendChild(this.tabContent);
	
		this.loadPlugins();
		onSuccess();
	},
	
	loadPlugins:function() {
		var thisClass = this;
		var container = this.tabBar.container;
		container.innerHTML = "";
		var ul = document.createElement('ul');
		ul.className = "nav";
		var active = "active";
		var plugins = paella.editor.pluginManager.rightBarPlugins;
		if (plugins.length>0) {
			var i=0;
			for (var i in plugins) {
				var plugin = plugins[i];
				ul.appendChild(this.getTab(plugin,i));
				++i;
			}
			container.appendChild(ul);
		
			var currentTab = plugins[this.selectedTab];
			this.tabContent.innerHTML = "";
			this.tabContent.appendChild(currentTab.getContent());	
			currentTab.onLoadFinished();
		}
	},
	
	getTab:function(plugin,index) {
		var thisClass = this;
		var active = ""
		if (index==this.selectedTab) active = "active";
		var li = document.createElement('li');
		li.className = active;
		var a = document.createElement('a');
		a.className = "rightBarPlugin";
		a.setAttribute('href','JavaScript:void(0);');
		a.innerHTML = '<span class="editorRightBarTabIcon ' + plugin.getName() + '"></span>' + plugin.getTabName();
		a.tabIndex = index;
		$(a).click(function(event) {
			thisClass.loadTab(this.tabIndex);
		});
		li.appendChild(a);
		return li;
	},
	
	updateCurrentTab:function() {
		if (this.tabBar) {	// Prevents update current tab if the editor is the tab bar is not loaded
			this.loadPlugins();
		}
	},

	getWidth:function() {
		return 300;
	},
	
	loadTab:function(index) {
		this.selectedTab = index;
		this.loadPlugins();
	},
	
	onresize:function() {
		this.container.style.bottom = this.editor.bottomBar.getHeight() + 'px';	
	}
});
