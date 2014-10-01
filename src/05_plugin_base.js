
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
		var thisClass = this;
		paella.events.bind(paella.events.loadPlugins,function(event) {
			thisClass.loadPlugins();
		});
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
		this.pluginList.push(plugin);
		this.pluginList.sort(function(a,b) {
			return a.getIndex() - b.getIndex();
		});
	},
	
	// callback => function(plugin,pluginConfig)
	loadEventDrivenPlugins:function() {
		var This = this;
		this.foreach(function(plugin,config) {
			if (config.enabled) {
				paella.debug.log("load plugin " + name);
				plugin.config = config;
				if (plugin.type=="eventDriven") {
					plugin.load(This);
				}				
			}
		});
	},
	
	loadPlugins:function() {
		var This = this;
		this.foreach(function(plugin,config) {
			if (config.enabled) {
				paella.debug.log("load plugin " + name);
				plugin.config = config;							
				if (plugin.type!="eventDriven") {
					plugin.load(This);
				}			
			}
		});
	},
	
	foreach:function(callback) {
		var pluginConfig = paella.player.config.plugins;
		if (!pluginConfig) {
			pluginConfig = { defaultConfig:{enabled:true}, list:{}};
		}
		for (var i=0; i<this.pluginList.length; ++i) {
			var plugin = this.pluginList[i];
			var name = plugin.getName();
			var config = pluginConfig.list[name];
			if (!config) {
				config = pluginConfig.defaultConfig;
			}
			else {
				for (var key in pluginConfig.defaultConfig) {
					if (config[key]===undefined) config[key] = pluginConfig.defaultConfig[key];
				}
			}
			callback(this.pluginList[i],config);
		}
	},

/*	loadPlugins:function() {
		var pluginConfig = paella.player.config.plugins;
		if (!pluginConfig) {
			pluginConfig = {defaultConfig:{enabled:true},list:{}};
		}
		for (var i=0; i<this.pluginList.length; ++i) {
			var plugin = this.pluginList[i];
			var name = plugin.getName();
			var config = pluginConfig.list[name];
			if (!config) {
				config = pluginConfig.defaultConfig;
			}
			else {
				for (var key in pluginConfig.defaultConfig) {
					if (config[key]===undefined) config[key] = pluginConfig.defaultConfig[key];
				}
			}
			if ((config && config.enabled) || !config) {
				base.log.debug("loading plugin " + name);
				plugin.config = config;
				plugin.load(this);
			}
		}
	},
*/

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

Class ("paella.PopUpContainer", paella.DomNode,{
	containers:null,
	currentContainerId:-1,

	initialize:function(id,className) {
		var This = this;
		var style = {};
		this.parent('div',id,style);
		this.domElement.className = className;

		this.containers = {};
		paella.events.bind(paella.events.hidePopUp,function(event,params) { This.hideContainer(params.identifier,params.button); });
		paella.events.bind(paella.events.showPopUp,function(event,params) { This.showContainer(params.identifier,params.button); });
	},

	hideContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			$(this.domElement).css({width:'0px'});
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
	},

	showContainer:function(identifier,button) {
		var width = 0;
		var container = this.containers[identifier];
		var right = $(button.parentElement).width() - $(button).position().left - $(button).width();
		if (container && this.currentContainerId!=identifier && this.currentContainerId!=-1) {
			var prevContainer = this.containers[this.currentContainerId];
			prevContainer.plugin.willHideContent();
			prevContainer.button.className = prevContainer.button.className.replace(' selected','');
			container.button.className = container.button.className + ' selected';
			$(prevContainer.element).hide();
			prevContainer.plugin.didHideContent();
			container.plugin.willShowContent();
			$(container.element).show();
			width = $(container.element).width();
			$(this.domElement).css({width:width + 'px',right:right + 'px'});
			this.currentContainerId = identifier;
			container.plugin.didShowContent();
		}
		else if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();
			$(this.domElement).css({width:'0px'});
			container.button.className = container.button.className.replace(' selected','');
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
		else if (container) {
			container.button.className = container.button.className + ' selected';
			container.plugin.willShowContent();
			$(container.element).show();
			width = $(container.element).width();
			$(this.domElement).css({width:width + 'px',right:right + 'px'});
			this.currentContainerId = identifier;
			container.plugin.didShowContent();
		}
	},

	registerContainer:function(identifier,domElement,button,plugin) {
		var containerInfo = {
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
			paella.events.trigger(paella.events.showPopUp,{identifier:this.popUpIdentifier,button:this});
		});
		$(button).keyup(function(event) {
			if ( (event.keyCode == 13) && (!this.plugin.isPopUpOpen()) ){
				paella.events.trigger(paella.events.showPopUp,{identifier:this.popUpIdentifier,button:this});
			}
			else if ( (event.keyCode == 27)){
				paella.events.trigger(paella.events.hidePopUp,{identifier:this.popUpIdentifier,button:this});
			}
		});
		plugin.containerManager = this;
	}
});

Class ("paella.TimelineContainer", paella.PopUpContainer,{
	hideContainer:function(identifier,button) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId==identifier) {
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
			prevContainer.plugin.willHideContent();
			$(prevContainer.element).hide();
			prevContainer.plugin.didHideContent();
			container.plugin.willShowContent();
			$(container.element).show();
			this.currentContainerId = identifier;
			height = $(container.element).height();
			$(this.domElement).css({height:height + 'px'});
			container.plugin.didShowContent();
		}
		else if (container && this.currentContainerId==identifier) {
			container.plugin.willHideContent();
			$(container.element).hide();
			container.button.className = container.button.className.replace(' selected','');
			$(this.domElement).css({height:'0px'});
			this.currentContainerId = -1;
			container.plugin.didHideContent();
		}
		else if (container) {
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


	
Class ("paella.UIPlugin", paella.Plugin, {
	ui: null,
	
	checkVisibility: function() {
		var modes = this.config.visibleOn || [	paella.PaellaPlayer.mode.standard, 
												paella.PaellaPlayer.mode.fullscreen, 
												paella.PaellaPlayer.mode.extended, 
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
	$(elem).click(function(event) {
		this.plugin.action(this);
	});
	$(elem).keyup(function(event) {
		if (event.keyCode == 13) {
			this.plugin.action(this);
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


Class ("paella.EventDrivenPlugin", paella.Plugin,{
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
