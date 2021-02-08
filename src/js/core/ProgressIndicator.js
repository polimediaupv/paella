import { DomClass } from 'paella/core/dom';
import Events, { bindEvent } from 'paella/core/Events';

export default class ProgressIndicator extends DomClass {
	constructor(player, parent) {
		const attributes = {
			"class": "progress-indicator"
		};
		const children = `
		<canvas class="progress-canvas canvas-layer-0"></canvas>
		<div class="progress-indicator-container">
			<div class="progress-indicator-content"></div>
		</div>
		<canvas class="progress-canvas canvas-layer-1"></canvas>
		`;
		super(player, { attributes, children, parent });
		
		this._canvas = [
			this.element.getElementsByClassName("progress-canvas")[0],
			this.element.getElementsByClassName("progress-canvas")[1]
		];
		this._progressContainer = this.element.getElementsByClassName("progress-indicator-container")[0];
		this._progressIndicator = this.element.getElementsByClassName("progress-indicator-content")[0];
		
		this.onResize();
	
		let drag = false;
		const updateProgressIndicator = async (currentTime) => {
			const duration = await player.videoContainer.duration();
			const newWidth = currentTime * 100 / duration;
			this.progressIndicator.style.width = `${ newWidth }%`;
		}
		
		const positionToTime = async (pos) => {
			const barWidth = this.element.offsetWidth;
			const duration = await player.videoContainer.duration();
			return pos * duration / barWidth;
		}
	
		bindEvent(this.player, Events.TIMEUPDATE, async ({ currentTime }) => {
			if (!drag) {
				await updateProgressIndicator(currentTime);
			}
		});
		
		bindEvent(this.player, Events.SEEK, async ({ prevTime, newTime }) => {
			if (!drag) {
				await updateProgressIndicator(newTime);
			}
		});
		
		this.progressContainer.addEventListener("mousedown", async (evt) => {
			drag = true;
			const newTime = await positionToTime(evt.offsetX);
			await updateProgressIndicator(newTime);
		});
		
		this.progressContainer.addEventListener("mousemove", async (evt) => {
			if (drag) {
				const newTime = await positionToTime(evt.offsetX);
				await updateProgressIndicator(newTime);
			}
		});
		
		this.progressContainer.addEventListener("mouseup", async (evt) => {
			const newTime = await positionToTime(evt.offsetX);
			await updateProgressIndicator(newTime);
			await player.videoContainer.setCurrentTime(newTime);
			drag = false;
		});
		
		this.progressContainer.addEventListener("mouseleave", async (evt) => {
			if (drag) {
				const newTime = await positionToTime(evt.offsetX);
				await player.videoContainer.setCurrentTime(newTime);
				drag = false;
			}
		});
	}
	
	get canvasLayer0() {
		return this._canvas[0];
	}
	
	get canvasLayer1() {
		return this._canvas[1];
	}
	
	get progressIndicator() {
		return this._progressIndicator;
	}
	
	get progressContainer() {
		return this._progressContainer;
	}
	
	onResize() {
		const size = {
			w: this.element.offsetWidth,
			h: this.element.offsetHeight
		};
		this._canvas.forEach(c => {
			c.width = size.w;
			c.height = size.h;
		});
	}
}

