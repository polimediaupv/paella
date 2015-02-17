Class ("paella.editor.PluginSaveCallback", base.AsyncLoaderCallback,{
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

Class ("paella.editor.PluginDiscardCallback", base.AsyncLoaderCallback,{
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

Class ("paella.editor.PluginManager", {
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
				paella.pluginManager.setupPlugin(plugin);
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
		var i, plugin;
		for (i=0;i<this.rightBarPlugins.length;++i) {
			plugin = this.rightBarPlugins[i];
			plugin.onTrackSelected(newTrack);
		}

		// Notify toolbar plugins
		for (i=0;i<this.toolbarPlugins.length;++i) {
			plugin = this.toolbarPlugins[i];
			plugin.onTrackSelected(newTrack);
		}
	},

	onSave:function(onDone) {
		var asyncLoader = new paella.AsyncLoader();
		var i;
		for (i=0;i<this.trackPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.trackPlugins[i]));
		}
		for (i=0;i<this.rightBarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.rightBarPlugins[i]));
		}
		for (i=0;i<this.toolbarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginSaveCallback(this.toolbarPlugins[i]));
		}
		asyncLoader.load(function() {
				paella.events.trigger(paella.events.didSaveChanges);
				onDone(true);
			},
			function() {
				onDone(false);
			});
	},

	onDiscard:function(onDone) {
		var asyncLoader = new paella.AsyncLoader();
		var i;
		for (i=0;i<this.trackPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.trackPlugins[i]));
		}
		for (i=0;i<this.rightBarPlugins.length;++i) {
			asyncLoader.addCallback(new paella.editor.PluginDiscardCallback(this.rightBarPlugins[i]));
		}
		for (i=0;i<this.toolbarPlugins.length;++i) {
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

Class ("paella.editor.EditorPlugin", paella.DeferredLoadPlugin,{
	onTrackSelected:function(newTrack) {
		if (newTrack) {
			base.log.debug(this.getName() + ": New track selected " + newTrack.getName());
		}
		else {
			base.log.debug("No track selected");
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

Class ("paella.editor.TrackPlugin", paella.editor.EditorPlugin,{
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
		//base.log.debug('Track changed: id=' + id + ", start: " + start + ", end:" + end);
		paella.events.trigger(paella.events.documentChanged);
	},

	onTrackContentChanged:function(id,content) {
		//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);
		paella.events.trigger(paella.events.documentChanged);
	},

	onSelect:function(trackItemId) {
		base.log.debug('Track list selected: ' + this.getTrackName());
	},

	onUnselect:function() {
		base.log.debug('Track list unselected: ' + this.getTrackName());
	},

	onDblClick:function(trackData) {
	},

	getTools:function() {
		return [];
	},

	onToolSelected:function(toolName) {
		//base.log.debug('Tool selected: ' + toolName);
		paella.events.trigger(paella.events.documentChanged);
	},

	isToolEnabled:function(toolName) {
		return true;
	},

	buildToolTabContent:function(tabContainer) {

	},

	getSettings:function() {
		return null;
	}
});

Class ("paella.editor.MainTrackPlugin", paella.editor.TrackPlugin,{
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

Class ("paella.editor.RightBarPlugin", paella.editor.EditorPlugin,{
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

Class ("paella.editor.EditorToolbarPlugin", paella.editor.EditorPlugin,{
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
		return [];
	},

	onOptionSelected:function(optionIndex) {
	}
});
