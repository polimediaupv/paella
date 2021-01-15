import VideoLayout from '../core/VideoLayout';

export default class SingleVideoLayout extends VideoLayout {
    get identifier() { return "single-video"; }

    async load() {
        console.log("Single video layout loaded");
    }

    canApply(streamData) {
        // TODO: Check if the stream data can be applied to this layout
        // TODO: Check configuration file to get the valid content
        return false;
    }
} 