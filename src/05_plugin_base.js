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


Class ("paella.PluginManager", {
	targets:null,
	pluginList: [],
	eventDrivenPlugins: [],
	enabledPlugins: [],


//	checkPluginVisibility

	setupPlugin: function(plugin) {
		plugin.setup();
		this.enabledPlugins.push(plugin);
		if (dynamic_cast("paella.UIPlugin", plugin)) {
			plugin.checkVisibility();
		}	
	},


	checkPluginsVisibility: function() {	
		this.enabledPlugins.forEach(function(plugin) {		
			if (dynamic_cast("paella.UIPlugin", plugin)) {
				plugin.checkVisibility();
			}								
		});	
	},

	initialize:function() {
		this.targets = {};
		var This = this;
		paella.events.bind(paella.events.loadPlugins,function(event) {
			This.loadPlugins("paella.DeferredLoadPlugin");
		});
		
		var timer = new base.Timer(function() {
			if (paella.player && paella.player.controls) paella.player.controls.onresize();
		}, 1000);
		timer.repeat = true;
	},

	setTarget:function(pluginType,target) {
		if (target.addPlugin) {
			this.targets[pluginType] = target;
		}
	},

	getTarget:function(pluginType) {
		// PluginManager can handle event-driven events:
		if (pluginType=="eventDriven") {
			return this;
		}
		else {
			var target = this.targets[pluginType];
			return target;
		}
	},

	registerPlugin:function(plugin) {
		// Registra los plugins en una lista y los ordena
		this.importLibraries(plugin);
		this.pluginList.push(plugin);
		this.pluginList.sort(function(a,b) {
			return a.getIndex() - b.getIndex();
		});
	},

	importLibraries:function(plugin) {
		plugin.getDependencies().forEach(function(lib) {
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.src = 'javascript/' + lib + '.js';
			document.head.appendChild(script);
		});
	},
	
	// callback => function(plugin,pluginConfig)
	loadPlugins:function(pluginBaseClass) {
		if (pluginBaseClass != undefined) {
			var This = this;
			this.foreach(function(plugin,config) {
				if (dynamic_cast(pluginBaseClass, plugin) != null) {
					if (config.enabled) {
						base.log.debug("Load plugin (" + pluginBaseClass + "): " + plugin.getName());
						plugin.config = config;							
						plugin.load(This);
					}				
				}
			});
		}
	},	
	
	foreach:function(callback) {
		var enablePluginsByDefault = false;
		var pluginsConfig = {};
		try {
			enablePluginsByDefault = paella.player.config.plugins.enablePluginsByDefault;
		}
		catch(e){}
		try {
			pluginsConfig = paella.player.config.plugins.list;
		}
		catch(e){}
				
		this.pluginList.forEach(function(plugin){			
			var name = plugin.getName();
			var config = pluginsConfig[name];
			if (!config) {
				config = {enabled: enablePluginsByDefault};
			}
			callback(plugin, config);
		});
	},

	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (plugin.type=="eventDriven" && isEnabled) {
				paella.pluginManager.setupPlugin(plugin);
				thisClass.eventDrivenPlugins.push(plugin);
				var events = plugin.getEvents();
				var eventBind = function(event,params) {
					plugin.onEvent(event.type,params);
				};

				for (var i=0; i<events.length;++i) {
					var eventName = events[i];
					paella.events.bind(eventName, eventBind);
				}
			}
		});
	},

	getPlugin:function(name) {
		for (var i=0;i<this.pluginList.length;++i) {
			if (this.pluginList[i].getName()==name) return this.pluginList[i];
		}
		return null;
	}
});

paella.pluginManager = new paella.PluginManager();

