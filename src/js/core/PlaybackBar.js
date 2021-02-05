import { DomClass } from 'paella/core/dom';

import playIcon from 'icons/play.svg';
import pauseIcon from 'icons/pause.svg';
import fullscreenIcon from 'icons/fullscreen.svg';
import Events, { bindEvent } from 'paella/core/Events';

import 'styles/PlaybackBar.css';

export default class PlaybackBar extends DomClass {
	constructor(player,parent) {
		const attributes = {
			"class": "playback-bar"
		};
		
		// TODO: Test code, the button and fullscreen buttons are hardcoded
		const children = `
		<div class="progress-indicator"></div>
		<div class="button-plugins left-side">
			<button class="button-plugin play-button"><i>${ playIcon }</i></button>
			<button class="button-plugin pause-button"><i>${ pauseIcon }</i></button>
		</div>
		<div class="button-plugins right-side">
			<button class="button-plugin fullscreen-button"><i>${ fullscreenIcon }</i></button>
		</div>
		`;
		
		super(player, { attributes, children, parent });
		
		// TODO: Test code
		const testPlayButton = this.element.getElementsByClassName("play-button")[0];
		const testPauseButton = this.element.getElementsByClassName("pause-button")[0];
		const testFullscreenButton = this.element.getElementsByClassName("fullscreen-button")[0];
	
		testPlayButton.style.display = "none";
		testPlayButton.addEventListener("click", async (evt) => {
			await this.player.videoContainer.play();
			evt.stopPropagation();
		});	
		
		testPauseButton.addEventListener("click", async (evt) => {
			await this.player.videoContainer.pause();
			evt.stopPropagation();
		});	
	
		bindEvent(this.player, Events.PLAY, () => {
			testPlayButton.style.display = "none";
			testPauseButton.style.display = "block";
		});
		
		bindEvent(this.player, Events.PAUSE, () => {
			testPlayButton.style.display = "block";
			testPauseButton.style.display = "none";
		});
	}
}