

import { DomClass } from './dom';
import Plugin from './dom/Plugin';


export default class VideoPlugin extends Plugin {
    get type() { return "video"; }

    get streamType() { return "mp4"; }

    async isCompatible() {
        return false;
    }

    async getVideoInstance(/*playerContainer*/) {
        return null;
    }
}

export class Video extends DomClass {
    constructor(tag, player, parent) {
        const attributes = {
            "class": "video-player"
        };
        super(player, {tag, attributes, parent});

        this._streamData = null;
        this._ready = false;
    }

    get streamData() {
        return this._streamData;
    }

    get ready() {
        return this._ready;
    }

    async load(streamData) {
        this._streamData = streamData;
        return this.loadStreamData(streamData);
    }

    // The video instance must implement the following functions and properties

    async play() {
        return false;
    }
    
    async pause() {
        return false;
    }

    async duration() {
        return -1;
    }

    async currentTime() {
        return -1;
    }

    async setCurrentTime(/* t */) {
        return false;
    }

    async volume() {
        return -1;
    }

    async setVolume(/* v */) {
        return false;
    }

    async paused() {
        return true;
    }

    async playbackRate() {
        return -1;
    }

    async setPlaybackRate() {
        return false;
    }

    async getQualities() {
        return null;
    }

    async setQuality(/* q */) {
        return false;
    }

    get currentQuality() {
        return null;
    }

    async getDimensions() {
        return null;
    }

    async loadStreamData(streamData) {
        return false;
    }
}
