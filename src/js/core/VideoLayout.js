
import Plugin, { getPluginsOfType } from "./Plugin";


export function getValidLayouts(player, streamData) {
    // Find the valid layouts that matches the streamData content
    const result = getPluginsOfType(player, "layout")
        .filter(layout => layout.canApply(streamData));
    return result;
}

export default class VideoLayout extends Plugin {
    
    get type() { return "layout"; }

    // Return the layout identifier, for example, presenter-presentation
    get identifier() { return "default"; }

    // Return the array of valid content in the configuration of the plugin
    get validContent() {
        return this.config?.validContent;
    }

    // Get the valid stream data combination, according to the plugin configuration
    // The result of this function must be an array of arrays with all the possible
    // combinations. For example, for a dual stream layout and three elements in
    // streamData that matches the valid content, the resulting valid streams must be:
    // [
    //      [streamA, streamB],
    //      [streamA, streamC],
    //      [streamC, streamB]   
    // ]
    getValidStreams(streamData) {
        const validStreams = [];
        this.validContent.forEach(validContent => {
            let validStreamCombination = [];
            if (validContent.every(c => {
                return streamData.some(sd => {
                    if (c === sd.content) {
                        validStreamCombination.push(sd);
                        return true;
                    }
                })
            })) {
                validStreams.push(validStreamCombination);
            }
        });

        return validStreams;
    }

    canApply(streamData) {
        return this.getValidStreams(streamData).length > 0;
    }

}
