import VideoPlugin, { Video } from '../core/VideoPlugin';

export class Mp4Video extends Video {
    constructor(tag, player, parent) {
        super('video', player, parent);
    }

    // TODO: implement
}

export default class Mp4VideoPlugin extends VideoPlugin {
    get streamType() {
        return "mp4";
    }

    async isCompatible() {
        return true;
    }

    async getVideoInstance(playerContainer) {
        return new Mp4Video(this.player, playerContainer);
    }
}