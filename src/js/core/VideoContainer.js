
import { DomClass } from './dom';
import { getValidLayouts } from './VideoLayout';

export default class VideoContainer extends DomClass {

    constructor(player, parent) {
        const attributes = {
            "class": "video-container"
        };
        const children = `<div class="background-container">video background</div>`
        super(player, {attributes, children, parent});

        this._ready = false;
    }

    async load(streamData) {
        this._ready = true;

        const validLayouts = getValidLayouts(this.player, streamData);

        console.log(validLayouts);

        console.log("Load videos");
    }

    get ready() {
        return this._ready;
    }

    async play() {

    }

    async pause() {

    }

    async stop() {

    }
}

