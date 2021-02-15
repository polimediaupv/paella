import ButtonPlugin from 'paella/js/core/ButtonPlugin';
import Events, { bindEvent } from 'paella/js/core/Events';

import fullscreenIcon from 'paella/icons/fullscreen.svg';

export default class PauseButtonPlugin extends ButtonPlugin {
	get icon() { return fullscreenIcon; }
		
	async load() {

	}
	
	async action() {
		alert("Fullscreen not implemented");
	}
}