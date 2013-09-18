/*
	Copyright 2013 Universitat Politècnica de València Licensed under the
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

if (paella.pluginList) {
	paella.pluginList.push('basic_editor_plugins.js');
	//paella.pluginList.push('captions_editor.js');
	//paella.pluginList.push('publish_editor.js');
}

var bootstrapUtils = {
	elem:function(type,params,inner) {
		var elem = document.createElement(type);
		for (var attr in params) {
			elem.setAttribute(attr, params[attr]);
		}
		if (inner) {elem.innerHTML = inner;}
		return elem;
	},
	
	append:function(parent,child) {
		parent.appendChild(child);
		return child;
	},

	navbar:function(title,subclass) {
		var nav = this.elem("div",{"class":"navbar tiny " + subclass});
		var navInner = this.append(nav,this.elem("div",{"class":"navbar-inner tiny"}))
		if (title) {
			this.append(navInner,this.elem("div",{"class":"brand","href":"JavaScript:void(0);"},title));
		}
		return nav;
	},
	
	dropdown:function(title,subclass,items,size,icon,alignRight) {
		return this.dropButton(title,subclass,items,size,icon,alignRight,'');
	},
	
	dropup:function(title,subclass,items,size,icon,alignRight) {
		return this.dropButton(title,subclass,items,size,icon,alignRight,'dropup');
	},

	dropButton:function(title,subclass,items,size,icon,alignRight,type) {
		var align = '';
		if (alignRight) align = 'pull-right';
		
		var dropup = this.elem('div',{'class':'btn-group ' + type + ' ' + subclass + ' ' + align});
		if (icon) {
			title = '<i class="' + icon + '"></i>&nbsp;<span class="text">' + title + '</span>&nbsp;';
		}
		else {
			title = '&nbsp;<span class="text">' + title + '</span>&nbsp;';
		}
		
		var btn = this.append(dropup,this.elem('a',{'class':'btn dropdown-toggle ' + size,'data-toggle':'dropdown','href':'JavaScript:void(0);'},title + '<span class="caret"></span>'));
		
		
		var ul = this.append(dropup,this.elem('ul',{'class':'dropdown-menu'}));
		for (var key in items) {
			var action = items[key];
			var li = this.append(ul,this.elem('li'));
			this.append(li,this.elem('a',{'href':'JavaScript:void(0);','onclick':action,'class':'listItem'},key));
		}
		return dropup;
	},
	
	buttonGroup:function(buttons,btnSubclass,isPushButton) {
		var group = document.createElement('div');
		group.className = 'btn-group';
		
		
		for (var i=0;i<buttons.length;++i) {
			var button = document.createElement('button');
			button.className = 'btn ' + btnSubclass;
			button.innerHTML = buttons[i].label;
			button.buttonData = buttons[i];
			button.buttonData.disabledClass = button.className;
			button.title = buttons[i].hint;
			if (isPushButton) {
				$(button).click(function(event) {
					this.buttonData.onclick(this.buttonData);
				});				
			}
			else {
				$(button).click(function(event) {
					for (var j=0;j<this.parentNode.childNodes.length;++j) {
						this.parentNode.childNodes[j].className = this.buttonData.disabledClass;
					}
					this.className = this.className + ' active';
					this.buttonData.onclick(this.buttonData);
				});
			}
			group.appendChild(button);
		}
		return group;
	},
	
	button:function(label,className,hint,onclick) {
		var button = document.createElement('button');
		button.className = 'btn ' + className;
		button.innerHTML = label;
		button.title = hint;
		$(button).click(function(event) { onclick(this); });
		return button;
	}
};

paella.editor = {};

paella.editor.utils = {
	mouse: {
		mouseDownTarget:'',
	}
}

paella.editor.PluginSaveCallback = Class.create(paella.AsyncLoaderCallback,{
	plugin:null,
	
	initialize:function(plugin) {
		this.parent("pluginSaveCallback");
		this.plugin = plugin;
	},
	
	load:function(onSuccess,onError) {
		this.plugin.onSave(function() {
			onSuccess();
		});
	}
});

paella.editor.PluginDiscardCallback = Class.create(paella.AsyncLoaderCallback,{
	plugin:null,
	
	initialize:function(plugin) {
		this.parent("pluginDiscardCallback");
		this.plugin = plugin;
	},
	
	load:function(onSuccess,onError) {
		this.plugin.onDiscard(function() {
			onSuccess();
		});
	}
});

paella.editor.PluginManager = Class.create({
	trackPlugins:[],
	rightBarPlugins:[],
	toolbarPlugins:[],

	initialize:function() {
		this.initPlugins();	
	},
	
	initPlugins:function() {
		paella.pluginManager.setTarget('editorTrackPlugin',this);
		paella.pluginManager.setTarget('editorRightBarPlugin',this);
		paella.pluginManager.setTarget('editorToolbarPlugin',this);
	},
	
	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				plugin.setup();
				if (plugin.type=='editorTrackPlugin') {
					thisClass.trackPlugins.push(plugin);
				}
				if (plugin.type=='editorRightBarPlugin') {
					thisClass.rightBarPlugins.push(plugin);
				}
				if (plugin.type=='editorToolbarPlugin') {
					thisClass.toolbarPlugins.push(plugin);
				}
			}
		});
	},
	
	onTrackChanged:function(newTrack) {
		// Notify tab plugins
		for (var i=0;i<this.rightBarPlugins.length;++i) {
			var plugin = this.rightBarPlugins[i];
			plugin.onTrackSelected(newTrack);
		}
		
		// Notify toolbar plugins
		for (var i=0;i<this.toolbarPlugins.length;++i) {
			var plugin = this.toolbarPlugins[i];
			plugin.onTrackSelected(newTrack);
		}
	},
	
	onSave:function(onDone) {
		var asyncLoader = new paella.AsyncLoader();
		for (var i=0;i<this.trackPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.trackPlugins[i]));
		}
		for (var i=0;i<this.rightBarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.rightBarPlugins[i]));
		}
		for (var i=0;i<this.toolbarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.toolbarPlugins[i]));
		}
		asyncLoader.load(function() {
				onDone(true);
			},
			function() {
				onDone(false);
			});
	},
	
	onDiscard:function(onDone) {
		var asyncLoader = new paella.AsyncLoader();
		for (var i=0;i<this.trackPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.trackPlugins[i]));
		}
		for (var i=0;i<this.rightBarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.rightBarPlugins[i]));
		}
		for (var i=0;i<this.toolbarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.toolbarPlugins[i]));
		}
		asyncLoader.load(function() {
				onDone(true);
			},
			function() {
				onDone(false);
			});
	}
});

paella.editor.pluginManager = new paella.editor.PluginManager();

paella.editor.EditorPlugin = Class.create(paella.Plugin,{
	onTrackSelected:function(newTrack) {
		if (newTrack) {
			paella.debug.log(this.getName() + ": New track selected " + newTrack.getName());
		}
		else {
			paella.debug.log("No track selected");
		}
	},

	onSave:function(onDone) {
		// Paella Editor calls this function when the user clicks on "save" button
		onDone();
	},
	
	onDiscard:function(onDone) {
		onDone();
	},
	
	contextHelpString:function() {
		return "";
	}
});

paella.editor.TrackPlugin = Class.create(paella.editor.EditorPlugin,{
	type:'editorTrackPlugin',

	getIndex:function() {
		return 10000;
	},

	getName:function() {
		return "editorTrackPlugin";
	},
	
	getTrackName:function() {
		return "My Track";
	},
	
	getColor:function() {
		return "#5500FF";
	},
	
	getTextColor:function() {
		return "#F0F0F0";
	},
	
	getTrackType:function() {
		return "secondary";
	},
	
	getTrackItems:function() {
		var exampleTracks = [{id:1,s:10,e:70},{id:2,s:110,e:340}];
		return exampleTracks;
	},
	
	allowResize:function() {
		return true;
	},
	
	allowDrag:function() {
		return true;
	},
	
	allowEditContent:function() {
		return true;
	},
	
	onTrackChanged:function(id,start,end) {
		paella.debug.log('Track changed: id=' + id + ", start: " + start + ", end:" + end);
	},
	
	onTrackContentChanged:function(id,content) {
		paella.debug.log('Track content changed: id=' + id + ', new content: ' + content);
	},
	
	onSelect:function(trackItemId) {
		paella.debug.log('Track list selected: ' + this.getTrackName());
	},
	
	onUnselect:function() {
		paella.debug.log('Track list unselected: ' + this.getTrackName());
	},
	
	onDblClick:function(trackData) {
	},
	
	getTools:function() {
		return [];
	},

	onToolSelected:function(toolName) {
		paella.debug.log('Tool selected: ' + toolName);
	},
	
	getSettings:function() {
		return null;
	}
});

paella.editor.MainTrackPlugin = Class.create(paella.editor.TrackPlugin,{
	getTrackType:function() {
		return "master";
	},
	
	getTrackItems:function() {
		var exampleTracks = [{id:1,s:30,e:470}];
		return exampleTracks;
	},
	
	getName:function() {
		return "editorMainTrackPlugin";
	},
});

paella.editor.RightBarPlugin = Class.create(paella.editor.EditorPlugin,{
	type:'editorRightBarPlugin',
	
	getIndex:function() {
		return 10000;
	},
	
	getName:function() {
		return "editorRightbarPlugin";
	},
	
	getTabName:function() {
		return "My Rightbar Plugin";
	},
	
	getContent:function() {
		var container = document.createElement('div');
		container.innerHTML = "Rightbar plugin";
		return container;
	},
	
	onLoadFinished:function() {
		
	}
});

paella.editor.EditorToolbarPlugin = Class.create(paella.editor.EditorPlugin,{
	type:'editorToolbarPlugin',
	trackList:[],
	
	getIndex:function() {
		return 10000;
	},
	
	getName:function() {
		return "editorToolbarPlugin";
	},
		
	getButtonName:function() {
		return "Toolbar Plugin";
	},
	
	getIcon:function() {
		return "icon-edit";
	},

	getOptions:function() {
		return []
	},
	
	onOptionSelected:function(optionIndex) {
	}
});


paella.ui = {}

paella.ui.Container = function(params) {
	var elem = document.createElement('div');
	if (params.id) elem.id = params.id;
	if (params.className) elem.className = params.className;
	if (params.style) $(elem).css(params.style);
	return elem;
};

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

paella.editor.TrackUtils = {
	buildTrackItemId:function(trackName,trackItemId) {
		return 'paellaEditorTrack_' + trackName + '_' + trackItemId;
	},
};

paella.editor.Track = Class.create({
	container:null,
	plugin:null,
	trackIndex:{
		back:10,
		front:20
	},
	trackOpacity:{
		back:0.7,
		front:1
	},
	trackElemList:null,
	
	buildTrackItemId:function(trackName,trackItemId) {
		return paella.editor.TrackUtils.buildTrackItemId(trackName,trackItemId);
	},

	initialize:function(parentContainer,plugin,subclass) {
		this.trackElemList = [];
		this.plugin = plugin;
		var newTrackGroup = document.createElement('div');
		this.container = newTrackGroup;
		parentContainer.appendChild(newTrackGroup);
		this.buildTracks(newTrackGroup);
		type = plugin.getTrackType();
		if (type=="master") {
			newTrackGroup.className = "editorTrackListItem master " + subclass;
		}
		else if (type=="secondary") {
			newTrackGroup.className = "editorTrackListItem secondary " + subclass;
		}
	},
	
	getName:function() {
		return this.plugin.getName();
	},
	
	rebuild:function() {
		this.container.innerHTML = '';
		this.buildTracks(this.container);
	},

	buildTracks:function(container) {
		var plugin = this.plugin;
		var trackList = plugin.getTrackItems();
		for (var i in trackList) {
			var trackItem = this.getTrack(trackList[i]);
			this.trackElemList.push(trackItem);
			this.container.appendChild(trackItem);
		}
	},
	
	getTrack:function(trackData) {
		var thisClass = this;
		var plugin = this.plugin;
		var duration = paella.player.videoContainer.duration(true);
		trackData.d = trackData.e - trackData.s;
		var track = document.createElement('div');
		track.className = 'editorTrackItem ' + plugin.getName();
		track.id = this.buildTrackItemId(plugin.getName(),trackData.id);
		var start = trackData.s * 100 / duration;
		var width = trackData.d * 100 / duration;
		$(track).css({
			'left':start + '%',
			'width':width + '%',
			'background-color':plugin.getColor(),
			'opacity':this.trackOpacity.back
		});
		track.trackInfo = {
			trackData:trackData,
			plugin:plugin
		}
		
		var label = document.createElement('div');
		if (trackData.name && trackData.name!='') {
			label.innerHTML = trackData.name;
		}
		else {
			label.innerHTML = plugin.getTrackName();
		}
		
		label.className = 'editorTrackItemLabel ' + this.plugin.getTrackType();
		label.style.color = plugin.getTextColor();
		track.appendChild(label);
		
		if (!trackData.lock) {
			if (plugin.allowResize()) {
				var resizerL = document.createElement('div');
				resizerL.className = 'editorTrackItemResizer left';
				resizerL.track = track;
				track.appendChild(resizerL);
				var resizerR = document.createElement('div');
				resizerR.className = 'editorTrackItemResizer right';
				resizerR.track = track;
				track.appendChild(resizerR);
			
				$(resizerL).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'L',event);
				});
				$(resizerR).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'R',event);
				});
			}

			if (plugin.allowDrag()) {
				var moveArea = document.createElement('div');
				moveArea.className = 'editorTrackItemMoveArea';
				moveArea.track = track;
				track.appendChild(moveArea);
				$(moveArea).mousedown(function(event) {
					paella.editor.utils.mouse.mouseDownTarget = 'track';
					thisClass.onResizerDown(this.track,'M',event);
				});				
			}
		}
		else {
			var lockIcon = document.createElement('i');
			lockIcon.className = 'editorTrackItemLock icon-lock icon-white';
			track.appendChild(lockIcon);
		}
		
		$(track).mousedown(function(event) {
			paella.editor.utils.mouse.mouseDownTarget = 'track';
			thisClass.onTrackDown(this,event);
		});
		
		$(document).mousemove(function(event) {
			thisClass.onResizerMove(event);
		});
		$(document).mouseup(function(event) {
			paella.editor.utils.mouse.mouseDownTarget = '';
			thisClass.onResizerUp(this.track,event);
		});
		$(track).dblclick(function(event) {
			thisClass.onDblClick(this.trackInfo,event);
		});
		return track;
	},
	
	
	currentTrack:null,
	resizeTrack:null,
	currentResizer:null,
	lastPos:{x:0,y:0},
	
	selectTrack:function(requestedTrack,noEvents) {
		if (typeof(requestedTrack)=="number") {
			for (var i=0;i<this.trackElemList.length;++i) {
				var trackElem = this.trackElemList[i];
				if (trackElem.trackInfo.trackData.id==requestedTrack) {
					requestedTrack = trackElem;
					break;
				}
			}
		}
		if (typeof(requestedTrack)!="number" && this.currentTrack!=requestedTrack) {
			if (!noEvents) this.onUnselect();
			for (var i=0;i<this.trackElemList.length;++i) {
				var trackElem = this.trackElemList[i];
				if (trackElem==requestedTrack) {
					this.currentTrack = trackElem;
					if (!noEvents) this.onSelect(trackElem.trackInfo);
					$(trackElem).css({
						'z-index':this.trackIndex.front,
						'opacity':this.trackOpacity.front
					});
				}
				else {
					$(trackElem).css({
						'z-index':this.trackIndex.back,
						'opacity':this.trackOpacity.back
					});
				}
			}
		}
	},
	
	onSelect:function(trackInfo) {
		this.plugin.onSelect(trackInfo.trackData);
	},
	
	onDblClick:function(track,event) {
		this.plugin.onDblClick(track.trackData);
	},
	
	onUnselect:function() {
		this.plugin.onUnselect();
	},
	
	onTrackDown:function(track,event) {
	// This will work only in secondary track items and in the first main track plugin:
		this.selectTrack(track);
		paella.editor.instance.bottomBar.toolbar.onToolChanged(this.plugin.getName(),this.plugin.getTrackName());
		
	},

	onResizerDown:function(track,resizer,event) {
		if (event) {
			this.resizeTrack = track;
			this.currentResizer = resizer;
			this.lastPos.x = event.clientX;
			this.lastPos.y = event.clientY;
		}
	},

	onResizerUp:function(track,event) {
		if (this.resizeTrack) {
			var duration = paella.player.videoContainer.duration(true);
			var totalWidth = $(this.container).width();
			var left = $(this.resizeTrack).position().left;
			var width = $(this.resizeTrack).width();
			left = left * 100 / totalWidth;
			width = width * 100 / totalWidth;
			var start = left * duration / 100;
			var end = (left + width) * duration / 100;
			
			var plugin = this.resizeTrack.trackInfo.plugin;
			var trackData = this.resizeTrack.trackInfo.trackData;
			plugin.onTrackChanged(trackData.id,start,end);
			paella.editor.pluginManager.onTrackChanged(plugin);
			paella.editor.instance.rightBar.updateCurrentTab();
			
			this.resizeTrack.trackInfo.trackData;

			$(this.resizeTrack).css({
				'left':left + '%',
				'width':width + '%'
			});
		}
		this.resizeTrack = null;
	},

	onResizerMove:function(event) {
		if (this.resizeTrack) {
			var diff = {
				x:event.clientX - this.lastPos.x,
				y:event.clientY - this.lastPos.y
			}
			var duration = paella.player.videoContainer.duration(true);
			var left = $(this.resizeTrack).position().left;
			var width = $(this.resizeTrack).width();
			
			//if (left<0) return;
			//else if ((left + width)>duration) return;
			if (this.currentResizer=='L') {
				left += diff.x;
				width -= diff.x;
				$(this.resizeTrack).css({'left':left + 'px','width':width + 'px'});
			}
			else if (this.currentResizer=='R') {
				width += diff.x;
				$(this.resizeTrack).css({'width':width + 'px'});
			}
			else if (this.currentResizer=='M') {	// Move track tool
				left +=diff.x;
				$(this.resizeTrack).css({'left':left + 'px'});
			}
			this.lastPos.x = event.clientX;
			this.lastPos.y = event.clientY;
		}
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

paella.editor.EmbedPlayer = Class.create(paella.AsyncLoaderCallback,{
	editar:null,
	
	initialize:function() {
		this.editor = paella.editor.instance;
	},
	
	load:function(onSuccess,onError) {
		var barHeight = this.editor.bottomBar.getHeight() + 20;
		var rightBarWidth = this.editor.rightBar.getWidth() + 20;
		$(paella.player.mainContainer).css({
			'position':'fixed',
			"width":"",
			"bottom":barHeight + "px",
			"right":rightBarWidth + "px",
			"left":"20px",
			"top":"20px"
		});
		paella.player.mainContainer.className = "paellaMainContainerEditorMode";
		new Timer(function(timer) {
			paella.player.controls.disable();
			paella.player.onresize();
			if (onSuccess) {
				onSuccess();
			}
		},500);
	},
	
	restorePlayer:function() {
		$('body')[0].appendChild(paella.player.mainContainer);
		paella.player.controls.enable();
		paella.player.mainContainer.className = "";
		$(paella.player.mainContainer).css({
			'position':'',
			"width":"",
			"bottom":"",
			"left":"",
			"right":"",
			"top":""
		});
		paella.player.onresize();
	},
	
	onresize:function() {
		var barHeight = this.editor.bottomBar.getHeight() + 20;
		var rightBarWidth = this.editor.rightBar.getWidth() + 20;
		$(paella.player.mainContainer).css({
			'position':'fixed',
			"width":"",
			"bottom":barHeight + "px",
			"right":rightBarWidth + "px",
			"left":"20px",
			"top":"20px"
		});

	}
});

paella.editor.Editor = Class.create({
	config:null,
	editorContainer:null,
	isLoaded:false,
	bottomBar:null,
	rightBar:null,
	embedPlayer:null,
	loader:null,

	initialize:function() {
		if (paella.player.accessControl.permissions.canWrite) {
			var thisClass = this;
			paella.editor.instance = this;
			paella.initDelegate.loadEditorConfig(function(config) {
				thisClass.config = config;
				thisClass.loadEditor();
			});	
		}
	},
	
	loadEditor:function() {
		paella.keyManager.enabled = false;
		var thisClass = this;
		this.editorContainer = document.createElement('div');
		$('body')[0].appendChild(this.editorContainer);
		this.editorContainer.className = 'editorContainer';
		this.editorContainer.id = "editorContainer";
		this.editorContainer.appendChild(paella.player.mainContainer);
		$('body')[0].style.backgroundImage = "url(resources/images/editor_video_bkg.png)";
		
		this.loader = new paella.AsyncLoader();
		this.bottomBar = this.loader.addCallback(new paella.editor.BottomBar());
		this.rightBar = this.loader.addCallback(new paella.editor.RightBar());
		this.embedPlayer = this.loader.addCallback(new paella.editor.EmbedPlayer());
		this.loader.load(function() {
			thisClass.onLoadSuccess();
		},function() {
			thisClass.onLoadFail();
		});
	},
	
	onLoadSuccess:function() {
		this.isLoaded = true;
		var thisClass = this;
		this.onresize();
		$(window).resize(function(event) {
			thisClass.onresize();
		});
		$(document).trigger(paella.events.play);
		new Timer(function(timer) {
			$(document).trigger(paella.events.pause);	
		},100);
	},
	
	onLoadFail:function() {
		
	},
	
	unloadEditor:function() {
		paella.keyManager.enabled = true;
		this.embedPlayer.restorePlayer();
		$('body')[0].removeChild(this.editorContainer);
		$('body')[0].style.backgroundImage = "";
		this.editorContainer = null;
		this.isLoaded = false;
		$(document).trigger(paella.events.hideEditor);
	},

	onresize:function() {
		if (this.isLoaded) {
			this.bottomBar.onresize();
			this.rightBar.onresize();
			this.embedPlayer.onresize();
		}
	}
});

var EditControl = Class.create(paella.DomNode,{
	buttonId:'',

	initialize:function(id) {
		this.buttonId = id + '_button';
		var style = {position:'absolute',top:'0px',right:'0px'};
		this.parent('div',id,style);
		this.domElement.className = 'editControlContainer';
		var editButton = this;
		this.addNode(new paella.Button(this.buttonId,'editButton',function(event) {
			editButton.toggleEditor();
		},false));
	},

	toggleEditor:function() {
		if ((paella.extended) || (window!=window.top)){
			window.open("editor.html?id=" + paella.player.videoIdentifier);
		}
		else{
			$(document).trigger(paella.events.showEditor);
		}
	},

	getButton:function() {
		return this.getNode(this.buttonId);
	}
});

