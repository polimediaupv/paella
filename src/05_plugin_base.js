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


(function() {

class PluginManager {
	
	setupPlugin(plugin) {
		plugin.setup();
		this.enabledPlugins.push(plugin);
		if (eval("plugin instanceof paella.UIPlugin")) {
			plugin.checkVisibility();
		}	
	}

	checkPluginsVisibility() {	
		this.enabledPlugins.forEach(function(plugin) {		
			if (eval("plugin instanceof paella.UIPlugin")) {
				plugin.checkVisibility();
			}								
		});	
	}

	constructor() {
		this.targets = null;
		this.pluginList =  [];
		this.eventDrivenPlugins =  [];
		this.enabledPlugins =  [];
		this.doResize =  true;
		
		this.targets = {};
		paella.events.bind(paella.events.loadPlugins,(event) => {
			this.loadPlugins("paella.DeferredLoadPlugin");
		});
		
		var timer = new paella.utils.Timer(() => {
			if (paella.player && paella.player.controls && this.doResize) paella.player.controls.onresize();
		}, 1000);
		timer.repeat = true;
	}

	setTarget(pluginType,target) {
		if (target.addPlugin) {
			this.targets[pluginType] = target;
		}
	}

	getTarget(pluginType) {
		// PluginManager can handle event-driven events:
		if (pluginType=="eventDriven") {
			return this;
		}
		else {
			var target = this.targets[pluginType];
			return target;
		}
	}

	registerPlugin(plugin) {
		// Registra los plugins en una lista y los ordena
		this.importLibraries(plugin);
		this.pluginList.push(plugin);
		this.pluginList.sort(function(a,b) {
			return a.getIndex() - b.getIndex();
		});
	}

	importLibraries(plugin) {
		plugin.getDependencies().forEach(function(lib) {
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.src = 'javascript/' + lib + '.js';
			document.head.appendChild(script);
		});
	}
	
	// callback => function(plugin,pluginConfig)
	loadPlugins(pluginBaseClass) {
		if (pluginBaseClass != undefined) {
			var This = this;
			this.foreach(function(plugin,config) {
				// Prevent load a plugin twice
				if (plugin.isLoaded()) return;
				if (eval("plugin instanceof " + pluginBaseClass)) {
					if (config.enabled) {
						paella.log.debug("Load plugin (" + pluginBaseClass + "): " + plugin.getName());
						plugin.config = config;							
						plugin.load(This);
					}				
				}
			});
		}
	}
	
	foreach(callback) {
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
	}

	addPlugin(plugin) {
		// Prevent add a plugin twice
		if (plugin.__added__) return;
		plugin.__added__ = true;
		plugin.checkEnabled((isEnabled) => {
			if (plugin.type=="eventDriven" && isEnabled) {
				paella.pluginManager.setupPlugin(plugin);
				this.eventDrivenPlugins.push(plugin);
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
	}

	getPlugin(name) {
		for (var i=0;i<this.pluginList.length;++i) {
			if (this.pluginList[i].getName()==name) return this.pluginList[i];
		}
		return null;
	}

	registerPlugins() {
		g_pluginCallbackList.forEach((pluginCallback) => {
			let PluginClass = pluginCallback();
			let pluginInstance = new PluginClass();
			if (pluginInstance.getInstanceName()) {
				paella.plugins = paella.plugins || {};
				paella.plugins[pluginInstance.getInstanceName()] = pluginInstance;
			}
			paella.pluginManager.registerPlugin(pluginInstance);
		});
	}
}

paella.PluginManager = PluginManager;

paella.pluginManager = new paella.PluginManager();

let g_pluginCallbackList = [];
paella.addPlugin = function(cb) {
	g_pluginCallbackList.push(cb);
};

	
class Plugin {
	get type() { return ""; }

	isLoaded() { return this.__loaded__; }

	getDependencies() {
		return [];
	}

	load(pluginManager) {
		if (this.__loaded__) return;
		this.__loaded__ = true;
		var target = pluginManager.getTarget(this.type);
		if (target && target.addPlugin) {
			target.addPlugin(this);
		}
	}

	getInstanceName() { return null; }

	getRootNode(id) {
		return null;
	}

	checkEnabled(onSuccess) {
		onSuccess(true);
	}

	setup() {

	}

	getIndex() {
		return 0;
	}

	getName() {
		return "";
	}
}

paella.Plugin = Plugin;
	
class FastLoadPlugin extends paella.Plugin {}
class EarlyLoadPlugin extends paella.Plugin {}
class DeferredLoadPlugin extends paella.Plugin {}

paella.FastLoadPlugin = FastLoadPlugin;
paella.EarlyLoadPlugin = EarlyLoadPlugin;
paella.DeferredLoadPlugin = DeferredLoadPlugin;

function addMenuItemTabindex(plugin) {
	if (plugin.button.tabIndex>0) {
		paella.tabIndex.insertAfter(plugin.button,plugin.menuContent.children);
	}
}

function removeMenuItemTabindexplugin(plugin) {
	if (plugin.button.tabIndex>0) {
		paella.tabIndex.removeTabIndex(plugin.menuContent.children);
	}
}

function hideContainer(identifier,container,swapFocus) {
	paella.events.trigger(paella.events.hidePopUp,{container:container});
	container.plugin.willHideContent();
	if (container.plugin.getButtonType() == paella.ButtonPlugin.type.menuButton) {
		removeMenuItemTabindexplugin(container.plugin);
	}
	$(container.element).hide();
	$(this.domElement).css({width:'0px'});
	container.button.className = container.button.className.replace(' selected','');
	this.currentContainerId = -1;
	container.plugin.didHideContent();

	if (container.plugin.getButtonType() == paella.ButtonPlugin.type.menuButton && swapFocus) {
		$(container.button).focus();
	}
}

function showContainer(identifier,container,button,swapFocus) {
	paella.events.trigger(paella.events.showPopUp,{container:container});
	container.plugin.willShowContent();
	container.button.className = container.button.className + ' selected';
	$(container.element).show();
	if (container.plugin.getButtonType() == paella.ButtonPlugin.type.menuButton) {
	 	addMenuItemTabindex(container.plugin);
	}
	let width = $(container.element).width();
	if (container.plugin.getAlignment() == 'right') {
		var right = $(button.parentElement).width() - $(button).position().left - $(button).width();
		$(this.domElement).css({width:width + 'px', right:right + 'px', left:''});				
	}
	else {
		var left = $(button).position().left;
		$(this.domElement).css({width:width + 'px', left:left + 'px', right:''});						
	}			
	this.currentContainerId = identifier;

	if (container.plugin.getButtonType() == paella.ButtonPlugin.type.menuButton &&
		container.plugin.menuContent.children.length>0 &&
		swapFocus)
	{
		$(container.plugin.menuContent.children[0]).focus();
	}
	container.plugin.didShowContent();			
}

class PopUpContainer extends paella.DomNode {

	constructor(id,className) {
		var style = {};
		super('div',id,style);

		this.containers = null;
		this.currentContainerId = -1;

		this.domElement.className = className;

		this.containers = {};
	}

	hideContainer(identifier, button, swapFocus = false) {
		var container = this.containers[identifier];
		if (container) {
			hideContainer.apply(this,[identifier,container,swapFocus]);
		}
	}

	showContainer(identifier, button, swapFocus = false) {
		var container = this.containers[identifier];
		if (container && this.currentContainerId!=identifier && this.currentContainerId!=-1) {
			var prevContainer = this.containers[this.currentContainerId];
			hideContainer.apply(this,[this.currentContainerId,prevContainer,swapFocus]);
			showContainer.apply(this,[identifier,container,button,swapFocus]);
		}
		else if (container && this.currentContainerId==identifier) {
			hideContainer.apply(this,[identifier,container,swapFocus]);
		}
		else if (container) {
			showContainer.apply(this,[identifier,container,button,swapFocus]);
		}
	}

	registerContainer(identifier,domElement,button,plugin) {
		var containerInfo = {
			identifier:identifier,
			button:button,
			element:domElement,
			plugin:plugin
		};
		this.containers[identifier] = containerInfo;
		if (plugin.closeOnMouseOut && plugin.closeOnMouseOut()) {
			let popUpId = identifier;
			let btn = button;
			$(domElement).mouseleave(function(evt) {
				paella.player.controls.playbackControl().hidePopUp(popUpId,btn);
			});
		}
		

		// this.domElement.appendChild(domElement);
		$(domElement).hide();
		button.popUpIdentifier = identifier;
		button.sourcePlugin = plugin;
		$(button).click(function(event) {
			if (!this.plugin.isPopUpOpen()) {
				paella.player.controls.playbackControl().showPopUp(this.popUpIdentifier,this,false);
			}
			else {
				paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier,this,false);
			}
		});
		$(button).keypress(function(event) {
			if ( (event.keyCode == 13) && (!this.plugin.isPopUpOpen()) ){
				if (this.plugin.isPopUpOpen()) {
					paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier,this,true);
				}
				else {
					paella.player.controls.playbackControl().showPopUp(this.popUpIdentifier,this,true);
				}
			}
			else if ( (event.keyCode == 27)){
				paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier,this,true);
			}
			event.preventDefault();
		});
		$(button).keyup(function(event) {
			event.preventDefault();
		});

		plugin.containerManager = this;
	}
}

paella.PopUpContainer = PopUpContainer;

class TimelineContainer extends paella.PopUpContainer {
	hideContainer(identifier,button) {
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
	}

	showContainer(identifier,button) {
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
}

paella.TimelineContainer = TimelineContainer;
			
class UIPlugin extends paella.DeferredLoadPlugin {
	get ui() { return this._ui; }
	set ui(val) { this._ui = val; }
	
	checkVisibility() {
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
	}
	
	hideUI() {
		this.ui.setAttribute('aria-hidden', 'true');
		$(this.ui).hide();
	}
	
	showUI() {
		var thisClass = this;
		paella.pluginManager.enabledPlugins.forEach(function(p) {
			if (p == thisClass) {
				thisClass.ui.setAttribute('aria-hidden', 'false');
				$(thisClass.ui).show();				
			}
		});	
	}
}

paella.UIPlugin = UIPlugin;
	
class ButtonPlugin extends paella.UIPlugin {
	get type() { return 'button'; }

	constructor() {
		super();
		this.subclass = '';
		this.container = null;
		this.containerManager = null;
		this._domElement = null;
	} 

	getAlignment() {
		return 'left';	// or right
	}

	// Returns the button subclass.
	getSubclass() {
		return "myButtonPlugin";
	}

	getIconClass() {
		return "";
	}

	addSubclass($subclass) {
		$(this.container).addClass($subclass);
	}
	
	removeSubclass($subclass) {
		$(this.container).removeClass($subclass);
	}

	action(button) {
		// Implement this if you want to do something when the user push the plugin button
	}

	getName() {
		return "ButtonPlugin";
	}

	getMinWindowSize() {
		return this.config.minWindowSize || 0;
	}

	buildContent(domElement) {
		// Override if your plugin
	}

	getMenuContent() {
		return [];
	}

	willShowContent() {
		paella.log.debug(this.getName() + " willDisplayContent");
	}

	didShowContent() {
		paella.log.debug(this.getName() + " didDisplayContent");
	}

	willHideContent() {
		paella.log.debug(this.getName() + " willHideContent");
	}

	didHideContent() {
		paella.log.debug(this.getName() + " didHideContent");
	}

	getButtonType() {
		//return paella.ButtonPlugin.type.popUpButton;
		//return paella.ButtonPlugin.type.timeLineButton;
		//return paella.ButtonPlugin.type.menuButton;
		return paella.ButtonPlugin.type.actionButton;
		
	}

	getText() {
		return "";
	}

	getAriaLabel() {
		return "";
	}
	
	setText(text) {
		this.container.innerHTML = '<span class="button-text">' + paella.AntiXSS.htmlEscape(text) + '</span>';
		if (this._i) {
			this.container.appendChild(this._i);
		}
	}

	hideButton() {
		this.hideUI();
	}

	showButton() {
		this.showUI();
	}

	// Utility functions: do not override
	changeSubclass(newSubclass) {
		this.subclass = newSubclass;
		this.container.className = this.getClassName();
	}

	changeIconClass(newClass) {
		this._i.className = 'button-icon ' + newClass;
	}

	getClassName() {
		return paella.ButtonPlugin.kClassName + ' ' + this.getAlignment() + ' ' + this.subclass;
	}

	getContainerClassName() {
		if (this.getButtonType()==paella.ButtonPlugin.type.timeLineButton) {
			return paella.ButtonPlugin.kTimeLineClassName + ' ' + this.getSubclass();
		}
		else if (this.getButtonType()==paella.ButtonPlugin.type.popUpButton) {
			return paella.ButtonPlugin.kPopUpClassName + ' ' + this.getSubclass();
		}
		else if (this.getButtonType()==paella.ButtonPlugin.type.menuButton) {
			return paella.ButtonPlugin.kPopUpClassName + ' menuContainer ' + this.getSubclass();
		}
	}

	setToolTip(message) {
		this.button.setAttribute("title", message);
		this.button.setAttribute("aria-label", message);
	}

	getDefaultToolTip() {
		return "";
	}

	isPopUpOpen() {
		return (this.button.popUpIdentifier == this.containerManager.currentContainerId);
	}

	getExpandableContent() {
		return null;
	}

	expand() {
		if (this._expand) {
			$(this._expand).show();
		}
	}

	contract() {
		if (this._expand) {
			$(this._expand).hide();
		}
	}

	static BuildPluginButton(plugin,id) {
		plugin.subclass = plugin.getSubclass();
		var elem = document.createElement('div');
		let ariaLabel = plugin.getAriaLabel() || paella.utils.dictionary.translate(plugin.config.ariaLabel) || "";
		if (ariaLabel!="") {
			elem = document.createElement('button');
		}
		elem.className = plugin.getClassName();
		elem.id = id;

		let buttonText = document.createElement('span');
		buttonText.className = "button-text";
		buttonText.innerHTML = paella.AntiXSS.htmlEscape(plugin.getText());
		buttonText.plugin = plugin;
		elem.appendChild(buttonText);
		if (ariaLabel) {
			let tabIndex = paella.tabIndex.next;
			elem.setAttribute("tabindex", tabIndex);
			elem.setAttribute("aria-label",ariaLabel);
		}	
		elem.setAttribute("alt", "");

		elem.plugin = plugin;
		plugin.button = elem;
		plugin.container = elem;
		plugin.ui = elem;
		plugin.setToolTip(plugin.getDefaultToolTip());

		let icon = document.createElement('i');
		icon.className = 'button-icon ' + plugin.getIconClass();
		icon.plugin = plugin;
		elem.appendChild(icon);
		plugin._i = icon;
			
		function onAction(self) {
			paella.userTracking.log("paella:button:action", self.plugin.getName());
			self.plugin.action(self);
		}
		
		$(elem).click(function(event) {
			onAction(this);
		});
		$(elem).keypress(function(event) {
			 onAction(this);
			 event.preventDefault();
		});

		$(elem).focus(function(event) {
			plugin.expand();
		});

		return elem;
	}

	static BuildPluginExpand(plugin,id) {
		let expandContent = plugin.getExpandableContent();
		if (expandContent) {
			let expand = document.createElement('span');
			expand.plugin = plugin;
			expand.className = 'expandable-content ' + plugin.getClassName();
			plugin._expand = expand;
			expand.appendChild(expandContent);
			$(plugin._expand).hide();
			return expand;
		}
		return null;
	}

	static BuildPluginPopUp(parent,plugin,id) {
		plugin.subclass = plugin.getSubclass();
		var elem = document.createElement('div');
		parent.appendChild(elem);
		elem.className = plugin.getContainerClassName();
		elem.id = id;
		elem.plugin = plugin;
		plugin.buildContent(elem);
		return elem;
	}

	static BuildPluginMenu(parent,plugin,id) {
		plugin.subclass = plugin.getSubclass();
		var elem = document.createElement('div');
		parent.appendChild(elem);
		elem.className = plugin.getContainerClassName();
		elem.id = id;
		elem.plugin = plugin;
		plugin.menuContent = elem;
		plugin.rebuildMenu(elem);

		return elem;
	}

	set menuContent(domElem) {
		this._domElement = domElem;
	}

	get menuContent() {
		return this._domElement;
	}

	rebuildMenu() {
		function getButtonItem(itemData,plugin) {
			var elem = document.createElement('div');
			elem.className = itemData.className +  " menuItem";
			if(itemData.default) {
				elem.className += " selected";
			}

			elem.id = itemData.id;
			elem.innerText = itemData.title;
			if (itemData.icon) {
				elem.style.backgroundImage = `url(${ itemData.icon })`;
				$(elem).addClass('icon');
			}
			elem.data = {
				itemData: itemData,
				plugin: plugin
			};

			function menuItemSelect(button,data,event) {
				data.plugin.menuItemSelected(data.itemData);
				let buttons = button.parentElement ? button.parentElement.children : [];
				for (let i=0; i<buttons.length; ++i) {
					$(buttons[i]).removeClass('selected');
				}
				$(button).addClass('selected');
			}

			$(elem).click(function(event) {
				menuItemSelect(this,this.data,event);
			});
			$(elem).keypress(function(event) {
				if (event.keyCode == 13) {
					menuItemSelect(this,this.data,event);
				}
				event.preventDefault();
			});
			$(elem).keyup(function(event) {
				if (event.keyCode == 27) {
					paella.player.controls.hidePopUp(this.data.plugin.getName(),null,true);
				}
				event.preventDefault();
			});
			return elem;
		}

		let menuContent = this.getMenuContent();
		this.menuContent.innerHTML = "";
		menuContent.forEach((menuItem) => {
			this.menuContent.appendChild(getButtonItem(menuItem,this));
		});
	}
}

paella.ButtonPlugin = ButtonPlugin;
	
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
	timeLineButton:3,
	menuButton:4
};
	
class VideoOverlayButtonPlugin extends paella.ButtonPlugin {
	get type() { return 'videoOverlayButton'; }

	// Returns the button subclass.
	getSubclass() {
		return "myVideoOverlayButtonPlugin" + " " + this.getAlignment();
	}

	action(button) {
		// Implement this if you want to do something when the user push the plugin button
	}

	getName() {
		return "VideoOverlayButtonPlugin";
	}

	get tabIndex() {
		return -1;
	}
}

paella.VideoOverlayButtonPlugin = VideoOverlayButtonPlugin;
	
	
class EventDrivenPlugin extends paella.EarlyLoadPlugin {
	get type() { return 'eventDriven'; }

	constructor() {
		super();
		var events = this.getEvents();
		for (var i = 0; i<events.length;++i) {
			var event = events[i];
			if (event==paella.events.loadStarted) {
				this.onEvent(paella.events.loadStarted);
			}
		}
	}

	getEvents() {
		return [];
	}

	onEvent(eventType,params) {
	}

	getName() {
		return "EventDrivenPlugin";
	}
}

paella.EventDrivenPlugin = EventDrivenPlugin;
	
})();