Class ("paella.Plugin", {
	type:'',

	initialize:function() {
		var thisClass = this;
		paella.pluginManager.registerPlugin(this);
	},

	getDependencies:function() {
		return [];
	},

	load:function(pluginManager) {
		var target = pluginManager.getTarget(this.type);
		if (target && target.addPlugin) {
			target.addPlugin(this);
		}
	},

	getRootNode:function(id) {
		return null;
	},

	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},

	setup:function() {

	},

	getIndex:function() {
		return 0;
	},

	getName:function() {
		return "";
	}
});



Class ("paella.FastLoadPlugin", paella.Plugin, {});
Class ("paella.EarlyLoadPlugin", paella.Plugin, {});
Class ("paella.DeferredLoadPlugin", paella.Plugin, {});



Class ("paella.PopUpContainer", paella.DomNode,{
	containers:null,
	currentContainerId:-1,

	initialize:function(id,className) {
		var This = this;
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = className;

		this.containers = {};
	},

	hideContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId==identifier) {
			container.identifier = identifier;
			paella.events.trigger(paella.events.hidePopUp,{container:container});
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			$(this.domElement).css({width:'0px'});
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
	},

	showContainer:function(identifier, button) {
		var thisClass = this;
		var width = 0;
		
		function hideContainer(container) {
			paella.events.trigger(paella.events.hidePopUp,{container:container});
			container.plugin.willHideContent();
			$(container.element).hide();
			$(thisClass.domElement).css({width:'0px'});
			container.button.className = container.button.className.replace(' selected','');
			thisClass.currentContainerId = -1;
			container.plugin.didHideContent();			
		}
		function showContainer(container) {
			paella.events.trigger(paella.events.showPopUp,{container:container});
			container.plugin.willShowContent();
			container.button.className = container.button.className + ' selected';
			$(container.element).show();
			width = $(container.element).width();			
			if (container.plugin.getAlignment() == 'right') {
				var right = $(button.parentElement).width() - $(button).position().left - $(button).width();
				$(thisClass.domElement).css({width:width + 'px', right:right + 'px', left:''});				
			}
			else {
				var left = $(button).position().left;
				$(thisClass.domElement).css({width:width + 'px', left:left + 'px', right:''});						
			}			
			thisClass.currentContainerId = identifier;
			container.plugin.didShowContent();			
		}
		
		var container = this.containers[identifier];
		if (container && this.currentContainerId!=identifier && this.currentContainerId!=-1) {
			var prevContainer = this.containers[this.currentContainerId];
			hideContainer(prevContainer);
			showContainer(container);
		}
		else if (container && this.currentContainerId==identifier) {
			hideContainer(container);
		}
		else if (container) {
			showContainer(container);
		}
	},

	registerContainer:function(identifier,domElement,button,plugin) {
		var containerInfo = {
			identifier:identifier,
			button:button,
			element:domElement,
			plugin:plugin
		};
		this.containers[identifier] = containerInfo;
		// this.domElement.appendChild(domElement);
		$(domElement).hide();
		button.popUpIdentifier = identifier;
		button.sourcePlugin = plugin;
		$(button).click(function(event) {
			if (!this.plugin.isPopUpOpen()) {
				paella.player.controls.playbackControl().showPopUp(this.popUpIdentifier,this);
			}
			else {
				paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier,this);
			}
		});
		$(button).keyup(function(event) {
			if ( (event.keyCode == 13) && (!this.plugin.isPopUpOpen()) ){
				paella.player.controls.playbackControl().showPopUp(this.popUpIdentifier,this);
			}
			else if ( (event.keyCode == 27)){
				paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier,this);
			}
		});
		plugin.containerManager = this;
	}
});

