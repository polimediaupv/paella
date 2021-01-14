
import { DomClass } from './dom';

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

