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


Class ("paella.RightBarPlugin", paella.DeferredLoadPlugin,{
	type:'rightBarPlugin',
	getName:function() { return "es.upv.paella.RightBarPlugin"; },

	buildContent:function(domElement) {

	}
});

Class ("paella.TabBarPlugin", paella.DeferredLoadPlugin,{
	type:'tabBarPlugin',
	getName:function() { return "es.upv.paella.TabBarPlugin"; },

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


Class ("paella.ExtendedAdapter", {
	rightContainer:null,
	bottomContainer:null,

	rightBarPlugins:[],
	tabBarPlugins:[],

	currentTabIndex:0,
	bottomContainerTabs:null,
	bottomContainerContent:null,


	initialize:function() {

		this.rightContainer = document.createElement('div');
		//this.rightContainer.id = this.settings.rightContainerId;
		this.rightContainer.className = "rightPluginContainer";

		this.bottomContainer = document.createElement('div');
		//this.bottomContainer.id = this.settings.bottomContainerId;
		this.bottomContainer.className = "tabsPluginContainer";

		var tabs = document.createElement('div');
		//tabs.id = 'bottomContainer_tabs';
		tabs.className = 'tabsLabelContainer';
		this.bottomContainerTabs = tabs;
		this.bottomContainer.appendChild(tabs);

		var bottomContent = document.createElement('div');
		//bottomContent.id = 'bottomContainer_content';
		bottomContent.className = 'tabsContentContainer';
		this.bottomContainerContent = bottomContent;
		this.bottomContainer.appendChild(bottomContent);



		this.initPlugins();
	},

	initPlugins:function() {
		paella.pluginManager.setTarget('rightBarPlugin', this);
		paella.pluginManager.setTarget('tabBarPlugin', this);
	},

	addPlugin:function(plugin) {
		var thisClass = this;
		plugin.checkEnabled(function(isEnabled) {
			if (isEnabled) {
				paella.pluginManager.setupPlugin(plugin);
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
		var i =0;
		var labels = this.bottomContainer.getElementsByClassName("tabLabel");
		var contents = this.bottomContainer.getElementsByClassName("tabContent");
	
		for (i=0; i < labels.length; ++i) {
			if (labels[i].getAttribute("tab") == tabIndex) {
				labels[i].className = "tabLabel enabled";
			}
			else {
				labels[i].className = "tabLabel disabled";
			}
		}
		
		for (i=0; i < contents.length; ++i) {
			if (contents[i].getAttribute("tab") == tabIndex) {
				contents[i].className = "tabContent enabled";
			}
			else {
				contents[i].className = "tabContent disabled";
			}
		}
	},

	addTabPlugin:function(plugin) {
		var thisClass = this;
		var tabIndex = this.currentTabIndex;

		// Add tab
		var tabItem = document.createElement('div');
		tabItem.setAttribute("tab", tabIndex);
		tabItem.className = "tabLabel disabled";		
		tabItem.innerHTML = plugin.getTabName();
		tabItem.plugin = plugin;
		$(tabItem).click(function(event) { if (/disabled/.test(this.className)) { thisClass.showTab(tabIndex); this.plugin.action(this); } });
		$(tabItem).keyup(function(event) {
			if (event.keyCode == 13) {
				if (/disabledTabItem/.test(this.className)) { thisClass.showTab(tabIndex); this.plugin.action(this); }
			}
		});
		this.bottomContainerTabs.appendChild(tabItem);

		// Add tab content
		var tabContent = document.createElement('div');
		tabContent.setAttribute("tab", tabIndex);
		tabContent.className = "tabContent disabled " + plugin.getSubclass();
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
	}
});


paella.extendedAdapter = new paella.ExtendedAdapter();