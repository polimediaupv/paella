import VideoLayout from '../core/VideoLayout';

export default class SingleVideoLayout extends VideoLayout {
    get identifier() { return "single-video"; }

    async load() {
        console.log("Single video layout loaded");
    }

    getValidStreams(streamData) {
        // As this plugin is a single stream, we make sure that the valid streams are simple
        // This prevents a bad configuration of the plugin
        return super.getValidStreams(streamData)
            .filter(stream => stream.length === 1);
    }

} 