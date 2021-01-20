import VideoLayout from '../core/VideoLayout';

export default class DualVideoLayout extends VideoLayout {
    get identifier() { return "dual-video"; }

    async load() {
        console.log("Dual video layout loaded");
    }

    getValidStreams(streamData) {
        // As this is a dual stream layout plugin, we make sure that the valid streams containis
        // two streams. This prevents a bad configuration of the plugin
        return super.getValidStreams(streamData)
            .filter(stream => stream.length === 2);
    }

    getLayoutStructure(streamData, contentId) {
        return null;
    }
}
