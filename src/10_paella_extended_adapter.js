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

(() => {

	class RightBarPlugin extends paella.DeferredLoadPlugin {
		get type() { return 'rightBarPlugin'; }
		getName() { return "es.upv.paella.RightBarPlugin"; }
	
		buildContent(domElement) {}
	}

	paella.RightBarPlugin = RightBarPlugin;
	
	class TabBarPlugin extends paella.DeferredLoadPlugin {
		get type() { return 'tabBarPlugin'; }
		getName() { return "es.upv.paella.TabBarPlugin"; }
	
		getTabName() {
			return "New Tab";
		}
	
		action(tab) {
		}
	
		buildContent(domElement) {
		}
		
		setToolTip(message) {
			this.button.setAttribute("title", message);
			this.button.setAttribute("aria-label", message);
		}
	
		getDefaultToolTip() {
			return "";
		}
	}

	paella.TabBarPlugin = TabBarPlugin;
	
	
	class ExtendedAdapter {
		
		constructor() {
			this.rightContainer = null;
			this.bottomContainer = null;
			this.rightBarPlugins = [];
			this.tabBarPlugins = [];
			this.currentTabIndex = 0;
			this.bottomContainerTabs = null;
			this.bottomContainerContent = null;
	
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
		}
	
		initPlugins() {
			paella.pluginManager.setTarget('rightBarPlugin', this);
			paella.pluginManager.setTarget('tabBarPlugin', this);
		}
	
		addPlugin(plugin) {
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
		}
	
		showTab(tabIndex) {
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
		}
	
		addTabPlugin(plugin) {
			var thisClass = this;
			var tabIndex = this.currentTabIndex;
	
			// Add tab
			var tabItem = document.createElement('div');
			tabItem.setAttribute("tab", tabIndex);
			tabItem.className = "tabLabel disabled";		
			tabItem.innerText = plugin.getTabName();
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
		}
	
		addRightBarPlugin(plugin) {
			var container = document.createElement('div');
			container.className = "rightBarPluginContainer " + plugin.getSubclass();
			this.rightContainer.appendChild(container);
			plugin.buildContent(container);
		}
	}

	paella.ExtendedAdapter = ExtendedAdapter;
	
	
	paella.extendedAdapter = new paella.ExtendedAdapter();
})();
