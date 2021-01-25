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
    constructor(tag, player, parent) {
        super('video', player, parent);
    }

    // TODO: implement
    async play() {  }
    
    async pause() {  }

    async duration() { }

    async currentTime() { }

    async setCurrentTime(t) {  }

    async volume() {  }

    async setVolume(v) { }

    async paused() { }

    async playbackRate() { }

    async setPlaybackRate() { }

    async getQualities() { }

    async setQuality(q) {  }

    get currentQuality() {  }

    async getDimensions() { }

    // This function is called when the player loads, and it should
    // make everything ready for video playback to begin.
    async loadStreamData(streamData) {
        console.log(streamData);
        console.log("loadStreamData");
        
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