import VideoPlugin, { Video } from '../core/VideoPlugin';

let video = null;

export function supportsVideoType(type) {
    if (!type) return false;
    if (!video) {
        video = document.createElement("video");
    }

    const canPlay = video.canPlayType(type);
    return canPlay === "maybe" || canPlay === "probably";
}

export class Mp4Video extends Video {
    constructor(player, parent) {
        super('video', player, parent);
    }

    // TODO: implement
    async play() { 
        await this.waitForLoaded();
        return this.video.play();
    }
    
    async pause() {
        await this.waitForLoaded();
        return this.video.pause();
    }

    async duration() {
        await this.waitForLoaded();
        return this.video.duration;
    }

    async currentTime() {
        await this.waitForLoaded();
        return this.video.currentTime;
    }

    async setCurrentTime(t) {
        await this.waitForLoaded();
        return this.video.currentTime = t;
    }

    async volume() {
        await this.waitForLoaded();
        return this.video.volume;
    }

    async setVolume(v) {
        await this.waitForLoaded();
        return this.video.volume = v;
    }

    async paused() {
        await this.waitForLoaded();
        return this.video.paused();
    }

    async playbackRate() {
        await this.waitForLoaded();
        return this.video.playbackRate;
    }

    async setPlaybackRate(pr) {
        await this.waitForLoaded();
        return this.video.playbackRate = pr;
    }

    async getQualities() {
        // TODO: implement this
    }

    async setQuality(/* q */) {
        // TODO: implement this
    }

    get currentQuality() {
        // TODO: implement this
    }

    async getDimensions() {
        await this.waitForLoaded();
        return { w: this.video.videoWidth, h: this.video.videoHeight };
    }

    // This function is called when the player loads, and it should
    // make everything ready for video playback to begin.
    async loadStreamData(streamData) {
        console.debug("es.upv.paella.mp4VideoFormat: loadStreamData");

        this._sources = null;
        this._currentQuality = 0;

        this._sources = streamData.sources.mp4;
        console.log(this._sources);
        
        this._currentQuality = this._sources.length - 1;
        this._currentSource = this._sources[this._currentQuality];

        this.video.src = this._currentSource.src;

        await this.waitForLoaded();

        console.debug(`es.upv.paella.mp4VideoFormat (${ this.streamData.content }): video loaded and ready.`);
    }

    async waitForLoaded() {
        return new Promise((resolve,reject) => {
            if (this.ready) {
                resolve();
            }
            else {
                this.video.addEventListener('loadeddata', () => {
                    if (this.video.readyState >= 2) {
                        this._ready = true;
                        resolve();
                    }
                })
            }
        })
    }
}

export default class Mp4VideoPlugin extends VideoPlugin {
    get streamType() {
        return "mp4";
    }

    isCompatible(streamData) {
        const { mp4 } = streamData.sources;
        return mp4 && supportsVideoType(mp4[0]?.mimetype);
    }

    async getVideoInstance(playerContainer) {
        return new Mp4Video(this.player, playerContainer);
    }
}