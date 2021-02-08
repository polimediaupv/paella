import ButtonPlugin from 'paella/core/ButtonPlugin';
import Events, { bindEvent } from 'paella/core/Events';

import fullscreenIcon from 'icons/fullscreen.svg';

export default class PauseButtonPlugin extends ButtonPlugin {
	get icon() { return fullscreenIcon; }
		
	async load() {

	}
	
	async action() {
		alert("Fullscreen not implemented");
	}
}