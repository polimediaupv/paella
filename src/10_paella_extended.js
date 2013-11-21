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

paella.ExtendedPlugin = Class.create(paella.Plugin, {
	type:'extendedPlugin',
	
	getName:function() { return "es.upv.paella.extended.Plugin"; },
	
	checkEnabled:function(onSuccess) {
		onSuccess(paella.extended!=null);
	},
	
	getIndex:function() {
		return 10000;
	}
});

paella.RightBarPlugin = Class.create(paella.ExtendedPlugin,{
	type:'rightBarPlugin',
	getName:function() { return "es.upv.paella.extended.RightBarPlugin"; },

	buildContent:function(domElement) {
		
	}
});

paella.TabBarPlugin = Class.create(paella.ExtendedPlugin,{
	type:'tabBarPlugin',
	getName:function() { return "es.upv.paella.extended.TabBarPlugin"; },
	
	getTabName:function() {
		return "New Tab";
	},
	
	action:function(tab) {
		
	},

	buildContent:function(domElement) {
		
	},
	
	setToolTip:function(message) {
		this.button.setAttribute("title", message);
		this.button.setAttribute("aria-label", message);
	},
	
	getDefaultToolTip: function() {
		return "";
	}	
});

paella.Extended = Class.create({
	container:null,
	paellaContainer:null,
	rightContainer:null,
	bottomContainer:null,

	settings:{
		containerId:'paellaExtendedContainer',
		paellaContainerId:'playerContainer',
		rightContainerId:'paella_right',
		bottomContainerId:'paella_bottom',
		containerClass:'paellaExtendedContainer',
		playerContainerClass:'playerContainer',
		rightContainerClass:'rightContainer',
		bottomContainerClass:'bottomContainer',
		aspectRatio:1.777777,
		initDelegate:new paella.InitDelegate({accessControl:new paella.AccessControl(),videoLoader:new paella.VideoLoader})
	},
	
	rightBarPlugins:[],
	tabBarPlugins:[],
	
	currentTabIndex:0,
	bottomContainerTabs:null,
	bottomContainerContent:null,

	initialize:function(settings) {
		this.saveSettings(settings);
		this.loadPaellaExtended();
		var thisClass = this;
		$(window).resize(function(event) { thisClass.onresize() });
	},
	
	saveSettings:function(settings) {
		if (settings) {
			for (var key in settings) {
				this.settings[key] = settings[key];
			}
		}
	},
	
	loadPaellaExtended:function() {
		this.container = $('#' + this.settings.containerId)[0];
		if (!this.container) {
			var body = $('body')[0];
			body.innerHTML = "";
			this.container = document.createElement('div');
			this.container.id = this.settings.containerId;
			this.container.className = this.settings.containerClass;
			body.appendChild(this.container);
		}
		else {
			this.container.innerHTML = "";
			this.container.className = this.settings.containerClass;
		}
		
		this.paellaContainer = document.createElement('div');
		this.paellaContainer.id = this.settings.paellaContainerId;
		this.paellaContainer.className=this.settings.playerContainerClass;
		this.container.appendChild(this.paellaContainer);
		
		this.rightContainer = document.createElement('div');
		this.rightContainer.id = this.settings.rightContainerId;
		this.rightContainer.className = this.settings.rightContainerClass;
		this.container.appendChild(this.rightContainer);
		
		this.bottomContainer = document.createElement('div');
		this.bottomContainer.id = this.settings.bottomContainerId;
		this.bottomContainer.className=this.settings.bottomContainerClass;
		this.container.appendChild(this.bottomContainer);
		
		var tabs = document.createElement('div');
		tabs.id = 'bottomContainer_tabs';
		tabs.className = 'bottomContainerTabs';
		this.bottomContainerTabs = tabs;
		this.bottomContainer.appendChild(tabs);
		
		var bottomContent = document.createElement('div');
		bottomContent.id = 'bottomContainer_content';
		bottomContent.className = 'bottomContainerContent';
		this.bottomContainerContent = bottomContent;
		this.bottomContainer.appendChild(bottomContent);
		

		var thisClass = this;
		$(document).bind(paella.events.loadComplete,function(event,params) {
			thisClass.setMainProfile();
		});

		
		this.initPlugins();

		initPaellaEngage(this.paellaContainer.id,this.settings.initDelegate);
		this.onresize();
	},
	
	initPlugins:function() {
		paella.pluginManager.setTarget('rightBarPlugin',this);
		paella.pluginManager.setTarget('tabBarPlugin',this);
	},
	
	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				plugin.setup();
				if (plugin.type=='rightBarPlugin') {
					thisClass.rightBarPlugins.push(plugin);
					thisClass.addRightBarPlugin(plugin);
				}
				if (plugin.type=='tabBarPlugin') {
					thisClass.tabBarPlugins.push(plugin);
					thisClass.addTabPlugin(plugin);
				}	
			}
		});
	},
	
	showTab:function(tabIndex) {
		for (var i=0;i<this.tabBarPlugins.length;++i) {
			var tabItem = $("#tab_" + i)[0];
			var tabContent = $("#tab_content_" + i)[0];
		
			if (i==tabIndex) {
				tabItem.className = "bottomContainerTabItem enabledTabItem";
				tabContent.className = "bottomContainerContent enabledTabContent";
			}
			else {
				tabItem.className = "bottomContainerTabItem disabledTabItem";
				tabContent.className = "bottomContainerContent disabledTabContent";			
			}
		}
	},

	addTabPlugin:function(plugin) {
		var tabIndex = this.currentTabIndex;
		
		// Add tab
		var tabItem = document.createElement('div');
		tabItem.id = "tab_" + tabIndex;
		tabItem.className = "bottomContainerTabItem disabledTabItem";
		tabItem.innerHTML = plugin.getTabName();
		tabItem.plugin = plugin;
		var thisClass = this;
		$(tabItem).click(function(event) { if (/disabledTabItem/.test(this.className)) { thisClass.showTab(tabIndex); this.plugin.action(this); } });
		$(tabItem).keyup(function(event) {
			if (event.keyCode == 13) {
				if (/disabledTabItem/.test(this.className)) { thisClass.showTab(tabIndex); this.plugin.action(this); } 
			}
		});		
		this.bottomContainerTabs.appendChild(tabItem);
		
		// Add tab content
		var tabContent = document.createElement('div');
		tabContent.id = "tab_content_" + tabIndex;
		tabContent.className = "bottomContainerContent disabledTabContent " + plugin.getSubclass();
		this.bottomContainerContent.appendChild(tabContent);
		plugin.buildContent(tabContent);
		
		plugin.button = tabItem;
		plugin.container = tabContent;

		plugin.button.setAttribute("tabindex", 3000+plugin.getIndex());
		plugin.button.setAttribute("alt", "");
		plugin.setToolTip(plugin.getDefaultToolTip());
		

		// Show tab
		if (this.firstTabShown===undefined) {
			this.showTab(tabIndex);
			this.firstTabShown = true;
		}
		++this.currentTabIndex;
	},
	
	addRightBarPlugin:function(plugin) {
		var container = document.createElement('div');
		container.className = "rightBarPluginContainer " + plugin.getSubclass();
		this.rightContainer.appendChild(container);
		plugin.buildContent(container);
	},

	setMainProfile:function() {
		var profile = 'full';
		var cookieProfile = paella.utils.cookies.get("paella.extended.profile");
		if (cookieProfile) {
			profile = cookieProfile;
		}
		else if ((paella) && (paella.player) && (paella.player.config) && (paella.player.config.player) && (paella.player.config.player.defaultProfile)){
			profile = paella.player.config.player.defaultProfile;
		}
		this.setProfile(profile);
	},
	
	setProfile:function(profileName) {
		paella.utils.cookies.set("paella.extended.profile", profileName);
		var thisClass = this;
		this.container.className = this.settings.containerClass + " " + profileName;
		this.paellaContainer.className = this.settings.playerContainerClass + " " + profileName;
		this.rightContainer.className = this.settings.rightContainerClass + " " + profileName;
		this.bottomContainer.className = this.settings.bottomContainerClass + " " + profileName;
		this.onresize();
		if (paella.player) {
			paella.player.onresize();
		}
	},
	
	getProfile:function() {
		var regExp = new RegExp(this.settings.containerClass + " ([a-zA-Z0-9]+)");
		if (regExp.test(paella.extended.container.className)) {
			return RegExp.$1;
		}
		return '';
		//return /paellaExtendedContainer ([a-zA-Z0-9]+)/.test(paella.extended.container.className)
	},

	onresize:function() {
	/*
		var aspect = this.settings.aspectRatio;
		var width = jQuery(this.paellaContainer).width();
		var height = width / aspect;
		this.paellaContainer.style.height = height + 'px';
	*/
	}
});

function initPaellaExtended(settings) {
	paella.extended = new paella.Extended(settings);
}