Class ("paella.TimelineContainer", paella.PopUpContainer,{
	hideContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId==identifier) {
			paella.events.trigger(paella.events.hidePopUp,{container:container});
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			this.currentContainerId = -1;
			$(this.domElement).css({height:'0px'});
			container.plugin.didHideContent();
		}
	},

	showContainer:function(identifier,button) {
		var height =0;
		var container = this.containers[identifier];
		if (container && this.currentContainerId!=identifier && this.currentContainerId!=-1) {
			var prevContainer = this.containers[this.currentContainerId];
			prevContainer.button.className = prevContainer.button.className.replace(' selected','');
			container.button.className = container.button.className + ' selected';
			paella.events.trigger(paella.events.hidePopUp,{container:prevContainer});
			prevContainer.plugin.willHideContent();
			$(prevContainer.element).hide();
			prevContainer.plugin.didHideContent();
			paella.events.trigger(paella.events.showPopUp,{container:container});
			container.plugin.willShowContent();
			$(container.element).show();
			this.currentContainerId = identifier;
			height = $(container.element).height();
			$(this.domElement).css({height:height + 'px'});
			container.plugin.didShowContent();
		}
		else if (container && this.currentContainerId==identifier) {
			paella.events.trigger(paella.events.hidePopUp,{container:container});
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			$(this.domElement).css({height:'0px'});
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
		else if (container) {
			paella.events.trigger(paella.events.showPopUp,{container:container});
			container.plugin.willShowContent();
			container.button.className = container.button.className + ' selected';
			$(container.element).show();
			this.currentContainerId = identifier;
			height = $(container.element).height();
			$(this.domElement).css({height:height + 'px'});
			container.plugin.didShowContent();
		}
	}
});


	
Class ("paella.UIPlugin", paella.DeferredLoadPlugin, {
	ui: null,
	
	checkVisibility: function() {
		var modes = this.config.visibleOn || [	paella.PaellaPlayer.mode.standard, 
												paella.PaellaPlayer.mode.fullscreen, 
												paella.PaellaPlayer.mode.embed ];
		
		var visible = false;
		modes.forEach(function(m){
			if (m == paella.player.getPlayerMode()) {
				visible = true;
			}
		});
		
		if (visible){
			this.showUI();
		}
		else {
			this.hideUI();
		}
	},
	
	hideUI:function() {
		this.ui.setAttribute('aria-hidden', 'true');
		$(this.ui).hide();
	},
	
	showUI:function() {
		var thisClass = this;
		paella.pluginManager.enabledPlugins.forEach(function(p) {
			if (p == thisClass) {
				thisClass.ui.setAttribute('aria-hidden', 'false');
				$(thisClass.ui).show();				
			}
		});	
	},
});


Class ("paella.ButtonPlugin", paella.UIPlugin,{
	type:'button',
	subclass:'',
	container:null,
	containerManager:null,

	getAlignment:function() {
		return 'left';	// or right
	},

	// Returns the button subclass.
	getSubclass:function() {
		return "myButtonPlugin";
	},

	addSubclass:function($subclass) {
		$(this.container).addClass($subclass);
	},
	
	removeSubclass:function($subclass) {
		$(this.container).removeClass($subclass);
	},

	action:function(button) {
		// Implement this if you want to do something when the user push the plugin button
	},

	getName:function() {
		return "ButtonPlugin";
	},

	getMinWindowSize:function() {
		return 0;
	},

	buildContent:function(domElement) {
		// Override if your plugin
	},

	willShowContent:function() {
		base.log.debug(this.getName() + " willDisplayContent");
	},

	didShowContent:function() {
		base.log.debug(this.getName() + " didDisplayContent");
	},

	willHideContent:function() {
		base.log.debug(this.getName() + " willHideContent");
	},

	didHideContent:function() {
		base.log.debug(this.getName() + " didHideContent");
	},

	getButtonType:function() {
		//return paella.ButtonPlugin.type.popUpButton;
		//return paella.ButtonPlugin.type.timeLineButton;
		return paella.ButtonPlugin.type.actionButton;
	},
	
	getText:function() {
		return "";
	},
	
	setText:function(text) {
		this.container.innerHTML = text;
	},

	hideButton:function() {
		this.hideUI();
	//	this.button.setAttribute('aria-hidden', 'false');
	//	$(this.button).hide();
	},

	showButton:function() {
		this.showUI();
	//	this.button.setAttribute('aria-hidden', 'true');
	//	$(this.button).show();
	},

	// Utility functions: do not override
	changeSubclass:function(newSubclass) {
		this.subclass = newSubclass;
		this.container.className = this.getClassName();
	},

	getClassName:function() {
		return paella.ButtonPlugin.kClassName + ' ' + this.getAlignment() + ' ' + this.subclass;
	},

	getContainerClassName:function() {
		if (this.getButtonType()==paella.ButtonPlugin.type.timeLineButton) {
			return paella.ButtonPlugin.kTimeLineClassName + ' ' + this.getSubclass();
		}
		else if (this.getButtonType()==paella.ButtonPlugin.type.popUpButton) {
			return paella.ButtonPlugin.kPopUpClassName + ' ' + this.getSubclass();
		}
	},

	setToolTip:function(message) {
		this.button.setAttribute("title", message);
		this.button.setAttribute("aria-label", message);
	},

	getDefaultToolTip: function() {
		return "";
	},

	isPopUpOpen:function() {
		return (this.button.popUpIdentifier == this.containerManager.currentContainerId);
	}
});

