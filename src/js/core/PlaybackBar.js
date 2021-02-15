import { DomClass, createElementWithHtmlText } from 'paella/js/core/dom';

import Events, { bindEvent } from 'paella/js/core/Events';
import ProgressIndicator from 'paella/js/core/ProgressIndicator';
import { loadPluginsOfType } from 'paella/js/core/Plugin';

import 'paella/styles/PlaybackBar.css';

export default class PlaybackBar extends DomClass {
	constructor(player,parent) {
		const attributes = {
			"class": "playback-bar"
		};
		super(player, { attributes, parent });
		
		this._progressIndicator = new ProgressIndicator(player, this.element);
		this._buttonPluginsLeft = createElementWithHtmlText(
			`<div class="button-plugins left-side"></div>`, this.element);
		this._buttonPluginsRight = createElementWithHtmlText(
			`<div class="button-plugins right-side"></div>`, this.element);
	}
	
	async load() {
		const leftButtons = [];
		const rightButtons = [];
		
		this._frameList = this.player.videoManifest;
		
		async function addButtonPlugin(plugin, arrayButtons, parent) {
			const button = createElementWithHtmlText(`
				<button class="button-plugin ${ plugin.className }"><i style="pointer-events: none">${ plugin.icon }</i></button>
			`, parent);
			plugin._button = button;
			button._pluginData = plugin;
			button.addEventListener("click", (evt) => {
				evt.target._pluginData.action();
			});
		}
		
		console.debug("Loading button plugins");
		loadPluginsOfType(this.player,"button",(plugin) => {
			console.debug(` Button plugin: ${ plugin.name }`);
			if (plugin.side == "left") {
				addButtonPlugin(plugin, leftButtons, this.buttonPluginsLeft);
			}
			else if (plugin.side == "right") {
				addButtonPlugin(plugin, rightButtons, this.buttonPluginsRight);
			}
		});
		
	}
	
	hideUserInterface() {
		console.debug("Hide playback bar user interface");
		this.hide();
	}
	
	showUserInterface() {
		this.show();
	}
	
	get buttonPluginsRight() {
		return this._buttonPluginsRight;
	}
	
	get buttonPluginsLeft() {
		return this._buttonPluginsLeft;
	}
	
	get progressIndicator() {
		return this._progressIndicator;
	}
	
	onResize() {
		this.progressIndicator.onResize();
	}
}