paella.ButtonPlugin.alignment = {
	left:'left',
	right:'right'
};
paella.ButtonPlugin.kClassName = 'buttonPlugin';
paella.ButtonPlugin.kPopUpClassName = 'buttonPluginPopUp';
paella.ButtonPlugin.kTimeLineClassName = 'buttonTimeLine';
paella.ButtonPlugin.type = {
	actionButton:1,
	popUpButton:2,
	timeLineButton:3
};


paella.ButtonPlugin.buildPluginButton = function(plugin,id) {
	plugin.subclass = plugin.getSubclass();
	var elem = document.createElement('div');
	elem.className = plugin.getClassName();
	elem.id = id;
	elem.innerHTML = plugin.getText();
	elem.setAttribute("tabindex", 1000+plugin.getIndex());
	elem.setAttribute("alt", "");
	elem.setAttribute("role", "button");
	elem.plugin = plugin;
	plugin.button = elem;
	plugin.container = elem;
	plugin.ui = elem;
	plugin.setToolTip(plugin.getDefaultToolTip());
	
		
	function onAction(self) {
		paella.userTracking.log("paella:button:action", self.plugin.getName());
		self.plugin.action(self);
	}
	
	$(elem).click(function(event) {
		onAction(this);
	});
	$(elem).keyup(function(event) {
		if (event.keyCode == 13) {
			onAction(this);
		}
	});
	return elem;
};

paella.ButtonPlugin.buildPluginPopUp = function(parent,plugin,id) {
	plugin.subclass = plugin.getSubclass();
	var elem = document.createElement('div');
	parent.appendChild(elem);
	elem.className = plugin.getContainerClassName();
	elem.id = id;
	elem.plugin = plugin;
	plugin.buildContent(elem);
	return elem;
};

Class ("paella.VideoOverlayButtonPlugin", paella.ButtonPlugin,{
	type:'videoOverlayButton',

	// Returns the button subclass.
	getSubclass:function() {
		return "myVideoOverlayButtonPlugin";
	},

	action:function(button) {
		// Implement this if you want to do something when the user push the plugin button
	},

	getName:function() {
		return "VideoOverlayButtonPlugin";
	}
});


Class ("paella.EventDrivenPlugin", paella.EarlyLoadPlugin,{
	type:'eventDriven',

	initialize:function() {
		this.parent();
		var events = this.getEvents();
		for (var i = 0; i<events.length;++i) {
			var event = events[i];
			if (event==paella.events.loadStarted) {
				this.onEvent(paella.events.loadStarted);
			}
		}
	},

	getEvents:function() {
		return [];
	},

	onEvent:function(eventType,params) {
	},

	getName:function() {
		return "EventDrivenPlugin";
	}
});
